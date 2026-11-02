// Меню шапки сайту – docs/HEADER-SPEC.md v1.0, розділи 2, 3 і 8.
// Підписи й адреси – дослівно як у шапці Tilda на хабі міста: /ukr/kharkiv (знято 30.09.2026);
// /ukr/dnipro, /ukr/odesa, /ukr/uzhgorod – зі знімків Tilda 01.11.2026 (checkup-platform, docs/kb/snapshots/2026-11-01).
// Склад і порядок пунктів у кожного міста свій, як на Tilda.
// Нове місто – новий запис у HEADER_NAV; розмітка components/shared/SiteHeader.tsx не змінюється.
// Рішення Координатора 01.10.2026: «Для корпоративних клієнтів» веде на одеську сторінку, як на Tilda;
// Telegram-бот і Viber у шапку не переносяться.
// Рішення Ігоря 07.11.2026: «Сертифікат» прибрано звідусіль; «Дітям» – прибрано в хвилі 1 (додамо пізніше);
// «Спеціалізовані» (планування вагітності, колоноскопія) – друга хвиля.

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
      { label: 'Лікарі', href: '/ukr/doctors/kharkiv' },
      ABOUT,
    ],
  },
  dnipro: {
    logoHref: '/ukr/dnipro',
    items: [
      { label: 'Чоловікам', href: '/ukr/male-checkup/dnipro', section: 'male' },
      { label: 'Жінкам', href: '/ukr/female-checkup/dnipro', section: 'female' },
      { label: 'Лікарі', href: '/ukr/doctors/dnipro' },
      {
        label: 'Про сервіс',
        children: [
          ABOUT_TEAM,
          { label: 'Для корпоративних клієнтів', href: '/ukr/corporate/health-checkup/dnipro' },
          ABOUT_CLINICS,
        ],
      },
    ],
  },
  odesa: {
    logoHref: '/ukr/odesa',
    items: [
      { label: 'Чоловікам', href: '/ukr/male-checkup/odesa', section: 'male' },
      { label: 'Жінкам', href: '/ukr/female-checkup/odesa', section: 'female' },
      { label: 'Лікарі', href: '/ukr/doctors/odesa' },
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
      { label: 'Лікарі', href: '/ukr/doctors/uzhgorod' },
      { label: 'Про сервіс', children: [ABOUT_TEAM, ABOUT_CLINICS] },
    ],
  },
  // Рівне – зі сторінки Tilda /ukr/rivne (02.11.2026). «Чек-ап в Турції» з «Про сервіс» не перенесено,
  // як у Дніпрі й Одесі (рішення Ігоря 01.11.2026).
  rivne: {
    logoHref: '/ukr/rivne',
    items: [
      { label: 'Чоловікам', href: '/ukr/male-checkup/rivne', section: 'male' },
      { label: 'Жінкам', href: '/ukr/female-checkup/rivne', section: 'female' },
      { label: 'Дітям', href: '/ukr/child-checkup/rivne' },
      { label: 'Лікарі', href: '/ukr/doctors/rivne' },
      {
        label: 'Про сервіс',
        children: [
          ABOUT_TEAM,
          { label: 'Для корпоративних клієнтів', href: '/ukr/corporate/health-checkup/kiev' },
          ABOUT_CLINICS,
        ],
      },
    ],
  },
  // Полтава – зі сторінки Tilda /ukr/poltava (02.11.2026). «Для корпоративних клієнтів» на Tilda веде на
  // /ukr/corporate/health-checkup/poltava (404) – тут загальний пункт ABOUT (одеська сторінка, як у Харкові).
  // «Чек-ап в Турції» не перенесено, як у Дніпрі й Одесі.
  poltava: {
    logoHref: '/ukr/poltava',
    items: [
      { label: 'Чоловікам', href: '/ukr/male-checkup/poltava', section: 'male' },
      { label: 'Жінкам', href: '/ukr/female-checkup/poltava', section: 'female' },
      { label: 'Дітям', href: '/ukr/child-checkup/poltava' },
      {
        label: 'Спеціалізовані',
        children: [
          { label: 'Планування вагітності', href: '/ukr/akusherstvo/planirovanie-beremennosti/poltava' },
          { label: 'Колоноскопія', href: '/ukr/kolonoskopiya/poltava' },
        ],
      },
      { label: 'Лікарі', href: '/ukr/doctors/poltava' },
      { label: 'Сертифікат', href: '/ukr/podarunok/poltava' },
      ABOUT,
    ],
  },
  // Черкаси – зі сторінки Tilda /ukr/cherkasy (02.11.2026).
  cherkasy: {
    logoHref: '/ukr/cherkasy',
    items: [
      { label: 'Чоловікам', href: '/ukr/male-checkup/cherkasy', section: 'male' },
      { label: 'Жінкам', href: '/ukr/female-checkup/cherkasy', section: 'female' },
      {
        label: 'Про сервіс',
        children: [
          ABOUT_TEAM,
          { label: 'Для корпоративних клієнтів', href: '/ukr/corporate/health-checkup' },
          ABOUT_CLINICS,
          { label: 'Подарунковий сертифікат', href: '/ukr/gift-certificate' },
        ],
      },
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
