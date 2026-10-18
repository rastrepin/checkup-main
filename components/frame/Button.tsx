// Каркас: Button (docs/ux/ui-kit.md v1.1 §6.1). Той самий контракт, що в checkup-platform.
// Варіанти:
//   booking    – будь-яка кнопка запису: роль 3 (--brand-accent, crimson) і роль 4;
//   structural – дія без запису: роль 1 і 2;
//   secondary  – контур: текст і рамка 1.5px --link, фон прозорий, hover --brand-primary-soft;
//   hero       – кнопка темного hero: роль 12 (біла, текст кольору верху hero).
// Розміри: sm 6px, md 8px, lg 12px. Мінімальна висота 44px.
// Капс – лише для написів з 1–2 слів (caps), інакше sentence case.

import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';

export type ButtonVariant = 'booking' | 'structural' | 'secondary' | 'hero';
export type ButtonSize = 'sm' | 'md' | 'lg';

const VARIANT: Record<ButtonVariant, string> = {
  booking: 'bg-brand-accent text-brand-accent-text border-brand-accent hover:bg-brand-accent-hover hover:border-brand-accent-hover',
  structural: 'bg-brand-primary text-brand-primary-text border-brand-primary hover:bg-brand-primary-hover hover:border-brand-primary-hover',
  secondary: 'bg-transparent text-link border-link hover:bg-brand-primary-soft',
  hero: 'bg-[var(--hero-cta-bg)] text-[var(--hero-cta-text)] border-[var(--hero-cta-bg)] hover:bg-[var(--hero-cta-bg-hover)] hover:border-[var(--hero-cta-bg-hover)]',
};

const SIZE: Record<ButtonSize, string> = {
  sm: 'min-h-11 px-4 text-[13px] rounded-[6px]',
  md: 'min-h-11 px-[22px] text-[14px] rounded-[8px]',
  lg: 'min-h-[52px] px-7 text-[15px] rounded-[12px]',
};

export function buttonClass({
  variant = 'booking',
  size = 'lg',
  caps = false,
  fullWidth = false,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  caps?: boolean;
  fullWidth?: boolean;
} = {}) {
  return [
    'inline-flex items-center justify-center gap-2 font-display font-bold border-[1.5px] transition-colors duration-150',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current',
    caps ? 'uppercase tracking-[0.06em]' : '',
    fullWidth ? 'w-full' : '',
    VARIANT[variant],
    SIZE[size],
  ].join(' ');
}

type Common = { variant?: ButtonVariant; size?: ButtonSize; caps?: boolean; fullWidth?: boolean; children: ReactNode };

export function ButtonLink({ variant, size, caps, fullWidth, className = '', children, ...rest }: Common & AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a className={`${buttonClass({ variant, size, caps, fullWidth })} ${className}`} {...rest}>
      {children}
    </a>
  );
}

export default function Button({ variant, size, caps, fullWidth, className = '', children, type = 'button', ...rest }: Common & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type={type} className={`${buttonClass({ variant, size, caps, fullWidth })} ${className}`} {...rest}>
      {children}
    </button>
  );
}
