// Меню шапки сайту – docs/HEADER-SPEC.md v1.0, розділи 2, 3 і 8.
// Підписи й адреси – дослівно як у шапці Tilda на /ukr/kharkiv (знято 30.09.2026).
// Нове місто – новий запис у HEADER_NAV; розмітка components/shared/SiteHeader.tsx не змінюється.
// Рішення Координатора 01.10.2026: «Для корпоративних клієнтів» веде на одеську сторінку, як на Tilda;
// Telegram-бот і Viber у шапку не переносяться.

export type HeaderCity = 'kharkiv';

/** Розділ сайту, до якого належить сторінка: відповідний пункт меню отримує aria-current="page". */
export type HeaderSection = 'female' | 'male';

export interface HeaderLink {
  label: string;
  href: string;
}

export interface HeaderItem {
  label: string;
  /** Пункт-посилання. */
  href?: string;
  /** Пункт з підменю. */
  children?: HeaderLink[];
  /** Пункт позначається активним на сторінках цього розділу. */
  section?: HeaderSection;
}

export interface HeaderNav {
  /** Куди веде логотип. */
  logoHref: string;
  items: HeaderItem[];
}

const ABOUT: HeaderItem = {
  label: 'Про сервіс',
  children: [
    { label: 'Про команду', href: '/ukr/about' },
    { label: 'Для корпоративних клієнтів', href: '/ukr/corporate/health-checkup/odesa' },
    { label: 'Співпраця з клініками', href: '/ukr/proposal-for-clinics' },
  ],
};

/** Міський варіант: повне меню, логотип веде на хаб міста. */
export const HEADER_NAV: Record<HeaderCity, HeaderNav> = {
  kharkiv: {
    logoHref: '/ukr/kharkiv',
    items: [
      { label: 'Чоловікам', href: '/ukr/male-checkup/kharkiv', section: 'male' },
      { label: 'Жінкам', href: '/ukr/female-checkup/kharkiv', section: 'female' },
      { label: 'Дітям', href: '/ukr/child-checkup/kharkiv' },
      {
        label: 'Спеціалізовані',
        children: [
          { label: 'Планування вагітності', href: '/ukr/materynstvo/planuvannya-vahitnosti/kharkiv' },
          { label: 'Колоноскопія', href: '/ukr/kolonoskopiya/kharkiv' },
        ],
      },
      { label: 'Лікарі', href: '/ukr/doctors/kharkiv' },
      { label: 'Сертифікат', href: '/ukr/podarunok/kharkiv' },
      ABOUT,
    ],
  },
};

/** Варіант без міста (сторінки /ukr/screening/...): лише «Про сервіс», логотип веде на /ukr. */
export const HEADER_NAV_NO_CITY: HeaderNav = {
  logoHref: '/ukr',
  items: [ABOUT],
};

export function headerNav(city: HeaderCity | null): HeaderNav {
  return city ? HEADER_NAV[city] : HEADER_NAV_NO_CITY;
}
