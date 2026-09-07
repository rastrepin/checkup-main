import approved from './approved-routes.json';

// Погоджені сторінки Next.js – єдине місце, де вирішується, що бачить
// відвідувач check-up.in.ua з Next.js. Правило Ігоря 07.09.2026:
// усі URL, яких немає в цьому переліку, відкриває Tilda. Сторінка в app/
// без запису тут – чернетка: на домені її не існує, на прев'ю доступна
// лише з cookie next_drafts (див. middleware.ts, ?drafts=1).
//
// Редагувати lib/seo/approved-routes.json (масив шляхів, точний збіг, без
// trailing slash). Prebuild валить білд, якщо для шляху немає page.tsx.
// З переліку будуються /sitemap-next.xml і фільтр /sitemap-tilda.xml.

export const APPROVED_ROUTES: readonly string[] = approved as string[];

// Службові адреси, які завжди обслуговує Next.js незалежно від переліку.
export const SYSTEM_ROUTES: readonly string[] = [
  '/robots.txt',
  '/sitemap.xml',
  '/sitemap-next.xml',
  '/sitemap-tilda.xml',
];

export const SITE_URL = 'https://check-up.in.ua';

export function normalizePath(pathname: string): string {
  const p = pathname.replace(/\/+$/, '');
  return p === '' ? '/' : p;
}

const approvedSet = new Set(APPROVED_ROUTES.map(normalizePath));
const systemSet = new Set(SYSTEM_ROUTES);

export function isApprovedRoute(pathname: string): boolean {
  return approvedSet.has(normalizePath(pathname));
}

export function isSystemRoute(pathname: string): boolean {
  return systemSet.has(normalizePath(pathname));
}
