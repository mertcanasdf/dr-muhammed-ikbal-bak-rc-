// Build sonrası bağımsız SEO/JSON-LD denetimi. Harici HTTP isteği veya Google testi yapmaz.
// node scripts/verify-seo.mjs [--dist dist] [--output outputs/seo-verification.json]
import fs from 'node:fs';
import path from 'node:path';

const SITE = 'https://www.muhammedikbalbakirci.com';
const PERSON = 'Muhammed İkbal Bakırcı';
const PERSON_ID = `${SITE}/#person`;
const args = process.argv.slice(2);
let dist = path.resolve('dist');
let output;
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--dist' || args[i] === '--output') {
    const option = args[i];
    if (!args[i + 1] || args[i + 1].startsWith('--')) throw new Error(`${option} için yol gerekli`);
    const value = path.resolve(args[++i]);
    if (option === '--dist') dist = value;
    else output = value;
  } else throw new Error(`Bilinmeyen seçenek: ${args[i]}`);
}
if (!fs.existsSync(dist)) throw new Error('dist/ bulunamadı; önce build çalıştırın.');

const checks = new Map();
const warnings = [];
function record(name, problems = []) {
  const existing = checks.get(name) ?? [];
  checks.set(name, [...existing, ...problems]);
}
const entity = (s = '') => String(s).replace(/&(#x[\da-f]+|#\d+|amp|quot|apos|lt|gt|nbsp);/gi, (whole, token) => {
  if (token[0] === '#') {
    const n = token[1].toLowerCase() === 'x' ? parseInt(token.slice(2), 16) : Number(token.slice(1));
    return Number.isInteger(n) && n >= 0 && n <= 0x10ffff ? String.fromCodePoint(n) : whole;
  }
  return { amp: '&', quot: '"', apos: "'", lt: '<', gt: '>', nbsp: ' ' }[token.toLowerCase()] ?? whole;
});
const attributes = (tag) => Object.fromEntries([...tag.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g)]
  .map((m) => [m[1].toLowerCase(), entity(m[2] ?? m[3] ?? m[4])]));
const text = (s = '') => entity(s.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
const types = (node) => Array.isArray(node?.['@type']) ? node['@type'] : [node?.['@type']].filter(Boolean);
const hasType = (node, type) => types(node).includes(type);
const fileExists = (rel) => {
  const full = path.resolve(dist, rel.replace(/^\/+/, ''));
  if (full !== dist && !full.startsWith(`${dist}${path.sep}`)) return false;
  return fs.existsSync(full) && fs.statSync(full).isFile();
};
const routeOf = (file) => file === 'index.html' ? '/' : `/${file.replace(/(?:\/index)?\.html$/, '')}`;
const htmlFiles = fs.readdirSync(dist, { recursive: true }).map(String).map((f) => f.replaceAll('\\', '/'))
  .filter((f) => f.endsWith('.html') && fileExists(f)).sort();
const pages = htmlFiles.map((file) => {
  const html = fs.readFileSync(path.join(dist, file), 'utf8');
  const tags = [...html.matchAll(/<(?:meta|link)\b[^>]*>/gi)].map((m) => attributes(m[0]));
  const meta = (name) => tags.filter((a) => a.name === name || a.property === name).map((a) => a.content ?? '');
  const canonical = tags.filter((a) => a.rel?.split(/\s+/).includes('canonical')).map((a) => a.href ?? '');
  const route = routeOf(file);
  const robots = meta('robots').join(',');
  const indexable = !/(?:^|[,\s])noindex(?:$|[,\s])/i.test(robots);
  const structural = html.replace(/(<(?:script|style)\b[^>]*>)[\s\S]*?<\/(?:script|style)>/gi, '$1');
  return { file, html, structural, route, url: `${SITE}${route}`, meta, canonical, indexable,
    ids: new Set([...structural.matchAll(/\bid\s*=\s*(?:"([^"]+)"|'([^']+)')/g)].map((m) => entity(m[1] ?? m[2]))),
    nodes: [], incoming: new Set() };
});
record('Build HTML mevcut', pages.length ? [] : ['Hiç HTML sayfası yok']);
const byRoute = new Map(pages.map((p) => [p.route, p]));
const titles = new Map();
const descriptions = new Map();
const allArticles = [];
const topNodes = (value) => Array.isArray(value) ? value.flatMap(topNodes) : value?.['@graph'] ?? [value];
const absolute = (value) => typeof value === 'string' && /^https:\/\//.test(value);
function canonicalUrl(value) {
  try {
    const url = new URL(value);
    return url.origin === SITE && !url.search && !url.hash && !/\.html$/i.test(url.pathname)
      && (url.pathname === '/' || !url.pathname.endsWith('/'));
  } catch { return false; }
}
function validDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2}))?$/.test(value)) return false;
  const d = new Date(value);
  if (!Number.isFinite(d.valueOf())) return false;
  const day = value.slice(0, 10);
  return new Date(`${day}T00:00:00Z`).toISOString().slice(0, 10) === day;
}
function walk(value, visit, key = '') {
  if (Array.isArray(value)) value.forEach((v) => walk(v, visit, key));
  else if (value && typeof value === 'object') {
    visit(value, key);
    for (const [k, v] of Object.entries(value)) walk(v, visit, k);
  }
}
function resolveLocal(value, page) {
  if (!value || /^(?:mailto|tel|sms|javascript|data|blob):/i.test(value)) return null;
  let url;
  try { url = new URL(value, page.url); } catch { return { error: `geçersiz URL: ${value}` }; }
  if (url.origin !== SITE) return null;
  let pathname;
  let hash;
  try { pathname = decodeURIComponent(url.pathname); hash = decodeURIComponent(url.hash.slice(1)); }
  catch { return { error: `geçersiz URL kodlaması: ${value}` }; }
  const route = pathname.replace(/(?:\/index)?\.html$/, '').replace(/\/+$/, '') || '/';
  const target = byRoute.get(route);
  const candidates = pathname === '/' ? ['index.html'] : [pathname, `${pathname}.html`, `${pathname.replace(/\/+$/, '')}/index.html`];
  const file = candidates.find(fileExists);
  return { file, target, hash, url };
}

for (const page of pages) {
  const { file, html, indexable } = page;
  const errors = [];
  const blocks = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)]
    .filter((m) => attributes(m[1]).type === 'application/ld+json');
  if (blocks.length !== 1) errors.push(`${file}: JSON-LD blok sayısı ${blocks.length}, beklenen 1`);
  for (const block of blocks) {
    try {
      const graph = JSON.parse(block[2]);
      if (graph['@context'] !== 'https://schema.org') errors.push(`${file}: @context https://schema.org değil`);
      page.nodes.push(...topNodes(graph));
      walk(graph, (node) => {
        if (types(node).some((t) => ['HowTo', 'SpecialAnnouncement', 'CourseInfo', 'EstimatedSalary', 'LearningVideo'].includes(t)))
          errors.push(`${file}: kullanımdan kaldırılmış rich result türü ${types(node).join(',')}`);
        if ('aggregateRating' in node || 'review' in node || hasType(node, 'Review'))
          errors.push(`${file}: doğrulanmış yorum kaynağı olmayan kişisel sitede review/rating şeması`);
        for (const key of ['@id', 'url', 'contentUrl', 'thumbnailUrl']) {
          if (key in node && !absolute(node[key])) errors.push(`${file}: mutlak HTTPS URL değil ${key}=${node[key]}`);
        }
        if ('datePublished' in node && !validDate(node.datePublished)) errors.push(`${file}: geçersiz datePublished`);
        if ('dateModified' in node && !validDate(node.dateModified)) errors.push(`${file}: geçersiz dateModified`);
      });
    } catch (error) { errors.push(`${file}: JSON-LD parse hatası: ${error.message}`); }
  }
  const idNodes = new Map(page.nodes.filter((n) => n?.['@id']).map((n) => [n['@id'], n]));
  for (const node of page.nodes) if (!node || !types(node).length) errors.push(`${file}: graph düğümünde @type yok`);
  if (idNodes.size !== page.nodes.length) errors.push(`${file}: graph @id eksik veya yineleniyor`);
  record('JSON-LD syntax, context, tür ve URL/tarih bütünlüğü', errors);

  const personNodes = page.nodes.filter((n) => hasType(n, 'Person'));
  record('Person kimliği ve unvanı', personNodes.length === 1 && personNodes[0]['@id'] === PERSON_ID
    && personNodes[0].name === PERSON && personNodes[0].honorificPrefix === 'Dr.' ? [] : [`${file}: tek gerçek Person/ad/unvan sözleşmesi sağlanmıyor`]);
  const webPage = page.nodes.find((n) => n?.['@id'] === `${page.url}#webpage`);
  record('WebPage canonical ve graph referansları', !webPage || webPage.url !== page.url
    || !idNodes.has(webPage.isPartOf?.['@id']) ? [`${file}: WebPage URL veya WebSite ilişkisi tutarsız`] : []);
  if (page.route === '/hakkinda' || page.route === '/iletisim') {
    record('Profil/iletişim ana varlığı', webPage?.mainEntity?.['@id'] === PERSON_ID ? [] : [`${file}: mainEntity Person değil`]);
    if (page.route === '/hakkinda') record('Hekim profili ProfilePage', hasType(webPage, 'ProfilePage') ? [] : [`${file}: ProfilePage yok`]);
  }
  const breadcrumbs = page.nodes.filter((n) => hasType(n, 'BreadcrumbList'));
  const breadcrumbErrors = [];
  if (page.route === '/') {
    if (breadcrumbs.length || webPage?.breadcrumb) breadcrumbErrors.push(`${file}: ana sayfada breadcrumb üretiliyor`);
  } else {
    if (breadcrumbs.length !== 1) breadcrumbErrors.push(`${file}: tam bir BreadcrumbList gerekli`);
    for (const b of breadcrumbs) {
      const items = b.itemListElement;
      if (!Array.isArray(items) || items.length < 2) { breadcrumbErrors.push(`${file}: en az iki breadcrumb öğesi gerekli`); continue; }
      if (webPage?.breadcrumb?.['@id'] !== b['@id']) breadcrumbErrors.push(`${file}: breadcrumb referansı kopuk`);
      items.forEach((item, i) => {
        if (!hasType(item, 'ListItem') || item.position !== i + 1 || !item.name || !canonicalUrl(item.item))
          breadcrumbErrors.push(`${file}: breadcrumb ${i + 1} tür/konum/ad/URL hatası`);
        else if (!resolveLocal(item.item, page)?.target) breadcrumbErrors.push(`${file}: breadcrumb hedefi yok ${item.item}`);
      });
      if (items.at(-1)?.item !== page.url) breadcrumbErrors.push(`${file}: son breadcrumb canonical sayfa değil`);
    }
  }
  record('Breadcrumb öğe, sıra ve hedef bütünlüğü', breadcrumbErrors);

  const metaErrors = [];
  const h1Count = [...page.structural.matchAll(/<h1(?:\s|>)/gi)].length;
  if (h1Count !== 1) metaErrors.push(`${file}: H1 sayısı ${h1Count}`);
  if (page.canonical.length !== 1 || !canonicalUrl(page.canonical[0]) || page.canonical[0] !== page.url)
    metaErrors.push(`${file}: canonical www HTTPS/uzantısız/sayfa eşleşmesi başarısız`);
  if (indexable && !page.meta('robots').some((s) => /(?:^|[,\s])max-image-preview:large(?:$|[,\s])/.test(s)))
    metaErrors.push(`${file}: max-image-preview:large yok`);
  const titleTags = [...html.matchAll(/<title[^>]*>([\s\S]*?)<\/title>/gi)].map((m) => text(m[1]));
  const ds = page.meta('description').map((d) => text(d));
  if (titleTags.length !== 1 || !titleTags[0]) metaErrors.push(`${file}: tek dolu title gerekli`);
  if (ds.length !== 1 || !ds[0]) metaErrors.push(`${file}: tek dolu description gerekli`);
  if (indexable) {
    titles.set(titleTags[0], [...(titles.get(titleTags[0]) ?? []), file]);
    descriptions.set(ds[0], [...(descriptions.get(ds[0]) ?? []), file]);
  }
  record('H1, canonical ve indekslenebilir meta sözleşmesi', metaErrors);

  const articles = page.nodes.filter((n) => hasType(n, 'Article') || hasType(n, 'BlogPosting'));
  const articleErrors = [];
  if (page.route.startsWith('/blog/')) {
    if (articles.length !== 1) articleErrors.push(`${file}: tek Article gerekli`);
    if (!hasType(webPage, 'MedicalWebPage')) articleErrors.push(`${file}: sağlık makalesinin MedicalWebPage türü yok`);
  } else if (articles.length) articleErrors.push(`${file}: makale olmayan sayfada Article var`);
  for (const article of articles) {
    allArticles.push({ file, article, page });
    if (!article.headline || !article.description || !Array.isArray(article.image) || !article.image.length)
      articleErrors.push(`${file}: headline/description/image eksik`);
    const author = article.author;
    if (!hasType(author, 'Person') || author?.name !== PERSON || author?.honorificPrefix !== 'Dr.'
      || author?.['@id'] !== PERSON_ID || author?.url !== `${SITE}/hakkinda`)
      articleErrors.push(`${file}: Article yazar kimliği/ad/unvan/profil tutarsız`);
    if (!Number.isInteger(article.wordCount) || article.wordCount <= 0) articleErrors.push(`${file}: pozitif wordCount yok`);
    if (!validDate(article.datePublished) || !validDate(article.dateModified)
      || Date.parse(article.dateModified) < Date.parse(article.datePublished)) articleErrors.push(`${file}: Article tarih sırası/formatı hatalı`);
    if (page.meta('article:published_time').join() !== article.datePublished
      || page.meta('article:modified_time').join() !== article.dateModified) articleErrors.push(`${file}: Article JSON-LD/OG tarihleri eşleşmiyor`);
    if (page.meta('og:type').join() !== 'article') articleErrors.push(`${file}: og:type article değil`);
    const visibleDates = [...html.matchAll(/<time\b([^>]*)>/gi)].map((m) => attributes(m[1]).datetime);
    if (!visibleDates.includes(article.datePublished) || (article.dateModified !== article.datePublished && !visibleDates.includes(article.dateModified)))
      articleErrors.push(`${file}: görünen time tarihleri şemayı doğrulamıyor`);
    if (article.mainEntityOfPage?.['@id'] !== `${page.url}#webpage` || article.publisher?.['@id'] !== PERSON_ID)
      articleErrors.push(`${file}: Article sayfa/publisher graph bağı kopuk`);
    for (const image of article.image ?? []) if (!absolute(image) || !resolveLocal(image, page)?.file)
      articleErrors.push(`${file}: Article görseli yerel mutlak dosya değil ${image}`);
  }
  record('Article yazar, wordCount ve görünen/OG/JSON-LD tarih eşleşmesi', articleErrors);

  const linkErrors = [];
  for (const match of page.structural.matchAll(/<([a-z][\w:-]*)\b([^>]*)>/gi)) {
    const tag = match[1].toLowerCase();
    const attrs = attributes(match[2]);
    const values = ['href', 'src', 'poster'].filter((k) => attrs[k]).map((k) => attrs[k]);
    if (attrs.srcset) values.push(...attrs.srcset.split(',').map((item) => item.trim().split(/\s+/)[0]));
    for (const value of values) {
      const resolved = resolveLocal(value, page);
      if (!resolved) continue;
      if (resolved.error) { linkErrors.push(`${file}: ${resolved.error}`); continue; }
      if (!resolved.file) { linkErrors.push(`${file}: eksik yerel href/src/srcset ${value}`); continue; }
      if (tag === 'a' && resolved.target && resolved.target.route !== page.route) resolved.target.incoming.add(page.route);
      if (resolved.hash && resolved.target && !resolved.hash.startsWith(':~:text=') && !resolved.target.ids.has(resolved.hash))
        linkErrors.push(`${file}: hedef ID yok ${value}`);
    }
  }
  record('Göreli/mutlak yerel kaynak ve bütün fragment hedefleri', linkErrors);
}

record('İndekslenebilir title/description benzersiz', [...titles.entries(), ...descriptions.entries()]
  .filter(([, files]) => files.length > 1).map(([value, files]) => `${files.join(', ')}: ${value}`));
const contentDir = path.resolve('src/content/blog');
const expectedArticles = fs.existsSync(contentDir) ? fs.readdirSync(contentDir).filter((f) => /\.mdx?$/.test(f)) : [];
record('Kaynak makale ve Article build kümesi birebir', expectedArticles.length ? [
  ...expectedArticles.filter((f) => !allArticles.some(({ page }) => page.route === `/blog/${f.replace(/\.mdx?$/, '')}`)).map((f) => `Eksik Article: ${f}`),
  ...allArticles.filter(({ page }) => !expectedArticles.some((f) => page.route === `/blog/${f.replace(/\.mdx?$/, '')}`)).map(({ file }) => `Kaynağı olmayan Article: ${file}`),
  ...(allArticles.length !== expectedArticles.length ? [`Article ${allArticles.length}, kaynak ${expectedArticles.length}`] : []),
] : ['src/content/blog kaynağı bulunamadı']);
const sourceDateErrors = [];
for (const { page, article } of allArticles) {
  const sourceFile = expectedArticles.find((f) => page.route === `/blog/${f.replace(/\.mdx?$/, '')}`);
  if (!sourceFile) continue;
  const source = fs.readFileSync(path.join(contentDir, sourceFile), 'utf8');
  const frontmatter = source.match(/^---\s*\r?\n([\s\S]*?)\r?\n---(?:\s*\r?\n|$)/)?.[1] ?? '';
  const published = frontmatter.match(/^date:\s*["']?(\d{4}-\d{2}-\d{2})/m)?.[1];
  const modified = frontmatter.match(/^updated:\s*["']?(\d{4}-\d{2}-\d{2})/m)?.[1] ?? published;
  if (!published || article.datePublished?.slice(0, 10) !== published || article.dateModified?.slice(0, 10) !== modified)
    sourceDateErrors.push(`${page.file}: build tarihleri kaynak yayın/güncelleme tarihleriyle eşleşmiyor`);
}
record('Makale tarihleri gerçek kaynak frontmatter ile eşleşiyor', sourceDateErrors);

const sitemapFile = path.join(dist, 'sitemap.xml');
let sitemapUrls = [];
const sitemapErrors = [];
if (!fs.existsSync(sitemapFile)) sitemapErrors.push('sitemap.xml yok');
else {
  const xml = fs.readFileSync(sitemapFile, 'utf8');
  sitemapUrls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => entity(m[1]));
  if (!sitemapUrls.length) sitemapErrors.push('Sitemap URL listesi boş');
  if (new Set(sitemapUrls).size !== sitemapUrls.length) sitemapErrors.push('Sitemap yinelenen URL içeriyor');
  const expected = new Set(pages.filter((p) => p.indexable && !['/404', '/dunyada-saglik'].includes(p.route)).map((p) => p.url));
  for (const url of expected) if (!sitemapUrls.includes(url)) sitemapErrors.push(`Sitemap eksik: ${url}`);
  for (const url of sitemapUrls) if (!canonicalUrl(url) || !expected.has(url)) sitemapErrors.push(`Sitemap fazladan/noindex/noncanonical: ${url}`);
  for (const p of pages.filter((p) => ['/404', '/dunyada-saglik'].includes(p.route)))
    if (p.indexable) sitemapErrors.push(`${p.file}: noindex olmalı`);
  for (const m of xml.matchAll(/<url>([\s\S]*?)<\/url>/g)) {
    const loc = entity(m[1].match(/<loc>([^<]+)<\/loc>/)?.[1] ?? '');
    const article = allArticles.find(({ page }) => page.url === loc)?.article;
    const lastmod = m[1].match(/<lastmod>([^<]+)<\/lastmod>/)?.[1];
    if (lastmod && !validDate(lastmod)) sitemapErrors.push(`Geçersiz lastmod: ${loc}`);
    if (article && lastmod !== article.dateModified.slice(0, 10)) sitemapErrors.push(`Article/sitemap lastmod uyumsuz: ${loc}`);
  }
}
record('Sitemap tam indekslenebilir küme ve makale lastmod eşleşmesi', sitemapErrors);
record('Orphan indekslenebilir sayfa yok', pages.filter((p) => p.indexable && p.route !== '/' && !p.incoming.size).map((p) => p.file));

function imageDimensions(file) {
  const b = fs.readFileSync(file);
  if (b.length >= 24 && b.toString('ascii', 1, 4) === 'PNG') return [b.readUInt32BE(16), b.readUInt32BE(20)];
  if (b.length >= 30 && b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP') {
    const chunk = b.toString('ascii', 12, 16);
    if (chunk === 'VP8X') return [b.readUIntLE(24, 3) + 1, b.readUIntLE(27, 3) + 1];
    if (chunk === 'VP8 ') return [b.readUInt16LE(26) & 0x3fff, b.readUInt16LE(28) & 0x3fff];
    if (chunk === 'VP8L' && b[20] === 0x2f) { const v = b.readUInt32LE(21); return [(v & 0x3fff) + 1, ((v >>> 14) & 0x3fff) + 1]; }
  }
  if (b[0] === 0xff && b[1] === 0xd8) {
    let p = 2;
    while (p + 8 < b.length) {
      if (b[p] !== 0xff) break;
      const marker = b[p + 1];
      if (marker === 0xda || marker === 0xd9) break;
      if (marker === 0xff) { p++; continue; }
      if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) { p += 2; continue; }
      const size = b.readUInt16BE(p + 2);
      if (size < 2 || p + size + 2 > b.length) break;
      if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker))
        return [b.readUInt16BE(p + 7), b.readUInt16BE(p + 5)];
      p += size + 2;
    }
  }
  return null;
}
const imageErrors = [];
const checkedImages = new Map();
for (const page of pages) {
  const urls = page.meta('og:image');
  if (urls.length !== 1 || !absolute(urls[0])) { imageErrors.push(`${page.file}: tek mutlak og:image gerekli`); continue; }
  const resolved = resolveLocal(urls[0], page);
  if (!resolved?.file) { imageErrors.push(`${page.file}: og:image dosyası yok ${urls[0]}`); continue; }
  if (!checkedImages.has(resolved.file)) checkedImages.set(resolved.file, imageDimensions(path.join(dist, resolved.file)));
  const dims = checkedImages.get(resolved.file);
  if (!dims) { warnings.push(`${page.file}: görsel boyutu bu bağımsız okuyucuyla ölçülemedi`); continue; }
  const declaredWidth = page.meta('og:image:width')[0];
  const declaredHeight = page.meta('og:image:height')[0];
  if ((declaredWidth && Number(declaredWidth) !== dims[0]) || (declaredHeight && Number(declaredHeight) !== dims[1]))
    imageErrors.push(`${page.file}: OG boyut iddiası ${declaredWidth}x${declaredHeight}, dosya ${dims.join('x')}`);
  if (page.indexable && dims[0] < 1200) warnings.push(`${page.file}: büyük görsel için önerilen 1200px altı (${dims[0]}px)`);
}
record('OG görselleri dosya/boyut beyanı', imageErrors);

const results = [...checks].map(([name, problems]) => ({ name, status: problems.length ? 'fail' : 'pass', problems: [...new Set(problems)] }));
const failed = results.filter((r) => r.status === 'fail').length;
const report = {
  generatedAt: new Date().toISOString(),
  scope: 'Local built HTML/source artifacts only; no HTTP requests, Google Rich Results Test, Search Console, SERP ranking or medical editorial review',
  dist, pages: pages.length, indexablePages: pages.filter((p) => p.indexable).length,
  articles: allArticles.length, sourceArticles: expectedArticles.length, sitemapUrls: sitemapUrls.length,
  passed: results.length - failed, failed, status: failed ? 'fail' : 'pass',
  checks: results, warnings: [...new Set(warnings)],
};
if (output) { fs.mkdirSync(path.dirname(output), { recursive: true }); fs.writeFileSync(output, `${JSON.stringify(report, null, 2)}\n`); }
for (const result of results) {
  console.log(`${result.status.toUpperCase()}  ${result.name}`);
  for (const problem of result.problems.slice(0, 8)) console.log(`  - ${problem}`);
  if (result.problems.length > 8) console.log(`  ... +${result.problems.length - 8}`);
}
console.log(`\n${report.passed}/${results.length} SEO kontrolü geçti; ${report.pages} HTML, ${report.articles}/${report.sourceArticles} Article, ${report.sitemapUrls} sitemap URL.`);
if (warnings.length) console.log(`${report.warnings.length} bilgi/öneri (JSON raporunda).`);
if (output) console.log(`JSON: ${output}`);
process.exitCode = failed ? 1 : 0;
