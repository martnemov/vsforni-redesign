import { defineMiddleware } from 'astro:middleware';

const IMMUTABLE = 'public, max-age=31536000, immutable';
const REVALIDATE = 'public, max-age=3600, must-revalidate';
const NO_CACHE  = 'no-store';

export const onRequest = defineMiddleware(async (context, next) => {
  const response = await next();
  const path = context.url.pathname;

  // API endpoints — no caching
  if (path.startsWith('/api/')) {
    response.headers.set('Cache-Control', NO_CACHE);
    return response;
  }

  // Immutable hashed assets (JS/CSS bundles with content hash in filename)
  if (path.match(/\/_astro\/[^/]+\.(js|css|woff2?)$/)) {
    response.headers.set('Cache-Control', IMMUTABLE);
    return response;
  }

  // Fonts and icons in /fonts/
  if (path.startsWith('/fonts/')) {
    response.headers.set('Cache-Control', IMMUTABLE);
    return response;
  }

  // Uploads (images, videos) — long cache, revalidate
  if (path.startsWith('/uploads/')) {
    response.headers.set('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
    return response;
  }

  // HTML pages — short cache with revalidation
  if (!path.includes('.') || path.endsWith('.html')) {
    response.headers.set('Cache-Control', REVALIDATE);
    return response;
  }

  return response;
});
