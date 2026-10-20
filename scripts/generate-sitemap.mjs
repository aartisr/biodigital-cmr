import { mkdir, writeFile } from 'node:fs/promises';

const rawOrigin = process.env.SITE_ORIGIN;

if (!rawOrigin) {
  throw new Error('SITE_ORIGIN is required, for example: SITE_ORIGIN=https://example.org');
}

let origin;
try {
  origin = new URL(rawOrigin).origin;
} catch {
  throw new Error('SITE_ORIGIN must be an absolute http(s) URL.');
}

if (origin.startsWith('http://')) {
  throw new Error('SITE_ORIGIN must use HTTPS for the production sitemap.');
}

await mkdir('public', { recursive: true });
await writeFile('public/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${origin}/</loc>
  </url>
</urlset>
`);
await writeFile('public/robots.txt', `User-agent: *
Allow: /
Sitemap: ${origin}/sitemap.xml
`);

console.log(`Generated robots.txt and sitemap.xml for ${origin}`);
