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
  // USPSTF-позначка ступеня доказовості (A/B). ОНОВЛЕНО 29.08.2026 (завдання
  // "UX-переробка", п.6): teal pill замість amber — brand-tokens-v3/checkup-design
  // "teal як pills і badges для категорій" (той самий механізм, що StageCard).
  // Скасовує попереднє amber-рішення (не було доступного teal-контракту на момент
  // першого білду ProgramSidebar).
  'uspstf':       'bg-teal-soft text-navy border border-teal',
};

const sizes: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-[11px]',
  md: 'px-3 py-1 text-xs',
};

// USPSTF-бейдж: title-атрибут з розшифровкою ступеня генерується автоматично
// з букви наприкінці children ("USPSTF A" → ступінь A), якщо title не заданий
// явно у виклику. Пояснення доступне без прокрутки до легенди на початку блоку
// 2 (завдання "UX-виправлення, ітерація 2", п.5, 29.08.2026).
const USPSTF_GRADE_TITLES: Record<string, string> = {
  A: 'Ступінь A — висока впевненість у користі',
  B: 'Ступінь B — помірна впевненість у користі',
};

export function Badge({
  variant = 'navy',
  size = 'md',
  className = '',
  children,
  title,
  ...rest
}: BadgeProps) {
  let resolvedTitle = title;
  if (!resolvedTitle && variant === 'uspstf' && typeof children === 'string') {
    const grade = children.trim().slice(-1).toUpperCase();
    resolvedTitle = USPSTF_GRADE_TITLES[grade];
  }

  return (
    <span
      title={resolvedTitle}
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
