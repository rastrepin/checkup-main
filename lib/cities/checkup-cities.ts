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
}

/** Тематичні сторінки міста, що лишаються на Tilda, – блок «Інші послуги в {city_loc}» хабу міста
 *  (CITY-HUB-TEXTS §7, SEO-MIGRATION §6). Ключ – послуга (анкор у content/city-template/city.md), значення – адреса.
 *  Послуги, якої в місті немає, у записі немає. */
export type OtherServiceKey = 'kolonoskopiya' | 'planuvannya-vahitnosti' | 'child-checkup' | 'podarunok';

export interface CheckupCity {
  /** Слаг у URL: /ukr/female-checkup/do-30-rokiv/{slug}. */
  slug: string;
  /** Назва в називному відмінку: «Харків» (крихти, «Чоловічий чекап · Харків»). */
  name: string;
  /** Місцевий відмінок без прийменника: «Харкові». Прийменник «в»/«у» лишається в тексті сторінки. */
  loc: string;
  /** Місцевий відмінок з прийменником для позиції після приголосного: «у Харкові», «в Одесі»
   *  (CITY-HUB-TEXTS v1.6, плейсхолдер {in_city}). */
  inCity: string;
  /** clinics.slug клініки, програми якої показують вікові сторінки (одна клініка на вікову сторінку). */
  clinicSlug: string;
  /** Клініки-партнери міста для хабу і сторінок статі в порядку показу. Одна – варіант А, кілька – варіант Б
   *  (CITY-HUB-TEXTS: Ужгород – Б). */
  clinics: CityClinic[];
  /** «Інші послуги» хабу: адреси тематичних сторінок міста на Tilda (CITY-HUB-TEXTS §7). */
  otherServices: Partial<Record<OtherServiceKey, string>>;
  /** Медичний рецензент жіночих сторінок міста (лікар клініки міста). null – рецензента немає:
   *  блок «Медичний рецензент» і reviewedBy у JSON-LD не рендеряться (як на скринінгових сторінках). */
  reviewer: CityReviewer | null;
  /** Папка content/ з текстами хабу і сторінок статі (city.md, female-checkup.md, male-checkup.md).
   *  Хвиля 1 (Харків, Дніпро, Одеса, Ужгород) – 'city-template': тексти CITY-HUB-TEXTS v1.6 дослівно,
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
    clinics: [{ slug: 'onclinic-kharkiv', tildaPath: '/ukr/onclinic-kharkiv' }],
    otherServices: {
      kolonoskopiya: '/ukr/kolonoskopiya/kharkiv',
      'planuvannya-vahitnosti': '/ukr/materynstvo/planuvannya-vahitnosti/kharkiv',
      'child-checkup': '/ukr/child-checkup/kharkiv',
      podarunok: '/ukr/podarunok/kharkiv',
    },
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
    clinics: [{ slug: 'onclinic-dnipro', tildaPath: '/ukr/onclinic-dnipro' }],
    otherServices: {
      kolonoskopiya: '/ukr/kolonoskopiya/dnipro',
      'planuvannya-vahitnosti': '/ukr/materynstvo/planuvannya-vahitnosti/dnipro',
      'child-checkup': '/ukr/child-checkup/dnipro',
      podarunok: '/ukr/podarunok/dnipro',
    },
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
    clinics: [{ slug: 'onclinic-odesa', tildaPath: '/ukr/onclinic-odesa' }],
    // Дитячого чекапу в Одесі немає (CITY-HUB-TEXTS §7).
    otherServices: {
      kolonoskopiya: '/ukr/kolonoskopiya/odesa',
      'planuvannya-vahitnosti': '/ukr/akusherstvo/planirovanie-beremennosti/odesa',
      podarunok: '/ukr/podarunok/odesa',
    },
    reviewer: null,
    contentDir: 'city-template',
    ruSlug: null,
  },
  // Ужгород (01.11.2026, хвиля 1): варіант Б – ОН Клінік Ужгород і Кредо Клінік (CITY-HUB-TEXTS, SEO-MIGRATION §0).
  // Клінік Ужгорода в базі ще немає (запис – після погодження власника): блоки з даними не рендеряться.
  uzhgorod: {
    slug: 'uzhgorod',
    name: 'Ужгород',
    loc: 'Ужгороді',
    inCity: 'в Ужгороді',
    // provisional – owner to confirm: клініка вікових сторінок Ужгорода (одна на вікову сторінку).
    clinicSlug: 'onclinic-uzhgorod',
    clinics: [
      { slug: 'onclinic-uzhgorod', tildaPath: '/ukr/onclinic-uzhgorod' },
      { slug: 'credoclinic', tildaPath: '/ukr/credoclinic' },
    ],
    // Колоноскопії і планування вагітності в Ужгороді немає (CITY-HUB-TEXTS §7).
    otherServices: {
      'child-checkup': '/ukr/child-checkup/uzhgorod',
      podarunok: '/ukr/podarunok/uzhgorod',
    },
    reviewer: null,
    contentDir: 'city-template',
    ruSlug: null,
  },
};

export function getCheckupCity(slug: string): CheckupCity | null {
  return CHECKUP_CITIES[slug] ?? null;
}
