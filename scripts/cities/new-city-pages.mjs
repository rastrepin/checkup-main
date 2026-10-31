#!/usr/bin/env node
// Конвеєр міграції сторінок чекапу з Tilda (30.10.2026): створює вікові сторінки міста.
//
//   node scripts/cities/new-city-pages.mjs mykolaiv
//
// Для кожної вікової сторінки (жінки й чоловіки, 4 кроки) пише тонку обгортку
// app/ukr/{stat}-checkup/{вік}/{slug}/page.tsx над шаблоном ../city-page.tsx.
// Наявні файли не перезаписує. Місто має бути в lib/cities/checkup-cities.ts.
// approved-routes.json не змінює: нові сторінки – чернетки, видно лише на прев'ю з ?drafts=1.
// Скрипт друкує адреси, які додають у перелік, коли сторінки погоджено.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const AGE_PAGES = [
  ['female', 'do-30-rokiv', 'жінки до 30 років'],
  ['female', 'do-40-rokiv', 'жінки 30–40 років'],
  ['female', '40-50-rokiv', 'жінки 40–50 років'],
  ['female', 'vid-50-rokiv', 'жінки після 50 років'],
  ['male', 'do-30-rokiv', 'чоловіки до 30 років'],
  ['male', 'do-40-rokiv', 'чоловіки 30–40 років'],
  ['male', '40-50-rokiv', 'чоловіки 40–50 років'],
  ['male', 'vid-50-rokiv', 'чоловіки після 50 років'],
];

const slug = process.argv[2];
if (!slug || !/^[a-z][a-z-]*$/.test(slug)) {
  console.error('Вкажіть слаг міста латиницею: node scripts/cities/new-city-pages.mjs mykolaiv');
  process.exit(1);
}
const cities = readFileSync(join('lib', 'cities', 'checkup-cities.ts'), 'utf8');
if (!cities.includes(`\n  ${slug}: {`) && !cities.includes(`\n  '${slug}': {`)) {
  console.error(`Міста ${slug} немає в lib/cities/checkup-cities.ts. Спершу додайте запис (назва, відмінок, клініка, рецензент).`);
  process.exit(1);
}

const stub = (label) => `// Вікова сторінка (${label}) міста ${slug}. Шаблон – ../city-page.tsx, дані міста – lib/cities/checkup-cities.ts.
// Згенеровано scripts/cities/new-city-pages.mjs.
import CityPage, { cityPageMetadata } from '../city-page';

export const revalidate = 3600;

const CITY = '${slug}';

export function generateMetadata() {
  return cityPageMetadata(CITY);
}

export default function Page() {
  return <CityPage citySlug={CITY} />;
}
`;

const routes = [];
for (const [gender, age, label] of AGE_PAGES) {
  const dir = join('app', 'ukr', `${gender}-checkup`, age, slug);
  const file = join(dir, 'page.tsx');
  routes.push(`/ukr/${gender}-checkup/${age}/${slug}`);
  if (existsSync(file)) {
    console.log(`є:       ${file}`);
    continue;
  }
  mkdirSync(dir, { recursive: true });
  writeFileSync(file, stub(label));
  console.log(`створено: ${file}`);
}
console.log('\nПісля погодження додайте в lib/seo/approved-routes.json:');
for (const r of routes) console.log(`  "${r}",`);
