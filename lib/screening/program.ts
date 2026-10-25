// Дані програми «Скринінг здоров'я 40+» – єдине джерело суми і строків для сторінок T3
// (docs/ux/specs/2026-10-pmh-page-types.md §4.1 п.1 у checkup-platform). У .md сума лише підстановкою {program_amount}.
// Зміниться постанова – змінюється одне поле тут.

export const SCREENING_40 = {
  amountUah: 2000,
  amountSource: 'Постанова КМУ № 1652 від 10.12.2025',
  /** Строк використання коштів після зарахування (правило з 18.05.2026, screening.moz.gov.ua). */
  useWithinMonths: 2,
  verifiedAt: '2026-10-25',
  officialUrl: 'https://screening.moz.gov.ua/',
  hotline: '0800 505 201',
} as const;

export function programAmountText(): string {
  return `${SCREENING_40.amountUah.toLocaleString('uk-UA')} грн`;
}
