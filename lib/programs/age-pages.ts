// Реєстр "живих" сторінок Типу 5a (вікові кроки чекапу за статтю, місто Харків).
// Джерело правди для CrossAgeNav на обох статях — редагувати тут, а не в компоненті,
// коли виходить наступна сторінка (завдання Cowork 29.08.2026, розділ 3).
//
// ВАЖЛИВО: старі /ukr/{stat}-checkup/{крок}-rokiv/kharkiv роути в App Router уже існують
// як порожні заглушки (H1 + breadcrumb, без контенту Типу 5a) — вони НЕ вважаються
// "живими" сторінками цього реєстру, поки їх не переберуть за новим MD-стандартом.

export type AgeStepGender = 'female' | 'male';

export interface AgeStepPage {
  gender: AgeStepGender;
  ageStepLabel: string; // текст посилання, напр. "40-50 років"
  href: string;
}

export const AGE_STEP_PAGES: AgeStepPage[] = [
  { gender: 'female', ageStepLabel: 'До 30 років', href: '/ukr/female-checkup/do-30-rokiv/kharkiv' },
  { gender: 'female', ageStepLabel: '40-50 років', href: '/ukr/female-checkup/40-50-rokiv/kharkiv' },
  { gender: 'female', ageStepLabel: 'Після 50', href: '/ukr/female-checkup/vid-50-rokiv/kharkiv' },
];
