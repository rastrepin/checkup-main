import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Header from '@/components/frame/Header';
import Section from '@/components/frame/Section';
import CityMdBlocks from '@/components/city/CityMdBlocks';
import {
  absUrl,
  AuthorAndRating,
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
import { cityVariant, fetchCityClinics, SITE } from '@/lib/cities/hub-data';
import ProgramCatalogBlock from '@/components/city/ProgramCatalogBlock';
import { catalogTexts } from '@/lib/content/age-page-texts';
import { countForAge, fetchGenderCatalog } from '@/lib/programs/catalog';
import { CATALOG_AGES, isCatalogAge } from '@/lib/programs/catalog-age';
import type { AgeSegment } from '@/lib/plan/age-groups';
import { fillLabel } from '@/lib/format/labels';
import { HUB_REVIEWERS } from '@/lib/cities/hub-reviewers';
import SiteFooter from '@/components/frame/SiteFooter';

// Сторінка статі в місті /ukr/{female,male}-checkup/{slug} – спільний шаблон обох статей (хвиля 1, 01.11.2026).
// Обгортки: app/ukr/{stat}-checkup/city-page.tsx → app/ukr/{stat}-checkup/{slug}/page.tsx.
// Тексти – content/{city.contentDir}/{stat}-checkup.md: CITY-HUB-TEXTS v1.6 §9 (title, H1, лід, meta, H2, анкори,
// нові питання FAQ, рядок рецензента) і решта – {stat}-checkup.md v0 без змін.
// Блоки 5 (клініки), 8 (рецензент FAQ), 10 (автор, рейтинг), 11 (GEO) – за правилами хабу міста
// (docs/ux/specs/2026-11-city-hub.md §8); блок «Контакти клініки» v0 замінено блоком клінік (CITY-HUB-TEXTS §9).
// Порядок (gender-hub v0.1 §1, НОРМАТИВ 26.11): hero · вікові картки · каталог програм клінік · що змінюється з віком ·
// FAQ і рецензент · автор і джерела · GEO. Окремого блоку «Клініка-партнер» немає: клініки представляє каталог.
// Вікові картки – вхід у фільтр каталогу: назва – посилання на вікову сторінку, під описом – «Програми клінік для цього віку · {n} ↓»
// (ставить #age=…). Кнопок запису і цін у вікових картках немає; запис – лише в рамці програми каталогу (ui-kit §6.1).
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
  // {min_price} у meta і в шапці каталогу – одне число: найменша ціна до сплати серед програм каталогу (gender-hub §3.1).
  const [clinics, catalog] = await Promise.all([fetchCityClinics(city), fetchGenderCatalog(city, gender)]);
  const vars = hubVars(city, clinics, catalog.minPrice, { shortNames: true });
  const doc = loadCityMdSections(city.contentDir, `${gender}-checkup`, vars);
  return { clinics, vars, doc, catalog };
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
  const { clinics, vars, doc, catalog } = await loadGenderHub(gender, city);
  if (!doc) notFound();
  const g = G[gender];
  const variant = cityVariant(city);
  const s = doc.sections;
  const h1 = sectionText(s.h1) ?? '';

  const cards = linkItems(s.age_cards);
  const cross = firstLink(s.cross);
  const faq = faqItems(s.faq);
  const reviewer = HUB_REVIEWERS[gender];
  const showCatalog = catalog.programs.length > 0;
  const showGeo = geoHasContent(city, clinics);
  const texts = catalogTexts(doc.raw.catalog ?? null, vars, catalog.minPrice);

  const order = ['cards', showCatalog && 'catalog', 'changes', 'faq', 'author', showGeo && 'geo'].filter((k): k is string => Boolean(k));
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
    // ItemList – лише програми каталогу, що є в серверному HTML (gender-hub §7): назва програми, ціна до сплати, UAH.
    itemList: catalog.programs.map((p) => ({
      name: p.program.name_ua,
      url: `${PAGE_URL}#clinic-${p.key}`,
      price: p.payable,
      clinic: p.clinic.name,
    })),
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
            {/* Картка віку: назва – посилання на вікову сторінку (перелінковка), опис, рядок-вхід у фільтр каталогу (gender-hub §2).
                Картка не є одним великим посиланням: у ній два посилання з різною дією. */}
            {cards.map((c) => {
              const seg = CATALOG_AGES.find((a) => c.href.includes(`/${a}/`)) as AgeSegment | undefined;
              const n = showCatalog && seg ? countForAge(catalog, seg) : 0;
              return (
                <div
                  key={c.href}
                  className="group flex flex-col h-full bg-white border border-[var(--border)] rounded-[var(--radius-lg)] p-[var(--space-card)] hover:border-[var(--border-strong)]"
                >
                  <h3 className="text-[20px] font-semibold leading-[1.3] text-ink">
                    <a href={c.href} className="hover:text-link">
                      {c.label} →
                    </a>
                  </h3>
                  {c.line && <p className="mt-2 text-[15px] leading-relaxed text-text-secondary">{c.line}</p>}
                  {seg && isCatalogAge(seg) && n > 0 && texts.ageCardLink && (
                    <a
                      href={`#age=${seg}`}
                      data-catalog-age={seg}
                      className="mt-auto pt-3 inline-flex items-center min-h-[44px] text-[15px] font-semibold text-link hover:underline underline-offset-[3px]"
                    >
                      {fillLabel(texts.ageCardLink, { n })}
                    </a>
                  )}
                </div>
              );
            })}
          </div>
          {cross && (
            <p className="mt-6 text-[15px]">
              <a href={cross.href} className="font-semibold text-link hover:underline underline-offset-[3px]">
                {cross.label} →
              </a>
            </p>
          )}
        </Section>

        {/* Каталог програм клінік (gender-hub §1 блок 4): перший блок після вікових карток, до «Як обрати свій чекап». */}
        {showCatalog && <ProgramCatalogBlock catalog={catalog} texts={texts} city={city} gender={gender} tone={tone('catalog')} />}

        {/* Що змінюється з віком – v0 без змін */}
        <Section tone={tone('changes')} width="read" id="shcho-zminiuietsia">
          <MdSectionBody section={s.what_changes} />
        </Section>

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
      {/* Відступ під закріпленою панеллю mobile каталогу (§5.1). */}
      <SiteFooter city={city.slug} stickyPad={showCatalog} />
    </>
  );
}
