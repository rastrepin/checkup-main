// Каркас: обстеження «Рекомендують кожній» у hero (ui-kit §5.2, макет зон 20.10).
// Кнопки-якорі без умов віку: умови – у розділі «Які обстеження рекомендують».
// Під кнопками – посилання на розділ про розширене обстеження. Тексти передає сторінка.
// Ритм (ui-kit §5.4): група обстежень – data-hero="group" (40/56 від H1), посилання – data-hero="next" (32/40),
// застереження hero йде за посиланням на 12/16: «що далі» і «вирішуйте з лікарем» – одна група.
// anchors – кнопки-якорі «Мій план», «Програми клінік» (age-page-zones v0.6 §2, рядок 2): той самий вигляд чипа,
// окремим рядком під посиланням; без кнопки запису.
// Лише anchors, без title/items (рішення Ігоря 06.11: hero вікових сторінок без чипів обстежень) – ряд якорів стає
// першою групою після H1 (data-hero="group", 40/56).

import type { ReactNode } from "react";

const CHIP =
  "hero-chip relative inline-flex items-center min-h-8 lg:min-h-10 px-3 lg:px-3.5 rounded-[var(--radius-pill)] text-[14px] lg:text-[15px] leading-none text-[var(--hero-text)] bg-[var(--hero-card-bg)] border border-[var(--hero-chip-border)] hover:bg-[var(--hero-chip-hover)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current";

export default function HeroChips({
  title,
  items,
  more,
  anchors,
}: {
  title?: ReactNode;
  items?: { label: string; href: string }[];
  more?: { label: ReactNode; href: string };
  anchors?: { label: string; href: string }[];
}) {
  const hasItems = Boolean(items && items.length > 0);
  return (
    <>
      {hasItems && (
      <div data-hero="group">
        <p className="text-[15px] font-semibold text-[var(--hero-muted)]">
          {title}
        </p>
        <ul className="mt-3 lg:mt-4 flex flex-wrap gap-2 lg:gap-2.5" role="list">
          {(items ?? []).map((it) => (
            <li key={it.href}>
              <a href={it.href} className={CHIP}>
                {it.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
      )}
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
      {anchors && anchors.length > 0 && (
        <div data-hero={hasItems || more ? 'next' : 'group'}>
          <ul className="flex flex-wrap gap-2 lg:gap-2.5" role="list">
            {anchors.map((it) => (
              <li key={it.href}>
                <a href={it.href} className={CHIP}>
                  {it.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
