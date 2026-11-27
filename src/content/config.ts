import { defineCollection, z } from 'astro:content';
import { BLOG_CATEGORIES } from '../lib/categories';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    // Arama sonucu başlığı (≤60 karakter); yoksa title kullanılır. Sayfadaki H1 her zaman title.
    seoTitle: z.string().max(60).optional(),
    date: z.coerce.date(),
    // İçerik esaslı güncellendiğinde doldurulur; sitemap lastmod ve JSON-LD dateModified buradan gelir.
    updated: z.coerce.date().optional(),
    description: z.string(),
    category: z.enum(BLOG_CATEGORIES),
    image: z.string(),
    readTime: z.string(),
    takeaways: z.array(z.string()).optional(),
    // Hekimin kendi YouTube videosu (isteğe bağlı): yazıda tıklayınca yüklenen oynatıcı + VideoObject şeması.
    video: z.object({
      id: z.string().regex(/^[\w-]{11}$/),
      title: z.string(),
      description: z.string(),
      uploadDate: z.coerce.date(),
      shorts: z.boolean().default(false),
    }).optional(),
    relatedArticles: z.array(z.object({
      slug: z.string(),
      category: z.enum(BLOG_CATEGORIES),
      title: z.string(),
      image: z.string(),
    })).optional(),
  }),
});

export const collections = { blog };
