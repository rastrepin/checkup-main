// Каркас: ієрархія тексту інформаційних розділів (ui-kit §6.12, рішення Ігоря 21.10).
// Мало стилів, другорядне – тихіше:
//   Lead – головне в розділі (перший абзац після H2): 18/19px, --ink;
//   основний текст – звичайний <p> сторінки: 16px, --text-secondary;
//   Note – другорядне: 15px, приглушений;
//   CheckList – ознаки, перелік з галочкою (desktop – 2 колонки);
//   StageScale – шкала стадій або ступенів (справжня послідовність);
//   InfoCard – група в розділі (метод лікування, операція), без кнопки.
// Тексти передає сторінка. components-map §29.16–29.20.

import type { ReactNode } from 'react';

export function Lead({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <p className={`mt-[var(--space-heading)] text-[18px] lg:text-[19px] leading-[1.6] text-ink ${className}`}>{children}</p>;
}

export function Note({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <p className={`mt-3 text-[15px] leading-relaxed text-gray-500 ${className}`}>{children}</p>;
}

export function CheckList({ items }: { items: ReactNode[] }) {
  return (
    <ul className="mt-5 grid gap-x-8 gap-y-3 lg:grid-cols-2">
      {items.map((it, i) => (
        <li key={i} className="flex gap-3 items-start text-ink leading-relaxed">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0 mt-[3px] text-link">
            <path d="M5 12l5 5 9-10" />
          </svg>
          <span>{it}</span>
        </li>
      ))}
    </ul>
  );
}

export function StageScale({ items }: { items: [string, ReactNode][] }) {
  return (
    <ol className="mt-5 space-y-2.5">
      {items.map(([stage, text]) => (
        <li key={stage} className="flex gap-3.5 items-start bg-white border border-[var(--border)] rounded-[var(--radius-lg)] px-4 py-3">
          <span
            aria-hidden="true"
            className="shrink-0 w-9 h-9 rounded-full bg-[var(--brand-primary-soft)] text-link font-bold flex items-center justify-center"
            style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
          >
            {stage}
          </span>
          <span className="text-ink leading-relaxed pt-1.5">
            <span className="sr-only">{stage}: </span>
            {text}
          </span>
        </li>
      ))}
    </ol>
  );
}

export function InfoCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="bg-white border-[1.5px] border-[var(--border)] rounded-[var(--radius-lg)] p-[var(--space-card)]">
      <h3 className="text-[19px] font-bold text-ink leading-snug">{title}</h3>
      <div className="mt-3">{children}</div>
    </div>
  );
}
