// Günlük SEO görev seçici. Her sabah iki görev üretir -> data/seo/bugun.json
//   node scripts/seo/gunluk-gorev.mjs          denetimleri + trend keşfini çalıştırır, görevleri seçer
//   node scripts/seo/gunluk-gorev.mjs --kuru   ağ işlerini atlar (yalnız seçimi gösterir)
//
// 1) Codex (günde 5 çalışma): bugun.json "isler" listesi. Kritik teknik sorun varsa ilk iş teknik-duzeltme;
//    ardından GÜNDE ${DAILY_NEW} YENİ YAZI: haftalık denetim kuyruğundaki yeni-yazi işleri, sonra trend-kesif.mjs'in
//    en yüksek puanlı karşılıksız konuları (her biri farklı tohumdan; atlananların yerine yedek konular).
//    Her çalışma tek iş yapar:  --is-al  (sıradakini verir; yarım kalan varsa onu)  ·  --is-bitti SLUG  ·  --is-atla "neden"
// 2) Claude (19.30, iyilestirme alanı): denetim kuyruğunun yüksek öncelikli işi, yoksa güne göre sırayla
//    düşük CTR, 2–20. sıradaki sorgular (1. sıra hedefi), çürüme/düşen sorgu, içerik boşluğu, kısa yazı;
//    Pazar kırık kaynak ve az kaynaklı yazı. Aynı yazıya 30 gün içinde ikinci iyileştirme verilmez.
// Gün içinde tekrar çalışırsa aynı görevleri döndürür (--yeniden ile yeniden seçer).
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawnSync } from 'node:child_process';
import { DATA, ROOT, readJson, writeJson, trDay, trWeekday, daysBetween } from './ortak.mjs';
import { computeOpportunities } from './firsatlar.mjs';

const today = trDay();
const dry = process.argv.includes('--kuru');
// Test için: SEO_HAFTA_GUNU=3 node scripts/seo/gunluk-gorev.mjs --kuru  (1=Pzt … 7=Paz)
const weekday = Number(process.env.SEO_HAFTA_GUNU) || trWeekday();
const TODAY_FILE = path.join(DATA, 'bugun.json');
const HISTORY_FILE = path.join(DATA, 'gorev-gecmisi.json');
const history = readJson(HISTORY_FILE, []);

const DAILY_NEW = 5;
const claimMode = ['--is-al', '--is-bitti', '--is-atla'].find((f) => process.argv.includes(f));
const existing = readJson(TODAY_FILE);
if (!dry && existing?.day === today && !process.argv.includes('--yeniden')) {
  if (claimMode) claim(existing); else print(existing, true);
  process.exit(0);
}

const run = (script, ...args) => {
  const r = spawnSync(process.execPath, [path.join(ROOT, 'scripts/seo', script), ...args], { cwd: ROOT, encoding: 'utf8' });
  const text = (r.stdout + r.stderr).trim();
  if (text) console.log(text);
  return r.status === 0;
};
const ageDays = (file, key) => {
  const v = readJson(path.join(DATA, file))?.[key];
  return v ? daysBetween(v.slice(0, 10), today) : Infinity;
};

if (!dry) {
  run('canli-denetim.mjs');
  const gscKey = process.env.GSC_KEY_FILE || path.join(os.homedir(), '.secrets', 'gsc-muhammedikbalbakirci.json');
  if (fs.existsSync(gscKey) && ageDays('gsc-son.json', 'fetchedAt') >= 1) run('gsc.mjs', '--denetle', '25');
  run('anahtar-kelime.mjs');
  if (ageDays('trend-adaylari.json', 'day') >= 1) run('trend-kesif.mjs');
  if (weekday === 7 || ageDays('kaynak-durumu.json', 'updatedAt') >= 7) run('kaynak-kontrol.mjs', '--adet', '120');
}

const opp = computeOpportunities();
writeJson(path.join(DATA, 'firsatlar.json'), opp);
const audit = readJson(path.join(DATA, 'canli-denetim.json'), { critical: [] });
const broken = readJson(path.join(DATA, 'kirik-kaynaklar.json'), []);
// Haftalık derin denetimin (Claude) eklediği işler: [{ id, type, slug?, reason, details?, priority: 'yuksek'|'normal', done? }]
const QUEUE_FILE = path.join(DATA, 'kuyruk.json');
const queue = readJson(QUEUE_FILE, []);
// İçerik görevlerinde bekleme, yalnız başlık değiştiren CTR görevini saymaz.
const recentlyTouched = new Set(history.filter((h) => h.slug && h.type !== 'ctr-iyilestirme' && daysBetween(h.day, today) < 30).map((h) => h.slug));
const fresh = (slug) => slug && !recentlyTouched.has(slug);
// Başlık/açıklama değişikliği içeriğe dokunmaz: CTR görevinde bekleme yalnız önceki CTR görevine bakar
// (ör. yeni genişletilmiş yazı ilk 10'da ama tıklanmıyorsa başlığı hemen düzeltilebilir).
const recentCtr = new Set(history.filter((h) => h.slug && h.type === 'ctr-iyilestirme' && daysBetween(h.day, today) < 30).map((h) => h.slug));
const freshCtr = (slug) => slug && !recentCtr.has(slug);

// Sunucunun yayını çekmesi beklenirken (en geç 15 dk) canlı/yerel fark doğal olabilir; yalnız yerelde de var olan sorun kritik görevdir.
const realCritical = audit.critical.filter((c) => {
  const m = c.match(/^https:\/\/www\.muhammedikbalbakirci\.com(\/[^:\s]*)/);
  if (!m) return true;
  const rel = m[1].replace(/^\//, '') || 'index';
  return !fs.existsSync(path.join(ROOT, 'dist', rel)) && !fs.existsSync(path.join(ROOT, 'dist', `${rel}.html`));
});

// ---- İyileştirme görevi (Claude, her gün 19.30) ----
// Hedef 1. sıra: önce tıklanmayan ilk-10 sayfası ve 2–20. sıradaki sorgular; gün, hangisinin önce deneneceğini belirler.
const pickers = {
  ctr: () => { const low = opp.lowCtr.find((s) => freshCtr(s.slug)); return low && { type: 'ctr-iyilestirme', slug: low.slug, page: low.page, reason: `${low.position}. sırada, ${low.impressions} gösterim, CTR %${(low.ctr * 100).toFixed(1)} (beklenen ~%${(low.expected * 100).toFixed(0)})`, details: low.topQueries }; },
  strike: () => { const st = opp.striking.find((s) => fresh(s.slug)); return st && { type: 'sorgu-optimizasyonu', slug: st.slug, page: st.page, reason: `1. sıra hedefi: 2–20. sıradaki sorgular (puan ${st.score})`, details: st.queries }; },
  decay: () => {
    const d = opp.decay.find((x) => fresh(x.slug));
    if (d) return { type: 'icerik-tazeleme', slug: d.slug, page: d.page, reason: `Gösterim önceki 28 güne göre %${d.change} (${d.prevImpressions} → ${d.impressions})` };
    const k = opp.droppingKeywords.find((x) => fresh(x.slug));
    return k && { type: 'icerik-tazeleme', slug: k.slug, reason: `"${k.query}" bir haftada ${Math.abs(k.delta)} sıra düştü (şimdi ${k.position7})`, details: [k.query] };
  },
  gap: () => {
    const g = opp.gaps.find((x) => x.page?.startsWith('/blog/') && fresh(x.page.slice(6)));
    return g && { type: 'sorgu-optimizasyonu', slug: g.page.slice(6), reason: `İçerik boşluğu: "${g.query}" ${g.impressions28} gösterim ama yazı ${g.position28}. sırada`, details: [g] };
  },
  thin: () => { const t = opp.thin.find((x) => fresh(x.slug)); return t && { type: 'yazi-genisletme', slug: t.slug, reason: `${t.words} kelime, ${t.sources} kaynak${t.impressions != null ? `, ${t.impressions} gösterim` : ''}` }; },
  sources: () => { const t = opp.fewSources.find((x) => fresh(x.slug)); return t && { type: 'yazi-genisletme', slug: t.slug, reason: `Az kaynak: ${t.sources} kaynak, ${t.words} kelime` }; },
  broken: () => broken.length && { type: 'kaynak-onarim', reason: `${broken.length} kırık kaynak bağlantısı`, details: broken.slice(0, 10) },
};
// Günün sırası (1=Pzt … 7=Paz); ilk bulunan uygulanır.
const ORDER = {
  1: ['ctr', 'strike', 'decay', 'gap', 'thin'], 2: ['strike', 'ctr', 'gap', 'decay', 'thin'], 3: ['decay', 'strike', 'ctr', 'gap', 'thin'],
  4: ['ctr', 'strike', 'gap', 'decay', 'thin'], 5: ['strike', 'ctr', 'decay', 'gap', 'thin'], 6: ['gap', 'strike', 'ctr', 'decay', 'thin'],
  7: ['broken', 'sources', 'strike', 'ctr', 'thin'],
};
let improve = null;
const qItem = queue.find((x) => !x.done && x.priority === 'yuksek' && x.type !== 'yeni-yazi' && (!x.slug || fresh(x.slug)));
if (qItem) improve = { type: qItem.type, slug: qItem.slug, reason: `Haftalık denetim kuyruğu: ${qItem.reason}`, details: qItem.details, queueId: qItem.id };
// Günün ilk fırsatı denendikten sonra denetim kuyruğunun normal öncelikli işleri gelir; böylece kuyruk da erir.
const qNormal = () => {
  const x = queue.find((q) => !q.done && q.type !== 'yeni-yazi' && (!q.slug || fresh(q.slug)));
  return x && { type: x.type, slug: x.slug, reason: `Haftalık denetim kuyruğu: ${x.reason}`, details: x.details, queueId: x.id };
};
// Trend keşfinde, konusu zaten yazılmış yükselen aramalar: yeni sayfa yerine o yazı bu sorgularla güçlendirilir.
const trendStrengthen = () => {
  const t = (readJson(path.join(DATA, 'trend-adaylari.json'))?.guclendir ?? []).find((x) => fresh(x.owner));
  return t && { type: 'sorgu-optimizasyonu', slug: t.owner, reason: `Yükselen aramalar bu yazının konusunda: "${t.topic}" (puan ${t.score}; ${t.queries.length} sorgu). Sayfa bunları yanıtlamıyor.`, details: t.queries.slice(0, 12) };
};
const [firstKey, ...restKeys] = ORDER[weekday];
for (const pick of [pickers[firstKey], qNormal, trendStrengthen, ...restKeys.map((k) => pickers[k])]) { if (improve) break; improve = pick() || null; }
if (improve?.slug && !improve.page) improve.page = `https://www.muhammedikbalbakirci.com/blog/${improve.slug}`;
// Fırsat sayfası kısa yazıysa tek paragraf eklemek yetmez: sorguyu yanıtlarken yazıyı da tam genişlet.
const thinPage = improve && ['sorgu-optimizasyonu', 'ctr-iyilestirme'].includes(improve.type) && opp.thin.find((t) => t.slug === improve.slug);
if (thinPage) { improve.reason += ` — sayfa kısa (${thinPage.words} kelime, ${thinPage.sources} kaynak)`; improve.alsoExpand = true; }

// ---- Codex işleri: kritik teknik sorun önce, sonra günde DAILY_NEW yeni yazı (+3 yedek konu) ----
const isler = [];
if (realCritical.length) isler.push({ type: 'teknik-duzeltme', reason: `Canlı denetimde ${realCritical.length} kritik sorun`, details: realCritical.slice(0, 10) });
for (const q of queue.filter((x) => !x.done && x.type === 'yeni-yazi')) isler.push({ type: 'yeni-yazi', reason: `Haftalık denetim kuyruğu: ${q.reason}`, details: q.details, queueId: q.id });
const trends = readJson(path.join(DATA, 'trend-adaylari.json'));
const usedTopics = new Set(history.filter((h) => h.topic).map((h) => h.topic.toLocaleLowerCase('tr')));
const usedSeeds = new Set();
for (const t of trends?.topics ?? []) {
  if (isler.filter((x) => x.type === 'yeni-yazi').length >= DAILY_NEW + 3) break;
  // Aynı gün aynı tohumdan iki yazı birbirini yer (yamyamlık); her konu ayrı tohumdan.
  if (usedTopics.has(t.topic.toLocaleLowerCase('tr')) || (t.closest?.coverage ?? 0) >= 0.6 || usedSeeds.has(t.seed)) continue;
  usedSeeds.add(t.seed);
  isler.push({ type: 'yeni-yazi', topic: t.topic, reason: `Yükselen arama konusu: "${t.topic}" (puan ${t.score}${t.rising ? ', yükseliyor' : ''}; ${t.queries.length} ilişkili sorgu)`, details: t.queries.slice(0, 12), closest: t.closest });
}
if (!isler.some((x) => x.type === 'yeni-yazi')) isler.push({ type: 'yeni-yazi', reason: 'Trend adayı yok: data/content-plan.json sıradaki aday' });
isler.forEach((x, i) => { x.no = i + 1; });

const result = { day: today, weekday, ...isler[0], isler, iyilestirme: improve, cannibal: opp.cannibal.slice(0, 3), gsc: opp.gscWindow };
if (!dry) {
  writeJson(TODAY_FILE, result);
  if (improve?.queueId) {
    const item = queue.find((q) => q.id === improve.queueId);
    if (item) { item.done = today; writeJson(QUEUE_FILE, queue); }
  }
  if (improve) history.push({ day: today, type: improve.type, slug: improve.slug ?? null, by: 'claude' });
  writeJson(HISTORY_FILE, history.slice(-400));
}
if (claimMode && !dry) claim(result);
else print(result, false);

// Codex çalışmasının işi: sıradaki işi "yaziliyor" yapar; bitince tamam/atlandı olarak kapatır ve geçmişe yazar.
function claim(t) {
  const list = t.isler ?? [];
  const active = list.find((x) => x.durum === 'yaziliyor');
  const doneNew = list.filter((x) => x.type === 'yeni-yazi' && x.durum === 'tamam').length;
  if (claimMode === '--is-al') {
    const next = active ?? (doneNew < DAILY_NEW ? list.find((x) => !x.durum) : null);
    if (!next) { console.log(`Bugünün işleri bitti (${doneNew}/${DAILY_NEW} yeni yazı). Bu çalışmada yeni içerik yok.`); return; }
    if (!active) { next.durum = 'yaziliyor'; next.basladi = new Date().toISOString(); writeJson(TODAY_FILE, t); }
    console.log(`\n=== İŞ ${next.no} (${t.day}; yeni yazı ${doneNew}/${DAILY_NEW})${active ? ' — yarım kalan iş, devam et' : ''} ===`);
    print({ ...next, day: t.day }, false, true);
    console.log(`Bitince: node scripts/seo/gunluk-gorev.mjs --is-bitti SLUG   ·   Konu uygun değilse: --is-atla "neden" ve --is-al ile sıradakine geç`);
    return;
  }
  if (!active) throw new Error('"yaziliyor" durumunda iş yok; önce --is-al');
  const arg = process.argv[process.argv.indexOf(claimMode) + 1];
  active.durum = claimMode === '--is-bitti' ? 'tamam' : 'atlandi';
  if (claimMode === '--is-bitti') active.slug = arg ?? null; else active.neden = arg ?? '';
  active.bitti = new Date().toISOString();
  writeJson(TODAY_FILE, t);
  history.push({ day: t.day, type: active.type, slug: active.slug ?? null, topic: active.topic ?? null, by: 'codex', durum: active.durum });
  writeJson(HISTORY_FILE, history.slice(-400));
  console.log(`İş ${active.no} ${active.durum}${active.slug ? `: ${active.slug}` : ''}.`);
}

function print(t, repeated, single = false) {
  const steps = {
    'teknik-duzeltme': 'Kritik teknik sorunu kaynakta düzelt; npm run verify geçsin; yayın betiğiyle gönder.',
    'kaynak-onarim': 'Kırık kaynakları aynı kurumun güncel sayfasıyla ya da eşdeğer güvenilir kaynakla değiştir; bulunamazsa ilgili cümleyi kaynaklı biçimde yeniden yaz.',
    'ctr-iyilestirme': 'Yalnız title/seoTitle ve description: üst sorguların niyetini ilk 50 karakterde karşıla, sayfanın gerçekten verdiği yanıtı söyle; tıklama tuzağı ve vaat yok. İçeriği değiştirme, updated ilerletme.',
    'sorgu-optimizasyonu': 'Listelenen sorguların her birini sayfada doğrudan yanıtla: eksik alt başlık/paragraf ekle, ilk paragrafta soruya net cevap, ilgili yazılara bağlantı. Esaslı değişiklikse updated bugünün tarihi.',
    'icerik-tazeleme': 'Düşüşün nedenini bul: Google sonuç sayfasında rakipler neyi daha iyi veriyor, sorgu niyeti değişti mi, bilgi eskidi mi? İlk paragraf, başlık, alt başlıklar ve kaynaklar güncellenir; eskiyen bilgi düzeltilir; updated bugün.',
    'yazi-genisletme': 'Yazıyı 900–1.400 kelimeye kadar GERÇEK bilgiyle genişlet: arama niyeti analizi, okunmuş en az 3 güncel kurum/kılavuz/araştırma kaynağı, SSS, kontrol listesi. Tarih korunur, updated bugün.',
    'yeni-yazi': 'Konu yukarıda (yükselen arama). Google\'da bu sorguların ilk sayfasını incele, arama niyetini karşılayan özgün ve kaynaklı yazıyı docs/daily-content-workflow.md adımlarıyla yaz; ilişkili sorguları alt başlık/SSS olarak yanıtla; mevcut yazıyla çakışıyorsa yeni sayfa açma, o yazıyı güçlendir. Kendi kapağı üretilir.',
  };
  if (!single) console.log(`\n=== BUGÜNÜN SEO GÖREVİ (${t.day})${repeated ? ' — daha önce seçildi' : ''} ===`);
  if (!single && t.isler?.length) {
    console.log(`Codex işleri (${t.isler.length}; günde ${DAILY_NEW} yeni yazı; her çalışmada --is-al ile biri alınır):`);
    for (const x of t.isler) console.log(`  ${x.no}. [${x.durum ?? 'bekliyor'}] ${x.type}${x.topic ? `: ${x.topic}` : ''}${x.slug ? ` → ${x.slug}` : ''}`);
    console.log('İlk iş:');
  }
  console.log(`Görev : ${t.type}${t.slug ? `  →  ${t.slug}` : ''}`);
  console.log(`Neden : ${t.reason}`);
  if (t.details?.length) console.log('Ayrıntı:\n' + t.details.map((d) => '  - ' + (typeof d === 'string' ? d : JSON.stringify(d))).join('\n'));
  console.log(`Yapılacak: ${steps[t.type]}`);
  if (t.type === 'yeni-yazi' && t.details?.length) console.log('İlişkili sorgular (yazı bunları yanıtlamalı): ' + t.details.join(' | '));
  if (!single && t.iyilestirme) {
    const i = t.iyilestirme;
    console.log(`\n--- İYİLEŞTİRME (Claude, 19.30) ---\nGörev : ${i.type}${i.slug ? `  →  ${i.slug}` : ''}\nNeden : ${i.reason}`);
    if (i.details?.length) console.log('Ayrıntı: ' + i.details.map((d) => (typeof d === 'string' ? d : JSON.stringify(d))).join(' | '));
  }
  if (t.alsoExpand) console.log(`Ayrıca : Sayfa kısa; ${steps['yazi-genisletme']} Sorgu bu yazının ana konusuysa genişletme sorguya göre kurgulanır.`);
  console.log('Kurallar ve kapılar: docs/seo-otomasyon.md');
}
