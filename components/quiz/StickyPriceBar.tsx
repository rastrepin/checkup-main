'use client';

import { useQuiz } from './QuizContext';

export default function StickyPriceBar() {
  const { phase, selectedProgram, setPhase } = useQuiz();

  // Show only after roadmap
  const visible = phase === 'roadmap' || phase === 'branch' || phase === 'contacts';
  if (!visible || !selectedProgram) return null;

  const price = selectedProgram.price_discount;
  const total =
    (selectedProgram.consultations_count || 0) +
    (selectedProgram.analyses_count || 0) +
    (selectedProgram.diagnostics_count || 0);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div className="max-w-[480px] mx-auto bg-white border-t-2 border-gray-200 px-4 py-3 flex items-center justify-between">
        <div>
          <div className="text-[11px] text-gray-500">{total} досліджень</div>
          <div className="text-[22px] font-extrabold text-[#005485]">
            {price.toLocaleString('uk-UA')} грн
          </div>
        </div>
        <button
          onClick={() => {
            if (phase === 'roadmap') setPhase('branch');
            else if (phase === 'branch') setPhase('contacts');
          }}
          className="bg-[#d60242] text-white px-6 py-3 rounded-[10px] text-sm font-semibold cursor-pointer hover:bg-[#b80238] transition-colors"
        >
          Записатися
        </button>
      </div>
    </div>
  );
}
