'use client';

import { useEffect } from 'react';
import { useQuiz, type Gender, type AgeGroup } from './QuizContext';
import { TAG_ICONS } from './icons';
import { supabase } from '@/lib/supabase';
import type { CheckupProgram } from '@/lib/types';

const TAGS = [
  { id: 'fatigue', label: 'Втома / слабкість' },
  { id: 'headache', label: 'Головний біль' },
  { id: 'back', label: 'Спина / суглоби' },
  { id: 'stomach', label: 'Шлунок / травлення' },
  { id: 'heart', label: 'Серце / тиск' },
  { id: 'hormones', label: 'Гормони / цикл' },
  { id: 'skin', label: 'Шкіра / волосся' },
  { id: 'checkup', label: 'Просто перевіритись' },
];

const AGE_OPTIONS: { value: AgeGroup; label: string }[] = [
  { value: 'do-30', label: 'До 30 років' },
  { value: '30-40', label: '30-40 років' },
  { value: '40-50', label: '40-50 років' },
  { value: '50+', label: 'Від 50 років' },
];

function getProgram(gender: string, age: string): string {
  if (gender === 'female') {
    return ['40-50', '50+'].includes(age) ? 'zhinochyi-pislia-40' : 'zhinochyi-profilaktychnyi';
  }
  return ['40-50', '50+'].includes(age) ? 'cholovichyi-pislia-40' : 'cholovichyi-profilaktychnyi';
}

interface QuizEngineProps {
  clinicSlug: string;
  city: string;
  locale?: 'ua' | 'ru';
}

export default function QuizEngine({ clinicSlug, city, locale = 'ua' }: QuizEngineProps) {
  const {
    phase, gender, age, tags,
    setPhase, setGender, setAge, toggleTag,
    setSelectedProgram, setBranches,
  } = useQuiz();

  // Determine total steps and current step for progress
  const totalSteps = (phase === 'gender' || phase === 'age' || phase === 'tags') ? 3 : 3;
  const currentStep = phase === 'gender' ? 1 : phase === 'age' ? 2 : 3;

  // Calculate progress
  const progressPercent =
    phase === 'gender' ? 10
      : phase === 'age' ? 20
        : phase === 'tags' ? 30
          : phase === 'roadmap' ? 45
            : phase === 'branch' ? 65
              : phase === 'contacts' ? 80
                : 100;

  const canNext =
    phase === 'gender' ? gender !== null
      : phase === 'age' ? age !== null
        : phase === 'tags' ? tags.length > 0
          : false;

  const handleNext = async () => {
    if (phase === 'gender') {
      setPhase('age');
    } else if (phase === 'age') {
      setPhase('tags');
    } else if (phase === 'tags' && gender && age) {
      // Fetch program and branches, then go to roadmap
      const programSlug = getProgram(gender, age);

      const sb = supabase as any;
      const [programRes, branchesRes] = await Promise.all([
        sb.from('checkup_programs').select('*').eq('slug', programSlug).single(),
        (async () => {
          const clinicRes = await sb.from('clinics').select('id').eq('slug', clinicSlug).single();
          return sb.from('clinic_branches').select('*').eq('clinic_id', clinicRes.data?.id).order('sort_order');
        })(),
      ]);

      if (programRes.data) setSelectedProgram(programRes.data as CheckupProgram);
      if (branchesRes.data) setBranches(branchesRes.data);

      setPhase('roadmap');
    }
  };

  const handleBack = () => {
    if (phase === 'age') setPhase('gender');
    else if (phase === 'tags') setPhase('age');
  };

  if (phase !== 'gender' && phase !== 'age' && phase !== 'tags') return null;

  return (
    <div id="quiz">
      {/* Progress bar */}
      <div className="h-[3px] bg-gray-100 mb-5">
        <div
          className="h-[3px] bg-[#04D3D9] transition-[width] duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Back button */}
      {phase !== 'gender' && (
        <button
          onClick={handleBack}
          className="text-[#005485] text-sm py-2 mb-2 cursor-pointer bg-transparent border-none"
        >
          &larr; Назад
        </button>
      )}

      {/* Step label */}
      <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-gray-500 mb-1.5">
        Крок {currentStep} з {totalSteps}
      </div>

      {/* Gender step */}
      {phase === 'gender' && (
        <div>
          <h2 className="text-xl font-bold leading-tight mb-4 text-[#0b1a24]">Ваша стать</h2>
          {([['female', 'Жінка'], ['male', 'Чоловік']] as [Gender, string][]).map(([value, label]) => (
            <button
              key={value}
              onClick={() => setGender(value)}
              className={`w-full text-left px-4 py-3.5 mb-2 rounded-[10px] border-2 text-[15px] transition-all duration-150 ${gender === value
                ? 'border-[#005485] bg-[#e8f4fd] font-semibold'
                : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Age step */}
      {phase === 'age' && (
        <div>
          <h2 className="text-xl font-bold leading-tight mb-4 text-[#0b1a24]">Ваш вік</h2>
          {AGE_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setAge(opt.value)}
              className={`w-full text-left px-4 py-3.5 mb-2 rounded-[10px] border-2 text-[15px] transition-all duration-150 ${age === opt.value
                ? 'border-[#005485] bg-[#e8f4fd] font-semibold'
                : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {/* Tags step */}
      {phase === 'tags' && (
        <div>
          <h2 className="text-xl font-bold leading-tight mb-1 text-[#0b1a24]">Що вас турбує?</h2>
          <p className="text-[13px] text-gray-500 mb-4">Оберіть одне або кілька</p>
          <div className="flex flex-wrap gap-2">
            {TAGS.map(tag => {
              const Icon = TAG_ICONS[tag.id];
              const selected = tags.includes(tag.id);
              return (
                <button
                  key={tag.id}
                  onClick={() => toggleTag(tag.id)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-full border-2 text-sm transition-all duration-150 ${selected
                    ? 'border-[#005485] bg-[#e8f4fd] font-semibold'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                >
                  {Icon && <Icon size={16} className="text-gray-500" />}
                  {tag.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Next button */}
      <button
        onClick={handleNext}
        disabled={!canNext}
        className={`w-full py-4 mt-5 rounded-[10px] text-base font-semibold text-white transition-colors ${canNext
          ? 'bg-[#005485] cursor-pointer hover:bg-[#004470]'
          : 'bg-[#d1d5db] cursor-default'
          }`}
      >
        {phase === 'tags' ? 'Отримати дорожню карту' : 'Далі'}
      </button>
    </div>
  );
}
