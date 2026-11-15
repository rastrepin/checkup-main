// Ціна клініки зі знижкою – одна умова для форми запису і картки програми (НОРМАТИВ 14.11, А.1; ui-kit §6.8 «Ціна зі знижкою»).
// Закреслена ціна і «−N%» – лише коли ціна в клініці (price_regular) більша за ціну до сплати (price_discount).

export interface PriceDiscount {
  /** Ціна в клініці – показується закресленою. */
  regular: number;
  /** Знижка у відсотках, ціле число ≥ 1. */
  pct: number;
}

/** Знижка програми або null, коли знижки немає (ціни рівні, ціни в клініці немає чи вона менша). */
export function priceDiscount(regular: number | null | undefined, discount: number | null | undefined): PriceDiscount | null {
  if (typeof regular !== 'number' || typeof discount !== 'number') return null;
  if (!(regular > discount) || discount <= 0) return null;
  const pct = Math.round((1 - discount / regular) * 100);
  return pct >= 1 ? { regular, pct } : null;
}
