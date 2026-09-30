import { isApprovedRoute } from '@/lib/seo/approved-routes';
import { XML_HEADERS, emptyUrlset } from '@/lib/seo/xml';

// /sitemap-tilda.xml – Tilda-sitemap за мінусом погоджених сторінок Next.js
// (approved-routes.json). Чернетки Next.js тут не віднімаються: на домені
// їх віддає Tilda.
// Origin – TILDA_ORIGIN (Р15); без змінної віддається порожній urlset,
// щоб індекс лишався валідним.

export const revalidate = 3600;

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
    return path && isApprovedRoute(path) ? '' : block;
  });

  return new Response(filtered, { headers: XML_HEADERS });
}
