import { db } from '@/lib/supabase';
import type { CheckupProgram } from '@/lib/types';

// Дані сторінок /turkey* – тільки з бази (TURKEY-MIGRATION.md v0.6, розділи 2–3): клініки, філії, програми.
// Ціни і валюта – з checkup_programs (price_discount, currency), нічого не хардкодиться.

export type TurkeyClinicKey = 'livhospital' | 'acibadem' | 'anadolu';

/** Адреса сторінки → slug клініки в таблиці clinics. */
export const TURKEY_CLINICS: Record<TurkeyClinicKey, { slug: string }> = {
  livhospital: { slug: 'liv-hospital-istanbul' },
  acibadem: { slug: 'acibadem-istanbul' },
  anadolu: { slug: 'anadolu-istanbul' },
};

export interface TurkeyBranch {
  id: string;
  address_ua: string;
  metro_ua: string | null;
  address_ru: string;
  metro_ru: string | null;
}

/** Картка програми з колонкою details (summary, duration, description[], goals[], preparation[]). */
export interface TurkeyProgram extends CheckupProgram {
  currency: string;
  details: {
    summary?: string | null;
    duration?: string | null;
    description?: string[];
    goals?: string[];
    preparation?: { group: string; items: string[] }[];
  } | null;
  // composition (унаслідовано): для турецьких клінік – масив {group, items[]}, у типі CheckupProgram – Record; читається через приведення.
}

export interface TurkeyClinicData {
  clinic: { id: string; name: string; slug: string } | null;
  branches: TurkeyBranch[];
  programs: TurkeyProgram[];
}

const EMPTY: TurkeyClinicData = { clinic: null, branches: [], programs: [] };

export async function fetchTurkeyClinic(key: TurkeyClinicKey): Promise<TurkeyClinicData> {
  try {
    const sb = db() as any;
    const { data: clinic } = await sb.from('clinics').select('id, name, slug').eq('slug', TURKEY_CLINICS[key].slug).single();
    if (!clinic?.id) return EMPTY;
    const [{ data: branches }, { data: programs }] = await Promise.all([
      sb.from('clinic_branches').select('id, address_ua, metro_ua, address_ru, metro_ru').eq('clinic_id', clinic.id).order('sort_order', { ascending: true }),
      sb
        .from('checkup_programs')
        .select('*')
        .eq('clinic_id', clinic.id)
        .eq('is_active', true)
        .eq('program_type', 'clinic')
        .order('sort_order', { ascending: true }),
    ]);
    return { clinic, branches: (branches ?? []) as TurkeyBranch[], programs: (programs ?? []) as TurkeyProgram[] };
  } catch {
    return EMPTY;
  }
}

/** Мінімальна ціна активних програм клініки в USD (price_discount) – «от {minPrice} USD» на хабі. null – програм немає. */
export function minPriceUsd(programs: TurkeyProgram[]): number | null {
  const prices = programs.filter((p) => p.currency === 'USD' && p.price_discount > 0).map((p) => p.price_discount);
  return prices.length > 0 ? Math.min(...prices) : null;
}
