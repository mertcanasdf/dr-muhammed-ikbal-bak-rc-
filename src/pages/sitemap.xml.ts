import { getCollection } from 'astro:content';
import { getCanonicalUrl } from '../lib/seo';

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

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  const posts = await getCollection('blog');
  const entries = [
    ...staticRoutes.map((path) => ({ path })),
    ...posts.map((post) => ({
      path: `/blog/${post.id.replace(/\.mdx?$/, '')}`,
      lastmod: post.data.date.toISOString().slice(0, 10),
    })),
  ];
  const uniqueEntries = [...new Map(entries.map((entry) => [entry.path, entry])).values()]
    .sort((a, b) => a.path.localeCompare(b.path));
  const urls = uniqueEntries.map((entry) => {
    const lastmod = entry.lastmod ? `<lastmod>${entry.lastmod}</lastmod>` : '';
    return `<url><loc>${escapeXml(getCanonicalUrl(entry.path))}</loc>${lastmod}</url>`;
  }).join('');

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
}
