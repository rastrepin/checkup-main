// TODO: replace with Supabase when tables are ready
// Recommendation engine for mioma hub quiz

export type AgeGroup = '20-35' | '35-45' | '45+';
export type PregnancyPlan = 'yes' | 'maybe' | 'no';
export type MiomaType = 'submucous' | 'intramural' | 'subserous' | 'unknown';
export type SymptomLevel = 'none' | 'mild' | 'severe' | 'very_severe';
export type TreatmentPriority = 'fertility' | 'recovery' | 'final' | 'consult';

export interface QuizAnswers {
  age: AgeGroup;
  planning_pregnancy: PregnancyPlan;
  mioma_type: MiomaType;
  symptoms: SymptomLevel;
  priority: TreatmentPriority;
  criteria: string[];
}

export type RecommendedMethod =
  | 'hystero_myomectomy'
  | 'laparo_myomectomy'
  | 'open_myomectomy'
  | 'ema'
  | 'medications'
  | 'hysterectomy'
  | 'observation';

export interface MethodRecommendation {
  primary: RecommendedMethod;
  alternative: RecommendedMethod | null;
  reasoning: string;
  note: string | null;
}

export const METHOD_LABELS: Record<RecommendedMethod, string> = {
  hystero_myomectomy: 'Гістероскопічна міомектомія',
  laparo_myomectomy: 'Лапароскопічна міомектомія',
  open_myomectomy: 'Відкрита міомектомія',
  ema: 'Емболізація маткових артерій (ЕМА)',
  medications: 'Медикаментозне лікування',
  hysterectomy: 'Гістеректомія',
  observation: 'Активне спостереження',
};

/**
 * Recommendation algorithm based on:
 * - ACOG Practice Bulletin #228
 * - Mayo Clinic Family Health Book (Uterine Fibroids)
 * - МОЗ України, Наказ №147 (2023)
 */
export function getMethodRecommendation(answers: QuizAnswers): MethodRecommendation {
  const { age, planning_pregnancy, mioma_type, symptoms, priority } = answers;

  // Rule 1: Planning pregnancy + submucous → Hysteroscopic myomectomy
  if (
    (planning_pregnancy === 'yes' || planning_pregnancy === 'maybe') &&
    mioma_type === 'submucous'
  ) {
    return {
      primary: 'hystero_myomectomy',
      alternative: 'laparo_myomectomy',
      reasoning:
        'Ви плануєте вагітність, а тип вузла — субмукозний (росте у порожнину матки). Гістероскопічна міомектомія — найбезпечніший та найменш інвазивний метод, який усуває вузол та зберігає фертильність.',
      note: 'Виписка того ж дня, повернення до активності через 48 годин.',
    };
  }

  // Rule 2: Planning pregnancy + intramural → Laparoscopic myomectomy
  if (
    (planning_pregnancy === 'yes' || planning_pregnancy === 'maybe') &&
    (mioma_type === 'intramural' || mioma_type === 'unknown')
  ) {
    return {
      primary: 'laparo_myomectomy',
      alternative: 'hystero_myomectomy',
      reasoning:
        'Ви плануєте вагітність — методи зі збереженням матки є пріоритетом. Лапароскопічна міомектомія — стандарт для інтрамуральних вузлів. Матка зберігається повністю, вагітність можлива через 6 місяців після операції.',
      note: 'Відновлення 21 день. Кесарів розтин може бути рекомендований залежно від глибини розрізу.',
    };
  }

  // Rule 3: No pregnancy plan + severe symptoms + age 45+ → Hysterectomy
  if (
    planning_pregnancy === 'no' &&
    (symptoms === 'severe' || symptoms === 'very_severe') &&
    age === '45+'
  ) {
    return {
      primary: 'hysterectomy',
      alternative: 'ema',
      reasoning:
        'При тяжких симптомах та відсутності планів на вагітність у вашому віці гістеректомія дає остаточне вирішення проблеми. ЕМА — альтернатива, якщо хочете уникнути операції.',
      note: 'Повне відновлення 6-8 тижнів. Рекомендована консультація для вибору підходу (вагінальний/лапароскопічний/абдомінальний).',
    };
  }

  // Rule 4: No pregnancy + severe symptoms + under 45 → EMA or laparoscopic
  if (
    planning_pregnancy === 'no' &&
    (symptoms === 'severe' || symptoms === 'very_severe') &&
    (age === '35-45' || age === '20-35')
  ) {
    return {
      primary: 'ema',
      alternative: 'laparo_myomectomy',
      reasoning:
        'При тяжких симптомах без планів на вагітність ЕМА — мінімально інвазивна альтернатива операції. Зменшення симптомів у ~90% пацієнток, відновлення близько тижня. Лапароскопічна міомектомія — якщо бажаєте зберегти матку для подальших рішень.',
      note: 'ЕМА не рекомендована якщо плани на вагітність можуть змінитись.',
    };
  }

  // Rule 5: Mild symptoms + under 40 → Medications
  if (symptoms === 'mild' && (age === '20-35' || age === '35-45') && planning_pregnancy !== 'yes') {
    return {
      primary: 'medications',
      alternative: 'observation',
      reasoning:
        'При помірних симптомах медикаментозне лікування може ефективно контролювати кровотечі та біль без операції. ВМС з прогестероном або гормональна терапія часто є першою лінією.',
      note: 'Медикаменти не усувають міому, а контролюють симптоми. Після припинення терапії симптоми можуть повернутись.',
    };
  }

  // Rule 6: No symptoms → Observation
  if (symptoms === 'none') {
    return {
      primary: 'observation',
      alternative: null,
      reasoning:
        'При відсутності симптомів активне спостереження — нормальна медична стратегія. УЗД раз на рік, аналіз крові з гемоглобіном раз на пів року.',
      note: 'Критерії переходу до лікування: анемія (гемоглобін < 110 г/л), швидкий ріст вузла, планування вагітності з субмукозним вузлом.',
    };
  }

  // Default: Laparoscopic myomectomy (most universal)
  return {
    primary: 'laparo_myomectomy',
    alternative: 'hystero_myomectomy',
    reasoning:
      'Лапароскопічна міомектомія — найуніверсальніший метод для більшості клінічних ситуацій. Матка зберігається, відновлення 21 день. Уточніть тип вузла для більш точної рекомендації.',
    note: null,
  };
}

export function getCriteriaPersonalization(
  criteria: string[],
  method: RecommendedMethod
): { icon: string; label: string; value: string }[] {
  const result: { icon: string; label: string; value: string }[] = [];

  // TODO: replace with Supabase when tables are ready
  if (criteria.includes('experience')) {
    result.push({
      icon: '🎯',
      label: 'Досвід',
      value: 'Трохимович Р.М. — 340+ лапароскопічних міомектомій',
    });
  }
  if (criteria.includes('price')) {
    const methodPrices: Partial<Record<RecommendedMethod, string>> = {
      laparo_myomectomy: 'від 35 000 грн, включає стаціонар 3 доби та анестезію. Окремо: аналізи 1 500–2 000 грн, УЗД 800 грн',
      hystero_myomectomy: 'від 15 000 грн, амбулаторно',
      ema: 'від 45 000 грн',
      hysterectomy: 'від 40 000 грн',
      medications: 'від 2 000 грн/міс',
      open_myomectomy: 'від 30 000 грн',
      observation: 'УЗД 500–800 грн/рік',
    };
    result.push({
      icon: '💰',
      label: 'Ціна',
      value: methodPrices[method] ?? 'уточнюється після консультації',
    });
  }
  if (criteria.includes('result')) {
    result.push({
      icon: '📋',
      label: 'План дій після візиту',
      value: 'на першій консультації отримаєте мапу обстежень, орієнтовну дату операції та план відновлення',
    });
  }
  if (criteria.includes('explanation')) {
    result.push({
      icon: '💬',
      label: 'Пояснення',
      value: 'лікар пояснює кожен крок на зрозумілій мові без жаргону',
    });
  }
  if (criteria.includes('reviews')) {
    result.push({
      icon: '⭐',
      label: 'Відгуки',
      value: 'профілі лікарів зі схожими випадками доступні після вибору клініки',
    });
  }

  return result;
}
