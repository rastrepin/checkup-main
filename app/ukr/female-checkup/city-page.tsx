import type { Metadata } from 'next';
import GenderHubPage, { genderHubMetadataFor } from '@/components/city/GenderHubPage';

// Сторінка статі в місті /ukr/female-checkup/{slug} – шаблон для всіх міст з lib/cities/checkup-cities.ts.
// Спільний для обох статей шаблон – components/city/GenderHubPage.tsx (хвиля 1, 01.11.2026);
// тексти – content/{city.contentDir}/female-checkup.md (CITY-HUB-TEXTS v1.6 §9 і female-checkup.md v0).
// Сторінка міста – тонка обгортка app/ukr/female-checkup/{slug}/page.tsx (scripts/cities/new-city-pages.mjs).
// Шаблон сторінки: revalidate задається в {місто}/page.tsx.

export function genderHubMetadata(citySlug: string): Promise<Metadata> {
  return genderHubMetadataFor('female', citySlug);
}

export default function FemaleHubCityPage({ citySlug }: { citySlug: string }) {
  return <GenderHubPage gender="female" citySlug={citySlug} />;
}
