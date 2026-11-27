import { cache } from 'react';
import { db } from '@/lib/supabase';
import type { CheckupCity } from '@/lib/cities/checkup-cities';
import { fetchProgramComposition, type ProgramComposition } from '@/lib/programs/composition';
import type { OfferBranch, OfferClinic, OfferProgram } from '@/lib/programs/clinic-offer';
import { priceDiscount, type PriceDiscount } from '@/lib/programs/price';
import { programMatchesAge, CATALOG_AGES } from '@/lib/programs/catalog-age';
import type { AgeSegment, PlanGender } from '@/lib/plan/age-groups';

// Каталог програм клінік на хабі статі (gender-hub v0.1 §3–§7; задача НОРМАТИВ 26.11).
//
// ПРАВИЛО (рішення Ігоря 26.11, 3А; DATABASE.md, Р39): програма клініки – лише рядок checkup_programs з
//   program_type = 'clinic', is_active = true, gender = стать сторінки, is_specialized = false.
// Рядки program_type = 'standard' («Повне обстеження…», «Регулярне обстеження…») – заморожені сервісні програми,
// їх ніколи не показують як програми клініки (їх замінює «Мій план»).
// Читання – лише через цю функцію: прямих запитів до checkup_programs у сторінках і компонентах немає.
// Запит фільтрує program_type = 'clinic', і кожен рядок ще раз перевіряється перед поверненням: рядок з іншим
// program_type – помилка (throw, збірка падає), не тиха фільтрація.
//
// Клініка потрапляє в каталог, коли вона є в конфігурації міста (порядок – звідти) і в неї вказано Telegram-чат
// (clinics.telegram_chat_id не порожній; рішення Ігоря 26.11). Значення chat_id тут лише перевіряється на
// «не порожній» і далі не передається: у результаті його немає.

export interface CatalogProgram {
  /** `${clinicSlug}-${programSlug}` – ключ і якір рамки (#clinic-{clinicSlug}-{programSlug}). */
  key: string;
  program: OfferProgram;
  clinic: OfferClinic;
  /** Коротка назва клініки з конфігурації міста. */
  clinicShortName: string;
  branches: OfferBranch[];
  composition: ProgramComposition;
  /** checkup_programs.age_group: do-30, 30-40, 40-50, 50+, any, after-40 (або null). */
  ageGroup: string | null;
  /** Ціна до сплати: price_discount, а якщо порожня – price_regular (gender-hub §4.2). null – ціни немає. */
  payable: number | null;
  /** Ціна в клініці (price_regular) і «−N%»: лише коли вона більша за ціну до сплати щонайменше на 1% (many-clinics §4). */
  discount: PriceDiscount | null;
}

export interface GenderCatalog {
  programs: CatalogProgram[];
  /** Найменша ціна до сплати серед усіх програм каталогу, без фільтра; null – цін немає. {min_price} у шапці і в meta. */
  minPrice: number | null;
  /** Хоч одна програма каталогу має знижку (рядок про знижку в шапці). */
  hasDiscount: boolean;
}

const EMPTY: GenderCatalog = { programs: [], minPrice: null, hasDiscount: false };

function positive(n: unknown): number | null {
  return typeof n === 'number' && n > 0 ? n : null;
}

export function payablePrice(p: { price_discount: number | null; price_regular: number | null }): number | null {
  return positive(p.price_discount) ?? positive(p.price_regular);
}

/** Знижка за правилом many-clinics §4: ціна в клініці більша за ціну до сплати щонайменше на 1% (priceDiscount – одна умова
 *  для картки, форми запису і каталогу). */
export function discountOf(p: { price_discount: number | null; price_regular: number | null }): PriceDiscount | null {
  const payable = payablePrice(p);
  return payable === null ? null : priceDiscount(p.price_regular, payable);
}

async function loadRows(city: CheckupCity, gender: PlanGender) {
  try {
    const sb = db() as any;
    const out: { shortName: string; clinic: OfferClinic; branches: OfferBranch[]; rows: OfferProgram[] }[] = [];
    for (const cfg of city.clinics) {
      const { data: c } = await sb.from('clinics').select('id, name, slug, website, telegram_chat_id').eq('slug', cfg.slug).maybeSingle();
      if (!c?.id) continue;
      // Лише «не порожній»: значення далі не використовується і не повертається.
      const hasChat = typeof c.telegram_chat_id === 'string' && c.telegram_chat_id.trim() !== '';
      if (!hasChat) continue;
      const [{ data: branches }, { data: rows }] = await Promise.all([
        sb.from('clinic_branches').select('id, name_ua, address_ua, metro_ua').eq('clinic_id', c.id).order('sort_order', { ascending: true }),
        sb
          .from('checkup_programs')
          .select('*')
          .eq('clinic_id', c.id)
          .eq('program_type', 'clinic')
          .eq('is_active', true)
          .eq('gender', gender)
          .eq('is_specialized', false)
          .order('sort_order', { ascending: true }),
      ]);
      out.push({
        shortName: cfg.shortName,
        clinic: { id: c.id, name: c.name, slug: c.slug, website: c.website ?? null },
        branches: (branches ?? []) as OfferBranch[],
        rows: (rows ?? []) as OfferProgram[],
      });
    }
    return out;
  } catch {
    return null;
  }
}

/** Каталог програм клінік міста для сторінки статі. Немає даних (база недоступна, програм немає) – порожній каталог. */
export const fetchGenderCatalog = cache(async (city: CheckupCity, gender: PlanGender): Promise<GenderCatalog> => {
  const loaded = await loadRows(city, gender);
  if (!loaded) return EMPTY;

  // Запобіжник: кожен рядок ще раз перевіряється; чужий program_type – помилка збірки.
  for (const { clinic, rows } of loaded) {
    for (const r of rows) {
      if (r.program_type !== 'clinic') {
        throw new Error(
          `[catalog] ${clinic.slug}/${r.slug}: program_type = '${r.program_type}', у каталог клінік потрапляє лише 'clinic' (DATABASE.md, рішення Ігоря 26.11).`,
        );
      }
    }
  }

  const programs: CatalogProgram[] = [];
  for (const { shortName, clinic, branches, rows } of loaded) {
    const compositions = await Promise.all(
      rows.map((p) => fetchProgramComposition(p.id, { programName: p.name_ua, clinicName: clinic.name }, p.composition)),
    );
    rows.forEach((program, i) => {
      programs.push({
        key: `${clinic.slug}-${program.slug}`,
        program,
        clinic,
        clinicShortName: shortName,
        branches,
        composition: compositions[i],
        ageGroup: program.age_group ?? null,
        payable: payablePrice(program),
        discount: discountOf(program),
      });
    });
  }
  const prices = programs.map((p) => p.payable).filter((n): n is number => n !== null);
  return {
    programs,
    minPrice: prices.length ? Math.min(...prices) : null,
    hasDiscount: programs.some((p) => p.discount !== null),
  };
});

/** Кількість програм каталогу, що проходять фільтр віку (вікова картка хабу, посилання з вікової сторінки). */
export function countForAge(catalog: GenderCatalog, seg: AgeSegment): number {
  return catalog.programs.filter((p) => programMatchesAge(p.ageGroup, seg)).length;
}

export { CATALOG_AGES };
export type { AgeSegment };
