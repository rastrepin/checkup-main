export const XML_HEADERS = {
  'Content-Type': 'application/xml; charset=utf-8',
  // Кеш на edge Vercel: година свіжості, доба stale-while-revalidate.
  'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
};

export function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function emptyUrlset(): string {
  return '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>\n';
}
