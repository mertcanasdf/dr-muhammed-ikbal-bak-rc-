// SEO fırsat listesi: Search Console verisi (varsa) + yazıların içerik ölçüleri.
//   node scripts/seo/firsatlar.mjs   -> data/seo/firsatlar.json ve kısa özet
// Search Console verisi yoksa yalnız içerik kaynaklı fırsatlar (kısa yazı, az kaynak) üretilir; sayı uydurulmaz.
import path from 'node:path';
import { DATA, loadArticles, readJson, writeJson, trDay, daysBetween } from './ortak.mjs';

// Konuma göre beklenen tıklama oranı (genel sektör eğrisi; yalnız "belirgin düşük" CTR'ı ayırmak için kaba eşik).
const EXPECTED_CTR = [0, 0.28, 0.15, 0.1, 0.07, 0.05, 0.04, 0.03, 0.025, 0.02, 0.018];
const THIN_WORDS = 600;

export function computeOpportunities(articles = loadArticles(), gsc = readJson(path.join(DATA, 'gsc-son.json'))) {
  const byUrl = new Map(articles.map((a) => [a.url, a]));
  const pageStats = new Map((gsc?.pages ?? []).map((p) => [p.page, p]));
  const out = { day: trDay(), gscWindow: gsc ? `${gsc.start}–${gsc.end}` : null, striking: [], lowCtr: [], cannibal: [], thin: [], fewSources: [], noImpressions: [] };

  if (gsc) {
    // 1) Vuruş mesafesi: 4–20. sırada, anlamlı gösterimi olan sorgu. Sayfa bu sorguyu daha iyi yanıtlarsa ilk 3'e çıkabilir.
    const striking = new Map();
    for (const r of gsc.queryPage) {
      if (r.position < 4 || r.position > 20 || r.impressions < 15) continue;
      const s = striking.get(r.page) ?? { page: r.page, slug: byUrl.get(r.page)?.slug ?? null, score: 0, queries: [] };
      s.score += r.impressions * (21 - r.position) / 17;
      s.queries.push({ query: r.query, position: r.position, impressions: r.impressions, clicks: r.clicks });
      striking.set(r.page, s);
    }
    out.striking = [...striking.values()].map((s) => ({ ...s, score: Math.round(s.score), queries: s.queries.sort((a, b) => b.impressions - a.impressions).slice(0, 8) }))
      .sort((a, b) => b.score - a.score);

    // 2) Düşük tıklama oranı: ilk 10'da ama beklenenin yarısından az tıklanıyor -> başlık/açıklama sorgu niyetine uymuyor.
    for (const p of gsc.pages) {
      const pos = Math.round(p.position);
      if (pos < 1 || pos > 10 || p.impressions < 80) continue;
      if (p.ctr < EXPECTED_CTR[pos] * 0.5) {
        const top = gsc.queryPage.filter((r) => r.page === p.page).sort((a, b) => b.impressions - a.impressions).slice(0, 5).map((r) => r.query);
        out.lowCtr.push({ page: p.page, slug: byUrl.get(p.page)?.slug ?? null, position: p.position, impressions: p.impressions, ctr: p.ctr, expected: EXPECTED_CTR[pos], topQueries: top });
      }
    }
    out.lowCtr.sort((a, b) => b.impressions - a.impressions);

    // 3) Yamyamlık: aynı sorguda 2+ sayfa gösteriliyor -> biri ana sayfa olmalı, diğeri ona bağlanmalı/ayrışmalı.
    const byQuery = new Map();
    for (const r of gsc.queryPage) if (r.impressions >= 10) (byQuery.get(r.query) ?? byQuery.set(r.query, []).get(r.query)).push(r);
    for (const [query, rows] of byQuery) {
      if (rows.length < 2) continue;
      out.cannibal.push({ query, pages: rows.sort((a, b) => a.position - b.position).map((r) => ({ page: r.page, position: r.position, impressions: r.impressions })) });
    }
    out.cannibal.sort((a, b) => b.pages.reduce((n, p) => n + p.impressions, 0) - a.pages.reduce((n, p) => n + p.impressions, 0));

    // 4) 28+ günlük olup hiç gösterim almayan yazı -> niyet/başlık uyumsuzluğu veya dizin sorunu.
    out.noImpressions = articles.filter((a) => a.date && daysBetween(a.date, out.day) > 28 && !pageStats.get(a.url)?.impressions)
      .map((a) => ({ slug: a.slug, date: a.date, title: a.title }));
  }

  // 5) Kısa yazılar: gösterimi olanlar önce (trafiği olan sayfayı güçlendirmek en hızlı kazanç), sonra en kısa.
  out.thin = articles.filter((a) => a.words < THIN_WORDS)
    .map((a) => ({ slug: a.slug, words: a.words, sources: a.sources, category: a.category, impressions: pageStats.get(a.url)?.impressions ?? null }))
    .sort((a, b) => (b.impressions ?? -1) - (a.impressions ?? -1) || a.words - b.words);

  // 6) Kaynağı 3'ten az sağlık yazısı.
  out.fewSources = articles.filter((a) => a.sources < 3).map((a) => ({ slug: a.slug, sources: a.sources, words: a.words })).sort((a, b) => a.sources - b.sources || a.words - b.words);
  return out;
}

if (process.argv[1]?.replaceAll('\\', '/').endsWith('scripts/seo/firsatlar.mjs')) {
  const o = computeOpportunities();
  writeJson(path.join(DATA, 'firsatlar.json'), o);
  console.log(`Fırsatlar (${o.gscWindow ?? 'Search Console verisi yok'}): vuruş mesafesi ${o.striking.length}, düşük CTR ${o.lowCtr.length}, yamyamlık ${o.cannibal.length}, gösterimsiz ${o.noImpressions.length}, kısa yazı ${o.thin.length}, az kaynak ${o.fewSources.length}.`);
}
