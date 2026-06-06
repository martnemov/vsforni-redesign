import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';
import redirectsData from './data/redirects-301.json' with { type: 'json' };

const redirects = Object.fromEntries(
  redirectsData.map(r => [r.from, { status: 301, destination: r.to }])
);

export default defineConfig({
  output: 'server',
  i18n: {
    defaultLocale: 'ru',
    locales: ['ru', 'en'],
    routing: {
      prefixDefaultLocale: false,
      redirectToDefaultLocale: false,
    },
  },
  redirects,
  site: 'https://vsforni.vercel.app',
  adapter: vercel(),
  integrations: [
    sitemap({
      lastmod: new Date(),
      serialize(item) {
        const url = item.url;
        const path = url.replace('https://vsforni.vercel.app', '');

        // Determine priority and changefreq by URL depth
        if (path === '/' || path === '') {
          return { ...item, priority: 1.0, changefreq: 'weekly' };
        }
        if (path === '/katalog-oborudovaniya-vs-forni/' || path === '/katalog-oborudovaniya-vs-forni') {
          return { ...item, priority: 0.9, changefreq: 'weekly' };
        }
        // Category pages: 1 segment after katalog
        const catalogDepth = (path.match(/\/katalog-oborudovaniya-vs-forni\/[^/]+\/?$/));
        if (catalogDepth) return { ...item, priority: 0.8, changefreq: 'weekly' };
        // Group pages: 2 segments after katalog
        const groupDepth = (path.match(/\/katalog-oborudovaniya-vs-forni\/[^/]+\/[^/]+\/?$/));
        if (groupDepth) return { ...item, priority: 0.7, changefreq: 'weekly' };
        // Product pages: 3 segments after katalog
        const productDepth = (path.match(/\/katalog-oborudovaniya-vs-forni\/[^/]+\/[^/]+\/[^/]+\/?$/));
        if (productDepth) return { ...item, priority: 0.8, changefreq: 'monthly' };
        // Static pages
        return { ...item, priority: 0.6, changefreq: 'monthly' };
      },
    }),
  ],
  image: {
    remotePatterns: [],
  },
  build: {
    // Inline all CSS — eliminates render-blocking stylesheet requests
    inlineStylesheets: 'always',
  },
  vite: {
    build: {
      cssMinify: true,
    },
  },
});
