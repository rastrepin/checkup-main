import type { ReactNode } from 'react';

// Один accordion-патерн для Блок 2 («Показати всі обстеження», часткове
// розкриття) і Блок 3 («Чого зазвичай не потрібно», повне згортання) на
// сторінках Типу 5a (завдання Cowork 29.08.2026, "UX-переробка"). Нативний
// <details>/<summary> — контент ЗАВЖДИ в DOM, display:none не застосовується
// (SEO-STANDARD р.6). Свідомо НЕ CollapsibleOnMobile: той форсує open на
// desktop ≥1024px, а обидва наші випадки мають бути згорнуті на БУДЬ-якому
// viewport, поки користувач не натисне — інша поведінка, тому новий, менший
// компонент, а не розширення існуючого (ризик регресу для сторінок, які вже
// покладаються на форс-open desktop CollapsibleOnMobile).

export default function AccordionSection({
  summary,
  children,
  defaultOpen = false,
  className = '',
}: {
  summary: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
}) {
  return (
    <details open={defaultOpen} className={`group ${className}`}>
      <summary
        className="flex items-center gap-2 cursor-pointer list-none text-[14px] font-semibold text-navy select-none py-1 [&::-webkit-details-marker]:hidden"
      >
        <svg
          className="w-4 h-4 shrink-0 transition-transform duration-200 group-open:rotate-180"
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
        <span>{summary}</span>
      </summary>
      <div className="mt-4">{children}</div>
    </details>
  );
}
