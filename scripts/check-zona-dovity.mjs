#!/usr/bin/env node
// Prebuild-перевірка .md «Зони довіри» (T3): збірка падає, якщо файл не відповідає правилам
// docs/ux/specs/2026-10-pmh-page-types.md §1.5 (checkup-platform).
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { validateT3 } from '../lib/screening/t3-md.mjs';

const ROOT = join('content', 'zona-dovity', 't3');
const files = [];
const walk = (d) => { for (const e of readdirSync(d)) { const f = join(d, e); statSync(f).isDirectory() ? walk(f) : e.endsWith('.md') && files.push(f); } };
try { walk(ROOT); } catch { /* розділу ще немає */ }

let failed = 0;
for (const f of files) {
  const errors = validateT3(readFileSync(f, 'utf8'));
  if (errors.length) { failed++; console.error(`✗ ${f}`); for (const e of errors) console.error(`  помилка: ${e}`); }
  else console.log(`✓ ${f}`);
}
if (failed) process.exit(1);
