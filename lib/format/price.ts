// Одна функція формату ціни для всіх компонентів (ui-kit v1.16.1 §6.14 п. 3; components-map v7.5 §30.1, §30.3, §30.9, §30.10).
// Число з нерозривним пробілом (U+00A0) між тисячами і перед валютою, валюта після числа: «10 460 грн», «1 200 USD».
// Звичайний пробіл і U+202F в ціні не використовуються. Ціна, сума, закреслена ціна і «−N%» – в одній валюті.

export type Currency = 'UAH' | 'USD';

const NBSP = ' ';

const CURRENCY_LABEL: Record<Currency, string> = {
  UAH: 'грн',
  USD: 'USD',
};

/** Число з нерозривним пробілом між тисячами: 10460 → «10 460». */
export function formatNumber(n: number): string {
  return n.toLocaleString('uk-UA').replace(/\s/g, NBSP);
}

/** Ціна з валютою: formatPrice(10460) → «10 460 грн», formatPrice(1200, 'USD') → «1 200 USD». */
export function formatPrice(n: number, currency: Currency = 'UAH'): string {
  return `${formatNumber(n)}${NBSP}${CURRENCY_LABEL[currency]}`;
}
