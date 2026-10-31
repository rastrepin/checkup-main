import type { ReactNode } from 'react';
import Accordion from '@/components/frame/Accordion';
import Hero from '@/components/frame/Hero';
import Section from '@/components/frame/Section';
import ClinicCard from '@/components/city/ClinicCard';
import CityMdBlocks, { MD_LINK, MD_P, MdInlines } from '@/components/city/CityMdBlocks';
import {
  fillPlaceholders,
  resolvedBlocks,
  sectionHeading,
  sectionText,
  type CityFaqItem,
  type CityMdDoc,
  type CityMdSection,
  type CityMdVars,
  type MdInline,
} from '@/lib/content/city-md';
import { branchList, cityVariant, priceText, SITE, type HubClinic } from '@/lib/cities/hub-data';
import type { CheckupCity } from '@/lib/cities/checkup-cities';
import { GOOGLE_PROFILE, googleRatingText } from '@/lib/config/google-profile';
import { dateLabel, HUB_AUTHOR, ORGANIZATION_ID, type HubReviewer } from '@/lib/cities/hub-reviewers';

// Спільні блоки хабу міста (app/ukr/city-page.tsx) і сторінок статі (components/city/GenderHubPage.tsx),
// хвиля 1, 01.11.2026. Специфікація – docs/ux/specs/2026-11-city-hub.md v0.1 (§2 hero, §3 клініки, §4 рецензент FAQ,
// §5 «Про команду», §6 списки посилань, §7 GEO; §8 – сторінки статі беруть блоки 5, 8, 10, 11).
// Тексти – лише з content/{city.contentDir}/*.md (CITY-HUB-TEXTS v1.6); тут – вигляд і дані.
// Кольори – ролі з app/globals.css; телефонів немає (PLATFORM-LINE §5).

/** Підпис-застереження під лідом hero (специфікація хабу §2, ui-kit §5.3). */
export const HERO_DISCLAIMER = 'Інформаційний матеріал. Свій план обстеження обговоріть з лікарем.';

export function H2({ children, id }: { children: ReactNode; id?: string }) {
  return (
    <h2 id={id} className="scroll-mt-20 text-[24px] md:text-[28px] font-bold leading-[1.2] text-ink">
      {children}
    </h2>
  );
}

/** Значення плейсхолдерів сторінки міста. Немає даних – ключа немає (текст з ним не рендериться). */
export function hubVars(city: CheckupCity, clinics: HubClinic[], minPrice: number | null): CityMdVars {
  const variant = cityVariant(city);
  const vars: CityMdVars = {
    city: city.name,
    city_loc: city.loc,
    in_city: city.inCity,
    slug: city.slug,
    city_slug: city.slug,
  };
  if (minPrice !== null) vars.min_price = priceText(minPrice);
  if (variant === 'a') {
    const c = clinics[0];
    if (c) vars.clinic = c.name;
    // Двері до клініки: субдомен, інакше сторінка клініки на Tilda – навіть коли клініки ще немає в базі.
    vars.clinic_url = c?.url ?? `${SITE}${city.clinics[0].tildaPath}`;
    const bl = c ? branchList(c.branches) : null;
    if (bl) vars.branch_list = bl;
  } else if (clinics.length > 0) {
    vars.clinics_count = clinics.length;
  }
  if (GOOGLE_PROFILE.rating !== null && GOOGLE_PROFILE.reviews !== null) {
    vars.google_rating = googleRatingText(GOOGLE_PROFILE.rating);
    vars.google_reviews = GOOGLE_PROFILE.reviews;
  }
  return vars;
}

/** Title / H1 / лід / meta з розділу MD; null – немає тексту або бракує даних. */
export function docText(doc: CityMdDoc | null, key: string): string | null {
  return sectionText(doc?.sections[key]);
}

/** meta description: варіант з ціною, інакше – тимчасовий без ціни (див. коментар у MD). */
export function docMeta(doc: CityMdDoc | null, keys: string[]): string | undefined {
  for (const k of keys) {
    const t = docText(doc, k);
    if (t) return t;
  }
  return undefined;
}

/** Відповідь FAQ варіанта (faq6_a / faq6_b) – вкладений плейсхолдер {faq6} у розділі faq. */
export function nestedVar(doc: CityMdDoc | null, key: string, vars: CityMdVars): string | undefined {
  const raw = doc?.raw[key];
  if (!raw) return undefined;
  const text = fillPlaceholders(raw, vars).replace(/\s*\n\s*/g, ' ').trim();
  return /\{[a-z_0-9]+\}/.test(text) ? undefined : text;
}

export function HubHero({
  breadcrumbs,
  eyebrow,
  h1,
  lead,
}: {
  breadcrumbs: { label: string; href?: string }[];
  eyebrow: string;
  h1: string;
  lead: string | null;
}) {
  return (
    <Hero
      tone="dark"
      breadcrumbs={
        <nav aria-label="Breadcrumb">
          {breadcrumbs.map((b, i) => (
            <span key={b.label}>
              {i > 0 && <span className="mx-1.5" aria-hidden="true">›</span>}
              {b.href ? <a href={b.href}>{b.label}</a> : <span aria-current="page">{b.label}</span>}
            </span>
          ))}
        </nav>
      }
      eyebrow={eyebrow}
      h1={h1}
      lead={lead ? <p>{lead}</p> : undefined}
      reassurance={HERO_DISCLAIMER}
    />
  );
}

/** Розділ MD: H2 з файлу і решта блоків (без абзаців з плейсхолдерами без значення). */
export function MdSectionBody({
  section,
  id,
  paragraphsOnly = false,
}: {
  section: CityMdSection | undefined;
  id?: string;
  /** Лише H2 і абзаци – список розділу сторінка показує сама (рядки-посилання). */
  paragraphsOnly?: boolean;
}) {
  const heading = sectionHeading(section);
  const blocks = resolvedBlocks(section).filter((b) => !paragraphsOnly || b.type === 'p');
  return (
    <>
      {heading && <H2 id={id}>{heading}</H2>}
      <CityMdBlocks blocks={blocks} />
    </>
  );
}

/** Перше посилання розділу (напр. «Детальніше про команду …»). */
export function firstLink(section: CityMdSection | undefined): { label: string; href: string } | null {
  for (const b of resolvedBlocks(section)) {
    const parts = b.type === 'p' || b.type === 'h3' ? [b.content] : b.items;
    for (const it of parts) {
      const link = it.find((p): p is Extract<MdInline, { type: 'link' }> => p.type === 'link');
      if (link) return { label: link.text, href: link.href };
    }
  }
  return null;
}

/** Чи буде GEO-блок: потрібні клініка з бази і хоча б одна філія з адресою. */
export function geoHasContent(city: CheckupCity, clinics: HubClinic[]): boolean {
  if (cityVariant(city) === 'a') return Boolean(clinics[0] && clinics[0].branches.length > 0);
  return clinics.some((c) => c.branches.length > 0);
}

/** Розбирає пункт «[анкор](адреса) – опис» на посилання і опис (картки статі, вікові картки, скринінги). */
export function linkItems(section: CityMdSection | undefined): { label: string; href: string; line: string | null }[] {
  const out: { label: string; href: string; line: string | null }[] = [];
  for (const b of resolvedBlocks(section)) {
    if (b.type !== 'ul' && b.type !== 'ol') continue;
    for (const it of b.items) {
      const link = it.find((p): p is Extract<MdInline, { type: 'link' }> => p.type === 'link');
      if (!link) continue;
      const rest = it
        .slice(it.indexOf(link) + 1)
        .map((p) => (p.type === 'ref' ? '' : p.text))
        .join('')
        .replace(/^\s*–\s*/, '')
        .trim();
      out.push({ label: link.text, href: link.href, line: rest || null });
    }
  }
  return out;
}

/** Список рядків-посилань (специфікація хабу §6): рядок ≥ 56px, назва 16px 600, стрілка --link, лінія між рядками. */
export function LinkRows({ items }: { items: { label: string; href: string; line?: string | null }[] }) {
  return (
    <ul className="mt-6 border-t border-section-border">
      {items.map((it) => (
        <li key={it.href} className="border-b border-section-border">
          <a href={it.href} className="group flex items-center justify-between gap-4 min-h-14 py-3">
            <span>
              <span className="block text-[16px] font-semibold text-ink group-hover:text-link">{it.label}</span>
              {it.line && <span className="block mt-0.5 text-[14px] text-text-secondary">{it.line}</span>}
            </span>
            <span aria-hidden="true" className="shrink-0 text-link text-[18px]">
              →
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}

/** Блок клінік (специфікація хабу §3): H2, речення, рядок кількості (Б), рядок ціни, картки. */
export function ClinicsBlock({
  doc,
  city,
  clinics,
  tone,
}: {
  doc: CityMdDoc;
  city: CheckupCity;
  clinics: HubClinic[];
  tone: 'white' | 'muted';
}) {
  const variant = cityVariant(city);
  const section = doc.sections[`clinic_${variant}`];
  const price = docText(doc, 'price_line');
  return (
    <Section tone={tone} width="read" id="klinika">
      <MdSectionBody section={section} />
      {price && <p className="mt-5 font-serif text-[20px] font-bold text-text-primary">{price}</p>}
      <div className={`mt-6 grid grid-cols-1 gap-[var(--space-grid)] ${variant === 'b' ? 'md:grid-cols-2' : ''}`}>
        {clinics.map((c) => (
          <ClinicCard key={c.slug} clinic={c} />
        ))}
      </div>
    </Section>
  );
}

/** Рядок медичного рецензента під FAQ (специфікація хабу §4). Немає дати перегляду – рядка немає. */
export function ReviewerLine({ reviewer }: { reviewer: HubReviewer }) {
  if (!reviewer.reviewedAt) return null;
  return (
    <p className="mt-6 pt-6 border-t border-section-border text-[14px] text-text-secondary">
      Медичні відповіді {reviewer.verb}:{' '}
      {reviewer.url ? (
        <a href={reviewer.url} className={MD_LINK}>
          {reviewer.name}
        </a>
      ) : (
        reviewer.name
      )}
      , {reviewer.specialty}, {reviewer.org}, {dateLabel(reviewer.reviewedAt)}
    </p>
  );
}

/** FAQ: акордеон, питання повністю в summary (h3), відповіді в серверному HTML; під ним – рядок рецензента. */
export function FaqBlock({
  heading,
  items,
  reviewer,
  tone,
}: {
  heading: string | null;
  items: CityFaqItem[];
  reviewer: HubReviewer;
  tone: 'white' | 'muted';
}) {
  return (
    <Section tone={tone} width="read" id="faq">
      {heading && <H2>{heading}</H2>}
      <div className="mt-6 border-b border-section-border">
        {items.map((f) => (
          <Accordion key={f.q} summary={f.q} as="h3">
            {f.answer.map((p, i) => (
              <p key={i} className={i > 0 ? 'mt-3' : ''}>
                <MdInlines parts={p} />
              </p>
            ))}
          </Accordion>
        ))}
      </div>
      <ReviewerLine reviewer={reviewer} />
    </Section>
  );
}

/** Рядок автора і рядок рейтингу Google (специфікація хабу §5.2–5.3). */
export function AuthorAndRating({ doc }: { doc: CityMdDoc }) {
  const author = docText(doc, 'team_author');
  const rating = docText(doc, 'team_rating');
  return (
    <>
      {author && <p className="mt-6 text-[14px] text-text-secondary">{author}</p>}
      {rating && GOOGLE_PROFILE.rating !== null && (
        <p className="mt-2 text-[14px] text-text-secondary">
          <a href={GOOGLE_PROFILE.url} className={MD_LINK} rel="noopener">
            {rating.replace(/:\s*/, ': ★ ').split('★').map((part, i) =>
              i === 0 ? (
                <span key={i}>{part}</span>
              ) : (
                <span key={i}>
                  <span aria-hidden="true" className="text-[var(--star)]">
                    ★
                  </span>
                  {part}
                </span>
              ),
            )}
          </a>
        </p>
      )}
    </>
  );
}

/** GEO-блок без H2 (специфікація хабу §7): статичний абзац, 14px, без телефону. А – один рядок, Б – рядок на клініку. */
export function GeoBlock({
  doc,
  city,
  clinics,
  vars,
  tone,
}: {
  doc: CityMdDoc;
  city: CheckupCity;
  clinics: HubClinic[];
  vars: CityMdVars;
  tone: 'white' | 'muted';
}) {
  const lines: CityMdSection[] = [];
  let intro: string | null = null;
  if (cityVariant(city) === 'a') {
    const s = doc.sections.geo_a;
    if (s) lines.push(s);
  } else {
    intro = docText(doc, 'geo_b_intro');
    const raw = doc.raw.geo_b_line ?? '';
    for (const c of clinics) {
      const bl = branchList(c.branches);
      if (!bl) continue;
      const text = fillPlaceholders(raw, { ...vars, clinic: c.name, branch_list: bl, clinic_url: c.url });
      lines.push({ heading: null, eyebrow: null, blocks: [{ type: 'p', content: parseLine(text) }] });
    }
  }
  const blocks = lines.flatMap((s) => resolvedBlocks(s)).filter((b) => b.type === 'p');
  if (blocks.length === 0) return null;
  return (
    <Section tone={tone} width="read">
      <div className="text-[14px] leading-relaxed text-text-secondary">
        {intro && <p>{intro}</p>}
        {blocks.map((b, i) =>
          b.type === 'p' ? (
            <p key={i} className={intro || i > 0 ? 'mt-1' : ''}>
              <MdInlines parts={b.content} />
            </p>
          ) : null,
        )}
      </div>
    </Section>
  );
}

/** Рядок MD у вбудовані частини (той самий розбір, що в lib/content/city-md.ts). */
function parseLine(text: string): MdInline[] {
  const out: MdInline[] = [];
  const re = /\[([^\]]+)\]\(([^)\s]+)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push({ type: 'text', text: text.slice(last, m.index) });
    out.push({ type: 'link', text: m[1], href: m[2] });
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push({ type: 'text', text: text.slice(last) });
  return out;
}

/** Джерела: [n] у тексті → пункт n. Службові «Параметри: …» з MD не показуються (як на сторінках v0). */
export function SourcesList({ section }: { section: CityMdSection | undefined }) {
  const items = resolvedBlocks(section).flatMap((b) => (b.type === 'ol' || b.type === 'ul' ? b.items : []));
  if (!items.length) return null;
  return (
    <div className="mt-8 text-[13px] leading-relaxed text-text-secondary">
      <p className="font-semibold text-ink">Джерела</p>
      <ol className="mt-2 space-y-1.5 list-none">
        {items.map((it, i) => (
          <li key={i} id={`source-${i + 1}`} className="flex gap-2 scroll-mt-24">
            <span className="font-semibold shrink-0">{i + 1}.</span>
            <span>
              {it
                .map((p) => (p.type === 'ref' ? '' : p.text))
                .join('')
                .replace(/\s*Параметри:[\s\S]*$/, '')}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

// ─── JSON-LD (SEO-MIGRATION §7) ───────────────────────────────────────────────────────────────────────
// MedicalWebPage + ItemList (лише видимі посилання) + BreadcrumbList + FAQPage (= видимий FAQ).
// reviewedBy – лише лікар-рецензент FAQ (Physician), author – Ігор Растрепін. Без Offer, AggregateRating, Review,
// без номера телефону (PLATFORM-LINE §5).

export function hubJsonLd(opts: {
  pageUrl: string;
  name: string;
  description?: string;
  dateModified: string;
  reviewer: HubReviewer;
  breadcrumbs: { name: string; item: string }[];
  itemList: { name: string; url: string }[];
  faq: CityFaqItem[];
}): object[] {
  const { reviewer } = opts;
  const page: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    '@id': `${opts.pageUrl}#webpage`,
    name: opts.name,
    url: opts.pageUrl,
    inLanguage: 'uk',
    ...(opts.description ? { description: opts.description } : {}),
    dateModified: opts.dateModified,
    author: { '@type': 'Person', name: HUB_AUTHOR.name },
    publisher: { '@id': ORGANIZATION_ID },
  };
  if (reviewer.reviewedAt) {
    page.reviewedBy = {
      '@type': 'Physician',
      name: reviewer.name,
      medicalSpecialty: reviewer.schemaSpecialty,
      ...(reviewer.url ? { url: reviewer.url } : {}),
    };
    page.lastReviewed = reviewer.reviewedAt;
  }
  const out: object[] = [
    page,
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': ORGANIZATION_ID,
      name: 'check-up.in.ua',
      url: SITE,
      sameAs: [GOOGLE_PROFILE.url],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: opts.breadcrumbs.map((b, i) => ({ '@type': 'ListItem', position: i + 1, name: b.name, item: b.item })),
    },
  ];
  if (opts.itemList.length) {
    out.push({
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      itemListElement: opts.itemList.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, url: it.url })),
    });
  }
  if (opts.faq.length) {
    out.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: opts.faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    });
  }
  return out;
}

export function absUrl(href: string): string {
  return href.startsWith('http') ? href : `${SITE}${href}`;
}

export { MD_P };
