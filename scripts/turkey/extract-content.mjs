#!/usr/bin/env node
// Дістає тексти сторінок /turkey* з docs/turkey/tilda/*.md ДОСЛІВНО (TURKEY-MIGRATION.md v0.6, розділ 3).
// Нічого не пише і не змінює: лише вибирає блоки Tilda за id і зберігає рядки як є.
// Запуск з кореня репо:  node scripts/turkey/extract-content.mjs
// Пише lib/turkey/content.generated.ts (комітиться; перегенерувати після зміни docs/turkey/tilda/).
import { readFileSync, writeFileSync } from 'node:fs';

const DIR = 'docs/turkey/tilda/';

function blocks(file) {
  const map = {};
  let id = null;
  for (const raw of readFileSync(DIR + file, 'utf8').split('\n')) {
    const m = raw.match(/^## Блок (rec\d+)/);
    if (m) { id = m[1]; map[id] = []; continue; }
    if (id && raw.startsWith('- ')) map[id].push(raw.slice(2));
  }
  return map;
}
const strip = (s, prefix) => (s.startsWith(prefix) ? s.slice(prefix.length) : s);

/** Блок «Как проходит…»: [заголовок H2, [[номер, назва, текст] × 5]]. */
function steps(lines) {
  const title = strip(lines[0], 'H2: ');
  const items = [];
  for (let i = 1; i + 2 < lines.length; i += 3) items.push([lines[i + 1], lines[i + 2], lines[i]]);
  return { title, steps: items.map(([name, text, num]) => ({ num, name, text })) };
}

/** Абзаци і перелік опису клініки: рядок, що вже входить у попередній, – це підпис посилання Tilda, його пропускаємо. */
function about(ids, b) {
  const lines = ids.flatMap((id) => b[id]);
  const kept = [];
  for (const l of lines) if (!kept.some((k) => k.includes(l))) kept.push(l);
  return kept;
}

/**
 * «Ключевые преимущества» (abroad, хвиля B, TURKEY-MIGRATION v0.7, розділ 3, п. 1а). Рядки – дослівно з md.
 * У md підзаголовки Anadolu не позначені (плоский список), тому їх чотири рядки названо тут явно: усе, що йде
 * після підзаголовка до наступного, – його пункти. LIV – без підзаголовків (одна група).
 */
const ANADOLU_ADVANTAGE_SUBHEADS = [
  'Международная аккредитация',
  'Передовая медицинская экспертиза',
  'Полный спектр услуг для медицинских туристов',
  'Междисциплинарный подход к диагностике и лечению',
];
function advantages(file, id, subheads) {
  const l = blocks(file)[id];
  const title = strip(l[0], 'H2: ');
  const rest = l.slice(1);
  if (!subheads) return { title, groups: [{ title: null, items: rest }] };
  const groups = [];
  for (const line of rest) {
    if (subheads.includes(line)) groups.push({ title: line, items: [] });
    else if (groups.length > 0) groups[groups.length - 1].items.push(line);
    else throw new Error(`«Ключевые преимущества»: перший рядок «${line}» не підзаголовок`);
  }
  if (groups.length !== subheads.length) throw new Error('«Ключевые преимущества»: не всі підзаголовки знайдено');
  return { title, groups };
}

const SPEC = {
  livhospital: { file: 'turkey-livhospital.md', h1: 'rec194611636', crumbs: 'rec194611637', about: ['rec194611639'], steps: 'rec194611653', form: 'rec194611655' },
  anadolu: { file: 'turkey-anadolu.md', h1: 'rec184754728', crumbs: 'rec202005686', about: ['rec184754730', 'rec184754731'], steps: 'rec185657023', form: 'rec186556493' },
  acibadem: { file: 'turkey-acibadem.md', h1: 'rec192942551', crumbs: 'rec202006396', about: ['rec192942554'], steps: 'rec192942567', form: 'rec192942569' },
};

const out = { hub: {}, clinics: {} };

const hub = blocks('turkey.md');
const hubCards = hub.rec202344048;
out.hub = {
  h1: strip(hub.rec197686332[0], 'H1: '),
  sub: hub.rec197686332[1],
  crumbs: [hub.rec197686333[0], hub.rec197686333[2]],
  h2: strip(hubCards[0], 'H2: '),
  // Порядок карток на Tilda: Anadolu, Acibadem, LIV Hospital.
  cards: [
    { clinic: 'anadolu', title: hubCards[1], text: hubCards[2], link: hubCards[3] },
    { clinic: 'acibadem', title: hubCards[4], text: hubCards[5], link: hubCards[6] },
    { clinic: 'livhospital', title: hubCards[7], text: hubCards[8], link: hubCards[9] },
  ],
  formTitle: hub.rec202344949[0],
  // Блок довіри, 3 пункти (abroad-home.md, rec738119221; хвиля B, розділ 3, п. 3а).
  trust: blocks('abroad-home.md').rec738119221,
  // 5 кроків «Как проходит чек-ап за границей» – abroad-livhospital.md (розділ 3, хаб, п. 3).
  steps: (() => {
    const l = blocks('abroad-livhospital.md').rec781721914;
    return { title: l[0], steps: steps(['H2: ' + l[0], ...l.slice(1)]).steps };
  })(),
};

for (const [slug, s] of Object.entries(SPEC)) {
  const b = blocks(s.file);
  out.clinics[slug] = {
    h1: strip(b[s.h1][0], 'H1: '),
    sub: b[s.h1][1],
    chips: b[s.h1].slice(2),
    crumbs: b[s.crumbs].filter((x) => x !== '→'),
    about: about(s.about, b),
    howTitle: steps(b[s.steps]).title,
    howSteps: steps(b[s.steps]).steps,
    formTitle: b[s.form][0],
  };
}

out.clinics.livhospital.advantages = advantages('abroad-livhospital.md', 'rec781809938', null);
out.clinics.anadolu.advantages = advantages('abroad-anadolu.md', 'rec789641742', ANADOLU_ADVANTAGE_SUBHEADS);

const body = `// Згенеровано scripts/turkey/extract-content.mjs з docs/turkey/tilda/*.md. НЕ редагувати вручну: тексти – дослівно з Tilda.\n// Перегенерувати: node scripts/turkey/extract-content.mjs\n\nexport const TURKEY_CONTENT = ${JSON.stringify(out, null, 2)} as const;\n`;
writeFileSync('lib/turkey/content.generated.ts', body);
console.log('hub cards', out.hub.cards.length, 'hub steps', out.hub.steps.steps.length, Object.fromEntries(Object.entries(out.clinics).map(([k, v]) => [k, { about: v.about.length, steps: v.howSteps.length }])));
