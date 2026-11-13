#!/usr/bin/env node
// Синхронізація цін клініки з таблиці цін у Supabase (clinic_services, checkup_programs).
//
// Вхід — CSV-експорт аркуша «ОНКЛІНІК ціни» з таблиці цін (одна позиція на рядок).
// Рядок заголовка шукається серед перших 10 (над ним можуть бути назва й примітка);
// дані закінчуються першим рядком з порожнім ID. Назви колонок — columns.json.
// Рядок без «Нової ціни» — без змін, пропускається.
//
// Ключ зіставлення (перше непорожнє): колонка «Ключ БД», файл --map (ID → ключ),
// код послуги клініки:
//   program:<slug>   → checkup_programs (clinic, slug): price_discount = ціна,
//                      price_regular = ціна без знижки (або ціна, якщо її немає)
//   service:<code>   → clinic_services (clinic, city, code): price
//   <код клініки>    → те саме, що service:<код>
//
// Без --apply скрипт нічого не змінює: друкує звіт «що зміниться».
// Застосовуються лише рядки з датою «діє з» <= --today. Підозрілі рядки (невідомий
// ключ, ціна не число, зміна більше --max-change-pct) не застосовуються ніколи —
// вони йдуть у звіт «потребує рішення».
//
//   node scripts/prices/sync-prices.mjs --clinic onclinic-kharkiv --city kharkiv --csv prices.csv
//   node scripts/prices/sync-prices.mjs ... --apply      (потрібен SUPABASE_SERVICE_ROLE_KEY)
//   node scripts/prices/sync-prices.mjs ... --db-json snapshot.json   (перевірка на знімку бази, без мережі)

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));

export function parseArgs(argv) {
  const args = { maxChangePct: 30, today: kyivToday() };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const next = () => argv[++i];
    if (a === '--clinic') args.clinic = next();
    else if (a === '--city') args.city = next();
    else if (a === '--csv') args.csv = next();
    else if (a === '--today') args.today = next();
    else if (a === '--max-change-pct') args.maxChangePct = Number(next());
    else if (a === '--apply') args.apply = true;
    else if (a === '--json') args.json = true;
    else if (a === '--db-json') args.dbJson = next();
    else if (a === '--map') args.map = next();
  }
  return args;
}

export function kyivToday() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Kyiv' }).format(new Date());
}

// ── CSV (RFC 4180: лапки, коми й переноси всередині лапок) ───────────────────
export function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  const src = text.replace(/^﻿/, '');
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (quoted) {
      if (ch === '"' && src[i + 1] === '"') { field += '"'; i++; }
      else if (ch === '"') quoted = false;
      else field += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ',') { row.push(field); field = ''; }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && src[i + 1] === '\n') i++;
      row.push(field); field = '';
      if (row.some((c) => c.trim() !== '')) rows.push(row);
      row = [];
    } else field += ch;
  }
  row.push(field);
  if (row.some((c) => c.trim() !== '')) rows.push(row);
  return rows;
}

export function mapColumns(header, columns) {
  const norm = (s) => s.trim().toLowerCase().replace(/\s+/g, ' ');
  const idx = {};
  for (const [field, names] of Object.entries(columns)) {
    if (field.startsWith('_')) continue;
    const wanted = names.map(norm);
    const i = header.findIndex((h) => wanted.includes(norm(h)));
    if (i >= 0) idx[field] = i;
  }
  return idx;
}

/** «12 673», «12673,00», «12 673 грн» → 12673; порожнє → null; інше → NaN. */
export function parsePrice(raw) {
  if (raw == null) return null;
  const s = String(raw).replace(/грн|₴|uah/gi, '').replace(/[\s ]/g, '').replace(',', '.');
  if (s === '') return null;
  const n = Number(s);
  return Number.isFinite(n) ? Math.round(n) : NaN;
}

/** «01.11.2026», «2026-11-01», «1.11.26» → '2026-11-01'; не дата → null. */
export function parseDate(raw) {
  const s = String(raw ?? '').trim();
  let m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  m = s.match(/^(\d{1,2})[./](\d{1,2})[./](\d{2}|\d{4})$/);
  if (m) {
    const y = m[3].length === 2 ? `20${m[3]}` : m[3];
    return `${y}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
  }
  return null;
}

export function readSheetRows(csvText, columns) {
  const all = parseCsv(csvText);
  if (!all.length) throw new Error('CSV порожній');
  const headerAt = all.slice(0, 10).findIndex((r) => {
    const m = mapColumns(r, columns);
    return m.price != null && m.valid_from != null;
  });
  if (headerAt < 0) throw new Error('у перших 10 рядках CSV немає заголовка з «Нова ціна» і «Діє з» (див. columns.json)');
  const idx = mapColumns(all[headerAt], columns);
  if (idx.code == null && idx.db_key == null && idx.id == null) throw new Error('у CSV немає ні ID, ні коду клініки, ні ключа БД');
  const cell = (r, f) => (idx[f] == null ? '' : (r[idx[f]] ?? '').trim());
  let body = all.slice(headerAt + 1);
  if (idx.id != null) {
    const end = body.findIndex((r) => !cell(r, 'id'));
    if (end >= 0) body = body.slice(0, end);
  }
  return body.map((r, n) => ({
    line: headerAt + n + 2,
    id: cell(r, 'id'),
    code: cell(r, 'code'),
    name: cell(r, 'name'),
    city: cell(r, 'city'),
    dbKey: cell(r, 'db_key'),
    price: parsePrice(cell(r, 'price')),
    priceBefore: parsePrice(cell(r, 'price_before')),
    validFromRaw: cell(r, 'valid_from'),
    validFrom: parseDate(cell(r, 'valid_from')),
  }));
}

// Місто в таблиці пишуть назвою («Харків»), у базі — slug («kharkiv»).
const CITY_SLUGS = {
  'харків': 'kharkiv', 'дніпро': 'dnipro', 'київ': 'kyiv', 'львів': 'lviv', 'одеса': 'odesa',
  'миколаїв': 'mykolaiv', 'рівне': 'rivne', 'запоріжжя': 'zaporizhzhia', 'вінниця': 'vinnytsia',
};
export function citySlug(name) {
  const n = (name ?? '').trim().toLowerCase();
  return CITY_SLUGS[n] ?? n;
}

export function normCode(code) {
  return String(code ?? '').trim().toUpperCase().replace(/\s+/g, '').replace(/-OH$/, '');
}

// ── План змін: чиста функція, без мережі ─────────────────────────────────────
// db = { programs: [{id, slug, name_ua, price_regular, price_discount, price_date}],
//        services: [{id, code, name_ua, city, price, price_date}] }
export function planPriceUpdate(rows, db, { city, today, maxChangePct, map = {} }) {
  const programs = new Map(db.programs.map((p) => [p.slug, p]));
  const services = new Map(
    db.services.filter((s) => s.code && (!city || s.city === city)).map((s) => [normCode(s.code), s])
  );
  const out = { apply: [], scheduled: [], unchanged: [], held: [] };
  const hold = (row, reason) => out.held.push({ row, reason });
  const seen = new Set();

  for (const row of rows) {
    if (row.price == null) continue; // нової ціни немає — без змін
    if (city && row.city && citySlug(row.city) !== city) continue; // інше місто
    if (Number.isNaN(row.price)) { hold(row, 'ціна не число'); continue; }
    if (row.price <= 0) { hold(row, 'ціна нуль або менше'); continue; }
    if (Number.isNaN(row.priceBefore)) { hold(row, 'ціна без знижки не число'); continue; }
    if (!row.validFrom) { hold(row, `дата «діє з» не розпізнана: «${row.validFromRaw}»`); continue; }

    const key = row.dbKey || (row.id && map[row.id]) || row.code;
    if (!key) { hold(row, `${row.id || 'рядок'} ще не зіставлено з базою (немає ні ключа, ні коду клініки)`); continue; }
    let target;
    if (key.startsWith('program:')) {
      const p = programs.get(key.slice(8).trim());
      if (!p) { hold(row, `програми ${key.slice(8)} немає в базі`); continue; }
      // Без «ціни без знижки» закреслена ціна зберігає ту саму пропорцію до ціни, що й зараз.
      const ratio = p.price_regular && p.price_discount ? p.price_regular / p.price_discount : 1;
      const before = row.priceBefore ?? Math.round(row.price * ratio);
      if (before < row.price) { hold(row, 'ціна без знижки менша за ціну'); continue; }
      target = {
        table: 'checkup_programs', id: p.id, label: p.name_ua,
        old: p.price_discount, oldDate: p.price_date,
        patch: { price_discount: row.price, price_regular: before, price_date: row.validFrom },
        same: p.price_discount === row.price && p.price_regular === before,
      };
    } else {
      const code = key.startsWith('service:') ? key.slice(8).trim() : key;
      const s = services.get(normCode(code));
      if (!s) { hold(row, `послуги з кодом ${code} немає в базі`); continue; }
      target = {
        table: 'clinic_services', id: s.id, label: s.name_ua,
        old: s.price == null ? null : Number(s.price), oldDate: s.price_date,
        patch: { price: row.price, price_date: row.validFrom },
        same: s.price != null && Number(s.price) === row.price,
      };
    }

    const dupKey = `${target.table}:${target.id}:${row.validFrom}`;
    if (seen.has(dupKey)) { hold(row, 'позиція двічі з тією ж датою'); continue; }
    seen.add(dupKey);

    const change = { row, ...target };
    if (target.same) { out.unchanged.push(change); continue; }
    if (target.old != null && target.old > 0) {
      const pct = Math.abs(row.price - target.old) / target.old * 100;
      change.pct = Math.round(pct * 10) / 10;
      if (pct > maxChangePct) { hold(row, `зміна ${change.pct}% (більше ${maxChangePct}%): ${target.old} → ${row.price}`); continue; }
    }
    if (target.oldDate && row.validFrom < target.oldDate) { hold(row, `дата ${row.validFrom} старіша за чинну ${target.oldDate}`); continue; }
    (row.validFrom <= today ? out.apply : out.scheduled).push(change);
  }
  return out;
}

export function formatReport(plan, { clinic, city, today, apply }) {
  const L = [];
  const money = (n) => (n == null ? '—' : `${n.toLocaleString('uk-UA').replace(/ /g, ' ')} грн`);
  const line = (c) => `- ${c.label}: ${money(c.old)} → ${money(c.row.price)} з ${c.row.validFrom}`
    + (c.patch.price_regular != null ? ` (закреслена ${money(c.patch.price_regular)})` : '');
  L.push(`Ціни ${clinic}${city ? ` (${city})` : ''} на ${today}${apply ? '' : ' — перевірка, нічого не змінено'}`);
  L.push('');
  L.push(`${apply ? 'Оновлено' : 'Буде оновлено'}: ${plan.apply.length}`);
  for (const c of plan.apply) L.push(line(c));
  if (plan.scheduled.length) {
    L.push('', `Чекають дати: ${plan.scheduled.length}`);
    for (const c of plan.scheduled) L.push(line(c));
  }
  if (plan.held.length) {
    L.push('', `Потребує рішення: ${plan.held.length}`);
    for (const h of plan.held) L.push(`- рядок ${h.row.line} ${h.row.name || h.row.code || h.row.dbKey}: ${h.reason}`);
  }
  L.push('', `Без змін: ${plan.unchanged.length}`);
  return L.join('\n');
}

// ── Мережа: Supabase REST ────────────────────────────────────────────────────
function sbConfig(needWrite) {
  const url = (process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').replace(/\/+$/, '');
  const key = needWrite
    ? process.env.SUPABASE_SERVICE_ROLE_KEY
    : process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error(needWrite ? 'для --apply потрібні SUPABASE_URL і SUPABASE_SERVICE_ROLE_KEY' : 'потрібні SUPABASE_URL і ключ Supabase');
  return { url, headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' } };
}

async function sbGet(cfg, path) {
  const res = await fetch(`${cfg.url}/rest/v1/${path}`, { headers: cfg.headers });
  if (!res.ok) throw new Error(`GET ${path.split('?')[0]}: ${res.status} ${await res.text()}`);
  return res.json();
}

export async function loadDb(cfg, clinicSlug) {
  const [clinic] = await sbGet(cfg, `clinics?slug=eq.${encodeURIComponent(clinicSlug)}&select=id&limit=1`);
  if (!clinic) throw new Error(`клініки ${clinicSlug} немає в базі`);
  const [programs, services] = await Promise.all([
    sbGet(cfg, `checkup_programs?clinic_id=eq.${clinic.id}&select=id,slug,name_ua,price_regular,price_discount,price_date`),
    sbGet(cfg, `clinic_services?clinic_id=eq.${clinic.id}&select=id,code,name_ua,city,price,price_date`),
  ]);
  return { programs, services };
}

async function applyPlan(cfg, plan) {
  for (const c of plan.apply) {
    const res = await fetch(`${cfg.url}/rest/v1/${c.table}?id=eq.${c.id}`, {
      method: 'PATCH',
      headers: { ...cfg.headers, Prefer: 'return=minimal' },
      body: JSON.stringify(c.patch),
    });
    if (!res.ok) throw new Error(`PATCH ${c.table} ${c.id}: ${res.status} ${await res.text()}`);
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.clinic || !args.csv) {
    console.error('Використання: --clinic <slug> --csv <файл> [--city <slug>] [--map <id→ключ.json>] [--today YYYY-MM-DD] [--apply]');
    process.exit(2);
  }
  const columns = JSON.parse(readFileSync(join(HERE, 'columns.json'), 'utf8'));
  const rows = readSheetRows(readFileSync(args.csv, 'utf8'), columns);
  // --db-json: знімок бази з файлу (перевірка без доступу до Supabase); з --apply не поєднується.
  if (args.dbJson && args.apply) throw new Error('--db-json не можна поєднувати з --apply');
  const cfg = args.dbJson ? null : sbConfig(!!args.apply);
  const db = args.dbJson ? JSON.parse(readFileSync(args.dbJson, 'utf8')) : await loadDb(cfg, args.clinic);
  const map = args.map ? JSON.parse(readFileSync(args.map, 'utf8')) : {};
  const plan = planPriceUpdate(rows, db, { ...args, map });
  if (args.apply) await applyPlan(cfg, plan);
  console.log(args.json ? JSON.stringify(plan, null, 2) : formatReport(plan, args));
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main().catch((e) => { console.error(e.message); process.exit(1); });
}
