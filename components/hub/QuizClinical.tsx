'use client';

import { type ReactNode } from 'react';
import type { AgeGroup, PregnancyPlan, MiomaType, SymptomLevel, TreatmentPriority } from '@/lib/quiz/miomaRecommendationEngine';

export interface ClinicalAnswers {
  age: AgeGroup | null;
  planning_pregnancy: PregnancyPlan | null;
  mioma_type: MiomaType | null;
  symptoms: SymptomLevel | null;
  priority: TreatmentPriority | null;
}

interface QuizClinicalProps {
  answers: ClinicalAnswers;
  onChange: (answers: ClinicalAnswers) => void;
  onNext: () => void;
}

function OptionBtn({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left px-4 py-3.5 rounded-[10px] border-2 text-[15px] transition-colors mb-2 ${
        selected
          ? 'border-[#005485] bg-[#e8f4fd] font-semibold text-[#005485]'
          : 'border-gray-200 bg-white font-normal text-[#0b1a24] hover:border-gray-300'
      }`}
    >
      {children}
    </button>
  );
}

const QUESTIONS = [
  {
    id: 'age',
    label: 'Крок 1 з 5',
    question: 'Скільки вам років?',
    options: [
      { value: '20-35', label: '20\u201335 років' },
      { value: '35-45', label: '35\u201345 років' },
      { value: '45+', label: '45+ років' },
    ] as { value: AgeGroup; label: string }[],
  },
  {
    id: 'planning_pregnancy',
    label: 'Крок 2 з 5',
    question: 'Чи плануєте ви вагітність у найближчі 2-3 роки?',
    options: [
      { value: 'yes', label: 'Так, це пріоритет' },
      { value: 'maybe', label: 'Можливо, не виключаю' },
      { value: 'no', label: 'Ні, не планую' },
    ] as { value: PregnancyPlan; label: string }[],
  },
  {
    id: 'mioma_type',
    label: 'Крок 3 з 5',
    question: 'Який тип міоми у вашому діагнозі?',
    options: [
      { value: 'submucous', label: 'Субмукозна (росте в порожнину матки)' },
      { value: 'intramural', label: 'Інтрамуральна (у стінці матки)' },
      { value: 'subserous', label: 'Субсерозна (на зовнішній поверхні)' },
      { value: 'unknown', label: 'Не знаю — потрібно уточнити' },
    ] as { value: MiomaType; label: string }[],
  },
  {
    id: 'symptoms',
    label: 'Крок 4 з 5',
    question: 'Як ви оцінюєте свої симптоми?',
    options: [
      { value: 'none', label: 'Немає або майже немає' },
      { value: 'mild', label: 'Помірні — відчутні, але справляюсь' },
      { value: 'severe', label: 'Сильні — впливають на повсякденне життя' },
      { value: 'very_severe', label: 'Дуже сильні — анемія, не можу вести звичайне життя' },
    ] as { value: SymptomLevel; label: string }[],
  },
  {
    id: 'priority',
    label: 'Крок 5 з 5',
    question: 'Що для вас пріоритет у лікуванні?',
    options: [
      { value: 'fertility', label: 'Зберегти матку і можливість вагітності' },
      { value: 'recovery', label: 'Мінімальний термін відновлення' },
      { value: 'final', label: 'Остаточне рішення, щоб не повертатись до теми' },
      { value: 'consult', label: 'Не впевнена, хочу порадитись з лікарем' },
    ] as { value: TreatmentPriority; label: string }[],
  },
];

export default function QuizClinical({ answers, onChange, onNext }: QuizClinicalProps) {
  // Find first unanswered question
  const currentIdx = [
    answers.age === null,
    answers.planning_pregnancy === null,
    answers.mioma_type === null,
    answers.symptoms === null,
    answers.priority === null,
  ].findIndex(Boolean);

  const activeStep = currentIdx === -1 ? QUESTIONS.length - 1 : currentIdx;
  const progress = Math.round(((activeStep) / QUESTIONS.length) * 100);
  const allAnswered =
    answers.age !== null &&
    answers.planning_pregnancy !== null &&
    answers.mioma_type !== null &&
    answers.symptoms !== null &&
    answers.priority !== null;

  const setAnswer = (field: keyof ClinicalAnswers, value: string) => {
    onChange({ ...answers, [field]: value });
  };

  const goBack = () => {
    if (activeStep === 0) return;
    const field = QUESTIONS[activeStep - 1].id as keyof ClinicalAnswers;
    onChange({ ...answers, [field]: null });
  };

  // Show current question
  const q = QUESTIONS[allAnswered ? QUESTIONS.length - 1 : activeStep];
  const fieldValue = answers[q.id as keyof ClinicalAnswers];

  return (
    <div>
      {/* Progress bar */}
      <div className="h-[3px] bg-gray-100 mb-5">
        <div
          className="h-[3px] bg-[#04D3D9] transition-[width] duration-300"
          style={{ width: `${allAnswered ? 100 : progress}%` }}
        />
      </div>

      {/* Step label */}
      <div className="text-[11px] text-gray-400 uppercase tracking-widest mb-1.5">
        {q.label}
      </div>

      {/* Question */}
      <h3 className="text-[20px] font-bold text-[#0b1a24] mb-4 leading-snug">
        {q.question}
      </h3>

      {/* Options */}
      <div>
        {q.options.map((opt) => (
          <OptionBtn
            key={opt.value}
            selected={fieldValue === opt.value}
            onClick={() => setAnswer(q.id as keyof ClinicalAnswers, opt.value)}
          >
            {opt.label}
          </OptionBtn>
        ))}
      </div>

      {/* Navigation */}
      <div className="mt-4 flex gap-3 items-center">
        {activeStep > 0 && !allAnswered && (
          <button
            type="button"
            onClick={goBack}
            className="text-[14px] text-[#005485] bg-none border-none cursor-pointer py-2"
          >
            \u2190 Назад
          </button>
        )}
        {allAnswered && (
          <button
            type="button"
            onClick={onNext}
            className="flex-1 py-4 bg-[#005485] text-white text-[15px] font-semibold rounded-[10px] hover:bg-[#004070] transition-colors cursor-pointer"
          >
            Далі — обрати пріоритети
          </button>
        )}
      </div>

      {/* Summary of answered */}
      {allAnswered && (
        <div className="mt-4 bg-gray-50 rounded-[8px] p-3">
          <div className="text-[11px] text-gray-400 uppercase tracking-wide mb-2">Ваші відповіді</div>
          <div className="space-y-1">
            {QUESTIONS.map((sq) => {
              const val = answers[sq.id as keyof ClinicalAnswers];
              const opt = sq.options.find((o) => o.value === val);
              return (
                <div key={sq.id} className="flex justify-between text-[12px]">
                  <span className="text-gray-500">{sq.question.split(' \u2014 ')[0]}</span>
                  <span className="text-[#005485] font-medium ml-2 text-right">{opt?.label}</span>
                </div>
              );
            })}
          </div>
          <button
            type="button"
            onClick={() => onChange({ age: null, planning_pregnancy: null, mioma_type: null, symptoms: null, priority: null })}
            className="mt-2 text-[12px] text-gray-400 hover:text-gray-600 cursor-pointer bg-none border-none"
          >
            Змінити відповіді
          </button>
        </div>
      )}
    </div>
  );
}
