import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const hostname = request.headers.get('host') || '';

  // Route onclinic.check-up.in.ua/* → /onclinic/*
  if (hostname.startsWith('onclinic.') || hostname === 'onclinic.check-up.in.ua') {
    const url = request.nextUrl.clone();
    // Avoid double-prefixing
    if (!url.pathname.startsWith('/onclinic')) {
      url.pathname = `/onclinic${url.pathname}`;
    }
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\.ico|sitemap\.xml|robots\.txt).*)'],
};
