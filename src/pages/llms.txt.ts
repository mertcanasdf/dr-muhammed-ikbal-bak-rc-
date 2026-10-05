import { getCollection } from 'astro:content';
import { BLOG_CATEGORIES } from '../lib/categories';
import { getCanonicalUrl } from '../lib/seo';

// llms.txt: yapay zekâ arama araçları için sitenin özeti ve makale dizini (her build'de yazılardan üretilir).
const PAGES: [string, string, string][] = [
  ['Hakkında', '/hakkinda', 'Eğitim, kariyer ve görevler'],
  ['Longevity: Sağlıklı Yaş Almanın 6 Alanı', '/longevity', 'Longevity nedir, 6 alan ve hücresel temeller'],
  ['Skin Longevity ve Medikal Estetik', '/medikal-estetik', 'Botoks, dolgu, altın iğne, PRP ve mezoterapi hakkında bilgilendirici rehber'],
  ['Tüm makaleler', '/blog', 'Kategorilere göre tüm yazılar'],
  ['Sağlık testleri', '/quizler', 'Farkındalık amaçlı ölçekler; tanı koymaz'],
  ['İletişim', '/iletisim', 'Randevu, iş birliği, akademik ve medya talepleri'],
];

export async function GET() {
  const posts = await getCollection('blog');
  const lines = [
    '# Dr. Muhammed İkbal Bakırcı',
    '',
    "> Hekim; 2022'den bu yana VM Medical Park Bursa Hastanesi Başhekimi. Bu sitede longevity (sağlıklı yaşlanma), beslenme, hareket, uyku, zihin sağlığı ve medikal estetik üzerine Türkçe, kaynaklı ve bilgilendirici içerikler yer alır. İçerikler genel bilgilendirme amaçlıdır; tanı ve tedavi yerine geçmez.",
    '',
    'Her makalenin sonunda "Kaynaklar" bölümü bulunur (PubMed, Cochrane, FDA, AAD, CDC, NIH gibi birincil kaynaklar).',
    '',
    '## Ana sayfalar',
    '',
    ...PAGES.map(([title, path, desc]) => `- [${title}](${getCanonicalUrl(path)}): ${desc}`),
  ];
  for (const category of BLOG_CATEGORIES) {
    const inCategory = posts
      .filter((post) => post.data.category === category)
      .sort((a, b) => a.data.title.localeCompare(b.data.title, 'tr'));
    if (!inCategory.length) continue;
    lines.push('', `## ${category}`, '');
    for (const post of inCategory) {
      const url = getCanonicalUrl(`/blog/${post.id.replace(/\.mdx?$/, '')}`);
      lines.push(`- [${post.data.title}](${url}): ${post.data.description}`);
    }
  }
  return new Response(lines.join('\n') + '\n', {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
