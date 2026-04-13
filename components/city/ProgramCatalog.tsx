'use client';

import { useState } from 'react';
import type { CheckupProgram } from '@/lib/types';

interface Props {
  programs: CheckupProgram[];
}

type AgeKey = 'до 30' | '30-40' | '40-50' | 'від 50';
type GenderKey = 'female' | 'male';

function fmt(n: number) {
  return n.toLocaleString('uk-UA');
}

function discount(regular: number, sale: number) {
  if (regular <= sale) return 0;
  return Math.round((1 - sale / regular) * 100);
}

// Age pill → DB age_group values
const AGE_FILTER: Record<AgeKey, string[]> = {
  'до 30': ['do-30', 'any'],
  '30-40': ['30-40', 'any'],
  '40-50': ['after-40', '40-50', 'any'],
  'від 50': ['after-40', '50+', 'any'],
};

// Micro-descriptions per gender+age (Fix 1.5)
const MICRO: Record<GenderKey, Record<AgeKey, string>> = {
  female: {
    'до 30': "Репродуктивне здоров'я, щитовидна залоза, онкоскринінг шийки матки, молочні залози",
    '30-40': 'Гормональний баланс, серцево-судинні ризики, онкоскринінг, функція щитовидної залози',
    '40-50': 'Кардіодіагностика, онкоскринінг, ендокринна система, печінка та нирки, судини',
    'від 50': 'Серце та судини, ехокардіографія, онкоскринінг кишечника, гормональний статус',
  },
  male: {
    'до 30': 'Серцево-судинна система, печінка, нирки, інфекційний скринінг',
    '30-40': 'Серце, ліпідограма, печінкові та ниркові проби, щитовидна залоза',
    '40-50': 'Простата (ПСА), кардіодіагностика, ліпідограма, онкоскринінг, судини',
    'від 50': 'Простата, серце та судини, ехокардіографія, онкоскринінг кишечника, метаболічний контроль',
  },
};

// Program category detection
// Standard (Стандарт check-up.in.ua): slug matches template patterns
function isStandard(p: CheckupProgram) {
  return (
    p.slug.startsWith('first-checkup') ||
    p.slug.startsWith('male-first-checkup') ||
    p.slug.startsWith('female-first-checkup')
  );
}
function isRegular(p: CheckupProgram) {
  return (
    p.slug.startsWith('regular-checkup') ||
    p.slug.startsWith('male-regular') ||
    p.slug.startsWith('female-regular')
  );
}

function scrollToQuiz() {
  document.getElementById('quiz')?.scrollIntoView({ behavior: 'smooth' });
}

export default function ProgramCatalog({ programs }: Props) {
  const [gender, setGender] = useState<GenderKey>('female');
  const [age, setAge] = useState<AgeKey>('до 30');
  const [showRegular, setShowRegular] = useState(false);
  const [showSpec, setShowSpec] = useState(false);

  const ageValues = AGE_FILTER[age];

  function matchesFilter(p: CheckupProgram) {
    const genderOk = p.gender === gender || p.gender === null;
    const ageOk = p.age_group === null || ageValues.includes(p.age_group);
    return genderOk && ageOk;
  }

  const stdFull = programs.filter(p => !p.is_specialized && isStandard(p) && matchesFilter(p));
  const reg = programs.filter(p => !p.is_specialized && isRegular(p) && matchesFilter(p));
  const clinic = programs.filter(
    p => !p.is_specialized && !isStandard(p) && !isRegular(p) && matchesFilter(p)
  );
  const specialized = programs.filter(p => p.is_specialized && matchesFilter(p));

  return (
    <section className="mb-14" id="programs">
      <h2 className="text-xl font-bold text-[#0b1a24] mb-1">Програми обстеження</h2>
      <p className="text-sm text-gray-500 mb-5">
        Ціна включає все: аналізи, УЗД, консультації. Оберіть стать та вік.
      </p>

      {/* Gender toggle */}
      <div className="flex border-[1.5px] border-gray-200 rounded-xl overflow-hidden mb-3">
        {(['female', 'male'] as const).map(g => (
          <button
            key={g}
            onClick={() => { setGender(g); setShowRegular(false); setShowSpec(false); }}
            className={`flex-1 py-2.5 text-sm font-semibold transition-all ${
              gender === g
                ? 'bg-[#005485] text-white'
                : 'bg-white text-gray-500 hover:bg-gray-50'
            }`}
          >
            {g === 'female' ? 'Для жінок' : 'Для чоловіків'}
          </button>
        ))}
      </div>

      {/* Age pills */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {(['до 30', '30-40', '40-50', 'від 50'] as AgeKey[]).map(a => (
          <button
            key={a}
            onClick={() => { setAge(a); setShowRegular(false); setShowSpec(false); }}
            className={`px-4 py-2 text-sm font-semibold border-[1.5px] rounded-full transition-all ${
              age === a
                ? 'border-[#005485] bg-[#e8f4fd] text-[#005485]'
                : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
            }`}
          >
            {a}
          </button>
        ))}
      </div>

      {/* === СТАНДАРТ CHECK-UP.IN.UA === */}
      {(stdFull.length > 0 || reg.length > 0) && (
        <>
          <div className="text-[11px] font-bold tracking-widest uppercase text-[#005485] mb-1">
            Стандарт check-up.in.ua
          </div>
          <p className="text-xs text-gray-500 mb-3">
            Розроблена за міжнародними рекомендаціями. Однаковий склад у будь-якій клініці-партнері.
          </p>

          {stdFull.map(p => {
            const pct = discount(p.price_regular, p.price_discount);
            return (
              <div key={p.id} className="bg-white border-[1.5px] border-gray-200 rounded-xl p-5 mb-3 hover:border-[#005485] transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[10px] font-bold tracking-widest uppercase text-[#005485]">
                    Стандарт
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#0b1a24] mb-1 leading-snug">{p.name_ua}</h3>
                <p className="text-[13px] text-gray-500 mb-3">
                  {[
                    p.consultations_count ? `${p.consultations_count} консультацій` : null,
                    p.analyses_count ? `${p.analyses_count} аналізів` : null,
                    p.diagnostics_count ? `${p.diagnostics_count} досліджень` : null,
                  ].filter(Boolean).join(' · ')}
                </p>
                {/* Micro-description */}
                <div className="text-xs text-gray-700 leading-relaxed mb-4 px-3 py-2.5 bg-gray-50 rounded-lg">
                  {MICRO[gender][age]}
                </div>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-2xl font-bold text-[#005485]">{fmt(p.price_discount)} грн</span>
                  {pct > 0 && (
                    <>
                      <span className="text-sm text-gray-400 line-through">{fmt(p.price_regular)}</span>
                      <span className="text-xs font-bold text-white bg-[#d60242] px-2 py-0.5 rounded-full">-{pct}%</span>
                    </>
                  )}
                </div>
                <button
                  onClick={scrollToQuiz}
                  className="w-full py-3 rounded-xl bg-[#005485] text-white font-semibold text-sm hover:bg-[#003d66] transition-colors"
                >
                  Записатися
                </button>
              </div>
            );
          })}

          {/* Regular program toggle */}
          {reg.length > 0 && (
            <>
              <button
                onClick={() => setShowRegular(!showRegular)}
                className="text-sm text-[#005485] font-semibold py-2 mb-2"
              >
                Регулярна програма — {fmt(reg[0].price_discount)} грн {showRegular ? '↑' : '↓'}
              </button>
              {showRegular && (
                <>
                  <p className="text-xs text-gray-500 mb-2">
                    Скорочений склад для тих, хто вже проходив чекап 1-2 роки тому.
                  </p>
                  {reg.map(p => (
                    <div key={p.id} className="flex items-center justify-between bg-white border-[1.5px] border-gray-200 rounded-xl px-4 py-3 mb-2 hover:border-[#005485] transition-colors">
                      <div>
                        <p className="text-sm font-semibold text-[#0b1a24]">{p.name_ua}</p>
                        <p className="text-xs text-gray-500">Щорічний моніторинг</p>
                      </div>
                      <span className="text-base font-bold text-[#005485] ml-4 shrink-0">
                        {fmt(p.price_discount)} грн
                      </span>
                    </div>
                  ))}
                </>
              )}
            </>
          )}
        </>
      )}

      {/* === ПРОГРАМИ ОН КЛІНІК === */}
      {clinic.length > 0 && (
        <>
          <div className="h-px bg-gray-200 my-7" />
          <div className="text-[11px] font-bold tracking-widest uppercase text-gray-500 mb-1">
            Програми ОН Клінік
          </div>
          <p className="text-xs text-gray-500 mb-3">
            Розширена діагностика клініки — більше спеціалістів та досліджень.
          </p>
          {clinic.map(p => {
            const pct = discount(p.price_regular, p.price_discount);
            return (
              <div key={p.id} className="bg-white border-[1.5px] border-gray-200 rounded-xl p-5 mb-3 hover:border-[#005485] transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[10px] font-bold tracking-widest uppercase text-gray-500">
                    Програма ОН Клінік
                  </span>
                  {pct > 0 && (
                    <span className="text-xs font-bold text-[#d60242] bg-red-50 px-2 py-0.5 rounded-full">
                      -{pct}%
                    </span>
                  )}
                </div>
                <h3 className="text-base font-bold text-[#0b1a24] mb-1 leading-snug">{p.name_ua}</h3>
                <p className="text-[13px] text-gray-500 mb-3">
                  {[
                    p.consultations_count ? `${p.consultations_count} консультацій` : null,
                    p.analyses_count ? `${p.analyses_count} аналізів` : null,
                    p.diagnostics_count ? `${p.diagnostics_count} досліджень` : null,
                  ].filter(Boolean).join(' · ')}
                </p>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-2xl font-bold text-[#005485]">{fmt(p.price_discount)} грн</span>
                  {p.price_regular > p.price_discount && (
                    <span className="text-sm text-gray-400 line-through">{fmt(p.price_regular)}</span>
                  )}
                </div>
                <button
                  onClick={scrollToQuiz}
                  className="w-full py-3 rounded-xl bg-[#005485] text-white font-semibold text-sm hover:bg-[#003d66] transition-colors"
                >
                  Записатися
                </button>
                <a
                  href={`https://onclinic.check-up.in.ua/kharkiv/checkup/${p.slug}`}
                  className="block text-center text-[13px] text-[#005485] mt-2.5 hover:underline"
                >
                  Детальніше →
                </a>
              </div>
            );
          })}
        </>
      )}

      {/* === СПЕЦІАЛІЗОВАНІ === */}
      {specialized.length > 0 && (
        <>
          <div className="h-px bg-gray-200 my-7" />
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4 text-sm text-amber-900 leading-snug">
            <strong>Є конкретна скарга?</strong> Спеціалізований чекап покаже причину — серце, судини або обмін речовин.
          </div>
          <button
            onClick={() => setShowSpec(!showSpec)}
            className="text-sm text-[#005485] font-semibold py-2"
          >
            Спеціалізовані програми ({specialized.length}) {showSpec ? '↑' : '↓'}
          </button>
          {showSpec && (
            <div className="mt-2">
              {specialized.map(p => (
                <div key={p.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="text-sm font-semibold text-[#0b1a24]">{p.name_ua}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {[
                        p.consultations_count ? `${p.consultations_count} консульт.` : null,
                        p.analyses_count ? `${p.analyses_count} аналізів` : null,
                        p.diagnostics_count ? `${p.diagnostics_count} досліджень` : null,
                      ].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                  <div className="text-right ml-4 shrink-0">
                    <p className="text-sm font-bold text-[#0b1a24]">{fmt(p.price_discount)} грн</p>
                    <a
                      href={`https://onclinic.check-up.in.ua/kharkiv/checkup/${p.slug}`}
                      className="text-xs text-[#005485] hover:underline"
                    >
                      Детальніше →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* No results */}
      {stdFull.length === 0 && reg.length === 0 && clinic.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-6">
          Програм для обраних параметрів поки немає.
        </p>
      )}

      <p className="text-xs text-gray-400 mt-5">Ціни перевірено: квітень 2026</p>
    </section>
  );
}
