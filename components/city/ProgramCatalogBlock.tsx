// Каталог програм клінік на хабі статі – серверна частина (gender-hub v0.1 §1 блок 4, §3–§7; задача НОРМАТИВ 26.11).
// Дані – lib/programs/catalog.ts (єдина функція читання, запобіжник program_type = 'clinic').
// Картка – AgeProgramCard (variant="catalog"); рамка програми – композиція наявних ProgramCard (§29.12), ProgramLocation (§29.11)
// і booking-кнопки, окремого компонента немає. Усі картки і всі рамки – у серверному HTML; керування – ProgramCatalog (клієнт).
// Тексти – з `## catalog` у .md (CITY-HUB-TEXTS §9, v1.16); ключа немає – елемента немає.
// Одна booking-кнопка на рамку, відкрита одна рамка. Заявка: source_cta 'catalog', variant 3, entry_point 'page'
// (маршрут заявок не змінюється; рішення Ігоря 26.11).

import Section from '@/components/frame/Section';
import Eyebrow from '@/components/frame/Eyebrow';
import ProgramCard from '@/components/frame/ProgramCard';
import ProgramLocation from '@/components/frame/ProgramLocation';
import { H2 } from '@/components/city/HubBlocks';
import BookingFlow, { BookCta } from '@/components/city/BookingFlow';
import { AgeProgramCard, ProgramIncludes, type AgeProgramsZoneLabels, AGE_PROGRAMS_ZONE_LABELS } from '@/components/city/AgeProgramCard';
import ProgramCatalog, { FrameToggle, type CatalogItem } from '@/components/city/ProgramCatalog';
import { visitsMeta } from '@/components/city/AgeProgramsZone';
import type { CheckupCity } from '@/lib/cities/checkup-cities';
import type { CatalogTexts } from '@/lib/content/age-page-texts';
import { ageLabelFor, CATALOG_AGES } from '@/lib/programs/catalog-age';
import type { CatalogProgram, GenderCatalog } from '@/lib/programs/catalog';
import { groupGen, type AgeSegment, type PlanGender } from '@/lib/plan/age-groups';
import { formatPrice } from '@/lib/format/price';

export const CATALOG_ANCHOR = 'katalog';
const SOURCE_CTA = 'catalog';
/** Напис панелі mobile і рядок над кнопкою – словник за замовчуванням, ключа в .md немає. */
const BOOK_LABEL = 'Записатися · {price}';
const FRAME_KICKER = 'Клініка';
const FRAME_MORE = 'Адреси філій';

function fmtDate(iso: string) {
  const [y, m, d] = iso.slice(0, 10).split('-');
  return `${d}.${m}.${y}`;
}

function CatalogFrame({ p, city }: { p: CatalogProgram; city: CheckupCity }) {
  const { program, clinic, composition, branches } = p;
  const buyId = `buy-${p.key}`;
  return (
    <div className="grid gap-3">
      <ProgramCard
        id={`frame-${p.key}`}
        title={program.name_ua}
        meta={visitsMeta(composition)}
        sections={<ProgramIncludes composition={composition} />}
        buyId={buyId}
        buy={
          <>
            {p.payable !== null && (
              <div>
                <p className="flex flex-wrap items-baseline gap-x-2">
                  <span data-price={p.payable} className="text-[30px] font-bold text-[var(--brand-primary)] leading-tight" style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
                    {formatPrice(p.payable)}
                  </span>
                  {p.discount && (
                    <>
                      <span className="text-[14px] text-text-secondary line-through">{formatPrice(p.discount.regular)}</span>
                      <span className="text-[14px] text-text-secondary">−{p.discount.pct}%</span>
                    </>
                  )}
                </p>
                {program.price_date && <p className="text-[13px] text-text-secondary mt-1">Ціна клініки станом на {fmtDate(program.price_date)}</p>}
              </div>
            )}
            {/* Єдина кнопка запису на екрані (ui-kit §6.1): booking, без кольору клініки (age-page-zones §4.1). */}
            <BookCta programSlug={program.slug} sourceCta={SOURCE_CTA} lead={{ variant: 3, entryPoint: 'page' }} label="Записатися" />
          </>
        }
      >
        {null}
      </ProgramCard>
      <ProgramLocation
        kicker={FRAME_KICKER}
        name={clinic.name}
        city={`в ${city.loc}`}
        branches={branches.map((b) => ({ id: b.id, name: b.name_ua, address: b.address_ua, metro: b.metro_ua }))}
        moreLabel={FRAME_MORE}
      />
    </div>
  );
}

export default function ProgramCatalogBlock({
  catalog,
  texts,
  city,
  gender,
  tone,
}: {
  catalog: GenderCatalog;
  texts: CatalogTexts;
  city: CheckupCity;
  gender: PlanGender;
  tone: 'white' | 'muted';
}) {
  if (catalog.programs.length === 0) return null;
  const labels: AgeProgramsZoneLabels = AGE_PROGRAMS_ZONE_LABELS;
  const ageText = { filterAges: texts.filterAges, any: texts.ageAny, after40: texts.ageAfter40 };

  const items: CatalogItem[] = catalog.programs.map((p) => ({
    key: p.key,
    clinicSlug: p.clinic.slug,
    programSlug: p.program.slug,
    ageGroup: p.ageGroup,
    price: p.payable,
    hasDiscount: p.discount !== null,
    buyId: `buy-${p.key}`,
    card: (
      <AgeProgramCard
        variant="catalog"
        card={{ key: p.key, program: p.program, clinic: p.clinic, branches: p.branches, composition: p.composition }}
        index={0}
        cityLoc={city.loc}
        sourceCta={SOURCE_CTA}
        multi
        currency="UAH"
        labels={labels}
        catalog={{
          id: `program-${p.key}`,
          clinicShortName: p.clinicShortName,
          ageLine: ageLabelFor(p.ageGroup, ageText),
          payable: p.payable,
          discount: p.discount,
          footer: texts.open ? <FrameToggle itemKey={p.key} label={texts.open} /> : null,
        }}
      />
    ),
    frame: <CatalogFrame p={p} city={city} />,
  }));

  const groupGenByAge = Object.fromEntries(CATALOG_AGES.map((a) => [a, groupGen(gender, a)])) as Record<AgeSegment, string>;
  const ageHref = Object.fromEntries(CATALOG_AGES.map((a) => [a, `/ukr/${gender}-checkup/${a}/${city.slug}`])) as Record<AgeSegment, string>;

  // По модалу запису на клініку: відкривається лише для її програм (BookingFlow фільтрує за slug програми).
  const byClinic = new Map<string, CatalogProgram[]>();
  for (const p of catalog.programs) byClinic.set(p.clinic.slug, [...(byClinic.get(p.clinic.slug) ?? []), p]);

  return (
    <>
      <Section tone={tone} id={CATALOG_ANCHOR} ariaLabelledby={texts.h2 ? `${CATALOG_ANCHOR}-h2` : undefined}>
        {texts.eyebrow && <Eyebrow className="mb-[var(--space-eyebrow)]">{texts.eyebrow}</Eyebrow>}
        {texts.h2 && <H2 id={`${CATALOG_ANCHOR}-h2`}>{texts.h2}</H2>}
        {texts.priceLine && (
          <p className="mt-3 text-[20px] font-bold text-ink leading-tight" style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
            {texts.priceLine}
          </p>
        )}
        {catalog.hasDiscount && texts.discount && <p className="mt-2 max-w-[720px] text-[15px] leading-relaxed text-text-secondary">{texts.discount}</p>}
        <div className="mt-6">
          <ProgramCatalog
            items={items}
            texts={{
              filterLabel: texts.filterLabel,
              filterAll: texts.filterAll,
              filterAges: texts.filterAges,
              sortLabel: texts.sortLabel,
              sortOptions: texts.sortOptions,
              sortNote: texts.sortNote,
              shown: texts.shown,
              more: texts.more,
              empty: texts.empty,
              emptyPlanLink: texts.emptyPlanLink,
              emptyAllLink: texts.emptyAllLink,
            }}
            groupGen={groupGenByAge}
            ageHref={ageHref}
            sourceCta={SOURCE_CTA}
            bookLabel={BOOK_LABEL}
          />
        </div>
      </Section>
      {[...byClinic.values()].map((list) => {
        const first = list[0];
        return (
          <BookingFlow
            key={first.clinic.slug}
            programs={list.map((p) => p.program)}
            branches={first.branches}
            clinicId={first.clinic.id}
            clinicSlug={first.clinic.slug}
            city={city.slug}
            programsComposition={Object.fromEntries(list.map((p) => [p.program.slug, p.composition.counts]))}
          />
        );
      })}
    </>
  );
}

