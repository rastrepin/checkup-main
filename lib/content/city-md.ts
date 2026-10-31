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

export type MdInline = { type: 'text'; text: string } | { type: 'bold'; text: string } | { type: 'link'; text: string; href: string };

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
  const re = /\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push({ type: 'text', text: text.slice(last, m.index) });
    if (m[1] !== undefined) out.push({ type: 'bold', text: m[1] });
    else out.push({ type: 'link', text: m[2], href: m[3] });
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push({ type: 'text', text: text.slice(last) });
  return out;
}

function substitute(text: string, vars: CityMdVars, file: string): string {
  return text.replace(/\{([a-z_]+)\}/g, (whole, key: string) => {
    if (key in vars) return String(vars[key]);
    console.warn(`[city-md] ${file}: плейсхолдер ${whole} не має значення – лишається як є.`);
    return whole;
  });
}

export function parseCityMd(source: string, vars: CityMdVars, file = 'md'): CityMdSection {
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
  text = substitute(text, vars, file);

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
