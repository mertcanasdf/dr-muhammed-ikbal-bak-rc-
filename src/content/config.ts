import { defineCollection, z } from 'astro:content';
import { BLOG_CATEGORIES } from '../lib/categories';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    description: z.string(),
    category: z.enum(BLOG_CATEGORIES),
    image: z.string(),
    readTime: z.string(),
    takeaways: z.array(z.string()).optional(),
    relatedArticles: z.array(z.object({
      slug: z.string(),
      category: z.enum(BLOG_CATEGORIES),
      title: z.string(),
      image: z.string(),
    })).optional(),
  }),
});

export const collections = { blog };
