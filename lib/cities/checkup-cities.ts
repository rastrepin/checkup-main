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

export interface CheckupCity {
  /** Слаг у URL: /ukr/female-checkup/do-30-rokiv/{slug}. */
  slug: string;
  /** Назва в називному відмінку: «Харків» (крихти, «Чоловічий чекап · Харків»). */
  name: string;
  /** Місцевий відмінок без прийменника: «Харкові». Прийменник «в»/«у» лишається в тексті сторінки. */
  loc: string;
  /** clinics.slug клініки, програми якої показує сторінка. */
  clinicSlug: string;
  /** Медичний рецензент жіночих сторінок міста (лікар клініки міста). null – рецензента немає:
   *  блок «Медичний рецензент» і reviewedBy у JSON-LD не рендеряться (як на скринінгових сторінках). */
  reviewer: CityReviewer | null;
  /** Папка content/ з текстами сторінок типу 5 і необов'язковими блоками хабу (what-is-checkup.md,
   *  how-it-works-single.md, how-it-works-multi.md, team.md). Харків – 'kharkiv' (власні MD),
   *  нові міста – 'city-template' (спільні MD з плейсхолдерами {city}, {city_loc}). */
  contentDir: 'kharkiv' | 'city-template';
  /** Слаг російськомовних сторінок Tilda для hreflang ru («kharkov» → /kharkov, /female-checkup/kharkov).
   *  null – hreflang ru не виводиться (відповідність ru-сторінок не перевірено). */
  ruSlug: string | null;
}

export const CHECKUP_CITIES: Record<string, CheckupCity> = {
  kharkiv: {
    slug: 'kharkiv',
    name: 'Харків',
    loc: 'Харкові',
    clinicSlug: 'onclinic-kharkiv',
    reviewer: {
      name: 'Удовиченко Олена Олександрівна',
      jobTitle: 'лікар акушер-гінеколог',
      org: 'ОН Клінік Харків',
      category: '',
      experience: '',
      reviewDate: '',
    },
    contentDir: 'kharkiv',
    ruSlug: 'kharkov',
  },
};

export function getCheckupCity(slug: string): CheckupCity | null {
  return CHECKUP_CITIES[slug] ?? null;
}
