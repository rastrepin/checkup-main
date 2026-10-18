// Каркас: Hero (docs/ux/ui-kit.md v1.1 §5, адаптація DiagnosisHero з checkup-platform).
// tone за типом сторінки (ui-kit §5.1):
//   dark  – головна, чекапи (каталог міста, вікові сторінки, програми);
//   light – хірургія (Hub, Case), вагітність, статті, FAQ.
// Склад: breadcrumbs → eyebrow (риска) → H1 (Source Serif) → курсивний рядок → lead → підсумок → кнопка → reassurance.
// Тексти передає сторінка; компонент задає лише вигляд.
// Підсумок на темному hero – напівпрозора картка (білий 6%, рамка 12%); біла картка заборонена.

import type { ReactNode } from 'react';
import Eyebrow from './Eyebrow';

export type HeroTone = 'dark' | 'light';

const T = {
  dark: {
    section: { background: 'var(--hero-bg)' },
    h1: 'text-[var(--hero-text)]',
    italic: 'text-[var(--hero-decor)]',
    lead: 'text-[var(--hero-muted)]',
    crumbs: 'text-[var(--hero-muted)] [&_a]:text-[var(--hero-muted)] [&_a:hover]:text-[var(--hero-text)] [&_a:hover]:underline [&_span]:text-[var(--hero-muted)]',
    // Вміст підсумку приходить зі сторінки зі своїми кольорами тексту для світлого фону –
    // на темному їх перекриваємо ролями hero (посилання – підкреслені, білі).
    card: 'bg-[var(--hero-card-bg)] border border-[var(--hero-card-border)] text-[var(--hero-text)] [&_*]:!text-[inherit] [&_a]:underline [&_a]:decoration-1 [&_a]:underline-offset-[3px] [&_a:hover]:decoration-2',
    reassure: 'text-[var(--hero-muted)] [&_*]:!text-[inherit] [&_svg]:!stroke-[var(--hero-decor)]',
    eyebrow: 'hero-dark' as const,
  },
  light: {
    section: { background: 'var(--hero-bg-light)' },
    h1: 'text-[var(--hero-text-light)]',
    italic: 'text-[var(--hero-decor-light)]',
    lead: 'text-[var(--hero-muted-light)]',
    crumbs: 'text-[var(--hero-muted-light)] [&_a:hover]:underline',
    card: 'bg-white border border-[var(--border)]',
    reassure: 'text-[var(--hero-muted-light)]',
    eyebrow: 'hero-light' as const,
  },
};

export default function Hero({
  tone,
  id = 'hero',
  breadcrumbs,
  eyebrow,
  h1,
  h1Italic,
  h1Size = 'clamp(32px, 5vw, 64px)',
  lead,
  summary,
  cta,
  reassurance,
  aside,
  children,
}: {
  tone: HeroTone;
  id?: string;
  breadcrumbs?: ReactNode;
  eyebrow?: ReactNode;
  h1: ReactNode;
  h1Italic?: ReactNode;
  h1Size?: string;
  lead?: ReactNode;
  summary?: ReactNode;
  cta?: ReactNode;
  reassurance?: ReactNode;
  aside?: ReactNode;
  children?: ReactNode;
}) {
  const t = T[tone];
  return (
    <section id={id} style={t.section} className="relative">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-14 pt-8 pb-12 lg:pt-14 lg:pb-20">
        <div className={aside ? 'grid grid-cols-1 gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14 items-start' : ''}>
          <div className="max-w-3xl flex flex-col">
            {breadcrumbs && <div className={`text-[13px] mb-6 ${t.crumbs}`}>{breadcrumbs}</div>}
            {eyebrow && (
              <Eyebrow marker="dash" tone={t.eyebrow} className="mb-5">
                {eyebrow}
              </Eyebrow>
            )}
            <h1
              className={`font-serif font-bold tracking-[-0.02em] ${t.h1}`}
              style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: h1Size, lineHeight: 1.05 }}
            >
              {h1}
            </h1>
            {h1Italic && (
              <p
                className={`italic font-medium mt-2 ${t.italic}`}
                style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 'clamp(22px, 3.4vw, 38px)', lineHeight: 1.1 }}
              >
                {h1Italic}
              </p>
            )}
            {lead && <div className={`text-[17px] leading-[1.6] mt-5 ${t.lead}`}>{lead}</div>}
            {summary && <div className={`rounded-[12px] px-5 pt-4 pb-4 mt-6 leading-snug ${t.card}`}>{summary}</div>}
            {children}
            {cta && <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">{cta}</div>}
            {reassurance && <div className={`mt-3 text-[13px] ${t.reassure}`}>{reassurance}</div>}
          </div>
          {aside}
        </div>
      </div>
    </section>
  );
}
