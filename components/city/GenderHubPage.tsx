import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Header from '@/components/frame/Header';
import Section from '@/components/frame/Section';
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
import { cityVariant, fetchCityClinics, minPriceFor, SITE } from '@/lib/cities/hub-data';
import { HUB_REVIEWERS } from '@/lib/cities/hub-reviewers';
import SiteFooter from '@/components/frame/SiteFooter';

// Сторінка статі в місті /ukr/{female,male}-checkup/{slug} – спільний шаблон обох статей (хвиля 1, 01.11.2026).
// Обгортки: app/ukr/{stat}-checkup/city-page.tsx → app/ukr/{stat}-checkup/{slug}/page.tsx.
// Тексти – content/{city.contentDir}/{stat}-checkup.md: CITY-HUB-TEXTS v1.6 §9 (title, H1, лід, meta, H2, анкори,
// нові питання FAQ, рядок рецензента) і решта – {stat}-checkup.md v0 без змін.
// Блоки 5 (клініки), 8 (рецензент FAQ), 10 (автор, рейтинг), 11 (GEO) – за правилами хабу міста
// (docs/ux/specs/2026-11-city-hub.md §8); блок «Контакти клініки» v0 замінено блоком клінік (CITY-HUB-TEXTS §9).
// Порядок: hero · вікові картки · що змінюється з віком · клініки · FAQ і рецензент · автор і джерела · GEO.
// Вікові картки – лише посилання на вікові сторінки: без рядка програми і без «Записатися» (рішення Ігоря 14.11,
// НОРМАТИВ 14.11 В.1). Клініка і ціна – лише в блоці клінік. Запису і crimson на сторінці немає (ui-kit §6.1).
// Телефонів немає (PLATFORM-LINE §5). hreflang немає (SEO-MIGRATION §4).

export type HubGender = 'female' | 'male';

const UPDATED_ISO = '2026-11-01';

const G: Record<HubGender, { crumb: string }> = {
  female: {
    crumb: 'Жінкам',
  },
  male: {
    crumb: 'Чоловікам',
  },
};

function pageCity(gender: HubGender, citySlug: string) {
  const city = getCheckupCity(citySlug);
  if (!city) notFound();
  const PAGE_PATH = `/ukr/${gender}-checkup/${city.slug}`;
  return { city, PAGE_PATH, PAGE_URL: `${SITE}${PAGE_PATH}` };
}

async function loadGenderHub(gender: HubGender, city: CheckupCity) {
  const [clinics, minPrice] = await Promise.all([fetchCityClinics(city), minPriceFor(city, gender)]);
  const vars = hubVars(city, clinics, minPrice, { shortNames: true });
  const doc = loadCityMdSections(city.contentDir, `${gender}-checkup`, vars);
  return { clinics, vars, doc };
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

export default async function GenderHubPage({ gender, citySlug }: { gender: HubGender; citySlug: string }) {
  const { city, PAGE_URL } = pageCity(gender, citySlug);
  const { clinics, vars, doc } = await loadGenderHub(gender, city);
  if (!doc) notFound();
  const g = G[gender];
  const variant = cityVariant(city);
  const s = doc.sections;
  const h1 = sectionText(s.h1) ?? '';

  const cards = linkItems(s.age_cards);
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
          h1={h1}
          lead={sectionText(s[`lead_${variant}`])}
        />

        {/* Вікові картки */}
        <Section tone={tone('cards')} id="vik">
          <H2>{sectionHeading(s.age_cards)}</H2>
          <div className="mt-6 grid grid-cols-1 gap-[var(--space-grid)] md:grid-cols-2">
            {/* Картка віку (В.1–В.2): уся картка – зона натиску, один <a> з текстом заголовка; hover – рамка --border-strong. */}
            {cards.map((c) => (
              <a
                key={c.href}
                href={c.href}
                className="group flex flex-col h-full bg-white border border-[var(--border)] rounded-[var(--radius-lg)] p-[var(--space-card)] hover:border-[var(--border-strong)]"
              >
                <h3 className="text-[20px] font-semibold leading-[1.3] text-ink group-hover:text-link">{c.label} →</h3>
                {c.line && <p className="mt-2 text-[15px] leading-relaxed text-text-secondary">{c.line}</p>}
              </a>
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
        {showClinics && <ClinicsBlock doc={doc} city={city} clinics={clinics} shortNames tone={tone('clinics')} />}

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
        {showGeo && <GeoBlock doc={doc} city={city} clinics={clinics} vars={vars} shortNames tone={tone('geo')} />}
      </main>
      <SiteFooter city={city.slug} />
    </>
  );
}
