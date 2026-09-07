import { APPROVED_ROUTES, SITE_URL } from '@/lib/seo/approved-routes';
import { XML_HEADERS, escapeXml } from '@/lib/seo/xml';

// /sitemap-next.xml – лише погоджені сторінки Next.js (approved-routes.json).
// Порожній перелік – валідний порожній urlset.

export const dynamic = 'force-static';

export function GET() {
  const lastmod = new Date().toISOString();
  const urls = APPROVED_ROUTES.map(
    (path) =>
      '  <url>\n' +
      `    <loc>${escapeXml(SITE_URL + path)}</loc>\n` +
      `    <lastmod>${lastmod}</lastmod>\n` +
      '  </url>',
  );

  const body =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    (urls.length ? urls.join('\n') + '\n' : '') +
    '</urlset>\n';

  return new Response(body, { headers: XML_HEADERS });
}
