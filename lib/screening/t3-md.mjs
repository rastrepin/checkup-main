// Розбір і перевірка .md сторінки T3 «Скринінг 40+ у місті» (docs/ux/specs/2026-10-pmh-page-types.md §1.5, §6 у checkup-platform).
// Спільний для сторінки (lib/screening/t3.ts) і перевірки збірки (scripts/check-zona-dovity.mjs).

export const T3_REQUIRED_FIELDS = ['type', 'slug', 'city', 'primary_intent', 'title', 'description', 'h1', 'lead', 'sources'];
export const T3_SECTIONS = ['how', 'eligibility', 'includes', 'preparation', 'not_included', 'results', 'faq'];

const FORBIDDEN = [
  /гарантовано безкоштовн/iu,
  /повністю безкоштовн/iu,
  /жодних доплат/iu,
  /жодних платежів/iu,
  /без черги/iu,
  /найкращ/iu,
  /\d[\d\s]*\s?грн/iu,
  /\[УТОЧНИТИ\]/u,
];

const unquote = (s) => s.trim().replace(/^"(.*)"$/s, '$1').replace(/^'(.*)'$/s, '$1');

/** Мінімальний розбір frontmatter: `key: value` і список `sources` з полями title/url/date. */
function parseFrontmatter(src) {
  const fm = {};
  let list = null;
  for (const line of src.split('\n')) {
    if (!line.trim()) continue;
    const item = line.match(/^\s+-\s+(\w+):\s*(.*)$/);
    const cont = line.match(/^\s{4,}(\w+):\s*(.*)$/);
    const top = line.match(/^(\w+):\s*(.*)$/);
    if (item && list) list.push({ [item[1]]: unquote(item[2]) });
    else if (cont && list?.length) list[list.length - 1][cont[1]] = unquote(cont[2]);
    else if (top) {
      if (top[2].trim() === '') { list = []; fm[top[1]] = list; }
      else { list = null; fm[top[1]] = unquote(top[2]); }
    }
  }
  return fm;
}

/** Розділи `## key`; у розділі – пункти `### Заголовок` з текстом, список `- …`, рядки `teaser: …` і абзаци. */
function parseSection(body) {
  const out = { paragraphs: [], list: [], items: [], teaser: null };
  let cur = null;
  for (const raw of body.split('\n')) {
    const line = raw.trim();
    if (!line || line.startsWith('<!--')) { cur = cur && { ...cur }; continue; }
    const h3 = line.match(/^###\s+(.*)$/);
    if (h3) { cur = { title: h3[1].trim(), text: '' }; out.items.push(cur); continue; }
    if (line.startsWith('teaser:')) { out.teaser = line.slice(7).trim(); continue; }
    if (line.startsWith('- ')) { out.list.push(line.slice(2).trim()); continue; }
    if (out.items.length) { const last = out.items[out.items.length - 1]; last.text = last.text ? `${last.text} ${line}` : line; }
    else out.paragraphs.push(line);
  }
  return out;
}

export function parseT3(src) {
  const m = src.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) throw new Error('немає frontmatter');
  const fm = parseFrontmatter(m[1]);
  const body = m[2].replace(/<!--[\s\S]*?-->/g, '');
  const sections = {};
  const unknown = [];
  for (const part of body.split(/^##\s+/m).slice(1)) {
    const nl = part.indexOf('\n');
    const key = part.slice(0, nl).trim();
    if (!T3_SECTIONS.includes(key)) unknown.push(key);
    sections[key] = parseSection(part.slice(nl + 1));
  }
  return { fm, sections, unknown };
}

const words = (s) => s.split(/\s+/).filter(Boolean).length;

/** Повертає перелік помилок; порожній – файл придатний. */
export function validateT3(src) {
  const errors = [];
  let doc;
  try { doc = parseT3(src); } catch (e) { return [String(e.message)]; }
  const { fm, sections, unknown } = doc;
  for (const f of T3_REQUIRED_FIELDS) if (!fm[f] || (Array.isArray(fm[f]) && !fm[f].length)) errors.push(`бракує поля ${f}`);
  if (fm.type && fm.type !== 't3') errors.push(`type має бути t3, а не ${fm.type}`);
  for (const s of T3_SECTIONS) if (!sections[s]) errors.push(`бракує розділу ## ${s}`);
  for (const u of unknown) errors.push(`невідомий розділ ## ${u}`);
  if (fm.h1 && [...fm.h1].length > 60) errors.push(`H1 довший за 60 знаків (${[...fm.h1].length})`);
  if (fm.lead && [...fm.lead.replace('{program_amount}', '0000 грн')].length > 200) errors.push('lead довший за 200 знаків');
  const faq = sections.faq?.items ?? [];
  if (faq.length > 7) errors.push(`FAQ має ${faq.length} питань, максимум 7`);
  for (const q of faq) if (words(q.text) > 80) errors.push(`відповідь «${q.title}» довша за 80 слів`);
  for (const s of Object.values(sections)) {
    for (const p of [...s.paragraphs, ...s.items.filter((i) => !faq.includes(i)).map((i) => i.text)]) {
      if (words(p) > 60) errors.push(`абзац довший за 60 слів: «${p.slice(0, 40)}…»`);
    }
  }
  const text = [fm.title, fm.description, fm.h1, fm.h1_tail, fm.lead, ...Object.values(sections).flatMap((s) => [
    ...s.paragraphs, ...s.list, s.teaser ?? '', ...s.items.flatMap((i) => [i.title, i.text]),
  ])].filter(Boolean).join('\n');
  for (const re of FORBIDDEN) {
    const hit = text.match(re);
    if (hit) errors.push(`заборонене формулювання: «${hit[0]}»`);
  }
  return errors;
}
