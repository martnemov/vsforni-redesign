import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const specSchema = z.object({
  label: z.string(),
  value: z.string(),
});

const seoSchema = z.object({
  title: z.string(),
  description: z.string(),
  ogImage: z.string(),
});

const products = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/products' }),
  schema: z.object({
    id: z.string(),
    urlSlug: z.string(),
    originalUri: z.string(),
    astroUri: z.string(),
    title: z.string(),
    longTitle: z.string(),
    description: z.string(),
    categorySlug: z.string(),
    groupSlug: z.string(),
    image: z.string(),
    specs: z.array(specSchema),
    content: z.string(),
    seo: seoSchema,
  }),
});

const groups = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/groups' }),
  schema: z.object({
    id: z.string(),
    urlSlug: z.string(),
    originalUri: z.string(),
    astroUri: z.string(),
    title: z.string(),
    description: z.string(),
    categorySlug: z.string(),
    image: z.string(),
    productCount: z.number(),
  }),
});

const categories = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/categories' }),
  schema: z.object({
    id: z.string(),
    urlSlug: z.string(),
    originalUri: z.string(),
    astroUri: z.string(),
    title: z.string(),
    description: z.string(),
    groupCount: z.number(),
  }),
});

export const collections = { products, groups, categories };
