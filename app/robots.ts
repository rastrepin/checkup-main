import type { MetadataRoute } from 'next';

const BASE = 'https://check-up.in.ua';

// Заморожено рішенням Ігоря 09.08.2026 (inventory-freeze-checkups.md).
// Старий Program Page, поза Типом 5/5a, ціни хардкоджені в lib/programs/data.ts.
// Дублює noindex,nofollow у metadata кожної сторінки — тут для Disallow, який
// meta robots не забезпечує (пошуковик все одно може заходити на сторінку).
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

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: FROZEN_PROGRAM_PAGES,
    },
    sitemap: `${BASE}/sitemap.xml`,
  };
}
