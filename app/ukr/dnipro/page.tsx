// Хаб міста dnipro (тип 5). Шаблон – ../city-page.tsx, дані міста – lib/cities/checkup-cities.ts.
// Згенеровано scripts/cities/new-city-pages.mjs.
import CityHubPage, { cityHubMetadata } from '../city-page';

export const revalidate = 3600;

const CITY = 'dnipro';

export function generateMetadata() {
  return cityHubMetadata(CITY);
}

export default function Page() {
  return <CityHubPage citySlug={CITY} />;
}
