// Вікова сторінка (жінки 40–50 років) міста dnipro. Шаблон – ../city-page.tsx, дані міста – lib/cities/checkup-cities.ts.
// Згенеровано scripts/cities/new-city-pages.mjs.
import CityPage, { cityPageMetadata } from '../city-page';

export const revalidate = 3600;

const CITY = 'dnipro';

export function generateMetadata() {
  return cityPageMetadata(CITY);
}

export default function Page() {
  return <CityPage citySlug={CITY} />;
}
