import { cache } from 'react';
import { db } from '@/lib/supabase';
import { fetchClinicOffers, type ClinicOffersData } from '@/lib/programs/clinic-offer';
import type { CheckupCity, CityClinic } from '@/lib/cities/checkup-cities';

// Дані хабу міста і сторінок статі (тип 5, хвиля 1, 01.11.2026): картки клінік-партнерів (ClinicCard),
// GEO-рядки і мінімальна ціна «Програми від {min_price} грн».
// Лише SELECT з Supabase (анонімний ключ). Клініки може не бути в базі (Ужгород до запису) – тоді вона просто
// випадає зі списку: картки, рядка GEO і ціни для неї немає, сторінка не падає.

export const SITE = 'https://check-up.in.ua';

export interface HubBranch {
  id: string;
  name_ua: string;
  address_ua: string;
  metro_ua: string | null;
  schedule: Record<string, string> | null;
}

export interface HubClinic {
  slug: string;
  name: string;
  /** clinics.facility_type – нова nullable-колонка (ще не в базі); немає – рядка в картці немає. */
  facilityType: string | null;
  /** clinics.license; немає – рядка в картці немає. */
  license: string | null;
  /** «Сторінка клініки →»: субдомен клініки (clinics.website), інакше сторінка клініки на Tilda (абсолютна адреса). */
  url: string;
  branches: HubBranch[];
}

function textOrNull(v: unknown): string | null {
  return typeof v === 'string' && v.trim() ? v.trim() : null;
}

/**
 * Клініка за slug. select('*'): колонки facility_type (і license) у базі може ще не бути – запит з '*' від цього
 * не падає, відсутнє поле читається як null.
 */
export const fetchHubClinic = cache(async (slug: string, tildaPath: string): Promise<HubClinic | null> => {
  try {
    const sb = db() as any;
    const { data: clinic, error } = await sb.from('clinics').select('*').eq('slug', slug).maybeSingle();
    if (error || !clinic?.id || !textOrNull(clinic.name)) return null;
    const { data: branches } = await sb
      .from('clinic_branches')
      .select('id, name_ua, address_ua, metro_ua, schedule')
      .eq('clinic_id', clinic.id)
      .order('sort_order', { ascending: true });
    return {
      slug,
      name: clinic.name.trim(),
      facilityType: textOrNull(clinic.facility_type),
      license: textOrNull(clinic.license),
      url: textOrNull(clinic.website) ?? `${SITE}${tildaPath}`,
      branches: ((branches ?? []) as HubBranch[]).filter((b) => textOrNull(b.address_ua)),
    };
  } catch {
    return null;
  }
});

/** Клініки міста з бази в порядку з конфігурації (PLATFORM-LINE 2.2). Відсутні в базі – пропускаються. */
export async function fetchCityClinics(city: CheckupCity): Promise<HubClinic[]> {
  const rows = await Promise.all(city.clinics.map((c: CityClinic) => fetchHubClinic(c.slug, c.tildaPath)));
  return rows.filter((c): c is HubClinic => c !== null);
}

/** Варіант текстів: А – одна клініка в конфігурації міста, Б – кілька (CITY-HUB-TEXTS). */
export function cityVariant(city: CheckupCity): 'a' | 'b' {
  return city.clinics.length > 1 ? 'b' : 'a';
}

// ─── Ціна ────────────────────────────────────────────────────────────────────────────────────────────

export type PriceScope = 'all' | 'female' | 'male';

const FEMALE_PROGRAMS = ['female-checkup-do-30', 'female-checkup-30-40', 'female-checkup-40-50', 'female-checkup-vid-50'];
const MALE_PROGRAMS = ['male-checkup-do-30', 'male-checkup-30-40', 'male-checkup-40-50', 'male-checkup-vid-50'];

/** Платформні програми вікових сторінок для обсягу сторінки: хаб міста – обидві статі, сторінка статі – своя. */
export function platformProgramsFor(scope: PriceScope): string[] {
  if (scope === 'female') return FEMALE_PROGRAMS;
  if (scope === 'male') return MALE_PROGRAMS;
  return [...FEMALE_PROGRAMS, ...MALE_PROGRAMS];
}

/** Програми клініки для вікових сторінок обсягу (кеш на запит рендеру: metadata і сторінка читають одне). */
export const fetchScopeOffers = cache(
  (scope: PriceScope, clinicSlug: string): Promise<ClinicOffersData> => fetchClinicOffers(platformProgramsFor(scope), clinicSlug),
);

/**
 * Єдиний розрахунок {min_price} для meta description і рядка «Програми від {min_price} грн» (SEO-AUDIT №3,
 * SEO-MIGRATION 2А): мінімальна price_discount (> 0) серед програм клінік міста, прив'язаних до вікових сторінок
 * обсягу (platform_program_offers, program_type = 'clinic', is_active). null – цін немає: ні рядка, ні ціни в meta.
 */
export const cityMinPrice = cache(async (citySlug: string, scope: PriceScope, clinicSlugsKey: string): Promise<number | null> => {
  const slugs = clinicSlugsKey.split(',').filter(Boolean);
  const all = await Promise.all(slugs.map((s) => fetchScopeOffers(scope, s)));
  const prices = all
    .flatMap((d) => d.offers.map((o) => o.program.price_discount))
    .filter((p): p is number => typeof p === 'number' && p > 0);
  return prices.length ? Math.min(...prices) : null;
});

export function minPriceFor(city: CheckupCity, scope: PriceScope): Promise<number | null> {
  return cityMinPrice(city.slug, scope, city.clinics.map((c) => c.slug).join(','));
}

/** 4500 → «4 500» (як ціни на вікових сторінках). */
export function priceText(price: number): string {
  return price.toLocaleString('uk-UA');
}

// ─── Філії ───────────────────────────────────────────────────────────────────────────────────────────

const SCHEDULE_LABELS: [string, string][] = [
  ['mon_fri', 'пн–пт'],
  ['sat', 'сб'],
  ['sun', 'нд'],
];

/** Графік філії з clinic_branches.schedule (ключі mon_fri / sat / sun), як на сторінках міста. */
export function scheduleText(b: { schedule: Record<string, string> | null }): string | null {
  if (!b.schedule) return null;
  const parts = SCHEDULE_LABELS.filter(([k]) => b.schedule?.[k]).map(([k, label]) => `${label} ${b.schedule?.[k]}`);
  return parts.length ? parts.join(', ') : null;
}

/** {branch_list}: «адреса (метро); адреса» – як у GEO-блоках сторінок міста. */
export function branchList(branches: HubBranch[]): string | null {
  if (!branches.length) return null;
  return branches.map((b) => `${b.address_ua}${b.metro_ua ? ` (${b.metro_ua})` : ''}`).join('; ');
}

export function branchesWord(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return 'філія';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'філії';
  return 'філій';
}
