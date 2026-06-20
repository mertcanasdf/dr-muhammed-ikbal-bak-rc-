import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    description: z.string(),
    category: z.string(),
    image: z.string(),
    readTime: z.string(),
    takeaways: z.array(z.string()).optional(),
    relatedArticles: z.array(z.object({
      slug: z.string(),
      category: z.string(),
      title: z.string(),
      image: z.string(),
    })).optional(),
  }),
});

export const collections = { blog };
