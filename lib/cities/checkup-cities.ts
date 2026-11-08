// Міста вікових сторінок чекапу (тип 5a) – конвеєр міграції сторінок з Tilda, 30.10.2026.
// Шаблон кожної вікової сторінки – app/ukr/{female,male}-checkup/{вік}/city-page.tsx; сторінка міста –
// тонка обгортка {вік}/{slug}/page.tsx (буквальна папка, як вимагає scripts/check-routes.mjs).
// Програми, ціни і філії шаблон бере з Supabase за clinicSlug.
// Сторінки типу 5 (хаб міста /ukr/{slug}, «Жінкам» /ukr/female-checkup/{slug}, «Чоловікам» /ukr/male-checkup/{slug})
// зібрано так само: шаблони app/ukr/city-page.tsx, app/ukr/{female,male}-checkup/city-page.tsx + тонкі обгортки (31.10.2026).
// Нове місто: запис у CHECKUP_CITIES → node scripts/cities/new-city-pages.mjs {slug} → меню шапки в
// lib/nav/header.ts → перевірка на прев'ю (?drafts=1) → адреси в lib/seo/approved-routes.json
// (останнє вмикає сторінки на домені, тому лише після погодження).

export interface CityReviewer {
  name: string;
  jobTitle: string;
  org: string;
  category: string;
  experience: string;
  reviewDate: string;
}

/** Клініка-партнер міста для хабу і сторінок статі (тип 5). Порядок у масиві – порядок показу
 *  (PLATFORM-LINE 2.2: з конфігурації, не за алфавітом і не за ціною). Назва, філії, графік, ліцензія – з бази. */
export interface CityClinic {
  /** clinics.slug. Клініки може ще не бути в базі – тоді її картка, рядок GEO і ціна не рендеряться. */
  slug: string;
  /** Сторінка клініки на Tilda – запасне посилання «Сторінка клініки →», коли в базі немає clinics.website
   *  (субдомену). Ці сторінки лишаються на Tilda (SEO-MIGRATION §0, §6). */
  tildaPath: string;
  /** Коротка назва клініки в текстах хабу міста ({clinic}, {clinic_names}, {clinic_links}), у картці і GEO хабу:
   *  «ОН Клінік», «Кредоклінік» (CITY-HUB-TEXTS v1.9, рішення 21). clinics.name у базі не змінюється. */
  shortName: string;
}

/** Тематичні сторінки міста, що лишаються на Tilda, – блок «Інші послуги в {city_loc}» хабу міста
 *  (CITY-HUB-TEXTS §7, SEO-MIGRATION §6). Ключ – послуга (анкор у content/city-template/city.md), значення – адреса.
 *  Послуги, якої в місті немає, у записі немає. Порожній запис – блоку на хабі немає.
 *  Рішення Ігоря 07.11.2026: у хвилі 1 блок порожній – дитячий чекап додамо пізніше, колоноскопія і
 *  планування вагітності – друга хвиля, сертифікат прибрано. */
export type OtherServiceKey = 'kolonoskopiya' | 'planuvannya-vahitnosti' | 'child-checkup';

export interface CheckupCity {
  /** Слаг у URL: /ukr/female-checkup/do-30-rokiv/{slug}. */
  slug: string;
  /** Назва в називному відмінку: «Харків» (крихти, «Чоловічий чекап · Харків»). */
  name: string;
  /** Місцевий відмінок без прийменника: «Харкові». Прийменник «в»/«у» лишається в тексті сторінки. */
  loc: string;
  /** Місцевий відмінок з прийменником для позиції після приголосного: «у Харкові», «в Одесі»
   *  (CITY-HUB-TEXTS v1.9, плейсхолдер {in_city}; {In_city} – те саме з великої літери). */
  inCity: string;
  /** clinics.slug клініки, програми якої показують вікові сторінки (одна клініка на вікову сторінку). */
  clinicSlug: string;
  /** Клініки вікових сторінок у порядку показу, коли їх кілька (перша – clinicSlug). Немає – лише clinicSlug. */
  ageClinicSlugs?: string[];
  /** Клініки-партнери міста для хабу і сторінок статі в порядку показу. Одна – варіант А, кілька – варіант Б
   *  (CITY-HUB-TEXTS: Ужгород – Б). */
  clinics: CityClinic[];
  /** «Інші послуги» хабу: адреси тематичних сторінок міста на Tilda (CITY-HUB-TEXTS §7). */
  otherServices: Partial<Record<OtherServiceKey, string>>;
  /** Медичний рецензент жіночих сторінок міста (лікар клініки міста). null – рецензента немає:
   *  блок «Медичний рецензент» і reviewedBy у JSON-LD не рендеряться (як на скринінгових сторінках). */
  reviewer: CityReviewer | null;
  /** Папка content/ з текстами хабу і сторінок статі (city.md, female-checkup.md, male-checkup.md).
   *  Хвиля 1 (Харків, Дніпро, Одеса, Ужгород) – 'city-template': тексти хабу міста – CITY-HUB-TEXTS v1.9 дослівно,
   *  з плейсхолдерами. Старі v0-тексти Харкова в content/kharkiv/ шаблони більше не читають. */
  contentDir: 'city-template';
  /** Слаг російськомовних сторінок Tilda («kharkov» → /kharkov). Довідково: hreflang у хвилі 1 не виводиться
   *  (SEO-MIGRATION §4), RU-сторінки не змінюються (рішення 1А). */
  ruSlug: string | null;
}

export const CHECKUP_CITIES: Record<string, CheckupCity> = {
  kharkiv: {
    slug: 'kharkiv',
    name: 'Харків',
    loc: 'Харкові',
    inCity: 'у Харкові',
    clinicSlug: 'onclinic-kharkiv',
    clinics: [{ slug: 'onclinic-kharkiv', tildaPath: '/ukr/onclinic-kharkiv', shortName: 'ОН Клінік' }],
    otherServices: {},
    reviewer: {
      name: 'Удовиченко Олена Олександрівна',
      jobTitle: 'лікар акушер-гінеколог',
      org: 'ОН Клінік Харків',
      category: '',
      experience: '',
      reviewDate: '',
    },
    contentDir: 'city-template',
    ruSlug: 'kharkov',
  },
  // Дніпро й Одеса (31.10.2026): клініка – ОН Клінік міста (clinics.slug перевірено в базі і в
  // checkup-tilda-content/{dnipro,odesa}.json → clinics[].db_slug). Рецензента не призначено.
  dnipro: {
    slug: 'dnipro',
    name: 'Дніпро',
    loc: 'Дніпрі',
    inCity: 'у Дніпрі',
    clinicSlug: 'onclinic-dnipro',
    clinics: [{ slug: 'onclinic-dnipro', tildaPath: '/ukr/onclinic-dnipro', shortName: 'ОН Клінік' }],
    otherServices: {},
    reviewer: null,
    contentDir: 'city-template',
    ruSlug: null,
  },
  odesa: {
    slug: 'odesa',
    name: 'Одеса',
    loc: 'Одесі',
    inCity: 'в Одесі',
    clinicSlug: 'onclinic-odesa',
    clinics: [{ slug: 'onclinic-odesa', tildaPath: '/ukr/onclinic-odesa', shortName: 'ОН Клінік' }],
    otherServices: {},
    reviewer: null,
    contentDir: 'city-template',
    ruSlug: null,
  },
  // Ужгород (01.11.2026, хвиля 1): варіант Б – ОН Клінік Ужгород і Кредоклінік (CITY-HUB-TEXTS v1.9, SEO-MIGRATION §0).
  // Обидві клініки є в базі (clinics, clinic_branches – по одній філії; перевірено 02.11.2026).
  uzhgorod: {
    slug: 'uzhgorod',
    name: 'Ужгород',
    loc: 'Ужгороді',
    inCity: 'в Ужгороді',
    clinicSlug: 'onclinic-uzhgorod',
    // Вікові сторінки Ужгорода показують програми обох клінік (рішення Ігоря 07.11.2026).
    ageClinicSlugs: ['onclinic-uzhgorod', 'credoclinic'],
    clinics: [
      { slug: 'onclinic-uzhgorod', tildaPath: '/ukr/onclinic-uzhgorod', shortName: 'ОН Клінік' },
      { slug: 'credoclinic', tildaPath: '/ukr/credoclinic', shortName: 'Кредоклінік' },
    ],
    otherServices: {},
    reviewer: null,
    contentDir: 'city-template',
    ruSlug: null,
  },
  // Рівне (02.11.2026): РОКЛ ім. Юрія Семенюка (clinics.slug rokl, 2 філії). «100% життя» (100zhyttya-rivne)
  // записано в базу 02.11.2026, але в хвилі 1 місто показує одну клініку (рішення Ігоря 07.11.2026).
  rivne: {
    slug: 'rivne',
    name: 'Рівне',
    loc: 'Рівному',
    inCity: 'у Рівному',
    clinicSlug: 'rokl',
    clinics: [{ slug: 'rokl', tildaPath: '/ukr/rokl', shortName: 'РОКЛ' }],
    otherServices: {},
    reviewer: null,
    contentDir: 'city-template',
    // /rovno на Tilda – 404 (02.11.2026).
    ruSlug: null,
  },
  // Полтава (02.11.2026): ОН Клінік Полтава (clinics.slug onclinic-poltava). ЦМСД (cmsd-poltava) і «100% життя»
  // (100zhyttya-poltava) записано в базу 02.11.2026, але в хвилі 1 місто показує одну клініку (рішення Ігоря 07.11.2026).
  poltava: {
    slug: 'poltava',
    name: 'Полтава',
    loc: 'Полтаві',
    inCity: 'у Полтаві',
    clinicSlug: 'onclinic-poltava',
    clinics: [{ slug: 'onclinic-poltava', tildaPath: '/ukr/onclinic-poltava', shortName: 'ОН Клінік' }],
    otherServices: {},
    reviewer: null,
    contentDir: 'city-template',
    ruSlug: 'poltava',
  },
  // Черкаси (02.11.2026): ОН Клінік Черкаси (clinics.slug onclinic-cherkasy).
  cherkasy: {
    slug: 'cherkasy',
    name: 'Черкаси',
    loc: 'Черкасах',
    inCity: 'у Черкасах',
    clinicSlug: 'onclinic-cherkasy',
    clinics: [{ slug: 'onclinic-cherkasy', tildaPath: '/ukr/onclinic-cherkasy', shortName: 'ОН Клінік' }],
    otherServices: {},
    reviewer: null,
    contentDir: 'city-template',
    ruSlug: 'cherkassy',
  },
};

export function getCheckupCity(slug: string): CheckupCity | null {
  return CHECKUP_CITIES[slug] ?? null;
}

/** Клініки вікових сторінок міста в порядку показу: ageClinicSlugs або одна clinicSlug. */
export function ageClinicSlugsFor(city: CheckupCity): string[] {
  return city.ageClinicSlugs && city.ageClinicSlugs.length > 0 ? city.ageClinicSlugs : [city.clinicSlug];
}
