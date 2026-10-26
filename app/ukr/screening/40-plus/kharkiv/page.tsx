import type { Metadata } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';
import Header from '@/components/frame/Header';
import Hero from '@/components/frame/Hero';
import Section from '@/components/frame/Section';
import Accordion from '@/components/frame/Accordion';
import { ButtonLink } from '@/components/frame/Button';
import { Lead, Note, CheckList, StageScale, InfoCard } from '@/components/frame/TextBlocks';
import InPageNav from '@/components/shared/InPageNav';
import StickyMobileCta from '@/components/program-page/StickyMobileCta';
import InstitutionList from '@/components/zona-dovity/InstitutionList';
import ScreeningBookCta from '@/components/zona-dovity/ScreeningBooking';
import { loadT3, loadRegistry, dateLabel } from '@/lib/screening/t3';
import { SCREENING_40, programAmountText } from '@/lib/screening/program';

// T3 «Скринінг 40+ у місті» – Харків (docs/ux/specs/2026-10-pmh-page-types.md §4 у checkup-platform; рішення Ігоря 26.10: перше місто Харків, спочатку сайт).
// Зміст – content/zona-dovity/t3/kharkiv/skryninh-40.md (чернетка v0, на погодженні). Заклади – data/screening/registry-kharkiv.json (реєстр МОЗ).
// Сторінка – чернетка: шляху немає в lib/seo/approved-routes.json, на проді її не видно, доки Ігор не погодить.

const CITY = 'kharkiv';
const SLUG = 'skryninh-40';
const PAGE_URL = 'https://check-up.in.ua/ukr/screening/40-plus/kharkiv';
const INSTITUTIONS_ID = 'zaklady';

// Сталі тексти шаблону (spec §6: не в .md). Чернетка, до погодження Ігорем і Контентом.
const PARTNER_NOTE =
  '«Партнер платформи» – заклад, з яким співпрацює check-up.in.ua: до нього можна записатися просто тут. Позначка не змінює умов програми. Перелік закладів взято з реєстру МОЗ.';
const RESULTS_NOTE = 'Сайт не трактує результати аналізів і не замінює консультації лікаря.';

const doc = loadT3(CITY, SLUG);
const registry = loadRegistry(CITY);
const S = doc.sections;

export const metadata: Metadata = {
  title: { absolute: doc.fm.title },
  description: doc.fm.description,
  robots: { index: false, follow: false },
  alternates: { canonical: PAGE_URL },
  openGraph: { title: doc.fm.title, description: doc.fm.description, url: PAGE_URL, type: 'website' },
};

/** «… [1, 2]» → текст із посиланнями на джерела внизу сторінки. */
function withSources(text: string): ReactNode {
  const parts = text.split(/(\s?\[\d+(?:,\s*\d+)*\])/g);
  return parts.map((p, i) => {
    const m = p.match(/\[(\d+(?:,\s*\d+)*)\]/);
    if (!m) return p;
    const nums = m[1].split(/,\s*/);
    return (
      <sup key={i} className="text-link whitespace-nowrap">
        {' '}[
        {nums.map((n, j) => (
          <span key={n}>
            {j > 0 && ', '}
            <a href={`#source-${n}`} className="hover:underline">{n}</a>
          </span>
        ))}
        ]
      </sup>
    );
  });
}

function H2({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <h2 id={id} className="font-bold text-ink" style={{ fontSize: 'clamp(24px, 3vw, 32px)', lineHeight: 1.2 }}>
      {children}
    </h2>
  );
}

export default function Screening40KharkivPage() {
  const partnerWithBooking = registry.institutions.find((i) => i.is_partner && i.online_booking && i.clinic_slug);
  const asOf = dateLabel(registry.as_of) ?? dateLabel(SCREENING_40.verifiedAt);

  const nav = [
    { id: 'yak', label: 'Як пройти' },
    { id: 'skryninh', label: 'Що входить' },
    { id: INSTITUTIONS_ID, label: 'Заклади' },
    { id: 'pytannia', label: 'Питання' },
  ];

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'MedicalWebPage',
      name: doc.fm.h1,
      url: PAGE_URL,
      about: { '@type': 'MedicalTest', name: "Скринінг здоров'я 40+" },
      dateModified: doc.fm.last_updated,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'check-up.in.ua', item: 'https://check-up.in.ua' },
        { '@type': 'ListItem', position: 2, name: "Скринінг здоров'я 40+ у Харкові", item: PAGE_URL },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: S.faq.items.map((q) => ({
        '@type': 'Question',
        name: q.title,
        acceptedAnswer: { '@type': 'Answer', text: q.text.replace(/\s?\[\d+(?:,\s*\d+)*\]/g, '') },
      })),
    },
  ];

  return (
    <>
      <Header city="kharkiv" tone="light" />
      <main className="text-ink">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

        <Hero
          tone="light"
          breadcrumbs={
            <nav aria-label="Breadcrumb">
              <Link href="/">check-up.in.ua</Link>
              <span className="mx-1.5">/</span>
              <span>Скринінг 40+ у Харкові</span>
            </nav>
          }
          eyebrow="Державна програма"
          h1={doc.fm.h1}
          h1Tail={doc.fm.h1_tail}
          lead={doc.fm.lead}
          summary={
            <p className="text-[15px] font-semibold text-ink">
              {programAmountText()} на Дія.Картку · від 40 років · станом на {asOf}
            </p>
          }
          cta={
            partnerWithBooking ? (
              <ScreeningBookCta clinicSlug={partnerWithBooking.clinic_slug!} clinicName={partnerWithBooking.partner_brand ?? partnerWithBooking.name} sourceCta="screening40_hero" />
            ) : (
              <ButtonLink variant="structural" href={`#${INSTITUTIONS_ID}`}>
                Обрати заклад
              </ButtonLink>
            )
          }
        />

        <InPageNav items={nav} />

        <Section id="yak" width="read">
          <H2>Як пройти скринінг у Харкові</H2>
          <StageScale items={S.how.items.map((s, i) => [String(i + 1), <><strong className="block">{s.title}</strong>{withSources(s.text)}</>])} />
        </Section>

        <Section tone="muted" width="read">
          <H2>Хто має право</H2>
          <CheckList items={S.eligibility.list.map(withSources)} />
        </Section>

        <Section id="skryninh" width="read">
          <H2>Що входить у скринінг</H2>
          {S.includes.paragraphs.map((p) => <Lead key={p}>{withSources(p)}</Lead>)}
          <CheckList items={S.includes.list.map(withSources)} />
        </Section>

        <Section id={INSTITUTIONS_ID} tone="muted">
          <H2>Заклади програми в Харкові</H2>
          <InstitutionList institutions={registry.institutions} asOfLabel={dateLabel(registry.as_of)} sourceUrl={SCREENING_40.officialUrl} partnerNote={PARTNER_NOTE} partial={registry.partial} />
        </Section>

        <Section width="read">
          <Accordion summary="Як підготуватися" as="h3">
            {S.preparation.paragraphs.map((p) => <p key={p}>{withSources(p)}</p>)}
          </Accordion>
        </Section>

        <Section tone="muted" width="read">
          <H2>Чого скринінг не перевіряє</H2>
          <div className="mt-5">
            <InfoCard title="Поза програмою">
              {S.not_included.teaser && <p className="text-text-secondary leading-relaxed">{withSources(S.not_included.teaser)}</p>}
              <ul className="mt-3 list-disc pl-5 space-y-1 text-text-secondary">
                {S.not_included.list.map((x) => <li key={x}>{x}</li>)}
              </ul>
              <p className="mt-4 text-[15px]">
                Перевірити більше за віком:{' '}
                <Link className="text-link underline" href="/ukr/female-checkup/40-50-rokiv/kharkiv?source_cta=screening_to_checkup">чекап для жінок 40–50 у Харкові</Link>,{' '}
                <Link className="text-link underline" href="/ukr/screening/mamografiia?source_cta=screening_to_checkup">мамографія</Link>,{' '}
                <Link className="text-link underline" href="/ukr/screening/pap-test?source_cta=screening_to_checkup">ПАП-тест</Link>.
              </p>
            </InfoCard>
          </div>
        </Section>

        <Section width="read">
          <H2>Що робити з результатами</H2>
          {S.results.paragraphs.map((p) => <Lead key={p}>{withSources(p)}</Lead>)}
          <Note>{RESULTS_NOTE}</Note>
        </Section>

        <Section id="pytannia" tone="muted" width="read">
          <H2>Часті питання</H2>
          <div className="mt-5">
            {S.faq.items.map((q) => (
              <Accordion key={q.title} summary={q.title} as="h3">
                <p>{withSources(q.text)}</p>
              </Accordion>
            ))}
          </div>
        </Section>

        <Section width="read">
          <Accordion summary="Джерела" as="h3">
            <ol className="space-y-3 list-none">
              {doc.fm.sources.map((s, i) => (
                <li key={s.url} id={`source-${i + 1}`} className="flex gap-3 text-sm leading-relaxed scroll-mt-24">
                  <span className="font-semibold text-ink shrink-0">{i + 1}.</span>
                  <span>
                    <a className="text-link underline" href={s.url} rel="noopener">{s.title}</a> ({dateLabel(s.date)})
                  </span>
                </li>
              ))}
            </ol>
          </Accordion>
          <p className="mt-6 text-xs text-gray-500">
            Текст підготувала редакція check-up.in.ua; ми не лікарі. Оновлено: {dateLabel(doc.fm.last_updated)}.
          </p>
        </Section>
      </main>
      <StickyMobileCta browseOnly revealAfterId="hero" zoneId={INSTITUTIONS_ID} browseLabel="Обрати заклад" />
    </>
  );
}
