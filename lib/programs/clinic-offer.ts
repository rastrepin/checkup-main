import { db } from '@/lib/supabase';
import type { CheckupProgram } from '@/lib/types';
import { fetchProgramComposition, type ProgramComposition } from '@/lib/programs/composition';

// Вибір програми клініки для вікових сторінок міста (SPRINT-KHARKIV-v0, розділ 6).
// Зв'язок: platform_programs (стать + вік) → platform_program_offers →
// checkup_programs з program_type = 'clinic' і is_active → clinics за slug.
// Синтетичні regular-/standard-програми (program_type = 'standard') і програми
// інших клінік не повертаються. UUID у коді не зберігаються: сторінка передає
// тільки slug платформної програми і slug клініки.
// fetchType5aData (lib/programs/type5a.ts) не змінюється – ним користуються
// інші сторінки.

export interface OfferClinic {
  id: string;
  name: string;
  slug: string;
  website: string | null;
  /** clinics.phone – станом на 23.09.2026 порожній; блок «Двері» без телефону. */
  phone: string | null;
}

export interface OfferBranch {
  id: string;
  name_ua: string;
  address_ua: string;
  metro_ua: string | null;
  schedule: Record<string, string> | null;
  tracking_phone: string | null;
}

export interface OfferProgram extends CheckupProgram {
  price_date: string | null;
  program_type: string | null;
}

export interface ClinicOffer {
  program: OfferProgram;
  composition: ProgramComposition;
  /** Слаги платформних програм із запиту, яким відповідає ця програма клініки
   *  (одна програма клініки може покривати кілька вікових кроків). */
  platformSlugs: string[];
}

export interface ClinicOffersData {
  clinic: OfferClinic | null;
  branches: OfferBranch[];
  /** Назви активних послуг клініки (clinic_services.is_active) – щоб сторінка
   *  визначила, чи доступне доповнення в цій клініці. Ціни не повертаються. */
  clinicServiceNames: string[];
  /** Програми клініки в порядку sort_order оферів. Порожній масив – даних немає. */
  offers: ClinicOffer[];
}

const EMPTY: ClinicOffersData = { clinic: null, branches: [], clinicServiceNames: [], offers: [] };

async function fetchClinicAndBranches(sb: any, clinicSlug: string) {
  const { data: clinic } = await sb
    .from('clinics')
    .select('id, name, slug, website, phone')
    .eq('slug', clinicSlug)
    .single();
  if (!clinic?.id) return { clinic: null, branches: [] as OfferBranch[], clinicServiceNames: [] as string[] };
  const [{ data: branches }, { data: services }] = await Promise.all([
    sb
      .from('clinic_branches')
      .select('id, name_ua, address_ua, metro_ua, schedule, tracking_phone')
      .eq('clinic_id', clinic.id)
      .order('sort_order', { ascending: true }),
    sb.from('clinic_services').select('name_ua').eq('clinic_id', clinic.id).eq('is_active', true),
  ]);
  return {
    clinic: clinic as OfferClinic,
    branches: (branches ?? []) as OfferBranch[],
    clinicServiceNames: ((services ?? []) as { name_ua: string }[]).map((s) => s.name_ua),
  };
}

/**
 * Програми клініки для набору платформних програм (напр. ['female-checkup-40-50']).
 * Кілька платформних програм – для сторінки статі в місті; дублікати програм
 * клініки прибираються, порядок – за першою появою.
 */
export async function fetchClinicOffers(
  platformProgramSlugs: string[],
  clinicSlug: string,
): Promise<ClinicOffersData> {
  try {
    const sb = db() as any;
    const { clinic, branches, clinicServiceNames } = await fetchClinicAndBranches(sb, clinicSlug);
    if (!clinic) return EMPTY;

    const { data: platformPrograms } = await sb
      .from('platform_programs')
      .select('id, slug')
      .in('slug', platformProgramSlugs);
    const ordered: { id: string; slug: string }[] = platformProgramSlugs
      .map((slug) => ({ id: (platformPrograms ?? []).find((p: any) => p.slug === slug)?.id as string, slug }))
      .filter((x) => Boolean(x.id));
    const orderedIds = ordered.map((x) => x.id);
    if (orderedIds.length === 0) return { clinic, branches, clinicServiceNames, offers: [] };

    const { data: offerRows } = await sb
      .from('platform_program_offers')
      .select('platform_program_id, sort_order, checkup_programs(*)')
      .in('platform_program_id', orderedIds)
      .order('sort_order', { ascending: true });

    const programs: OfferProgram[] = [];
    const slugsByProgram = new Map<string, string[]>();
    for (const pp of ordered) {
      for (const row of offerRows ?? []) {
        if (row.platform_program_id !== pp.id) continue;
        const p = row.checkup_programs as OfferProgram | null;
        if (!p) continue;
        if (p.program_type !== 'clinic' || !p.is_active || p.clinic_id !== clinic.id) continue;
        const slugs = slugsByProgram.get(p.id) ?? [];
        if (!slugs.includes(pp.slug)) slugs.push(pp.slug);
        slugsByProgram.set(p.id, slugs);
        if (programs.some((x) => x.id === p.id)) continue;
        programs.push(p);
      }
    }

    const compositions = await Promise.all(programs.map((p) => fetchProgramComposition(p.id)));
    return {
      clinic,
      branches,
      clinicServiceNames,
      offers: programs.map((program, i) => ({
        program,
        composition: compositions[i],
        platformSlugs: slugsByProgram.get(program.id) ?? [],
      })),
    };
  } catch {
    return EMPTY;
  }
}
