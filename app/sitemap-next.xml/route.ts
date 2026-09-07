import { NEXT_SITEMAP_ENTRIES, SITE_URL } from '@/lib/seo/sitemap-urls';
import { XML_HEADERS, escapeXml } from '@/lib/seo/xml';

// /sitemap-next.xml – тільки сторінки, які обслуговує Next.js.
// Перелік – lib/seo/sitemap-urls.ts.

export const dynamic = 'force-static';

export function GET() {
  const lastmod = new Date().toISOString();
  const urls = NEXT_SITEMAP_ENTRIES.map(
    (e) =>
      '  <url>\n' +
      `    <loc>${escapeXml(SITE_URL + e.path)}</loc>\n` +
      `    <lastmod>${lastmod}</lastmod>\n` +
      `    <changefreq>${e.changeFrequency}</changefreq>\n` +
      `    <priority>${e.priority}</priority>\n` +
      '  </url>',
  );

  const body =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls.join('\n') +
    '\n</urlset>\n';

  return new Response(body, { headers: XML_HEADERS });
}
