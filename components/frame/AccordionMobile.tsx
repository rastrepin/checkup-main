'use client';

// Каркас: підрозділ, що на mobile згортається в рядок акордеону, а з 1024 px показаний повністю як звичайний H3
// (ui-kit §6.10; розділ «Що залежить від вашої історії», рішення Ігоря 21.10). Вигляд рядка – як у Accordion.
// Вміст завжди в DOM: на mobile прихований CSS-правилом .acc-m, доки рядок не відкрито.

import { useEffect, useState, type ReactNode } from 'react';

export default function AccordionMobile({ title, id, children }: { title: ReactNode; id?: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [desk, setDesk] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const sync = () => setDesk(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  return (
    <div className="acc-m" data-open={open || desk ? '' : undefined}>
      <h3 id={id} className="acc-m-h scroll-mt-20 font-bold text-ink">
        {desk ? (
          title
        ) : (
          <button
            type="button"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="w-full flex items-center justify-between gap-4 min-h-14 py-3.5 text-left text-[17px] leading-snug focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--link)] rounded-[var(--radius-sm)]"
          >
            <span>{title}</span>
            <svg
              className={`w-5 h-5 shrink-0 text-link transition-transform duration-200 motion-reduce:transition-none ${open ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.2}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        )}
      </h3>
      <div className="acc-m-body">{children}</div>
    </div>
  );
}
