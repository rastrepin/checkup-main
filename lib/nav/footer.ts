// Футер сайту – docs/HEADER-SPEC.md v1.2, розділ 10 (ui-kit v1.9 §6.7, компонент components/frame/Footer).
// Склад колонок – 10.1; що з футера Tilda не переноситься – 10.2 (телефони, месенджери, соцмережі, сертифікат,
// корпоративні, діти, Туреччина, скринінги).
// Підписи «Про сервіс» і «Лікарі» – ті самі, що в шапці (lib/nav/header.ts): одне поняття – один підпис.
// Нове місто – запис у lib/cities/checkup-cities.ts і lib/nav/header.ts; розмітка футера не змінюється.

import type { FooterColumn } from '@/components/frame/Footer';
import { CHECKUP_CITIES, type CheckupCity } from '@/lib/cities/checkup-cities';
import { APPROVED_ROUTES } from '@/lib/seo/approved-routes';
import { HEADER_NAV, headerNav } from '@/lib/nav/header';

export const FOOTER_DISCLAIMER = 'Інформаційний матеріал – не замінює консультацію лікаря.';

/** Рік з дати збірки (10.1: «© {поточний рік} Check-Up Центр»). */
export const FOOTER_BOTTOM = `© ${new Date().getFullYear()} Check-Up Центр`;

const PROGRAMS_TITLE = 'Програми check-up';

const ABOUT: FooterColumn = {
  title: 'Про сервіс',
  links: [
    { label: 'Про команду', href: '/ukr/about' },
    { label: 'Співпраця з клініками', href: '/ukr/proposal-for-clinics' },
    { label: 'Політика конфіденційності', href: '/ukr/policy' },
  ],
};

const CONTACTS: FooterColumn = {
  title: 'Контакти',
  links: [{ label: 'info@check-up.in.ua', href: 'mailto:info@check-up.in.ua' }],
};

/** Міста, хаб яких віддає Next.js (approved-routes), у порядку конфігу міст. */
function approvedHubCities(): CheckupCity[] {
  const routes = new Set(APPROVED_ROUTES);
  return Object.values(CHECKUP_CITIES).filter((c) => routes.has(`/ukr/${c.slug}`));
}

function cityPrograms(city: CheckupCity): FooterColumn {
  const doctors = `/ukr/doctors/${city.slug}`;
  // «Лікарі» – лише якщо пункт є в меню шапки міста (у Черкасах його немає).
  const hasDoctors = HEADER_NAV[city.slug]?.items.some((i) => i.href === doctors) ?? false;
  return {
    title: PROGRAMS_TITLE,
    links: [
      { label: `Check-up ${city.inCity}`, href: `/ukr/${city.slug}` },
      { label: `Check-up для жінок ${city.inCity}`, href: `/ukr/female-checkup/${city.slug}` },
      { label: `Check-up для чоловіків ${city.inCity}`, href: `/ukr/male-checkup/${city.slug}` },
      ...(hasDoctors ? [{ label: 'Лікарі', href: doctors }] : []),
    ],
  };
}

function noCityPrograms(): FooterColumn {
  return {
    title: PROGRAMS_TITLE,
    links: approvedHubCities().map((c) => ({ label: `Check-up ${c.inCity}`, href: `/ukr/${c.slug}` })),
  };
}

export interface FooterNav {
  /** Куди веде логотип – туди ж, куди логотип шапки. */
  logoHref: string;
  columns: FooterColumn[];
}

/** city – слаг міста або null (варіант без міста: скринінги, хаб пролапсу). */
export function footerNav(city: string | null): FooterNav {
  const c = city ? CHECKUP_CITIES[city] : undefined;
  return {
    logoHref: headerNav(city).logoHref,
    columns: [c ? cityPrograms(c) : noCityPrograms(), ABOUT, CONTACTS],
  };
}
