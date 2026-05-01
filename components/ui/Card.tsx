import type { HTMLAttributes, ReactNode } from 'react';

type CardAccent = 'navy' | 'teal' | 'crimson';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  accent?: CardAccent;
  noPadding?: boolean;
  shadow?: boolean;
}

const accents: Record<CardAccent, string> = {
  navy:    'border-t-[3px] border-t-[var(--navy)]',
  teal:    'border-t-[3px] border-t-[var(--teal)]',
  crimson: 'border-t-[3px] border-t-[var(--crimson)]',
};

export function Card({
  accent,
  noPadding = false,
  shadow = true,
  className = '',
  children,
  ...rest
}: CardProps) {
  return (
    <div
      className={[
        'bg-[var(--background)] border border-[var(--border-warm)] rounded-2xl overflow-hidden',
        shadow ? 'shadow-[var(--shadow-card)]' : '',
        noPadding ? '' : 'p-6',
        accent ? accents[accent] : '',
        className,
      ].filter(Boolean).join(' ')}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className = '', children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={['mb-4', className].filter(Boolean).join(' ')} {...rest}>
      {children}
    </div>
  );
}

export function CardTitle({ className = '', children, ...rest }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={['text-lg font-bold text-[var(--text-primary)]', className].filter(Boolean).join(' ')}
      {...rest}
    >
      {children}
    </h3>
  );
}

export function CardBody({ className = '', children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={['text-sm text-[var(--text-secondary)] leading-relaxed', className].filter(Boolean).join(' ')}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardFooter({ className = '', children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={['mt-4 pt-4 border-t border-[var(--border-warm)]', className].filter(Boolean).join(' ')}
      {...rest}
    >
      {children}
    </div>
  );
}
