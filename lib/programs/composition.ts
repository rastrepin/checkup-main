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
  /** Код позиції клініки (clinic_services.code, на яку посилається program_services). */
  code: string | null;
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
  /** Спеціальності прийомів другого візиту («терапевт») – для повного складу програми. */
  visit2ConsultationsSummary: string;
  instrumentalSummary: string;
  labSummary: string;
  /** Лабораторні позиції без категорії опису (LAB_CATEGORY_BY_CODE): у labSummary не
   *  виводяться. Для звіту і перевірки даних. */
  labUncategorized: string[];
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
  // SPRINT-KHARKIV-v0: коротке тире замість довгого (TOV-STANDARD 2.6) і одне
  // формулювання без «або» (підготовка одним варіантом).
  const fasting = [has('глюкоза') ? 'аналіз глюкози' : '', has('ліпідограма') ? 'ліпідограма' : ''].filter(Boolean);
  if (fasting.length > 0) {
    notes.push(`Натще – у складі є ${joinWithAnd(fasting)}.`);
  }
  if (has('пап-тест')) {
    notes.push('Урахуйте день циклу – у складі є ПАП-тест.');
  }
  if (has('урогенітал')) {
    notes.push('Статевий спокій напередодні – у складі є урогенітальні дослідження.');
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

/** Область УЗД у родовому відмінку з назви позиції («УЗД органів малого тазу…» →
 *  «малого таза»). Fallback – відсічення дужок, коли назва не збігається з відомим шаблоном.
 *  Задача Cowork «Правки після v1» (23.09.2026): шаблон опису складу для всіх вікових сторінок. */
const UZD_AREA_GENITIVE: [string, string][] = [
  ['органів черевної порожнини', 'органів черевної порожнини'],
  ['органів малого тазу', 'малого таза'],
  ['органів сечовидільної системи', 'нирок і сечового міхура'],
  ['молочних залоз', 'молочних залоз'],
  ['щитоподібної залози', 'щитоподібної залози'],
];

function uzdAreaGenitive(rest: string): string {
  const lower = rest.toLowerCase();
  for (const [key, label] of UZD_AREA_GENITIVE) {
    if (lower.startsWith(key)) return label;
  }
  return rest.replace(/\([^)]*\)/g, '').trim().toLowerCase();
}

/** Пояснення в дужках – лише для ЕКГ і відеокольпоскопії; інші позиції без пояснень. */
function otherInstrumental(name: string): string {
  if (/^Електрокардіографія/i.test(name)) return 'електрокардіографія (ЕКГ, запис роботи серця)';
  if (/^Відеокольпоскопія/i.test(name)) return 'відеокольпоскопія (огляд шийки матки під збільшенням)';
  if (/^Рентгенографія органів грудної клітини/i.test(name)) return 'рентген органів грудної клітини';
  return name.replace(/\s*\([^)]*\)/g, '').trim().toLowerCase();
}

/** "A, B і C" замість "A, B, C" — природніше для переліку 2+ елементів. */
function joinWithAnd(items: string[]): string {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} і ${items[items.length - 1]}`;
}

/** «молочних залоз» + «щитоподібної залози» → «молочних і щитоподібної залоз» (на місці першої з двох). */
function mergeGlandAreas(areas: string[]): string[] {
  const breast = areas.indexOf('молочних залоз');
  const thyroid = areas.indexOf('щитоподібної залози');
  if (breast === -1 || thyroid === -1) return areas;
  const first = Math.min(breast, thyroid);
  return areas
    .map((a, i) => (i === first ? 'молочних і щитоподібної залоз' : a))
    .filter((_, i) => i !== Math.max(breast, thyroid));
}

function buildInstrumentalSummary(items: CompositionServiceItem[]): string {
  const instrumental = items.filter((i) => i.serviceType === 'instrumental');
  const uzdAreas: string[] = [];
  const other: string[] = [];
  for (const item of instrumental) {
    const m = item.name.match(/^УЗД\s+(.*)$/i);
    if (m) {
      uzdAreas.push(uzdAreaGenitive(m[1]));
    } else {
      other.push(otherInstrumental(item.name));
    }
  }
  const parts: string[] = [];
  if (uzdAreas.length > 0) {
    // Задача v2 (24.09.2026), розділ 16.2: без числа ділянок; молочні і щитоподібна залози – одним пунктом.
    parts.push(`Ультразвукове дослідження (УЗД) ${mergeGlandAreas(uzdAreas).join(', ')}.`);
  }
  if (other.length > 0) {
    const joined = joinWithAnd(other);
    parts.push(uzdAreas.length > 0 ? `Також ${joined}.` : `${joined.charAt(0).toUpperCase()}${joined.slice(1)}.`);
  }
  return parts.join(' ');
}

/** Категорії опису аналізів – задача Cowork «Опис аналізів у складі програми
 *  вираховується зі складу» (24.09.2026). Порядок – як у таблиці задачі. */
type LabCategory =
  | 'blood'
  | 'urine'
  | 'liver_kidney'
  | 'coagulation'
  | 'cholesterol'
  | 'glucose'
  | 'thyroid'
  | 'vitamin_d'
  | 'helicobacter'
  | 'gyn_smears';

/** Зіставлення за кодом позиції (clinic_services.code, на яку посилається
 *  program_services), не за назвою. Коди – ОН Клінік Харків. Позиція, якої тут
 *  немає, в опис не виводиться, потрапляє в labUncategorized і дає попередження
 *  в лозі білду (warnUncategorizedLab). */
const LAB_CATEGORY_BY_CODE: Record<string, LabCategory> = {
  '10003-OH': 'blood', // Клінічний аналіз крові (ЗАК + лейкоформула)
  '10001-OH': 'urine', // Загальний аналіз сечі (ЗАС + мікроскопія осаду)
  '10027-OH': 'liver_kidney', // АлАТ
  '10028-OH': 'liver_kidney', // АсАТ
  '10034-OH': 'liver_kidney', // ГГТ
  '10031-OH': 'liver_kidney', // Білірубін
  '10036-OH': 'liver_kidney', // Загальний білок
  '10029-OH': 'liver_kidney', // Лужна фосфатаза
  '10032-OH': 'liver_kidney', // Альбумін
  '10037-OH': 'liver_kidney', // Креатинін
  '10039-OH': 'liver_kidney', // Сечовина
  '10051-OH': 'coagulation', // Пакет №50 «Коагулограма»
  '10044-OH': 'cholesterol', // Пакет №36 Ліпідограма
  '10033-OH': 'glucose', // Глюкоза (венозна кров)
  '10063-OH': 'thyroid', // Пакет №01.15 «Тиреоїдний»
  '11096-OH': 'vitamin_d', // 25-ОН вітамін D
  '10096-OH': 'helicobacter', // Антитіла сумарні до Helicobacter pylori
  '10010-OH': 'gyn_smears', // Мікроскопія урогенітального зішкрібу
  '11221-OH': 'gyn_smears', // ПАП-тест на основі рідинної цитології
  '11014-OH': 'gyn_smears', // ПЛР. Пакет №09.04 «Урогенітальний (повний)»
};

/** Тексти категорій у порядку таблиці; об'єднані пари (кров і сеча, холестерин
 *  і глюкоза) будуються з тих категорій, що є в складі. */
function labCategoryTexts(present: Set<LabCategory>): string[] {
  const out: string[] = [];
  if (present.has('blood') && present.has('urine')) out.push('загальні аналізи крові й сечі');
  else if (present.has('blood')) out.push('загальний аналіз крові');
  else if (present.has('urine')) out.push('загальний аналіз сечі');
  if (present.has('liver_kidney')) out.push('показники роботи печінки і нирок');
  if (present.has('coagulation')) out.push('згортання крові');
  if (present.has('cholesterol') && present.has('glucose')) out.push('холестерин і глюкоза');
  else if (present.has('cholesterol')) out.push('холестерин');
  else if (present.has('glucose')) out.push('глюкоза');
  if (present.has('thyroid')) out.push('гормони щитоподібної залози');
  if (present.has('vitamin_d')) out.push('вітамін D');
  if (present.has('helicobacter')) out.push('аналіз на бактерію Helicobacter pylori');
  if (present.has('gyn_smears')) out.push('гінекологічні мазки');
  return out;
}

function labCategory(item: CompositionServiceItem): LabCategory | null {
  return item.code ? LAB_CATEGORY_BY_CODE[item.code] ?? null : null;
}

/** Задача v2 (24.09.2026), розділ 16.2: без «{N} аналізів:» – текст одразу з категорій, з великої літери.
 *  Позиції без категорії в опис не виводяться (як і раніше); немає жодної категорії – рядок порожній. */
function buildLabSummary(items: CompositionServiceItem[]): string {
  const lab = items.filter((i) => i.serviceType === 'lab');
  if (lab.length === 0) return '';
  const present = new Set(lab.map(labCategory).filter((c): c is LabCategory => c !== null));
  const categories = labCategoryTexts(present);
  if (categories.length === 0) return '';
  const text = categories.join(', ');
  return `${text.charAt(0).toUpperCase()}${text.slice(1)}.`;
}

function uncategorizedLab(items: CompositionServiceItem[]): string[] {
  return items.filter((i) => i.serviceType === 'lab' && labCategory(i) === null).map((i) => i.name);
}

/** Контекст для попереджень у лозі: назви програми і клініки (з fetchClinicOffers). */
export interface CompositionLogContext {
  programName?: string | null;
  clinicName?: string | null;
}

/** Уже виведені попередження – щоб одна позиція не дублювалась у лозі для кожної
 *  сторінки, що показує ту саму програму (в межах одного процесу білду). */
const warnedUncategorized = new Set<string>();

/** Попередження в лог білду про лабораторні позиції без категорії опису.
 *  Опис на сторінці при цьому будується як завжди, без цієї позиції. */
function warnUncategorizedLab(items: CompositionServiceItem[], context?: CompositionLogContext): void {
  const program = context?.programName || 'невідома програма';
  const clinic = context?.clinicName || 'невідома клініка';
  for (const item of items) {
    if (item.serviceType !== 'lab' || labCategory(item) !== null) continue;
    const key = `${clinic}|${program}|${item.code ?? item.name}`;
    if (warnedUncategorized.has(key)) continue;
    warnedUncategorized.add(key);
    console.warn(
      `[composition] Позиція без категорії опису аналізів: програма «${program}», клініка «${clinic}», ` +
        `позиція «${item.name}» (код ${item.code ?? 'відсутній'}). В опис аналізів не виводиться.`,
    );
  }
}

// -----------------------------------------------------------------------------

const EMPTY: ProgramComposition = {
  items: [],
  counts: { consultations: 0, analyses: 0, diagnostics: 0 },
  summaryGroups: [],
  consultationsSummary: '',
  visit2ConsultationsSummary: '',
  instrumentalSummary: '',
  labSummary: '',
  labUncategorized: [],
  visitCount: 0,
  visit1Groups: [],
  visit2Items: [],
  preparationNotes: [],
};

export async function fetchProgramComposition(
  checkupProgramId: string | null | undefined,
  context?: CompositionLogContext,
): Promise<ProgramComposition> {
  if (!checkupProgramId) return EMPTY;
  try {
    const sb = db() as any;
    const { data, error } = await sb
      .from('program_services')
      .select('visit_number, clinic_services(code, name_ua, service_type)')
      .eq('checkup_program_id', checkupProgramId)
      .order('created_at', { ascending: true });

    if (error || !data) return EMPTY;

    const items: CompositionServiceItem[] = data
      .filter((row: any) => row.clinic_services)
      .map((row: any) => ({
        code: (row.clinic_services.code as string | null) ?? null,
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

    warnUncategorizedLab(summaryItems, context);

    return {
      items,
      counts,
      summaryGroups: groupByType(summaryItems),
      consultationsSummary: buildConsultationsSummary(summaryItems),
      visit2ConsultationsSummary: buildConsultationsSummary(items.filter((i) => i.visitNumber === 2)),
      instrumentalSummary: buildInstrumentalSummary(summaryItems),
      labSummary: buildLabSummary(summaryItems),
      labUncategorized: uncategorizedLab(summaryItems),
      visitCount,
      visit1Groups: groupByType(visit1Items),
      visit2Items,
      preparationNotes: derivePreparationNotes(items),
    };
  } catch {
    return EMPTY;
  }
}
