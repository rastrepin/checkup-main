import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Header from '@/components/frame/Header';
import Section from '@/components/frame/Section';
import BookingFlow, { BookCta } from '@/components/city/BookingFlow';
import CityMdBlocks from '@/components/city/CityMdBlocks';
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
  MdSectionBody,
  SourcesList,
} from '@/components/city/HubBlocks';
import { faqItems, loadCityMdSections, resolvedBlocks, sectionHeading, sectionText } from '@/lib/content/city-md';
import { getCheckupCity, type CheckupCity } from '@/lib/cities/checkup-cities';
import { cityVariant, fetchCityClinics, fetchScopeOffers, minPriceFor, SITE } from '@/lib/cities/hub-data';
import { HUB_REVIEWERS } from '@/lib/cities/hub-reviewers';

// Сторінка статі в місті /ukr/{female,male}-checkup/{slug} – спільний шаблон обох статей (хвиля 1, 01.11.2026).
// Обгортки: app/ukr/{stat}-checkup/city-page.tsx → app/ukr/{stat}-checkup/{slug}/page.tsx.
// Тексти – content/{city.contentDir}/{stat}-checkup.md: CITY-HUB-TEXTS v1.6 §9 (title, H1, лід, meta, H2, анкори,
// нові питання FAQ, рядок рецензента) і решта – {stat}-checkup.md v0 без змін.
// Блоки 5 (клініки), 8 (рецензент FAQ), 10 (автор, рейтинг), 11 (GEO) – за правилами хабу міста
// (docs/ux/specs/2026-11-city-hub.md §8); блок «Контакти клініки» v0 замінено блоком клінік (CITY-HUB-TEXTS §9).
// Порядок: hero · вікові картки · що змінюється з віком · клініки · FAQ і рецензент · автор і джерела · GEO.
// Запис – кнопки «Записатися» на вікових картках (BookingFlow → /api/leads, source_cta на кожну картку), лише у
// варіанті А: у варіанті Б програму однієї клініки на картці не показуємо (порядок і рівність клінік, PLATFORM-LINE 2.2, 6).
// Телефонів немає (PLATFORM-LINE §5). hreflang немає (SEO-MIGRATION §4).

export type HubGender = 'female' | 'male';

const UPDATED_ISO = '2026-11-01';

const G: Record<HubGender, { crumb: string; eyebrow: string; programs: Record<string, string> }> = {
  female: {
    crumb: 'Жінкам',
    eyebrow: 'Жіночий чекап',
    programs: {
      'do-30-rokiv': 'female-checkup-do-30',
      'do-40-rokiv': 'female-checkup-30-40',
      '40-50-rokiv': 'female-checkup-40-50',
      'vid-50-rokiv': 'female-checkup-vid-50',
    },
  },
  male: {
    crumb: 'Чоловікам',
    eyebrow: 'Чоловічий чекап',
    programs: {
      'do-30-rokiv': 'male-checkup-do-30',
      'do-40-rokiv': 'male-checkup-30-40',
      '40-50-rokiv': 'male-checkup-40-50',
      'vid-50-rokiv': 'male-checkup-vid-50',
    },
  },
};

function pageCity(gender: HubGender, citySlug: string) {
  const city = getCheckupCity(citySlug);
  if (!city) notFound();
  const PAGE_PATH = `/ukr/${gender}-checkup/${city.slug}`;
  return { city, PAGE_PATH, PAGE_URL: `${SITE}${PAGE_PATH}`, SOURCE_CTA: `gender_hub_${gender}_${city.slug}` };
}

async function loadGenderHub(gender: HubGender, city: CheckupCity) {
  const [clinics, minPrice, offersData] = await Promise.all([
    fetchCityClinics(city),
    minPriceFor(city, gender),
    fetchScopeOffers(gender, city.clinicSlug),
  ]);
  const vars = hubVars(city, clinics, minPrice);
  const doc = loadCityMdSections(city.contentDir, `${gender}-checkup`, vars);
  return { clinics, vars, doc, offersData };
}

export async function genderHubMetadataFor(gender: HubGender, citySlug: string): Promise<Metadata> {
  const { city, PAGE_URL } = pageCity(gender, citySlug);
  const { doc } = await loadGenderHub(gender, city);
  const title = docText(doc, 'title') ?? undefined;
  const description = docMeta(doc, [`meta_${cityVariant(city)}`, 'meta_noprice']);
  return {
    title: title ? { absolute: title } : undefined,
    description,
    robots: { index: true, follow: true },
    alternates: { canonical: PAGE_URL },
    openGraph: { title, description, url: PAGE_URL, type: 'website' },
  };
}

/** Сегмент віку з адреси вікової сторінки: /ukr/female-checkup/do-30-rokiv/kharkiv → do-30-rokiv. */
const ageSegment = (href: string) => href.split('/')[3] ?? '';

export default async function GenderHubPage({ gender, citySlug }: { gender: HubGender; citySlug: string }) {
  const { city, PAGE_URL, SOURCE_CTA } = pageCity(gender, citySlug);
  const { clinics, vars, doc, offersData } = await loadGenderHub(gender, city);
  if (!doc) notFound();
  const g = G[gender];
  const variant = cityVariant(city);
  const s = doc.sections;
  const h1 = sectionText(s.h1) ?? '';

  // Програма клініки і запис на картці – лише у варіанті А (одна клініка міста).
  const offers = variant === 'a' ? offersData.offers : [];
  const bookingClinic = variant === 'a' ? offersData.clinic : null;
  const programs = offers.map((o) => o.program);
  const cards = linkItems(s.age_cards).map((c) => {
    const seg = ageSegment(c.href);
    const platformSlug = g.programs[seg];
    const offer = platformSlug ? offers.find((o) => o.platformSlugs.includes(platformSlug)) : undefined;
    return { ...c, seg, program: offer?.program ?? null };
  });
  const cross = firstLink(s.cross);
  const faq = faqItems(s.faq);
  const reviewer = HUB_REVIEWERS[gender];
  const showClinics = clinics.length > 0;
  const showGeo = geoHasContent(city, clinics);

  const order = ['cards', 'changes', showClinics && 'clinics', 'faq', 'author', showGeo && 'geo'].filter((k): k is string => Boolean(k));
  const tone = (k: string): 'white' | 'muted' => (order.indexOf(k) % 2 === 0 ? 'white' : 'muted');

  const jsonLd = hubJsonLd({
    pageUrl: PAGE_URL,
    name: h1,
    description: docMeta(doc, [`meta_${variant}`, 'meta_noprice']),
    dateModified: UPDATED_ISO,
    reviewer,
    breadcrumbs: [
      { name: 'check-up.in.ua', item: SITE },
      { name: city.name, item: `${SITE}/ukr/${city.slug}` },
      { name: g.crumb, item: PAGE_URL },
    ],
    // ItemList – лише видимі посилання на вікові сторінки (SEO-MIGRATION §7).
    itemList: cards.map((c) => ({ name: c.label, url: absUrl(c.href) })),
    faq,
  });

  return (
    <>
      <Header city={city.slug} section={gender} tone="dark" />
      <main className="text-ink">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

        <HubHero
          breadcrumbs={[{ label: 'check-up.in.ua', href: '/' }, { label: city.name, href: `/ukr/${city.slug}` }, { label: g.crumb }]}
          eyebrow={`${g.eyebrow} · ${city.name}`}
          h1={h1}
          lead={sectionText(s[`lead_${variant}`])}
        />

        {/* Вікові картки */}
        <Section tone={tone('cards')} id="vik">
          <H2>{sectionHeading(s.age_cards)}</H2>
          <div className="mt-6 grid grid-cols-1 gap-[var(--space-grid)] md:grid-cols-2">
            {cards.map((c) => (
              <div
                key={c.href}
                className="flex flex-col bg-white border border-[var(--border)] rounded-[var(--radius-lg)] p-[var(--space-card)]"
              >
                <a href={c.href} className="group">
                  <h3 className="text-[20px] font-semibold leading-[1.3] text-ink group-hover:text-link">{c.label} →</h3>
                  {c.line && <p className="mt-2 text-[15px] leading-relaxed text-text-secondary">{c.line}</p>}
                </a>
                {c.program && (
                  <div className="mt-5 pt-4 border-t border-section-border">
                    <p className="text-[13px] text-text-secondary">Програма клініки: «{c.program.name_ua}»</p>
                    <div className="mt-3">
                      <BookCta programSlug={c.program.slug} sourceCta={`${SOURCE_CTA}_card_${c.seg}`} label="Записатися" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          {cross && (
            <p className="mt-6 text-[15px]">
              <a href={cross.href} className="font-semibold text-link hover:underline underline-offset-[3px]">
                {cross.label} →
              </a>
            </p>
          )}
        </Section>

        {/* Що змінюється з віком – v0 без змін */}
        <Section tone={tone('changes')} width="read" id="shcho-zminiuietsia">
          <MdSectionBody section={s.what_changes} />
        </Section>

        {/* 5. Клініки-партнери – замість «Контакти клініки» v0 */}
        {showClinics && <ClinicsBlock doc={doc} city={city} clinics={clinics} tone={tone('clinics')} />}

        {/* 8. FAQ і рядок медичного рецензента */}
        <FaqBlock heading={sectionHeading(s.faq)} items={faq} reviewer={reviewer} tone={tone('faq')} />

        {/* 10. Автор: текст v0, рядок автора, рейтинг Google; джерела */}
        <Section tone={tone('author')} width="read" id="avtor">
          <div className="[&>p:first-child]:mt-0">
            <CityMdBlocks blocks={resolvedBlocks(s.author)} />
          </div>
          <AuthorAndRating doc={doc} />
          <SourcesList section={s.sources} />
        </Section>

        {/* 11. GEO – без H2, статичний текст з даних */}
        {showGeo && <GeoBlock doc={doc} city={city} clinics={clinics} vars={vars} tone={tone('geo')} />}
      </main>

      {bookingClinic && programs.length > 0 && (
        <BookingFlow
          programs={programs}
          branches={offersData.branches}
          clinicId={bookingClinic.id}
          clinicSlug={bookingClinic.slug}
          city={city.slug}
          programsComposition={Object.fromEntries(offers.map((o) => [o.program.slug, o.composition.counts]))}
        />
      )}
    </>
  );
}
