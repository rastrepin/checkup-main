import type { Metadata } from 'next';
import { cache } from 'react';
import Link from 'next/link';
import { fetchClinicOffers, type ClinicOffer, type OfferBranch } from '@/lib/programs/clinic-offer';
import { AGE_STEP_PAGES } from '@/lib/programs/age-pages';
import AccordionSection from '@/components/shared/AccordionSection';
import BookingFlow, { BookCta } from '@/components/city/BookingFlow';

// Сторінка статі в місті – чернетка SPRINT-KHARKIV-v0, розділ 5.3:
// Hero · картки вікових сторінок · що змінюється з віком · двері клініки · FAQ · GEO · автор і рецензент.
// Без квізу і без каталогу програм.
// Контент: content/kharkiv/female-checkup.md (v0) дослівно. Старий content/kharkiv/female-checkup-kharkiv.md не використовується.
// Програми, філії – тільки з Supabase (fetchClinicOffers з усіма жіночими платформними програмами):
// platform_program_offers → checkup_programs (program_type = 'clinic') → onclinic-kharkiv.
// Hero, «Двері», GEO, автор і рецензент – верстка в сторінці (рішення спринту, без нових спільних компонентів).

export const revalidate = 3600;

const PAGE_PATH = '/ukr/female-checkup/kharkiv';
const PAGE_URL = `https://check-up.in.ua${PAGE_PATH}`;
const CLINIC_SLUG = 'onclinic-kharkiv';
const SOURCE_CTA = 'gender_hub_female_kharkiv';
// SEO-STANDARD р.4, Тип 5 (сесія 3). Опис (meta description) – у generateMetadata з даних.
const TITLE = 'Жіночий чекап в Харкові: програми, ціни, клініки | check-up.in.ua';
const H1 = 'Жіночий чекап в Харкові';
const UPDATED_ISO = '2026-09-23';
const UPDATED_LABEL = '23.09.2026';
const REVIEWER = { name: 'Удовиченко Олена Олександрівна', jobTitle: 'лікар акушер-гінеколог', org: 'ОН Клінік Харків' };

const BORDER = '1px solid #e8edf3';
const BG_GRAY = '#f8fafc';
const BG_WHITE = '#ffffff';
const P = 'text-gray-700 leading-relaxed mt-4';

/* Картки віку: підпис і посилання – з реєстру lib/programs/age-pages.ts; тут – рядок і платформна програма. */
const AGE_CARD_EXTRA: Record<string, { line: string; platformSlug: string }> = {
  '/ukr/female-checkup/do-30-rokiv/kharkiv': {
    line: 'ПАП-тест, тиск і перше вимірювання холестерину.',
    platformSlug: 'female-checkup-do-30',
  },
  '/ukr/female-checkup/30-40-rokiv/kharkiv': {
    line: 'Додаються тест на ВПЛ і, за надлишкової ваги, перевірка на діабет 2 типу.',
    platformSlug: 'female-checkup-30-40',
  },
  '/ukr/female-checkup/40-50-rokiv/kharkiv': {
    line: 'Тиск щороку, мамографія і скринінг раку кишки за факторами ризику.',
    platformSlug: 'female-checkup-40-50',
  },
  '/ukr/female-checkup/vid-50-rokiv/kharkiv': {
    line: 'Мамографія для всіх, тест калу на приховану кров, денситометрія.',
    platformSlug: 'female-checkup-vid-50',
  },
};
const PLATFORM_PROGRAMS = Object.values(AGE_CARD_EXTRA).map((x) => x.platformSlug);

/* Джерела: [n] у тексті → пункт n */
const SOURCES: string[] = [
  'МОЗ України. Наказ №504 (2018), яким скасовано диспансеризацію; замінив наказ №728.',
  'МОЗ України. Стандарт медичної допомоги «Скринінг раку шийки матки. Ведення пацієнток з аномальними результатами скринінгу та передраковими станами шийки матки», наказ №1057 від 18.06.2024.',
  'Mayo Clinic Family Health Book, 5th Edition.',
  'USPSTF. Prediabetes and Type 2 Diabetes: Screening, 2021. Дорослі 35–70 років з надлишковою вагою або ожирінням, кожні 3 роки.',
  "Кабінет Міністрів України. Постанова №1652 (2025) «Скринінг здоров'я 40+», діє з 01.01.2026: серцево-судинні захворювання, цукровий діабет 2 типу, ментальне здоров'я.",
  'МОЗ України. Наказ №1368 від 05.08.2024: порядки скринінгу і ранньої діагностики раку молочної залози, раку шийки матки і колоректального раку.',
  'USPSTF. Osteoporosis to Prevent Fractures: Screening, 2025. Жінки 65 років і старше; жінки до 65 у постменопаузі з підвищеним ризиком перелому.',
];

const FAQ: { q: string; a: string }[] = [
  {
    q: 'Як обрати сторінку свого віку?',
    a: 'За віком на момент обстеження. Якщо вам 39 або 49 і ви плануєте обстеження на найближчий рік, перегляньте і наступну сторінку: частина перевірок починається саме з 40 або 50 років.',
  },
  {
    q: "Чи є в Україні обов'язковий щорічний огляд для жінок?",
    a: "Диспансеризацію скасовано 2018 року. З 1 січня 2026 року діє державна програма «Скринінг здоров'я 40+» для людей від 40: серцево-судинні захворювання, діабет 2 типу, ментальне здоров'я. Скринінг раку молочної залози, шийки матки і колоректального раку описують окремі порядки МОЗ.",
  },
  {
    q: 'Що робити, якщо в родині був рак молочної залози?',
    a: 'Мамографію починають раніше: за 5–10 років до віку, у якому діагноз поставили матері, сестрі або доньці. З якого віку починати вам, обговоріть з лікарем.',
  },
  {
    q: 'Чим перелік на сторінці віку відрізняється від програми клініки?',
    a: 'Перелік складений за клінічними настановами і не залежить від клініки. Програма клініки – готовий набір обстежень. На сторінці віку показано, що з переліку в програмі є, чого немає і що варто додати.',
  },
  {
    q: 'Чи можна пройти перелік не в цій клініці?',
    a: 'Так. Перелік складений за клінічними настановами, а не за прайсом клініки, і його можна пройти в будь-якому закладі. Запис до клініки-партнера на цій сторінці – зручність, а не умова.',
  },
];

const SCHEDULE_LABELS: [string, string][] = [
  ['mon_fri', 'пн–пт'],
  ['sat', 'сб'],
  ['sun', 'нд'],
];

function scheduleText(b: OfferBranch): string | null {
  if (!b.schedule) return null;
  const parts = SCHEDULE_LABELS.filter(([k]) => b.schedule?.[k]).map(([k, label]) => `${label} ${b.schedule?.[k]}`);
  return parts.length ? parts.join(', ') : null;
}

function branchesWord(n: number) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return 'філія';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'філії';
  return 'філій';
}

function quoted(names: string[]) {
  const q = names.map((n) => `«${n}»`);
  if (q.length <= 1) return q.join('');
  return `${q.slice(0, -1).join(', ')} і ${q[q.length - 1]}`;
}

function S({ n }: { n: number[] }) {
  return (
    <sup className="text-[#005485] whitespace-nowrap">
      {' '}
      [
      {n.map((i, idx) => (
        <span key={i}>
          {idx > 0 && ', '}
          <a href={`#source-${i}`} className="hover:underline">
            {i}
          </a>
        </span>
      ))}
      ]
    </sup>
  );
}

function Eyebrow({ children }: { children: string }) {
  return <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#005485] mb-6">{children}</p>;
}

function H2({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <h2 id={id} className="font-bold text-[#0b1a24] scroll-mt-24" style={{ fontSize: 'clamp(22px, 3vw, 30px)', lineHeight: 1.25 }}>
      {children}
    </h2>
  );
}

function Section({ bg, eyebrow, children }: { bg: string; eyebrow: string; children: React.ReactNode }) {
  return (
    <section style={{ backgroundColor: bg, borderTop: BORDER }}>
      <div className="max-w-[1200px] mx-auto px-6 lg:px-14 py-14">
        <div className="max-w-3xl">
          <Eyebrow>{eyebrow}</Eyebrow>
          {children}
        </div>
      </div>
    </section>
  );
}

function AgeLinks({ links }: { links: { href: string; label: string }[] }) {
  return (
    <p className="mt-3 text-sm flex flex-wrap gap-x-4 gap-y-1">
      {links.map((l) => (
        <Link key={l.href} href={l.href} className="font-semibold text-[#005485] hover:underline">
          {l.label} →
        </Link>
      ))}
    </p>
  );
}

const getOffers = cache(() => fetchClinicOffers(PLATFORM_PROGRAMS, CLINIC_SLUG));

/** SEO-STANDARD р.4, Тип 5: X – мінімальна ціна (price_discount) програм клініки для сторінки,
 *  N – кількість клінік-партнерів у даних. Обидва – з Supabase, не з коду. */
function metaDescription(offers: ClinicOffer[]): string {
  const prices = offers.map((o) => o.program.price_discount).filter((p) => typeof p === 'number' && p > 0);
  const x = prices.length > 0 ? Math.min(...prices) : null;
  const n = new Set(offers.map((o) => o.program.clinic_id)).size;
  const parts = [`Програми жіночого чекапу в Харкові${x ? ` – ціни від ${x.toLocaleString('uk-UA')} грн` : ''}.`];
  if (n > 0) parts.push(`Клініки-партнери: ${n}.`);
  parts.push('Підберіть програму під вік і ризики.');
  return parts.join(' ');
}

export async function generateMetadata(): Promise<Metadata> {
  const { offers } = await getOffers();
  const description = metaDescription(offers);
  return {
    title: { absolute: TITLE },
    description,
    robots: { index: true, follow: true },
    alternates: {
      canonical: PAGE_URL,
      languages: { uk: PAGE_PATH, ru: '/female-checkup/kharkov' },
    },
    openGraph: { title: TITLE, description, url: PAGE_URL, type: 'website' },
  };
}

export default async function FemaleHubKharkivPage() {
  const { clinic, branches, offers } = await getOffers();
  const programs = offers.map((o) => o.program);

  const cards = AGE_STEP_PAGES.filter((p) => p.gender === 'female' && AGE_CARD_EXTRA[p.href]).map((p) => {
    const extra = AGE_CARD_EXTRA[p.href];
    const offer = offers.find((o) => o.platformSlugs.includes(extra.platformSlug)) ?? null;
    return { ...p, line: extra.line, program: offer?.program ?? null };
  });

  const jsonLd: object[] = [
    {
      '@context': 'https://schema.org',
      '@type': 'MedicalWebPage',
      name: H1,
      url: PAGE_URL,
      dateModified: UPDATED_ISO,
      reviewedBy: {
        '@type': 'Person',
        name: REVIEWER.name,
        jobTitle: REVIEWER.jobTitle,
        worksFor: { '@type': 'MedicalClinic', name: REVIEWER.org },
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'check-up.in.ua', item: 'https://check-up.in.ua' },
        { '@type': 'ListItem', position: 2, name: 'Харків', item: 'https://check-up.in.ua/ukr/kharkiv' },
        { '@type': 'ListItem', position: 3, name: 'Жінкам', item: PAGE_URL },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: FAQ.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    },
  ];

  return (
    <>
      <main className="text-[#0b1a24]">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

        {/* 1. Hero – без ціни */}
        <section style={{ backgroundColor: BG_GRAY }}>
          <div className="max-w-[1200px] mx-auto px-6 lg:px-14 py-14">
            <div className="max-w-3xl">
              <nav aria-label="Breadcrumb" className="text-xs text-gray-500 mb-8">
                <Link href="/" className="hover:underline">check-up.in.ua</Link>
                <span className="mx-1.5">/</span>
                <Link href="/ukr/kharkiv" className="hover:underline">Харків</Link>
                <span className="mx-1.5">/</span>
                <span className="text-gray-700">Жінкам</span>
              </nav>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#005485] mb-6">Жіночий чекап · Харків</p>
              <h1
                className="font-bold leading-tight mb-6"
                style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 'clamp(32px, 5.5vw, 56px)' }}
              >
                {H1}
              </h1>
              <p className="text-lg text-gray-700 leading-relaxed mt-2">
                Що перевіряти жінці без скарг, залежить від віку. Оберіть свій вік: на сторінці – перелік за клінічними
                настановами, готова програма клініки в Харкові і що до неї додати.
              </p>
            </div>
          </div>
        </section>

        {/* 2. Картки вікових сторінок */}
        <section style={{ backgroundColor: BG_WHITE, borderTop: BORDER }}>
          <div className="max-w-[1200px] mx-auto px-6 lg:px-14 py-14">
            <Eyebrow>Ваш вік</Eyebrow>
            <H2 id="vik">Оберіть свій вік</H2>
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-5">
              {cards.map((c) => (
                <div key={c.href} className="border border-[#e8edf3] rounded-[14px] p-6 bg-white flex flex-col">
                  <Link href={c.href} className="group">
                    <p className="text-xl font-bold text-[#0b1a24] group-hover:text-[#005485]">{c.ageStepLabel.replace('-', '–')}</p>
                    <p className="text-[14px] text-gray-700 leading-relaxed mt-2">{c.line}</p>
                    <p className="text-sm font-semibold text-[#005485] mt-3 group-hover:underline">Що перевіряти в цьому віці →</p>
                  </Link>
                  {c.program && (
                    <div className="mt-5 pt-4 border-t border-[#e8edf3]">
                      <p className="text-xs text-gray-500">Програма клініки: «{c.program.name_ua}»</p>
                      <div className="mt-3">
                        <BookCta programSlug={c.program.slug} sourceCta={`${SOURCE_CTA}_card`} label="Записатися" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <p className="text-sm mt-6">
              <Link href="/ukr/male-checkup/kharkiv" className="text-[#005485] hover:underline">
                Чекап для чоловіків у Харкові →
              </Link>
            </p>
          </div>
        </section>

        {/* 3. Що змінюється з віком – коротко, з посиланнями */}
        <Section bg={BG_GRAY} eyebrow="За клінічними настановами">
          <H2 id="shcho-zminiuietsia">Що змінюється з віком</H2>
          <p className={P}>
            Єдиного українського протоколу профілактичного обстеження немає: диспансеризацію скасовано 2018 року
            <S n={[1]} />. Тому на сторінках віку перелік складений за українськими порядками скринінгу окремих хвороб
            і за міжнародними рекомендаціями.
          </p>
          <h3 className="text-lg font-semibold text-[#0b1a24] mt-8">До 30 років</h3>
          <p className={P}>
            Основа – скринінг раку шийки матки: мазок на клітини раз на 3 роки<S n={[2]} />. Тиск вимірюють раз на 3–5
            років, а холестерин уперше – у 20 років<S n={[3]} />.
          </p>
          <AgeLinks
            links={[
              { href: '/ukr/female-checkup/do-30-rokiv/kharkiv', label: 'Чекап для жінок до 30 років' },
              { href: '/ukr/screening/pap-test', label: 'Докладніше про ПАП-тест' },
            ]}
          />
          <h3 className="text-lg font-semibold text-[#0b1a24] mt-8">30–40 років</h3>
          <p className={P}>
            З 35 років стандарт МОЗ допускає інший спосіб скринінгу раку шийки матки – тест на ВПЛ раз на 10 років
            <S n={[2]} />. Людям із надлишковою вагою з 35 років рекомендують скринінг переддіабету і діабету 2 типу раз
            на 3 роки<S n={[4]} />.
          </p>
          <AgeLinks links={[{ href: '/ukr/female-checkup/30-40-rokiv/kharkiv', label: 'Чекап для жінок 30–40 років' }]} />
          <h3 className="text-lg font-semibold text-[#0b1a24] mt-8">40–50 років</h3>
          <p className={P}>
            Від 40 років тиск вимірюють щороку<S n={[3]} />. З 1 січня 2026 року діє державна програма «Скринінг
            здоров&apos;я 40+»<S n={[5]} />. Мамографію і скринінг колоректального раку в цьому віці роблять, якщо є
            фактори ризику<S n={[6]} />.
          </p>
          <AgeLinks links={[{ href: '/ukr/female-checkup/40-50-rokiv/kharkiv', label: 'Чекап для жінок 40–50 років' }]} />
          <h3 className="text-lg font-semibold text-[#0b1a24] mt-8">Після 50 років</h3>
          <p className={P}>
            У 50–69 років мамографію кожні 2 роки рекомендують усім жінкам, а тест калу на приховану кров роблять раз на
            2 роки<S n={[6]} />. З 65 років додається денситометрія – вимірювання щільності кісток<S n={[7]} />.
          </p>
          <AgeLinks
            links={[
              { href: '/ukr/female-checkup/vid-50-rokiv/kharkiv', label: 'Чекап для жінок після 50 років' },
              { href: '/ukr/screening/mamografiia', label: 'Докладніше про мамографію' },
            ]}
          />
        </Section>

        {/* 4. Двері до клініки */}
        {clinic && (
          <Section bg={BG_WHITE} eyebrow="Контакти">
            <H2 id="kontakty">Контакти клініки</H2>
            <p className={P}>
              {clinic.name}
              {branches.length > 0 ? ` – ${branches.length} ${branchesWord(branches.length)} у Харкові.` : '.'}
              {programs.length > 0 &&
                ` Програми клініки для жінок: ${quoted(programs.map((p) => p.name_ua))}. Яка програма відповідає вашому віку, показано на сторінці віку.`}
            </p>
            {branches.length > 0 && (
              <ul className="mt-4 space-y-3">
                {branches.map((b) => {
                  const sch = scheduleText(b);
                  return (
                    <li key={b.id} className="border border-[#e8edf3] rounded-[10px] px-4 py-3 bg-white">
                      <p className="text-sm font-semibold text-[#0b1a24]">{b.name_ua}</p>
                      <p className="text-[14px] text-gray-700 mt-1">
                        {b.address_ua}
                        {b.metro_ua ? `, ${b.metro_ua}` : ''}
                      </p>
                      {sch && <p className="text-[13px] text-gray-500 mt-1">{sch}</p>}
                      {b.tracking_phone && (
                        <p className="text-[14px] mt-1">
                          <a href={`tel:${b.tracking_phone.replace(/\s/g, '')}`} className="text-[#005485] hover:underline">
                            {b.tracking_phone}
                          </a>
                        </p>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
            {clinic.phone && (
              <p className={P}>
                Телефон:{' '}
                <a href={`tel:${clinic.phone.replace(/\s/g, '')}`} className="text-[#005485] hover:underline">
                  {clinic.phone}
                </a>
              </p>
            )}
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              {programs.length > 0 && (
                <BookCta sourceCta={`${SOURCE_CTA}_doors`} label="Записатися" className="sm:!w-auto sm:px-8" />
              )}
              {clinic.website && (
                <a
                  href={clinic.website}
                  className="inline-flex items-center justify-center min-h-12 px-6 rounded-[10px] border border-[#005485] text-[#005485] font-semibold text-sm hover:bg-[#f0f7fb]"
                >
                  Сторінка клініки на check-up.in.ua
                </a>
              )}
            </div>
          </Section>
        )}

        {/* 5. FAQ – нативний <details>, відповіді в DOM */}
        <Section bg={clinic ? BG_GRAY : BG_WHITE} eyebrow="Питання">
          <H2 id="faq">Часті запитання</H2>
          <div className="mt-6 space-y-3">
            {FAQ.map((f) => (
              <div key={f.q} className="border border-[#e8edf3] rounded-[10px] px-5 py-3 bg-white">
                <AccordionSection summary={f.q}>
                  <p className="text-[14px] text-gray-700 leading-relaxed">{f.a}</p>
                </AccordionSection>
              </div>
            ))}
          </div>
        </Section>

        {/* 6. GEO – статичний текст з даних */}
        {clinic && branches.length > 0 && (
          <section style={{ backgroundColor: BG_WHITE, borderTop: BORDER }}>
            <div className="max-w-[1200px] mx-auto px-6 lg:px-14 py-10">
              <div className="max-w-3xl text-[14px] text-gray-600 leading-relaxed">
                <p>
                  Жіночий чекап у Харкові можна пройти в {clinic.name}: {branches.length} {branchesWord(branches.length)} –{' '}
                  {branches.map((b) => `${b.address_ua}${b.metro_ua ? ` (${b.metro_ua})` : ''}`).join('; ')}.
                  {programs.length > 0 ? ` Програми клініки для жінок – ${quoted(programs.map((p) => p.name_ua))}.` : ''}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* 7. Автор і рецензент – спершу «ми не лікарі» */}
        <section style={{ backgroundColor: BG_GRAY, borderTop: BORDER }}>
          <div className="max-w-[1200px] mx-auto px-6 lg:px-14 py-12">
            <div className="max-w-3xl text-xs text-gray-500 leading-relaxed space-y-2">
              <p>
                Текст підготувала редакція check-up.in.ua; ми не лікарі. Ми знаємо, як складають чекапи зсередини: сервіси
                для пацієнтів з 2014 року, чекапи з 2019 року.
              </p>
              <p>
                Медичний рецензент: <strong className="text-gray-700">{REVIEWER.name}</strong>, {REVIEWER.jobTitle},{' '}
                {REVIEWER.org}.
              </p>
              <p>
                Розкриття: check-up.in.ua отримує комісію від клінік-партнерів за факт запису. Перелік обстежень на
                сторінках віку складений за клінічними настановами, а не за складом програм партнерів.
              </p>
              <p className="font-semibold text-gray-600 pt-2">Джерела</p>
              <ol className="space-y-1.5 list-none">
                {SOURCES.map((s, i) => (
                  <li key={i} id={`source-${i + 1}`} className="flex gap-2 scroll-mt-24">
                    <span className="font-semibold text-gray-700 shrink-0">{i + 1}.</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ol>
              <p className="pt-2">Оновлено: {UPDATED_LABEL}</p>
            </div>
          </div>
        </section>
      </main>

      {clinic && programs.length > 0 && (
        <BookingFlow
          programs={programs}
          branches={branches}
          clinicId={clinic.id}
          clinicSlug={clinic.slug}
          city="kharkiv"
          programsComposition={Object.fromEntries(offers.map((o) => [o.program.slug, o.composition.counts]))}
        />
      )}
    </>
  );
}
