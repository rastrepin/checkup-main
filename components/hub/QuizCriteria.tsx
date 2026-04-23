'use client';

const CRITERIA_OPTIONS = [
  { id: 'experience', label: 'Досвід лікаря саме з моєю проблемою' },
  { id: 'explanation', label: 'Зрозуміле пояснення на кожному кроці' },
  { id: 'price', label: 'Знати ціну наперед, без сюрпризів' },
  { id: 'noqueue', label: 'Без черг та очікування' },
  { id: 'reviews', label: 'Відгуки від людей у схожій ситуації' },
  { id: 'location', label: 'Зручно дістатися' },
  { id: 'comfort', label: 'Комфортна обстановка' },
  { id: 'result', label: 'Чіткий план дій після візиту' },
];

const MAX_CRITERIA = 3;

interface QuizCriteriaProps {
  selected: string[];
  onChange: (criteria: string[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function QuizCriteria({ selected, onChange, onNext, onBack }: QuizCriteriaProps) {
  const toggle = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id));
    } else if (selected.length < MAX_CRITERIA) {
      onChange([...selected, id]);
    }
  };

  const isMaxReached = selected.length >= MAX_CRITERIA;

  return (
    <div>
      {/* Progress bar — 100% (це фінальний крок перед результатом) */}
      <div className="h-[3px] bg-gray-100 mb-5">
        <div className="h-[3px] bg-[#04D3D9] w-full" />
      </div>

      <h3 className="text-[20px] font-bold text-[#0b1a24] mb-1 leading-snug">
        Що для вас найважливіше у виборі клініки?
      </h3>
      <p className="text-[13px] text-gray-500 mb-4">
        Оберіть до трьох пунктів — ми врахуємо їх у рекомендації
      </p>

      {/* Criteria pills */}
      <div className="flex flex-wrap gap-2 mb-5">
        {CRITERIA_OPTIONS.map((opt) => {
          const isSelected = selected.includes(opt.id);
          const isDisabled = !isSelected && isMaxReached;
          return (
            <button
              key={opt.id}
              type="button"
              disabled={isDisabled}
              onClick={() => toggle(opt.id)}
              className={`px-4 py-2.5 rounded-[40px] border-2 text-[14px] transition-colors ${
                isSelected
                  ? 'border-[#005485] bg-[#e8f4fd] text-[#005485] font-semibold'
                  : isDisabled
                  ? 'border-gray-200 bg-gray-50 text-gray-300 cursor-not-allowed'
                  : 'border-gray-200 bg-white text-[#0b1a24] hover:border-gray-300 cursor-pointer'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {isMaxReached && (
        <p className="text-[12px] text-[#005485] mb-3">
          Вибрано максимум {MAX_CRITERIA} пункти
        </p>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="text-[14px] text-[#005485] bg-none border-none cursor-pointer py-2"
        >
          ← Назад
        </button>
        <button
          type="button"
          onClick={onNext}
          className="flex-1 py-4 bg-[#d60242] text-white text-[15px] font-semibold rounded-[10px] hover:bg-[#b5003a] transition-colors cursor-pointer"
        >
          Отримати рекомендацію
        </button>
      </div>
    </div>
  );
}
