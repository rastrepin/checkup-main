import { cache } from 'react';
import { db } from '@/lib/supabase';
import type { CheckupCity } from '@/lib/cities/checkup-cities';
import { AGE_GROUPS, ageOverlaps, groupSlug, type AgeSegment, type PlanGender } from './age-groups';
import { MY_PLAN_CONFIG } from './config';

// Дані блоку «Мій план» – лише з бази, за правилами DATABASE.md 2.1 §6.2 (docs/ux/specs/2026-11-my-plan.md v0.4 §8, §8в).
// Анонімний ключ: RLS віддає лише активні обстеження і фактори та переглянуті рядки плану (reviewed_at).
// content/plans/*.md шаблон не читає. Немає жодного публічного рядка Базового плану – null, блоку немає.

export type RationaleType = 'guideline' | 'know_your_norm' | 'doctor';

export interface PlanExam {
  slug: string;
  name: string;
  purpose: string | null;
  rationaleType: RationaleType | null;
  rationale: string | null;
  sourceRef: string | null;
  /** Текст шкоди – лише з датою рецензента (harm_reviewed_at); інакше null і картка не перегортається. */
  harm: string | null;
  /** Входить в інше обстеження (тиск → консультація): без ціни, без «Не потрібно». */
  includedIn: string | null;
}

export interface PlanRow {
  slug: string;
  condition: string | null;
  locked: boolean;
}

export interface PlanRiskFactor {
  code: string;
  name: string;
  slugs: string[];
}

export interface PlanService {
  id: string;
  price: number;
  date: string;
}

/** Ціна обстеження в клініці: послуги з in_price = true; 'none' – зв'язків немає; 'noprice' – є послуга без точної ціни. */
export type ExamPrice = { services: string[]; total: number; date: string } | 'none' | 'noprice';

export interface PlanBranch {
  id: string;
  address: string;
  metro: string | null;
}

export interface PlanClinic {
  slug: string;
  id: string;
  shortName: string;
  /** Філії клініки для форми запису за планом (my-plan v0.4 §8в), порядок – clinic_branches.sort_order. */
  branches: PlanBranch[];
  /** Найстаріша дата прайсу серед послуг клініки, що закривають обстеження цього блоку. */
  priceDate: string | null;
  services: Record<string, PlanService>;
  prices: Record<string, ExamPrice>;
}

export interface MyPlanData {
  gender: PlanGender;
  seg: AgeSegment;
  city: { slug: string; loc: string; inCity: string };
  exams: Record<string, PlanExam>;
  base: PlanRow[];
  extras: string[];
  risk: PlanRiskFactor[];
  /** Клініки міста в порядку конфігурації, у яких є ціна хоча б одного обстеження блоку. */
  clinics: PlanClinic[];
}

/* eslint-disable @typescript-eslint/no-explicit-any */
type Row = Record<string, any>;

const str = (v: unknown): string | null => (typeof v === 'string' && v.trim() ? v.trim() : null);

function hasAnyPrice(clinics: PlanClinic[], slug: string): boolean {
  return clinics.some((c) => typeof c.prices[slug] === 'object');
}

export const fetchMyPlan = cache(async (gender: PlanGender, seg: AgeSegment, city: CheckupCity): Promise<MyPlanData | null> => {
  try {
    const sb = db() as any;
    const group = AGE_GROUPS[seg];
    const slug = groupSlug(gender, seg);

    const { data: recs, error: recErr } = await sb
      .from('examination_recommendations')
      .select('examination_slug, risk_factor_code, condition_ua, periodicity_ua, locked, sort_order')
      .eq('platform_program_slug', slug)
      .order('sort_order', { ascending: true });
    if (recErr) return null;
    const recRows = (recs ?? []) as Row[];
    const baseRecs = recRows.filter((r) => !r.risk_factor_code);
    if (baseRecs.length === 0) return null;

    const [{ data: examRows }, { data: factorRows }] = await Promise.all([
      sb.from('examinations').select('*').order('sort_order', { ascending: true }),
      sb.from('risk_factors').select('code, name_ua, gender_scope, min_age, max_age, sort_order').order('sort_order', { ascending: true }),
    ]);
    const exams: Record<string, PlanExam> = {};
    const examMeta: Record<string, Row> = {};
    for (const e of (examRows ?? []) as Row[]) {
      if (!str(e.slug) || !str(e.name_ua)) continue;
      examMeta[e.slug] = e;
      exams[e.slug] = {
        slug: e.slug,
        name: e.name_ua.trim(),
        purpose: str(e.purpose_ua),
        rationaleType: (['guideline', 'know_your_norm', 'doctor'] as const).includes(e.rationale_type) ? e.rationale_type : null,
        rationale: str(e.rationale_ua),
        sourceRef: str(e.source_ref),
        harm: e.harm_reviewed_at ? str(e.harm_ua) : null,
        includedIn: str(e.included_in_slug),
      };
    }

    const base: PlanRow[] = baseRecs
      .filter((r) => exams[r.examination_slug])
      .map((r) => ({ slug: r.examination_slug, condition: str(r.condition_ua) ?? str(r.periodicity_ua), locked: Boolean(r.locked) }));
    if (base.length === 0) return null;
    const baseSet = new Set(base.map((r) => r.slug));

    // Фактори ризику: стать, перетин віку, є хоча б один публічний рядок групи з цим фактором.
    const risk: PlanRiskFactor[] = [];
    for (const f of (factorRows ?? []) as Row[]) {
      if (f.gender_scope !== 'any' && f.gender_scope !== gender) continue;
      if (!ageOverlaps(group, f.min_age, f.max_age)) continue;
      const slugs = [...new Set(recRows.filter((r) => r.risk_factor_code === f.code && exams[r.examination_slug]).map((r) => r.examination_slug as string))];
      if (slugs.length === 0) continue;
      risk.push({ code: f.code, name: f.name_ua, slugs });
    }

    // Кандидати «Додати дослідження» до перевірки цін.
    const extraCandidates = Object.values(examMeta)
      .filter((e) => e.offer_as_extra !== false && (e.gender_scope === 'any' || e.gender_scope === gender))
      .filter((e) => e.min_age == null || e.min_age <= group.minAge)
      .filter((e) => !baseSet.has(e.slug))
      .map((e) => e.slug as string);

    // Ціни: клініки з конфігурації міста, порядок звідти (PLATFORM-LINE 2.2).
    const relevant = new Set<string>([...baseSet, ...extraCandidates, ...risk.flatMap((f) => f.slugs)]);
    const { data: clinicRows } = await sb.from('clinics').select('id, slug').in('slug', city.clinics.map((c) => c.slug));
    const clinicIds: Record<string, string> = {};
    for (const c of (clinicRows ?? []) as Row[]) clinicIds[c.slug] = c.id;
    const ids = Object.values(clinicIds);

    let services: Row[] = [];
    let links: Row[] = [];
    let branchRows: Row[] = [];
    if (ids.length > 0) {
      const { data: br } = await sb
        .from('clinic_branches')
        .select('id, clinic_id, address_ua, metro_ua, sort_order')
        .in('clinic_id', ids)
        .order('sort_order', { ascending: true });
      branchRows = (br ?? []) as Row[];
      const { data: svc } = await sb
        .from('clinic_services')
        .select('id, clinic_id, price, price_type, price_date, is_active')
        .in('clinic_id', ids)
        .eq('is_active', true);
      services = (svc ?? []) as Row[];
      if (services.length > 0 && relevant.size > 0) {
        const { data: lk } = await sb
          .from('clinic_service_examinations')
          .select('clinic_service_id, examination_slug, in_price')
          .in('clinic_service_id', services.map((s) => s.id))
          .in('examination_slug', [...relevant]);
        links = (lk ?? []) as Row[];
      }
    }

    const clinics: PlanClinic[] = [];
    for (const cfg of city.clinics) {
      const id = clinicIds[cfg.slug];
      if (!id) continue;
      const own = services.filter((s) => s.clinic_id === id);
      const byId: Record<string, Row> = Object.fromEntries(own.map((s) => [s.id, s]));
      const prices: Record<string, ExamPrice> = {};
      const used: Record<string, PlanService> = {};
      let oldest: string | null = null;
      for (const examSlug of relevant) {
        if (exams[examSlug]?.includedIn) continue;
        const lk = links.filter((l) => l.examination_slug === examSlug && l.in_price === true && byId[l.clinic_service_id]);
        if (lk.length === 0) {
          prices[examSlug] = 'none';
          continue;
        }
        const svc = lk.map((l) => byId[l.clinic_service_id]);
        // Р27: ціна лише точна. Знижка (discount_percent) не застосовується.
        if (svc.some((s) => s.price == null || s.price_type !== 'exact' || !s.price_date)) {
          prices[examSlug] = 'noprice';
          continue;
        }
        const date = svc.map((s) => String(s.price_date)).sort()[0];
        prices[examSlug] = { services: svc.map((s) => s.id), total: svc.reduce((a, s) => a + Number(s.price), 0), date };
        for (const s of svc) used[s.id] = { id: s.id, price: Number(s.price), date: String(s.price_date) };
        if (!oldest || date < oldest) oldest = date;
      }
      if (Object.keys(used).length === 0) continue;
      const branches: PlanBranch[] = branchRows
        .filter((b) => b.clinic_id === id && str(b.address_ua))
        .map((b) => ({ id: b.id, address: b.address_ua.trim(), metro: str(b.metro_ua) }));
      clinics.push({ slug: cfg.slug, id, shortName: cfg.shortName, branches, priceDate: oldest, services: used, prices });
    }

    const extras = extraCandidates.filter((s) => (MY_PLAN_CONFIG.extraWithoutAnyPrice ? true : hasAnyPrice(clinics, s)));
    const riskOut = MY_PLAN_CONFIG.riskWithoutAnyPrice
      ? risk
      : risk.map((f) => ({ ...f, slugs: f.slugs.filter((s) => hasAnyPrice(clinics, s)) })).filter((f) => f.slugs.length > 0);

    return { gender, seg, city: { slug: city.slug, loc: city.loc, inCity: city.inCity }, exams, base, extras, risk: riskOut, clinics };
  } catch {
    return null;
  }
});
