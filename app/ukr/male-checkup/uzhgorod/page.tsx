// Сторінка «Чоловікам» міста uzhgorod (тип 5). Шаблон – ../city-page.tsx, дані міста – lib/cities/checkup-cities.ts.
// Згенеровано scripts/cities/new-city-pages.mjs.
import MaleHubCityPage, { genderHubMetadata } from '../city-page';

export const revalidate = 3600;

const CITY = 'uzhgorod';

export function generateMetadata() {
  return genderHubMetadata(CITY);
}

export default function Page() {
  return <MaleHubCityPage citySlug={CITY} />;
}
