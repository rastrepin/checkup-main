// Форматери даних лікаря з реєстру (doctors). Одне місце для порядку слів у ПІБ і розгортання регалій.
// Рішення PO 17.10 (рішення 15А): у картках ПІБ «Ім'я По батькові Прізвище», регалії без скорочень.

/** «Бондарук Володимир Петрович» → «Володимир Петрович Бондарук». Інша кількість слів – без змін. */
export function formatDoctorName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length !== 3) return fullName.trim();
  const [last, first, patronymic] = parts;
  return `${first} ${patronymic} ${last}`;
}

const ABBREVIATIONS: [RegExp, string][] = [
  [/к\.\s?м\.\s?н\./gi, 'кандидат медичних наук'],
  [/д\.\s?м\.\s?н\./gi, 'доктор медичних наук'],
];

/** Регалії без скорочень, з великої літери. Порожні – null. */
export function formatRegalia(regalia: string | null | undefined): string | null {
  const s = regalia?.trim();
  if (!s) return null;
  const expanded = ABBREVIATIONS.reduce((acc, [re, full]) => acc.replace(re, full), s);
  return expanded.charAt(0).toUpperCase() + expanded.slice(1);
}
