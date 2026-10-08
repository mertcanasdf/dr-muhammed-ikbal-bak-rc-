// Yazılardaki dış kaynak bağlantılarını kontrol eder (kırık kaynak, sağlık içeriğinde güveni ve E-E-A-T'yi düşürür).
//   node scripts/seo/kaynak-kontrol.mjs [--adet 80]
// Her çalışmada en uzun süredir kontrol edilmeyen N adresi dener; sonuçlar data/seo/kaynak-durumu.json'da birikir.
// Bir adres ancak art arda 2 kontrolde 404/410 ya da alan adı hatası verirse "kırık" sayılır
// (403/429 gibi bot engelleri kırık değildir; bunlar "belirsiz" olarak kalır).
import path from 'node:path';
import { DATA, loadArticles, readJson, writeJson } from './ortak.mjs';

const FILE = path.join(DATA, 'kaynak-durumu.json');
const count = Number(process.argv[process.argv.indexOf('--adet') + 1]) || 80;
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36';

const articles = loadArticles();
const usedBy = new Map();
for (const a of articles) for (const l of a.links) (usedBy.get(l) ?? usedBy.set(l, new Set()).get(l)).add(a.slug);
const state = readJson(FILE, { links: {} });
for (const u of Object.keys(state.links)) if (!usedBy.has(u)) delete state.links[u];

const queue = [...usedBy.keys()].sort((a, b) => (state.links[a]?.checkedAt ?? '').localeCompare(state.links[b]?.checkedAt ?? '')).slice(0, count);

async function probe(url) {
  for (const method of ['HEAD', 'GET']) {
    try {
      const r = await fetch(url, { method, redirect: 'follow', headers: { 'User-Agent': UA, Accept: 'text/html,*/*' }, signal: AbortSignal.timeout(20000) });
      if (method === 'HEAD' && [403, 405, 429, 501].includes(r.status)) continue;
      return { status: r.status, finalUrl: r.url };
    } catch (e) {
      if (method === 'GET') return { status: 0, error: (e.cause?.code ?? e.name ?? 'hata').toString() };
    }
  }
}

let i = 0;
await Promise.all(Array.from({ length: 6 }, async () => {
  while (i < queue.length) {
    const url = queue[i++];
    const r = await probe(url);
    const hard = r.status === 404 || r.status === 410 || (r.status === 0 && /ENOTFOUND|EAI_AGAIN|ECONNREFUSED|CERT/.test(r.error ?? ''));
    const prev = state.links[url] ?? {};
    state.links[url] = { checkedAt: new Date().toISOString(), status: r.status, error: r.error, finalUrl: r.finalUrl !== url ? r.finalUrl : undefined, failCount: hard ? (prev.failCount ?? 0) + 1 : 0 };
  }
}));

state.updatedAt = new Date().toISOString();
writeJson(FILE, state);
const broken = Object.entries(state.links).filter(([, v]) => v.failCount >= 2).map(([url, v]) => ({ url, status: v.status || v.error, articles: [...usedBy.get(url)] }));
const unclear = Object.values(state.links).filter((v) => v.status === 403 || v.status === 429 || (v.status >= 500)).length;
writeJson(path.join(DATA, 'kirik-kaynaklar.json'), broken);
console.log(`Kaynak kontrolü: ${queue.length} adres denendi (toplam ${usedBy.size}); kırık ${broken.length}, belirsiz ${unclear}.`);
for (const b of broken.slice(0, 10)) console.log(`  KIRIK ${b.status} ${b.url} ← ${b.articles.join(', ')}`);
