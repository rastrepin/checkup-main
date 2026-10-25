// Сторінка T3 «Скринінг 40+ у місті»: зміст з .md, заклади з реєстру МОЗ (data/screening/registry-<city>.json).
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseT3 } from './t3-md.mjs';
import { programAmountText } from './program';

export interface T3Item { title: string; text: string }
export interface T3Section { paragraphs: string[]; list: string[]; items: T3Item[]; teaser: string | null }
export interface T3Doc {
  fm: Record<string, string> & { sources: { title: string; url: string; date: string }[] };
  sections: Record<'how' | 'eligibility' | 'includes' | 'preparation' | 'not_included' | 'results' | 'faq', T3Section>;
}

export interface RegistryInstitution {
  edrpou: string;
  registry_name: string;
  name: string;
  addresses: string[];
  is_partner: boolean;
  partner_brand?: string;
  clinic_slug?: string;
  online_booking: boolean;
}
export interface Registry { city: string; as_of: string | null; source: string; institutions: RegistryInstitution[] }

const fill = (s: string) => s.split('{program_amount}').join(programAmountText());

export function loadT3(city: string, slug: string): T3Doc {
  const src = readFileSync(join(process.cwd(), 'content', 'zona-dovity', 't3', city, `${slug}.md`), 'utf8');
  const doc = parseT3(fill(src)) as unknown as T3Doc;
  return doc;
}

/** Порядок (spec §5 п.3): спершу партнери платформи, далі решта за алфавітом. */
export function loadRegistry(city: string): Registry {
  const reg = JSON.parse(readFileSync(join(process.cwd(), 'data', 'screening', `registry-${city}.json`), 'utf8')) as Registry;
  reg.institutions.sort((a, b) => Number(b.is_partner) - Number(a.is_partner) || a.name.localeCompare(b.name, 'uk'));
  return reg;
}

export function dateLabel(iso: string | null): string | null {
  if (!iso) return null;
  const [y, m, d] = iso.split('-');
  return `${d}.${m}.${y}`;
}
