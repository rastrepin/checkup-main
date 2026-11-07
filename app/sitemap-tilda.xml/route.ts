import { filteredTildaSitemapResponse } from '@/lib/seo/tilda-sitemap';

// /sitemap-tilda.xml – Tilda-sitemap за мінусом погоджених сторінок Next.js
// (approved-routes.json) і джерел активних 301 хвилі 1 (redirects-wave1.json).
// Чернетки Next.js тут не віднімаються: на домені їх віддає Tilda.
// Origin – TILDA_ORIGIN (Р15); без змінної віддається порожній urlset,
// щоб індекс лишався валідним.

export const revalidate = 3600;

export function GET() {
  return filteredTildaSitemapResponse('/sitemap.xml', 'sitemap-tilda');
}
