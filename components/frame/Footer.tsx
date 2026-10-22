// Каркас: Footer (docs/ux/ui-kit.md v1.1 §6.7, адаптація OnclinicFooter з checkup-platform).
// Фон #05121e для всіх брендів. Кнопка – роль 13 (--footer-cta-*), межа на фоні ≥ 3:1 (crimson 3.55).
// Посилання колонок – навігація, без постійного підкреслення.
// Усі тексти (колонки, підписи, застереження) передає сторінка або конфіг – компонент їх не вигадує.

import type { ReactNode } from 'react';

export interface FooterColumn {
  title: string;
  links: { label: string; href: string }[];
}

export default function Footer({
  logo,
  columns = [],
  cta,
  disclaimer,
  bottom,
}: {
  logo?: ReactNode;
  columns?: FooterColumn[];
  cta?: ReactNode;
  disclaimer?: ReactNode;
  bottom?: ReactNode;
}) {
  return (
    <footer className="bg-footer-bg text-white/80">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-14 py-14">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 xl:grid-cols-4">
          <div className="flex flex-col gap-5">
            {logo}
            {cta}
          </div>
          {columns.map((c) => (
            <nav key={c.title} aria-label={c.title}>
              <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-white/60 mb-4">{c.title}</p>
              <ul className="flex flex-col gap-2.5">
                {c.links.map((l) => (
                  <li key={l.href}>
                    <a href={l.href} className="text-[14px] text-white/85 hover:text-white hover:underline underline-offset-[3px]">
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        {disclaimer && <div className="mt-10 pt-6 border-t border-white/10 text-[13px] text-white/72">{disclaimer}</div>}
        {bottom && <div className="mt-4 text-[12px] text-white/60">{bottom}</div>}
      </div>
    </footer>
  );
}

/** Кнопка футера: роль 13. Сам елемент (кнопка форми чи посилання) дає сторінка через className. */
export const footerCtaClass =
  'inline-flex items-center justify-center min-h-[52px] px-7 rounded-[12px] font-display font-bold text-[15px] bg-[var(--footer-cta-bg)] text-[var(--footer-cta-text)] hover:bg-[var(--footer-cta-hover)] transition-colors';
