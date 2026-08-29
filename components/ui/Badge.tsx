import type { HTMLAttributes } from 'react';

type BadgeVariant = 'navy' | 'teal' | 'crimson' | 'gray' | 'navy-outline' | 'teal-outline' | 'uspstf';
type BadgeSize   = 'sm' | 'md';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
}

const variants: Record<BadgeVariant, string> = {
  'navy':         'bg-[var(--navy)] text-white',
  'teal':         'bg-[var(--teal)] text-white',
  'crimson':      'bg-[var(--crimson)] text-white',
  'gray':         'bg-gray-100 text-[var(--text-secondary)]',
  'navy-outline': 'border border-[var(--navy)] text-[var(--navy)] bg-transparent',
  'teal-outline': 'border border-[var(--teal)] text-[var(--teal)] bg-transparent',
  // USPSTF-позначка ступеня доказовості (A/B). Новий колірний варіант — амбер,
  // навмисно поза навігаційною палітрою (navy/teal/crimson), щоб не конкурувати з CTA.
  'uspstf':       'bg-amber-50 text-amber-700 border border-amber-200',
};

const sizes: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-[11px]',
  md: 'px-3 py-1 text-xs',
};

export function Badge({
  variant = 'navy',
  size = 'md',
  className = '',
  children,
  ...rest
}: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center font-semibold rounded-full leading-none',
        variants[variant],
        sizes[size],
        className,
      ].filter(Boolean).join(' ')}
      {...rest}
    >
      {children}
    </span>
  );
}
