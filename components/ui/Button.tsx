import type { ReactNode } from 'react';

type ButtonVariant = 'primary' | 'ghost' | 'crimson';

interface ButtonProps {
  variant: ButtonVariant;
  text: string;
  icon?: ReactNode;
  onClick?: () => void;
  href?: string;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

const base =
  'inline-flex items-center justify-center rounded-full transition cursor-pointer select-none';

const styles: Record<ButtonVariant, (isShort: boolean) => string> = {
  primary: (isShort) =>
    isShort
      ? 'bg-[var(--navy)] hover:bg-[var(--navy-dark)] text-white px-8 py-4 text-[13px] font-bold uppercase tracking-[0.1em]'
      : 'bg-[var(--navy)] hover:bg-[var(--navy-dark)] text-white px-7 py-4 text-[15px] font-semibold gap-2.5 shadow-[var(--shadow-cta)]',
  ghost: (isShort) =>
    isShort
      ? 'bg-transparent text-[var(--navy)] border-[1.5px] border-[var(--navy)]/30 px-7 py-4 text-xs font-bold uppercase tracking-[0.08em]'
      : 'bg-transparent text-[var(--navy)] border-[1.5px] border-[var(--navy)]/25 hover:border-[var(--navy)] hover:bg-[var(--navy)]/[0.04] px-6 py-3.5 text-sm font-semibold gap-2',
  crimson: (isShort) =>
    isShort
      ? 'bg-[var(--crimson)] hover:bg-[var(--crimson-hover)] text-white px-8 py-4 text-[13px] font-bold uppercase tracking-[0.1em]'
      : 'bg-[var(--crimson)] hover:bg-[var(--crimson-hover)] text-white px-7 py-4 text-[15px] font-semibold gap-2.5',
};

export function Button({
  variant,
  text,
  icon,
  onClick,
  href,
  className = '',
  type = 'button',
  disabled,
}: ButtonProps) {
  const isShort = text.trim().split(/\s+/).length === 1;
  const cls = `${base} ${styles[variant](isShort)} ${className}`;

  if (href) {
    return (
      <a href={href} className={cls}>
        {text}
        {icon && !isShort && icon}
      </a>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={cls}>
      {text}
      {icon && !isShort && icon}
    </button>
  );
}
