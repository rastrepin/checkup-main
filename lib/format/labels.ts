// Допоміжні функції словника підписів компонентів (ui-kit v1.16.1 §6.14 п. 1).
// Українські значення – дефолт у компоненті; сторінка передає лише змінені ключі (`labels?: Partial<Labels>`).

/** Дефолти + передані ключі. Ключ зі значенням undefined дефолт не затирає. */
export function mergeLabels<T extends object>(defaults: T, overrides?: Partial<T>): T {
  const out = { ...defaults };
  if (!overrides) return out;
  for (const key of Object.keys(overrides) as (keyof T)[]) {
    const value = overrides[key];
    if (value !== undefined) out[key] = value as T[keyof T];
  }
  return out;
}

/** Підстановка {name} у підписі: fillLabel('Крок {step} з 2', { step: 1 }) → «Крок 1 з 2». */
export function fillLabel(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m));
}

/** Форми множини [one, few, many] – для `countText` (components/frame/ProgramCard.tsx): 1 / 2–4 / 5+. */
export type PluralForms = [string, string, string];
