'use client';

import { useState } from 'react';
import { useQuiz } from './QuizContext';
import { IconRoute, IconChevronDown } from './icons';
import { TAG_ICONS } from './icons';

const TAG_NOTES: Record<string, string> = {
  fatigue: 'Зверніть увагу терапевта на показники ТТГ, феритин та вітамін D. При потребі — направлення до ендокринолога.',
  headache: 'Дуплексне сканування судин шиї покаже стан кровопостачання. Повідомте терапевту про характер болю.',
  back: 'Повідомте терапевту — при потребі направить до ортопеда або невролога. Базові аналізи виключать запальні процеси.',
  stomach: 'УЗД черевної порожнини покаже стан органів ШКТ. Терапевт оцінить потребу в гастроскопії.',
  heart: 'ЕКГ та аналізи (входять) дадуть базову картину. Ліпідограма покаже судинні ризики.',
  hormones: 'Аналіз ТТГ (входить) — базова оцінка. Терапевт може рекомендувати розширену гормональну панель.',
  skin: 'Випадіння волосся та шкірні проблеми часто пов\'язані з ТТГ та ЗАК (вже в програмі). Терапевт оцінить.',
};

export default function RoadmapResult() {
  const { phase, gender, age, tags, selectedProgram, setPhase } = useQuiz();
  const [visit1Open, setVisit1Open] = useState(true);
  const [visit2Open, setVisit2Open] = useState(false);

  if (phase !== 'roadmap') return null;

  const focusTags = tags.filter(t => t !== 'checkup');
  const programName = selectedProgram ? selectedProgram.name_ua : '';
  const price = selectedProgram ? selectedProgram.price_discount : 0;
  const priceRegular = selectedProgram ? selectedProgram.price_regular : 0;
  const discount = priceRegular > 0 ? Math.round((1 - price / priceRegular) * 100) : 0;

  const genderLabel = gender === 'female' ? 'жінок' : 'чоловіків';
  const ageLabel = age === 'do-30' ? 'до 30' : age === '50+' ? 'від 50' : age;

  return (
    <div>
      {/* Progress bar */}
      <div className="h-[3px] bg-gray-100 mb-5">
        <div className="h-[3px] bg-[#04D3D9] transition-[width] duration-300" style={{ width: '45%' }} />
      </div>

      {/* Header */}
      <div className="text-center mb-5">
        <IconRoute size={28} className="text-[#005485] mx-auto mb-1" />
        <h2 className="text-xl font-bold mb-1">Ваша дорожня карта</h2>
        <p className="text-[13px] text-gray-500 m-0">
          Повне обстеження для {genderLabel} ({ageLabel} р.)
        </p>
      </div>

      {/* Visit 1 */}
      <div className="bg-white rounded-[10px] border border-gray-200 mb-2 overflow-hidden">
        <button
          onClick={() => setVisit1Open(!visit1Open)}
          className="w-full flex items-center gap-3 p-3.5 cursor-pointer bg-transparent border-none text-left"
        >
          <div className="w-7 h-7 rounded-full bg-[#005485] text-white flex items-center justify-center text-sm font-bold shrink-0">1</div>
          <div className="flex-1">
            <div className="text-[15px] font-bold">Перший візит</div>
            <div className="text-xs text-gray-500">Ранок, до 3 годин · натщесерце</div>
          </div>
          <IconChevronDown
            size={16}
            className={`text-gray-300 transition-transform duration-200 ${visit1Open ? 'rotate-180' : ''}`}
          />
        </button>

        {visit1Open && (
          <div className="px-3.5 pb-3.5 pt-0">
            <div className="border-t border-gray-100 pt-3 text-[13px] text-gray-700 leading-relaxed">
              <div className="mb-2">
                <span className="font-semibold">Забір крові:</span> загальний аналіз, глюкоза, біохімія, тиреоїдний пакет, вітамін D
              </div>
              <div className="mb-2">
                <span className="font-semibold">Діагностика:</span> ЕКГ, УЗД (черевна порожнина, нирки, щитоподібна залоза
                {gender === 'female' ? ', малий таз, молочні залози' : ', простата'})
              </div>
              <div>
                <span className="font-semibold">
                  {gender === 'female' ? 'Гінеколог:' : 'Уролог:'}
                </span>
                {gender === 'female'
                  ? ' огляд, мазки, ПАП-тест, кольпоскопія'
                  : ' огляд з доплерографією, мікроскопія секрету простати'}
              </div>
            </div>

            {/* Tag notes */}
            {focusTags.length > 0 && focusTags.some(t => TAG_NOTES[t]) && (
              <div className="mt-3 p-3 bg-[#fffbeb] rounded-lg border border-[#fde68a]">
                <div className="text-xs font-bold text-[#92400e] mb-1.5">
                  За вашими відмітками:
                </div>
                {focusTags.map(t => {
                  const note = TAG_NOTES[t];
                  if (!note) return null;
                  const Icon = TAG_ICONS[t];
                  return (
                    <div key={t} className="text-xs text-[#78350f] leading-relaxed mb-1.5 flex items-start gap-1.5">
                      {Icon && <Icon size={14} className="text-[#92400e] shrink-0 mt-0.5" />}
                      <span>{note}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Visit 2 */}
      <div className="bg-white rounded-[10px] border border-gray-200 mb-4 overflow-hidden">
        <button
          onClick={() => setVisit2Open(!visit2Open)}
          className="w-full flex items-center gap-3 p-3.5 cursor-pointer bg-transparent border-none text-left"
        >
          <div className="w-7 h-7 rounded-full bg-[#04D3D9] text-white flex items-center justify-center text-sm font-bold shrink-0">2</div>
          <div className="flex-1">
            <div className="text-[15px] font-bold">Другий візит</div>
            <div className="text-xs text-gray-500">Через 5-7 днів · до 1 години</div>
          </div>
          <IconChevronDown
            size={16}
            className={`text-gray-300 transition-transform duration-200 ${visit2Open ? 'rotate-180' : ''}`}
          />
        </button>

        {visit2Open && (
          <div className="px-3.5 pb-3.5 pt-0">
            <div className="border-t border-gray-100 pt-3 text-[13px] text-gray-700 leading-relaxed">
              <span className="font-semibold">Терапевт:</span> аналіз всіх результатів, висновок, рекомендації, індивідуальний план профілактики. Можливо онлайн.
            </div>
          </div>
        )}
      </div>

      {/* Program info */}
      <div className="bg-white rounded-[10px] border border-gray-200 p-4 mb-4">
        <div className="text-[13px] font-bold uppercase tracking-[0.05em] text-[#005485] mb-2">
          Програма
        </div>
        <div className="text-[15px] font-semibold mb-1">{programName}</div>
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold text-[#005485]">{price.toLocaleString('uk-UA')} грн</span>
          {discount > 0 && (
            <>
              <span className="text-sm text-gray-400 line-through">{priceRegular.toLocaleString('uk-UA')} грн</span>
              <span className="text-xs font-semibold text-[#d60242] bg-red-50 px-1.5 py-0.5 rounded">-{discount}%</span>
            </>
          )}
        </div>
        {selectedProgram && (
          <div className="text-xs text-gray-500 mt-1">
            {selectedProgram.consultations_count} консультацій · {selectedProgram.analyses_count} аналізів · {selectedProgram.diagnostics_count} досліджень
          </div>
        )}
      </div>

      {/* CTA */}
      <button
        onClick={() => setPhase('branch')}
        className="w-full py-4 bg-[#d60242] text-white rounded-[10px] text-base font-semibold cursor-pointer hover:bg-[#b80238] transition-colors"
      >
        Обрати філію та записатися
      </button>

      <div className="text-center mt-3">
        <button
          onClick={() => {
            // Reset to quiz start
            // QuizContext reset handled by parent
          }}
          className="bg-transparent border-none text-gray-400 text-xs cursor-pointer"
        >
          ↻ Пройти заново
        </button>
      </div>
    </div>
  );
}
