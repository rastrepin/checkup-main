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
