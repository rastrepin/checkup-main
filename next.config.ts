import type { NextConfig } from "next";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// Погоджені сторінки Next.js (Р42). Читається напряму з JSON, бо
// next.config.ts виконується поза бандлером застосунку.
const APPROVED: string[] = JSON.parse(
  readFileSync(join(process.cwd(), "lib/seo/approved-routes.json"), "utf8"),
);
const isApproved = (path: string) => APPROVED.includes(path.replace(/\/+$/, "") || "/");

const nextConfig: NextConfig = {
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

      // === Пріоритет 1: сторінки з трафіком ===

      // /onclinic/kharkov (257 кліків) → тимчасово на /ukr/kharkiv
      // TODO: change to onclinic.check-up.in.ua/kharkiv when subdomain is ready
      { source: '/onclinic/kharkov', destination: '/ukr/kharkiv', permanent: true },
      { source: '/onclinic/kharkov/:path*', destination: '/ukr/kharkiv', permanent: true },

      // /ukr/onclinic-kharkiv → тимчасово на /ukr/kharkiv
      // TODO: change to onclinic.check-up.in.ua/kharkiv when subdomain is ready
      { source: '/ukr/onclinic-kharkiv', destination: '/ukr/kharkiv', permanent: true },
      { source: '/ukr/onclinic-kharkiv/:path*', destination: '/ukr/kharkiv', permanent: true },

      // /blog/medcenter-doctor-kharkov (205 кліків)
      // TODO: change to onclinic.check-up.in.ua/kharkiv when subdomain is ready
      { source: '/blog/medcenter-doctor-kharkov', destination: '/ukr/kharkiv', permanent: true },

      // /doctor-kharkov (55 кліків)
      // TODO: change to onclinic.check-up.in.ua/kharkiv when subdomain is ready
      { source: '/doctor-kharkov', destination: '/ukr/kharkiv', permanent: true },

      // Спорт-чекап → загальна (76 кліків)
      { source: '/sport-checkup/kharkov', destination: '/kharkov', permanent: true },

      // Дитячий чекап → загальна (53 кліків)
      { source: '/child-checkup/kharkov', destination: '/kharkov', permanent: true },
      { source: '/ukr/child-checkup/kharkiv', destination: '/ukr/kharkiv', permanent: true },

      // === Пріоритет 2: лікарі → тимчасово на /ukr/kharkiv ===
      // TODO: change to onclinic.check-up.in.ua/kharkiv when subdomain is ready
      { source: '/ukr/doctors/kharkiv', destination: '/ukr/kharkiv', permanent: true },
      { source: '/ukr/doctors/kharkiv/:path*', destination: '/ukr/kharkiv', permanent: true },

      // === Пріоритет 3: решта onclinic paths ===
      // TODO: change to onclinic.check-up.in.ua/kharkiv when subdomain is ready
      { source: '/onclinic-kharkiv', destination: '/ukr/kharkiv', permanent: true },
      { source: '/onclinic-kharkiv/:path*', destination: '/ukr/kharkiv', permanent: true },

      // === Пріоритет 4: застарілі (0 кліків) ===
      { source: '/covid-19/testirovanie/kharkov', destination: '/kharkov', permanent: true },
      { source: '/covid-19/post-covid/kharkov', destination: '/kharkov', permanent: true },
      { source: '/beauty-checkup/kharkov', destination: '/kharkov', permanent: true },
      { source: '/corporate/kharkov', destination: '/kharkov', permanent: true },
      { source: '/clinics/kharkov', destination: '/kharkov', permanent: true },

      // Планування вагітності (тимчасово, 302 — не permanent)
      { source: '/akusherstvo/planirovanie-beremennosti/kharkov', destination: '/kharkov', permanent: false },

      // Перевірка зору → тимчасово на /ukr/kharkiv
      // TODO: change to onclinic.check-up.in.ua/kharkiv when subdomain is ready
      { source: '/ukr/perevirka-zoru/kharkiv', destination: '/ukr/kharkiv', permanent: true },
      { source: '/ukr/perevirka-zoru/kharkiv/:path*', destination: '/ukr/kharkiv', permanent: true },

      // Колоноскопія → тимчасово на /ukr/kharkiv
      // TODO: change to onclinic.check-up.in.ua/kharkiv when subdomain is ready
      { source: '/ukr/kolonoskopiya/kharkiv', destination: '/ukr/kharkiv', permanent: true },
      { source: '/ukr/kolonoskopiya/kharkiv/:path*', destination: '/ukr/kharkiv', permanent: true },
    ];
    return rules.filter((r) => r.destination === '/ukr' || isApproved(r.destination));
  },
};

export default nextConfig;
