import { SITE_URL } from '@/lib/seo/approved-routes';
import { TILDA_ROBOTS_DISALLOW } from '@/lib/seo/tilda-robots-disallow';

// /robots.txt належить Next.js, не проксіюється на Tilda (технічна адреса
// Tilda віддає robots нестабільно). Правила:
// 1. службові сторінки Tilda (знімок lib/seo/tilda-robots-disallow.ts);
// 2. sitemap: /sitemap.xml (індекс next + tilda) і /sitemap-store.xml
//    (каталог лікарів Tilda, віддається через проксі).
// Окремих Disallow для чернеток Next.js немає: на домені їх не існує,
// ці URL віддає Tilda (Р42).

export const dynamic = 'force-static';

export function GET() {
  const lines = [
    'User-Agent: *',
    'Allow: /',
    ...TILDA_ROBOTS_DISALLOW.map((p) => `Disallow: ${p}`),
    '',
    `Sitemap: ${SITE_URL}/sitemap.xml`,
    `Sitemap: ${SITE_URL}/sitemap-store.xml`,
    '',
  ];

  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
