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
  ownership: ['форма власності'],
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
  if (idx[key] < 0 && key !== 'settlement' && key !== 'ownership') {
    console.error(`Не знайдено колонку «${key}». Заголовки CSV: ${header.join(' | ')}`);
    process.exit(1);
  }
}

// Назви в реєстрі ВЕЛИКИМИ ЛІТЕРАМИ з повною формою власності. Для сторінки:
//   КНП "МІСЬКА ПОЛІКЛІНІКА № 18" ХАРКІВСЬКОЇ МІСЬКОЇ РАДИ → name «Міська поліклініка № 18», registry_name КНП «Міська поліклініка № 18» Харківської міської ради
//   ФОП КОНОВАЛЕНКО ТЕТЯНА МИКОЛАЇВНА → ФОП Коноваленко Т. М.
// Що автоматика не вгадає – у data/screening/name-overrides.json (ключ – ЄДРПОУ).
const FORMS = [
  ['ТОВАРИСТВО З ОБМЕЖЕНОЮ ВІДПОВІДАЛЬНІСТЮ', 'ТОВ'],
  ['КОМУНАЛЬНЕ НЕКОМЕРЦІЙНЕ ПІДПРИЄМСТВО', 'КНП'],
  ['ДЕРЖАВНЕ НЕКОМЕРЦІЙНЕ ПІДПРИЄМСТВО', 'ДНП'],
  ['КОМУНАЛЬНЕ ПІДПРИЄМСТВО', 'КП'],
  ['ПРИВАТНЕ ПІДПРИЄМСТВО', 'ПП'],
  ['ПРИВАТНЕ АКЦІОНЕРНЕ ТОВАРИСТВО', 'ПрАТ'],
  ['АКЦІОНЕРНЕ ТОВАРИСТВО', 'АТ'],
  ['ДЕРЖАВНА УСТАНОВА', 'ДУ'],
];
// Власні прикметники (міста, країна) лишаються з великої: «Харківської міської ради».
const PROPER = /^(харків|україн|рубіжан|луганськ|куп['’]ян|київ|львів|одес|дніпр|слобожан|європ)/u;
const VOWELS = /[аеєиіїоуюяaeiou]/iu;
const cap = (w) => (w ? w[0].toUpperCase() + w.slice(1) : w);
const word = (w, first) => {
  if (/^(\p{L}\.)+\p{L}?\.?$/u.test(w)) return w.toUpperCase(); // ініціали Л.Т.
  if (w.length <= 3 && !VOWELS.test(w) && /\p{L}/u.test(w)) return w.toUpperCase(); // абревіатури МЗ, ЦНАП-подібні
  return first || PROPER.test(w) ? cap(w) : w;
};
const sentence = (s, capFirst = true) =>
  s
    .toLowerCase()
    .replace(/№\s*/g, '№ ')
    .split(/\s+/)
    .filter(Boolean)
    .map((w, i) => word(w, capFirst && i === 0))
    .join(' ');
// Коротка назва в лапках: до двох слів – кожне з великої («Доктор Алекс»), довша – як речення.
const brand = (s) => {
  const ws = s.trim().split(/\s+/);
  return ws.length <= 2 ? ws.map((w) => word(w.toLowerCase(), true)).join(' ') : sentence(s);
};
const isUpper = (s) => s === s.toUpperCase();
const fopName = (raw) => {
  const [surname, ...given] = raw.trim().split(/\s+/);
  return `ФОП ${cap(surname.toLowerCase())} ${given.map((g) => g[0].toUpperCase() + '.').join(' ')}`.trim();
};
const names = (raw, ownership) => {
  const src = raw.replace(/\s{2,}/g, ' ').trim();
  if (/фоп/i.test(ownership ?? '')) {
    const n = fopName(src);
    return { name: n, registry_name: n };
  }
  let rest = src;
  let form = '';
  for (const [full, short] of FORMS) {
    if (rest.toUpperCase().startsWith(full)) {
      form = short;
      rest = rest.slice(full.length).trim();
      break;
    }
  }
  const fix = (t) => (isUpper(t) ? t : t); // назви не великими літерами лишаємо як є
  const parts = rest.split(/["«»“”„]+/).map((x) => x.trim());
  let name, full;
  if (parts.length >= 2 && parts[1]) {
    const before = parts[0] ? fix(isUpper(parts[0]) ? sentence(parts[0]) : parts[0]) : '';
    const inside = isUpper(parts[1]) ? brand(parts[1]) : parts[1];
    const after = parts.slice(2).filter(Boolean).join(' ');
    const afterS = after ? (isUpper(after) ? sentence(after, false) : after) : '';
    const quoted = `«${inside}»`;
    full = [form, before, quoted, afterS].filter(Boolean).join(' ');
    const shortAfter = /^харківської міської ради$/iu.test(afterS) ? '' : afterS;
    name = [before ? `${before} ${quoted}` : inside, shortAfter].filter(Boolean).join(' ');
  } else {
    name = isUpper(rest) ? sentence(rest) : rest;
    full = [form, name].filter(Boolean).join(' ');
  }
  return { name, registry_name: full };
};
let overrides = {};
try {
  overrides = JSON.parse(readFileSync('data/screening/name-overrides.json', 'utf8'));
} catch {}
const normAddr = (s) => s.toLowerCase().replace(/[.,]/g, ' ').replace(/\s+/g, ' ').trim();

const cityLc = cityName.toLowerCase();
// Без колонки населеного пункту місто беремо з адреси «УКРАЇНА, … область, м. ХАРКІВ, вулиця»:
// просте входження зачепило б «Харківське шосе» в Києві чи «Харківську область».
const cityInAddress = new RegExp(`(^|,)\\s*м\\.\\s*${cityLc.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*(,|$)`, 'iu');
const inCity = rows.slice(1).filter((r) =>
  idx.settlement >= 0 ? (r[idx.settlement] ?? '').toLowerCase().trim() === cityLc : cityInAddress.test(r[idx.address] ?? ''),
);
// «УКРАЇНА, ХАРКІВСЬКА область, м. ХАРКІВ, ЯРОСЛАВА МУДРОГО 30-А» → «Ярослава Мудрого 30-А»
const STREET_TYPE = /^(вул|вулиця|пр|пр-т|просп|проспект|пров|провулок|пл|площа|бульв|бул|бульвар)\.?\s+/iu;
const LOWER_WORDS = new Set(['шлях', 'узвіз', 'набережна', 'шосе', 'літ', 'літ.', 'корп', 'корп.']);
const streetPart = (s) => {
  const parts = s.split(',').map((x) => x.trim());
  const i = parts.findIndex((x) => /^м\.\s/iu.test(x));
  const street = (i >= 0 ? parts.slice(i + 1) : parts).join(', ').toLowerCase().replace(STREET_TYPE, '');
  return street
    .split(/\s+/)
    .map((w, k) => (k > 0 && LOWER_WORDS.has(w) ? w : w.replace(/(^|[(«"-])(\p{L})/gu, (_, a, b) => a + b.toUpperCase())))
    .join(' ')
    .replace(/(\d+)\s*-?\s*(\p{L})(?=$|[\s,/])/gu, (_, n, l) => `${n}-${l.toUpperCase()}`);
};

const partners = JSON.parse(readFileSync('data/screening/partners.json', 'utf8')).partners.filter((p) => p.city === citySlug);
const byEdrpou = new Map();
for (const r of inCity) {
  const edrpou = (r[idx.edrpou] ?? '').replace(/\D/g, '');
  const address = streetPart((r[idx.address] ?? '').trim());
  if (!edrpou) continue;
  const inst = byEdrpou.get(edrpou) ?? { edrpou, ...names(r[idx.name] ?? '', idx.ownership >= 0 ? r[idx.ownership] : ''), ...(overrides[edrpou] ?? {}), addresses: [] };
  if (address && !inst.addresses.some((a) => normAddr(a) === normAddr(address))) inst.addresses.push(address);
  byEdrpou.set(edrpou, inst);
}

const institutions = [...byEdrpou.values()].map((inst) => {
  const p = partners.find(
    (p) => p.edrpou.includes(inst.edrpou) || inst.addresses.some((a) => p.addresses.some((pa) => normAddr(a).endsWith(normAddr(pa)))),
  );
  return p
    ? { ...inst, is_partner: true, partner_brand: p.brands?.[inst.edrpou] ?? p.brand, clinic_slug: p.clinic_slug, online_booking: Boolean(p.online_booking) }
    : { ...inst, is_partner: false, online_booking: false };
});

const out = `data/screening/registry-${citySlug}.json`;
writeFileSync(out, JSON.stringify({ city: citySlug, as_of: asOf, source: 'https://screening.moz.gov.ua/', institutions }, null, 2) + '\n');
console.log(`${out}: ${inCity.length} рядків реєстру → ${institutions.length} закладів, партнерів: ${institutions.filter((i) => i.is_partner).length}`);
