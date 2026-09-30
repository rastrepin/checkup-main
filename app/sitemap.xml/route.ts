import { SITE_URL } from '@/lib/seo/approved-routes';
import { XML_HEADERS } from '@/lib/seo/xml';

// /sitemap.xml – індекс. Під час міграції сайт живе на двох origin
// (Next.js і Tilda через проксі в middleware), тому індекс посилається на два
// sitemap: власний /sitemap-next.xml і /sitemap-tilda.xml (Tilda-sitemap без
// погоджених сторінок Next.js). Адреса /sitemap.xml не змінюється –
// Search Console і robots.txt продовжують працювати з нею.

export const dynamic = 'force-static';

export function GET() {
  const body =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    `  <sitemap><loc>${SITE_URL}/sitemap-next.xml</loc></sitemap>\n` +
    `  <sitemap><loc>${SITE_URL}/sitemap-tilda.xml</loc></sitemap>\n` +
    '</sitemapindex>\n';

  return new Response(body, { headers: XML_HEADERS });
}
