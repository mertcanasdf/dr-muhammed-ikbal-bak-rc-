// Search Console verisini çeker (son 28 gün, sorgu+sayfa) ve isteğe bağlı URL Denetleme yapar.
//   node scripts/seo/gsc.mjs                 performans verisi -> data/seo/gsc-son.json (+ günlük özet)
//   node scripts/seo/gsc.mjs --denetle 20    ayrıca en eski denetlenen 20 adresi URL Denetleme API ile kontrol eder
//
// Kimlik: Google Cloud hizmet hesabı JSON anahtarı. Anahtar REPOYA KONMAZ. Yol sırası:
//   GSC_KEY_FILE ortam değişkeni, yoksa %USERPROFILE%\.secrets\gsc-muhammedikbalbakirci.json
// Hizmet hesabının e-postası Search Console > Ayarlar > Kullanıcılar ve izinler'e "Tam" izinle eklenmelidir.
// Anahtar yoksa betik hata vermeden "atlandı" der (otomasyon diğer işlere devam eder).
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { DATA, GSC_PROPERTY, SITE, readJson, writeJson, trDay } from './ortak.mjs';

const keyFile = process.env.GSC_KEY_FILE || path.join(os.homedir(), '.secrets', 'gsc-muhammedikbalbakirci.json');
const OUT = path.join(DATA, 'gsc-son.json');
const INSPECT = path.join(DATA, 'gsc-denetim.json');

async function gscToken() {
  if (!fs.existsSync(keyFile)) return null;
  const key = JSON.parse(fs.readFileSync(keyFile, 'utf8'));
  const now = Math.floor(Date.now() / 1000);
  const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
  const unsigned = `${b64({ alg: 'RS256', typ: 'JWT' })}.${b64({
    iss: key.client_email,
    scope: 'https://www.googleapis.com/auth/webmasters',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  })}`;
  const sig = crypto.createSign('RSA-SHA256').update(unsigned).sign(key.private_key).toString('base64url');
  const res = await fetchRetry('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${unsigned}.${sig}` }),
  });
  const json = await res.json();
  if (!json.access_token) throw new Error(`Search Console yetkilendirmesi başarısız: ${JSON.stringify(json).slice(0, 200)}`);
  return json.access_token;
}

// Geçici ağ hatası ya da 429/5xx yanıtında 3 kez, artan beklemeyle yeniden dener.
async function fetchRetry(url, init) {
  for (let attempt = 1; ; attempt++) {
    try {
      const res = await fetch(url, { ...init, signal: AbortSignal.timeout(60000) });
      if ((res.status === 429 || res.status >= 500) && attempt < 3) throw new Error(`HTTP ${res.status}`);
      return res;
    } catch (e) {
      if (attempt >= 3) throw e;
      await new Promise((r) => setTimeout(r, attempt * 5000));
    }
  }
}

const api = async (token, url, body) => {
  const res = await fetchRetry(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`Search Console API ${res.status}: ${JSON.stringify(json.error ?? json).slice(0, 300)}`);
  return json;
};

// Üç pencere: son 28 gün (fırsatlar), son 7 gün (güncel sıra takibi), önceki 28 gün (içerik çürümesi).
// GSC verisi ~2-3 gün gecikmelidir; son 3 günü dışarıda bırak.
async function performance(token) {
  const day = (n) => new Date(Date.now() - n * 86400000).toISOString().slice(0, 10);
  const end = day(3), start = day(30), start7 = day(9), prevEnd = day(31), prevStart = day(58);
  const url = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(GSC_PROPERTY)}/searchAnalytics/query`;
  const q = (dimensions, s = start, e = end) => api(token, url, { startDate: s, endDate: e, dimensions, rowLimit: 5000, dataState: 'all' });
  const [byQueryPage, byPage, qp7, prevPages, prevQueryPage] = await Promise.all([
    q(['query', 'page']), q(['page']), q(['query', 'page'], start7, end), q(['page'], prevStart, prevEnd), q(['query', 'page'], prevStart, prevEnd),
  ]);
  const row = (r, keys) => ({ ...Object.fromEntries(keys.map((k, i) => [k, r.keys[i]])), clicks: r.clicks, impressions: r.impressions, ctr: +r.ctr.toFixed(4), position: +r.position.toFixed(1) });
  return {
    fetchedAt: new Date().toISOString(), start, end, start7, prevStart, prevEnd,
    queryPage: (byQueryPage.rows ?? []).map((r) => row(r, ['query', 'page'])),
    pages: (byPage.rows ?? []).map((r) => row(r, ['page'])),
    queryPage7: (qp7.rows ?? []).map((r) => row(r, ['query', 'page'])),
    prevPages: (prevPages.rows ?? []).map((r) => row(r, ['page'])),
    prevQueryPage: (prevQueryPage.rows ?? []).map((r) => row(r, ['query', 'page'])),
  };
}

async function inspect(token, count) {
  const prev = readJson(INSPECT, { results: {} });
  const urls = [...fs.readFileSync('dist/sitemap.xml', 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]).filter((u) => u.startsWith(SITE));
  // En uzun süredir denetlenmeyen adresler önce (API kotası: günde 2.000 / dakikada 600).
  urls.sort((a, b) => (prev.results[a]?.checkedAt ?? '').localeCompare(prev.results[b]?.checkedAt ?? ''));
  for (const u of urls.slice(0, count)) {
    const r = await api(token, 'https://searchconsole.googleapis.com/v1/urlInspection/index:inspect', { inspectionUrl: u, siteUrl: GSC_PROPERTY, languageCode: 'tr' });
    const s = r.inspectionResult?.indexStatusResult ?? {};
    prev.results[u] = { checkedAt: new Date().toISOString(), verdict: s.verdict, coverage: s.coverageState, lastCrawl: s.lastCrawlTime, googleCanonical: s.googleCanonical };
  }
  writeJson(INSPECT, prev);
  return prev;
}

{
  const token = await gscToken();
  if (!token) {
    console.log(`Search Console: atlandı — anahtar yok (${keyFile}). Kurulum: docs/seo-otomasyon.md`);
    process.exit(0);
  }
  // --sitemap: yeni yazı yayınlandıktan sonra sitemap'i Search Console'a yeniden gönderir (Google'ın taramasını hızlandırır).
  if (process.argv.includes('--sitemap')) {
    const feed = 'https://www.muhammedikbalbakirci.com/sitemap.xml';
    const r = await fetchRetry(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(GSC_PROPERTY)}/sitemaps/${encodeURIComponent(feed)}`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` } });
    console.log(`Sitemap Search Console'a gönderildi: HTTP ${r.status}`);
    process.exit(r.ok ? 0 : 1);
  }
  // --gunluk: son 14 günün gün gün tık/gösterimi ve son 3 günde tık alan sayfa/sorgular (kesinleşmemiş veri dahil, arayüzle aynı).
  if (process.argv.includes('--gunluk')) {
    const day = (n) => new Date(Date.now() - n * 86400000).toISOString().slice(0, 10);
    const url = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(GSC_PROPERTY)}/searchAnalytics/query`;
    const q = (dimensions, s, e = day(0)) => api(token, url, { startDate: s, endDate: e, dimensions, rowLimit: 1000, dataState: 'all' });
    const [byDate, recent, recentPages] = await Promise.all([q(['date'], day(14)), q(['query', 'page'], day(3)), q(['page'], day(3))]);
    for (const r of byDate.rows ?? []) console.log(`${r.keys[0]}  ${String(r.clicks).padStart(3)} tık  ${String(r.impressions).padStart(4)} gösterim`);
    // Google küçük sorguları gizler; sayfa toplamı tüm tıkları gösterir.
    console.log('Son 3 günde tık alan sayfalar:');
    for (const r of (recentPages.rows ?? []).filter((x) => x.clicks > 0).sort((a, b) => b.clicks - a.clicks))
      console.log(`  ${r.clicks}  ${r.keys[0].replace(SITE, '')}  (${r.impressions} gösterim, sıra ${r.position.toFixed(1)})`);
    console.log('Son 3 günde tık alan sorgular (görünenler):');
    for (const r of (recent.rows ?? []).filter((x) => x.clicks > 0).sort((a, b) => b.clicks - a.clicks))
      console.log(`  ${r.clicks}  ${r.keys[0]}  →  ${r.keys[1].replace(SITE, '')}  (sıra ${r.position.toFixed(1)})`);
    process.exit(0);
  }
  const perf = await performance(token);
  writeJson(OUT, perf);
  const tot = perf.pages.reduce((a, p) => ({ c: a.c + p.clicks, i: a.i + p.impressions }), { c: 0, i: 0 });
  // Küçük günlük özet: zaman içindeki değişimi göstermek için (ham veri her seferinde üzerine yazılır).
  const hist = readJson(path.join(DATA, 'gsc-gecmis.json'), []);
  hist.push({ day: trDay(), start: perf.start, end: perf.end, clicks: tot.c, impressions: tot.i, pages: perf.pages.length, queries: new Set(perf.queryPage.map((r) => r.query)).size });
  writeJson(path.join(DATA, 'gsc-gecmis.json'), hist.slice(-120));
  // Günlük anlık görüntü: son 7 günlük sorgu/sayfa sıraları. Anahtar kelime takibi bunları karşılaştırır.
  writeJson(path.join(DATA, 'gunluk', `${trDay()}.json`), { day: trDay(), start7: perf.start7, end: perf.end, queryPage7: perf.queryPage7 });
  console.log(`Search Console ${perf.start}–${perf.end}: ${tot.c} tıklama, ${tot.i} gösterim, ${perf.pages.length} sayfa, ${hist.at(-1).queries} sorgu.`);
  const n = Number(process.argv[process.argv.indexOf('--denetle') + 1]);
  if (process.argv.includes('--denetle') && n > 0) {
    const r = await inspect(token, n);
    const bad = Object.entries(r.results).filter(([, v]) => v.verdict && v.verdict !== 'PASS');
    console.log(`URL Denetleme: ${n} adres kontrol edildi; dizinde olmayan toplam ${bad.length}.`);
  }
}
