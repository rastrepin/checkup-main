#!/usr/bin/env node
// Автоперевірка сторінок check-up.in.ua після злиття («Прод після злиття»).
//
// Для кожної сторінки:
//   1. Заявка «Мій план»: обирає клініку (якщо їх кілька), додає одне додаткове дослідження з ціною,
//      запам'ятовує показані назви і суму, відправляє тестову заявку і звіряє, що зберіг сервер:
//      дані пацієнта, сума, послуги клініки (з назвами обстежень із бази) = показане на сторінці.
//   2. Заявка з картки програми клініки: назва програми і ціна в заявці = на картці.
//   3. Посилання: усі <a href> сторінки, статус відповіді. Внутрішні 4xx/5xx – помилка, зовнішні – попередження.
//
// Безпека: тестова заявка йде з номером +380 00 000 00 00. Сайт з тестовим режимом (app/api/leads/route.ts)
// пише її зі status = 'test' і НЕ передає клініці. Перед відправкою скрипт питає GET /api/leads: якщо сайт
// не повідомляє qa_test_mode, жодна заявка не відправляється (інакше вона пішла б клініці).
//
// Запуск:
//   node prod-check.mjs --base https://check-up.in.ua              # сторінки з lib/seo/approved-routes.json
//   node prod-check.mjs --base <preview> --all-city-pages --drafts  # усі вікові сторінки міст на прев'ю
//   node prod-check.mjs --base <url> --routes /ukr/a,/ukr/b --no-submit
// Прев'ю Vercel закрите: змінна VERCEL_AUTOMATION_BYPASS_SECRET відкриває його для перевірки.
// Звіт: qa-report.md і qa-report.json у поточній папці; код виходу 1, якщо є помилки.

import { chromium } from 'playwright';
import { readFileSync, readdirSync, existsSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const TEST_NAME = 'Тест Автоперевірка';
const TEST_PHONE = '0000000000'; // поле саме додає +38 → +380000000000
const TEST_DATE = 'тест автоперевірки';

// ---------- аргументи ----------
const args = process.argv.slice(2);
const opt = (name) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
};
const flag = (name) => args.includes(`--${name}`);
const BASE = (opt('base') ?? 'https://check-up.in.ua').replace(/\/+$/, '');
const NO_SUBMIT = flag('no-submit');
const DRAFTS = flag('drafts');
const BYPASS = process.env.VERCEL_AUTOMATION_BYPASS_SECRET || '';
const OUT = opt('out') ?? '.';

function listRoutes() {
  if (opt('routes')) return opt('routes').split(',').map((s) => s.trim()).filter(Boolean);
  const approved = JSON.parse(readFileSync(join(ROOT, 'lib', 'seo', 'approved-routes.json'), 'utf8'));
  const set = new Set(approved);
  if (flag('all-city-pages')) {
    for (const g of ['female-checkup', 'male-checkup']) {
      const gDir = join(ROOT, 'app', 'ukr', g);
      if (!existsSync(gDir)) continue;
      for (const seg of readdirSync(gDir)) {
        const sDir = join(gDir, seg);
        if (!existsSync(join(sDir, 'city-page.tsx'))) continue;
        for (const city of readdirSync(sDir)) {
          if (existsSync(join(sDir, city, 'page.tsx'))) set.add(`/ukr/${g}/${seg}/${city}`);
        }
      }
    }
  }
  return [...set].sort();
}

const digits = (s) => Number(String(s ?? '').replace(/[^\d]/g, '')) || null;
const norm = (s) => String(s ?? '').replace(/\s+/g, ' ').trim().toLowerCase();

// ---------- звіт ----------
const report = { base: BASE, startedAt: new Date().toISOString(), submit: !NO_SUBMIT, testMode: null, pages: [] };
function page(path) {
  const r = { path, errors: [], warnings: [], ok: [] };
  report.pages.push(r);
  return r;
}

// ---------- тестовий режим ----------
async function probeTestMode(request) {
  try {
    const res = await request.get(`${BASE}/api/leads`, { timeout: 20000 });
    if (!res.ok()) return { ok: false, why: `GET /api/leads → ${res.status()}` };
    const j = await res.json().catch(() => null);
    if (j && Number(j.qa_test_mode) >= 1) return { ok: true, env: j.env };
    return { ok: false, why: 'сайт не повідомляє тестового режиму' };
  } catch (e) {
    return { ok: false, why: `GET /api/leads: ${e.message}` };
  }
}

// ---------- форма заявки (спільна для «Мій план» і картки програми) ----------
async function fillAndSubmit(p, dialog) {
  // Крок 1: філія (перша вже обрана), бажаний день, «Далі →».
  const date = dialog.locator('input[placeholder^="Напр"]');
  if (await date.count()) await date.first().fill(TEST_DATE);
  const next = dialog.getByRole('button', { name: /Далі/ });
  if (await next.count()) await next.first().click();
  // Крок 2: ім'я, телефон, згода.
  await dialog.locator('input[type="text"]:not([name="website"])').first().fill(TEST_NAME);
  const tel = dialog.locator('input[type="tel"]').first();
  await tel.fill('');
  await tel.pressSequentially(TEST_PHONE);
  await dialog.locator('input[type="checkbox"]').first().check();
  const [req] = await Promise.all([
    p.waitForRequest((r) => r.url().endsWith('/api/leads') && r.method() === 'POST', { timeout: 15000 }),
    dialog.getByRole('button', { name: /Залишити заявку/ }).click(),
  ]);
  const res = await req.response();
  const sent = req.postDataJSON();
  const body = res ? await res.json().catch(() => null) : null;
  const done = await dialog.getByText('ЗАЯВКУ НАДІСЛАНО').waitFor({ timeout: 10000 }).then(() => true, () => false);
  return { sent, status: res?.status() ?? 0, body, done };
}

function checkPatient(r, label, sent, saved) {
  const need = { name: TEST_NAME, phone: '+380000000000', city: true, source_page: true };
  const miss = [];
  if (norm(saved?.name) !== norm(need.name)) miss.push("ім'я");
  if (saved?.phone !== need.phone) miss.push('телефон');
  if (!saved?.preferred_contact) miss.push("спосіб зв'язку");
  if (!saved?.city) miss.push('місто');
  if (!saved?.clinic_id && !saved?.clinic_slug) miss.push('клініка');
  if (!saved?.source_page) miss.push('сторінка');
  if (sent?.consent_given !== true) miss.push('згода');
  if (miss.length) r.errors.push(`${label}: у заявці бракує – ${miss.join(', ')}`);
  else r.ok.push(`${label}: дані пацієнта на місці (ім'я, телефон, зв'язок, місто, клініка${saved?.branch_address ? ', філія' : ''})`);
}

// ---------- «Мій план» ----------
async function checkPlan(p, r, canSubmit) {
  const zone = p.locator('#plan-zone');
  if (!(await zone.count())) {
    r.warnings.push('Мій план: блоку на сторінці немає');
    return;
  }
  const radios = zone.locator('input[name="plan-clinic"]');
  if (await radios.count()) await radios.first().check();

  // Одне додаткове дослідження з ціною (картка з «грн» і кнопкою «Додати»).
  const addBtns = zone.locator('button[aria-pressed="false"]', { hasText: /^Додати/ });
  const n = await addBtns.count();
  for (let i = 0; i < n; i++) {
    const b = addBtns.nth(i);
    // Ціна стоїть поруч із кнопкою (ExamCard: span ціни і кнопка в одному блоці).
    const row = (await b.locator('xpath=..').textContent()) ?? '';
    if (/\d\s*грн/.test(row)) {
      await b.click();
      break;
    }
  }

  const shown = await p.evaluate(() => {
    const zoneEl = document.getElementById('plan-zone');
    if (!zoneEl) return null;
    const rows = [];
    // Картка плану: Базовий план (ul з aria-label) і «Додано вами» – у тій самій картці.
    const planCard = zoneEl.querySelector('ul[aria-label="Мій план обстеження"]')?.parentElement ?? zoneEl;
    planCard.querySelectorAll('ul li').forEach((li) => {
      const nameEl = li.querySelector('p');
      if (!nameEl) return;
      const text = li.textContent ?? '';
      rows.push({
        name: nameEl.textContent?.trim() ?? '',
        dropped: nameEl.className.includes('line-through'),
        inConsultation: text.includes('У консультації'),
        notInClinic: text.includes('Немає в клініці'),
      });
    });
    const paras = [...zoneEl.querySelectorAll('p')];
    const totalLabel = paras.find((x) => x.textContent?.trim().startsWith('Разом у'));
    const totalEl = totalLabel?.nextElementSibling;
    const missingEl = paras.find((x) => x.textContent?.includes('Не входить у суму'));
    const missing = missingEl ? (missingEl.textContent.split(':').slice(1).join(':') || '').replace(/\.$/, '').split(',').map((s) => s.trim()).filter(Boolean) : [];
    return { rows, total: totalEl?.textContent ?? null, missing };
  });
  if (!shown || shown.total == null) {
    r.warnings.push('Мій план: суми на сторінці немає (немає цін клінік) – заявку за планом не перевіряли');
    return;
  }
  const shownTotal = Number(String(shown.total).replace(/[^\d]/g, ''));
  const missing = new Set(shown.missing.map(norm));
  const planNames = [...new Set(shown.rows.filter((x) => !x.dropped && !x.inConsultation && !x.notInClinic && !missing.has(norm(x.name))).map((x) => x.name))];
  r.ok.push(`Мій план: показано ${planNames.length} досліджень із ціною, сума ${shownTotal} грн`);

  if (!canSubmit) return;
  const book = zone.getByRole('button', { name: 'Записатися за цим планом' });
  if (!(await book.count())) {
    r.errors.push('Мій план: кнопки «Записатися за цим планом» немає');
    return;
  }
  await book.first().click();
  const dialog = p.locator('[role="dialog"][aria-labelledby="plan-booking-title"]');
  await dialog.waitFor({ timeout: 10000 });
  const { sent, status, body, done } = await fillAndSubmit(p, dialog);
  if (status !== 200 || !body?.ok) return void r.errors.push(`Мій план: заявка не прийнята (HTTP ${status})`);
  if (!body.test) return void r.errors.push('Мій план: сервер не позначив заявку як тестову – перевірте, чи не пішла вона клініці');
  if (!done) r.errors.push('Мій план: після відправки немає екрана «Заявку надіслано»');
  else r.ok.push('Мій план: заявку надіслано, сервер зберіг її як тестову');
  checkPatient(r, 'Мій план', sent, body.saved);

  const services = body.services ?? [];
  const sumDb = services.reduce((a, s) => a + (Number(s.price) || 0), 0);
  if (Number(body.saved?.price) !== shownTotal) r.errors.push(`Мій план: сума в заявці ${body.saved?.price} грн, на сторінці ${shownTotal} грн`);
  if (sumDb !== shownTotal) r.errors.push(`Мій план: сума послуг у базі ${sumDb} грн, на сторінці ${shownTotal} грн`);
  if (Number(body.saved?.price) === shownTotal && sumDb === shownTotal) r.ok.push(`Мій план: сума ${shownTotal} грн збігається (сторінка = заявка = ціни послуг у базі)`);
  const foreign = services.filter((s) => s.clinic_id && body.saved?.clinic_id && s.clinic_id !== body.saved.clinic_id);
  if (foreign.length) r.errors.push(`Мій план: послуги іншої клініки в заявці – ${foreign.map((s) => s.name).join(', ')}`);
  const unknown = services.filter((s) => s.name == null);
  if (unknown.length) r.errors.push(`Мій план: ${unknown.length} послуг із заявки немає в базі`);

  const covered = new Set(services.flatMap((s) => s.exams.map(norm)));
  const notSent = planNames.filter((nm) => !covered.has(norm(nm)));
  const allShown = new Set(shown.rows.map((x) => norm(x.name)));
  const extra = [...new Set(services.flatMap((s) => s.exams))].filter((nm) => !allShown.has(norm(nm)));
  if (notSent.length) r.errors.push(`Мій план: показано, але немає в заявці – ${notSent.join(', ')}`);
  if (extra.length) r.warnings.push(`Мій план: послуга в заявці покриває ще обстеження, яких немає в плані – ${extra.join(', ')}`);
  if (!notSent.length) r.ok.push(`Мій план: у заявці ${services.length} послуг клініки, усі показані дослідження на місці`);
  await dialog.getByRole('button', { name: 'Закрити' }).last().click().catch(() => {});
}

// ---------- картка програми клініки ----------
async function checkProgram(p, r, canSubmit) {
  const buy = p.locator('#program-buy');
  if (!(await buy.count())) {
    r.warnings.push('Програма клініки: картки з кнопкою запису немає');
    return;
  }
  const card = buy.first().locator('xpath=ancestor::article[1]');
  const title = (await card.locator('h3').first().textContent())?.trim() ?? '';
  const priceText = await buy.first().locator('p').first().textContent();
  const shownPrice = digits(priceText);
  r.ok.push(`Програма клініки: «${title}», ${shownPrice} грн`);
  if (!canSubmit) return;
  await buy.first().getByRole('button', { name: /Записатися/i }).first().click();
  const dialog = p.locator('[role="dialog"]').filter({ hasText: 'Крок' }).last();
  await dialog.waitFor({ timeout: 10000 });
  const { sent, status, body, done } = await fillAndSubmit(p, dialog);
  if (status !== 200 || !body?.ok) return void r.errors.push(`Програма клініки: заявка не прийнята (HTTP ${status})`);
  if (!body.test) return void r.errors.push('Програма клініки: сервер не позначив заявку як тестову – перевірте, чи не пішла вона клініці');
  if (!done) r.errors.push('Програма клініки: після відправки немає екрана «Заявку надіслано»');
  else r.ok.push('Програма клініки: заявку надіслано, сервер зберіг її як тестову');
  checkPatient(r, 'Програма клініки', sent, body.saved);
  if (norm(body.saved?.program_name) !== norm(title)) r.errors.push(`Програма клініки: у заявці «${body.saved?.program_name}», на картці «${title}»`);
  if (Number(body.saved?.price) !== shownPrice) r.errors.push(`Програма клініки: ціна в заявці ${body.saved?.price} грн, на картці ${shownPrice} грн`);
  if (norm(body.saved?.program_name) === norm(title) && Number(body.saved?.price) === shownPrice) r.ok.push('Програма клініки: назва і ціна в заявці збігаються з карткою');
  await dialog.getByRole('button', { name: /Закрити/ }).last().click().catch(() => {});
}

// ---------- посилання ----------
const linkCache = new Map();
async function checkLinks(p, request, r) {
  const hrefs = await p.$$eval('a[href]', (as) => [...new Set(as.map((a) => a.href))]);
  const base = new URL(BASE);
  const targets = hrefs.filter((h) => /^https?:/i.test(h)).map((h) => h.split('#')[0]);
  const uniq = [...new Set(targets)];
  let bad = 0;
  for (const url of uniq) {
    if (!linkCache.has(url)) {
      linkCache.set(
        url,
        request
          .get(url, { timeout: 20000, maxRedirects: 10, failOnStatusCode: false })
          .then((res) => ({ status: res.status(), final: res.url() }))
          .catch((e) => ({ status: 0, error: e.message.split('\n')[0] })),
      );
    }
    const res = await linkCache.get(url);
    const internal = new URL(url).host === base.host || new URL(url).host.endsWith('check-up.in.ua');
    if (res.status === 404 || res.status >= 500 || (internal && res.status >= 400)) {
      bad++;
      (internal ? r.errors : r.warnings).push(`Посилання ${res.status || 'не відкрилось'}: ${url}${internal ? '' : ' (зовнішнє)'}`);
    } else if (res.status === 0 || res.status >= 400) {
      r.warnings.push(`Посилання ${res.status || 'не відкрилось'}: ${url} (зовнішнє, сайт міг не пустити бота)`);
    }
  }
  if (!bad) r.ok.push(`Посилання: ${uniq.length} перевірено, 404 немає`);
}

// ---------- головний цикл ----------
const routes = listRoutes();
const browser = await chromium.launch();
const context = await browser.newContext({ locale: 'uk-UA', viewport: { width: 1280, height: 900 } });
const request = context.request;

// Доступ до прев'ю і чернеток: перший запит ставить cookie.
const firstQuery = new URLSearchParams();
if (BYPASS) {
  firstQuery.set('x-vercel-protection-bypass', BYPASS);
  firstQuery.set('x-vercel-set-bypass-cookie', 'true');
}
if (DRAFTS) firstQuery.set('drafts', '1');
if ([...firstQuery].length) {
  const warm = await context.newPage();
  await warm.goto(`${BASE}/?${firstQuery}`, { waitUntil: 'domcontentloaded' }).catch(() => {});
  await warm.close();
}

const probe = NO_SUBMIT ? { ok: false, why: 'запуск без відправки (--no-submit)' } : await probeTestMode(request);
report.testMode = probe;
const canSubmit = probe.ok;

mkdirSync(join(OUT, 'qa-shots'), { recursive: true });
for (const path of routes) {
  const r = page(path);
  const p = await context.newPage();
  const errors = [];
  p.on('pageerror', (e) => errors.push(e.message));
  try {
    const res = await p.goto(`${BASE}${path}`, { waitUntil: 'networkidle', timeout: 45000 });
    const status = res?.status() ?? 0;
    if (status >= 400 || status === 0) {
      r.errors.push(`Сторінка не відкрилась: HTTP ${status}`);
      continue;
    }
    r.ok.push(`Сторінка відкривається (HTTP ${status})`);
    if (await p.locator('#plan-zone, #program-buy').count()) {
      await checkPlan(p, r, canSubmit).catch((e) => r.errors.push(`Мій план: перевірка впала – ${e.message.split('\n')[0]}`));
      await p.reload({ waitUntil: 'networkidle' });
      await checkProgram(p, r, canSubmit).catch((e) => r.errors.push(`Програма клініки: перевірка впала – ${e.message.split('\n')[0]}`));
    }
    await checkLinks(p, request, r);
    if (errors.length) r.warnings.push(`Помилки JavaScript на сторінці: ${[...new Set(errors)].slice(0, 3).join(' | ')}`);
  } catch (e) {
    r.errors.push(`Перевірка сторінки впала: ${e.message.split('\n')[0]}`);
  } finally {
    if (r.errors.length) await p.screenshot({ path: join(OUT, 'qa-shots', `${path.replace(/\W+/g, '_')}.png`), fullPage: true }).catch(() => {});
    await p.close();
  }
}
await browser.close();

// ---------- звіт ----------
report.finishedAt = new Date().toISOString();
const bad = report.pages.filter((x) => x.errors.length);
const lines = [
  `# Перевірка сайту після злиття`,
  ``,
  `Сайт: ${BASE}`,
  `Сторінок: ${report.pages.length}, з помилками: ${bad.length}`,
  canSubmit ? `Тестові заявки: відправлялись (тестовий режим є, клініці не йдуть)` : `Тестові заявки: НЕ відправлялись – ${probe.why}`,
  ``,
];
for (const x of report.pages) {
  lines.push(`## ${x.errors.length ? '❌' : x.warnings.length ? '⚠️' : '✅'} ${x.path}`);
  for (const e of x.errors) lines.push(`- ❌ ${e}`);
  for (const w of x.warnings) lines.push(`- ⚠️ ${w}`);
  for (const o of x.ok) lines.push(`- ✅ ${o}`);
  lines.push('');
}
const md = lines.join('\n');
writeFileSync(join(OUT, 'qa-report.md'), md);
writeFileSync(join(OUT, 'qa-report.json'), JSON.stringify(report, null, 2));
console.log(md);
process.exit(bad.length ? 1 : 0);
