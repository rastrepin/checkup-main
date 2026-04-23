import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

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

export const config = {
  matcher: ['/cases/:path*'],
};
