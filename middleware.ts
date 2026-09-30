import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isApprovedRoute, isSystemRoute } from '@/lib/seo/approved-routes';

// === Проксі на Tilda: allow-list погоджених сторінок (Р42) ===
// Правило: усі URL, яких немає в lib/seo/approved-routes.json, віддає Tilda
// (rewrite, не redirect – адреса в браузері не змінюється). Next.js
// обслуговує лише погоджені сторінки і службові адреси (robots, sitemap).
// Чернетки в app/ на домені не існують. Перегляд чернеток на прев'ю:
// ?drafts=1 ставить cookie next_drafts на 1 день, ?drafts=0 знімає.
// У production cookie ігнорується.
// Origin – TILDA_ORIGIN (Р15). Без змінної middleware пропускає запит далі,
// щоб не покласти сайт; prebuild не дає зібрати production без неї.

const DRAFTS_COOKIE = 'next_drafts';

function tildaRewrite(request: NextRequest): NextResponse | null {
  const origin = process.env.TILDA_ORIGIN?.replace(/\/$/, '');
  if (!origin) return null;
  const { pathname, search } = request.nextUrl;
  return NextResponse.rewrite(new URL(`${pathname}${search}`, `${origin}/`));
}

function draftsAllowed(request: NextRequest): boolean {
  if (process.env.VERCEL_ENV === 'production') return false;
  const q = request.nextUrl.searchParams.get('drafts');
  if (q === '1') return true;
  if (q === '0') return false;
  return request.cookies.get(DRAFTS_COOKIE)?.value === '1';
}

// Canonical city slugs for partners
const PARTNER_CITIES = ['kharkiv', 'rivne', 'vinnytsia', 'lviv'];

// Mapping from Vercel geo city names → canonical slug
// Vercel uses English transliteration of city names
const CITY_ALIASES: Record<string, string> = {
  // Kharkiv
  'kharkiv': 'kharkiv',
  'kharkov': 'kharkiv',
  'харків': 'kharkiv',
  // Rivne
  'rivne': 'rivne',
  'rівне': 'rivne',
  'rovno': 'rivne',
  // Vinnytsia
  'vinnytsia': 'vinnytsia',
  'vinnytsa': 'vinnytsia',
  'vinnitsa': 'vinnytsia',
  'вінниця': 'vinnytsia',
  // Lviv
  'lviv': 'lviv',
  'lvov': 'lviv',
  'львів': 'lviv',
};

function normalizeCityName(raw: string): string | null {
  const lower = raw.toLowerCase().trim();
  return CITY_ALIASES[lower] ?? null;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isSystemRoute(pathname) && !isApprovedRoute(pathname)) {
    if (!draftsAllowed(request)) {
      const proxied = tildaRewrite(request);
      if (proxied) {
        if (request.nextUrl.searchParams.get('drafts') === '0') {
          proxied.cookies.delete(DRAFTS_COOKIE);
        }
        return proxied;
      }
    }
  }

  const response = NextResponse.next();

  // Перемикач чернеток (?drafts=1 / ?drafts=0), лише поза production.
  const draftsParam = request.nextUrl.searchParams.get('drafts');
  if (draftsParam !== null && process.env.VERCEL_ENV !== 'production') {
    if (draftsParam === '1') {
      response.cookies.set(DRAFTS_COOKIE, '1', { path: '/', maxAge: 60 * 60 * 24, sameSite: 'lax' });
    } else {
      response.cookies.delete(DRAFTS_COOKIE);
    }
  }

  // Geo-cookie predefined_city – лише для /cases/* (як і до проксі).
  if (!pathname.startsWith('/cases')) {
    return response;
  }

  // Dev fallback — Vercel geo не працює на localhost
  if (process.env.NODE_ENV === 'development') {
    if (!request.cookies.get('predefined_city')) {
      response.cookies.set('predefined_city', 'kharkiv', {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 днів
        sameSite: 'lax',
      });
    }
    return response;
  }

  // Production: читаємо Vercel geo через headers (Next.js 15+)
  // Vercel встановлює x-vercel-ip-country та x-vercel-ip-city автоматично
  const country = request.headers.get('x-vercel-ip-country');
  const city = request.headers.get('x-vercel-ip-city');

  // Тільки Україна
  if (country !== 'UA' || !city) {
    return response;
  }

  // Якщо cookie вже є — не перезаписуємо
  if (request.cookies.get('predefined_city')) {
    return response;
  }

  const normalized = normalizeCityName(city);

  if (normalized) {
    response.cookies.set('predefined_city', normalized, {
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 днів
      sameSite: 'lax',
    });
  }

  return response;
}

// Matcher: увесь сайт, крім службових шляхів Next.js і /api. Статичні
// файли (favicon тощо) теж проходять через allow-list – якщо їх немає в
// переліку, вони віддаються з Tilda.
export const config = {
  matcher: ['/((?!_next/|api/).*)'],
};
