// Каркас: Eyebrow (docs/ux/ui-kit.md v1.1 §6.2). Той самий контракт, що в checkup-platform.
// marker='dash' (32×2) – hero і CtaBanner; 'dot' – секції.
// Колір маркера – роль 5 (--brand-secondary); у hero – роль 11 (--hero-decor).
// Текст – --text-primary; на темному hero – --hero-muted. Роздільник – «·».

import type { ReactNode } from 'react';

export type EyebrowTone = 'section' | 'hero-dark' | 'hero-light';

const TEXT: Record<EyebrowTone, string> = {
  section: 'text-[var(--text-primary)]',
  'hero-dark': 'text-[var(--hero-muted)]',
  'hero-light': 'text-[var(--hero-muted-light)]',
};
const MARK: Record<EyebrowTone, string> = {
  section: 'bg-[var(--brand-secondary)]',
  'hero-dark': 'bg-[var(--hero-decor)]',
  'hero-light': 'bg-[var(--hero-decor-light)]',
};

export default function Eyebrow({
  children,
  marker = 'dot',
  tone = 'section',
  className = '',
  as: Tag = 'p',
}: {
  children: ReactNode;
  marker?: 'dash' | 'dot';
  tone?: EyebrowTone;
  className?: string;
  as?: 'p' | 'div' | 'span';
}) {
  return (
    <Tag className={`flex items-center gap-3.5 text-[12px] font-semibold uppercase tracking-[0.12em] ${TEXT[tone]} ${className}`}>
      <span
        aria-hidden="true"
        className={`shrink-0 ${MARK[tone]} ${marker === 'dash' ? 'w-8 h-[2px] rounded-[2px]' : 'w-1.5 h-1.5 rounded-full'}`}
      />
      <span>{children}</span>
    </Tag>
  );
}
