import type { Metadata } from 'next';
import { cache } from 'react';
import Link from 'next/link';
import { fetchClinicOffers, type ClinicOffer, type OfferBranch } from '@/lib/programs/clinic-offer';
import { AGE_STEP_PAGES, type AgeStepGender } from '@/lib/programs/age-pages';
import AccordionSection from '@/components/shared/AccordionSection';
import BookingFlow, { BookCta } from '@/components/city/BookingFlow';

// Хаб міста – чернетка SPRINT-KHARKIV-v0, розділ 5.4:
// Hero · вибір статі (2 картки) і вікові сторінки · скринінгові сторінки · партнер і двері до клініки · FAQ · GEO · автор.
// Квізу немає, каталогу програм немає.
// Контент: content/kharkiv/city.md (v0) дослівно. Старі MD у content/kharkiv/ не використовуються.
// Вікові сторінки – тільки з реєстру lib/programs/age-pages.ts (чоловічі з'являться там у сесії 3 без правок цього файлу).
// Програми, філії – тільки з Supabase (fetchClinicOffers з 8 віковими платформними програмами):
// platform_program_offers → checkup_programs (program_type = 'clinic') → onclinic-kharkiv.
// Hero, «Двері», GEO, автор – верстка в сторінці (рішення спринту, без нових спільних компонентів).

export const revalidate = 3600;

const PAGE_PATH = '/ukr/kharkiv';
const PAGE_URL = `https://check-up.in.ua${PAGE_PATH}`;
const CLINIC_SLUG = 'onclinic-kharkiv';
const SOURCE_CTA = 'city_hub_kharkiv';
// SEO-STANDARD р.4, Тип 5 (сесія 3). Опис (meta description) – у generateMetadata з даних.
const TITLE = 'Чекап в Харкові: програми, ціни, клініки | check-up.in.ua';
const H1 = 'Чекап в Харкові';
const UPDATED_ISO = '2026-09-23';
const UPDATED_LABEL = '23.09.2026';

const BORDER = '1px solid #e8edf3';
const BG_GRAY = '#f8fafc';
const BG_WHITE = '#ffffff';
const P = 'text-gray-700 leading-relaxed mt-4';

/* Картки статі. Вікові посилання під карткою – з реєстру AGE_STEP_PAGES. */
const GENDER_CARDS: { gender: AgeStepGender; title: string; line: string; href: string; linkLabel: string }[] = [
  {
    gender: 'female',
    title: 'Жінкам',
    line: 'Скринінг раку шийки матки, молочних залоз, тиск, холестерин і глюкоза – за віком.',
    href: '/ukr/female-checkup/kharkiv',
    linkLabel: 'Жіночий чекап у Харкові',
  },
  {
    gender: 'male',
    title: 'Чоловікам',
    line: 'Перелік обстежень за віком і програма клініки для чоловіків.',
    href: '/ukr/male-checkup/kharkiv',
    linkLabel: 'Чоловічий чекап у Харкові',
  },
];

/* Платформні програми вікових сторінок обох статей – для назв програм клініки і BookingFlow. */
const PLATFORM_PROGRAMS = [
  'female-checkup-do-30',
  'female-checkup-30-40',
  'female-checkup-40-50',
  'female-checkup-vid-50',
  'male-checkup-do-30',
  'male-checkup-30-40',
  'male-checkup-40-50',
  'male-checkup-vid-50',
];

/* Скринінгові сторінки. */
const SCREENINGS: { href: string; label: string; line: string }[] = [
  { href: '/ukr/screening/mamografiia', label: 'Мамографія', line: 'скринінг раку молочної залози.' },
  { href: '/ukr/screening/pap-test', label: 'ПАП-тест', line: 'скринінг раку шийки матки.' },
  { href: '/ukr/screening/psa', label: 'Аналіз PSA', line: 'скринінг раку передміхурової залози, за спільним рішенням з лікарем.' },
];

/* Джерела: [n] у тексті → пункт n */
const SOURCES: string[] = [
  'МОЗ України. Наказ №504 (2018), яким скасовано диспансеризацію; замінив наказ №728.',
  "Кабінет Міністрів України. Постанова №1652 (2025) «Скринінг здоров'я 40+», діє з 01.01.2026: серцево-судинні захворювання, цукровий діабет 2 типу, ментальне здоров'я.",
];

/* FAQ: a – текст для Schema; body – те саме з маркерами джерел для сторінки. */
const FAQ: { q: string; a: string; body?: React.ReactNode }[] = [
  {
    q: 'З чого почати, якщо я ніколи не проходила або не проходив чекап?',
    a: 'Оберіть сторінку своєї статі, а на ній – свій вік. Там перелік обстежень за клінічними настановами і пояснення, що з нього є в програмі клініки.',
  },
  {
    q: "Чи є в Україні обов'язкова диспансеризація?",
    a: "Ні. Диспансеризацію скасовано 2018 року. З 1 січня 2026 року діє державна програма «Скринінг здоров'я 40+» для людей від 40: серцево-судинні захворювання, цукровий діабет 2 типу і ментальне здоров'я.",
    body: (
      <>
        Ні. Диспансеризацію скасовано 2018 року<S n={[1]} />. З 1 січня 2026 року діє державна програма «Скринінг
        здоров&apos;я 40+» для людей від 40: серцево-судинні захворювання, цукровий діабет 2 типу і ментальне здоров&apos;я
        <S n={[2]} />.
      </>
    ),
  },
  {
    q: 'Чим чекап відрізняється від окремого скринінгу?',
    a: 'Скринінг – одне обстеження для однієї хвороби, наприклад мамографія. Чекап – набір обстежень і консультацій за віком, з висновком лікаря за сукупністю показників.',
  },
  {
    q: 'Чи можна пройти перелік не в клініці-партнері?',
    a: 'Так. Перелік на сторінках віку складений за клінічними настановами, а не за прайсом клініки, і його можна пройти в будь-якому закладі. Запис до клініки-партнера – зручність, а не умова.',
  },
  {
    q: 'Як записатися?',
    a: "Натисніть «Записатися» на сторінці віку або в блоці клініки, залиште ім'я і телефон. Клініка зв'яжеться з вами, щоб погодити дату і філію.",
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

const getOffers = cache(() => fetchClinicOffers(PLATFORM_PROGRAMS, CLINIC_SLUG));

/** SEO-STANDARD р.4, Тип 5: X – мінімальна ціна (price_discount) програм клініки для сторінки,
 *  N – кількість клінік-партнерів у даних. Обидва – з Supabase, не з коду. */
function metaDescription(offers: ClinicOffer[]): string {
  const prices = offers.map((o) => o.program.price_discount).filter((p) => typeof p === 'number' && p > 0);
  const x = prices.length > 0 ? Math.min(...prices) : null;
  const n = new Set(offers.map((o) => o.program.clinic_id)).size;
  const parts = [`Програми чекапу в Харкові${x ? ` – ціни від ${x.toLocaleString('uk-UA')} грн` : ''}.`];
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
      languages: { uk: PAGE_PATH, ru: '/kharkov' },
    },
    openGraph: { title: TITLE, description, url: PAGE_URL, type: 'website' },
  };
}

export default async function KharkivCityHubPage() {
  const { clinic, branches, offers } = await getOffers();
  const programs = offers.map((o) => o.program);

  const cards = GENDER_CARDS.map((c) => ({
    ...c,
    ages: AGE_STEP_PAGES.filter((p) => p.gender === c.gender),
  }));

  const jsonLd: object[] = [
    {
      '@context': 'https://schema.org',
      '@type': 'MedicalWebPage',
      name: H1,
      url: PAGE_URL,
      dateModified: UPDATED_ISO,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'check-up.in.ua', item: 'https://check-up.in.ua' },
        { '@type': 'ListItem', position: 2, name: 'Харків', item: PAGE_URL },
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

        {/* 1. Hero – без ціни, без квізу */}
        <section style={{ backgroundColor: BG_GRAY }}>
          <div className="max-w-[1200px] mx-auto px-6 lg:px-14 py-14">
            <div className="max-w-3xl">
              <nav aria-label="Breadcrumb" className="text-xs text-gray-500 mb-8">
                <Link href="/" className="hover:underline">check-up.in.ua</Link>
                <span className="mx-1.5">/</span>
                <span className="text-gray-700">Харків</span>
              </nav>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#005485] mb-6">Чекап · Харків</p>
              <h1
                className="font-bold leading-tight mb-6"
                style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 'clamp(32px, 5.5vw, 56px)' }}
              >
                {H1}
              </h1>
              <p className="text-lg text-gray-700 leading-relaxed mt-2">
                Що перевіряти без скарг, залежить від статі і віку. Оберіть свою сторінку: на ній – перелік за клінічними
                настановами, готова програма клініки в Харкові і що до неї додати.
              </p>
            </div>
          </div>
        </section>

        {/* 2. Вибір статі і вікові сторінки з реєстру */}
        <section style={{ backgroundColor: BG_WHITE, borderTop: BORDER }}>
          <div className="max-w-[1200px] mx-auto px-6 lg:px-14 py-14">
            <Eyebrow>Для кого</Eyebrow>
            <H2 id="stat">Оберіть, для кого чекап</H2>
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-5">
              {cards.map((c) => (
                <div key={c.gender} className="border border-[#e8edf3] rounded-[14px] p-6 bg-white flex flex-col">
                  <Link href={c.href} className="group">
                    <p className="text-xl font-bold text-[#0b1a24] group-hover:text-[#005485]">{c.title}</p>
                    <p className="text-[14px] text-gray-700 leading-relaxed mt-2">{c.line}</p>
                    <p className="text-sm font-semibold text-[#005485] mt-3 group-hover:underline">{c.linkLabel} →</p>
                  </Link>
                  {c.ages.length > 0 && (
                    <div className="mt-5 pt-4 border-t border-[#e8edf3]">
                      <p className="text-xs text-gray-500">За віком</p>
                      <ul className="mt-2 flex flex-wrap gap-2">
                        {c.ages.map((a) => (
                          <li key={a.href}>
                            <Link
                              href={a.href}
                              className="inline-flex items-center min-h-10 px-3 rounded-[10px] border border-[#e8edf3] text-sm text-[#005485] hover:border-[#005485]"
                            >
                              {a.ageStepLabel.replace('-', '–')}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 3. Скринінгові сторінки */}
        <Section bg={BG_GRAY} eyebrow="Скринінги">
          <H2 id="skryninhy">Окремі скринінги</H2>
          <p className={P}>Якщо вас цікавить одне обстеження, а не весь чекап: хто, як часто і навіщо його проходить.</p>
          <ul className="mt-6 space-y-3">
            {SCREENINGS.map((s) => (
              <li key={s.href} className="text-[15px] text-gray-700 leading-relaxed">
                <Link href={s.href} className="font-semibold text-[#005485] hover:underline">
                  {s.label}
                </Link>{' '}
                – {s.line}
              </li>
            ))}
          </ul>
        </Section>

        {/* 4. Клініка-партнер і двері */}
        {clinic && (
          <Section bg={BG_WHITE} eyebrow="Клініка">
            <H2 id="klinika">Клініка-партнер у Харкові</H2>
            <p className={P}>
              {clinic.name}
              {branches.length > 0 ? ` – ${branches.length} ${branchesWord(branches.length)} у Харкові.` : '.'}
              {programs.length > 0 &&
                ` Програми клініки: ${quoted(programs.map((p) => p.name_ua))}. Яка програма відповідає вашій статі і віку, показано на сторінці віку.`}
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
                  <p className="text-[14px] text-gray-700 leading-relaxed">{f.body ?? f.a}</p>
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
                  Чекап у Харкові можна пройти в {clinic.name}: {branches.length} {branchesWord(branches.length)} –{' '}
                  {branches.map((b) => `${b.address_ua}${b.metro_ua ? ` (${b.metro_ua})` : ''}`).join('; ')}.
                  {programs.length > 0 ? ` Програми клініки – ${quoted(programs.map((p) => p.name_ua))}.` : ''}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* 7. Автор – спершу «ми не лікарі». Рецензент хабу не названий – блоку рецензента немає. */}
        <section style={{ backgroundColor: BG_GRAY, borderTop: BORDER }}>
          <div className="max-w-[1200px] mx-auto px-6 lg:px-14 py-12">
            <div className="max-w-3xl text-xs text-gray-500 leading-relaxed space-y-2">
              <p>
                Текст підготувала редакція check-up.in.ua; ми не лікарі. Ми знаємо, як складають чекапи зсередини: сервіси
                для пацієнтів з 2014 року, чекапи з 2019 року.
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
