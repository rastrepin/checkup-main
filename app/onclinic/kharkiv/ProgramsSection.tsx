'use client';

import { useState } from 'react';
import BookingModal from '@/components/onclinic/BookingModal';
import type { CheckupProgram } from '@/lib/types';

interface Branch {
  id: string;
  name_ua: string;
  address_ua: string;
}

interface Props {
  programs: CheckupProgram[];
  branches: Branch[];
}

const AGE_OPTIONS = [
  { label: 'до 30', values: ['do-30', 'any'] },
  { label: '30-40', values: ['30-40'] },
  { label: '40-50', values: ['40-50', 'after-40'] },
  { label: 'від 50', values: ['50+'] },
];

function fmt(n: number) { return n.toLocaleString('uk-UA'); }
function pct(r: number, s: number) { return Math.round((1 - s / r) * 100); }

export default function ProgramsSection({ programs, branches }: Props) {
  const [gender, setGender] = useState<'female' | 'male'>('female');
  const [ageIdx, setAgeIdx] = useState(0);
  const [modal, setModal] = useState<{ programName: string; price: number } | null>(null);

  const ageValues = AGE_OPTIONS[ageIdx].values;

  const filtered = programs.filter((p: any) =>
    p.gender === gender && ageValues.includes(p.age_group)
  );

  return (
    <>
      {/* Gender toggle */}
      <div className="flex border-[1.5px] border-gray-200 rounded-[10px] overflow-hidden mb-3">
        {(['female', 'male'] as const).map(g => (
          <button key={g} onClick={() => setGender(g)}
            className={`flex-1 py-2.5 text-[13px] font-semibold transition-colors ${
              gender === g ? 'bg-[#005485] text-white' : 'bg-white text-gray-500 hover:bg-gray-50'
            }`}>
            {g === 'female' ? 'Для жінок' : 'Для чоловіків'}
          </button>
        ))}
      </div>

      {/* Age pills */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {AGE_OPTIONS.map((opt, i) => (
          <button key={i} onClick={() => setAgeIdx(i)}
            className={`px-3.5 py-2 text-[13px] font-semibold rounded-[20px] border-[1.5px] transition-all ${
              ageIdx === i
                ? 'border-[#005485] bg-[#e8f4fd] text-[#005485]'
                : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
            }`}>
            {opt.label}
          </button>
        ))}
      </div>

      {/* Program cards */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map((p: any) => {
            const d = pct(p.price_regular, p.price_discount);
            return (
              <div key={p.id} className="bg-white border-[1.5px] border-gray-200 rounded-[12px] p-5 hover:border-[#005485] transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="text-[10px] font-bold tracking-wider uppercase text-[#005485]">Програма ОН Клінік</div>
                  {d > 0 && <span className="text-[11px] font-bold text-[#d60242] bg-red-50 px-2 py-0.5 rounded-full">-{d}%</span>}
                </div>
                <h3 className="text-[16px] font-bold text-[#0b1a24] mb-1 leading-snug">{p.name_ua}</h3>
                <div className="text-[13px] text-gray-500 mb-3">
                  {[
                    p.consultations_count ? `${p.consultations_count} консульт.` : null,
                    p.analyses_count ? `${p.analyses_count} аналізів` : null,
                    p.diagnostics_count ? `${p.diagnostics_count} досліджень` : null,
                  ].filter(Boolean).join(' · ')}
                </div>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-[22px] font-bold text-[#005485]">{fmt(p.price_discount)} грн</span>
                  {d > 0 && <span className="text-[14px] text-gray-300 line-through">{fmt(p.price_regular)}</span>}
                </div>
                <button
                  onClick={() => setModal({ programName: p.name_ua, price: p.price_discount })}
                  className="block w-full text-center py-3 rounded-[10px] bg-[#005485] text-white font-semibold text-[14px] hover:bg-[#004470] transition-colors mb-2"
                >
                  Записатися
                </button>
                <a href={`https://onclinic.check-up.in.ua/kharkiv/checkup/${p.slug}`}
                  className="block text-center text-[13px] text-[#005485] hover:underline">
                  Склад програми →
                </a>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-gray-400 text-sm py-6 text-center">Програми для цієї групи незабаром з'являться.</p>
      )}

      <p className="text-[11px] text-gray-300 mt-3">Ціни перевірено: квітень 2026</p>

      {modal && (
        <BookingModal
          isOpen={true}
          onClose={() => setModal(null)}
          programName={modal.programName}
          price={modal.price}
          branches={branches}
        />
      )}
    </>
  );
}
