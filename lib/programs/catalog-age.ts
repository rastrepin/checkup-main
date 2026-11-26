// Вікові групи програм каталогу хабу статі і правило фільтра «Вік» (gender-hub v0.1 §3.2; задача НОРМАТИВ 26.11, п. 5).
// Чисті функції без серверних імпортів: їх викликають і сервер (кількість у вікових картках), і клієнтський каталог.
// Значення фільтра і `#age=` – сегмент адреси вікової сторінки (lib/plan/age-groups.ts AgeSegment).

import type { AgeSegment } from '@/lib/plan/age-groups';

/** Сегменти адрес вікових сторінок за віком, від молодшого. */
export const CATALOG_AGES: AgeSegment[] = ['do-30-rokiv', 'do-40-rokiv', '40-50-rokiv', 'vid-50-rokiv'];

/** checkup_programs.age_group (рядок з бази) → сегменти, яким програма відповідає. */
const GROUP_SEGMENTS: Record<string, AgeSegment[]> = {
  'do-30': ['do-30-rokiv'],
  '30-40': ['do-40-rokiv'], // Р49: адреса do-40-rokiv відповідає групі 30–40
  '40-50': ['40-50-rokiv'],
  '50+': ['vid-50-rokiv'],
  'after-40': ['40-50-rokiv', 'vid-50-rokiv'],
  any: CATALOG_AGES,
};

/** Програма проходить фільтр віку: група перетинається з віком. Невідома або порожня група – проходить будь-який вік. */
export function programMatchesAge(ageGroup: string | null | undefined, seg: AgeSegment): boolean {
  const segs = ageGroup ? GROUP_SEGMENTS[ageGroup] : undefined;
  return segs ? segs.includes(seg) : true;
}

export function isCatalogAge(v: string | null | undefined): v is AgeSegment {
  return CATALOG_AGES.includes(v as AgeSegment);
}

/** Значення `#age=` з адреси; null – немає або невідоме. */
export function ageFromHash(hash: string): AgeSegment | null {
  const m = hash.match(/^#age=([a-z0-9-]+)$/);
  return m && isCatalogAge(m[1]) ? m[1] : null;
}

/** Підпис віку програми в картці (§4.1 п. 3): точна група – з filterAges (за порядком CATALOG_AGES), any / after-40 – окремі підписи. */
export function ageLabelFor(
  ageGroup: string | null | undefined,
  t: { filterAges: string[]; any: string | null; after40: string | null },
): string | null {
  if (!ageGroup) return null;
  if (ageGroup === 'any') return t.any;
  if (ageGroup === 'after-40') return t.after40;
  const segs = GROUP_SEGMENTS[ageGroup];
  if (!segs || segs.length !== 1) return null;
  return t.filterAges[CATALOG_AGES.indexOf(segs[0])] ?? null;
}
