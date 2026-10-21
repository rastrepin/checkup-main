'use client';

import { useEffect, useState } from 'react';
import { BookCta } from '@/components/city/BookingFlow';
import { buttonClass } from '@/components/frame/Button';

// Блок 1c обох MD (5a-female-40-50/vid-50-kharkiv.md): постійний CTA на мобільному,
// зʼявляється після прокрутки повз Hero. components-map-FIXED.md §16 не містить
// реального контракту цього компонента (лише якорі InPageNav іншого набору) —
// будується за описом завдання, підтверджено Cowork 29.08.2026 п.4.

export interface StickyMobileCtaProps {
  /** Скорочена назва програми, напр. "Check-Up жіночий після 40" */
  programNameShort: string;
  /** Необов'язкова (SPRINT-KHARKIV-v0): без price рядок ціни не рендериться.
   *  Якщо price передано – поведінка як раніше. */
  price?: number;
  programSlug: string;
  sourceCta: string;
  /** Задача v2 (24.09.2026): id елемента (Hero), після прокрутки якого кнопка з'являється.
   *  Без нього – як раніше, після 400 px прокрутки. */
  revealAfterId?: string;
  /** 'v2': ціна Source Serif 4 navy, кнопка navy з radius 14 px. За замовчуванням – як раніше. */
  look?: 'default' | 'v2';
  /** Макет зон 20.10: id заголовка зони програми. До неї панель веде в зону програми («Переглянути»),
   *  від неї – «Записатися». Без пропу – як раніше. */
  zoneId?: string;
  /** Напис кнопки до зони програми. */
  browseLabel?: string;
  /** Макет зони програми v2 (21.10): id блоку ціни в картці програми. Поки він на екрані, панель схована –
   *  дві кнопки «Записатися» одночасно не видно. */
  hideWhenVisibleId?: string;
}

function fmt(n: number) {
  return n.toLocaleString('uk-UA');
}

export default function StickyMobileCta({ programNameShort, price, programSlug, sourceCta, revealAfterId, look = 'default', zoneId, browseLabel = 'Переглянути', hideWhenVisibleId }: StickyMobileCtaProps) {
  const [visible, setVisible] = useState(false);
  const [inZone, setInZone] = useState(!zoneId);

  useEffect(() => {
    const onScroll = () => {
      const el = revealAfterId ? document.getElementById(revealAfterId) : null;
      const buy = hideWhenVisibleId ? document.getElementById(hideWhenVisibleId) : null;
      const r = buy?.getBoundingClientRect();
      const buyOnScreen = r ? r.top < window.innerHeight && r.bottom > 0 : false;
      setVisible((el ? el.getBoundingClientRect().bottom < 0 : window.scrollY > 400) && !buyOnScreen);
      if (zoneId) {
        const z = document.getElementById(zoneId);
        setInZone(z ? z.getBoundingClientRect().top < window.innerHeight * 0.5 : true);
      }
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  if (look === 'v2') {
    return (
      <div
        className="fixed bottom-0 left-0 right-0 z-[150] md:hidden bg-white border-t border-gray-200 px-5 py-3 flex items-center justify-between gap-3"
        style={{ boxShadow: '0 -8px 24px rgba(0,0,0,0.04)' }}
      >
        <div className="min-w-0 flex-1">
          <p className="text-xs text-gray-500 truncate leading-tight">{programNameShort}</p>
          {typeof price === 'number' && (
            <p className="text-[19px] font-bold text-[#005485] leading-tight mt-0.5" style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
              {fmt(price)} грн
            </p>
          )}
        </div>
        {inZone ? (
          <BookCta
            programSlug={programSlug}
            sourceCta={sourceCta}
            label="Записатися"
            className="!w-auto shrink-0 px-6 uppercase tracking-[0.06em]"
          />
        ) : (
          <a href={`#${zoneId}`} className={`${buttonClass({ variant: 'secondary', size: 'lg' })} shrink-0 px-6`}>
            {browseLabel}
          </a>
        )}
      </div>
    );
  }

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[150] md:hidden bg-white border-t-2 border-gray-200 px-4 py-2.5 flex items-center gap-3"
      style={{ boxShadow: '0 -4px 16px rgba(0,0,0,0.08)' }}
    >
      <div className="min-w-0 flex-1">
        <p className="text-[11px] text-gray-500 truncate leading-tight">{programNameShort}</p>
        {typeof price === 'number' && (
          <p className="text-sm font-bold text-[#0b1a24] leading-tight">{fmt(price)} грн</p>
        )}
      </div>
      <BookCta
        programSlug={programSlug}
        sourceCta={sourceCta}
        label="Записатися"
        variant="crimson"
        className="!w-auto shrink-0 px-5"
      />
    </div>
  );
}
