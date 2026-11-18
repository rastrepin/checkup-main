// Хаб /turkey (TURKEY-MIGRATION.md v0.6, розділ 3): H1 і вступ – Tilda; три клініки рядками LinkRows з ціною «от {minPrice} USD» з бази;
// 5 кроків (StageScale); форма консультації без вибору програми (виняток для /turkey, рішення Ігоря 17.11.2026).
// Кнопок запису на хабі, окрім форми консультації, немає (ui-kit §6.13а). Сторінка – чернетка (?drafts=1).

import type { Metadata } from 'next';
import Header from '@/components/frame/Header';
import Hero from '@/components/frame/Hero';
import Section from '@/components/frame/Section';
import SiteFooter from '@/components/frame/SiteFooter';
import { CheckList, StageScale } from '@/components/frame/TextBlocks';
import BookingFlow, { BookCta } from '@/components/city/BookingFlow';
import { LinkRows } from '@/components/city/HubBlocks';
import { formatPrice } from '@/lib/format/price';
import { fillLabel } from '@/lib/format/labels';
import { TURKEY_CONTENT } from '@/lib/turkey/content.generated';
import { fetchTurkeyClinic, fetchTurkeyHubLeadClinic, minPriceUsd, type TurkeyClinicKey } from '@/lib/turkey/data';
import {
  Breadcrumbs,
  JsonLd,
  TURKEY_BOOKING_LABELS,
  TURKEY_BOOK_CTA_LABEL,
  TURKEY_CITY,
  TURKEY_CURRENCY,
  TURKEY_FROM_PRICE,
  TURKEY_LANG,
  TURKEY_POLICY_HREF,
  TURKEY_SITE,
  turkeyHeading,
  turkeySeo,
} from './_shared';

export const revalidate = 3600;

// Title – как на Tilda (знімок 15.11.2026, розділ 1 документа).
const TITLE = 'ᐈ Пройдите Check-up в Турции ᐈ 3 Лучших Мед. Центра';
const URL = `${TURKEY_SITE}/turkey`;

const SEO = turkeySeo('/turkey');

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: SEO.description,
  alternates: { canonical: URL },
  openGraph: { title: TITLE, description: SEO.ogDescription, url: URL, type: 'website' },
};

export default async function TurkeyHubPage() {
  const h = TURKEY_CONTENT.hub;
  const heading = turkeyHeading('/turkey');
  const keys = h.cards.map((c) => c.clinic as TurkeyClinicKey);
  const [data, leadClinic] = await Promise.all([Promise.all(keys.map((k) => fetchTurkeyClinic(k))), fetchTurkeyHubLeadClinic()]);
  const items = h.cards.map((card, i) => {
    const min = minPriceUsd(data[i].programs);
    return {
      label: card.title,
      href: `/turkey/${card.clinic}`,
      // Ціна на рядку – лише коли вона є в базі (ui-kit §6.13а); «от» – зі словника ui-ru.json.
      line: min === null ? null : fillLabel(TURKEY_FROM_PRICE, { price: formatPrice(min, TURKEY_CURRENCY) }),
    };
  });

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: h.h2,
    itemListElement: h.cards.map((card, i) => {
      const min = minPriceUsd(data[i].programs);
      return {
        '@type': 'ListItem',
        position: i + 1,
        item: {
          '@type': 'MedicalClinic',
          name: data[i].clinic?.name ?? card.title,
          url: `${URL}/${card.clinic}`,
          ...(min === null ? {} : { makesOffer: { '@type': 'AggregateOffer', priceCurrency: TURKEY_CURRENCY, lowPrice: min } }),
        },
      };
    }),
  };

  return (
    <div lang={TURKEY_LANG}>
      <Header city={null} tone="dark" />
      <main className="text-[#0b1a24]">
        <JsonLd data={jsonLd} />
        <Hero
          tone="dark"
          breadcrumbs={<Breadcrumbs items={[{ label: h.crumbs[0], href: '/' }, { label: heading.breadcrumb ?? h.crumbs[1] }]} />}
          h1Size="clamp(30px, 5vw, 56px)"
          h1={heading.h1}
          lead={h.sub}
        />

        <Section tone="white" width="read" id="kliniki">
          <h2 className="text-[24px] lg:text-[28px] font-bold text-ink leading-tight">{h.h2}</h2>
          <LinkRows items={items} />
        </Section>

        <Section tone="muted" width="read" id="kak-prohodit">
          <h2 className="text-[24px] lg:text-[28px] font-bold text-ink leading-tight">{h.steps.title}</h2>
          <StageScale
            items={h.steps.steps.map((s) => [
              s.num,
              <span key={s.num}>
                <span className="font-semibold">{s.name}.</span> {s.text}
              </span>,
            ])}
          />
        </Section>

        {/* Блок довіри з abroad (хвиля B, розділ 3, п. 3а): 3 пункти дослівно, без заголовка. */}
        <Section tone="white" width="read" id="doverie">
          <CheckList items={[...h.trust]} />
        </Section>

        <Section tone="white" width="read" id="forma">
          <h2 className="text-[24px] lg:text-[28px] font-bold text-ink leading-tight">{h.formTitle}</h2>
          <div className="mt-5 max-w-sm">
            <BookCta sourceCta="turkey_hub_form" label={TURKEY_BOOK_CTA_LABEL} />
          </div>
        </Section>
      </main>
      <SiteFooter city={null} />
      {/* Форма консультації без вибору програми. Заявки з хабу – на клініку dmu-turkey (група DMU, рішення Ігоря 17.11.2026);
          у списку клінік хабу її немає. Немає запису в clinics – як раніше, без клініки. */}
      <BookingFlow
        programs={[]}
        branches={[]}
        clinicId={leadClinic?.id ?? ''}
        clinicSlug={leadClinic?.slug ?? ''}
        city={TURKEY_CITY}
        labels={TURKEY_BOOKING_LABELS}
        currency={TURKEY_CURRENCY}
        policyHref={TURKEY_POLICY_HREF}
      />
    </div>
  );
}
