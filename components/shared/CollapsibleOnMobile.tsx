'use client';

import { useEffect, useRef, type ReactNode } from 'react';

/**
 * <details>, згорнутий на mobile і розгорнутий на desktop (≥1024px).
 * Контент завжди в DOM (SEO/GEO-вимога layout-standards-v2 / UX-мапа v1.2).
 * display:none не використовується — нативна details-семантика.
 */
export default function CollapsibleOnMobile({
  summary,
  children,
  className = '',
  summaryClassName = '',
}: {
  summary: ReactNode;
  children: ReactNode;
  className?: string;
  summaryClassName?: string;
}) {
  const ref = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const mq = window.matchMedia('(min-width: 1024px)');
    const sync = () => {
      if (mq.matches) el.open = true;
    };
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  return (
    <details ref={ref} className={className}>
      <summary className={`cursor-pointer lg:pointer-events-none ${summaryClassName}`}>{summary}</summary>
      {children}
    </details>
  );
}
