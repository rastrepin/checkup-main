// Каркас: локація програм – клініка, станції метро, адреси й графік за кліком (макет зони програми v2, 21.10).
// Показується один раз на клініку: кілька програм однієї клініки стоять під одним блоком локації.
// Тексти передає сторінка; кількість філій і метро компонент бере з даних.

import type { ReactNode } from 'react';
import Accordion from './Accordion';

export interface LocationBranch {
  id: string;
  name: string;
  address: string;
  metro?: string | null;
  schedule?: string | null;
  phone?: string | null;
}

function branchesWord(n: number) {
  const m10 = n % 10, m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return 'філія';
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return 'філії';
  return 'філій';
}

export default function ProgramLocation({
  kicker,
  name,
  city,
  branches,
  moreLabel,
  footer,
}: {
  kicker: string;
  name: string;
  /** «в Харкові» – після кількості філій. */
  city: string;
  branches: LocationBranch[];
  moreLabel: string;
  /** Телефон і посилання на сторінку клініки – під адресами. */
  footer?: ReactNode;
}) {
  const metro = branches.map((b) => b.metro?.replace(/^м\.\s*/, '')).filter((m): m is string => Boolean(m));
  return (
    <section aria-label={name} className="bg-white border-[1.5px] border-[var(--border)] rounded-[var(--radius-lg)] px-[var(--space-card)] pt-[var(--space-card)] pb-1">
      <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-text-secondary">{kicker}</p>
      <p className="mt-1 text-[20px] font-bold text-ink leading-snug">{name}</p>
      {branches.length > 0 && (
        <p className="mt-0.5 text-[15px] text-text-secondary">
          {branches.length} {branchesWord(branches.length)} {city}
        </p>
      )}
      {metro.length > 0 && (
        <ul className="mt-3.5 mb-3 flex flex-wrap gap-2" aria-label="Станції метро">
          {metro.map((m) => (
            <li key={m} className="inline-flex items-center gap-1.5 text-[14px] text-ink bg-[var(--zone-program-bg)] rounded-[var(--radius-pill)] pl-1.5 pr-3 py-1.5">
              <span aria-hidden="true" className="w-[18px] h-[18px] rounded-full bg-[var(--brand-primary)] text-[var(--brand-primary-text)] text-[11px] font-bold leading-[18px] text-center">
                М
              </span>
              {m}
            </li>
          ))}
        </ul>
      )}
      {(branches.length > 0 || footer) && (
        <Accordion summary={moreLabel} size="sm">
          {branches.length > 0 && (
            <ul className="grid gap-3 lg:grid-cols-3">
              {branches.map((b) => (
                <li key={b.id} className="bg-[var(--zone-program-bg)] rounded-[var(--radius-lg)] px-4 py-3.5">
                  <p className="font-bold text-ink">{b.name}</p>
                  <p className="mt-0.5 text-[14px]">
                    {b.address}
                    {b.metro ? `, ${b.metro}` : ''}
                  </p>
                  {b.schedule && <p className="mt-0.5 text-[14px]">{b.schedule}</p>}
                  {b.phone && (
                    <p className="mt-0.5 text-[14px]">
                      <a href={`tel:${b.phone.replace(/\s/g, '')}`} className="text-link hover:underline">
                        {b.phone}
                      </a>
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
          {footer && <div className="mt-4 text-[15px] flex flex-wrap gap-x-6 gap-y-2">{footer}</div>}
        </Accordion>
      )}
    </section>
  );
}
