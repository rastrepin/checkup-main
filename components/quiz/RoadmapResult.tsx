'use client';

import { useState } from 'react';
import { useQuiz } from './QuizContext';
import { IconRoute, IconChevronDown } from './icons';
import { TAG_ICONS } from './icons';

interface Props {
  city?: string;
}

const TAG_NOTES: Record<string, string> = {
  fatigue: 'Програма включає ТТГ та загальний аналіз крові для оцінки стану щитовидної залози та загального самопочуття.',
  headache: 'Програма включає ЕКГ та ліпідограму. Повідомте терапевту про характер болю — він оцінить, чи потрібне додаткове обстеження.',
  back: 'Програма включає базові аналізи та консультацію терапевта. Розкажіть про скарги — він оцінить, чи потрібне направлення до спеціаліста.',
  stomach: 'Програма включає УЗД черевної порожнини — терапевт оцінить результати та дасть рекомендації.',
  heart: 'Програма включає ЕКГ та ліпідограму для оцінки серцево-судинних ризиків.',
  hormones: 'Програма включає ТТГ — базова оцінка функції щитовидної залози. Терапевт оцінить результати та при потребі направить до ендокринолога.',
  skin: 'Програма включає ТТГ та загальний аналіз крові — часто шкірні та волосяні зміни пов\'язані з цими показниками.',
};

function fmt(n: number) {
  return n.toLocaleString('uk-UA');
}

function discountPct(regular: number, sale: number) {
  if (regular <= sale) return 0;
  return Math.round((1 - sale / regular) * 100);
}

export default function RoadmapResult({ city = 'kharkiv' }: Props) {
  const {
    phase, gender, age, tags,
    standardProgram, clinicProgram, chosenProgramType,
    setChosenProgramType, setPhase,
  } = useQuiz();

  const [visit1Open, setVisit1Open] = useState(true);
  const [visit2Open, setVisit2Open] = useState(false);
  const [stdOpen, setStdOpen] = useState(false);
  const [clinicOpen, setClinicOpen] = useState(false);

  if (phase !== 'roadmap') return null;

  const focusTags = tags.filter(t => t !== 'checkup');
  const genderLabel = gender === 'female' ? 'жінок' : 'чоловіків';
  const ageLabel = age === 'do-30' ? 'до 30' : age === '50+' ? 'від 50' : age;
  const canProceed = chosenProgramType !== null;

  // Standard card subtitle
  const stdSpecialists = gender === 'female' ? 'Терапевт, гінеколог' : 'Терапевт';
  const stdSubtitle = `${stdSpecialists} · 2 візити`;

  // Clinic card subtitle
  const clinicSubtitle = clinicProgram
    ? [
        clinicProgram.consultations_count ? `${clinicProgram.consultations_count} спеціалістів` : null,
        clinicProgram.diagnostics_count ? `${clinicProgram.diagnostics_count} досліджень` : null,
      ].filter(Boolean).join(' · ')
    : '';

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
                <span className="font-semibold">Забір крові:</span> загальний аналіз, глюкоза, біохімія, ліпідограма, ТТГ
              </div>
              <div className="mb-2">
                <span className="font-semibold">Діагностика:</span> ЕКГ, УЗД (черевна порожнина, нирки, щитоподібна залоза
                {gender === 'female' ? ', малий таз, молочні залози' : ''})
              </div>
              <div>
                <span className="font-semibold">
                  {gender === 'female' ? 'Гінеколог:' : 'Спеціаліст:'}
                </span>
                {gender === 'female'
                  ? ' огляд, мазки, ПАП-тест'
                  : ' консультація терапевта (або уролога для 40+) — оцінка результатів'}
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
      <div className="bg-white rounded-[10px] border border-gray-200 mb-5 overflow-hidden">
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
              <span className="font-semibold">Терапевт:</span> аналіз всіх результатів, висновок, рекомендації, індивідуальний план профілактики.
            </div>
          </div>
        )}
      </div>

      {/* === Program selection === */}
      <div className="text-[11px] font-bold tracking-widest uppercase text-gray-500 mb-3">
        Оберіть програму
      </div>

      {/* Standard program card */}
      {standardProgram && (
        <div
          role="radio"
          aria-checked={chosenProgramType === 'standard'}
          tabIndex={0}
          onClick={() => setChosenProgramType('standard')}
          onKeyDown={e => e.key === 'Enter' && setChosenProgramType('standard')}
          className={`cursor-pointer rounded-[10px] border-2 mb-3 transition-all duration-150 ${
            chosenProgramType === 'standard'
              ? 'border-[#005485] bg-[#e8f4fd]'
              : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
        >
          {/* Clickable card body */}
          <div className="p-4">
            <div className="flex items-start justify-between gap-2 mb-1">
              <span className="text-[10px] font-bold tracking-widest uppercase text-[#005485]">
                Стандарт
              </span>
              {chosenProgramType === 'standard' && (
                <span className="w-5 h-5 rounded-full bg-[#005485] flex items-center justify-center shrink-0">
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              )}
            </div>
            <div className="text-sm font-semibold text-[#0b1a24] mb-0.5 leading-snug">{standardProgram.name_ua}</div>
            <div className="text-xs text-gray-500 mb-2">{stdSubtitle}</div>
            <div className="text-lg font-bold text-[#005485]">
              {fmt(standardProgram.price_discount)} грн
            </div>
          </div>

          {/* "Що входить ↓" toggle — stops card-click propagation */}
          <div
            className="px-4 pb-3 pt-2 border-t border-gray-100"
            onClick={e => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setStdOpen(v => !v)}
              className="text-xs font-semibold text-[#005485] bg-transparent border-none cursor-pointer p-0"
            >
              {stdOpen ? 'Що входить ↑' : 'Що входить ↓'}
            </button>
            {stdOpen && (
              <div className="mt-2 text-xs text-gray-600 space-y-1 leading-relaxed">
                {standardProgram.consultations_count ? (
                  <div>• {standardProgram.consultations_count} консультації ({gender === 'female' ? 'терапевт, гінеколог' : 'терапевт'})</div>
                ) : null}
                {standardProgram.analyses_count ? (
                  <div>• {standardProgram.analyses_count} аналізів (загальний аналіз крові, глюкоза, біохімія, ліпідограма, ТТГ)</div>
                ) : null}
                {standardProgram.diagnostics_count ? (
                  <div>• {standardProgram.diagnostics_count} досліджень (ЕКГ, УЗД{gender === 'female' ? ', молочні залози, малий таз' : ''})</div>
                ) : null}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Clinic program card */}
      {clinicProgram && (
        <div
          role="radio"
          aria-checked={chosenProgramType === 'clinic'}
          tabIndex={0}
          onClick={() => setChosenProgramType('clinic')}
          onKeyDown={e => e.key === 'Enter' && setChosenProgramType('clinic')}
          className={`cursor-pointer rounded-[10px] border-2 mb-5 transition-all duration-150 ${
            chosenProgramType === 'clinic'
              ? 'border-[#005485] bg-[#e8f4fd]'
              : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
        >
          {/* Clickable card body */}
          <div className="p-4">
            <div className="flex items-start justify-between gap-2 mb-1">
              <span className="text-[10px] font-bold tracking-widest uppercase text-gray-500">
                Програма ОН Клінік
              </span>
              <div className="flex items-center gap-1.5 shrink-0">
                {discountPct(clinicProgram.price_regular, clinicProgram.price_discount) > 0 && (
                  <span className="text-[10px] font-bold text-[#d60242] bg-red-50 px-1.5 py-0.5 rounded-full">
                    -{discountPct(clinicProgram.price_regular, clinicProgram.price_discount)}%
                  </span>
                )}
                {chosenProgramType === 'clinic' && (
                  <span className="w-5 h-5 rounded-full bg-[#005485] flex items-center justify-center">
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                )}
              </div>
            </div>
            <div className="text-sm font-semibold text-[#0b1a24] mb-0.5 leading-snug">{clinicProgram.name_ua}</div>
            {clinicSubtitle && (
              <div className="text-xs text-gray-500 mb-2">{clinicSubtitle}</div>
            )}
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-[#005485]">
                {fmt(clinicProgram.price_discount)} грн
              </span>
              {clinicProgram.price_regular > clinicProgram.price_discount && (
                <span className="text-sm text-gray-400 line-through">
                  {fmt(clinicProgram.price_regular)} грн
                </span>
              )}
            </div>
          </div>

          {/* "Що входить ↓" toggle */}
          <div
            className="px-4 pb-3 pt-2 border-t border-gray-100"
            onClick={e => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setClinicOpen(v => !v)}
              className="text-xs font-semibold text-[#005485] bg-transparent border-none cursor-pointer p-0"
            >
              {clinicOpen ? 'Що входить ↑' : 'Що входить ↓'}
            </button>
            {clinicOpen && (
              <div className="mt-2 text-xs text-gray-600 space-y-1 leading-relaxed">
                {clinicProgram.consultations_count ? (
                  <div>• {clinicProgram.consultations_count} спеціалістів</div>
                ) : null}
                {clinicProgram.analyses_count ? (
                  <div>• {clinicProgram.analyses_count} аналізів</div>
                ) : null}
                {clinicProgram.diagnostics_count ? (
                  <div>• {clinicProgram.diagnostics_count} досліджень</div>
                ) : null}
                <a
                  href={`https://onclinic.check-up.in.ua/${city}/checkup/${clinicProgram.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-[#005485] underline mt-1"
                >
                  Детальніше на сайті клініки →
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Fallback: neither loaded */}
      {!standardProgram && !clinicProgram && (
        <div className="text-sm text-gray-400 text-center py-4 mb-4">
          Програми завантажуються...
        </div>
      )}

      {/* CTA — navy, disabled until program chosen */}
      <button
        onClick={() => canProceed && setPhase('branch')}
        disabled={!canProceed}
        className={`w-full py-4 rounded-[10px] text-base font-semibold text-white transition-colors ${
          canProceed
            ? 'bg-[#005485] cursor-pointer hover:bg-[#003d66]'
            : 'bg-[#d1d5db] cursor-default'
        }`}
      >
        {canProceed ? 'Обрати філію та записатися' : 'Оберіть програму вище'}
      </button>

      <div className="text-center mt-3">
        <button
          type="button"
          onClick={() => setPhase('tags')}
          className="bg-transparent border-none text-gray-400 text-xs cursor-pointer"
        >
          ↻ Пройти заново
        </button>
      </div>
    </div>
  );
}
