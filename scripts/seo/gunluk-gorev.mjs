// Günlük SEO görev seçici. Codex otomasyonu her sabah önce bunu çalıştırır ve çıktıdaki TEK görevi yapar.
//   node scripts/seo/gunluk-gorev.mjs          denetimleri çalıştırır, görevi seçer -> data/seo/bugun.json
//   node scripts/seo/gunluk-gorev.mjs --kuru   ağ denetimlerini atlar (yalnız seçimi gösterir)
//
// Öncelik sırası:
// Search Console verisi her gün yenilenir (anahtar varsa); URL Denetleme günde 25 adres.
//   1. Canlı sitede kritik teknik sorun      -> teknik-duzeltme
//   2. Kırık kaynak bağlantısı (Pazar)        -> kaynak-onarim
//   3. Haftalık takvim:
//        Pzt      : Search Console düşük CTR (başlık/açıklama), yoksa vuruş mesafesi; veri yoksa yazı genişletme
//        Cum      : Search Console vuruş mesafesi (içerik), yoksa düşük CTR; veri yoksa yazı genişletme
//        Çar      : yazı genişletme (kısa yazı kuyruğu)
//        Sal, Per, Cmt : yeni yazı (data/content-plan.json)
//        Paz      : bakım (kırık kaynak, az kaynaklı yazı); iş yoksa yeni yazı
// Aynı yazıya 30 gün içinde ikinci kez iyileştirme görevi verilmez. Gün içinde tekrar çalışırsa aynı görevi döndürür.
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
  if (weekday === 7 || ageDays('kaynak-durumu.json', 'updatedAt') >= 7) run('kaynak-kontrol.mjs', '--adet', '120');
}

const opp = computeOpportunities();
writeJson(path.join(DATA, 'firsatlar.json'), opp);
const audit = readJson(path.join(DATA, 'canli-denetim.json'), { critical: [] });
const broken = readJson(path.join(DATA, 'kirik-kaynaklar.json'), []);
// Haftalık derin denetimin (Claude) eklediği işler: [{ id, type, slug?, reason, details?, priority: 'yuksek'|'normal', done? }]
const QUEUE_FILE = path.join(DATA, 'kuyruk.json');
const queue = readJson(QUEUE_FILE, []);
const recentlyTouched = new Set(history.filter((h) => h.slug && daysBetween(h.day, today) < 30).map((h) => h.slug));
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

let task;
if (realCritical.length) {
  task = { type: 'teknik-duzeltme', reason: `Canlı denetimde ${realCritical.length} kritik sorun`, details: realCritical.slice(0, 10) };
} else if (queue.some((q) => !q.done && q.priority === 'yuksek' && (!q.slug || fresh(q.slug)))) {
  const q = queue.find((x) => !x.done && x.priority === 'yuksek' && (!x.slug || fresh(x.slug)));
  task = { type: q.type, slug: q.slug, reason: `Haftalık denetim kuyruğu: ${q.reason}`, details: q.details, queueId: q.id };
} else if (weekday === 7 && broken.length) {
  task = { type: 'kaynak-onarim', reason: `${broken.length} kırık kaynak bağlantısı`, details: broken.slice(0, 10) };
} else if ([1, 5].includes(weekday) && (opp.striking.some((s) => fresh(s.slug)) || opp.lowCtr.some((s) => freshCtr(s.slug)))) {
  const low = opp.lowCtr.find((s) => freshCtr(s.slug));
  const strike = opp.striking.find((s) => fresh(s.slug));
  // Pazartesi önce başlık/açıklama (CTR), Cuma önce içerik (sorgu); biri yoksa diğeri.
  task = low && (weekday === 1 || !strike)
    ?{ type: 'ctr-iyilestirme', slug: low.slug, page: low.page, reason: `${low.position}. sırada, ${low.impressions} gösterim, CTR %${(low.ctr * 100).toFixed(1)} (beklenen ~%${(low.expected * 100).toFixed(0)})`, details: low.topQueries }
    : { type: 'sorgu-optimizasyonu', slug: strike.slug, page: strike.page, reason: `4–20. sıradaki sorgular (puan ${strike.score})`, details: strike.queries };
} else if (weekday === 3 && (opp.decay.some((d) => fresh(d.slug)) || opp.droppingKeywords.some((d) => fresh(d.slug)))) {
  // Çarşamba: trafiği düşen sayfa ya da sırası düşen anahtar kelime kısa yazıdan önce gelir.
  const d = opp.decay.find((x) => fresh(x.slug));
  const k = opp.droppingKeywords.find((x) => fresh(x.slug));
  task = d
    ? { type: 'icerik-tazeleme', slug: d.slug, page: d.page, reason: `Gösterim önceki 28 güne göre %${d.change} (${d.prevImpressions} → ${d.impressions})` }
    : { type: 'icerik-tazeleme', slug: k.slug, reason: `"${k.query}" bir haftada ${Math.abs(k.delta)} sıra düştü (şimdi ${k.position7})`, details: [k.query] };
} else if ([1, 3, 5].includes(weekday) || (weekday === 7 && opp.fewSources.some((t) => fresh(t.slug)))) {
  const pick = weekday === 7 ? opp.fewSources.find((t) => fresh(t.slug)) : opp.thin.find((t) => fresh(t.slug));
  task = pick
    ? { type: 'yazi-genisletme', slug: pick.slug, reason: `${pick.words} kelime, ${pick.sources} kaynak${pick.impressions != null ? `, ${pick.impressions} gösterim` : ''}` }
    : { type: 'yeni-yazi', reason: 'Genişletilecek yazı kalmadı' };
} else if (opp.gaps.length) {
  // Yeni yazı günü + Search Console'da karşılığı zayıf sorgu: plan yerine bu sorguyu hedefle (mevcut yazı karşılıyorsa onu geliştir).
  const g = opp.gaps[0];
  const slug = g.page?.startsWith('/blog/') ? g.page.slice(6) : null;
  // Sorguyu zaten bir yazı alıyorsa yeni sayfa açılmaz (yamyamlık); o yazı sorguya göre güçlendirilir.
  task = slug && fresh(slug)
    ? { type: 'sorgu-optimizasyonu', slug, reason: `İçerik boşluğu: "${g.query}" ${g.impressions28} gösterim ama yazı ${g.position28}. sırada`, details: [g] }
    : { type: 'yeni-yazi', reason: `İçerik boşluğu: "${g.query}" ${g.impressions28} gösterim, karşılayan yazı yok (en iyi sayfa ${g.page})`, details: opp.gaps.slice(0, 5) };
} else {
  task = { type: 'yeni-yazi', reason: 'Takvim: yeni içerik günü (data/content-plan.json)' };
}

if (task.slug && !task.page) task.page = `https://www.muhammedikbalbakirci.com/blog/${task.slug}`;
// Fırsat sayfası kısa yazıysa tek paragraf eklemek yetmez: sorguyu yanıtlarken yazıyı da tam genişlet.
const thinPage = ['sorgu-optimizasyonu', 'ctr-iyilestirme'].includes(task.type) && opp.thin.find((t) => t.slug === task.slug);
if (thinPage) {
  task.reason += ` — sayfa kısa (${thinPage.words} kelime, ${thinPage.sources} kaynak)`;
  task.alsoExpand = true;
}
const result = { day: today, weekday, ...task, cannibal: opp.cannibal.slice(0, 3), gsc: opp.gscWindow };
if (!dry) {
  writeJson(TODAY_FILE, result);
  if (task.queueId) {
    const item = queue.find((q) => q.id === task.queueId);
    if (item) { item.done = today; writeJson(QUEUE_FILE, queue); }
  }
  history.push({ day: today, type: task.type, slug: task.slug ?? null });
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
    'yeni-yazi': 'docs/daily-content-workflow.md: plandaki ilk tamamlanmamış aday; kendi kapağı üretilir.',
  };
  console.log(`\n=== BUGÜNÜN SEO GÖREVİ (${t.day})${repeated ? ' — daha önce seçildi' : ''} ===`);
  console.log(`Görev : ${t.type}${t.slug ? `  →  ${t.slug}` : ''}`);
  console.log(`Neden : ${t.reason}`);
  if (t.details?.length) console.log('Ayrıntı:\n' + t.details.map((d) => '  - ' + (typeof d === 'string' ? d : JSON.stringify(d))).join('\n'));
  console.log(`Yapılacak: ${steps[t.type]}`);
  if (t.alsoExpand) console.log(`Ayrıca : Sayfa kısa; ${steps['yazi-genisletme']} Sorgu bu yazının ana konusuysa genişletme sorguya göre kurgulanır.`);
  console.log('Kurallar ve kapılar: docs/seo-otomasyon.md');
}
