// Стан людини в блоці «Мій план» – лише в хеші посилання на план (age-page-zones §3.4, my-plan §8):
// обрана клініка, прибрані рядки, додані дослідження, фактори ризику. Не в базі, не в аналітиці, не в заявці.
//
// Формат (версія 2): #plan=2;{f|m};{сегмент віку};c={clinic};x={slug,…};a={slug:e|r,…};r={code,…}
//   c – обрана клініка; x – прибрані рядки Базового плану; a – додані дослідження з джерелом
//   (e – «Додати дослідження», r – ризик-флоу); r – обрані фактори ризику. Порожні поля пропускаються.
// Приклад: #plan=2;f;do-40-rokiv;c=onclinic-uzhgorod;x=pap-test;a=uzd-shchytovydnoi:e

import type { AgeSegment, PlanGender } from './age-groups';

export type AddSource = 'extra' | 'risk';

export interface PlanUserState {
  clinic: string | null;
  dropped: string[];
  added: Record<string, AddSource>;
  factors: string[];
}

export const EMPTY_STATE: PlanUserState = { clinic: null, dropped: [], added: {}, factors: [] };
export const PLAN_HASH = 'plan';

const SAFE = /^[a-z0-9-]+$/;
const safeList = (v: string | undefined) => (v ?? '').split(',').filter((x) => SAFE.test(x));

export function encodePlanState(gender: PlanGender, seg: AgeSegment, s: PlanUserState): string {
  const parts = ['2', gender === 'female' ? 'f' : 'm', seg];
  if (s.clinic && SAFE.test(s.clinic)) parts.push(`c=${s.clinic}`);
  const x = s.dropped.filter((k) => SAFE.test(k));
  if (x.length) parts.push(`x=${x.join(',')}`);
  const a = Object.entries(s.added).filter(([k]) => SAFE.test(k)).map(([k, v]) => `${k}:${v === 'risk' ? 'r' : 'e'}`);
  if (a.length) parts.push(`a=${a.join(',')}`);
  const r = s.factors.filter((k) => SAFE.test(k));
  if (r.length) parts.push(`r=${r.join(',')}`);
  return parts.join(';');
}

/** null – хеш не для цієї сторінки (інша стать чи вік), інша версія або пошкоджений. */
export function decodePlanState(hash: string, gender: PlanGender, seg: AgeSegment): PlanUserState | null {
  const h = hash.replace(/^#/, '');
  if (!h.startsWith(`${PLAN_HASH}=`)) return null;
  let raw = h.slice(PLAN_HASH.length + 1);
  try {
    raw = decodeURIComponent(raw);
  } catch {
    return null;
  }
  const [v, g, a, ...rest] = raw.split(';');
  if (v !== '2' || g !== (gender === 'female' ? 'f' : 'm') || a !== seg) return null;
  const kv: Record<string, string> = {};
  for (const p of rest) {
    const i = p.indexOf('=');
    if (i > 0) kv[p.slice(0, i)] = p.slice(i + 1);
  }
  const added: Record<string, AddSource> = {};
  for (const pair of (kv.a ?? '').split(',')) {
    const [k, src] = pair.split(':');
    if (k && SAFE.test(k)) added[k] = src === 'r' ? 'risk' : 'extra';
  }
  return {
    clinic: kv.c && SAFE.test(kv.c) ? kv.c : null,
    dropped: safeList(kv.x),
    added,
    factors: safeList(kv.r),
  };
}
