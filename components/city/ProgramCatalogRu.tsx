'use client';

import { useState } from 'react';
import type { CheckupProgram } from '@/lib/types';

interface Props { programs: CheckupProgram[] }

function fmt(n: number) { return n.toLocaleString('uk-UA'); }
function disc(r: number, s: number) { return Math.round((1 - s / r) * 100); }

function ProgramCard({ program, onBook }: { program: CheckupProgram; onBook: () => void }) {
  const pct = disc(program.price_regular, program.price_discount);
  return (
    <div className="bg-white border border-gray-200 rounded-[10px] p-5">
      <div className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full bg-[#e8f4fd] text-[#005485] mb-3">
        Программа ОН Клиник
      </div>
      <h3 className="text-base font-bold text-[#0b1a24] mb-1 leading-snug">{program.name_ru}</h3>
      <p className="text-[13px] text-gray-500 mb-3">
        {program.age_group === 'after-40' ? 'От 40 лет' : 'Любой возраст'}
      </p>
      <div className="flex items-baseline gap-2 mb-3">
        <span className="text-xl font-bold">{fmt(program.price_discount)} грн</span>
        {pct > 0 && (
          <>
            <span className="text-sm text-gray-400 line-through">{fmt(program.price_regular)}</span>
            <span className="text-xs font-bold text-white bg-[#d60242] px-1.5 py-0.5 rounded">-{pct}%</span>
          </>
        )}
      </div>
      <p className="text-[13px] text-gray-500 mb-4">
        {[
          program.consultations_count ? `${program.consultations_count} консультаций` : null,
          program.analyses_count ? `${program.analyses_count} анализов` : null,
          program.diagnostics_count ? `${program.diagnostics_count} исследований` : null,
        ].filter(Boolean).join(' · ')}
      </p>
      <button onClick={onBook} className="w-full py-3 rounded-[10px] bg-[#005485] text-white font-semibold text-sm hover:bg-[#004470] transition-colors">
        Записаться
      </button>
      <a href={`https://onclinic.check-up.in.ua/kharkiv/checkup/${program.slug}`} className="block text-center text-[13px] text-[#005485] mt-2.5 hover:underline">
        Подробнее →
      </a>
    </div>
  );
}

export default function ProgramCatalogRu({ programs }: Props) {
  const [gender, setGender] = useState<'female' | 'male'>('female');
  const [specOpen, setSpecOpen] = useState(false);
  const main = programs.filter(p => p.gender === gender && !p.is_specialized);
  const specialized = programs.filter(p => p.is_specialized);

  return (
    <section className="mb-14">
      <h2 className="text-2xl font-bold text-[#0b1a24] mb-1">Программы комплексного обследования в Харькове</h2>
      <p className="text-gray-500 text-sm mb-5">Сравните программы и выберите оптимальный вариант</p>
      <div className="flex gap-2 mb-6">
        {(['female', 'male'] as const).map(g => (
          <button key={g} onClick={() => setGender(g)}
            className={`px-5 py-2.5 rounded-[40px] text-sm font-semibold border-2 transition-all ${gender === g ? 'bg-[#005485] text-white border-[#005485]' : 'bg-white text-[#005485] border-[#005485] hover:bg-[#f0f7ff]'}`}>
            {g === 'female' ? 'Для женщин' : 'Для мужчин'}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {main.map(p => <ProgramCard key={p.id} program={p} onBook={() => { const el = document.getElementById('quiz'); el?.scrollIntoView({ behavior: 'smooth' }); }} />)}
      </div>
      {specialized.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-[10px] px-4 py-3 mb-4 text-sm text-amber-900">
          <strong>Есть конкретная жалоба?</strong> Рассмотрите специализированные программы — они сосредоточены на одной системе организма.
        </div>
      )}
      {specialized.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-[10px] overflow-hidden">
          <button onClick={() => setSpecOpen(!specOpen)}
            className="w-full flex items-center justify-between px-5 py-4 text-left text-sm font-semibold text-[#0b1a24] hover:bg-gray-50">
            Специализированные программы
            <svg className={`w-4 h-4 text-gray-400 transition-transform ${specOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {specOpen && (
            <div className="px-5 pb-2">
              {specialized.map(p => (
                <div key={p.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div>
                    <div className="text-sm font-semibold">{p.name_ru}</div>
                    <div className="text-xs text-gray-500">{[p.consultations_count && `${p.consultations_count} консульт.`, p.analyses_count && `${p.analyses_count} анализов`].filter(Boolean).join(' · ')}</div>
                  </div>
                  <div className="text-right ml-4 shrink-0">
                    <div className="text-sm font-bold">{fmt(p.price_discount)} грн</div>
                    <a href={`https://onclinic.check-up.in.ua/kharkiv/checkup/${p.slug}`} className="text-xs text-[#005485] hover:underline">Подробнее →</a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      <p className="text-xs text-gray-400 mt-3">Цены проверены: апрель 2026</p>
    </section>
  );
}
