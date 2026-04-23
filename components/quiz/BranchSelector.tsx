'use client';

import { useQuiz } from './QuizContext';
import { IconMapPin, IconTrain, IconClock } from './icons';

export default function BranchSelector() {
  const { phase, branches, selectedBranchId, setSelectedBranchId, setPhase } = useQuiz();

  if (phase !== 'branch') return null;

  const selectedBranch = branches.find(b => b.id === selectedBranchId);

  return (
    <div>
      {/* Progress bar */}
      <div className="h-[3px] bg-gray-100 mb-5">
        <div className="h-[3px] bg-[#04D3D9] transition-[width] duration-300" style={{ width: '65%' }} />
      </div>

      <button
        onClick={() => setPhase('roadmap')}
        className="text-[#005485] text-sm py-2 mb-2 cursor-pointer bg-transparent border-none"
      >
        &larr; Дорожня карта
      </button>

      <h2 className="text-lg font-bold mb-4">Оберіть зручну філію</h2>

      <div className="space-y-2">
        {branches.map(branch => {
          const selected = selectedBranchId === branch.id;
          const schedule = branch.schedule as { mon_fri: string; sat: string; sun: string };
          return (
            <button
              key={branch.id}
              onClick={() => setSelectedBranchId(branch.id)}
              className={`w-full text-left p-4 rounded-[10px] border-2 transition-all duration-150 ${selected
                ? 'border-[#005485] bg-[#e8f4fd]'
                : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
            >
              <div className="font-semibold text-sm mb-1">{branch.name_ua}</div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                <IconMapPin size={14} className="shrink-0" />
                <span>{branch.address_ua}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <IconTrain size={14} className="shrink-0" />
                <span>{branch.metro_ua}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected branch schedule */}
      {selectedBranch && (
        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 mb-1">
            <IconClock size={14} />
            Графік роботи
          </div>
          <div className="text-xs text-gray-500 leading-relaxed">
            <div>Пн-Пт: {(selectedBranch.schedule as { mon_fri: string }).mon_fri}</div>
            <div>Сб: {(selectedBranch.schedule as { sat: string }).sat}</div>
            <div>Нд: {(selectedBranch.schedule as { sun: string }).sun}</div>
          </div>
        </div>
      )}

      {/* CTA */}
      <button
        onClick={() => setPhase('contacts')}
        disabled={!selectedBranchId}
        className={`w-full py-4 mt-4 rounded-[10px] text-base font-semibold text-white transition-colors ${selectedBranchId
          ? 'bg-[#005485] cursor-pointer hover:bg-[#004470]'
          : 'bg-[#d1d5db] cursor-default'
          }`}
      >
        Далі — контактні дані
      </button>
    </div>
  );
}
