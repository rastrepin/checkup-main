import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// === Fallback-проксі на старий Tilda-сайт під час міграції (dev/preview) ===
// Allow-list мігрованих на Next.js шляхів — єдине місце в проєкті, яке
// оновлюється в міру того, як нові сторінки переїжджають з Tilda.
// Шлях вважається мігрованим, якщо він точно дорівнює запису зі списку
// АБО є під ним (наприклад '/ukr/kharkiv/some-sub-path').
const MIGRATED_PATHS = [
  '/ukr/kharkiv',
  '/ukr/female-checkup/kharkiv',
  '/ukr/male-checkup/kharkiv',
];

function isMigratedPath(pathname: string): boolean {
  return MIGRATED_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
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
  const { pathname, search } = request.nextUrl;

  // Шлях не мігровано на Next.js — проксіюємо на старий Tilda-сайт.
  // Guard: якщо TILDA_ORIGIN_URL не задана в цьому environment, запит не
  // ламається — просто йде далі звичайним роутингом Next.js (той самий
  // підхід, що вже застосований у next.config.ts для fallback-rewrites).
  if (!isMigratedPath(pathname)) {
    const tildaOrigin = process.env.TILDA_ORIGIN_URL;
    if (tildaOrigin) {
      return NextResponse.rewrite(new URL(`${pathname}${search}`, tildaOrigin));
    }
  }

  const response = NextResponse.next();

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

// Матчер розширено з '/cases/:path*' на майже весь сайт (окрім _next,
// /api і статичних файлів) — це потрібно для Tilda-fallback вище, який має
// приймати рішення на кожному шляху, що не є /_next чи /api. Логіка
// geo-cookie (нижче) від цього не постраждала: вона не має власного
// path-фільтра і раніше просто не викликалась поза /cases/:path*.
export const config = {
  matcher: [
    '/((?!_next/|api/|favicon\\.ico|.*\\.(?:ico|png|jpg|jpeg|gif|webp|avif|svg|css|js|map|woff2?|ttf|eot|otf|txt|xml|json|webmanifest)$).*)',
  ],
};
