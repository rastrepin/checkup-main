// Перелік сторінок Next.js для /sitemap-next.xml.
//
// Сюди потрапляють тільки індексовані сторінки, що реально існують у app/.
// Заглушки і noindex-сторінки (заморожені Program Page, Р39) сюди не входять.
// Перелік Tilda-сторінок живе у Tilda-sitemap і віддається через
// /sitemap-tilda.xml – тут його дублювати не потрібно.

export const SITE_URL = 'https://check-up.in.ua';

export type SitemapEntry = {
  path: string;
  changeFrequency: 'weekly' | 'monthly';
  priority: number;
};

export const NEXT_SITEMAP_ENTRIES: SitemapEntry[] = [
  // ── Харків (UA) ──
  { path: '/ukr/kharkiv', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/ukr/female-checkup/kharkiv', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/ukr/female-checkup/do-30-rokiv/kharkiv', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/ukr/female-checkup/40-50-rokiv/kharkiv', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/ukr/female-checkup/vid-50-rokiv/kharkiv', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/ukr/male-checkup/kharkiv', changeFrequency: 'weekly', priority: 0.8 },

  // ── Харків (RU) ──
  { path: '/kharkov', changeFrequency: 'weekly', priority: 0.8 },
];
