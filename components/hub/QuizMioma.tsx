'use client';

import { useState } from 'react';
import QuizClinical, { type ClinicalAnswers } from './QuizClinical';
import QuizCriteria from './QuizCriteria';
import QuizResult from './QuizResult';
import type { QuizAnswers } from '@/lib/quiz/miomaRecommendationEngine';

type QuizPhase = 'clinical' | 'criteria' | 'result';

const INITIAL_CLINICAL: ClinicalAnswers = {
  age: null,
  planning_pregnancy: null,
  mioma_type: null,
  symptoms: null,
  priority: null,
};

export default function QuizMioma() {
  const [phase, setPhase] = useState<QuizPhase>('clinical');
  const [clinicalAnswers, setClinicalAnswers] = useState<ClinicalAnswers>(INITIAL_CLINICAL);
  const [criteria, setCriteria] = useState<string[]>([]);

  const handleReset = () => {
    setPhase('clinical');
    setClinicalAnswers(INITIAL_CLINICAL);
    setCriteria([]);
  };

  const quizAnswers: QuizAnswers | null =
    phase === 'result' &&
    clinicalAnswers.age !== null &&
    clinicalAnswers.planning_pregnancy !== null &&
    clinicalAnswers.mioma_type !== null &&
    clinicalAnswers.symptoms !== null &&
    clinicalAnswers.priority !== null
      ? {
          age: clinicalAnswers.age,
          planning_pregnancy: clinicalAnswers.planning_pregnancy,
          mioma_type: clinicalAnswers.mioma_type,
          symptoms: clinicalAnswers.symptoms,
          priority: clinicalAnswers.priority,
          criteria,
        }
      : null;

  return (
    <section
      id="quiz"
      className="px-4 py-8 bg-white md:bg-gray-50"
      aria-labelledby="quiz-heading"
    >
      <div className="max-w-2xl mx-auto">
        <h2
          id="quiz-heading"
          className="text-[22px] font-bold text-[#0b1a24] mb-1"
        >
          Квіз → рекомендований метод та лікар
        </h2>
        <p className="text-[14px] text-gray-500 mb-5 leading-relaxed">
          Квіз переводить вашу ситуацію (вік, тип вузла, симптоми, плани на вагітність)
          у рекомендацію методу лікування та показує найрелевантніші клініки і лікарів.
        </p>

        <div className="bg-gray-50 rounded-[10px] p-4 sm:p-5">
          {phase === 'clinical' && (
            <QuizClinical
              answers={clinicalAnswers}
              onChange={setClinicalAnswers}
              onNext={() => setPhase('criteria')}
            />
          )}
          {phase === 'criteria' && (
            <QuizCriteria
              selected={criteria}
              onChange={setCriteria}
              onNext={() => setPhase('result')}
              onBack={() => setPhase('clinical')}
            />
          )}
          {phase === 'result' && quizAnswers !== null && (
            <QuizResult answers={quizAnswers} onReset={handleReset} />
          )}
        </div>
      </div>
    </section>
  );
}
