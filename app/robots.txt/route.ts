import { SITE_URL } from '@/lib/seo/sitemap-urls';
import { TILDA_ROBOTS_DISALLOW } from '@/lib/seo/tilda-robots-disallow';

// /robots.txt належить Next.js, не проксіюється на Tilda (технічна адреса
// Tilda віддає robots нестабільно). Об'єднує три групи правил:
// 1. заморожені Program Page (Р39) – дублює noindex у metadata;
// 2. службові сторінки Tilda (знімок lib/seo/tilda-robots-disallow.ts);
// 3. sitemap: /sitemap.xml (індекс next + tilda) і /sitemap-store.xml
//    (каталог лікарів Tilda, віддається через fallback-проксі).

export const dynamic = 'force-static';

// Заморожено рішенням Ігоря 09.08.2026 (inventory-freeze-checkups.md).
// Старий Program Page, поза Типом 5/5a, ціни хардкоджені в lib/programs/data.ts.
const FROZEN_PROGRAM_PAGES = [
  '/ukr/female-checkup/first-checkup-under-30',
  '/ukr/female-checkup/first-checkup-30-40',
  '/ukr/female-checkup/first-checkup-40-50',
  '/ukr/female-checkup/first-checkup-over-50',
  '/ukr/female-checkup/regular-checkup-under-30',
  '/ukr/female-checkup/regular-checkup-30-40',
  '/ukr/female-checkup/regular-checkup-40-50',
  '/ukr/female-checkup/regular-checkup-over-50',
  '/ukr/male-checkup/first-checkup-under-30',
  '/ukr/male-checkup/first-checkup-30-40',
  '/ukr/male-checkup/first-checkup-40-50',
  '/ukr/male-checkup/first-checkup-over-50',
  '/ukr/male-checkup/regular-checkup-under-30',
  '/ukr/male-checkup/regular-checkup-30-40',
  '/ukr/male-checkup/regular-checkup-40-50',
  '/ukr/male-checkup/regular-checkup-over-50',
];

export function GET() {
  const lines = [
    'User-Agent: *',
    'Allow: /',
    ...FROZEN_PROGRAM_PAGES.map((p) => `Disallow: ${p}`),
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
