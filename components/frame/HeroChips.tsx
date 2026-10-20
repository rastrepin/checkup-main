// Каркас: обстеження «Рекомендують кожній» у hero (ui-kit §5.2, макет зон 20.10).
// Кнопки-якорі без умов віку: умови – у розділі «Які обстеження рекомендують».
// Під кнопками – посилання на розділ про розширене обстеження. Тексти передає сторінка.

import type { ReactNode } from 'react';

export default function HeroChips({
  title,
  items,
  more,
}: {
  title: ReactNode;
  items: { label: string; href: string }[];
  more?: { label: ReactNode; href: string };
}) {
  return (
    <div data-hero="card">
      <p className="text-[15px] font-semibold text-[var(--hero-muted)]">{title}</p>
      <ul className="mt-3 flex flex-wrap gap-2" role="list">
        {items.map((it) => (
          <li key={it.href}>
            <a
              href={it.href}
              className="inline-flex items-center min-h-10 px-3.5 rounded-[var(--radius-pill)] text-[15px] leading-none text-[var(--hero-text)] bg-[var(--hero-card-bg)] border border-[var(--hero-chip-border)] hover:bg-[var(--hero-chip-hover)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
            >
              {it.label}
            </a>
          </li>
        ))}
      </ul>
      {more && (
        <a
          href={more.href}
          className="inline-block mt-4 text-[15px] text-[var(--hero-text)] underline decoration-1 underline-offset-[3px] hover:decoration-2"
        >
          {more.label}
        </a>
      )}
    </div>
  );
}
