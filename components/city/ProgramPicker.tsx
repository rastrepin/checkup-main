'use client';

// Список програм вікової сторінки – age-page-zones v0.7.1 §6.1, §7, §8 (НОРМАТИВ 14.11, Б.4–Б.6).
// Mobile – нижня шторка «Оберіть програму»; desktop (від 1024px) – діалог по центру з тим самим складом рядків.
// Рядок: назва · клініка · ціна; порядок – як карток на сторінці; більше 4 програм – перемикач «Спочатку дешевші».
// Вибір рядка – форма запису на цю програму (BookingFlow) з «← Інша програма», що повертає до списку.
// Відкривається подією 'open-program-picker' (закріплена панель, кнопка плаваючого блоку desktop).

import { useEffect, useRef, useState } from 'react';
import { buttonClass } from '@/components/frame/Button';
import { programEvents } from '@/lib/ga4';

export interface PickerProgram {
  slug: string;
  name: string;
  clinic: string;
  price: number;
}

const fmt = (n: number) => n.toLocaleString('uk-UA');

export const OPEN_PICKER_EVENT = 'open-program-picker';

/** Відкрити список програм (панель, блок desktop, «← Інша програма» у формі). */
export function openProgramPicker(count?: number) {
  if (typeof count === 'number') programEvents.pickerOpen({ count, entry_point: 'sticky' });
  window.dispatchEvent(new CustomEvent(OPEN_PICKER_EVENT));
}

/** Crimson «Обрати програму» плаваючого блоку desktop (§6.1). */
export function OpenPickerButton({ label, count, className = '' }: { label: string; count: number; className?: string }) {
  return (
    <button type="button" onClick={() => openProgramPicker(count)} className={`${buttonClass({ variant: 'booking', size: 'lg', fullWidth: true })} ${className}`}>
      {label}
    </button>
  );
}

export default function ProgramPicker({ programs, sourceCta }: { programs: PickerProgram[]; sourceCta: string }) {
  const [open, setOpen] = useState(false);
  const [cheapFirst, setCheapFirst] = useState(false);
  const touchY = useRef<number | null>(null);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener(OPEN_PICKER_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_PICKER_EVENT, onOpen);
  }, []);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (!open || programs.length === 0) return null;

  const rows = cheapFirst ? [...programs].sort((a, b) => a.price - b.price) : programs;

  const pick = (p: PickerProgram, position: number) => {
    programEvents.pick({ program: p.slug, clinic: p.clinic, position, entry_point: 'sticky' });
    setOpen(false);
    window.dispatchEvent(
      new CustomEvent('open-booking-flow', { detail: { programSlug: p.slug, sourceCta: `${sourceCta}_sticky`, fromPicker: true } }),
    );
  };

  return (
    <div className="fixed inset-0 z-[190] flex items-end lg:items-center justify-center" role="dialog" aria-modal="true" aria-labelledby="program-picker-h">
      <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
      <div
        className="relative w-full lg:max-w-lg bg-white rounded-t-[var(--radius-xl)] lg:rounded-[var(--radius-xl)] max-h-[90vh] flex flex-col"
        onTouchStart={(e) => (touchY.current = e.touches[0].clientY)}
        onTouchEnd={(e) => {
          if (touchY.current !== null && e.changedTouches[0].clientY - touchY.current > 80) setOpen(false);
          touchY.current = null;
        }}
      >
        <div className="lg:hidden w-10 h-1 rounded-full bg-[var(--border)] mx-auto mt-3" aria-hidden="true" />
        <div className="flex items-start justify-between gap-3 px-5 pt-3 lg:pt-5">
          <div>
            <h2 id="program-picker-h" className="text-[20px] font-bold text-ink leading-tight">
              Оберіть програму
            </h2>
            <p className="mt-1 text-[13px] text-text-secondary">Порядок – не рейтинг.</p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Закрити"
            className="w-11 h-11 shrink-0 -mr-2 flex items-center justify-center text-text-secondary hover:text-ink"
          >
            ✕
          </button>
        </div>
        {programs.length > 4 && (
          <div className="px-5 mt-3">
            <button
              type="button"
              aria-pressed={cheapFirst}
              onClick={() => setCheapFirst((v) => !v)}
              className={`min-h-11 px-4 rounded-[var(--radius-pill)] border text-[14px] font-semibold ${
                cheapFirst ? 'border-link text-link bg-brand-primary-soft' : 'border-[var(--border)] text-text-secondary'
              }`}
            >
              Спочатку дешевші
            </button>
          </div>
        )}
        <ul className="mt-3 px-2 pb-[calc(12px+env(safe-area-inset-bottom,0px))] overflow-y-auto">
          {rows.map((p, i) => (
            <li key={p.slug} className="border-t border-section-border first:border-t-0">
              <button
                type="button"
                onClick={() => pick(p, i + 1)}
                className="w-full min-h-[72px] px-3 py-3 flex items-center gap-3 text-left rounded-[var(--radius-md)] hover:bg-brand-primary-soft"
              >
                <span className="min-w-0 flex-1">
                  <span className="block text-[16px] font-semibold text-ink leading-snug">{p.name}</span>
                  <span className="block mt-0.5 text-[14px] text-text-secondary">{p.clinic}</span>
                </span>
                <span className="shrink-0 text-[18px] font-bold text-ink" style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
                  {fmt(p.price)} грн
                </span>
                <svg className="w-5 h-5 shrink-0 text-link" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
