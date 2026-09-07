import nextRoutes from '@/lib/seo/next-routes.generated.json';
import { XML_HEADERS, emptyUrlset } from '@/lib/seo/xml';

// /sitemap-tilda.xml – Tilda-sitemap за мінусом шляхів, які вже обслуговує
// Next.js (перелік генерує scripts/check-routes.mjs на prebuild).
// Origin – TILDA_ORIGIN (Р15); без змінної віддається порожній urlset,
// щоб індекс лишався валідним.

export const revalidate = 3600;

const NEXT_PATHS = new Set<string>(nextRoutes as string[]);

function pathOf(loc: string): string | null {
  try {
    const p = new URL(loc.trim()).pathname.replace(/\/$/, '');
    return p === '' ? '/' : p;
  } catch {
    return null;
  }
}

export async function GET() {
  const origin = process.env.TILDA_ORIGIN?.replace(/\/$/, '');
  if (!origin) {
    return new Response(emptyUrlset(), { headers: XML_HEADERS });
  }

  let xml: string;
  try {
    const res = await fetch(`${origin}/sitemap.xml`, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) throw new Error(`Tilda sitemap HTTP ${res.status}`);
    xml = await res.text();
  } catch (err) {
    console.error('[sitemap-tilda] недоступний Tilda-sitemap:', err);
    return new Response(emptyUrlset(), { headers: XML_HEADERS });
  }

  // Прибираємо <url>-блоки, чий <loc> тепер обслуговує Next.js.
  const filtered = xml.replace(/<url>[\s\S]*?<\/url>\s*/g, (block) => {
    const loc = block.match(/<loc>([^<]+)<\/loc>/)?.[1];
    const path = loc ? pathOf(loc) : null;
    return path && NEXT_PATHS.has(path) ? '' : block;
  });

  return new Response(filtered, { headers: XML_HEADERS });
}
