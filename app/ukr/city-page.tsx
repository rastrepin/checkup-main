import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Header from '@/components/frame/Header';
import Section from '@/components/frame/Section';
import {
  absUrl,
  AuthorAndRating,
  ClinicsBlock,
  docMeta,
  docText,
  FaqBlock,
  firstLink,
  GeoBlock,
  geoHasContent,
  H2,
  HubHero,
  hubJsonLd,
  hubVars,
  linkItems,
  LinkRows,
  MdSectionBody,
  nestedVar,
  SourcesList,
} from '@/components/city/HubBlocks';
import { faqItems, loadCityMdSections, sectionHeading, sectionText, type CityMdDoc } from '@/lib/content/city-md';
import { getCheckupCity, type CheckupCity, type OtherServiceKey } from '@/lib/cities/checkup-cities';
import { cityVariant, fetchCityClinics, minPriceFor, SITE, type HubClinic } from '@/lib/cities/hub-data';
import { HUB_REVIEWERS } from '@/lib/cities/hub-reviewers';
import { isApprovedRoute } from '@/lib/seo/approved-routes';

// Хаб міста /ukr/{slug} – шаблон для всіх міст з lib/cities/checkup-cities.ts (хвиля 1: Харків, Дніпро, Одеса – варіант А,
// Ужгород – варіант Б). Сторінка міста – тонка обгортка app/ukr/{slug}/page.tsx (scripts/cities/new-city-pages.mjs).
// Тексти – content/{city.contentDir}/city.md (CITY-HUB-TEXTS v1.6 дослівно). Порядок і вигляд блоків –
// docs/ux/specs/2026-11-city-hub.md v0.1, §1:
//   1 шапка · 2 hero темний без кнопки · 3 хаби статі · 4 як пройти · 5 клініки · 6 окремі скринінги ·
//   7 навіщо потрібен Check-up · 8 FAQ і рецензент · 9 інші послуги · 10 про команду · 11 GEO (12 футер – не на цих сторінках).
// Кнопки запису на хабі немає (специфікація §1, ui-kit §6.13): ні BookingFlow, ні закріпленої панелі.
// Дані – Supabase: клініки й філії (lib/cities/hub-data.ts), {min_price} – один розрахунок для meta і рядка ціни.
// Телефонів немає ніде (PLATFORM-LINE §5). hreflang немає (SEO-MIGRATION §4).

const UPDATED_ISO = '2026-11-01';

function pageCity(citySlug: string) {
  const city = getCheckupCity(citySlug);
  if (!city) notFound();
  const PAGE_PATH = `/ukr/${city.slug}`;
  return { city, PAGE_PATH, PAGE_URL: `${SITE}${PAGE_PATH}` };
}

async function loadHub(city: CheckupCity) {
  const [clinics, minPrice] = await Promise.all([fetchCityClinics(city), minPriceFor(city, 'all')]);
  const vars = hubVars(city, clinics, minPrice);
  const pre = loadCityMdSections(city.contentDir, 'city', vars);
  const faq6 = nestedVar(pre, `faq6_${cityVariant(city)}`, vars);
  const doc = faq6 ? loadCityMdSections(city.contentDir, 'city', { ...vars, faq6 }) : pre;
  return { clinics, vars, doc };
}

/** meta description: варіант А / Б з ціною; без ціни – тимчасовий текст з MD (SEO-MIGRATION 2А). */
function metaFor(doc: CityMdDoc | null, city: CheckupCity, clinics: HubClinic[]): string | undefined {
  if (cityVariant(city) === 'b') return docMeta(doc, ['meta_b', 'meta_b_noprice']);
  return clinics.length ? docMeta(doc, ['meta_a', 'meta_a_noprice']) : docMeta(doc, ['meta_noclinic']);
}

export async function cityHubMetadata(citySlug: string): Promise<Metadata> {
  const { city, PAGE_URL } = pageCity(citySlug);
  const { clinics, doc } = await loadHub(city);
  const title = docText(doc, 'title') ?? undefined;
  const description = metaFor(doc, city, clinics);
  return {
    title: title ? { absolute: title } : undefined,
    description,
    robots: { index: true, follow: true },
    // Self-canonical; hreflang у хвилі 1 не виводиться (SEO-MIGRATION §4).
    alternates: { canonical: PAGE_URL },
    openGraph: { title, description, url: PAGE_URL, type: 'website' },
  };
}

export default async function CityHubPage({ citySlug }: { citySlug: string }) {
  const { city, PAGE_URL } = pageCity(citySlug);
  const { clinics, vars, doc } = await loadHub(city);
  if (!doc) notFound();
  const variant = cityVariant(city);
  const s = doc.sections;
  const h1 = sectionText(s.h1) ?? '';

  const genderCards = linkItems(s.gender);
  const screenings = linkItems(s.screenings);
  const services = linkItems(s.other_services)
    .map((it) => ({ ...it, href: city.otherServices[it.href as OtherServiceKey] ?? '' }))
    .filter((it) => it.href);
  const faq = faqItems(s.faq);
  const reviewer = HUB_REVIEWERS.city;
  const showClinics = clinics.length > 0;
  const showGeo = geoHasContent(city, clinics);
  // «Детальніше про команду» – лише коли сторінку команди погоджено (CITY-HUB-TEXTS [УТОЧНИТИ] 3, специфікація §5.4).
  const teamMore = firstLink(s.team_more);
  const showTeamMore = Boolean(teamMore && isApprovedRoute(teamMore.href));

  // Фони смуг – білий / сірий по черзі в порядку блоків, що рендеряться (ui-kit §2.4).
  const order = [
    'gender',
    'how',
    showClinics && 'clinics',
    'screenings',
    'why',
    'faq',
    services.length > 0 && 'services',
    'team',
    showGeo && 'geo',
  ].filter((k): k is string => Boolean(k));
  const tone = (k: string): 'white' | 'muted' => (order.indexOf(k) % 2 === 0 ? 'white' : 'muted');

  const jsonLd = hubJsonLd({
    pageUrl: PAGE_URL,
    name: h1,
    description: metaFor(doc, city, clinics),
    dateModified: UPDATED_ISO,
    reviewer,
    breadcrumbs: [
      { name: 'check-up.in.ua', item: SITE },
      { name: city.name, item: PAGE_URL },
    ],
    // ItemList – лише видимі посилання: картки хабів статі і скринінги (SEO-MIGRATION §7, Н2).
    itemList: [...genderCards, ...screenings].map((it) => ({ name: it.label, url: absUrl(it.href) })),
    faq,
  });

  return (
    <>
      <Header city={city.slug} tone="dark" />
      <main className="text-ink">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

        {/* 2. Hero – темний, без кнопки і без ціни */}
        <HubHero
          breadcrumbs={[{ label: 'check-up.in.ua', href: '/' }, { label: city.name }]}
          eyebrow={`Чекап · ${city.name}`}
          h1={h1}
          lead={sectionText(s[`lead_${variant}`])}
        />

        {/* 3. Хаби статі – 2 картки */}
        <Section tone={tone('gender')} id="stat">
          <H2>{sectionHeading(s.gender)}</H2>
          <div className="mt-6 grid grid-cols-1 gap-[var(--space-grid)] md:grid-cols-2">
            {genderCards.map((c) => (
              <a
                key={c.href}
                href={c.href}
                className="group flex flex-col bg-white border border-[var(--border)] rounded-[var(--radius-lg)] p-[var(--space-card)] hover:border-[var(--link)]"
              >
                <h3 className="text-[20px] font-semibold leading-[1.3] text-ink group-hover:text-link">{c.label} →</h3>
                {c.line && <p className="mt-2 text-[15px] leading-relaxed text-text-secondary">{c.line}</p>}
              </a>
            ))}
          </div>
        </Section>

        {/* 4. Як пройти чекап – 4 кроки і примітки */}
        <Section tone={tone('how')} width="read" id="yak-proity">
          <MdSectionBody section={s[`how_${variant}`]} />
        </Section>

        {/* 5. Клініки-партнери – рядок ціни і нейтральні картки (без телефону, запису, програм і цін у картці) */}
        {showClinics && <ClinicsBlock doc={doc} city={city} clinics={clinics} tone={tone('clinics')} />}

        {/* 6. Окремі скринінги */}
        <Section tone={tone('screenings')} width="read" id="skryninhy">
          <MdSectionBody section={s.screenings} paragraphsOnly />
          <LinkRows items={screenings} />
        </Section>

        {/* 7. Навіщо потрібен Check-up */}
        <Section tone={tone('why')} width="read" id="navishcho">
          <MdSectionBody section={s.why} />
          <SourcesList section={s.sources} />
        </Section>

        {/* 8. FAQ і рядок медичного рецензента */}
        <FaqBlock heading={sectionHeading(s.faq)} items={faq} reviewer={reviewer} tone={tone('faq')} />

        {/* 9. Інші послуги в місті – тематичні сторінки, що лишаються на Tilda */}
        {services.length > 0 && (
          <Section tone={tone('services')} width="read" id="inshi-posluhy">
            <H2>{sectionHeading(s.other_services)}</H2>
            <LinkRows items={services} />
          </Section>
        )}

        {/* 10. Про команду: текст, автор, рейтинг Google, посилання */}
        <Section tone={tone('team')} width="read" id="komanda">
          <MdSectionBody section={s.team} />
          <AuthorAndRating doc={doc} />
          {showTeamMore && teamMore && (
            <p className="mt-4">
              <a href={teamMore.href} className="inline-flex items-center min-h-11 text-[15px] font-semibold text-link hover:underline underline-offset-[3px]">
                {teamMore.label}
              </a>
            </p>
          )}
        </Section>

        {/* 11. GEO – без H2, статичний текст з даних */}
        {showGeo && <GeoBlock doc={doc} city={city} clinics={clinics} vars={vars} tone={tone('geo')} />}
      </main>
    </>
  );
}
