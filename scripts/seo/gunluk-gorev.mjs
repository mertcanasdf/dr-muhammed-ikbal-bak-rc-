// Günlük SEO görev seçici. Her sabah iki görev üretir -> data/seo/bugun.json
//   node scripts/seo/gunluk-gorev.mjs          denetimleri + trend keşfini çalıştırır, görevleri seçer
//   node scripts/seo/gunluk-gorev.mjs --kuru   ağ işlerini atlar (yalnız seçimi gösterir)
//
// 1) Codex (10.00): canlı sitede kritik teknik sorun varsa teknik-duzeltme; yoksa HER GÜN yeni yazı:
//    haftalık denetim kuyruğundaki yeni-yazi, yoksa trend-kesif.mjs'in en yüksek puanlı karşılıksız konusu.
// 2) Claude (11.30, iyilestirme alanı): denetim kuyruğunun yüksek öncelikli işi, yoksa güne göre sırayla
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

const existing = readJson(TODAY_FILE);
if (!dry && existing?.day === today && !process.argv.includes('--yeniden')) {
  print(existing, true);
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

// ---- İyileştirme görevi (Claude, her gün 11.30) ----
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
const [firstKey, ...restKeys] = ORDER[weekday];
for (const pick of [pickers[firstKey], qNormal, ...restKeys.map((k) => pickers[k])]) { if (improve) break; improve = pick() || null; }
if (improve?.slug && !improve.page) improve.page = `https://www.muhammedikbalbakirci.com/blog/${improve.slug}`;
// Fırsat sayfası kısa yazıysa tek paragraf eklemek yetmez: sorguyu yanıtlarken yazıyı da tam genişlet.
const thinPage = improve && ['sorgu-optimizasyonu', 'ctr-iyilestirme'].includes(improve.type) && opp.thin.find((t) => t.slug === improve.slug);
if (thinPage) { improve.reason += ` — sayfa kısa (${thinPage.words} kelime, ${thinPage.sources} kaynak)`; improve.alsoExpand = true; }

// ---- Codex görevi (her gün 10.00): kritik teknik sorun yoksa yükselen aramalardan yeni yazı ----
let task;
if (realCritical.length) {
  task = { type: 'teknik-duzeltme', reason: `Canlı denetimde ${realCritical.length} kritik sorun`, details: realCritical.slice(0, 10) };
} else {
  const trends = readJson(path.join(DATA, 'trend-adaylari.json'));
  const usedTopics = new Set(history.filter((h) => h.topic).map((h) => h.topic.toLocaleLowerCase('tr')));
  const qNew = queue.find((x) => !x.done && x.type === 'yeni-yazi');
  const topic = trends?.topics?.find((t) => !usedTopics.has(t.topic.toLocaleLowerCase('tr')) && (t.closest?.coverage ?? 0) < 0.6);
  task = qNew
    ? { type: 'yeni-yazi', reason: `Haftalık denetim kuyruğu: ${qNew.reason}`, details: qNew.details, queueId: qNew.id }
    : topic
      ? { type: 'yeni-yazi', topic: topic.topic, reason: `Yükselen arama konusu: "${topic.topic}" (puan ${topic.score}${topic.rising ? ', yükseliyor' : ''}; ${topic.queries.length} ilişkili sorgu)`, details: topic.queries.slice(0, 12), closest: topic.closest }
      : { type: 'yeni-yazi', reason: 'Trend adayı yok: data/content-plan.json sıradaki aday' };
}

const result = { day: today, weekday, ...task, iyilestirme: improve, cannibal: opp.cannibal.slice(0, 3), gsc: opp.gscWindow };
if (!dry) {
  writeJson(TODAY_FILE, result);
  for (const id of [task.queueId, improve?.queueId].filter(Boolean)) {
    const item = queue.find((q) => q.id === id);
    if (item) item.done = today;
  }
  if (task.queueId || improve?.queueId) writeJson(QUEUE_FILE, queue);
  history.push({ day: today, type: task.type, slug: task.slug ?? null, topic: task.topic ?? null, by: 'codex' });
  if (improve) history.push({ day: today, type: improve.type, slug: improve.slug ?? null, by: 'claude' });
  writeJson(HISTORY_FILE, history.slice(-400));
}
print(result, false);

function print(t, repeated) {
  const steps = {
    'teknik-duzeltme': 'Kritik teknik sorunu kaynakta düzelt; npm run verify geçsin; yayın betiğiyle gönder.',
    'kaynak-onarim': 'Kırık kaynakları aynı kurumun güncel sayfasıyla ya da eşdeğer güvenilir kaynakla değiştir; bulunamazsa ilgili cümleyi kaynaklı biçimde yeniden yaz.',
    'ctr-iyilestirme': 'Yalnız title/seoTitle ve description: üst sorguların niyetini ilk 50 karakterde karşıla, sayfanın gerçekten verdiği yanıtı söyle; tıklama tuzağı ve vaat yok. İçeriği değiştirme, updated ilerletme.',
    'sorgu-optimizasyonu': 'Listelenen sorguların her birini sayfada doğrudan yanıtla: eksik alt başlık/paragraf ekle, ilk paragrafta soruya net cevap, ilgili yazılara bağlantı. Esaslı değişiklikse updated bugünün tarihi.',
    'icerik-tazeleme': 'Düşüşün nedenini bul: Google sonuç sayfasında rakipler neyi daha iyi veriyor, sorgu niyeti değişti mi, bilgi eskidi mi? İlk paragraf, başlık, alt başlıklar ve kaynaklar güncellenir; eskiyen bilgi düzeltilir; updated bugün.',
    'yazi-genisletme': 'Yazıyı 900–1.400 kelimeye kadar GERÇEK bilgiyle genişlet: arama niyeti analizi, okunmuş en az 3 güncel kurum/kılavuz/araştırma kaynağı, SSS, kontrol listesi. Tarih korunur, updated bugün.',
    'yeni-yazi': 'Konu yukarıda (yükselen arama). Google\'da bu sorguların ilk sayfasını incele, arama niyetini karşılayan özgün ve kaynaklı yazıyı docs/daily-content-workflow.md adımlarıyla yaz; ilişkili sorguları alt başlık/SSS olarak yanıtla; mevcut yazıyla çakışıyorsa yeni sayfa açma, o yazıyı güçlendir. Kendi kapağı üretilir.',
  };
  console.log(`\n=== BUGÜNÜN SEO GÖREVİ (${t.day})${repeated ? ' — daha önce seçildi' : ''} ===`);
  console.log(`Görev : ${t.type}${t.slug ? `  →  ${t.slug}` : ''}`);
  console.log(`Neden : ${t.reason}`);
  if (t.details?.length) console.log('Ayrıntı:\n' + t.details.map((d) => '  - ' + (typeof d === 'string' ? d : JSON.stringify(d))).join('\n'));
  console.log(`Yapılacak: ${steps[t.type]}`);
  if (t.type === 'yeni-yazi' && t.details?.length) console.log('İlişkili sorgular (yazı bunları yanıtlamalı): ' + t.details.join(' | '));
  if (t.iyilestirme) {
    const i = t.iyilestirme;
    console.log(`\n--- İYİLEŞTİRME (Claude, 11.30) ---\nGörev : ${i.type}${i.slug ? `  →  ${i.slug}` : ''}\nNeden : ${i.reason}`);
    if (i.details?.length) console.log('Ayrıntı: ' + i.details.map((d) => (typeof d === 'string' ? d : JSON.stringify(d))).join(' | '));
  }
  if (t.alsoExpand) console.log(`Ayrıca : Sayfa kısa; ${steps['yazi-genisletme']} Sorgu bu yazının ana konusuysa genişletme sorguya göre kurgulanır.`);
  console.log('Kurallar ve kapılar: docs/seo-otomasyon.md');
}
