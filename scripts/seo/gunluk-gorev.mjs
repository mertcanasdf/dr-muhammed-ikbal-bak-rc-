// Günlük SEO görev seçici. Codex otomasyonu her sabah önce bunu çalıştırır ve çıktıdaki TEK görevi yapar.
//   node scripts/seo/gunluk-gorev.mjs          denetimleri çalıştırır, görevi seçer -> data/seo/bugun.json
//   node scripts/seo/gunluk-gorev.mjs --kuru   ağ denetimlerini atlar (yalnız seçimi gösterir)
//
// Öncelik sırası:
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
  if (fs.existsSync(gscKey) && (ageDays('gsc-son.json', 'fetchedAt') >= 6 || weekday === 1)) run('gsc.mjs', '--denetle', '25');
  if (weekday === 7 || ageDays('kaynak-durumu.json', 'updatedAt') >= 7) run('kaynak-kontrol.mjs', '--adet', '120');
}

const opp = computeOpportunities();
writeJson(path.join(DATA, 'firsatlar.json'), opp);
const audit = readJson(path.join(DATA, 'canli-denetim.json'), { critical: [] });
const broken = readJson(path.join(DATA, 'kirik-kaynaklar.json'), []);
const recentlyTouched = new Set(history.filter((h) => h.slug && daysBetween(h.day, today) < 30).map((h) => h.slug));
const fresh = (slug) => slug && !recentlyTouched.has(slug);

// Plesk çekmesi beklenirken canlı/yerel fark doğal olabilir; yalnız yerelde de var olan sorun kritik görevdir.
const realCritical = audit.critical.filter((c) => {
  const m = c.match(/^https:\/\/www\.muhammedikbalbakirci\.com(\/[^:\s]*)/);
  if (!m) return true;
  const rel = m[1].replace(/^\//, '') || 'index';
  return !fs.existsSync(path.join(ROOT, 'dist', rel)) && !fs.existsSync(path.join(ROOT, 'dist', `${rel}.html`));
});

let task;
if (realCritical.length) {
  task = { type: 'teknik-duzeltme', reason: `Canlı denetimde ${realCritical.length} kritik sorun`, details: realCritical.slice(0, 10) };
} else if (weekday === 7 && broken.length) {
  task = { type: 'kaynak-onarim', reason: `${broken.length} kırık kaynak bağlantısı`, details: broken.slice(0, 10) };
} else if ([1, 5].includes(weekday) && (opp.striking.some((s) => fresh(s.slug)) || opp.lowCtr.some((s) => fresh(s.slug)))) {
  const low = opp.lowCtr.find((s) => fresh(s.slug));
  const strike = opp.striking.find((s) => fresh(s.slug));
  // Pazartesi önce başlık/açıklama (CTR), Cuma önce içerik (sorgu); biri yoksa diğeri.
  task = low && (weekday === 1 || !strike)
    ?{ type: 'ctr-iyilestirme', slug: low.slug, page: low.page, reason: `${low.position}. sırada, ${low.impressions} gösterim, CTR %${(low.ctr * 100).toFixed(1)} (beklenen ~%${(low.expected * 100).toFixed(0)})`, details: low.topQueries }
    : { type: 'sorgu-optimizasyonu', slug: strike.slug, page: strike.page, reason: `4–20. sıradaki sorgular (puan ${strike.score})`, details: strike.queries };
} else if ([1, 3, 5].includes(weekday) || (weekday === 7 && opp.fewSources.some((t) => fresh(t.slug)))) {
  const pick = weekday === 7 ? opp.fewSources.find((t) => fresh(t.slug)) : opp.thin.find((t) => fresh(t.slug));
  task = pick
    ? { type: 'yazi-genisletme', slug: pick.slug, reason: `${pick.words} kelime, ${pick.sources} kaynak${pick.impressions != null ? `, ${pick.impressions} gösterim` : ''}` }
    : { type: 'yeni-yazi', reason: 'Genişletilecek yazı kalmadı' };
} else {
  task = { type: 'yeni-yazi', reason: 'Takvim: yeni içerik günü (data/content-plan.json)' };
}

if (task.slug && !task.page) task.page = `https://www.muhammedikbalbakirci.com/blog/${task.slug}`;
const result = { day: today, weekday, ...task, cannibal: opp.cannibal.slice(0, 3), gsc: opp.gscWindow };
if (!dry) {
  writeJson(TODAY_FILE, result);
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
    'yazi-genisletme': 'Yazıyı 900–1.400 kelimeye kadar GERÇEK bilgiyle genişlet: arama niyeti analizi, okunmuş en az 3 güncel kurum/kılavuz/araştırma kaynağı, SSS, kontrol listesi. Tarih korunur, updated bugün.',
    'yeni-yazi': 'docs/daily-content-workflow.md: plandaki ilk tamamlanmamış aday; kendi kapağı üretilir.',
  };
  console.log(`\n=== BUGÜNÜN SEO GÖREVİ (${t.day})${repeated ? ' — daha önce seçildi' : ''} ===`);
  console.log(`Görev : ${t.type}${t.slug ? `  →  ${t.slug}` : ''}`);
  console.log(`Neden : ${t.reason}`);
  if (t.details?.length) console.log('Ayrıntı:\n' + t.details.map((d) => '  - ' + (typeof d === 'string' ? d : JSON.stringify(d))).join('\n'));
  console.log(`Yapılacak: ${steps[t.type]}`);
  console.log('Kurallar ve kapılar: docs/seo-otomasyon.md');
}
