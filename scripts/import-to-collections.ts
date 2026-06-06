import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, rmSync } from 'fs';
import { join } from 'path';
import { z } from 'zod';

const ROOT = join(import.meta.dirname, '..');
const DATA_DIR = join(ROOT, 'data');
const CONTENT_DIR = join(ROOT, 'src', 'content');

// ---- Zod schemas (mirrors src/content.config.ts) ----

const specSchema = z.object({ label: z.string(), value: z.string() });
const seoSchema = z.object({ title: z.string(), description: z.string(), ogImage: z.string() });

const productSchema = z.object({
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
});

const groupSchema = z.object({
  id: z.string(),
  urlSlug: z.string(),
  originalUri: z.string(),
  astroUri: z.string(),
  title: z.string(),
  description: z.string(),
  categorySlug: z.string(),
  image: z.string(),
  productCount: z.number(),
});

const categorySchema = z.object({
  id: z.string(),
  urlSlug: z.string(),
  originalUri: z.string(),
  astroUri: z.string(),
  title: z.string(),
  description: z.string(),
  groupCount: z.number(),
});

// ---- helpers ----

function ensureDir(dir: string) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

function clearDir(dir: string) {
  if (!existsSync(dir)) return;
  for (const f of readdirSync(dir)) {
    rmSync(join(dir, f), { force: true });
  }
}

let errors = 0;

function importCollection<T>(
  name: string,
  items: unknown[],
  schema: z.ZodType<T>,
  filenameOf: (item: T) => string,
) {
  const dir = join(CONTENT_DIR, name);
  ensureDir(dir);
  clearDir(dir);

  let ok = 0;
  let fail = 0;

  for (const rawItem of items) {
    // rename slug → urlSlug to avoid Astro glob-loader using slug field as entry ID
    const raw =
      rawItem !== null && typeof rawItem === 'object' && 'slug' in rawItem
        ? { ...(rawItem as Record<string, unknown>), urlSlug: (rawItem as Record<string, unknown>)['slug'], slug: undefined }
        : rawItem;
    const result = schema.safeParse(raw);
    if (!result.success) {
      console.error(`  [${name}] Validation failed:`, result.error.issues[0]);
      fail++;
      errors++;
      continue;
    }
    const item = result.data;
    const filename = filenameOf(item);
    writeFileSync(join(dir, filename), JSON.stringify(item, null, 2), 'utf-8');
    ok++;
  }

  console.log(`  ${name}: ${ok} OK, ${fail} failed`);
}

// ---- run ----

console.log('Importing to Astro content collections...');

const products = JSON.parse(readFileSync(join(DATA_DIR, 'products.json'), 'utf-8'));
const groups = JSON.parse(readFileSync(join(DATA_DIR, 'groups.json'), 'utf-8'));
const categories = JSON.parse(readFileSync(join(DATA_DIR, 'categories.json'), 'utf-8'));

// Products: use DB id as filename to avoid slug collisions
importCollection('products', products, productSchema, (p) => `${p.id}.json`);

// Groups: slugs are unique across collection, use slug
importCollection('groups', groups, groupSchema, (g) => `${g.urlSlug}.json`);

// Categories: use urlSlug
importCollection('categories', categories, categorySchema, (c) => `${c.urlSlug}.json`);

if (errors > 0) {
  console.error(`\nFailed with ${errors} validation error(s).`);
  process.exit(1);
} else {
  console.log('\nDone. Run "pnpm typecheck" to verify collections.');
}
