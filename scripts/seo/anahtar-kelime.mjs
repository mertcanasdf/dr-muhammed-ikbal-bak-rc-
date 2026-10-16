// Anahtar kelime takibi: Search Console'daki her sorgu için en iyi sayfa, 28/7 günlük sıra,
// bir hafta önceki sıraya göre değişim, ilk görülme ve içerik boşluğu tespiti.
//   node scripts/seo/anahtar-kelime.mjs   -> data/seo/anahtar-kelimeler.json
// Kaynak: data/seo/gsc-son.json + data/seo/gunluk/*.json (gsc.mjs her gün yazar). Veri yoksa sessizce çıkar.
import fs from 'node:fs';
import path from 'node:path';
import { DATA, SITE, readJson, writeJson, trDay, daysBetween } from './ortak.mjs';

const BRAND = /bak[ıi]rc[ıi]|muhammed ikbal|muhammet ikbal/i;
const norm = (u) => (u.endsWith('/') && new URL(u).pathname !== '/' ? u.slice(0, -1) : u);
const rel = (u) => norm(u).replace(SITE, '') || '/';

/** Sorgu başına: sayfalar birleştirilir, en çok gösterim alan sayfa "en iyi sayfa" olur. */
function byQuery(rows) {
  const m = new Map();
  for (const r of rows ?? []) {
    const o = m.get(r.query) ?? { query: r.query, impressions: 0, clicks: 0, posW: 0, pages: new Map() };
    o.impressions += r.impressions; o.clicks += r.clicks; o.posW += r.position * r.impressions;
    const p = rel(r.page); o.pages.set(p, (o.pages.get(p) ?? 0) + r.impressions);
    m.set(r.query, o);
  }
  for (const o of m.values()) {
    o.position = +(o.posW / (o.impressions || 1)).toFixed(1);
    o.page = [...o.pages.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
    o.pageCount = o.pages.size;
    delete o.posW; delete o.pages;
  }
  return m;
}

export function trackKeywords() {
  const gsc = readJson(path.join(DATA, 'gsc-son.json'));
  if (!gsc) return null;
  const today = trDay();
  const d28 = byQuery(gsc.queryPage), d7 = byQuery(gsc.queryPage7 ?? []);

  // Bir hafta (6–8 gün) önceki anlık görüntü; yoksa en eski görüntü (en az 3 gün önce).
  const dir = path.join(DATA, 'gunluk');
  const snaps = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith('.json')).sort() : [];
  const dayOf = (f) => f.replace('.json', '');
  const old = snaps.filter((f) => { const d = daysBetween(dayOf(f), today); return d >= 6 && d <= 8; }).pop()
    ?? snaps.filter((f) => daysBetween(dayOf(f), today) >= 3)[0];
  const prev7 = old ? byQuery(readJson(path.join(dir, old)).queryPage7) : new Map();
  // İlk görülme: sorgunun yer aldığı en eski anlık görüntü.
  const firstSeen = new Map();
  for (const f of snaps) for (const r of readJson(path.join(dir, f)).queryPage7 ?? []) if (!firstSeen.has(r.query)) firstSeen.set(r.query, dayOf(f));

  const prevState = readJson(path.join(DATA, 'anahtar-kelimeler.json'), { keywords: [] });
  const prevFirst = new Map(prevState.keywords.map((k) => [k.query, k.firstSeen]));

  const keywords = [...d28.values()].map((k) => {
    const now7 = d7.get(k.query), was7 = prevV(prev7.get(k.query));
    const pos7 = now7?.position ?? null;
    const delta = pos7 != null && was7 != null ? +(was7 - pos7).toFixed(1) : null; // pozitif = yükseldi
    const fs0 = prevFirst.get(k.query) ?? firstSeen.get(k.query) ?? today;
    const band = k.position <= 3 ? 'ilk3' : k.position <= 10 ? 'ilk10' : k.position <= 20 ? 'vurus' : 'uzak';
    const trend = daysBetween(fs0, today) <= 7 ? 'yeni' : delta == null ? 'veri-yok' : delta >= 1.5 ? 'yukseldi' : delta <= -1.5 ? 'dustu' : 'sabit';
    return { query: k.query, brand: BRAND.test(k.query), page: k.page, pageCount: k.pageCount, impressions28: k.impressions, clicks28: k.clicks, position28: k.position, position7: pos7, positionWeekAgo: was7, delta, band, trend, firstSeen: fs0 };
  }).sort((a, b) => b.impressions28 - a.impressions28);

  // İçerik boşluğu: marka dışı, anlamlı gösterimli sorgu; en iyi sayfa blog yazısı değil ya da 20. sıranın gerisinde.
  const gaps = keywords.filter((k) => !k.brand && k.impressions28 >= 5 && (!k.page?.startsWith('/blog/') || k.position28 > 20))
    .map((k) => ({ query: k.query, page: k.page, position28: k.position28, impressions28: k.impressions28 }));

  const out = { day: today, window: `${gsc.start}–${gsc.end}`, comparedWith: old ? dayOf(old) : null, keywords, gaps,
    summary: {
      total: keywords.length, nonBrand: keywords.filter((k) => !k.brand).length,
      ilk3: keywords.filter((k) => k.band === 'ilk3').length, ilk10: keywords.filter((k) => k.band === 'ilk10').length,
      vurus: keywords.filter((k) => k.band === 'vurus').length,
      yeni: keywords.filter((k) => k.trend === 'yeni').length, yukseldi: keywords.filter((k) => k.trend === 'yukseldi').length, dustu: keywords.filter((k) => k.trend === 'dustu').length,
    } };
  writeJson(path.join(DATA, 'anahtar-kelimeler.json'), out);
  return out;
}
function prevV(o) { return o ? o.position : null; }

if (process.argv[1]?.replaceAll('\\', '/').endsWith('scripts/seo/anahtar-kelime.mjs')) {
  const o = trackKeywords();
  if (!o) { console.log('Anahtar kelime: Search Console verisi yok, atlandı.'); process.exit(0); }
  const s = o.summary;
  console.log(`Anahtar kelime (${o.window}, kıyas: ${o.comparedWith ?? 'yok'}): ${s.total} sorgu (${s.nonBrand} marka dışı) · ilk 3: ${s.ilk3} · ilk 10: ${s.ilk10} · 11–20: ${s.vurus} · yeni ${s.yeni} · yükselen ${s.yukseldi} · düşen ${s.dustu} · içerik boşluğu ${o.gaps.length}`);
}
