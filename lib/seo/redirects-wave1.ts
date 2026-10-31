import redirects from './redirects-wave1.json';
import { isApprovedRoute, normalizePath } from './approved-routes';

// 301 хвилі 1 міграції міст (SEO-MIGRATION v2.4, §3–4). Дані – lib/seo/redirects-wave1.json:
//   class 'thematic-no-traffic' – тематичні сторінки без трафіку (корпоративний, перевірка зору) → хаб міста;
//   class 'tproduct-program'    – картки програм Tilda в каталозі статі міста → вікова сторінка міста.
// match: 'path-and-children' – адреса і все під нею (товари тематичної сторінки йдуть разом з нею, SEO-MIGRATION §3);
//        'tproduct-id'       – картка товару Tilda за id «<частина каталогу>-<uid>» (хвіст-слаг Tilda може змінюватися).
// Правило АКТИВНЕ лише тоді, коли ціль є в lib/seo/approved-routes.json: до перемикання сторінки злиття в main
// нічого не змінює на домені (Tilda віддає джерело як зараз). Відкат – прибрати ціль з approved-routes.
// Один стрибок: ціль – сторінка Next.js (перевіряє scripts/check-routes.mjs), не джерело іншого правила, не адреса Tilda.
// Правила для next.config.ts будує той самий файл JSON (next.config.ts читає його напряму, як approved-routes.json).

export interface Wave1Redirect {
  source: string;
  destination: string;
  class: 'thematic-no-traffic' | 'tproduct-program';
  city: string;
  match: 'path-and-children' | 'tproduct-id';
  note?: string;
}

export const WAVE1_REDIRECTS: readonly Wave1Redirect[] = redirects as Wave1Redirect[];

export function activeWave1Redirects(): Wave1Redirect[] {
  return WAVE1_REDIRECTS.filter((r) => isApprovedRoute(r.destination));
}

/** «/ukr/female-checkup/uzhgorod/tproduct/959951761-815403394172-…» → префікс «…/tproduct/959951761-815403394172». */
export function tproductPrefix(source: string): string {
  const i = source.lastIndexOf('/');
  const id = source.slice(i + 1).match(/^\d+-\d+/)?.[0] ?? source.slice(i + 1);
  return `${source.slice(0, i)}/${id}`;
}

export function matchesRedirect(r: Wave1Redirect, pathname: string): boolean {
  const p = normalizePath(pathname);
  if (r.match === 'tproduct-id') {
    const prefix = tproductPrefix(r.source);
    return p === prefix || p.startsWith(`${prefix}-`);
  }
  return p === r.source || p.startsWith(`${r.source}/`);
}

/** Адреса, яку зараз забирає активний 301 хвилі 1: її не має бути в sitemap-tilda.xml і sitemap-store.xml. */
export function isActiveRedirectSource(pathname: string): boolean {
  return activeWave1Redirects().some((r) => matchesRedirect(r, pathname));
}
