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
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${unsigned}.${sig}` }),
  });
  const json = await res.json();
  if (!json.access_token) throw new Error(`Search Console yetkilendirmesi başarısız: ${JSON.stringify(json).slice(0, 200)}`);
  return json.access_token;
}

const api = async (token, url, body) => {
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`Search Console API ${res.status}: ${JSON.stringify(json.error ?? json).slice(0, 300)}`);
  return json;
};

async function performance(token) {
  // GSC verisi ~2-3 gün gecikmelidir; son 3 günü dışarıda bırak.
  const end = new Date(Date.now() - 3 * 86400000).toISOString().slice(0, 10);
  const start = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
  const url = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(GSC_PROPERTY)}/searchAnalytics/query`;
  const q = (dimensions) => api(token, url, { startDate: start, endDate: end, dimensions, rowLimit: 5000, dataState: 'all' });
  const [byQueryPage, byPage] = await Promise.all([q(['query', 'page']), q(['page'])]);
  const row = (r, keys) => ({ ...Object.fromEntries(keys.map((k, i) => [k, r.keys[i]])), clicks: r.clicks, impressions: r.impressions, ctr: +r.ctr.toFixed(4), position: +r.position.toFixed(1) });
  return {
    fetchedAt: new Date().toISOString(), start, end,
    queryPage: (byQueryPage.rows ?? []).map((r) => row(r, ['query', 'page'])),
    pages: (byPage.rows ?? []).map((r) => row(r, ['page'])),
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
  const perf = await performance(token);
  writeJson(OUT, perf);
  const tot = perf.pages.reduce((a, p) => ({ c: a.c + p.clicks, i: a.i + p.impressions }), { c: 0, i: 0 });
  // Küçük günlük özet: zaman içindeki değişimi göstermek için (ham veri her seferinde üzerine yazılır).
  const hist = readJson(path.join(DATA, 'gsc-gecmis.json'), []);
  hist.push({ day: trDay(), start: perf.start, end: perf.end, clicks: tot.c, impressions: tot.i, pages: perf.pages.length, queries: new Set(perf.queryPage.map((r) => r.query)).size });
  writeJson(path.join(DATA, 'gsc-gecmis.json'), hist.slice(-120));
  console.log(`Search Console ${perf.start}–${perf.end}: ${tot.c} tıklama, ${tot.i} gösterim, ${perf.pages.length} sayfa, ${hist.at(-1).queries} sorgu.`);
  const n = Number(process.argv[process.argv.indexOf('--denetle') + 1]);
  if (process.argv.includes('--denetle') && n > 0) {
    const r = await inspect(token, n);
    const bad = Object.entries(r.results).filter(([, v]) => v.verdict && v.verdict !== 'PASS');
    console.log(`URL Denetleme: ${n} adres kontrol edildi; dizinde olmayan toplam ${bad.length}.`);
  }
}
