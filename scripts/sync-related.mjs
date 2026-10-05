// relatedArticles içindeki başlık ve kategoriyi hedef makalenin güncel frontmatter'ından eşler.
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
  meta[f.replace(/\.md$/, '')] = { title: field('title'), category: field('category') };
}

const RELATED = new RegExp(`(- slug: "([^"]+)"\\r?\\n\\s+category: )(${STR})(\\r?\\n\\s+title: )(${STR})`, 'g');
const problems = [];
let changed = 0;
for (const f of files) {
  const file = path.join(DIR, f);
  const src = fs.readFileSync(file, 'utf8');
  const next = src.replace(RELATED, (m, a, slug, cat, b, title) => {
    const target = meta[slug];
    if (!target) { problems.push(`${f}: bilinmeyen ilgili makale ${slug}`); return m; }
    return `${a}${JSON.stringify(target.category)}${b}${JSON.stringify(target.title)}`;
  });
  if (next !== src) {
    changed++;
    if (!check) fs.writeFileSync(file, next);
    else problems.push(`${f}: ilgili makale başlığı/kategorisi güncel değil`);
  }
}
if (problems.length) { console.error(problems.join('\n')); process.exit(1); }
console.log(check ? 'İlgili makaleler güncel.' : `${changed} makalede ilgili makaleler eşlendi.`);
