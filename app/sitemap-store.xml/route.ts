import { filteredTildaSitemapResponse } from '@/lib/seo/tilda-sitemap';

// /sitemap-store.xml – каталог товарів Tilda (картки tproduct) за мінусом погоджених сторінок Next.js і джерел
// активних 301 хвилі 1 (картки програм статі міста → вікові сторінки, SEO-MIGRATION §4).
// Next.js обслуговує цю адресу ЛИШЕ коли є хоч один активний 301 хвилі 1 (middleware.ts); доти її, як і раніше,
// віддає Tilda через проксі без змін.

export const revalidate = 3600;

export function GET() {
  return filteredTildaSitemapResponse('/sitemap-store.xml', 'sitemap-store');
}
