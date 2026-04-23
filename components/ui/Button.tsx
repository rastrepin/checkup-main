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

  const base =
    'inline-flex items-center justify-center rounded-full transition cursor-pointer select-none';

  const styles: Record<ButtonVariant, string> = {
    primary: isShort
      ? 'bg-[#005485] hover:bg-[#003a5e] text-white px-8 py-4 text-[13px] font-bold uppercase tracking-[0.1em]'
      : 'bg-[#005485] hover:bg-[#003a5e] text-white px-7 py-4 text-[15px] font-semibold gap-2.5 shadow-[0_8px_24px_rgba(0,84,133,0.18)]',
    ghost: isShort
      ? 'bg-transparent text-[#005485] border-[1.5px] border-[#005485]/30 px-7 py-4 text-xs font-bold uppercase tracking-[0.08em]'
      : 'bg-transparent text-[#005485] border-[1.5px] border-[#005485]/25 hover:border-[#005485] hover:bg-[#005485]/[0.04] px-6 py-3.5 text-sm font-semibold gap-2',
    crimson: isShort
      ? 'bg-[#d60242] hover:bg-[#b50139] text-white px-8 py-4 text-[13px] font-bold uppercase tracking-[0.1em]'
      : 'bg-[#d60242] hover:bg-[#b50139] text-white px-7 py-4 text-[15px] font-semibold gap-2.5',
  };

  const cls = `${base} ${styles[variant]} ${className}`;

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
