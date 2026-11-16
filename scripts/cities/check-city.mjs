#!/usr/bin/env node
// Скрипт перевірки міста – пункти 2.2 чек-листа CONVEYOR-CITIES v1.2.1 (checkup-platform dev,
// docs/kb/claude/CONVEYOR-CITIES.md, розділ 3.1). Лише читає: GET сторінок і JS-файлів сайту, SELECT з Supabase
// (публічний ключ сайту). Заявок НЕ надсилає, форму не заповнює, у базу нічого не пише.
//
// Запуск (Node ≥ 22.18 – конфіг міст читається з lib/cities/checkup-cities.ts):
//   node scripts/cities/check-city.mjs --base https://check-up.in.ua --city kharkiv --city uzhgorod
//   node scripts/cities/check-city.mjs --base <адреса прев'ю> --city dnipro --drafts
// Змінні оточення:
//   NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY – ті самі, що в сайту (звірка з базою). Без них пункти,
//     яким потрібна база, мають статус «НЕ ПЕРЕВІРЕНО», не ТАК.
//   VERCEL_AUTOMATION_BYPASS_SECRET – відкриває прев'ю Vercel (як у scripts/qa).
// Звіт: city-check.md і city-check.json у папці --out (за замовчуванням поточна). Код виходу: 0 – усі
// автоматизовані пункти ТАК; 1 – є NO або НЕ ПЕРЕВІРЕНО; 2 – помилка запуску.
//
// Статуси: ТАК · NO · НЕ ПЕРЕВІРЕНО (бракує даних чи доступу) · — (пункт до сторінки не застосовний).
// Ціна картки – з data-price (урок 1.5: текст картки склеює стару і нову ціну).

import { writeFileSync, readFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

// ---------- аргументи ----------
const argv = process.argv.slice(2);
const optAll = (name) => argv.flatMap((a, i) => (a === `--${name}` && argv[i + 1] ? [argv[i + 1]] : []));
const opt = (name) => optAll(name)[0];
const flag = (name) => argv.includes(`--${name}`);
if (flag('help') || argv.length === 0) {
  console.log('node scripts/cities/check-city.mjs --base <адреса> --city <slug> [--city <slug>] [--drafts] [--out <папка>]');
  process.exit(argv.length === 0 ? 2 : 0);
}
const BASE = (opt('base') ?? '').replace(/\/+$/, '');
const CITY_SLUGS = optAll('city').flatMap((s) => s.split(',')).map((s) => s.trim()).filter(Boolean);
const DRAFTS = flag('drafts');
const OUT = opt('out') ?? '.';
const BYPASS = process.env.VERCEL_AUTOMATION_BYPASS_SECRET || '';
const SB_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '').replace(/\/+$/, '');
const SB_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
const SITE = 'https://check-up.in.ua';

if (!/^https?:\/\//.test(BASE) || CITY_SLUGS.length === 0) {
  console.error('Потрібні --base <адреса сайту чи прев\'ю> і хоча б один --city <slug>.');
  process.exit(2);
}

// ---------- конфіг міст (lib/cities/checkup-cities.ts) ----------
let CHECKUP_CITIES;
try {
  ({ CHECKUP_CITIES } = await import(join(ROOT, 'lib', 'cities', 'checkup-cities.ts')));
} catch (e) {
  console.error(`Не вдалося прочитати lib/cities/checkup-cities.ts (потрібен Node ≥ 22.18 з type stripping): ${e.message}`);
  process.exit(2);
}
for (const s of CITY_SLUGS) {
  if (!CHECKUP_CITIES[s]) {
    console.error(`Міста «${s}» немає в lib/cities/checkup-cities.ts.`);
    process.exit(2);
  }
}
const ageClinicSlugsFor = (city) => (city.ageClinicSlugs?.length ? city.ageClinicSlugs : [city.clinicSlug]);

// ---------- канон сторінок (1.1) ----------
const AGES = [
  { seg: 'do-30-rokiv', key: 'do-30' },
  { seg: 'do-40-rokiv', key: '30-40' },
  { seg: '40-50-rokiv', key: '40-50' },
  { seg: 'vid-50-rokiv', key: 'vid-50' },
];
function cityPages(slug) {
  const pages = [
    { kind: 'hub', path: `/ukr/${slug}`, md: 'city', scope: 'all' },
    { kind: 'gender', path: `/ukr/female-checkup/${slug}`, md: 'female-checkup', scope: 'female' },
    { kind: 'gender', path: `/ukr/male-checkup/${slug}`, md: 'male-checkup', scope: 'male' },
  ];
  for (const g of ['female', 'male']) {
    for (const a of AGES) {
      pages.push({
        kind: 'age',
        gender: g,
        path: `/ukr/${g}-checkup/${a.seg}/${slug}`,
        template: join(ROOT, 'app', 'ukr', `${g}-checkup`, a.seg, 'city-page.tsx'),
        platformProgram: `${g}-checkup-${a.key}`,
      });
    }
  }
  return pages;
}
const FEMALE_PROGRAMS = AGES.map((a) => `female-checkup-${a.key}`);
const MALE_PROGRAMS = AGES.map((a) => `male-checkup-${a.key}`);
const scopePrograms = (scope) => (scope === 'female' ? FEMALE_PROGRAMS : scope === 'male' ? MALE_PROGRAMS : [...FEMALE_PROGRAMS, ...MALE_PROGRAMS]);

// ---------- текстові утиліти ----------
const ENT = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', laquo: '«', raquo: '»', mdash: '—', ndash: '–', hellip: '…', rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“', copy: '©' };
function decode(s) {
  return String(s ?? '').replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => {
    if (e[0] === '#') {
      const n = e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(n) ? String.fromCodePoint(n) : m;
    }
    return ENT[e.toLowerCase()] ?? m;
  });
}
/** Пробіли (зокрема нерозривні, U+202F з toLocaleString) – один звичайний. */
const ws = (s) => String(s ?? '').replace(/[\s   ]+/g, ' ').trim();
/** Для порівняння назв: пробіли, лапки, тире, регістр. */
const normName = (s) => ws(decode(s)).replace(/[«»“”„"']/g, '"').replace(/[‘’ʼ`]/g, "'").replace(/[—–-]/g, '-').toLowerCase();
const digits = (s) => {
  const d = String(s ?? '').replace(/[^\d]/g, '');
  return d ? Number(d) : null;
};
const fmtPrice = (n) => n.toLocaleString('uk-UA');
const fmtDate = (iso) => {
  const [y, m, d] = String(iso).slice(0, 10).split('-');
  return `${d}.${m}.${y}`;
};
const stripTags = (h) => ws(decode(String(h).replace(/<[^>]+>/g, ' ')));
const short = (s, n = 140) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

/** Видимий текст серверного HTML: без script/style/коментарів. */
function visibleText(html) {
  return stripTags(
    html
      .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
      .replace(/<!--[\s\S]*?-->/g, ' '),
  );
}
/** Перший елемент <tag ...attrs...> з відповідним закриттям (з урахуванням вкладених однойменних). */
function elementAt(html, startIdx, tag) {
  const re = new RegExp(`<(/?)${tag}\\b[^>]*>`, 'gi');
  re.lastIndex = startIdx;
  let depth = 0;
  let m;
  while ((m = re.exec(html))) {
    if (m[1] === '') depth++;
    else depth--;
    if (depth === 0) return html.slice(startIdx, m.index + m[0].length);
  }
  return html.slice(startIdx);
}
function firstElement(html, tag, attrRe) {
  const re = new RegExp(`<${tag}\\b[^>]*>`, 'gi');
  let m;
  while ((m = re.exec(html))) {
    if (!attrRe || attrRe.test(m[0])) return elementAt(html, m.index, tag);
  }
  return null;
}
function allElements(html, tag, attrRe) {
  const out = [];
  const re = new RegExp(`<${tag}\\b[^>]*>`, 'gi');
  let m;
  while ((m = re.exec(html))) {
    if (!attrRe || attrRe.test(m[0])) {
      const el = elementAt(html, m.index, tag);
      out.push(el);
      re.lastIndex = m.index + el.length;
    }
  }
  return out;
}
const attr = (tagHtml, name) => {
  const m = tagHtml.match(new RegExp(`\\s${name}\\s*=\\s*("([^"]*)"|'([^']*)')`, 'i'));
  return m ? decode(m[2] ?? m[3] ?? '') : null;
};
/** Посилання: href і текст. */
function links(html) {
  const out = [];
  for (const m of html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)) {
    const href = attr(`<a ${m[1]}>`, 'href');
    if (href !== null) out.push({ href, text: stripTags(m[2]) });
  }
  return out;
}
/** Шлях посилання на check-up.in.ua (або на адресу перевірки) без origin, query і #; null – інший хост. */
function sitePath(href) {
  try {
    const u = new URL(href, `${SITE}/`);
    const base = new URL(BASE);
    if (u.host !== 'check-up.in.ua' && u.host !== base.host) return null;
    return u.pathname.replace(/\/+$/, '') || '/';
  } catch {
    return null;
  }
}
function jsonLdBlocks(html) {
  const out = [];
  const errors = [];
  for (const m of html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const v = JSON.parse(m[1]);
      for (const x of Array.isArray(v) ? v : [v]) {
        if (x && Array.isArray(x['@graph'])) out.push(...x['@graph']);
        else out.push(x);
      }
    } catch (e) {
      errors.push(e.message);
    }
  }
  return { items: out, errors, raw: [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].map((m) => m[1]).join('\n') };
}
/** Усі об'єкти JSON-LD з @type = type (рекурсивно). */
function findType(node, type, acc = []) {
  if (Array.isArray(node)) node.forEach((n) => findType(n, type, acc));
  else if (node && typeof node === 'object') {
    const t = node['@type'];
    if (t === type || (Array.isArray(t) && t.includes(type))) acc.push(node);
    Object.values(node).forEach((v) => findType(v, type, acc));
  }
  return acc;
}

// ---------- мережа ----------
async function get(url, { text = true } = {}) {
  const headers = { 'user-agent': 'checkup-city-check/1.0 (read-only)' };
  if (BYPASS) {
    headers['x-vercel-protection-bypass'] = BYPASS;
    headers['x-vercel-set-bypass-cookie'] = 'true';
  }
  let lastErr;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(url, { headers, redirect: 'manual', signal: AbortSignal.timeout(30000) });
      const body = text ? await res.text() : null;
      return { status: res.status, headers: res.headers, body, location: res.headers.get('location') };
    } catch (e) {
      lastErr = e;
      await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
    }
  }
  return { status: 0, error: lastErr?.message ?? 'fetch failed', headers: new Headers(), body: '' };
}
const pageUrl = (path) => `${BASE}${path}${DRAFTS ? '?drafts=1' : ''}`;

// ---------- база (лише SELECT, публічний ключ) ----------
const DB_ON = Boolean(SB_URL && SB_KEY);
async function sb(table, query) {
  const res = await fetch(`${SB_URL}/rest/v1/${table}?${query}`, {
    headers: { apikey: SB_KEY, authorization: `Bearer ${SB_KEY}`, accept: 'application/json' },
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) throw new Error(`${table}: HTTP ${res.status} ${short(await res.text(), 200)}`);
  return res.json();
}
const inList = (arr) => `in.(${arr.map((s) => `"${String(s).replace(/"/g, '')}"`).join(',')})`;

/** Дані міста з бази – так само, як їх збирає сайт (lib/programs/clinic-offer.ts, lib/cities/hub-data.ts). */
async function loadCityDb(city) {
  const slugs = [...new Set([...city.clinics.map((c) => c.slug), ...ageClinicSlugsFor(city)])];
  const clinics = await sb('clinics', `select=id,slug,name,website&slug=${inList(slugs)}`);
  const ids = clinics.map((c) => c.id);
  const branches = ids.length
    ? await sb('clinic_branches', `select=id,clinic_id,address_ua,metro_ua,sort_order&clinic_id=${inList(ids)}&order=sort_order.asc`)
    : [];
  const allPrograms = scopePrograms('all');
  const platform = await sb('platform_programs', `select=id,slug&slug=${inList(allPrograms)}`);
  const offerRows = platform.length
    ? await sb(
        'platform_program_offers',
        `select=platform_program_id,sort_order,checkup_programs(id,slug,name_ua,price_regular,price_discount,price_date,program_type,is_active,clinic_id)&platform_program_id=${inList(platform.map((p) => p.id))}&order=sort_order.asc`,
      )
    : [];
  const bySlug = new Map(clinics.map((c) => [c.slug, c]));
  const branchesOf = (clinicId) => branches.filter((b) => b.clinic_id === clinicId && String(b.address_ua ?? '').trim());
  /** Програми клініки для набору платформних програм – порядок і фільтри як у fetchClinicOffers. */
  const offersFor = (platformSlugs, clinicSlug) => {
    const clinic = bySlug.get(clinicSlug);
    if (!clinic) return [];
    const out = [];
    for (const ps of platformSlugs) {
      const pp = platform.find((p) => p.slug === ps);
      if (!pp) continue;
      for (const row of offerRows) {
        if (row.platform_program_id !== pp.id) continue;
        const p = row.checkup_programs;
        if (!p || p.program_type !== 'clinic' || !p.is_active || p.clinic_id !== clinic.id) continue;
        if (!out.some((x) => x.id === p.id)) out.push(p);
      }
    }
    return out;
  };
  return { clinics, bySlug, branchesOf, offersFor };
}

// ---------- шаблони: Title і Meta ----------
const mdCache = new Map();
function mdSections(name) {
  if (!mdCache.has(name)) {
    const raw = readFileSync(join(ROOT, 'content', 'city-template', `${name}.md`), 'utf8').replace(/\r\n/g, '\n');
    const body = raw.replace(/^---\n[\s\S]*?\n---\n/, '').replace(/<!--[\s\S]*?-->/g, '');
    const sections = {};
    const parts = body.split(/^## +(\S+)[ \t]*$/m);
    for (let i = 1; i < parts.length; i += 2) sections[parts[i]] = ws(parts[i + 1]);
    mdCache.set(name, sections);
  }
  return mdCache.get(name);
}
/** Перший розділ, усі плейсхолдери якого мають значення (як docMeta / docText сайту). */
function fillFirst(sections, keys, vars) {
  for (const k of keys) {
    const t = sections[k];
    if (!t) continue;
    let ok = true;
    const out = t.replace(/\{([A-Za-z_]+)\}/g, (m, v) => {
      if (vars[v] === undefined || vars[v] === null) ok = false;
      return String(vars[v] ?? '');
    });
    if (ok) return out;
  }
  return null;
}
const tplCache = new Map();
function ageTemplate(file) {
  if (!tplCache.has(file)) {
    const src = readFileSync(file, 'utf8');
    const title = src.match(/const titleFor = \(city: CheckupCity\) => `([^`]*)`/)?.[1] ?? null;
    const descM = src.match(/const DESCRIPTION_BASE = (["'])((?:\\.|(?!\1).)*)\1/);
    tplCache.set(file, { title, description: descM ? descM[2].replace(/\\(.)/g, '$1') : null });
  }
  return tplCache.get(file);
}
const fillCity = (tpl, city) => tpl.replace(/\$\{city\.(\w+)\}/g, (m, k) => String(city[k] ?? ''));

// ---------- JS сайту (форма запису рендериться лише після натискання «Записатися») ----------
const chunkCache = new Map();
async function chunk(src) {
  if (!chunkCache.has(src)) chunkCache.set(src, get(new URL(src, `${BASE}/`).href).then((r) => (r.status === 200 ? r.body : '')));
  return chunkCache.get(src);
}

// ---------- перевірки ----------
const YES = 'ТАК';
const NO = 'NO';
const NC = 'НЕ ПЕРЕВІРЕНО';
const NA = '—';
const POINTS = [
  { id: 1, name: '200, Next.js, один H1, Title і Meta за шаблоном, canonical на себе' },
  { id: 2, name: 'Schema: вікові – Offer з ціною з бази; хаби – FAQPage = видимий FAQ, без Offer' },
  { id: 3, name: 'Ціни на сторінці = ціни в базі, дата ціни показана' },
  { id: 4, name: '«Що входить» показує склад; фрази «поки не опублікований» немає' },
  { id: 5, name: 'GEO-блок у серверному HTML: місто, клініка (усі для варіанту Б), адреси' },
  { id: 6, name: 'Шапка міста і футер за HEADER-SPEC' },
  { id: 7, name: 'Немає tel:, telephone, посилань на сайт клініки, незаповнених {…}, [УТОЧНИТИ]' },
  { id: 8, name: 'Форма запису: POST /api/leads, honeypot і consent (без надсилання)' },
  { id: 10, name: 'Рецензент: блок і reviewedBy разом або обидва відсутні' },
];
const MANUAL = [
  '2.2 «форму пройдено до кроку «Далі»» – потрібен браузер; скрипт форму не відкриває і не заповнює.',
  '2.2 «Канал заявок перевірено» – спосіб перевірки – рішення Ігоря [УТОЧНИТИ]; скрипт заявок не надсилає ніколи.',
  '2.2 «Рецензент»: чи є згода лікаря або рішення Ігоря вийти без рецензента – не дані сторінки; скрипт перевіряє лише узгодженість блоку і reviewedBy.',
  '2.2 «Lighthouse mobile: Performance ≥ 90, CLS 0» – окремий інструмент (PageSpeed Insights / Lighthouse).',
];

function verdict(sub) {
  if (sub.some((s) => s.s === NO)) return NO;
  if (sub.some((s) => s.s === NC)) return NC;
  if (sub.length === 0 || sub.every((s) => s.s === NA)) return NA;
  return YES;
}

async function checkPage(page, city, db) {
  const url = pageUrl(page.path);
  const res = await get(url);
  const result = { path: page.path, url, status: res.status, points: {} };
  const put = (id, sub) => (result.points[id] = { verdict: verdict(sub), sub });
  if (res.status !== 200 || !res.body) {
    const why = res.status === 0 ? `немає відповіді: ${res.error}` : `HTTP ${res.status}${res.location ? ` → ${res.location}` : ''}`;
    put(1, [{ s: NO, t: `${url}: ${why}` }]);
    for (const p of POINTS) if (p.id !== 1) put(p.id, [{ s: NC, t: 'сторінка не відкрилась' }]);
    return result;
  }
  const html = res.body;
  const text = visibleText(html);
  const ld = jsonLdBlocks(html);
  const allLinks = links(html);
  const variant = city.clinics.length > 1 ? 'b' : 'a';

  // Дані бази для сторінки
  let expect = null;
  if (db) {
    if (page.kind === 'age') {
      const all = ageClinicSlugsFor(city).map((slug) => ({ slug, clinic: db.bySlug.get(slug), offers: db.offersFor([page.platformProgram], slug) }));
      const shown = all.filter((d) => d.clinic && d.offers.length > 0);
      const clinicsData = shown.length > 0 ? shown : [all[0]];
      const offers = clinicsData.flatMap((d) => d.offers);
      const prices = offers.map((o) => o.price_discount).filter((p) => typeof p === 'number' && p > 0);
      expect = { clinicsData, offers, min: prices.length ? Math.min(...prices) : null };
    } else {
      const clinics = city.clinics
        .map((c) => ({ cfg: c, row: db.bySlug.get(c.slug) }))
        .filter((c) => c.row && String(c.row.name ?? '').trim());
      const prices = city.clinics
        .flatMap((c) => db.offersFor(scopePrograms(page.scope), c.slug))
        .map((o) => o.price_discount)
        .filter((p) => typeof p === 'number' && p > 0);
      expect = { clinics, min: prices.length ? Math.min(...prices) : null };
    }
  }

  // ---- 1. 200, Next.js, H1, Title, Meta, canonical ----
  {
    const sub = [{ s: YES, t: `HTTP 200 (${url})` }];
    const isNext = /\/_next\/static\//.test(html);
    const isTilda = /tildacdn|<meta[^>]+generator[^>]+Tilda/i.test(html);
    sub.push(isNext && !isTilda ? { s: YES, t: 'Next.js: є /_next/static/, ознак Tilda немає' } : { s: NO, t: `Next.js: ${isNext ? 'є' : 'немає'} /_next/static/; Tilda: ${isTilda ? 'так' : 'ні'}` });
    const h1s = allElements(html, 'h1');
    sub.push(h1s.length === 1 ? { s: YES, t: `один H1: «${short(stripTags(h1s[0]), 90)}»` } : { s: NO, t: `H1: ${h1s.length} шт. ${h1s.map((h) => `«${short(stripTags(h), 60)}»`).join(', ')}` });
    const title = ws(decode(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? ''));
    const metaTag = [...html.matchAll(/<meta\b[^>]*>/gi)].map((m) => m[0]).find((t) => /name=["']description["']/i.test(t));
    const meta = metaTag ? ws(attr(metaTag, 'content') ?? '') : '';
    // Очікувані Title і Meta – з шаблону сторінки
    let expTitle = null;
    let expMeta = null;
    let metaNote = '';
    if (page.kind === 'age') {
      const tpl = ageTemplate(page.template);
      expTitle = tpl.title ? fillCity(tpl.title, city) : null;
      if (tpl.description) {
        if (expect) {
          expMeta = expect.min
            ? `${tpl.description} ${expect.offers.length === 1 ? `Програма в ${city.loc} – ${fmtPrice(expect.min)} грн.` : `Програми в ${city.loc} від ${fmtPrice(expect.min)} грн.`}`
            : tpl.description;
        } else {
          metaNote = 'ціну в meta не звірено з базою';
          expMeta = tpl.description;
        }
      }
    } else {
      const s = mdSections(page.md);
      const vars = { city: city.name, city_loc: city.loc, in_city: city.inCity, In_city: city.inCity.charAt(0).toUpperCase() + city.inCity.slice(1), slug: city.slug, city_slug: city.slug };
      expTitle = fillFirst(s, ['title'], vars);
      if (expect) {
        if (expect.min !== null) vars.min_price = fmtPrice(expect.min);
        if (variant === 'a' && expect.clinics[0]) vars.clinic = expect.clinics[0].cfg.shortName;
        const keys =
          page.kind === 'hub'
            ? variant === 'b'
              ? ['meta_b', 'meta_b_noprice']
              : expect.clinics.length
                ? ['meta_a', 'meta_a_noprice']
                : ['meta_noclinic']
            : [`meta_${variant}`, 'meta_noprice'];
        expMeta = fillFirst(s, keys, vars);
      } else metaNote = 'без бази варіант meta (з ціною чи без) не визначено';
    }
    const cmp = (label, got, exp, prefixOnly = false) => {
      if (!exp) return { s: NC, t: `${label}: шаблон не знайдено` };
      const ok = prefixOnly ? ws(got).startsWith(ws(exp)) : ws(got) === ws(exp);
      return ok ? { s: YES, t: `${label} за шаблоном: «${short(got, 110)}»` } : { s: NO, t: `${label}: на сторінці «${got}», за шаблоном «${exp}»` };
    };
    sub.push(cmp('Title', title, expTitle));
    if (metaNote && page.kind !== 'age') sub.push({ s: NC, t: `Meta: ${metaNote}; на сторінці «${short(meta, 110)}»` });
    else {
      const c = cmp('Meta', meta, expMeta, Boolean(metaNote));
      if (metaNote && c.s === YES) sub.push({ s: NC, t: `Meta: початок за шаблоном, ${metaNote}` });
      else sub.push(c);
    }
    const canonTag = [...html.matchAll(/<link\b[^>]*>/gi)].map((m) => m[0]).find((t) => /rel=["']canonical["']/i.test(t));
    const canon = canonTag ? attr(canonTag, 'href') : null;
    const expCanon = `${SITE}${page.path}`;
    sub.push(canon === expCanon ? { s: YES, t: `canonical ${canon}` } : { s: NO, t: `canonical: «${canon ?? 'немає'}», очікується ${expCanon}` });
    put(1, sub);
  }

  // ---- картки програм (вікові) ----
  const cards = page.kind === 'age'
    ? allElements(html, 'article', /id=["']sklad-prohramy/).map((a) => {
        const name = stripTags(a.match(/<h3\b[^>]*>([\s\S]*?)<\/h3>/i)?.[1] ?? '');
        const dp = a.match(/data-price=["']([^"']*)["']/);
        const date = stripTags(a).match(/Ціна клініки станом на (\d{2}\.\d{2}\.\d{4})/)?.[1] ?? null;
        return { name, price: dp ? digits(dp[1]) : null, date, html: a };
      })
    : [];
  const dbProgram = (name) => expect?.offers?.find((o) => normName(o.name_ua) === normName(name));

  // ---- 2. Schema ----
  {
    const sub = [];
    if (ld.errors.length) sub.push({ s: NO, t: `JSON-LD не розбирається: ${ld.errors.join('; ')}` });
    if (page.kind === 'age') {
      const lists = findType(ld.items, 'ItemList');
      const items = lists.flatMap((l) => (l.itemListElement ?? []).map((e) => e.item ?? e));
      if (cards.length === 0) sub.push({ s: NO, t: 'на сторінці немає карток програм – Offer немає з чим звірити' });
      for (const c of cards) {
        const it = items.find((i) => normName(i.name) === normName(c.name));
        const offer = it?.offers;
        if (!offer || offer['@type'] !== 'Offer') {
          sub.push({ s: NO, t: `«${c.name}»: Offer у JSON-LD немає` });
          continue;
        }
        const p = dbProgram(c.name);
        if (!db) sub.push({ s: NC, t: `«${c.name}»: Offer ${offer.price} (база недоступна)` });
        else if (!p) sub.push({ s: NO, t: `«${c.name}»: Offer ${offer.price}, програми з такою назвою в базі для цієї сторінки немає` });
        else if (Number(offer.price) === p.price_discount) sub.push({ s: YES, t: `«${c.name}»: Offer ${offer.price} = база (checkup_programs.${p.slug}.price_discount)` });
        else sub.push({ s: NO, t: `«${c.name}»: Offer ${offer.price}, у базі ${p.price_discount} (${p.slug})` });
      }
    } else {
      const offers = findType(ld.items, 'Offer');
      sub.push(offers.length === 0 ? { s: YES, t: 'Offer у JSON-LD немає' } : { s: NO, t: `у JSON-LD хабу є Offer: ${offers.length} шт.` });
      const faqLd = findType(ld.items, 'FAQPage').flatMap((f) => f.mainEntity ?? []);
      const faqSec = firstElement(html, 'section', /id=["']faq["']/);
      if (!faqSec) sub.push({ s: NO, t: 'видимого FAQ (section#faq) немає' });
      else {
        const visQ = allElements(faqSec, 'summary').map((s) => stripTags(s));
        const ldQ = faqLd.map((q) => ws(q.name));
        const missingVis = ldQ.filter((q) => !visQ.some((v) => normName(v) === normName(q)));
        const missingLd = visQ.filter((v) => !ldQ.some((q) => normName(v) === normName(q)));
        const letters = (s) => normName(s).replace(/\[\d+\]/g, '').replace(/[^\p{L}\p{N}]+/gu, '');
        const faqText = letters(visibleText(faqSec.replace(/<sup\b[\s\S]*?<\/sup>/gi, ' ')));
        const badA = faqLd.filter((q) => !faqText.includes(letters(q.acceptedAnswer?.text ?? '')));
        if (!faqLd.length) sub.push({ s: NO, t: 'FAQPage у JSON-LD немає' });
        else if (missingVis.length || missingLd.length || badA.length)
          sub.push({
            s: NO,
            t: [
              missingVis.length && `у FAQPage, але не на сторінці: ${missingVis.map((q) => `«${short(q, 70)}»`).join(', ')}`,
              missingLd.length && `на сторінці, але не у FAQPage: ${missingLd.map((q) => `«${short(q, 70)}»`).join(', ')}`,
              badA.length && `відповідь FAQPage не збігається з видимою: ${badA.map((q) => `«${short(q.name, 60)}»`).join(', ')}`,
            ]
              .filter(Boolean)
              .join('; '),
          });
        else sub.push({ s: YES, t: `FAQPage = видимий FAQ: ${ldQ.length} питань, відповіді збігаються` });
      }
    }
    put(2, sub);
  }

  // ---- 3. Ціни = база, дата ціни ----
  {
    const sub = [];
    if (page.kind === 'age') {
      for (const c of cards) {
        const p = dbProgram(c.name);
        const dateTxt = c.date ? `дата ${c.date}` : 'дати ціни немає';
        if (c.price === null) sub.push({ s: NO, t: `«${c.name}»: data-price немає` });
        if (!c.date) sub.push({ s: NO, t: `«${c.name}»: «Ціна клініки станом на …» не показана` });
        if (!db) {
          sub.push({ s: NC, t: `«${c.name}»: data-price ${c.price}, ${dateTxt} (база недоступна)` });
          continue;
        }
        if (!p) {
          sub.push({ s: NO, t: `«${c.name}»: програми з такою назвою в базі для цієї сторінки немає (data-price ${c.price})` });
          continue;
        }
        const okPrice = c.price === p.price_discount;
        const okDate = !p.price_date ? false : c.date === fmtDate(p.price_date);
        sub.push(
          okPrice && okDate
            ? { s: YES, t: `«${c.name}»: data-price ${c.price} = база, ${dateTxt} = price_date` }
            : { s: NO, t: `«${c.name}» (${p.slug}): на сторінці ${c.price} грн, ${dateTxt}; у базі ${p.price_discount} грн, price_date ${p.price_date ?? 'порожня'}` },
        );
      }
      if (cards.length === 0) sub.push({ s: NO, t: 'карток програм з ціною немає' });
      if (db && expect && expect.offers.length && cards.length) {
        const cardProgs = cards.map((c) => dbProgram(c.name)?.id).filter(Boolean);
        const firstCl = expect.clinicsData[0];
        if (firstCl?.offers[0] && !cardProgs.includes(firstCl.offers[0].id))
          sub.push({ s: NO, t: `перша програма першої клініки (${firstCl.offers[0].name_ua}) не показана` });
      }
    } else {
      const m = text.match(/Програми(?: чекапу [^–]{0,40} –)? від ([\d\s  ]+) грн/);
      const shown = m ? digits(m[1]) : null;
      if (!db) sub.push({ s: NC, t: `рядок ціни: ${shown ? `від ${shown} грн` : 'немає'} (база недоступна)` });
      else if (expect.min === null) sub.push(shown ? { s: NO, t: `на сторінці «від ${shown} грн», у базі цін для сторінки немає` } : { s: YES, t: 'у базі цін немає – рядка ціни немає' });
      else if (shown === expect.min) sub.push({ s: YES, t: `«Програми від ${fmtPrice(shown)} грн» = мінімальна price_discount у базі` });
      else sub.push({ s: NO, t: `рядок ціни: ${shown === null ? 'немає' : `від ${shown} грн`}, у базі мінімум ${expect.min} грн` });
      sub.push({ s: NA, t: 'дата ціни: на хабах ціна – лише «від», дати немає (див. відхилення у README)' });
    }
    put(3, sub);
  }

  // ---- 4. Що входить ----
  {
    const sub = [];
    if (/поки не опублікован/i.test(text)) sub.push({ s: NO, t: 'є фраза «поки не опублікований»' });
    else sub.push({ s: YES, t: 'фрази «поки не опублікований» немає' });
    if (page.kind === 'age') {
      if (cards.length === 0) sub.push({ s: NO, t: 'карток програм немає – складу немає' });
      for (const c of cards) {
        const det = allElements(c.html, 'details').find((d) => /Що входить/.test(stripTags(d.match(/<summary\b[\s\S]*?<\/summary>/i)?.[0] ?? '')));
        const body = det ? stripTags(det.replace(/<summary\b[\s\S]*?<\/summary>/i, '')) : '';
        const items = det ? (det.match(/<li\b/gi) ?? []).length : 0;
        if (!det) sub.push({ s: NO, t: `«${c.name}»: «Що входить» немає` });
        else if (!items && !/Консультації/.test(body)) sub.push({ s: NO, t: `«${c.name}»: «Що входить» порожній` });
        else sub.push({ s: YES, t: `«${c.name}»: «Що входить» – ${items} позицій${/Консультації/.test(body) ? ' і консультації' : ''}` });
      }
    }
    put(4, sub);
  }

  // ---- 5. GEO ----
  {
    const sub = [];
    const paras = allElements(html, 'p').map((p) => stripTags(p)).filter((t) => t.includes(city.loc));
    if (!db) {
      const geo = paras.filter((t) => /філі|можна пройти|адрес/i.test(t));
      sub.push(geo.length ? { s: NC, t: `є абзац з містом: «${short(geo[0], 120)}» (клініки й адреси не звірено – база недоступна)` } : { s: NO, t: `абзацу GEO з «${city.loc}» немає` });
    } else {
      const expClinics =
        page.kind === 'age'
          ? expect.clinicsData.filter((d) => d.clinic).map((d) => ({ names: [d.clinic.name], branches: db.branchesOf(d.clinic.id), slug: d.slug }))
          : expect.clinics.map((c) => ({ names: [c.cfg.shortName, c.row.name], branches: db.branchesOf(c.row.id), slug: c.cfg.slug }));
      const withBranches = expClinics.filter((c) => c.branches.length > 0);
      if (!withBranches.length) sub.push({ s: NO, t: 'у базі немає клініки міста з філіями – GEO нема з чого скласти' });
      const geoParas = paras.filter((t) => withBranches.some((c) => c.branches.some((b) => t.includes(ws(b.address_ua)))));
      const geoText = geoParas.join(' ');
      if (withBranches.length && !geoParas.length) sub.push({ s: NO, t: `абзацу з «${city.loc}» і адресою філії немає` });
      for (const c of withBranches) {
        if (!geoParas.length) break;
        const nameOk = c.names.some((n) => geoText.includes(ws(n)));
        const missing = c.branches.filter((b) => !geoText.includes(ws(b.address_ua)));
        if (nameOk && !missing.length) sub.push({ s: YES, t: `${c.names[0]}: назва і ${c.branches.length} адрес(и) – «${short(geoParas[0], 110)}»` });
        else sub.push({ s: NO, t: `${c.names[0]} (${c.slug}): ${nameOk ? '' : 'назви немає; '}${missing.length ? `немає адрес: ${missing.map((b) => b.address_ua).join('; ')}` : ''}` });
      }
      if (variant === 'b') {
        const cfgOnPage = page.kind === 'age' ? ageClinicSlugsFor(city) : city.clinics.map((c) => c.slug);
        const absent = cfgOnPage.filter((s) => !expClinics.some((c) => c.slug === s));
        // На віковій сторінці клініка без програм для цього віку не показується (так у коді, AgeProgramsZone) – не NO.
        const notInDb = absent.filter((s) => !db.bySlug.get(s));
        const noProgs = absent.filter((s) => db.bySlug.get(s));
        if (notInDb.length) sub.push({ s: NO, t: `варіант Б: клінік з конфігу немає в базі: ${notInDb.join(', ')}` });
        if (noProgs.length) sub.push({ s: YES, t: `варіант Б: ${noProgs.join(', ')} без програм для цієї сторінки – на сторінці не показується (як у коді)` });
      }
    }
    put(5, sub);
  }

  // ---- 6. Шапка і футер ----
  {
    const sub = [];
    const header = firstElement(html, 'header');
    if (!header) sub.push({ s: NO, t: '<header> немає' });
    else {
      const navOk = /<nav\b[^>]*aria-label=["']Основне меню["']/.test(header);
      const hp = new Set(links(header).map((l) => sitePath(l.href)).filter(Boolean));
      const need = [`/ukr/${city.slug}`, `/ukr/male-checkup/${city.slug}`, `/ukr/female-checkup/${city.slug}`, `/ukr/doctors/${city.slug}`, '/ukr/about', '/ukr/proposal-for-clinics'];
      const miss = need.filter((p) => !hp.has(p));
      const banned = links(header).filter((l) => /^tel:/i.test(l.href) || /\/ukr\/(podarunok|child-checkup)\//.test(l.href));
      if (navOk && !miss.length && !banned.length) sub.push({ s: YES, t: `шапка міста: nav «Основне меню», логотип /ukr/${city.slug}, Чоловікам, Жінкам, Лікарі, Про сервіс` });
      else sub.push({ s: NO, t: `шапка: ${navOk ? '' : 'немає nav «Основне меню»; '}${miss.length ? `немає посилань ${miss.join(', ')}; ` : ''}${banned.length ? `зайві: ${banned.map((l) => l.href).join(', ')}` : ''}` });
    }
    const footer = firstElement(html, 'footer');
    if (!footer) sub.push({ s: NO, t: '<footer> немає' });
    else {
      const fl = links(footer);
      const fp = new Set(fl.map((l) => sitePath(l.href)).filter(Boolean));
      const need = [`/ukr/${city.slug}`, `/ukr/female-checkup/${city.slug}`, `/ukr/male-checkup/${city.slug}`, `/ukr/doctors/${city.slug}`, '/ukr/about', '/ukr/proposal-for-clinics', '/ukr/policy'];
      const miss = need.filter((p) => !fp.has(p));
      if (!fl.some((l) => l.href === 'mailto:info@check-up.in.ua')) miss.push('mailto:info@check-up.in.ua');
      const ft = visibleText(footer);
      if (!ft.includes('Інформаційний матеріал – не замінює консультацію лікаря')) miss.push('рядок «Інформаційний матеріал – не замінює консультацію лікаря»');
      const year = new Date().getFullYear();
      if (!ft.includes(`© ${year} Check-Up Центр`)) miss.push(`«© ${year} Check-Up Центр»`);
      const banned = fl.filter((l) => /^tel:|t\.me|instagram\.com|facebook\.com|abroad\.check-up\.in\.ua|\/ukr\/corporate\/|\/ukr\/podarunok\/|\/ukr\/child-checkup\//i.test(l.href));
      if (!miss.length && !banned.length) sub.push({ s: YES, t: 'футер 10.1: пункти міста, «Про сервіс», email, застереження, «© рік Check-Up Центр»' });
      else sub.push({ s: NO, t: `футер: ${miss.length ? `немає ${miss.join(', ')}; ` : ''}${banned.length ? `заборонені: ${banned.map((l) => l.href).join(', ')}` : ''}` });
    }
    put(6, sub);
  }

  // ---- 7. tel:, telephone, сайт клініки, {…}, [УТОЧНИТИ] ----
  {
    const sub = [];
    const tel = [...html.matchAll(/["'(]tel:([^"')<\s]*)/gi)].map((m) => m[1]);
    sub.push(tel.length ? { s: NO, t: `tel: ${[...new Set(tel)].join(', ')}` } : { s: YES, t: 'tel: немає' });
    sub.push(/"telephone"\s*:/.test(ld.raw) || /itemprop=["']telephone["']/i.test(html) ? { s: NO, t: 'є telephone у розмітці' } : { s: YES, t: 'telephone немає' });
    // Профіль рецензента – виняток (посилання в рядку рецензента)
    const reviewerHrefs = new Set(
      allElements(html, 'p')
        .filter((p) => /Медичн(і відповіді|ий рецензент)/.test(stripTags(p)))
        .flatMap((p) => links(p).map((l) => l.href)),
    );
    const clinicHosts = new Set();
    const clinicPaths = new Set(city.clinics.map((c) => c.tildaPath));
    if (db) for (const c of db.clinics) if (c.website) try { clinicHosts.add(new URL(c.website).host); } catch { /* не адреса */ }
    const tokens = [...new Set([...city.clinics.map((c) => c.slug), ...ageClinicSlugsFor(city)].flatMap((s) => s.split('-')))].filter((t) => t.length >= 4 && t !== city.slug && !/^(clinic|klinik)$/.test(t));
    const bad = [];
    for (const l of allLinks) {
      if (reviewerHrefs.has(l.href) || !/^https?:|^\//i.test(l.href)) continue;
      let u;
      try { u = new URL(l.href, `${SITE}/`); } catch { continue; }
      const own = u.host === 'check-up.in.ua' || u.host === new URL(BASE).host;
      const p = u.pathname.replace(/\/+$/, '');
      if (clinicHosts.has(u.host) || (own && clinicPaths.has(p)) || (!own && !u.host.endsWith('.check-up.in.ua') && tokens.some((t) => u.host.includes(t))) || /сайт клініки|сторінка клініки/i.test(l.text))
        bad.push(`${l.href} («${short(l.text, 40)}»)`);
    }
    sub.push(bad.length ? { s: NO, t: `посилання на сайт клініки: ${[...new Set(bad)].join(', ')}` } : { s: YES, t: `посилань на сайт клініки немає${reviewerHrefs.size ? ` (профіль рецензента – виняток: ${[...reviewerHrefs].join(', ')})` : ''}` });
    const scan = `${text} ${ld.raw} ${html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? ''} ${[...html.matchAll(/<meta\b[^>]*content=["']([^"']*)["']/gi)].map((m) => m[1]).join(' ')}`;
    const ph = [...new Set([...decode(scan).matchAll(/\{[A-Za-z_][A-Za-z0-9_]*\}/g)].map((m) => m[0]))];
    sub.push(ph.length ? { s: NO, t: `незаповнені плейсхолдери: ${ph.join(', ')}` } : { s: YES, t: 'незаповнених {…} немає' });
    sub.push(/\[УТОЧНИТИ/i.test(decode(scan)) ? { s: NO, t: `є [УТОЧНИТИ]: «${short(decode(scan).match(/.{0,60}\[УТОЧНИТИ[^\]]*\]?/i)?.[0] ?? '', 120)}»` } : { s: YES, t: '[УТОЧНИТИ] немає' });
    put(7, sub);
  }

  // ---- 8. Форма запису ----
  {
    const sub = [];
    if (page.kind !== 'age') sub.push({ s: NA, t: 'на хабі й сторінці статі запису немає (city-hub §1)' });
    else {
      const cta = /Записатися/.test(text);
      sub.push(cta ? { s: YES, t: 'кнопка «Записатися» є в HTML' } : { s: NO, t: 'кнопки «Записатися» в HTML немає' });
      // Модал BookingFlow рендериться лише після натискання – у серверному HTML форми немає; перевіряємо JS сторінки.
      const srcs = [...html.matchAll(/<script\b[^>]*src=["']([^"']+\.js[^"']*)["']/gi)].map((m) => decode(m[1])).filter((s) => s.includes('/_next/static/'));
      let found = null;
      for (const s of srcs) {
        const js = await chunk(s);
        if (js && /["']\/api\/leads["']/.test(js) && /consent_given/.test(js)) {
          found = { src: s, post: /method\s*:\s*["']POST["']/.test(js), honeypot: /name\s*:\s*["']website["']/.test(js), consent: /consent_given/.test(js) && /type\s*:\s*["']checkbox["']/.test(js) };
          break;
        }
      }
      if (!found) sub.push({ s: NO, t: `у JS сторінки (${srcs.length} файлів) немає форми з "/api/leads" і consent_given` });
      else {
        const miss = [!found.post && 'method POST', !found.honeypot && 'honeypot name="website"', !found.consent && 'чекбокс згоди'].filter(Boolean);
        sub.push(miss.length ? { s: NO, t: `форма в ${found.src}: немає ${miss.join(', ')}` } : { s: YES, t: `форма в ${found.src}: POST "/api/leads", honeypot name="website", чекбокс згоди, consent_given (у серверному HTML модала немає – він рендериться після натискання)` });
      }
    }
    put(8, sub);
  }

  // ---- 10. Рецензент ----
  {
    const sub = [];
    const pages = findType(ld.items, 'MedicalWebPage');
    const reviewedBy = pages.map((p) => p.reviewedBy).filter(Boolean).flat();
    const names = reviewedBy.map((r) => ws(r.name)).filter(Boolean);
    const visible = /Медичний рецензент:|Медичні відповіді (переглянула|переглянув)/.test(text);
    if (names.length && visible && names.every((n) => text.includes(n))) sub.push({ s: YES, t: `блок рецензента і reviewedBy: ${names.join(', ')}` });
    else if (!names.length && !visible) sub.push({ s: YES, t: 'рецензента немає: ні блоку, ні reviewedBy' });
    else sub.push({ s: NO, t: `reviewedBy: ${names.join(', ') || 'немає'}; блок на сторінці: ${visible ? 'є' : 'немає'}${names.length && !names.every((n) => text.includes(n)) ? '; ім\'я з reviewedBy не видно на сторінці' : ''}` });
    if (page.kind === 'age') {
      const cfg = page.gender === 'female' ? city.reviewer : null;
      const cfgOk = cfg ? names.includes(ws(cfg.name)) : true;
      if (!cfgOk) sub.push({ s: NO, t: `у конфігу міста рецензент ${cfg.name}, у reviewedBy – ${names.join(', ') || 'немає'}` });
    }
    put(10, sub);
  }
  return result;
}

// ---------- запуск ----------
const report = { base: BASE, drafts: DRAFTS, startedAt: new Date().toISOString(), db: DB_ON ? 'Supabase (SELECT, публічний ключ)' : 'немає (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY не задано)', cities: [] };
for (const slug of CITY_SLUGS) {
  const city = CHECKUP_CITIES[slug];
  let db = null;
  let dbError = null;
  if (DB_ON) {
    try {
      db = await loadCityDb(city);
    } catch (e) {
      dbError = e.message;
    }
  }
  const pages = [];
  for (const p of cityPages(slug)) {
    process.stdout.write(`${p.path} … `);
    const r = await checkPage(p, city, db);
    pages.push(r);
    console.log(Object.values(r.points).some((x) => x.verdict === NO) ? NO : Object.values(r.points).some((x) => x.verdict === NC) ? NC : YES);
  }
  report.cities.push({ slug, variant: city.clinics.length > 1 ? 'Б' : 'А', clinics: city.clinics.map((c) => c.slug), ageClinics: ageClinicSlugsFor(city), dbError, pages });
}
report.finishedAt = new Date().toISOString();

// ---------- звіт ----------
const lines = [];
lines.push(`# Перевірка міста – пункти 2.2 CONVEYOR-CITIES v1.2.1`, '');
lines.push(`- Адреса: ${BASE}${DRAFTS ? ' (?drafts=1)' : ''}`);
lines.push(`- Час: ${report.startedAt}`);
lines.push(`- База: ${report.db}`);
lines.push(`- Заявок скрипт не надсилає і форму не заповнює.`, '');
let no = 0;
let nc = 0;
for (const c of report.cities) {
  lines.push(`## ${c.slug} – варіант ${c.variant} (клініки: ${c.clinics.join(', ')}; вікові: ${c.ageClinics.join(', ')})`, '');
  if (c.dbError) lines.push(`Помилка бази: ${c.dbError}`, '');
  lines.push(`| Сторінка | ${POINTS.map((p) => p.id).join(' | ')} |`, `| --- | ${POINTS.map(() => '---').join(' | ')} |`);
  for (const p of c.pages) lines.push(`| ${p.path} | ${POINTS.map((pt) => p.points[pt.id]?.verdict ?? NC).join(' | ')} |`);
  lines.push('');
  for (const p of c.pages) {
    for (const pt of POINTS) {
      const r = p.points[pt.id];
      if (!r) continue;
      if (r.verdict === NO) no++;
      if (r.verdict === NC) nc++;
      if (r.verdict === NO || r.verdict === NC) {
        lines.push(`- **${r.verdict}** · ${p.path} · п. ${pt.id} ${pt.name}`);
        for (const s of r.sub.filter((x) => x.s === NO || x.s === NC)) lines.push(`  - ${s.s}: ${s.t} (${p.url})`);
      }
    }
  }
  lines.push('');
}
lines.push('## Пункти', '', ...POINTS.map((p) => `${p.id}. ${p.name}`), '', '## Не автоматизовано', '', ...MANUAL.map((m) => `- ${m}`), '');
lines.push(`Підсумок: NO – ${no}, НЕ ПЕРЕВІРЕНО – ${nc}.`);
mkdirSync(OUT, { recursive: true });
writeFileSync(join(OUT, 'city-check.md'), lines.join('\n'));
writeFileSync(join(OUT, 'city-check.json'), JSON.stringify(report, null, 2));
console.log(`\nNO – ${no}, НЕ ПЕРЕВІРЕНО – ${nc}. Звіт: ${join(OUT, 'city-check.md')}, докази – ${join(OUT, 'city-check.json')}`);
process.exit(no || nc ? 1 : 0);
