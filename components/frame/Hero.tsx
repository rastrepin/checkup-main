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
  kicker,
  h1,
  h1Tail,
  h1Italic,
  h1Size = 'clamp(32px, 5vw, 64px)',
  lead,
  summary,
  content,
  cta,
  reassurance,
  aside,
  children,
}: {
  tone: HeroTone;
  id?: string;
  breadcrumbs?: ReactNode;
  eyebrow?: ReactNode;
  /** Рядок над H1 «це місце для вас» (замість eyebrow, ui-kit §5.2). */
  kicker?: ReactNode;
  h1: ReactNode;
  /** Хвіст H1 після « – »: той самий тег H1, візуально – другим рядком курсивом. */
  h1Tail?: ReactNode;
  h1Italic?: ReactNode;
  h1Size?: string;
  lead?: ReactNode;
  summary?: ReactNode;
  /** Вміст без обгортки-картки (напр. HeroChips), на місці підсумку. */
  content?: ReactNode;
  cta?: ReactNode;
  reassurance?: ReactNode;
  aside?: ReactNode;
  children?: ReactNode;
}) {
  const t = T[tone];
  return (
    <section id={id} style={t.section} className="relative">
      <div className="max-w-[1200px] mx-auto px-[var(--space-gutter)] pt-[var(--space-hero-top)] pb-[var(--space-hero-bottom)]">
        <div className={aside ? 'grid grid-cols-1 gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14 items-start' : ''}>
          <div className="max-w-3xl hero-stack">
            {breadcrumbs && <div data-hero="crumbs" className={`text-[13px] ${t.crumbs}`}>{breadcrumbs}</div>}
            {kicker && (
              <p data-hero="eyebrow" className={`text-[15px] font-semibold ${t.italic}`}>
                {kicker}
              </p>
            )}
            {!kicker && eyebrow && (
              <div data-hero="eyebrow">
                <Eyebrow marker="dash" tone={t.eyebrow}>
                  {eyebrow}
                </Eyebrow>
              </div>
            )}
            <h1
              data-hero="title"
              className={`font-serif font-bold tracking-[-0.02em] ${t.h1}`}
              style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: h1Size, lineHeight: 1.06 }}
            >
              {h1}
              {h1Tail && (
                <>
                  <span className="hero-h1-sep"> – </span>
                  <span
                    className={`block italic font-medium mt-3 lg:mt-4 ${t.italic}`}
                    style={{ fontSize: '0.56em', lineHeight: 1.2 }}
                  >
                    {h1Tail}
                  </span>
                </>
              )}
            </h1>
            {h1Italic && (
              <p
                data-hero="sub"
                className={`italic font-medium ${t.italic}`}
                style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 'clamp(22px, 3.4vw, 38px)', lineHeight: 1.1 }}
              >
                {h1Italic}
              </p>
            )}
            {lead && <div data-hero="lead" className={`text-[17px] leading-[1.6] ${t.lead}`}>{lead}</div>}
            {summary && <div data-hero="card" className={`rounded-[var(--radius-lg)] p-[var(--space-card)] leading-snug [&_li+li]:mt-1.5 ${t.card}`}>{summary}</div>}
            {content}
            {children}
            {cta && <div data-hero="cta" className="flex flex-wrap items-center gap-x-6 gap-y-3">{cta}</div>}
            {reassurance && <div data-hero="caption" className={`text-[13px] ${t.reassure}`}>{reassurance}</div>}
          </div>
          {aside}
        </div>
      </div>
    </section>
  );
}
