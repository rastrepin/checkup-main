'use client';

import { useState } from 'react';
import {
  getEndoMethodRecommendation,
  getEndoCriteriaPersonalization,
  ENDO_METHOD_LABELS,
  type EndoQuizAnswers,
  type PainLevel,
  type PregnancyPlanEndo,
  type AgeGroupEndo,
  type TriedMeds,
} from '@/lib/quiz/endometriozRecommendationEngine';

type QuizPhase = 'clinical' | 'criteria' | 'result';

const CRITERIA_OPTIONS = [
  { id: 'experience', label: 'Досвід лікаря саме з ендометріозом' },
  { id: 'explanation', label: 'Зрозуміле пояснення на кожному кроці' },
  { id: 'price', label: 'Знати ціну наперед, без сюрпризів' },
  { id: 'no_queue', label: 'Без черг та очікування' },
  { id: 'reviews', label: 'Відгуки від людей у схожій ситуації' },
  { id: 'plan', label: 'Чіткий план дій після візиту' },
];

function OptionButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left px-4 py-3 rounded-[10px] border-2 text-[14px] transition-colors ${
        active
          ? 'border-[#005485] bg-[#e8f4fd] text-[#005485] font-semibold'
          : 'border-gray-200 bg-white text-[#0b1a24] hover:border-gray-300'
      }`}
    >
      {children}
    </button>
  );
}

export default function QuizEndometrioz() {
  const [phase, setPhase] = useState<QuizPhase>('clinical');
  const [age, setAge] = useState<AgeGroupEndo | null>(null);
  const [pregnancy, setPregnancy] = useState<PregnancyPlanEndo | null>(null);
  const [pain, setPain] = useState<PainLevel | null>(null);
  const [triedMeds, setTriedMeds] = useState<TriedMeds | null>(null);
  const [criteria, setCriteria] = useState<string[]>([]);

  const clinicalComplete = age !== null && pregnancy !== null && pain !== null && triedMeds !== null;

  const toggleCriteria = (id: string) => {
    setCriteria((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : prev.length < 3 ? [...prev, id] : prev
    );
  };

  const handleReset = () => {
    setPhase('clinical');
    setAge(null);
    setPregnancy(null);
    setPain(null);
    setTriedMeds(null);
    setCriteria([]);
  };

  const quizAnswers: EndoQuizAnswers | null =
    age && pregnancy && pain && triedMeds
      ? { planning_pregnancy: pregnancy, pain, age, tried_meds: triedMeds, criteria }
      : null;

  const recommendation = quizAnswers ? getEndoMethodRecommendation(quizAnswers) : null;
  const personalization = recommendation
    ? getEndoCriteriaPersonalization(criteria, recommendation.primary)
    : [];

  return (
    <section
      id="quiz"
      className="px-4 py-8 bg-white md:bg-gray-50"
      aria-labelledby="quiz-endo-heading"
    >
      <div className="max-w-2xl mx-auto">
        <h2
          id="quiz-endo-heading"
          className="text-[22px] font-bold text-[#0b1a24] mb-1"
        >
          Квіз → рекомендований підхід та лікар
        </h2>
        <p className="text-[14px] text-gray-500 mb-5 leading-relaxed">
          Кілька питань про вашу ситуацію — і ми покажемо, який підхід оптимальний саме для вас,
          та лікарів з профільним досвідом в ендометріозі.
        </p>

        <div className="bg-gray-50 rounded-[10px] p-4 sm:p-5 md:bg-white md:border md:border-gray-200">
          {/* Phase: clinical questions */}
          {phase === 'clinical' && (
            <div className="space-y-5">
              {/* Q1: Age */}
              <div>
                <div className="text-[13px] font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                  Скільки вам років?
                </div>
                <div className="space-y-2">
                  {(['20-35', '35-45', '45+'] as AgeGroupEndo[]).map((a) => (
                    <OptionButton key={a} active={age === a} onClick={() => setAge(a)}>
                      {a} років
                    </OptionButton>
                  ))}
                </div>
              </div>

              {/* Q2: Pregnancy */}
              <div>
                <div className="text-[13px] font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                  Чи плануєте вагітність у найближчі 2-3 роки?
                </div>
                <div className="space-y-2">
                  <OptionButton active={pregnancy === 'yes'} onClick={() => setPregnancy('yes')}>
                    Так, це пріоритет
                  </OptionButton>
                  <OptionButton active={pregnancy === 'no'} onClick={() => setPregnancy('no')}>
                    Ні, не планую
                  </OptionButton>
                </div>
              </div>

              {/* Q3: Pain intensity */}
              <div>
                <div className="text-[13px] font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                  Як ви оцінюєте інтенсивність болю зараз?
                </div>
                <div className="space-y-2">
                  <OptionButton active={pain === 'mild'} onClick={() => setPain('mild')}>
                    Терпимий, рідко впливає на повсякденне життя
                  </OptionButton>
                  <OptionButton active={pain === 'severe'} onClick={() => setPain('severe')}>
                    Сильний, регулярно обмежує активність
                  </OptionButton>
                  <OptionButton active={pain === 'very_severe'} onClick={() => setPain('very_severe')}>
                    Дуже сильний, не контролюється знеболювальними
                  </OptionButton>
                </div>
              </div>

              {/* Q4: Tried medications */}
              <div>
                <div className="text-[13px] font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                  Чи пробували ви гормональне лікування (КОК, ВМС, ін.)?
                </div>
                <div className="space-y-2">
                  <OptionButton active={triedMeds === 'no'} onClick={() => setTriedMeds('no')}>
                    Ні, ще не пробувала
                  </OptionButton>
                  <OptionButton active={triedMeds === 'yes'} onClick={() => setTriedMeds('yes')}>
                    Так, пробувала — ефект недостатній або не підходить
                  </OptionButton>
                </div>
              </div>

              <button
                type="button"
                disabled={!clinicalComplete}
                onClick={() => setPhase('criteria')}
                className="w-full py-3.5 bg-[#005485] text-white text-[15px] font-semibold rounded-[10px] hover:bg-[#004070] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Далі →
              </button>
            </div>
          )}

          {/* Phase: criteria */}
          {phase === 'criteria' && (
            <div>
              <div className="text-[15px] font-bold text-[#0b1a24] mb-1">
                Що для вас найважливіше у виборі клініки?
              </div>
              <p className="text-[13px] text-gray-500 mb-4">
                Оберіть до 3 пунктів — ми врахуємо при рекомендації
              </p>
              <div className="space-y-2 mb-5">
                {CRITERIA_OPTIONS.map((opt) => {
                  const active = criteria.includes(opt.id);
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => toggleCriteria(opt.id)}
                      className={`w-full text-left px-4 py-3 rounded-[10px] border-2 text-[14px] transition-colors flex items-center gap-3 ${
                        active
                          ? 'border-[#005485] bg-[#e8f4fd] text-[#005485] font-semibold'
                          : 'border-gray-200 bg-white text-[#0b1a24] hover:border-gray-300'
                      } ${!active && criteria.length >= 3 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <span
                        className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${
                          active ? 'border-[#005485] bg-[#005485]' : 'border-gray-300'
                        }`}
                      >
                        {active && (
                          <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 10" fill="currentColor">
                            <path d="M8.5 2L4 7.5 1.5 5" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </span>
                      {opt.label}
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setPhase('clinical')}
                  className="flex-1 py-3 border-2 border-gray-200 text-[14px] font-semibold text-gray-600 rounded-[10px] hover:border-gray-300 transition-colors"
                >
                  ← Назад
                </button>
                <button
                  type="button"
                  onClick={() => setPhase('result')}
                  className="flex-[2] py-3 bg-[#005485] text-white text-[14px] font-semibold rounded-[10px] hover:bg-[#004070] transition-colors"
                >
                  Показати рекомендацію →
                </button>
              </div>
            </div>
          )}

          {/* Phase: result */}
          {phase === 'result' && recommendation && (
            <div>
              <div className="text-[11px] text-[#005485] uppercase tracking-wide font-semibold mb-2">
                Рекомендований підхід
              </div>
              <div className="text-[18px] font-bold text-[#0b1a24] mb-2">
                {ENDO_METHOD_LABELS[recommendation.primary]}
              </div>
              {recommendation.alternative && (
                <div className="text-[13px] text-gray-500 mb-3">
                  Альтернатива:{' '}
                  <span className="font-medium text-[#0b1a24]">
                    {ENDO_METHOD_LABELS[recommendation.alternative]}
                  </span>
                </div>
              )}
              <div className="bg-[#e8f4fd] border border-[#005485]/20 rounded-[10px] p-3.5 mb-3">
                <p className="text-[13px] text-[#0b1a24] leading-relaxed">{recommendation.reasoning}</p>
              </div>
              {recommendation.note && (
                <p className="text-[12px] text-gray-500 italic mb-3">{recommendation.note}</p>
              )}

              {personalization.length > 0 && (
                <div className="space-y-2 mb-4">
                  {personalization.map((p) => (
                    <div key={p.label} className="bg-white border border-gray-200 rounded-[8px] px-3.5 py-2.5 text-[13px]">
                      <span className="font-semibold text-[#0b1a24]">{p.label}: </span>
                      <span className="text-gray-600">{p.value}</span>
                    </div>
                  ))}
                </div>
              )}

              <a
                href="#lead-form"
                className="block w-full py-3.5 text-center bg-[#d60242] text-white text-[15px] font-semibold rounded-[10px] hover:bg-[#b5003a] transition-colors mb-3"
              >
                Записатись на консультацію
              </a>
              <button
                type="button"
                onClick={handleReset}
                className="text-[13px] text-gray-400 hover:text-gray-600 transition-colors w-full text-center"
              >
                Пройти знову
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
