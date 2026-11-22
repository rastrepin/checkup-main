// Тексти вікових сторінок з content/kharkiv/{стать}-{вік}.md (age-page-zones v0.9.2 §12.2, my-plan v0.8.1 §1).
// Ключ розділу має вигляд `ключ: "текст"` (або `ключ: ["пункт", …]`). Ключа немає або в тексті лишився
// незаповнений плейсхолдер – тексту немає (null / порожній список): сторінка нічого не підставляє замість нього.
// Плейсхолдери – camelCase, як у .md: {cityLoc}, {inCity}, {groupGen}, {genderGen}; значення – з конфігу
// міста (lib/cities/checkup-cities.ts) і вікових груп (lib/plan/age-groups.ts), у .tsx їх немає.

import type { CheckupCity } from '@/lib/cities/checkup-cities';
import { fillPlaceholders, loadCityMdSections, type CityMdVars } from '@/lib/content/city-md';
import { GENDER_GEN, groupGen, type AgeSegment, type PlanGender } from '@/lib/plan/age-groups';

/** Тека з .md вікових сторінок: шаблони однакові для всіх міст, тексти – з цих файлів. */
export const AGE_MD_DIR = 'kharkiv';

const UNRESOLVED = /\{[A-Za-z_0-9]+\}/;

/** Значення плейсхолдерів: camelCase з .md + старі snake_case, які ще є в інших ключах файлу. */
export function ageMdVars(city: CheckupCity, gender: PlanGender, seg: AgeSegment): CityMdVars {
  return {
    city: city.name,
    city_loc: city.loc,
    city_slug: city.slug,
    in_city: city.inCity,
    cityLoc: city.loc,
    inCity: city.inCity,
    genderGen: GENDER_GEN[gender],
    groupGen: groupGen(gender, seg),
  };
}

/** Сирий текст розділу «## ключ» файлу {стать}-{вік}.md; null – файлу або розділу немає. */
export function loadAgeSection(gender: PlanGender, seg: AgeSegment, section: string): string | null {
  const doc = loadCityMdSections(AGE_MD_DIR, `${gender}-${seg}`, {});
  return doc?.raw[section] ?? null;
}

/** `key: "текст"` → текст з підставленими плейсхолдерами; null – ключа немає, він порожній або з незаповненим плейсхолдером. */
export function mdString(raw: string | null, key: string, vars: CityMdVars): string | null {
  const m = raw?.match(new RegExp(`^${key}:\\s*"(.*)"\\s*$`, 'm'));
  const text = m ? fillPlaceholders(m[1], vars).trim() : '';
  return text && !UNRESOLVED.test(text) ? text : null;
}

/** `key: ["a", "b"]` → пункти без порожніх і без незаповнених плейсхолдерів. */
export function mdList(raw: string | null, key: string, vars: CityMdVars): string[] {
  const m = raw?.match(new RegExp(`^${key}:\\s*(\\[.*\\])\\s*$`, 'm'));
  if (!m) return [];
  try {
    const arr: unknown = JSON.parse(m[1]);
    if (!Array.isArray(arr)) return [];
    return arr
      .filter((x): x is string => typeof x === 'string')
      .map((x) => fillPlaceholders(x, vars).trim())
      .filter((x) => x && !UNRESOLVED.test(x));
  } catch {
    return [];
  }
}

/** Тексти зони програм клінік (6c_clinic_zone). catalog* – для посилання на каталог, яке поки вимкнене. */
export interface ClinicZoneTexts {
  h2: string | null;
  sub: string | null;
  nature: string | null;
  catalogMore: string | null;
  catalogAll: string | null;
}

export function clinicZoneTexts(city: CheckupCity, gender: PlanGender, seg: AgeSegment, programsCount: number): ClinicZoneTexts {
  const raw = loadAgeSection(gender, seg, '6c_clinic_zone');
  const vars = ageMdVars(city, gender, seg);
  return {
    h2: mdString(raw, 'h2', vars),
    sub: mdString(raw, 'sub', vars),
    nature: mdString(raw, 'nature', vars),
    catalogMore: mdString(raw, 'catalog_more', { ...vars, n: programsCount }),
    catalogAll: mdString(raw, 'catalog_all', vars),
  };
}

/** Тексти блоку «Мій план» (4p_plan). add_h3 і add_line – блок «Додати дослідження», пакет 2: не читаються. */
export interface PlanTexts {
  eyebrow: string | null;
  h2: string | null;
  lead: string | null;
  why: string[];
  saveNote: string | null;
  disclaimer: string | null;
}

export function planTexts(city: CheckupCity, gender: PlanGender, seg: AgeSegment): PlanTexts {
  const raw = loadAgeSection(gender, seg, '4p_plan');
  const vars = ageMdVars(city, gender, seg);
  return {
    eyebrow: mdString(raw, 'eyebrow', vars),
    h2: mdString(raw, 'h2', vars),
    lead: mdString(raw, 'lead', vars),
    why: mdList(raw, 'why', vars).slice(0, 3),
    saveNote: mdString(raw, 'save_note', vars),
    disclaimer: mdString(raw, 'disclaimer', vars),
  };
}

/** Адреса каталогу хабу статі з фільтром за віком: фрагмент `#age={вік}`, параметр адреси не вживається
 *  (age-page-zones v0.9.2 §2.4), напр. /ukr/female-checkup/kharkiv#age=40-50-rokiv. */
export function catalogHref(gender: PlanGender, seg: AgeSegment, city: CheckupCity): string {
  return `/ukr/${gender}-checkup/${city.slug}#age=${seg}`;
}
