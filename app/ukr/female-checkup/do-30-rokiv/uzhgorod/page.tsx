// Вікова сторінка (жінки до 30 років) міста uzhgorod. Шаблон – ../city-page.tsx, дані міста – lib/cities/checkup-cities.ts.
// Згенеровано scripts/cities/new-city-pages.mjs.
import CityPage, { cityPageMetadata } from '../city-page';

export const revalidate = 3600;

const CITY = 'uzhgorod';

export function generateMetadata() {
  return cityPageMetadata(CITY);
}

export default function Page() {
  return <CityPage citySlug={CITY} />;
}
