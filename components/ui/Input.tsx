import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, hint, error, leadingIcon, trailingIcon, className = '', id, ...rest }, ref) => {
    const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-semibold text-[var(--text-primary)] mb-1.5"
          >
            {label}
          </label>
        )}

        <div className="relative">
          {leadingIcon && (
            <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-[var(--text-secondary)]">
              {leadingIcon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            className={[
              'block w-full rounded-xl border bg-[var(--background)] text-[var(--text-primary)]',
              'px-4 py-3 text-sm placeholder:text-[var(--text-secondary)]/60',
              'transition-colors duration-150',
              'focus:outline-none focus:ring-2 focus:ring-[var(--navy)] focus:border-transparent',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              error
                ? 'border-[var(--crimson)] focus:ring-[var(--crimson)]'
                : 'border-[var(--border-warm)] hover:border-gray-300',
              leadingIcon ? 'pl-10' : '',
              trailingIcon ? 'pr-10' : '',
              className,
            ].filter(Boolean).join(' ')}
            {...rest}
          />

          {trailingIcon && (
            <span className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-[var(--text-secondary)]">
              {trailingIcon}
            </span>
          )}
        </div>

        {error && <p className="mt-1.5 text-xs text-[var(--crimson)]">{error}</p>}
        {hint && !error && <p className="mt-1.5 text-xs text-[var(--text-secondary)]">{hint}</p>}
      </div>
    );
  },
);

Input.displayName = 'Input';
