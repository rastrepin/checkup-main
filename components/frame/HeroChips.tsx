// Каркас: обстеження «Рекомендують кожній» у hero (ui-kit §5.2, макет зон 20.10).
// Кнопки-якорі без умов віку: умови – у розділі «Які обстеження рекомендують».
// Під кнопками – посилання на розділ про розширене обстеження. Тексти передає сторінка.
// Ритм (ui-kit §5.4): група обстежень – data-hero="group" (40/56 від H1), посилання – data-hero="next" (32/40),
// застереження hero йде за посиланням на 12/16: «що далі» і «вирішуйте з лікарем» – одна група.

import type { ReactNode } from "react";

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
    <>
      <div data-hero="group">
        <p className="text-[15px] font-semibold text-[var(--hero-muted)]">
          {title}
        </p>
        <ul className="mt-3 lg:mt-4 flex flex-wrap gap-2.5" role="list">
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
      </div>
      {more && (
        <div data-hero="next">
          <a
            href={more.href}
            className="inline-block text-[15px] text-[var(--hero-text)] underline decoration-1 underline-offset-[3px] hover:decoration-2"
          >
            {more.label}
          </a>
        </div>
      )}
    </>
  );
}
