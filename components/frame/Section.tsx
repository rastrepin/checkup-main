// Каркас: Section (docs/ux/ui-kit.md v1.1 §6.4). Новий спільний компонент для обох репо.
// Дає фон (#fff / #f8fafc по черзі), border-top, py-14, контейнер 1200px і поля.
// Сторінка не задає відступи секцій сама.

import type { ReactNode } from 'react';

export default function Section({
  children,
  tone = 'white',
  width = 'container',
  id,
  className = '',
  ariaLabel,
  ariaLabelledby,
}: {
  children: ReactNode;
  tone?: 'white' | 'muted';
  width?: 'container' | 'read';
  id?: string;
  className?: string;
  ariaLabel?: string;
  ariaLabelledby?: string;
}) {
  return (
    <section
      id={id}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledby}
      className={`border-t border-section-border scroll-mt-16 ${tone === 'muted' ? 'bg-bg-muted' : 'bg-white'} ${className}`}
    >
      <div className="max-w-[1200px] mx-auto px-[var(--space-gutter)] py-[var(--space-section)]">
        {width === 'read' ? <div className="max-w-[720px]">{children}</div> : children}
      </div>
    </section>
  );
}
