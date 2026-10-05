// relatedArticles içindeki başlık, kategori ve görseli hedef makalenin güncel frontmatter'ından eşler.
// Kullanım: node scripts/sync-related.mjs [--check]   (--check: değiştirmez, fark varsa 1 ile çıkar)
import fs from 'node:fs';
import path from 'node:path';

const DIR = path.resolve('src/content/blog');
const check = process.argv.includes('--check');
const STR = '"(?:[^"\\\\]|\\\\.)*"'; // çift tırnaklı YAML/JSON string

const files = fs.readdirSync(DIR).filter((f) => f.endsWith('.md'));
const meta = {};
for (const f of files) {
  const src = fs.readFileSync(path.join(DIR, f), 'utf8');
  const field = (name) => {
    const m = src.match(new RegExp(`^${name}: (${STR})`, 'm'));
    return m ? JSON.parse(m[1]) : null;
  };
  meta[f.replace(/\.md$/, '')] = { title: field('title'), category: field('category'), image: field('image') };
}

const RELATED = new RegExp(`(- slug: "([^"]+)"\\r?\\n\\s+category: )(${STR})(\\r?\\n\\s+title: )(${STR})(\\r?\\n\\s+image: )(${STR})`, 'g');
const problems = [];
let changed = 0;
for (const f of files) {
  const file = path.join(DIR, f);
  const src = fs.readFileSync(file, 'utf8');
  const total = (src.match(/- slug: "/g) || []).length;
  let seen = 0;
  const next = src.replace(RELATED, (m, a, slug, cat, b, title, c) => {
    seen++;
    const target = meta[slug];
    if (!target) { problems.push(`${f}: bilinmeyen ilgili makale ${slug}`); return m; }
    return `${a}${JSON.stringify(target.category)}${b}${JSON.stringify(target.title)}${c}${JSON.stringify(target.image)}`;
  });
  if (seen !== total) problems.push(`${f}: ${total - seen} ilgili makale beklenen slug/category/title/image düzeninde değil`);
  if (next !== src) {
    changed++;
    if (!check) fs.writeFileSync(file, next);
    else problems.push(`${f}: ilgili makale başlığı/kategorisi/görseli güncel değil`);
  }
}
if (problems.length) { console.error(problems.join('\n')); process.exit(1); }
console.log(check ? 'İlgili makaleler güncel.' : `${changed} makalede ilgili makaleler eşlendi.`);
