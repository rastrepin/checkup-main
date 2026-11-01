// Сторінка «Жінкам» міста uzhgorod (тип 5). Шаблон – ../city-page.tsx, дані міста – lib/cities/checkup-cities.ts.
// Згенеровано scripts/cities/new-city-pages.mjs.
import FemaleHubCityPage, { genderHubMetadata } from '../city-page';

export const revalidate = 3600;

const CITY = 'uzhgorod';

export function generateMetadata() {
  return genderHubMetadata(CITY);
}

export default function Page() {
  return <FemaleHubCityPage citySlug={CITY} />;
}
