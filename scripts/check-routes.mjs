#!/usr/bin/env node
// Prebuild-перевірка проксі-схеми Tilda → Next.js (рішення Р42).
//
// Правило: усі URL, яких немає в lib/seo/approved-routes.json, відкриває
// Tilda (middleware.ts). Тут перевіряється, що перелік узгоджений з кодом
// і оточенням:
//
// 1. Кожен погоджений шлях має page.tsx у app/ – інакше білд падає
//    (одруківка в переліку дала б 404 Next.js замість сторінки).
// 2. Production-білд без TILDA_ORIGIN падає – без змінної middleware
//    пропускав би всі запити в Next.js, і чернетки стали б видимими.
// 3. У лог деплою друкується інвентар: погоджені сторінки, чернетки
//    (є в app/, немає в переліку) і які Tilda-URL перекриваються.

import { readdirSync, statSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const APP_DIR = 'app';
const APPROVED_FILE = join('lib', 'seo', 'approved-routes.json');
const PAGE_FILES = new Set(['page.tsx', 'page.ts', 'page.jsx', 'page.js']);

const routes = [];
function walk(dir, segments) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (!statSync(full).isDirectory()) {
      if (PAGE_FILES.has(entry)) routes.push('/' + segments.join('/'));
      continue;
    }
    if (entry.startsWith('(') || entry.startsWith('@')) {
      walk(full, segments);
      continue;
    }
    if (entry.startsWith('_')) continue;
    walk(full, [...segments, entry]);
  }
}
walk(APP_DIR, []);
routes.sort();

const normalize = (p) => (p.replace(/\/+$/, '') || '/');
const approvedRaw = JSON.parse(readFileSync(APPROVED_FILE, 'utf8'));
if (!Array.isArray(approvedRaw) || approvedRaw.some((p) => typeof p !== 'string' || !p.startsWith('/'))) {
  console.error(`\n[check-routes] БІЛД ЗУПИНЕНО: ${APPROVED_FILE} має бути масивом шляхів, що починаються з "/".\n`);
  process.exit(1);
}
const approved = [...new Set(approvedRaw.map(normalize))].sort();

// Погоджений шлях без сторінки в app/ – помилка переліку.
// Динамічні сегменти ([slug]) тут не резолвляться навмисно: у переліку
// мають бути буквальні адреси, а буквальна адреса має мати буквальну папку.
const routeSet = new Set(routes);
const missing = approved.filter((p) => !routeSet.has(p));
if (missing.length > 0) {
  console.error('\n[check-routes] БІЛД ЗУПИНЕНО: у approved-routes.json є шляхи без page.tsx у app/:');
  for (const m of missing) console.error('  - ' + m);
  console.error('');
  process.exit(1);
}

// 301 хвилі 1 (lib/seo/redirects-wave1.json, SEO-MIGRATION v2.4 §3–4): один стрибок і лише на сторінку Next.js.
// Ціль – буквальна сторінка в app/ (не адреса Tilda), не джерело іншого правила; джерела без дублів і не погоджені.
// Активність (ціль у approved-routes.json) тут лише друкується – вмикає її next.config.ts.
const REDIRECTS_FILE = join('lib', 'seo', 'redirects-wave1.json');
const redirects = JSON.parse(readFileSync(REDIRECTS_FILE, 'utf8'));
const redirectErrors = [];
const sources = new Set();
const sourceMatches = (r, p) => {
  if (r.match === 'tproduct-id') {
    const i = r.source.lastIndexOf('/');
    const id = r.source.slice(i + 1).match(/^\d+-\d+/)?.[0] ?? r.source.slice(i + 1);
    const prefix = `${r.source.slice(0, i)}/${id}`;
    return p === prefix || p.startsWith(`${prefix}-`);
  }
  if (r.match === 'path') return p === r.source;
  return p === r.source || p.startsWith(`${r.source}/`);
};
for (const r of redirects) {
  const tag = `${r.source} → ${r.destination}`;
  if (!r.source?.startsWith('/') || !r.destination?.startsWith('/')) redirectErrors.push(`${tag}: шляхи мають починатися з "/"`);
  if (!['path-and-children', 'path', 'tproduct-id'].includes(r.match)) redirectErrors.push(`${tag}: невідомий match "${r.match}"`);
  if (sources.has(r.source)) redirectErrors.push(`${tag}: дубль джерела`);
  sources.add(r.source);
  if (!routeSet.has(normalize(r.destination))) redirectErrors.push(`${tag}: ціль не має page.tsx у app/ (301 на Tilda заборонено)`);
  if (approved.includes(normalize(r.source))) redirectErrors.push(`${tag}: джерело – погоджена сторінка Next.js`);
  for (const other of redirects) {
    if (other !== r && sourceMatches(other, normalize(r.destination))) redirectErrors.push(`${tag}: ціль – джерело іншого правила (ланцюжок)`);
  }
}
if (redirectErrors.length > 0) {
  console.error(`\n[check-routes] БІЛД ЗУПИНЕНО: помилки в ${REDIRECTS_FILE}:`);
  for (const e of redirectErrors) console.error('  - ' + e);
  console.error('');
  process.exit(1);
}
const activeRedirects = redirects.filter((r) => approved.includes(normalize(r.destination)));
console.log(`[check-routes] 301 хвилі 1: ${redirects.length}, активних (ціль погоджена): ${activeRedirects.length}.`);

// Production без origin – чернетки стали б видимими.
const origin = process.env.TILDA_ORIGIN?.replace(/\/$/, '');
if (process.env.VERCEL_ENV === 'production' && !origin) {
  console.error('\n[check-routes] БІЛД ЗУПИНЕНО: TILDA_ORIGIN не задана для Production. Без неї middleware не проксіює на Tilda.\n');
  process.exit(1);
}

const drafts = routes.filter((r) => !approved.includes(r));
console.log(`[check-routes] погоджених сторінок: ${approved.length}, чернеток у app/ (віддаються з Tilda): ${drafts.length}.`);
for (const a of approved) console.log('  approved: ' + a);

// Інформаційно: які погоджені сторінки перекривають URL з Tilda-sitemap.
if (origin && approved.length > 0) {
  try {
    const res = await fetch(`${origin}/sitemap.xml`, { signal: AbortSignal.timeout(10_000) });
    if (res.ok) {
      const xml = await res.text();
      const tildaPaths = new Set(
        [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => {
          try {
            return normalize(new URL(m[1].trim()).pathname);
          } catch {
            return null;
          }
        }),
      );
      const overlap = approved.filter((r) => tildaPaths.has(r));
      console.log(`[check-routes] погоджені сторінки, що замінюють Tilda-URL: ${overlap.length}`);
      for (const r of overlap) console.log('  replaces: ' + r);
    }
  } catch (err) {
    console.log('[check-routes] Tilda-sitemap недоступний для звіту: ' + (err?.message ?? err));
  }
}
