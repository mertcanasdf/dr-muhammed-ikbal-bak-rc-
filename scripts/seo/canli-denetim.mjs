// Canlı sitenin teknik SEO denetimi: yönlendirmeler, robots, sitemap'teki her adresin durumu,
// canonical, title, description, H1, noindex ve favicon. Kritik sorun varsa listeler.
//   node scripts/seo/canli-denetim.mjs   -> data/seo/canli-denetim.json
import path from 'node:path';
import { DATA, SITE, writeJson } from './ortak.mjs';

const get = async (url) => {
  const r = await fetch(url, { redirect: 'manual', headers: { 'User-Agent': 'Mozilla/5.0 (compatible; seo-denetim/1.0)' }, signal: AbortSignal.timeout(20000) });
  return { status: r.status, loc: r.headers.get('location'), body: r.status === 200 ? await r.text() : '' };
};
const critical = [];
const warnings = [];

// Yönlendirme beklentileri: [adres, beklenen durum, beklenen hedef]
const EXPECT = [
  ['http://muhammedikbalbakirci.com/', 301],
  ['https://muhammedikbalbakirci.com/', 301, `${SITE}/`],
  [`${SITE}/hakkinda/`, 301, `${SITE}/hakkinda`],
  [`${SITE}/hakkinda.html`, 301, `${SITE}/hakkinda`],
  [`${SITE}/podcast`, 410],
  [`${SITE}/bu-sayfa-yok-denetim`, 404],
  [`${SITE}/favicon.ico`, 200],
  [`${SITE}/robots.txt`, 200],
];
for (const [u, status, loc] of EXPECT) {
  try {
    const r = await get(u);
    if (r.status !== status || (loc && r.loc !== loc)) critical.push(`${u}: beklenen ${status}${loc ? ' → ' + loc : ''}, gelen ${r.status}${r.loc ? ' → ' + r.loc : ''}`);
  } catch (e) { critical.push(`${u}: erişilemedi (${e.message})`); }
}

const robots = (await get(`${SITE}/robots.txt`)).body;
if (/^Disallow:\s*\/\s*$/m.test(robots)) critical.push('robots.txt tüm siteyi engelliyor');
const locs = [...(await get(`${SITE}/sitemap.xml`)).body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]).filter((u) => !/\.(webp|jpe?g|png)$/.test(u));
if (locs.length < 10) critical.push(`sitemap.xml'de yalnız ${locs.length} adres var`);

const pages = [];
const titles = new Map();
let i = 0;
await Promise.all(Array.from({ length: 6 }, async () => {
  while (i < locs.length) {
    const u = locs[i++];
    let r;
    try { r = await get(u); } catch (e) { critical.push(`${u}: erişilemedi`); continue; }
    if (r.status !== 200) { critical.push(`${u}: sitemap'te ama ${r.status}${r.loc ? ' → ' + r.loc : ''}`); continue; }
    const h = r.body;
    const p = {
      url: u,
      title: h.match(/<title>([^<]*)<\/title>/)?.[1] ?? '',
      desc: h.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? '',
      canonical: h.match(/rel="canonical" href="([^"]+)"/)?.[1] ?? '',
      h1: (h.match(/<h1[\s>]/g) ?? []).length,
      noindex: /name="robots" content="[^"]*noindex/.test(h),
    };
    pages.push(p);
    if (p.canonical !== u) critical.push(`${u}: canonical ${p.canonical || 'yok'}`);
    if (p.noindex) critical.push(`${u}: sitemap'te ama noindex`);
    if (!p.title) critical.push(`${u}: title yok`);
    if (p.h1 !== 1) warnings.push(`${u}: ${p.h1} adet H1`);
    if (p.title.length > 65) warnings.push(`${u}: title ${p.title.length} karakter`);
    if (p.desc.length < 70 || p.desc.length > 170) warnings.push(`${u}: description ${p.desc.length} karakter`);
    (titles.get(p.title) ?? titles.set(p.title, []).get(p.title)).push(u);
  }
}));
for (const [t, us] of titles) if (us.length > 1) warnings.push(`aynı title (${us.length}): ${t}`);

const result = { checkedAt: new Date().toISOString(), pages: pages.length, sitemap: locs.length, critical, warnings };
writeJson(path.join(DATA, 'canli-denetim.json'), result);
console.log(`Canlı denetim: ${pages.length}/${locs.length} sayfa; kritik ${critical.length}, uyarı ${warnings.length}.`);
for (const c of critical.slice(0, 15)) console.log(`  KRİTİK ${c}`);
for (const w of warnings.slice(0, 10)) console.log(`  uyarı ${w}`);
