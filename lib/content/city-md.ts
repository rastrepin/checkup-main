import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

// Необов'язкові текстові блоки сторінок міста з MD-файлів content/{папка міста}/ (31.10.2026).
// Блок рендериться, лише коли файл є: сторінка читає його під час рендеру на сервері.
// Файли потрапляють у серверну збірку через outputFileTracingIncludes у next.config.ts.
//
// Що розуміє розбір (підмножина Markdown, як у файлах content/):
// - фронтметеріал --- … --- на початку (з нього береться лише eyebrow:), HTML-коментарі <!-- --> і все після
//   окремого рядка --- (службовий блок) не рендеряться;
// - «H2: текст», «# текст», «## текст» – заголовок блоку (перший) або підзаголовок; «## 1_hero»-подібні
//   ключі розділів (латиниця, цифри, _) пропускаються; «### текст» – підзаголовок;
// - абзаци, списки «- …» і «1. …», **жирний**, [посилання](/адреса);
// - плейсхолдери {city}, {city_loc}, {city_slug}, {clinic}, {clinics_count} замінюються даними міста.

export type MdInline =
  | { type: 'text'; text: string }
  | { type: 'bold'; text: string }
  | { type: 'link'; text: string; href: string }
  /** Маркер джерела « [1]» / « [2, 3]» – пункт n у списку джерел сторінки. */
  | { type: 'ref'; n: number[] };

export type MdBlock =
  | { type: 'p'; content: MdInline[] }
  | { type: 'h3'; content: MdInline[] }
  | { type: 'ul' | 'ol'; items: MdInline[][] };

export interface CityMdSection {
  /** Заголовок блоку (перший заголовок файлу); null – у файлі заголовка немає. */
  heading: string | null;
  /** Надзаголовок з фронтметеріалу (eyebrow:); null – немає. */
  eyebrow: string | null;
  blocks: MdBlock[];
}

export type CityMdVars = Record<string, string | number>;

const SECTION_KEY = /^[a-z0-9_]+$/;

function parseInline(text: string): MdInline[] {
  const out: MdInline[] = [];
  const re = /\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)\s]+)\)|\s?\[(\d+(?:,\s*\d+)*)\](?!\()/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push({ type: 'text', text: text.slice(last, m.index) });
    if (m[1] !== undefined) out.push({ type: 'bold', text: m[1] });
    else if (m[4] !== undefined) out.push({ type: 'ref', n: m[4].split(',').map((x) => Number(x.trim())) });
    else out.push({ type: 'link', text: m[2], href: m[3] });
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push({ type: 'text', text: text.slice(last) });
  return out;
}

function substitute(text: string, vars: CityMdVars, file: string, silent = false): string {
  return text.replace(/\{([a-z_0-9]+)\}/g, (whole, key: string) => {
    if (key in vars && vars[key] !== null && vars[key] !== undefined) return String(vars[key]);
    if (!silent) console.warn(`[city-md] ${file}: плейсхолдер ${whole} не має значення – лишається як є.`);
    return whole;
  });
}

/** Підставляє значення в текст; плейсхолдер без значення лишається як є ({key}). */
export function fillPlaceholders(text: string, vars: CityMdVars): string {
  return substitute(text, vars, 'text', true);
}

export function parseCityMd(source: string, vars: CityMdVars, file = 'md', silent = false): CityMdSection {
  let text = source.replace(/\r\n/g, '\n');
  let eyebrow: string | null = null;
  const fm = text.match(/^---\n([\s\S]*?)\n---\n/);
  if (fm) {
    const e = fm[1].match(/^eyebrow:\s*"?(.*?)"?\s*$/m);
    if (e && e[1]) eyebrow = substitute(e[1], vars, file);
    text = text.slice(fm[0].length);
  }
  text = text.replace(/<!--[\s\S]*?-->/g, '');
  const service = text.search(/^---\s*$/m);
  if (service >= 0) text = text.slice(0, service);
  text = substitute(text, vars, file, silent);

  let heading: string | null = null;
  const blocks: MdBlock[] = [];
  let para: string[] = [];
  let list: { type: 'ul' | 'ol'; items: MdInline[][] } | null = null;
  const flushPara = () => {
    if (para.length) blocks.push({ type: 'p', content: parseInline(para.join(' ')) });
    para = [];
  };
  const flushList = () => {
    if (list) blocks.push(list);
    list = null;
  };
  const addHeading = (t: string, level: 2 | 3) => {
    flushPara();
    flushList();
    if (level === 2 && heading === null && blocks.length === 0) heading = t;
    else blocks.push({ type: 'h3', content: parseInline(t) });
  };

  for (const raw of text.split('\n')) {
    const line = raw.trim();
    if (!line) {
      flushPara();
      flushList();
      continue;
    }
    let m: RegExpMatchArray | null;
    if ((m = line.match(/^H2:\s*(.+)$/)) || (m = line.match(/^#{1,2}\s+(.+)$/))) {
      if (SECTION_KEY.test(m[1].trim())) {
        flushPara();
        flushList();
        continue;
      }
      addHeading(m[1].trim(), 2);
      continue;
    }
    if ((m = line.match(/^(?:H3:\s*|#{3,6}\s+)(.+)$/))) {
      addHeading(m[1].trim(), 3);
      continue;
    }
    if ((m = line.match(/^[-*]\s+(.+)$/)) || (m = line.match(/^\d+[.)]\s+(.+)$/))) {
      flushPara();
      const type = /^\d/.test(line) ? 'ol' : 'ul';
      if (!list || list.type !== type) {
        flushList();
        list = { type, items: [] };
      }
      list.items.push(parseInline(m[1]));
      continue;
    }
    flushList();
    para.push(line);
  }
  flushPara();
  flushList();
  return { heading, eyebrow, blocks };
}

/**
 * Читає content/{dir}/{name}.md; спершу файл міста {name}-{citySlug}.md, потім спільний {name}.md.
 * null – файлу немає або в ньому немає тексту (блок не рендериться).
 */
export function loadCityMd(dir: string, name: string, citySlug: string, vars: CityMdVars): CityMdSection | null {
  const base = join(process.cwd(), 'content', dir);
  for (const file of [`${name}-${citySlug}.md`, `${name}.md`]) {
    const path = join(base, file);
    if (!existsSync(path)) continue;
    try {
      const section = parseCityMd(readFileSync(path, 'utf8'), vars, `content/${dir}/${file}`);
      return section.blocks.length > 0 || section.heading ? section : null;
    } catch {
      return null;
    }
  }
  return null;
}

// ─── Файл з розділами (хаб міста і сторінки статі, хвиля 1, 01.11.2026) ───────────────────────────────
// Файл ділиться рядками «## ключ» (латиниця, цифри, _) на розділи; кожен розділ розбирається parseCityMd.
// Плейсхолдер без значення (значення null / undefined або ключа немає) лишається в тексті як {key}:
// шаблон не рендерить абзац, пункт списку чи питання FAQ, де такий лишився (unresolved).

export type CityMdDoc = {
  /** Розібрані розділи з підставленими значеннями. */
  sections: Record<string, CityMdSection>;
  /** Сирий текст розділу (без коментарів, до підстановки) – для вкладених плейсхолдерів. */
  raw: Record<string, string>;
};

const UNRESOLVED = /\{[a-z_0-9]+\}/;

export function inlineText(parts: MdInline[]): string {
  return parts.map((p) => (p.type === 'ref' ? '' : p.text)).join('');
}

export function hasUnresolved(parts: MdInline[]): boolean {
  return parts.some((p) => (p.type === 'link' ? UNRESOLVED.test(p.text) || UNRESOLVED.test(p.href) : p.type !== 'ref' && UNRESOLVED.test(p.text)));
}

/** Блоки розділу без абзаців і пунктів з плейсхолдерами без значення; порожні списки прибираються. */
export function resolvedBlocks(section: CityMdSection | undefined | null): MdBlock[] {
  if (!section) return [];
  const out: MdBlock[] = [];
  for (const b of section.blocks) {
    if (b.type === 'p' || b.type === 'h3') {
      if (!hasUnresolved(b.content)) out.push(b);
      continue;
    }
    const items = b.items.filter((it) => !hasUnresolved(it));
    if (items.length) out.push({ type: b.type, items });
  }
  return out;
}

/** Текст першого абзацу розділу (title, H1, лід, meta); null – розділу немає або є плейсхолдер без значення. */
export function sectionText(section: CityMdSection | undefined | null): string | null {
  const first = section?.blocks.find((b) => b.type === 'p');
  if (!first || first.type !== 'p' || hasUnresolved(first.content)) return null;
  return inlineText(first.content).trim() || null;
}

/** Заголовок розділу (H2: …); null – немає або є плейсхолдер без значення. */
export function sectionHeading(section: CityMdSection | undefined | null): string | null {
  const h = section?.heading ?? null;
  return h && !UNRESOLVED.test(h) ? h : null;
}

export interface CityFaqItem {
  q: string;
  /** Відповідь для FAQPage – той самий текст, що на сторінці, без маркерів джерел. */
  a: string;
  /** Абзаци відповіді для сторінки. */
  answer: MdInline[][];
}

/** FAQ з розділу: абзац лише з **жирним** – питання, наступні абзаци – відповідь.
 *  Питання з плейсхолдером без значення (у питанні або відповіді) випадає з видимого FAQ і з FAQPage разом. */
export function faqItems(section: CityMdSection | undefined | null): CityFaqItem[] {
  if (!section) return [];
  const items: { q: MdInline[]; answer: MdInline[][] }[] = [];
  for (const b of section.blocks) {
    if (b.type !== 'p') continue;
    if (b.content.length === 1 && b.content[0].type === 'bold') items.push({ q: b.content, answer: [] });
    else if (items.length) items[items.length - 1].answer.push(b.content);
  }
  return items
    .filter((it) => it.answer.length > 0 && !hasUnresolved(it.q) && !it.answer.some(hasUnresolved))
    .map((it) => ({
      q: inlineText(it.q).trim(),
      a: it.answer.map((p) => inlineText(p).trim()).join(' '),
      answer: it.answer,
    }));
}

function stripMdComments(text: string): string {
  return text.replace(/^---\n[\s\S]*?\n---\n/, '').replace(/<!--[\s\S]*?-->/g, '');
}

/** Читає content/{dir}/{name}.md з розділами «## ключ»; null – файлу немає. */
export function loadCityMdSections(dir: string, name: string, vars: CityMdVars): CityMdDoc | null {
  const file = `content/${dir}/${name}.md`;
  const path = join(process.cwd(), 'content', dir, `${name}.md`);
  if (!existsSync(path)) return null;
  let text: string;
  try {
    text = stripMdComments(readFileSync(path, 'utf8').replace(/\r\n/g, '\n'));
  } catch {
    return null;
  }
  const raw: Record<string, string> = {};
  let key: string | null = null;
  let buf: string[] = [];
  const flush = () => {
    if (key) raw[key] = buf.join('\n').trim();
    buf = [];
  };
  for (const line of text.split('\n')) {
    const m = line.match(/^##\s+([a-z0-9_]+)\s*$/);
    if (m) {
      flush();
      key = m[1];
      continue;
    }
    buf.push(line);
  }
  flush();
  const sections: Record<string, CityMdSection> = {};
  for (const [k, v] of Object.entries(raw)) sections[k] = parseCityMd(v, vars, `${file}#${k}`, true);
  return { sections, raw };
}
