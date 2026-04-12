'use client';

import { useQuiz } from './QuizContext';
import { IconCheckCircle, IconPhone, IconFolder, IconCalendar } from './icons';

export default function BookingConfirmation() {
  const { phase, name, selectedProgram, selectedBranchId, branches, reset } = useQuiz();

  if (phase !== 'confirmed') return null;

  const branch = branches.find(b => b.id === selectedBranchId);
  const price = selectedProgram?.price_discount || 0;

  return (
    <div>
      {/* Progress bar */}
      <div className="h-[3px] bg-gray-100 mb-5">
        <div className="h-[3px] bg-[#04D3D9] transition-[width] duration-300" style={{ width: '100%' }} />
      </div>

      <div className="text-center">
        {/* Success icon */}
        <IconCheckCircle size={48} className="text-[#005485] mx-auto mb-2" />
        <h2 className="text-[22px] font-bold mb-4">
          {name}, ваш запит прийнято!
        </h2>
      </div>

      {/* Details card */}
      <div className="bg-white rounded-[10px] border border-gray-200 p-4 mb-3">
        <div className="text-sm font-semibold text-[#005485] mb-3">Деталі запису</div>
        <div className="text-[13px] leading-[2]">
          <div>
            <span className="text-gray-500">Програма:</span>{' '}
            {selectedProgram?.name_ua}
          </div>
          <div>
            <span className="text-gray-500">Вартість:</span>{' '}
            {price.toLocaleString('uk-UA')} грн
          </div>
          {branch && (
            <div>
              <span className="text-gray-500">Філія:</span>{' '}
              {branch.name_ua}
            </div>
          )}
        </div>
      </div>

      {/* What's next card */}
      <div className="bg-[#f0f7ff] rounded-[10px] border border-[#d0e4f5] p-4 mb-4">
        <div className="text-sm font-semibold text-[#005485] mb-2">Що далі</div>
        <div className="space-y-2.5">
          <div className="flex items-start gap-2.5 text-[13px] text-gray-700">
            <IconPhone size={16} className="text-[#005485] shrink-0 mt-0.5" />
            <span>Консультант зв'яжеться з вами протягом робочого дня</span>
          </div>
          <div className="flex items-start gap-2.5 text-[13px] text-gray-700">
            <IconFolder size={16} className="text-[#005485] shrink-0 mt-0.5" />
            <span>Ви отримаєте інструкцію з підготовки до обстеження</span>
          </div>
          <div className="flex items-start gap-2.5 text-[13px] text-gray-700">
            <IconCalendar size={16} className="text-[#005485] shrink-0 mt-0.5" />
            <span>Разом оберете зручну дату та час</span>
          </div>
        </div>
      </div>

      {/* Reset */}
      <div className="text-center">
        <button
          onClick={reset}
          className="bg-transparent border-none text-gray-400 text-xs cursor-pointer"
        >
          ↻ Пройти заново
        </button>
      </div>
    </div>
  );
}
