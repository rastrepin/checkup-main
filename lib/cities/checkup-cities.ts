// Міста вікових сторінок чекапу (тип 5a) – конвеєр міграції сторінок з Tilda, 30.10.2026.
// Шаблон кожної вікової сторінки – app/ukr/{female,male}-checkup/{вік}/city-page.tsx; сторінка міста –
// тонка обгортка {вік}/{slug}/page.tsx (буквальна папка, як вимагає scripts/check-routes.mjs).
// Програми, ціни і філії шаблон бере з Supabase за clinicSlug.
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
  /** Медичний рецензент жіночих вікових сторінок міста (лікар клініки міста). */
  reviewer: CityReviewer;
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
  },
};

export function getCheckupCity(slug: string): CheckupCity | null {
  return CHECKUP_CITIES[slug] ?? null;
}
