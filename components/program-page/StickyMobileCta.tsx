'use client';

import { useEffect, useState } from 'react';
import { BookCta } from '@/components/city/BookingFlow';

// Блок 1c обох MD (5a-female-40-50/vid-50-kharkiv.md): постійний CTA на мобільному,
// зʼявляється після прокрутки повз Hero. components-map-FIXED.md §16 не містить
// реального контракту цього компонента (лише якорі InPageNav іншого набору) —
// будується за описом завдання, підтверджено Cowork 29.08.2026 п.4.

export interface StickyMobileCtaProps {
  /** Скорочена назва програми, напр. "Check-Up жіночий після 40" */
  programNameShort: string;
  price: number;
  programSlug: string;
  sourceCta: string;
}

function fmt(n: number) {
  return n.toLocaleString('uk-UA');
}

export default function StickyMobileCta({ programNameShort, price, programSlug, sourceCta }: StickyMobileCtaProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[150] md:hidden bg-white border-t-2 border-gray-200 px-4 py-2.5 flex items-center gap-3"
      style={{ boxShadow: '0 -4px 16px rgba(0,0,0,0.08)' }}
    >
      <div className="min-w-0 flex-1">
        <p className="text-[11px] text-gray-500 truncate leading-tight">{programNameShort}</p>
        <p className="text-sm font-bold text-[#0b1a24] leading-tight">{fmt(price)} грн</p>
      </div>
      <BookCta
        programSlug={programSlug}
        sourceCta={sourceCta}
        label="Записатися"
        className="!w-auto shrink-0 px-5"
      />
    </div>
  );
}
