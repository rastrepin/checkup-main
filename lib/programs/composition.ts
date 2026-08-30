import { db } from '@/lib/supabase';

// Задача Cowork "Наповнення складу програми" (29.08.2026). Джерело правди про
// склад програми — program_services ⨝ clinic_services, НЕ checkup_programs
// (consultations_count/analyses_count/diagnostics_count там застарілі й
// розходяться з реальністю, Частина 3 завдання). Один спільний модуль для
// сайдбара, Блоку 4 і Блоку 7 обох сторінок Типу 5a — правило підготовки
// (Частина 4) і групування за типом рахуються тут ОДИН раз, сторінки не
// дублюють логіку.

export type CompositionServiceType = 'consultation' | 'lab' | 'instrumental';

export interface CompositionServiceItem {
  name: string;
  serviceType: CompositionServiceType;
  visitNumber: number;
}

export interface CompositionGroup {
  type: string;
  items: string[];
}

export interface ProgramComposition {
  items: CompositionServiceItem[];
  /** Лічильники з реального складу (Частина 3). Консультації — лише візит 1:
   *  повторний прийом того самого лікаря на другому візиті не додає нового
   *  спеціаліста, тому в загальний рахунок не йде (інакше "7 консультацій"
   *  читається як сім різних лікарів і вводить в оману). */
  counts: {
    consultations: number;
    analyses: number;
    diagnostics: number;
  };
  /** Розгорнутий склад для сайдбара / Блоку 4 — групи за типом, без повторного
   *  прийому (той показується окремо, у блоці 7, як частина другого візиту). */
  summaryGroups: CompositionGroup[];
  /** Для Блоку 7 "Як це проходить". */
  visitCount: number;
  visit1Groups: CompositionGroup[];
  visit2Items: string[];
  /** Підготовка, виведена зі складу (Частина 4) — не текст, а правило з переліку. */
  preparationNotes: string[];
}

const TYPE_LABELS: Record<CompositionServiceType, string> = {
  consultation: 'Консультації',
  lab: 'Аналізи',
  instrumental: 'Обстеження',
};

const TYPE_ORDER: CompositionServiceType[] = ['consultation', 'lab', 'instrumental'];

function groupByType(items: CompositionServiceItem[]): CompositionGroup[] {
  return TYPE_ORDER.map((type) => ({
    type: TYPE_LABELS[type],
    items: items.filter((i) => i.serviceType === type).map((i) => i.name),
  })).filter((g) => g.items.length > 0);
}

/** Частина 4 завдання: правило підготовки зафіксоване в одному місці. */
function derivePreparationNotes(items: CompositionServiceItem[]): string[] {
  const names = items.map((i) => i.name.toLowerCase());
  const has = (needle: string) => names.some((n) => n.includes(needle));
  const notes: string[] = [];
  if (has('глюкоза') || has('ліпідограма')) {
    notes.push('Натще — у складі є аналіз глюкози або ліпідограма.');
  }
  if (has('пап-тест')) {
    notes.push('Урахуйте день циклу — у складі є ПАП-тест.');
  }
  if (has('урогенітал')) {
    notes.push('Статевий спокій напередодні — у складі є урогенітальні дослідження.');
  }
  return notes;
}

const EMPTY: ProgramComposition = {
  items: [],
  counts: { consultations: 0, analyses: 0, diagnostics: 0 },
  summaryGroups: [],
  visitCount: 0,
  visit1Groups: [],
  visit2Items: [],
  preparationNotes: [],
};

export async function fetchProgramComposition(checkupProgramId: string | null | undefined): Promise<ProgramComposition> {
  if (!checkupProgramId) return EMPTY;
  try {
    const sb = db() as any;
    const { data, error } = await sb
      .from('program_services')
      .select('visit_number, clinic_services(name_ua, service_type)')
      .eq('checkup_program_id', checkupProgramId)
      .order('created_at', { ascending: true });

    if (error || !data) return EMPTY;

    const items: CompositionServiceItem[] = data
      .filter((row: any) => row.clinic_services)
      .map((row: any) => ({
        name: row.clinic_services.name_ua as string,
        serviceType: row.clinic_services.service_type as CompositionServiceType,
        visitNumber: row.visit_number as number,
      }));

    if (items.length === 0) return EMPTY;

    const counts = {
      consultations: items.filter((i) => i.serviceType === 'consultation' && i.visitNumber === 1).length,
      analyses: items.filter((i) => i.serviceType === 'lab').length,
      diagnostics: items.filter((i) => i.serviceType === 'instrumental').length,
    };

    // Повторний прийом (візит 2) — не в загальному переліку складу, лише в блоці 7.
    const summaryItems = items.filter((i) => !(i.serviceType === 'consultation' && i.visitNumber === 2));

    const visit1Items = items.filter((i) => i.visitNumber === 1);
    const visit2Items = items.filter((i) => i.visitNumber === 2).map((i) => i.name);
    const visitCount = items.reduce((max, i) => Math.max(max, i.visitNumber), 0);

    return {
      items,
      counts,
      summaryGroups: groupByType(summaryItems),
      visitCount,
      visit1Groups: groupByType(visit1Items),
      visit2Items,
      preparationNotes: derivePreparationNotes(items),
    };
  } catch {
    return EMPTY;
  }
}
