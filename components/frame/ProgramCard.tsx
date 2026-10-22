// Каркас: картка програми клініки (макет зони програми v2, 21.10; рішення Ігоря 1А 2А).
// Перший шар – те, що потрібно для рішення: назва, лічильники складу, що з рекомендованого є і чого немає, короткий склад.
// Решта (повний склад, чого немає, як це проходить, підготовка) – рядки акордеону, на mobile і desktop однаково.
// Ціна і запис – у картці: на mobile під вмістом, з 1024 px – колонка праворуч, закріплена в межах картки.
// Кілька програм – кілька карток одна під одною; локація (ProgramLocation) – одна над картками своєї клініки.

import type { ReactNode } from 'react';

/** «8 обстежень», «1 консультація»: форми однини, 2–4, 5+. */
export function countText(n: number, forms: [string, string, string]): string {
  const m10 = n % 10, m100 = n % 100;
  const w = m10 === 1 && m100 !== 11 ? forms[0] : m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14) ? forms[1] : forms[2];
  return `${n} ${w}`;
}

export default function ProgramCard({
  id,
  title,
  meta,
  children,
  sections,
  buy,
  buyId,
}: {
  id?: string;
  title: string;
  /** Рядок під назвою: «Два візити · 6 консультацій · 8 обстежень · 20 аналізів». */
  meta: string[];
  /** Перший шар картки. */
  children: ReactNode;
  /** Рядки акордеону (Accordion) під першим шаром. */
  sections?: ReactNode;
  /** Ціна, дата ціни, кнопки. */
  buy: ReactNode;
  /** id блоку ціни – закріплена панель mobile ховається, коли він на екрані. */
  buyId?: string;
}) {
  return (
    <article id={id} aria-labelledby={id ? `${id}-h` : undefined} className="scroll-mt-20 bg-white border-[1.5px] border-[var(--border)] rounded-[var(--radius-lg)]">
      <div className="grid lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0 p-[var(--space-card)]">
          <h3 id={id ? `${id}-h` : undefined} className="text-[22px] font-bold text-ink leading-tight [text-wrap:balance]">
            {title}
          </h3>
          {meta.length > 0 && (
            <ul className="mt-2 flex flex-wrap text-[15px] text-text-secondary">
              {meta.map((m, i) => (
                <li key={m}>
                  {m}
                  {i < meta.length - 1 && <span aria-hidden="true" className="mx-2">·</span>}
                </li>
              ))}
            </ul>
          )}
          {children}
          {sections && <div className="mt-6 [&>.acc:last-child]:border-b [&>.acc:last-child]:border-section-border">{sections}</div>}
        </div>
        <div id={buyId} className="border-t lg:border-t-0 lg:border-l border-section-border p-[var(--space-card)]">
          <div className="grid gap-3.5 lg:sticky lg:top-20">{buy}</div>
        </div>
      </div>
    </article>
  );
}
