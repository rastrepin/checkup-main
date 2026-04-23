'use client';

import { useState } from 'react';
import type { CheckupProgram } from '@/lib/types';

interface Props {
  programs: CheckupProgram[];
}

function fmt(n: number) {
  return n.toLocaleString('uk-UA');
}

function discount(regular: number, sale: number) {
  return Math.round((1 - sale / regular) * 100);
}

function ProgramCard({ program, onBook }: { program: CheckupProgram; onBook: (gender: string) => void }) {
  const pct = discount(program.price_regular, program.price_discount);
  const gender = program.gender ?? 'any';

  return (
    <div className="bg-white border border-gray-200 rounded-[10px] p-5">
      {/* Badge */}
      <div className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full bg-[#e8f4fd] text-[#005485] mb-3">
        Програма ОН Клінік
      </div>

      {/* Name + for whom */}
      <h3 className="text-base font-bold text-[#0b1a24] mb-1 leading-snug">{program.name_ua}</h3>
      <p className="text-[13px] text-gray-500 mb-3">
        {program.age_group === 'after-40' ? 'Від 40 років' : 'Будь-який вік'}
      </p>

      {/* Price row */}
      <div className="flex items-baseline gap-2 mb-3">
        <span className="text-xl font-bold text-[#0b1a24]">{fmt(program.price_discount)} грн</span>
        {pct > 0 && (
          <>
            <span className="text-sm text-gray-400 line-through">{fmt(program.price_regular)}</span>
            <span className="text-xs font-bold text-white bg-[#d60242] px-1.5 py-0.5 rounded">-{pct}%</span>
          </>
        )}
      </div>

      {/* Composition summary */}
      <p className="text-[13px] text-gray-500 mb-4">
        {[
          program.consultations_count ? `${program.consultations_count} консультацій` : null,
          program.analyses_count ? `${program.analyses_count} аналізів` : null,
          program.diagnostics_count ? `${program.diagnostics_count} досліджень` : null,
        ].filter(Boolean).join(' · ')}
      </p>

      {/* CTA */}
      <button
        onClick={() => onBook(gender)}
        className="w-full py-3 rounded-[10px] bg-[#005485] text-white font-semibold text-sm hover:bg-[#004470] transition-colors"
      >
        Записатися
      </button>
      <a
        href={`https://onclinic.check-up.in.ua/kharkiv/checkup/${program.slug}`}
        className="block text-center text-[13px] text-[#005485] mt-2.5 hover:underline"
      >
        Детальніше →
      </a>
    </div>
  );
}

function SpecializedCard({ program }: { program: CheckupProgram }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div>
        <div className="text-sm font-semibold text-[#0b1a24]">{program.name_ua}</div>
        <div className="text-xs text-gray-500 mt-0.5">
          {[
            program.consultations_count ? `${program.consultations_count} консульт.` : null,
            program.analyses_count ? `${program.analyses_count} аналізів` : null,
            program.diagnostics_count ? `${program.diagnostics_count} досліджень` : null,
          ].filter(Boolean).join(' · ')}
        </div>
      </div>
      <div className="text-right ml-4 shrink-0">
        <div className="text-sm font-bold text-[#0b1a24]">{fmt(program.price_discount)} грн</div>
        <a
          href={`https://onclinic.check-up.in.ua/kharkiv/checkup/${program.slug}`}
          className="text-xs text-[#005485] hover:underline"
        >
          Детальніше →
        </a>
      </div>
    </div>
  );
}

export default function ProgramCatalog({ programs }: Props) {
  const [gender, setGender] = useState<'female' | 'male'>('female');
  const [specOpen, setSpecOpen] = useState(false);

  const main = programs.filter(p => p.gender === gender && !p.is_specialized);
  const specialized = programs.filter(p => p.is_specialized);

  function handleBook(programGender: string) {
    const el = document.getElementById('quiz');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <section className="mb-14">
      <h2 className="text-2xl font-bold text-[#0b1a24] mb-1">
        Програми комплексного обстеження в Харкові
      </h2>
      <p className="text-gray-500 text-sm mb-5">Порівняйте програми та оберіть оптимальний варіант</p>

      {/* Gender filter */}
      <div className="flex gap-2 mb-6">
        {(['female', 'male'] as const).map(g => (
          <button
            key={g}
            onClick={() => setGender(g)}
            className={`px-5 py-2.5 rounded-[40px] text-sm font-semibold border-2 transition-all ${
              gender === g
                ? 'bg-[#005485] text-white border-[#005485]'
                : 'bg-white text-[#005485] border-[#005485] hover:bg-[#f0f7ff]'
            }`}
          >
            {g === 'female' ? 'Для жінок' : 'Для чоловіків'}
          </button>
        ))}
      </div>

      {/* Program cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {main.map(p => (
          <ProgramCard key={p.id} program={p} onBook={handleBook} />
        ))}
      </div>

      {/* Amber block before specialized */}
      {specialized.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-[10px] px-4 py-3 mb-4 text-sm text-amber-900">
          <strong>Є конкретна скарга?</strong> Розгляньте спеціалізовані програми — вони зосереджені на одній системі організму.
        </div>
      )}

      {/* Specialized toggle */}
      {specialized.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-[10px] overflow-hidden">
          <button
            onClick={() => setSpecOpen(!specOpen)}
            className="w-full flex items-center justify-between px-5 py-4 text-left text-sm font-semibold text-[#0b1a24] hover:bg-gray-50 transition-colors"
          >
            Спеціалізовані програми
            <svg
              className={`w-4 h-4 text-gray-400 transition-transform ${specOpen ? 'rotate-180' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {specOpen && (
            <div className="px-5 pb-2">
              {specialized.map(p => <SpecializedCard key={p.id} program={p} />)}
            </div>
          )}
        </div>
      )}

      {/* Price verified note */}
      <p className="text-xs text-gray-400 mt-3">Ціни перевірено: квітень 2026</p>
    </section>
  );
}
