// Günlük SEO raporu: Search Console gidişatı, anahtar kelime hareketleri, dizin durumu, teknik denetim,
// fırsatlar ve günün görevi.  node scripts/seo/gunluk-rapor.mjs  -> data/seo/rapor/YYYY-MM-DD.md (ekrana da yazar)
// Rakamlar yalnız kayıtlı veriden gelir; veri yoksa "veri yok" yazılır.
import fs from 'node:fs';
import path from 'node:path';
import { DATA, readJson, trDay } from './ortak.mjs';

const day = trDay();
const hist = readJson(path.join(DATA, 'gsc-gecmis.json'), []);
const kw = readJson(path.join(DATA, 'anahtar-kelimeler.json'));
const opp = readJson(path.join(DATA, 'firsatlar.json'));
const audit = readJson(path.join(DATA, 'canli-denetim.json'));
const insp = readJson(path.join(DATA, 'gsc-denetim.json'), { results: {} }).results;
const task = readJson(path.join(DATA, 'bugun.json'));
const L = [];
const p = (s = '') => L.push(s);
const sign = (n) => (n > 0 ? `+${n}` : `${n}`);

p(`# SEO günlük rapor — ${day}`);
p();

// 1) Search Console gidişatı: günlük son kayıtlar (aynı gün tekrarları atılır).
const byDay = new Map(hist.map((h) => [h.day, h]));
const rows = [...byDay.values()].slice(-8);
p('## Search Console (son 28 gün, günlük ölçüm)');
if (!rows.length) p('Veri yok.');
else {
  p('| Ölçüm | Pencere | Gösterim | Tıklama | Sorgu | Sayfa |');
  p('|---|---|---|---|---|---|');
  for (const h of rows) p(`| ${h.day} | ${h.start}–${h.end} | ${h.impressions} | ${h.clicks} | ${h.queries} | ${h.pages} |`);
  if (rows.length > 1) {
    const a = rows[0], b = rows.at(-1);
    p();
    p(`İlk ölçüme göre: gösterim ${sign(b.impressions - a.impressions)}, tıklama ${sign(b.clicks - a.clicks)}, sorgu ${sign(b.queries - a.queries)}.`);
  }
}
p();

// 2) Anahtar kelimeler
p('## Anahtar kelimeler');
if (!kw) p('Veri yok.');
else {
  const s = kw.summary;
  p(`${s.total} sorgu (${s.nonBrand} marka dışı) · ilk 3: **${s.ilk3}** · ilk 10: **${s.ilk10}** · 11–20: ${s.vurus} · yeni ${s.yeni} · yükselen ${s.yukseldi} · düşen ${s.dustu}${kw.comparedWith ? ` (kıyas: ${kw.comparedWith})` : ' (haftalık kıyas için henüz yeterli geçmiş yok)'}`);
  p();
  p('| Sorgu | Sayfa | Gösterim | Tık | Sıra (28g) | Sıra (7g) | Değişim |');
  p('|---|---|---|---|---|---|---|');
  for (const k of kw.keywords.filter((x) => !x.brand).slice(0, 15)) {
    p(`| ${k.query} | ${k.page} | ${k.impressions28} | ${k.clicks28} | ${k.position28} | ${k.position7 ?? '–'} | ${k.delta == null ? (k.trend === 'yeni' ? 'yeni' : '–') : sign(k.delta)} |`);
  }
  const movers = kw.keywords.filter((k) => k.delta != null && Math.abs(k.delta) >= 1.5 && k.impressions28 >= 5).sort((a, b) => b.delta - a.delta);
  if (movers.length) {
    p();
    p('**Haftanın hareketleri:** ' + movers.slice(0, 8).map((k) => `${k.query} (${sign(k.delta)})`).join(', '));
  }
}
p();

// 3) Dizin
const all = Object.values(insp);
const bad = Object.entries(insp).filter(([, v]) => v.verdict && v.verdict !== 'PASS');
p('## Dizin (URL Denetleme)');
p(all.length ? `${all.length - bad.length}/${all.length} adres dizinde.` : 'Veri yok.');
for (const [u, v] of bad.slice(0, 12)) p(`- ${u.replace('https://www.muhammedikbalbakirci.com', '')} — ${v.coverage}`);
p();

// 4) Teknik
p('## Teknik denetim (canlı)');
p(audit ? `${audit.pages}/${audit.sitemap} sayfa · kritik ${audit.critical.length} · uyarı ${audit.warnings.length}` : 'Veri yok.');
for (const c of (audit?.critical ?? []).slice(0, 5)) p(`- KRİTİK: ${c}`);
p();

// 5) Fırsatlar
p('## Fırsatlar');
if (!opp) p('Veri yok.');
else {
  p(`Vuruş mesafesi ${opp.striking.length} · düşük CTR ${opp.lowCtr.length} · yamyamlık ${opp.cannibal.length} · çürüyen ${opp.decay?.length ?? 0} · düşen sorgu ${opp.droppingKeywords?.length ?? 0} · içerik boşluğu ${opp.gaps?.length ?? 0} · kısa yazı ${opp.thin.length} · az kaynak ${opp.fewSources.length}`);
  for (const s of opp.striking.slice(0, 3)) p(`- Vuruş: ${s.slug ?? s.page} — ${s.queries.map((q) => `"${q.query}" ${q.position}. sıra`).join(', ')}`);
  for (const s of opp.lowCtr.slice(0, 3)) p(`- Düşük CTR: ${s.slug ?? s.page} — ${s.position}. sıra, ${s.impressions} gösterim, CTR %${(s.ctr * 100).toFixed(1)}`);
  for (const c of opp.cannibal.slice(0, 3)) p(`- Yamyamlık: "${c.query}" → ${c.pages.map((x) => x.page.replace('https://www.muhammedikbalbakirci.com', '')).join(' / ')}`);
}
p();

// 6) Günün görevi
p('## Günün görevi');
p(task?.day === day ? `**${task.type}**${task.slug ? ` → ${task.slug}` : ''} — ${task.reason}` : 'Bugün için seçilmiş görev yok (otomasyon henüz çalışmamış olabilir).');

const out = L.join('\n') + '\n';
const file = path.join(DATA, 'rapor', `${day}.md`);
fs.mkdirSync(path.dirname(file), { recursive: true });
fs.writeFileSync(file, out);
console.log(out);
