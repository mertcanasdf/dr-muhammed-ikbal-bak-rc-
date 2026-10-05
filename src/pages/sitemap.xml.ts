import { getCollection } from 'astro:content';
import { getAbsoluteUrl, getCanonicalUrl } from '../lib/seo';

const staticRoutes = [
  '/',
  '/blog',
  '/dunyada-saglik',
  '/gecmis-yillar',
  '/gizlilik-politikasi',
  '/hakkinda',
  '/iletisim',
  '/kullanim-kosullari',
  '/longevity',
  '/medikal-estetik',
  '/quizler',
  '/rehberler',
  '/sitelerimiz',
];

// Yazı listeleyen sayfalar en yeni yazının tarihini taşır; diğer statik sayfalar için güvenilir tarih yok, lastmod verilmez.
const listingRoutes = new Set(['/', '/blog', '/dunyada-saglik']);

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

const day = (d: Date) => d.toISOString().slice(0, 10);

export async function GET() {
  const posts = await getCollection('blog');
  const postEntries = posts.map((post) => ({
    path: `/blog/${post.id.replace(/\.mdx?$/, '')}`,
    lastmod: day(post.data.updated ?? post.data.date),
    image: getAbsoluteUrl(post.data.image),
  }));
  const newest = postEntries.map((entry) => entry.lastmod).sort().at(-1);
  const entries: { path: string; lastmod?: string; image?: string }[] = [
    ...staticRoutes.map((path) => ({ path, lastmod: listingRoutes.has(path) ? newest : undefined })),
    ...postEntries,
  ];
  const uniqueEntries = [...new Map(entries.map((entry) => [entry.path, entry])).values()]
    .sort((a, b) => a.path.localeCompare(b.path));
  const urls = uniqueEntries.map((entry) => {
    const lastmod = entry.lastmod ? `<lastmod>${entry.lastmod}</lastmod>` : '';
    const image = entry.image ? `<image:image><image:loc>${escapeXml(entry.image)}</image:loc></image:image>` : '';
    return `<url><loc>${escapeXml(getCanonicalUrl(entry.path))}</loc>${lastmod}${image}</url>`;
  }).join('');

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">${urls}</urlset>`;

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
}
