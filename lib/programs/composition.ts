import { db } from '@/lib/supabase';

// Задача Cowork "Наповнення складу програми" (29.08.2026), доповнено задачею
// "Скорочення складу і розділення сторінки" (29.08.2026, Частина 1). Джерело
// правди про склад програми — program_services ⨝ clinic_services, НЕ
// checkup_programs (consultations_count/analyses_count/diagnostics_count там
// застарілі). Один спільний модуль для сайдбара, Блоку 4 і Блоку 7 обох
// сторінок Типу 5a.
//
// ОНОВЛЕНО (Частина 1, "Скорочення складу"): повний перелік показників більше
// НІДЕ на цій сторінці не рендериться (сайдбар/блок4/блок7) — лише стислий
// опис, побудований із реальних назв позицій. Повний перелік лишається на
// сторінці програми на піддомені (subdomainHref). Текст будується кодом із
// summaryItems нижче, не хардкодиться як статичний абзац: якщо склад програми
// зміниться в базі, ці рядки перерахуються самі.

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
  /** Лічильники з реального складу (Частина 3 попередньої задачі). Консультації
   *  — лише візит 1: повторний прийом того самого лікаря на другому візиті не
   *  додає нового спеціаліста, тому в загальний рахунок не йде. */
  counts: {
    consultations: number;
    analyses: number;
    diagnostics: number;
  };
  /** Розгорнутий склад за типом — БЕЗ повторного прийому. Лишається в даних
   *  для внутрішніх потреб (fallback), але сторінки більше не рендерять items[]
   *  напряму: повний перелік — тільки на сторінці програми на піддомені. */
  summaryGroups: CompositionGroup[];
  /** Стислі описи складу (Частина 1, "Скорочення складу") — те, що сторінки
   *  реально показують у Блоці 4/7 і сайдбарі замість переліку. */
  consultationsSummary: string;
  instrumentalSummary: string;
  labSummary: string;
  /** Для Блоку 7 "Як це проходить". */
  visitCount: number;
  visit1Groups: CompositionGroup[];
  visit2Items: string[];
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

// ---- Частина 1, "Скорочення складу" (29.08.2026) ---------------------------

/** Genitive-форма з назви позиції ("Прийом лікаря-терапевта" тощо) → номінатив
 *  для читабельного переліку спеціальностей. Закритий список для позицій, що
 *  реально є в складі; для невідомої позиції — сира назва після відсічення
 *  службових слів (п.1 завдання: "якщо витягти неможливо — показувати як є"). */
const SPECIALTY_NOMINATIVE: Record<string, string> = {
  'терапевта': 'терапевт',
  'гастроентеролога': 'гастроентеролог',
  'невропатолога': 'невропатолог',
  'проктолога': 'проктолог',
  'акушера-гінеколога': 'акушер-гінеколог',
  'офтальмолога': 'офтальмолог',
};

function extractSpecialty(name: string): string {
  const cleaned = name
    .replace(/^Прийом лікаря[-\s]/i, '')
    .replace(/^Консультація\s+/i, '')
    .replace(/\s+з діагностикою$/i, '')
    .replace(/\s*\([^)]*\)/g, '')
    .replace(/\s+без\s+\S+$/i, '')
    .trim();
  return SPECIALTY_NOMINATIVE[cleaned.toLowerCase()] ?? cleaned;
}

function buildConsultationsSummary(items: CompositionServiceItem[]): string {
  const specialties = items
    .filter((i) => i.serviceType === 'consultation')
    .map((i) => extractSpecialty(i.name));
  return specialties.join(', ');
}

/** Відома область УЗД із назви позиції ("УЗД органів черевної порожнини..." →
 *  "черевна порожнина"). Fallback — відсічення дужок і уточнень методики,
 *  коли назва не збігається з жодним відомим шаблоном. */
const UZD_AREA_MAP: [string, string][] = [
  ['органів черевної порожнини', 'черевна порожнина'],
  ['органів малого тазу', 'малий таз'],
  ['органів сечовидільної системи', 'сечовидільна система'],
  ['молочних залоз', 'молочні залози'],
  ['щитоподібної залози', 'щитоподібна залоза'],
];

function shortenUzdArea(rest: string): string {
  const lower = rest.toLowerCase();
  for (const [key, label] of UZD_AREA_MAP) {
    if (lower.startsWith(key)) return label;
  }
  return rest
    .replace(/\([^)]*\)/g, '')
    .replace(/\s+(з доплерометрією.*|жінок.*|трансвагінальне.*)$/i, '')
    .trim()
    .toLowerCase();
}

function shortenOtherInstrumental(name: string): string {
  if (/^Електрокардіографія/i.test(name)) return 'ЕКГ';
  if (/^Рентгенографія/i.test(name)) return 'рентген органів грудної клітини';
  return name.toLowerCase();
}

const CARDINAL_WORDS: Record<number, string> = {
  1: 'одне', 2: 'два', 3: 'три', 4: 'чотири', 5: "п'ять",
  6: 'шість', 7: 'сім', 8: 'вісім', 9: "дев'ять", 10: 'десять',
};

function pluralDoslidzhennia(n: number): string {
  return n >= 1 && n <= 4 ? 'дослідження' : 'досліджень';
}

/** "A, B і C" замість "A, B, C" — природніше для переліку 2+ елементів. */
function joinWithAnd(items: string[]): string {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} і ${items[items.length - 1]}`;
}

function buildInstrumentalSummary(items: CompositionServiceItem[]): string {
  const instrumental = items.filter((i) => i.serviceType === 'instrumental');
  const uzdAreas: string[] = [];
  const other: string[] = [];
  for (const item of instrumental) {
    const m = item.name.match(/^УЗД\s+(.*)$/i);
    if (m) {
      uzdAreas.push(shortenUzdArea(m[1]));
    } else {
      other.push(shortenOtherInstrumental(item.name));
    }
  }
  const parts: string[] = [];
  if (uzdAreas.length > 0) {
    const word = CARDINAL_WORDS[uzdAreas.length] ?? String(uzdAreas.length);
    const capitalized = word.charAt(0).toUpperCase() + word.slice(1);
    parts.push(`${capitalized} ультразвукових ${pluralDoslidzhennia(uzdAreas.length)}: ${uzdAreas.join(', ')}.`);
  }
  if (other.length > 0) {
    parts.push(`Плюс ${joinWithAnd(other)}.`);
  }
  return parts.join(' ');
}

/** Групування лабораторних позицій за призначенням (п.1 завдання). Закритий
 *  список ключових слів для позицій, що реально є в складі; невідома позиція
 *  потрапляє в "інші показники", а не губиться мовчки. */
const LAB_CATEGORY_ORDER = [
  'загальні аналізи крові й сечі',
  'біохімія та функція печінки і нирок',
  'ліпідний профіль і глюкоза',
  'гормони щитоподібної залози',
  'вітамін D',
  'гінекологічні дослідження',
] as const;

function classifyLab(name: string): string {
  const n = name.toLowerCase();
  if (n.includes('клінічний аналіз крові') || n.includes('загальний аналіз сечі')) return 'загальні аналізи крові й сечі';
  if (n.includes('ліпідограма') || n.includes('глюкоза')) return 'ліпідний профіль і глюкоза';
  if (n.includes('тиреоїдний')) return 'гормони щитоподібної залози';
  if (n.includes('вітамін d') || n.includes('25-он')) return 'вітамін D';
  if (n.includes('урогенітал') || n.includes('пап-тест')) return 'гінекологічні дослідження';
  if (
    n.includes('алат') || n.includes('асат') || n.includes('гамма-глутамілтрансфераза') ||
    n.includes('білірубін') || n.includes('загальний білок') || n.includes('лужна фосфатаза') ||
    n.includes('альбумін') || n.includes('креатинін') || n.includes('сечовина') ||
    n.includes('коагулограма') || n.includes('helicobacter')
  ) {
    return 'біохімія та функція печінки і нирок';
  }
  return 'інші показники';
}

function buildLabSummary(items: CompositionServiceItem[]): string {
  const lab = items.filter((i) => i.serviceType === 'lab');
  if (lab.length === 0) return '';
  const present = new Set(lab.map((i) => classifyLab(i.name)));
  const ordered = LAB_CATEGORY_ORDER.filter((c) => present.has(c));
  const extra = [...present].filter((c) => !(LAB_CATEGORY_ORDER as readonly string[]).includes(c));
  const categories = [...ordered, ...extra];
  return `Лабораторна частина складу — ${lab.length} аналізів. Напрямки: ${joinWithAnd(categories)}.`;
}

// -----------------------------------------------------------------------------

const EMPTY: ProgramComposition = {
  items: [],
  counts: { consultations: 0, analyses: 0, diagnostics: 0 },
  summaryGroups: [],
  consultationsSummary: '',
  instrumentalSummary: '',
  labSummary: '',
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
      consultationsSummary: buildConsultationsSummary(summaryItems),
      instrumentalSummary: buildInstrumentalSummary(summaryItems),
      labSummary: buildLabSummary(summaryItems),
      visitCount,
      visit1Groups: groupByType(visit1Items),
      visit2Items,
      preparationNotes: derivePreparationNotes(items),
    };
  } catch {
    return EMPTY;
  }
}
