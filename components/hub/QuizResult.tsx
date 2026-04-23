'use client';

import { useState } from 'react';
import {
  getMethodRecommendation,
  getCriteriaPersonalization,
  METHOD_LABELS,
  type QuizAnswers,
} from '@/lib/quiz/miomaRecommendationEngine';
import LeadForm from '@/components/shared/LeadForm';

interface QuizResultProps {
  answers: QuizAnswers;
  onReset: () => void;
}

export default function QuizResult({ answers, onReset }: QuizResultProps) {
  const [formVisible, setFormVisible] = useState(false);
  const recommendation = getMethodRecommendation(answers);
  const personalization = getCriteriaPersonalization(answers.criteria, recommendation.primary);

  const primaryLabel = METHOD_LABELS[recommendation.primary];
  const altLabel = recommendation.alternative ? METHOD_LABELS[recommendation.alternative] : null;

  return (
    <div>
      {/* Header */}
      <div className="text-center mb-5">
        <div className="inline-flex items-center justify-center w-10 h-10 bg-[#005485] rounded-full mb-3">
          <svg
            className="w-5 h-5 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-[18px] font-bold text-[#0b1a24]">Ваша рекомендація</h3>
      </div>

      {/* Primary method */}
      <div className="bg-[#e8f4fd] border border-[#005485]/20 rounded-[10px] p-4 mb-3">
        <div className="text-[12px] text-[#005485] font-semibold uppercase tracking-wide mb-1">
          Рекомендований метод
        </div>
        <div className="text-[18px] font-bold text-[#005485]">{primaryLabel}</div>
        {altLabel && (
          <div className="text-[13px] text-gray-600 mt-1">
            Альтернатива — {altLabel}
          </div>
        )}
      </div>

      {/* Reasoning */}
      <div className="bg-white border border-gray-200 rounded-[10px] p-4 mb-3">
        <div className="text-[12px] text-gray-400 uppercase tracking-wide mb-1.5">
          Чому цей метод для вас
        </div>
        <p className="text-[14px] text-[#0b1a24] leading-relaxed">{recommendation.reasoning}</p>
        {recommendation.note && (
          <p className="text-[13px] text-gray-500 mt-2 italic">{recommendation.note}</p>
        )}
      </div>

      {/* Personalization by criteria */}
      {personalization.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-[10px] p-4 mb-4">
          <div className="text-[12px] text-gray-400 uppercase tracking-wide mb-2">
            За вашими пріоритетами
          </div>
          <div className="space-y-2.5">
            {personalization.map((item) => (
              <div key={item.label} className="flex items-start gap-2.5">
                <span className="text-[18px] shrink-0 leading-none mt-0.5">{item.icon}</span>
                <div>
                  <span className="text-[13px] font-semibold text-[#0b1a24]">{item.label}: </span>
                  <span className="text-[13px] text-gray-600">{item.value}</span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-gray-400 mt-2 italic">
            * Гіпотетичні дані — TODO: замінити фактичними з Supabase
          </p>
        </div>
      )}

      {/* CTA — форма запису */}
      {!formVisible ? (
        <button
          type="button"
          onClick={() => setFormVisible(true)}
          className="w-full py-4 bg-[#d60242] text-white text-[15px] font-semibold rounded-[10px] hover:bg-[#b5003a] transition-colors cursor-pointer mb-3"
        >
          Записатись на консультацію
        </button>
      ) : (
        <LeadForm
          intent="choose_method"
          sourcePage="/cases/mioma-matky"
          sourceQuizId="mioma-hub-v1"
          criteriaSelected={answers.criteria}
          readinessStage={`method:${recommendation.primary}`}
          ctaLabel="Підтвердити запит"
          className="mb-3"
        />
      )}

      <button
        type="button"
        onClick={onReset}
        className="w-full py-2 text-[13px] text-gray-400 hover:text-gray-600 bg-none border-none cursor-pointer"
      >
        Пройти квіз знову
      </button>
    </div>
  );
}
