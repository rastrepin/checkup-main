import { db } from '@/lib/supabase';
import type { BranchLite } from '@/components/city/BookingFlow';
import type { CheckupProgram } from '@/lib/types';

export interface Type5aBranch extends BranchLite {
  name_ua: string;
}

// Джерело правди для сайдбара/GEO-блока Type 5a сторінок (вікові кроки чекапу,
// завдання Cowork 29.08.2026). ОДИН registry-запит на рівні сторінки — branches[]
// сайдбара і GeoBlock читають той самий результат (components-map-FIXED.md §3).

// Розширює CheckupProgram (lib/types.ts) полями, яких там ще немає на рівні типу,
// але які реально є в таблиці (price_date і т.д.) — щоб об'єкт можна було
// передавати напряму в BookingFlow.programs[] без каста.
export interface Type5aProgram extends CheckupProgram {
  price_date: string | null;
}

export interface Type5aData {
  program: Type5aProgram | null;
  branches: Type5aBranch[];
  clinicId: string | null;
}

const CLINIC_SLUG = 'onclinic-kharkiv';

/**
 * @param checkupProgramSlug slug у checkup_programs (напр. 'zhinochyi-pislya-40')
 */
export async function fetchType5aData(checkupProgramSlug: string): Promise<Type5aData> {
  try {
    const sb = db() as any;
    const { data: clinic } = await sb.from('clinics').select('id').eq('slug', CLINIC_SLUG).single();
    if (!clinic?.id) return { program: null, branches: [], clinicId: null };

    const [{ data: program }, { data: branches }] = await Promise.all([
      sb
        .from('checkup_programs')
        .select('*')
        .eq('clinic_id', clinic.id)
        .eq('slug', checkupProgramSlug)
        .single(),
      sb
        .from('clinic_branches')
        .select('id, name_ua, address_ua, metro_ua')
        .eq('clinic_id', clinic.id)
        .order('sort_order', { ascending: true }),
    ]);

    return {
      program: (program as Type5aProgram) ?? null,
      branches: (branches ?? []) as Type5aBranch[],
      clinicId: clinic.id,
    };
  } catch {
    return { program: null, branches: [], clinicId: null };
  }
}

/** Позначка свіжості ціни (Р27): старша 2 місяців → текст-застереження. Сторінка
 *  обчислює це ДО рендеру ProgramSidebar — сам компонент дату не рахує (§3). */
export function priceDateNotice(priceDate: string | null): string | undefined {
  if (!priceDate) return undefined;
  const date = new Date(priceDate);
  const twoMonthsAgo = new Date();
  twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
  if (date < twoMonthsAgo) {
    const label = date.toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' });
    return `Ціну уточнено ${label} — може відрізнятися, менеджер підтвердить під час запису.`;
  }
  return undefined;
}
