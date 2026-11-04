// Вікові групи вікових сторінок: сегмент адреси ↔ slug групи в базі (platform_programs.slug) і межі віку.
// Межі – DATABASE.md 2.1 §6.2 «Правила моделі» і my-plan §6: до 30 – 18–29; 30–40 – 30–39; 40–50 – 40–49; від 50 – 50+.
// Мапа живе в коді, не в базі (Р12). За Р49 адреса do-40-rokiv відповідає slug групи *-30-40.

export type PlanGender = 'female' | 'male';
export type AgeSegment = 'do-30-rokiv' | 'do-40-rokiv' | '40-50-rokiv' | 'vid-50-rokiv';

export interface AgeGroup {
  /** Код групи в slug бази: female-checkup-{code}. */
  code: 'do-30' | '30-40' | '40-50' | 'vid-50';
  minAge: number;
  /** null – без верхньої межі. */
  maxAge: number | null;
  /** Вік у тексті «Для {група}…»: «до 30 років». */
  label: string;
}

export const AGE_GROUPS: Record<AgeSegment, AgeGroup> = {
  'do-30-rokiv': { code: 'do-30', minAge: 18, maxAge: 29, label: 'до 30 років' },
  'do-40-rokiv': { code: '30-40', minAge: 30, maxAge: 39, label: '30–40 років' },
  '40-50-rokiv': { code: '40-50', minAge: 40, maxAge: 49, label: '40–50 років' },
  'vid-50-rokiv': { code: 'vid-50', minAge: 50, maxAge: null, label: 'від 50 років' },
};

/** platform_programs.slug групи: female-checkup-30-40. */
export function groupSlug(gender: PlanGender, seg: AgeSegment): string {
  return `${gender}-checkup-${AGE_GROUPS[seg].code}`;
}

/** Межі фактора ризику перетинаються з віковою групою. */
export function ageOverlaps(g: AgeGroup, min: number | null, max: number | null): boolean {
  const lo = min ?? 0;
  const hi = max ?? 200;
  return lo <= (g.maxAge ?? 200) && hi >= g.minAge;
}
