// Меню шапки сайту – docs/HEADER-SPEC.md v1.0, розділи 2, 3 і 8.
// Підписи й адреси – дослівно як у шапці Tilda на хабі міста: /ukr/kharkiv (знято 30.09.2026);
// /ukr/dnipro, /ukr/odesa, /ukr/uzhgorod – зі знімків Tilda 01.11.2026 (checkup-platform, docs/kb/snapshots/2026-11-01).
// Склад і порядок пунктів у кожного міста свій, як на Tilda.
// Нове місто – новий запис у HEADER_NAV; розмітка components/shared/SiteHeader.tsx не змінюється.
// Рішення Координатора 01.10.2026: «Для корпоративних клієнтів» веде на одеську сторінку, як на Tilda;
// Telegram-бот і Viber у шапку не переносяться.

/** Слаг міста. Меню є лише для міст з HEADER_NAV; для інших шапка – варіант без міста. */
export type HeaderCity = string;

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

const ABOUT_TEAM: HeaderLink = { label: 'Про команду', href: '/ukr/about' };
const ABOUT_CLINICS: HeaderLink = { label: 'Співпраця з клініками', href: '/ukr/proposal-for-clinics' };

const ABOUT: HeaderItem = {
  label: 'Про сервіс',
  children: [
    ABOUT_TEAM,
    { label: 'Для корпоративних клієнтів', href: '/ukr/corporate/health-checkup/odesa' },
    ABOUT_CLINICS,
  ],
};

/** Міський варіант: повне меню, логотип веде на хаб міста. */
export const HEADER_NAV: Record<string, HeaderNav> = {
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
  dnipro: {
    logoHref: '/ukr/dnipro',
    items: [
      { label: 'Чоловікам', href: '/ukr/male-checkup/dnipro', section: 'male' },
      { label: 'Жінкам', href: '/ukr/female-checkup/dnipro', section: 'female' },
      { label: 'Дітям', href: '/ukr/child-checkup/dnipro' },
      {
        label: 'Спеціалізовані',
        children: [
          { label: 'Планування вагітності', href: '/ukr/materynstvo/planuvannya-vahitnosti/dnipro' },
          { label: 'Колоноскопія', href: '/ukr/kolonoskopiya/dnipro' },
        ],
      },
      { label: 'Сертифікат', href: '/ukr/podarunok/dnipro' },
      { label: 'Лікарі', href: '/ukr/doctors/dnipro' },
      {
        label: 'Про сервіс',
        children: [
          ABOUT_TEAM,
          { label: 'Для корпоративних клієнтів', href: '/ukr/corporate/health-checkup/dnipro' },
          ABOUT_CLINICS,
          { label: 'Чек-ап в Турції', href: 'https://check-up.in.ua/turkey' },
        ],
      },
    ],
  },
  odesa: {
    logoHref: '/ukr/odesa',
    items: [
      { label: 'Чоловікам', href: '/ukr/male-checkup/odesa', section: 'male' },
      { label: 'Жінкам', href: '/ukr/female-checkup/odesa', section: 'female' },
      {
        label: 'Спеціалізовані',
        children: [
          { label: 'Планування вагітності', href: '/ukr/akusherstvo/planirovanie-beremennosti/odesa' },
          { label: 'Колоноскопія', href: '/ukr/kolonoskopiya/odesa' },
          { label: 'Чек-ап в Турції', href: 'https://abroad.check-up.in.ua/' },
        ],
      },
      { label: 'Лікарі', href: '/ukr/doctors/odesa' },
      { label: 'Сертифікат', href: '/ukr/podarunok/odesa' },
      {
        label: 'Про сервіс',
        children: [
          ABOUT_TEAM,
          { label: 'Для корпоративних клієнтів', href: '/ukr/corporate/health-checkup/odesa' },
          ABOUT_CLINICS,
        ],
      },
    ],
  },
  uzhgorod: {
    logoHref: '/ukr/uzhgorod',
    items: [
      { label: 'Чоловікам', href: '/ukr/male-checkup/uzhgorod', section: 'male' },
      { label: 'Жінкам', href: '/ukr/female-checkup/uzhgorod', section: 'female' },
      { label: 'Дітям', href: '/ukr/child-checkup/uzhgorod' },
      { label: 'Сертифікат', href: '/ukr/podarunok/uzhgorod' },
      { label: 'Лікарі', href: '/ukr/doctors/uzhgorod' },
      { label: 'Про сервіс', children: [ABOUT_TEAM, ABOUT_CLINICS] },
    ],
  },
};

/** Варіант без міста (сторінки /ukr/screening/...): лише «Про сервіс», логотип веде на /ukr. */
export const HEADER_NAV_NO_CITY: HeaderNav = {
  logoHref: '/ukr',
  items: [ABOUT],
};

export function headerNav(city: HeaderCity | null): HeaderNav {
  return (city && HEADER_NAV[city]) || HEADER_NAV_NO_CITY;
}
