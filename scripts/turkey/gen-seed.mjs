#!/usr/bin/env node
// Генерує SQL міграції /turkey* з docs/turkey/programs.json (TURKEY-MIGRATION.md v0.6, розділ 2).
// Нічого не вигадує: усі значення – з programs.json і розділу 2 документа. Запуск з кореня репо:
//   node scripts/turkey/gen-seed.mjs
// Пише supabase/migrations/20261117_turkey_seed_*.sql (по клініках; ідемпотентний: ON CONFLICT DO NOTHING – зміни цін пізніше робить Ігор у Table Editor).
import { readFileSync, writeFileSync } from 'node:fs';

const src = JSON.parse(readFileSync('docs/turkey/programs.json', 'utf8'));

const q = (s) => (s === null || s === undefined ? 'NULL' : `'${String(s).replace(/'/g, "''")}'`);
const j = (v) => `$j$${JSON.stringify(v)}$j$::jsonb`;

// Клініки (розділ 2): city istanbul, tier catalog, без telegram_chat_id і notify_email.
const CLINICS = [
  { slug: 'liv-hospital-istanbul', name: 'LIV Hospital' },
  { slug: 'acibadem-istanbul', name: 'Acibadem' },
  { slug: 'anadolu-istanbul', name: 'Anadolu medical center' },
];
// Філії (розділ 2, п. 3; адреси дослівно з docs/turkey/tilda/abroad-*.md). Acibadem – без філії.
const BRANCHES = [
  { slug: 'liv-hospital-ulus', clinic: 'liv-hospital-istanbul', name: 'LIV Hospital Ulus', address: 'Ahmet Adnan Saygun Cad., Canan Sokak No:5 34340 Beşiktaş, Стамбул, Турция' },
  { slug: 'gebze-anadolu-medical-center', clinic: 'anadolu-istanbul', name: 'Gebze Anadolu Medical Center', address: 'Cumhuriyet Mahallesi, 2255. Sk. No:3 41400 Gebze/Kocaeli, Турция' },
];

let out = [];
out.push('-- TURKEY-MIGRATION v0.6, розділ 2: сід. Згенеровано scripts/turkey/gen-seed.mjs з docs/turkey/programs.json. Ідемпотентний (DO NOTHING).');
for (const c of CLINICS) {
  out.push(
    `INSERT INTO clinics (name, slug, city, tier, is_active) VALUES (${q(c.name)}, ${q(c.slug)}, 'istanbul', 'catalog', true) ON CONFLICT (slug) DO NOTHING;`,
  );
}
BRANCHES.forEach((b, i) => {
  out.push(
    `INSERT INTO clinic_branches (clinic_id, name_ua, name_ru, address_ua, address_ru, schedule, city, slug, sort_order) SELECT id, ${q(b.name)}, ${q(b.name)}, ${q(b.address)}, ${q(b.address)}, '{}'::jsonb, 'istanbul', ${q(b.slug)}, ${i} FROM clinics WHERE slug = ${q(b.clinic)} ON CONFLICT (slug) DO NOTHING;`,
  );
});

const order = {};
for (const p of src.programs) {
  order[p.clinic_slug] = (order[p.clinic_slug] ?? -1) + 1;
  const details = { summary: p.summary ?? null, duration: p.duration ?? null, description: p.description ?? [], goals: p.goals ?? [], preparation: p.preparation ?? [] };
  out.push(
    `INSERT INTO checkup_programs (clinic_id, slug, name_ua, name_ru, gender, age_group, price_regular, price_discount, composition, is_specialized, is_active, sort_order, program_type, price_date, currency, details) SELECT id, ${q(p.slug)}, ${q(p.name_ua)}, ${q(p.name_ru)}, ${q(p.gender)}, ${q(p.age_group)}, ${p.price_usd}, ${p.price_usd}, ${j(p.composition)}, false, true, ${order[p.clinic_slug]}, 'clinic', ${q(src.price_date)}, 'USD', ${j(details)} FROM clinics WHERE slug = ${q(p.clinic_slug)} ON CONFLICT (clinic_id, slug) DO NOTHING;`,
  );
}
// Частини: 1 – клініки і філії; далі – програми по клініках.
const parts = { '1_clinics_branches': out.filter((l) => !l.includes('INTO checkup_programs')) };
for (const c of CLINICS) parts[`2_programs_${c.slug.split('-')[0]}`] = out.filter((l) => l.includes('INTO checkup_programs') && l.includes(`FROM clinics WHERE slug = '${c.slug}'`));
for (const [name, lines] of Object.entries(parts)) writeFileSync(`supabase/migrations/20261117_turkey_seed_${name}.sql`, lines.join('\n') + '\n');
console.log(Object.entries(parts).map(([k, v]) => `${k}: ${v.length}`).join(', '));
