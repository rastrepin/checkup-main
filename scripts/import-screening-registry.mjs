#!/usr/bin/env node
// Імпорт реєстру закладів «Скринінг здоров'я 40+» (CSV з screening.moz.gov.ua) у data/screening/registry-<city>.json.
// Правила – docs/ux/specs/2026-10-pmh-page-types.md §4.1 (checkup-platform):
//   рядок реєстру ≠ заклад: одна картка на юрособу (ЄДРПОУ), адреси списком, дублі адрес прибрано;
//   партнер – лише за ЄДРПОУ або адресою з data/screening/partners.json, не за назвою;
//   назва без «ТОВ», лапок і форми власності.
//
// Запуск: node scripts/import-screening-registry.mjs <шлях-до.csv> <city-slug> "<назва міста в реєстрі>" <YYYY-MM-DD>
// Приклад: node scripts/import-screening-registry.mjs ~/Downloads/zaklady.csv kharkiv "Харків" 2026-10-26
//
// Назви колонок CSV МОЗ ще не перевірено на справжньому файлі: скрипт шукає їх за ключовими словами
// і зупиняється, якщо якоїсь не знайшов, – тоді допишіть ключове слово в COLUMNS.

import { readFileSync, writeFileSync } from 'node:fs';

const [, , csvPath, citySlug, cityName, asOf] = process.argv;
if (!csvPath || !citySlug || !cityName || !/^\d{4}-\d{2}-\d{2}$/.test(asOf ?? '')) {
  console.error('Використання: node scripts/import-screening-registry.mjs <csv> <city-slug> "<місто>" <YYYY-MM-DD>');
  process.exit(1);
}

const COLUMNS = {
  edrpou: ['єдрпоу', 'едрпоу', 'edrpou', 'код'],
  name: ['назва', 'найменування', 'заклад'],
  address: ['адреса', 'address'],
  settlement: ['населений пункт', 'місто', 'громада', 'settlement', 'city'],
};

function parseCsv(text) {
  const sep = (text.split('\n')[0].match(/;/g) ?? []).length > (text.split('\n')[0].match(/,/g) ?? []).length ? ';' : ',';
  const rows = [];
  let row = [], cell = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') q = false;
      else cell += c;
    } else if (c === '"') q = true;
    else if (c === sep) { row.push(cell); cell = ''; }
    else if (c === '\n') { row.push(cell); rows.push(row); row = []; cell = ''; }
    else if (c !== '\r') cell += c;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows.filter((r) => r.some((x) => x.trim()));
}

const rows = parseCsv(readFileSync(csvPath, 'utf8').replace(/^﻿/, ''));
const header = rows[0].map((h) => h.trim().toLowerCase());
const idx = {};
for (const [key, words] of Object.entries(COLUMNS)) {
  idx[key] = header.findIndex((h) => words.some((w) => h.includes(w)));
  if (idx[key] < 0 && key !== 'settlement') {
    console.error(`Не знайдено колонку «${key}». Заголовки CSV: ${header.join(' | ')}`);
    process.exit(1);
  }
}

const cleanName = (s) =>
  s.replace(/["«»“”„]/g, '')
    .replace(/\b(ТОВАРИСТВО З ОБМЕЖЕНОЮ ВІДПОВІДАЛЬНІСТЮ|ТОВ|КНП|КП|ПП|ФОП|ПРАТ|АТ)\b/giu, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
const normAddr = (s) => s.toLowerCase().replace(/[.,]/g, ' ').replace(/\s+/g, ' ').trim();

const cityLc = cityName.toLowerCase();
const inCity = rows.slice(1).filter((r) => {
  const where = idx.settlement >= 0 ? r[idx.settlement] : r[idx.address];
  return (where ?? '').toLowerCase().includes(cityLc);
});

const partners = JSON.parse(readFileSync('data/screening/partners.json', 'utf8')).partners.filter((p) => p.city === citySlug);
const byEdrpou = new Map();
for (const r of inCity) {
  const edrpou = (r[idx.edrpou] ?? '').replace(/\D/g, '');
  const address = (r[idx.address] ?? '').trim();
  if (!edrpou) continue;
  const inst = byEdrpou.get(edrpou) ?? { edrpou, registry_name: (r[idx.name] ?? '').trim(), name: cleanName(r[idx.name] ?? ''), addresses: [] };
  if (address && !inst.addresses.some((a) => normAddr(a) === normAddr(address))) inst.addresses.push(address);
  byEdrpou.set(edrpou, inst);
}

const institutions = [...byEdrpou.values()].map((inst) => {
  const p = partners.find(
    (p) => p.edrpou.includes(inst.edrpou) || inst.addresses.some((a) => p.addresses.some((pa) => normAddr(pa) === normAddr(a))),
  );
  return p
    ? { ...inst, is_partner: true, partner_brand: p.brand, clinic_slug: p.clinic_slug, online_booking: Boolean(p.online_booking) }
    : { ...inst, is_partner: false, online_booking: false };
});

const out = `data/screening/registry-${citySlug}.json`;
writeFileSync(out, JSON.stringify({ city: citySlug, as_of: asOf, source: 'https://screening.moz.gov.ua/', institutions }, null, 2) + '\n');
console.log(`${out}: ${inCity.length} рядків реєстру → ${institutions.length} закладів, партнерів: ${institutions.filter((i) => i.is_partner).length}`);
