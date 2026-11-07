// Профіль Google «Check-Up Центр» – для рядка рейтингу в блоці «Про команду» хабу міста і сторінок статі
// (CITY-HUB-TEXTS §5, специфікація хабу docs/ux/specs/2026-11-city-hub.md §5.3) і sameAs організації в JSON-LD
// (SEO-MIGRATION §7). Числа – лише звідси, не з тексту сторінки. rating або reviews = null – рядка рейтингу немає.
// У розмітці рейтингу немає: AggregateRating і Review заборонені (SEO-MIGRATION §7).
//
// Числа: TASK-city-hub-texts.md (checkup-platform, docs/kb/claude), «5,0 у Google – 89 відгуків», рішення 30.10.2026.
// Оновлювати разом з профілем Google (дата – asOf).

export const GOOGLE_PROFILE: {
  name: string;
  url: string;
  rating: number | null;
  reviews: number | null;
  asOf: string;
} = {
  name: 'Check-Up Центр',
  url: 'https://maps.google.com/?cid=757083190297362749',
  rating: 5.0,
  reviews: 89,
  asOf: '2026-10-30',
};

/** «5,0» – один знак після коми, як у профілі Google. */
export function googleRatingText(rating: number): string {
  return rating.toFixed(1).replace('.', ',');
}
