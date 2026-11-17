// Сторінка клініки /turkey/{клініка} (TURKEY-MIGRATION.md v0.6, розділ 3). Лише наявні компоненти каркасу.
// Порядок: Hero (H1 і рядок під ним – Tilda) → про клініку (Tilda) → програми з бази (ProgramCard + Accordion + BookCta)
// → «Как проходит check-up» (Tilda, StageScale) → GEO-блок → форма (BookCta + BookingFlow).
// Тексти – дослівно з docs/turkey/tilda/ (lib/turkey/content.generated.ts); підписи – docs/turkey/ui-ru.json.
// Сторінка доступна лише як чернетка (?drafts=1): у lib/seo/approved-routes.json її немає.

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Header from '@/components/frame/Header';
import Hero from '@/components/frame/Hero';
import Section from '@/components/frame/Section';
import Accordion from '@/components/frame/Accordion';
import ProgramCard from '@/components/frame/ProgramCard';
import GeoBlock from '@/components/frame/GeoBlock';
import SiteFooter from '@/components/frame/SiteFooter';
import { CheckList, StageScale } from '@/components/frame/TextBlocks';
import BookingFlow, { BookCta } from '@/components/city/BookingFlow';
import { formatPrice } from '@/lib/format/price';
import { fillLabel } from '@/lib/format/labels';
import { TURKEY_CONTENT } from '@/lib/turkey/content.generated';
import { fetchTurkeyClinic, type TurkeyClinicKey, type TurkeyProgram } from '@/lib/turkey/data';
import {
  Breadcrumbs,
  JsonLd,
  TURKEY_BOOKING_LABELS,
  TURKEY_BOOK_CTA_LABEL,
  TURKEY_CARD_LABELS,
  TURKEY_CITY,
  TURKEY_CURRENCY,
  TURKEY_LANG,
  TURKEY_POLICY_HREF,
  TURKEY_SITE,
  formatPriceDate,
  turkeyHeading,
  turkeySeo,
} from './_shared';

// Title і H1 – як на Tilda (знімок 15.11.2026, розділ 1 документа); зміна – лише в кроці оптимізації.
const TITLES: Record<TurkeyClinicKey, string> = {
  livhospital: 'Пройти check-up в LIV Hospital | Стамбул, Турция',
  acibadem: 'Пройти check-up в Acibadem | Стамбул, Турция',
  anadolu: 'Check-up в клинике Анадолу | Турция',
};

export function turkeyClinicMetadata(key: TurkeyClinicKey): Metadata {
  const url = `${TURKEY_SITE}/turkey/${key}`;
  const seo = turkeySeo(`/turkey/${key}`);
  return {
    // absolute: без суфікса «| check-up.in.ua» з root layout – Title дослівно як на Tilda.
    title: { absolute: TITLES[key] },
    description: seo.description,
    alternates: { canonical: url },
    openGraph: { title: TITLES[key], description: seo.ogDescription, url, type: 'website' },
  };
}

function Groups({ groups }: { groups: { group: string; items: string[] }[] }) {
  return (
    <div className="space-y-4 text-[15px] text-text-secondary leading-relaxed pb-2">
      {groups.map((g, i) => (
        <div key={`${g.group}-${i}`}>
          {g.group && <p className="font-semibold text-ink mb-1">{g.group}</p>}
          <ul className="list-disc pl-5 space-y-1">
            {g.items.map((it) => (
              <li key={it}>{it}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function ProgramBlock({ program, multi, sourceCta }: { program: TurkeyProgram; multi: boolean; sourceCta: string }) {
  const d = program.details;
  const L = TURKEY_CARD_LABELS;
  const rawComposition: unknown = program.composition;
  const composition = (Array.isArray(rawComposition) ? rawComposition : []) as { group: string; items: string[] }[];
  const meta = d?.duration ? [`${L.duration}: ${d.duration}`] : [];
  const sections = (
    <>
      {d?.description && d.description.length > 0 && (
        <Accordion as="h4" size="sm" summary={L.description}>
          <div className="space-y-3 text-[15px] text-text-secondary leading-relaxed pb-2">
            {d.description.map((t) => (
              <p key={t}>{t}</p>
            ))}
          </div>
        </Accordion>
      )}
      {d?.goals && d.goals.length > 0 && (
        <Accordion as="h4" size="sm" summary={L.goals}>
          <ul className="list-disc pl-5 space-y-1 text-[15px] text-text-secondary leading-relaxed pb-2">
            {d.goals.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </Accordion>
      )}
      {composition.length > 0 && (
        <Accordion as="h4" size="sm" summary={L.composition}>
          <Groups groups={composition} />
        </Accordion>
      )}
      {d?.preparation && d.preparation.length > 0 && (
        <Accordion as="h4" size="sm" summary={L.preparation}>
          <Groups groups={d.preparation} />
        </Accordion>
      )}
    </>
  );
  return (
    <ProgramCard
      id={`program-${program.slug}`}
      buyId={`program-buy-${program.slug}`}
      title={program.name_ru}
      meta={meta}
      sections={sections}
      buy={
        <>
          <p className="text-[30px] font-bold text-[var(--brand-primary)] leading-tight" style={{ fontFamily: "'Source Serif 4', Georgia, serif" }} data-price={program.price_discount}>
            {formatPrice(program.price_discount, TURKEY_CURRENCY)}
          </p>
          {program.price_date && <p className="text-[13px] text-text-secondary -mt-2">{fillLabel(L.priceDate, { date: formatPriceDate(program.price_date) })}</p>}
          <BookCta programSlug={program.slug} sourceCta={`${sourceCta}_card`} label={TURKEY_BOOK_CTA_LABEL} variant={multi ? 'secondary' : 'primary'} />
        </>
      }
    >
      {d?.summary && <p className="mt-3 text-[16px] text-ink leading-relaxed">{d.summary}</p>}
    </ProgramCard>
  );
}

export default async function TurkeyClinicPage({ clinicKey }: { clinicKey: TurkeyClinicKey }) {
  const data = await fetchTurkeyClinic(clinicKey);
  if (!data.clinic) notFound();
  const { clinic, branches, programs } = data;
  const c = TURKEY_CONTENT.clinics[clinicKey];
  const heading = turkeyHeading(`/turkey/${clinicKey}`);
  const url = `${TURKEY_SITE}/turkey/${clinicKey}`;
  const sourceCta = `turkey_${clinicKey}`;
  const multi = programs.length > 1;

  // Тексти опису: перший рядок і абзаци – <p>; короткі рядки-перелік (Acibadem) – CheckList, як на Tilda.
  const [firstAbout, ...restAbout] = c.about;
  const isList = (t: string) => t.length < 80;
  const aboutParas = [firstAbout, ...restAbout.filter((t) => !isList(t))].filter(Boolean);
  const aboutList = restAbout.filter(isList);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MedicalClinic',
    name: clinic.name,
    url,
    ...(branches.length > 0 ? { address: branches.map((b) => ({ '@type': 'PostalAddress', streetAddress: b.address_ru })) } : {}),
    makesOffer: programs.map((p) => ({
      '@type': 'Offer',
      priceCurrency: p.currency,
      price: p.price_discount,
      itemOffered: { '@type': 'Service', name: p.name_ru },
    })),
  };

  return (
    <div lang={TURKEY_LANG}>
      <Header city={null} tone="dark" />
      <main className="text-[#0b1a24]">
        <JsonLd data={jsonLd} />

        <Hero
          tone="dark"
          breadcrumbs={<Breadcrumbs items={[{ label: c.crumbs[0], href: '/' }, { label: c.crumbs[1], href: '/turkey' }, { label: c.crumbs[2] }]} />}
          h1Size="clamp(30px, 5vw, 56px)"
          h1={heading.h1}
          lead={heading.lead ?? c.sub}
        />

        <Section tone="white" width="read" id="o-klinike">
          <div className="space-y-4 text-[16px] leading-relaxed text-text-secondary">
            {aboutParas.map((t) => (
              <p key={t}>{t}</p>
            ))}
          </div>
          {aboutList.length > 0 && <CheckList items={aboutList} />}
        </Section>

        {programs.length > 0 && (
          <Section tone="muted" id="programmy">
            <div className="flex flex-col gap-4 max-w-[1000px]">
              {programs.map((p) => (
                <ProgramBlock key={p.id} program={p} multi={multi} sourceCta={sourceCta} />
              ))}
            </div>
          </Section>
        )}

        <Section tone="white" width="read" id="kak-prohodit">
          <h2 className="text-[24px] lg:text-[28px] font-bold text-ink leading-tight">{c.howTitle}</h2>
          <StageScale
            items={c.howSteps.map((s) => [
              s.num,
              <span key={s.num}>
                <span className="font-semibold">{s.name}.</span> {s.text}
              </span>,
            ])}
          />
        </Section>

        {/* GEO-блок: клініка, Стамбул, адреса філій з бази. Затвердженого тексту GEO для /turkey* немає – лише ці дані (розділ 3, п. 5). */}
        <GeoBlock tone="muted" paragraphs={[`${clinic.name}, Стамбул`]} addresses={branches.map((b) => b.address_ru)} />

        <Section tone="white" width="read" id="forma">
          <h2 className="text-[24px] lg:text-[28px] font-bold text-ink leading-tight">{c.formTitle}</h2>
          <div className="mt-5 max-w-sm">
            <BookCta sourceCta={`${sourceCta}_form`} label={TURKEY_BOOK_CTA_LABEL} />
          </div>
        </Section>
      </main>
      <SiteFooter city={null} />
      <BookingFlow
        programs={programs}
        branches={branches.map((b) => ({ id: b.id, address_ua: b.address_ua, metro_ua: b.metro_ua, address: b.address_ru, metro: b.metro_ru }))}
        clinicId={clinic.id}
        clinicSlug={clinic.slug}
        city={TURKEY_CITY}
        labels={TURKEY_BOOKING_LABELS}
        currency={TURKEY_CURRENCY}
        policyHref={TURKEY_POLICY_HREF}
        programNames={Object.fromEntries(programs.map((p) => [p.slug, p.name_ru]))}
      />
    </div>
  );
}
