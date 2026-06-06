import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const ROOT = join(import.meta.dirname, '..');
const redirects = JSON.parse(readFileSync(join(ROOT, 'data', 'redirects-301.json'), 'utf-8')) as Array<{ from: string; to: string }>;

const redirectBlock = redirects
  .map(r => `\t\tredir ${r.from} ${r.to} 301`)
  .join('\n');

const caddy = `vsforni.ru {
\tencode gzip zstd

\t# Static assets — immutable (hashed filenames)
\t@hashed {
\t\tpath_regexp hashed \\/_astro\\/[^/]+\\.(js|css|woff2?)$
\t}
\theader @hashed Cache-Control "public, max-age=31536000, immutable"

\t# Fonts
\theader /fonts/* Cache-Control "public, max-age=31536000, immutable"

\t# Uploads (images/videos)
\theader /uploads/* Cache-Control "public, max-age=86400, stale-while-revalidate=604800"

\t# API — no cache
\theader /api/* Cache-Control "no-store"

\t# 301 redirects (testomesyi,-mikseryi → testopodgotovka)
${redirectBlock}

\t# Node.js app (standalone adapter)
\treverse_proxy localhost:4321
}
`;

writeFileSync(join(ROOT, 'Caddyfile'), caddy, 'utf-8');
console.log(`Caddyfile generated with ${redirects.length} redirects`);
