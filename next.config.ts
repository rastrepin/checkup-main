import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Проксі на Tilda під час міграції – ЄДИНИЙ механізм (рішення Р42, скасовує Р41).
  // Fallback rewrite спрацьовує лише коли роутер Next.js не знайшов жодного
  // збігу: жодна жива сторінка Next.js не може випадково піти на Tilda, а
  // "мігрована сторінка" = "page.tsx існує в гілці". Умова дії: в app/ немає
  // динамічних сегментів – це перевіряє scripts/check-routes.mjs на prebuild.
  // TILDA_ORIGIN (Р15) має бути задана в КОЖНОМУ оточенні Vercel, де проксі
  // потрібен (Preview і Production); без змінної rewrite не додається, і
  // немігровані шляхи віддають 404 Next.js.
  async rewrites() {
    if (!process.env.TILDA_ORIGIN) return { fallback: [] };
    return {
      fallback: [
        { source: '/:path*', destination: `${process.env.TILDA_ORIGIN}/:path*` },
      ],
    };
  },
  async redirects() {
    return [
      // Корінь: Tilda віддає / як 301 → /ukr (production, перевірено 06.09.2026).
      // Next.js повторює це сам, щоб поведінка головної не залежала від origin.
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
  },
};

export default nextConfig;
