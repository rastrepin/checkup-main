import type { NextConfig } from "next";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// Погоджені сторінки Next.js (Р42). Читається напряму з JSON, бо
// next.config.ts виконується поза бандлером застосунку.
const APPROVED: string[] = JSON.parse(
  readFileSync(join(process.cwd(), "lib/seo/approved-routes.json"), "utf8"),
);
const isApproved = (path: string) => APPROVED.includes(path.replace(/\/+$/, "") || "/");

// 301 хвилі 1 міграції міст (SEO-MIGRATION v2.4 §3–4): дані – lib/seo/redirects-wave1.json, логіка збігу – та сама,
// що в lib/seo/redirects-wave1.ts (sitemap-фільтр). Правило активне лише коли ціль погоджена (approved-routes.json).
type Wave1Redirect = { source: string; destination: string; match: "path-and-children" | "path" | "tproduct-id" };
const WAVE1: Wave1Redirect[] = JSON.parse(
  readFileSync(join(process.cwd(), "lib/seo/redirects-wave1.json"), "utf8"),
);

function wave1Rules() {
  return WAVE1.filter((r) => isApproved(r.destination)).flatMap((r) => {
    if (r.match === "tproduct-id") {
      // Картка товару Tilda: «<каталог>/tproduct/<id>-<uid>[-<слаг>]» – збіг за id, слаг Tilda може змінюватися.
      const i = r.source.lastIndexOf("/");
      const dir = r.source.slice(0, i);
      const id = r.source.slice(i + 1).match(/^\d+-\d+/)?.[0] ?? r.source.slice(i + 1);
      return [{ source: `${dir}/:p(${id}(?:-.*)?)`, destination: r.destination, permanent: true }];
    }
    if (r.match === "path") return [{ source: r.source, destination: r.destination, permanent: true }];
    // Тематична сторінка разом із товарами під нею (SEO-MIGRATION §3).
    return [
      { source: r.source, destination: r.destination, permanent: true },
      { source: `${r.source}/:path*`, destination: r.destination, permanent: true },
    ];
  });
}

// Вимкнені правила (хвиля 1, 01.11.2026). Поки /ukr/kharkiv не був погоджений, вони не діяли; з погодженням хабу
// Харкова вони б увімкнулися і суперечили SEO-MIGRATION v2.4 §3: сторінки клінік і лікарів, тематичні сторінки з
// трафіком (колоноскопія, дитячий чекап – на них веде блок «Інші послуги» хабу) і RU-сторінки не чіпаємо; посилання
// «Сторінка клініки →» (/ukr/onclinic-kharkiv) інакше вело б назад на хаб. Перевірка зору Харкова – тепер у
// redirects-wave1.json. Повернути – лише рішенням власника, з ціллю – субдоменом клініки.
//
// const LEGACY_DISABLED = [
    //  // === Пріоритет 1: сторінки з трафіком ===

    //  // /onclinic/kharkov (257 кліків) → тимчасово на /ukr/kharkiv
    //  // TODO: change to onclinic.check-up.in.ua/kharkiv when subdomain is ready
    //  { source: '/onclinic/kharkov', destination: '/ukr/kharkiv', permanent: true },
    //  { source: '/onclinic/kharkov/:path*', destination: '/ukr/kharkiv', permanent: true },

    //  // /ukr/onclinic-kharkiv → тимчасово на /ukr/kharkiv
    //  // TODO: change to onclinic.check-up.in.ua/kharkiv when subdomain is ready
    //  { source: '/ukr/onclinic-kharkiv', destination: '/ukr/kharkiv', permanent: true },
    //  { source: '/ukr/onclinic-kharkiv/:path*', destination: '/ukr/kharkiv', permanent: true },

    //  // /blog/medcenter-doctor-kharkov (205 кліків)
    //  // TODO: change to onclinic.check-up.in.ua/kharkiv when subdomain is ready
    //  { source: '/blog/medcenter-doctor-kharkov', destination: '/ukr/kharkiv', permanent: true },

    //  // /doctor-kharkov (55 кліків)
    //  // TODO: change to onclinic.check-up.in.ua/kharkiv when subdomain is ready
    //  { source: '/doctor-kharkov', destination: '/ukr/kharkiv', permanent: true },

    //  { source: '/ukr/child-checkup/kharkiv', destination: '/ukr/kharkiv', permanent: true },
    //  // === Пріоритет 2: лікарі → тимчасово на /ukr/kharkiv ===
    //  // TODO: change to onclinic.check-up.in.ua/kharkiv when subdomain is ready
    //  { source: '/ukr/doctors/kharkiv', destination: '/ukr/kharkiv', permanent: true },
    //  { source: '/ukr/doctors/kharkiv/:path*', destination: '/ukr/kharkiv', permanent: true },

    //  // === Пріоритет 3: решта onclinic paths ===
    //  // TODO: change to onclinic.check-up.in.ua/kharkiv when subdomain is ready
    //  { source: '/onclinic-kharkiv', destination: '/ukr/kharkiv', permanent: true },
    //  { source: '/onclinic-kharkiv/:path*', destination: '/ukr/kharkiv', permanent: true },

    //  // Перевірка зору → тимчасово на /ukr/kharkiv
    //  // TODO: change to onclinic.check-up.in.ua/kharkiv when subdomain is ready
    //  { source: '/ukr/perevirka-zoru/kharkiv', destination: '/ukr/kharkiv', permanent: true },
    //  { source: '/ukr/perevirka-zoru/kharkiv/:path*', destination: '/ukr/kharkiv', permanent: true },

    //  // Колоноскопія → тимчасово на /ukr/kharkiv
    //  // TODO: change to onclinic.check-up.in.ua/kharkiv when subdomain is ready
    //  { source: '/ukr/kolonoskopiya/kharkiv', destination: '/ukr/kharkiv', permanent: true },
    //  { source: '/ukr/kolonoskopiya/kharkiv/:path*', destination: '/ukr/kharkiv', permanent: true },
// ];

const nextConfig: NextConfig = {
  // Необов'язкові блоки сторінок міста читаються з content/ під час рендеру (lib/content/city-md.ts);
  // при ревалідації (ISR) файли мають бути в серверній збірці.
  outputFileTracingIncludes: {
    '/ukr/*': ['./content/kharkiv/*.md', './content/city-template/*.md'],
  },
  // Проксі на Tilda під час міграції живе в middleware.ts (allow-list
  // lib/seo/approved-routes.json, рішення Р42). Fallback rewrites тут свідомо
  // немає: він віддавав би з Next.js будь-яку сторінку, що є в репо,
  // включно з чернетками.
  // Редиректи вмикаються лише коли їхня ціль – погоджена сторінка Next.js.
  // Поки ціль не погоджена, джерело (жива сторінка Tilda) віддається з Tilda
  // без змін – за правилом "усе, чого нема в переліку, відкриває Tilda".
  // Виняток – корінь: Tilda сама віддає / як 301 → /ukr (production,
  // перевірено 06.09.2026), Next.js повторює це, щоб прев'ю не стрибало
  // на production-домен.
  async redirects() {
    const rules = [
      { source: '/', destination: '/ukr', permanent: true },

      // Спорт-чекап → загальна (76 кліків)
      { source: '/sport-checkup/kharkov', destination: '/kharkov', permanent: true },

      // Дитячий чекап → загальна (53 кліків)
      { source: '/child-checkup/kharkov', destination: '/kharkov', permanent: true },

      // === Пріоритет 4: застарілі (0 кліків) ===
      { source: '/covid-19/testirovanie/kharkov', destination: '/kharkov', permanent: true },
      { source: '/covid-19/post-covid/kharkov', destination: '/kharkov', permanent: true },
      { source: '/beauty-checkup/kharkov', destination: '/kharkov', permanent: true },
      { source: '/corporate/kharkov', destination: '/kharkov', permanent: true },
      { source: '/clinics/kharkov', destination: '/kharkov', permanent: true },

      // Планування вагітності (тимчасово, 302 — не permanent)
      { source: '/akusherstvo/planirovanie-beremennosti/kharkov', destination: '/kharkov', permanent: false },
    ];
    return [
      ...rules.filter((r) => r.destination === '/ukr' || isApproved(r.destination)),
      ...wave1Rules(),
    ];
  },
};

export default nextConfig;
