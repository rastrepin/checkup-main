#!/usr/bin/env node
// Звіряє рядки checkup_programs у базі з docs/turkey/programs.json (глибоке порівняння) і друкує кількість програм по клініках.
// Читає публічним (anon) ключем, лише SELECT. Змінні: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY.
// Запуск з кореня репо (у контейнері без прямого виходу в мережу – NODE_USE_ENV_PROXY=1):
//   node scripts/turkey/verify-seed.mjs
import { readFileSync } from 'node:fs';
import { isDeepStrictEqual } from 'node:util';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !key) throw new Error('Supabase env vars missing');

const src = JSON.parse(readFileSync('docs/turkey/programs.json', 'utf8'));
const get = async (path) => {
  const res = await fetch(`${url}/rest/v1/${path}`, { headers: { apikey: key } });
  if (!res.ok) throw new Error(`${path}: ${res.status}`);
  return res.json();
};

const clinics = await get('clinics?select=id,slug&slug=in.(liv-hospital-istanbul,acibadem-istanbul,anadolu-istanbul)');
const bySlug = Object.fromEntries(clinics.map((c) => [c.id, c.slug]));
const rows = await get(`checkup_programs?select=*&clinic_id=in.(${clinics.map((c) => c.id).join(',')})`);

const counts = {};
for (const r of rows) counts[bySlug[r.clinic_id]] = (counts[bySlug[r.clinic_id]] ?? 0) + 1;
console.log('у базі по клініках:', counts, 'усього', rows.length, 'із', src.programs.length);

let bad = 0;
for (const p of src.programs) {
  const r = rows.find((x) => x.slug === p.slug && bySlug[x.clinic_id] === p.clinic_slug);
  if (!r) { console.log('НЕМАЄ', p.slug); bad++; continue; }
  const details = { summary: p.summary ?? null, duration: p.duration ?? null, description: p.description ?? [], goals: p.goals ?? [], preparation: p.preparation ?? [] };
  const want = {
    name_ua: p.name_ua, name_ru: p.name_ru, gender: p.gender ?? null, age_group: p.age_group ?? null,
    price_regular: p.price_usd, price_discount: p.price_usd, currency: 'USD', price_date: src.price_date,
    program_type: 'clinic', is_active: true, composition: p.composition, details,
  };
  for (const [k, v] of Object.entries(want)) {
    if (!isDeepStrictEqual(r[k], v)) { console.log('РОЗБІЖНІСТЬ', p.slug, k); bad++; }
  }
}
console.log(bad === 0 ? 'ОК: усі присутні програми збігаються з programs.json' : `Розбіжностей: ${bad}`);
process.exit(bad === 0 ? 0 : 1);
