#!/usr/bin/env node
// Prebuild-перевірка маршрутів для проксі-схеми Tilda → Next.js.
//
// Проксі на Tilda реалізовано через fallback rewrite у next.config.ts (рішення
// Р42, скасовує Р41). Fallback спрацьовує тільки коли роутер Next.js не знайшов
// жодного збігу. Динамічний сегмент ([city], [...slug]) збігається з будь-яким
// шляхом своєї глибини і ламає проксі для всіх немігрованих сторінок цієї
// глибини – саме через це Р41 свого часу відхилило fallback. Тому:
//
// 1. Білд падає, якщо в app/ з'явився хоч один динамічний сегмент.
// 2. Генерується lib/seo/next-routes.generated.json – повний перелік шляхів,
//    які реально обслуговує Next.js (кожна папка з page.tsx). Це інвентар
//    "що перекриває Tilda": sitemap-tilda.xml виключає ці шляхи з Tilda-sitemap,
//    а звіт нижче показує, які Tilda-URL з трафіком тепер віддає Next.js.
//
// Правило проєкту: page.tsx у гілці = сторінка жива на цьому оточенні.
// Заглушки (stub) заборонені – вони перекривають робочу сторінку Tilda.

import { readdirSync, statSync, writeFileSync, readFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const APP_DIR = 'app';
const OUT_FILE = join('lib', 'seo', 'next-routes.generated.json');
const PAGE_FILES = new Set(['page.tsx', 'page.ts', 'page.jsx', 'page.js']);

const dynamicSegments = [];
const routes = [];

function walk(dir, segments) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (!statSync(full).isDirectory()) {
      if (PAGE_FILES.has(entry)) {
        routes.push('/' + segments.join('/'));
      }
      continue;
    }
    if (entry.startsWith('[')) {
      dynamicSegments.push(relative('.', full).split(sep).join('/'));
      continue;
    }
    // Route groups (group) і паралельні слоти @slot не є сегментами URL.
    if (entry.startsWith('(') || entry.startsWith('@')) {
      walk(full, segments);
      continue;
    }
    // Приватні папки _name ігноруються роутером.
    if (entry.startsWith('_')) continue;
    walk(full, [...segments, entry]);
  }
}

walk(APP_DIR, []);

if (dynamicSegments.length > 0) {
  console.error('\n[check-routes] БІЛД ЗУПИНЕНО: знайдено динамічні сегменти в app/:');
  for (const d of dynamicSegments) console.error('  - ' + d);
  console.error(
    '\nДинамічний сегмент перехоплює всі шляхи своєї глибини і вимикає fallback-проксі на Tilda ' +
      'для немігрованих сторінок (Р41 → Р42). Замініть на буквальні папки або погодьте ' +
      'зміну схеми проксі окремим рішенням.\n',
  );
  process.exit(1);
}

routes.sort();
mkdirSync(join('lib', 'seo'), { recursive: true });
const next = JSON.stringify(routes, null, 2) + '\n';
const prev = existsSync(OUT_FILE) ? readFileSync(OUT_FILE, 'utf8') : null;
if (prev !== next) {
  writeFileSync(OUT_FILE, next);
  console.log(`[check-routes] ${OUT_FILE} оновлено (${routes.length} маршрутів).`);
} else {
  console.log(`[check-routes] ${routes.length} маршрутів, динамічних сегментів немає.`);
}

// Інформаційний звіт: які шляхи Next.js збігаються з URL у Tilda-sitemap.
// Не валить білд – лише робить перекриття видимим у логах деплою.
const origin = process.env.TILDA_ORIGIN;
if (origin) {
  try {
    const res = await fetch(`${origin.replace(/\/$/, '')}/sitemap.xml`, { signal: AbortSignal.timeout(10_000) });
    if (res.ok) {
      const xml = await res.text();
      const tildaPaths = new Set(
        [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => {
          try {
            return new URL(m[1].trim()).pathname.replace(/\/$/, '') || '/';
          } catch {
            return null;
          }
        }),
      );
      const overlap = routes.filter((r) => tildaPaths.has(r));
      if (overlap.length > 0) {
        console.log(`[check-routes] Next.js перекриває ${overlap.length} URL з Tilda-sitemap (це очікувано для мігрованих сторінок):`);
        for (const r of overlap) console.log('  - ' + r);
      }
    }
  } catch (err) {
    console.log('[check-routes] Tilda-sitemap недоступний для звіту про перекриття: ' + (err?.message ?? err));
  }
}
