import { isApprovedRoute } from '@/lib/seo/approved-routes';
import { isActiveRedirectSource } from '@/lib/seo/redirects-wave1';
import { XML_HEADERS, emptyUrlset } from '@/lib/seo/xml';

// Спільний фільтр Tilda-sitemap (/sitemap-tilda.xml і /sitemap-store.xml): з XML Tilda прибираються <url>-блоки,
// чий <loc> тепер обслуговує Next.js (approved-routes.json) або забирає активний 301 хвилі 1 (redirects-wave1.json).
// Origin – TILDA_ORIGIN (Р15); без змінної або при помилці Tilda віддається порожній urlset, щоб індекс лишався валідним.

function pathOf(loc: string): string | null {
  try {
    const p = new URL(loc.trim()).pathname.replace(/\/$/, '');
    return p === '' ? '/' : p;
  } catch {
    return null;
  }
}

export function filterTildaSitemap(xml: string): string {
  return xml.replace(/<url>[\s\S]*?<\/url>\s*/g, (block) => {
    const loc = block.match(/<loc>([^<]+)<\/loc>/)?.[1];
    const path = loc ? pathOf(loc) : null;
    return path && (isApprovedRoute(path) || isActiveRedirectSource(path)) ? '' : block;
  });
}

/** Тягне `${TILDA_ORIGIN}${tildaPath}` і віддає відфільтрований XML. */
export async function filteredTildaSitemapResponse(tildaPath: string, logTag: string): Promise<Response> {
  const origin = process.env.TILDA_ORIGIN?.replace(/\/$/, '');
  if (!origin) return new Response(emptyUrlset(), { headers: XML_HEADERS });

  let xml: string;
  try {
    const res = await fetch(`${origin}${tildaPath}`, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) throw new Error(`Tilda ${tildaPath} HTTP ${res.status}`);
    xml = await res.text();
  } catch (err) {
    console.error(`[${logTag}] недоступний Tilda-sitemap:`, err);
    return new Response(emptyUrlset(), { headers: XML_HEADERS });
  }
  return new Response(filterTildaSitemap(xml), { headers: XML_HEADERS });
}
