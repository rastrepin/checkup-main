// Каркас: акордеон – одна механіка розкриття на сторінці (ui-kit §6.10, рішення Ігоря 21.10: 1А 2А).
// Рядок: заголовок ліворуч, стрілка праворуч, тонка лінія між рядками. Нативний <details>: вміст завжди в DOM.
// Коли вживати: заголовок сам каже, чи розділ про вас (склад, візити, підготовка, адреси, FAQ).
// «Читати далі» (ClampMobile) – лише для суцільного тексту, де перші 2 рядки вже відповідь.

import type { ReactNode } from 'react';

export default function Accordion({
  summary,
  children,
  id,
  as: Tag = 'span',
  size = 'md',
  defaultOpen = false,
  className = '',
}: {
  summary: ReactNode;
  children: ReactNode;
  id?: string;
  /** Рівень заголовка в summary (h3/h4), щоб розділ лишався в структурі заголовків сторінки. */
  as?: 'span' | 'h3' | 'h4';
  /** md – розділ (17 px, жирний); sm – службовий рядок (15 px, колір посилання). */
  size?: 'md' | 'sm';
  defaultOpen?: boolean;
  className?: string;
}) {
  const sum =
    size === 'sm'
      ? 'min-h-12 py-3 text-[15px] font-semibold text-link'
      : 'min-h-14 py-3.5 text-[17px] font-bold text-ink';
  return (
    <details id={id} open={defaultOpen} className={`acc group scroll-mt-20 border-t border-section-border ${className}`}>
      <summary
        className={`flex items-center justify-between gap-4 cursor-pointer list-none select-none leading-snug [&::-webkit-details-marker]:hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--link)] rounded-[var(--radius-sm)] ${sum}`}
      >
        <Tag className="m-0 text-inherit font-[inherit]">{summary}</Tag>
        <svg
          className="w-5 h-5 shrink-0 text-link transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.2}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </summary>
      <div className="pb-5 text-text-secondary leading-relaxed">{children}</div>
    </details>
  );
}
