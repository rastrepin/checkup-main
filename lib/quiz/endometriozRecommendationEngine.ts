// Recommendation engine for endometrioz hub quiz
// Based on: ACOG, ESHRE Endometriosis Guidelines, Mayo Clinic, МОЗ України

export type PainLevel = 'mild' | 'severe' | 'very_severe';
export type PregnancyPlanEndo = 'yes' | 'no';
export type AgeGroupEndo = '20-35' | '35-45' | '45+';
export type TriedMeds = 'yes' | 'no';

export interface EndoQuizAnswers {
  planning_pregnancy: PregnancyPlanEndo;
  pain: PainLevel;
  age: AgeGroupEndo;
  tried_meds: TriedMeds;
  criteria: string[];
}

export type EndoRecommendedMethod =
  | 'laparo_conservative'
  | 'laparo_ivf'
  | 'hormonal_coc'
  | 'hormonal_ius'
  | 'laparo_standard'
  | 'hysterectomy_option'
  | 'consultation';

export interface EndoMethodRecommendation {
  primary: EndoRecommendedMethod;
  alternative: EndoRecommendedMethod | null;
  reasoning: string;
  note: string | null;
}

export const ENDO_METHOD_LABELS: Record<EndoRecommendedMethod, string> = {
  laparo_conservative: 'Лапароскопія консервативна',
  laparo_ivf: 'Лапароскопія + ЕКЗ як план Б',
  hormonal_coc: 'Гормональна терапія (КОК)',
  hormonal_ius: 'Гормональна терапія (ВМС)',
  laparo_standard: 'Лапароскопія',
  hysterectomy_option: 'Лапароскопія, гістеректомія як крайній варіант',
  consultation: 'Консультація для уточнення плану',
};

/**
 * Recommendation algorithm for endometriosis treatment.
 * Rules based on the task specification:
 *
 * 1. planning=yes + pain=mild → Лапароскопія консервативна
 * 2. planning=yes + pain=severe → Лапароскопія + ЕКЗ як план Б
 * 3. planning=no + pain=mild → Гормональна терапія (КОК або ВМС)
 * 4. planning=no + pain=severe + age<45 → Лапароскопія
 * 5. planning=no + pain=very_severe + age>40 + tried_meds=yes → Лапароскопія, гістеректомія як крайній варіант
 * Default: Гормональна терапія + консультація для уточнення
 */
export function getEndoMethodRecommendation(
  answers: EndoQuizAnswers
): EndoMethodRecommendation {
  const { planning_pregnancy, pain, age, tried_meds } = answers;

  // Rule 1: Planning pregnancy + mild pain → Conservative laparoscopy
  if (planning_pregnancy === 'yes' && pain === 'mild') {
    return {
      primary: 'laparo_conservative',
      alternative: 'hormonal_coc',
      reasoning:
        'Ви плануєте вагітність, і симптоми помірні. Консервативна лапароскопія видаляє ендометріоїдні вогнища та кісти, зберігаючи оваріальний резерв — і підвищує шанс на природне зачаття. За даними ESHRE, операція покращує fertility outcomes при помірному ендометріозі.',
      note: 'Вагітність рекомендована у перші 6-12 місяців після операції, поки ризик рецидиву мінімальний.',
    };
  }

  // Rule 2: Planning pregnancy + severe pain → Laparoscopy + IVF as plan B
  if (planning_pregnancy === 'yes' && (pain === 'severe' || pain === 'very_severe')) {
    return {
      primary: 'laparo_ivf',
      alternative: 'laparo_conservative',
      reasoning:
        'При вираженому болю та планах на вагітність лапароскопія є основним методом — вона усуває вогнища та відновлює прохідність труб. ЕКЗ — план Б, якщо природне зачаття після операції не настає протягом 6-12 місяців або є ознаки зниження оваріального резерву.',
      note: 'Рішення про ЕКЗ приймається разом з репродуктологом після операції. Не відкладайте: ендометріоз може прогресувати.',
    };
  }

  // Rule 3: No pregnancy plan + mild pain → Hormonal therapy
  if (planning_pregnancy === 'no' && pain === 'mild') {
    return {
      primary: 'hormonal_coc',
      alternative: 'hormonal_ius',
      reasoning:
        'При помірних симптомах і відсутності планів на вагітність гормональна терапія — перша лінія. КОК (оральні контрацептиви) або ВМС з прогестином (ВМС Мірена) ефективно зменшують біль та запалення у більшості пацієнток. Операція залишається в резерві при неефективності.',
      note: 'Гормональна терапія контролює симптоми, але не виліковує ендометріоз повністю. Після відміни симптоми можуть повернутись.',
    };
  }

  // Rule 4: No pregnancy + severe/very_severe pain + under 45 → Laparoscopy
  if (
    planning_pregnancy === 'no' &&
    (pain === 'severe' || pain === 'very_severe') &&
    (age === '20-35' || age === '35-45')
  ) {
    return {
      primary: 'laparo_standard',
      alternative: 'hormonal_coc',
      reasoning:
        'При вираженому болю, який суттєво знижує якість життя, і неефективності або небажаності гормональної терапії — лапароскопія є основним методом. Вона видаляє видимі вогнища ендометріозу та нормалізує стан на 2-5 років у більшості пацієнток.',
      note: 'Ризик рецидиву ендометріозу зберігається. Після операції може бути рекомендована підтримуюча гормональна терапія для продовження ефекту.',
    };
  }

  // Rule 5: No pregnancy + very_severe pain + over 40 + tried_meds=yes → Surgery incl. possible hysterectomy
  if (
    planning_pregnancy === 'no' &&
    pain === 'very_severe' &&
    age === '45+' &&
    tried_meds === 'yes'
  ) {
    return {
      primary: 'hysterectomy_option',
      alternative: 'laparo_standard',
      reasoning:
        'При дуже вираженому болю, вичерпаному консервативному лікуванні та відсутності планів на вагітність — хірургічне лікування є виправданим. Лапароскопія залишається варіантом першого вибору. Гістеректомія (з оваріектомією або без) розглядається лише якщо симптоми критично знижують якість життя і не контролюються іншими методами.',
      note: 'Гістеректомія — остаточне рішення. Перед прийняттям рішення обов\'язкова консультація з двома незалежними фахівцями.',
    };
  }

  // Default: Hormonal therapy + consultation
  return {
    primary: 'hormonal_coc',
    alternative: 'consultation',
    reasoning:
      'На основі ваших відповідей оптимальний старт — гормональна терапія та консультація з гінекологом для уточнення стадії ендометріозу та вибору тактики. Рішення залежить від даних УЗД, лапароскопії та ваших пріоритетів.',
    note: 'Ендометріоз — хронічне захворювання з індивідуальним перебігом. Найкращий план завжди розробляється спільно з лікарем.',
  };
}

export function getEndoCriteriaPersonalization(
  criteria: string[],
  method: EndoRecommendedMethod
): { icon: string; label: string; value: string }[] {
  const result: { icon: string; label: string; value: string }[] = [];

  // TODO: replace with Supabase when tables are ready
  if (criteria.includes('experience')) {
    result.push({
      icon: '🎯',
      label: 'Досвід',
      value: 'Лікарі платформи з досвідом лапароскопічного лікування ендометріозу',
    });
  }
  if (criteria.includes('price')) {
    const methodPrices: Partial<Record<EndoRecommendedMethod, string>> = {
      laparo_conservative: 'від 35 000 грн, включає стаціонар та анестезію',
      laparo_ivf: 'від 35 000 грн + вартість ЕКЗ за окремим розрахунком',
      hormonal_coc: 'від 500 грн/міс (КОК)',
      hormonal_ius: 'від 5 000 грн (ВМС, вистачає на 5 років)',
      laparo_standard: 'від 35 000 грн',
      hysterectomy_option: 'від 40 000 грн',
      consultation: 'від 800 грн (первинний прийом)',
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
      label: 'План після консультації',
      value: 'отримаєте схему обстежень, орієнтовну тактику та відповіді на ваші питання',
    });
  }
  if (criteria.includes('explanation')) {
    result.push({
      icon: '💬',
      label: 'Пояснення',
      value: 'лікар пояснює кожен крок зрозумілою мовою без медичного жаргону',
    });
  }

  return result;
}
