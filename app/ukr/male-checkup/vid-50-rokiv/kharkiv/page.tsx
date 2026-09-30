import type { Metadata } from 'next';
import { cache } from 'react';
import Link from 'next/link';
import { fetchClinicOffers, type ClinicOffer, type OfferBranch } from '@/lib/programs/clinic-offer';
import { priceDateNotice } from '@/lib/programs/type5a';
import CompositionSummaryText from '@/components/program-page/CompositionSummaryText';
import StickyMobileCta from '@/components/program-page/StickyMobileCta';
import AdditionalServices from '@/components/program-page/AdditionalServices';
import AccordionSection from '@/components/shared/AccordionSection';
import InfoFrame from '@/components/shared/InfoFrame';
import CrossAgeNav from '@/components/shared/CrossAgeNav';
import BookingFlow, { BookCta } from '@/components/city/BookingFlow';

// Вікова сторінка міста – чернетка SPRINT-KHARKIV-v0, каркас 5.2 (12 блоків).
// Контент: content/kharkiv/male-vid-50-rokiv.md (v0) дослівно; файл згенеровано з того самого джерела, що й MD.
// Програма, ціна, дата ціни, склад, філії – тільки з Supabase (fetchClinicOffers):
// platform_program_offers → checkup_programs (program_type = 'clinic') → onclinic-kharkiv.
// Hero, «Двері», GEO, автор – верстка в сторінці (рішення спринту, без нових спільних компонентів).
// Рецензента чоловічих сторінок немає – блок рецензента і reviewedBy не рендеряться.
// Склад програми може бути порожнім у даних (program_services) – тоді міст блоку 4 не рендериться.

export const revalidate = 3600;

const PAGE_PATH = '/ukr/male-checkup/vid-50-rokiv/kharkiv';
const PAGE_URL = `https://check-up.in.ua${PAGE_PATH}`;
const PLATFORM_PROGRAM = 'male-checkup-vid-50';
const CLINIC_SLUG = 'onclinic-kharkiv';
const SOURCE_CTA = 'age_page_male_vid_50_kharkiv';
// SEO-STANDARD р.4, Тип 5a. X (мінімальна ціна програм клініки для сторінки) – з Supabase у generateMetadata.
const TITLE = "Чекап для чоловіків після 50 років: які обстеження проходити, програми в Харкові | check-up.in.ua";
const DESCRIPTION_BASE = "Які обстеження потрібні чоловікам після 50 років. 5 цілей скринінгу.";
const UPDATED_ISO = '2026-09-23';
const UPDATED_LABEL = '23.09.2026';

const BORDER = '1px solid #e8edf3';
const BG_GRAY = '#f8fafc';
const BG_WHITE = '#ffffff';
const P = 'text-gray-700 leading-relaxed mt-4';

const getOffers = cache(() => fetchClinicOffers([PLATFORM_PROGRAM], CLINIC_SLUG));

/** Мінімальна ціна (price_discount) програм клініки для сторінки; null – даних немає. */
function minPrice(offers: ClinicOffer[]): number | null {
  const prices = offers.map((o) => o.program.price_discount).filter((p) => typeof p === 'number' && p > 0);
  return prices.length > 0 ? Math.min(...prices) : null;
}

export async function generateMetadata(): Promise<Metadata> {
  const { offers } = await getOffers();
  const x = minPrice(offers);
  const description = x ? `${DESCRIPTION_BASE} Програми в Харкові від ${fmt(x)} грн.` : DESCRIPTION_BASE;
  return {
    title: { absolute: TITLE },
    description,
    robots: { index: true, follow: true },
    alternates: { canonical: PAGE_URL },
    openGraph: { title: TITLE, description, url: PAGE_URL, type: 'website' },
  };
}

/* Джерела: [n] у тексті → пункт n */
const SOURCES: string[] = [
  "МОЗ України. Наказ №1368 від 05.08.2024: порядки скринінгу і ранньої діагностики раку молочної залози, раку шийки матки і колоректального раку.",
  "USPSTF. Prostate Cancer: Screening.",
  "Mayo Clinic Family Health Book, 5th Edition.",
  "USPSTF. Prediabetes and Type 2 Diabetes: Screening, 2021. Дорослі 35–70 років з надлишковою вагою або ожирінням, кожні 3 роки.",
];

/* Цілі блоку 2 для зіставлення зі складом програми (блок 4, міст). */
const TARGETS: { label: string; keywords: string[]; missing: string | null }[] = [
  { label: "Холестерин (ліпідограма)", keywords: ["ліпідограм"], missing: "Якщо ви не перевіряли холестерин після 20 років або з останнього аналізу минуло понад 4–6 років, його можна здати окремо." },
  { label: "Глюкоза", keywords: ["глюкоз"], missing: null },
  { label: "Тест калу на приховану кров", keywords: ["прихован", "імунохімічн"], missing: null },
  { label: "Аналіз PSA", keywords: ["psa", "простат-специф", "простатспециф"], missing: null },
];

/* Кандидати в доповнення (screening-evidence-matrix.md, розділ 3). */
const ADDITIONS: { id: string; name: string; keywords: string[]; explanation: string; why: string }[] = [
  { id: "fit", name: "Тест калу на приховану кров", keywords: ["прихован", "імунохімічн"], explanation: "З 50 років раз на 2 роки, за факторами ризику – щороку з 40.", why: "З 50 років його роблять раз на 2 роки." },
  { id: "psa", name: "Аналіз PSA", keywords: ["psa", "простат-специф", "простатспециф"], explanation: "За спільним рішенням з лікарем, не автоматично: USPSTF – у 55–69 років, урологи Mayo Clinic – щороку з 50.", why: "Не автоматично: рішення про аналіз ухвалюють разом з лікарем." },
];
const WHERE_TO_GO = 'Можна пройти в іншому закладі і принести результат лікарю.';

const FAQ: { q: string; a: string }[] = [
  { q: "Чи потрібна колоноскопія, якщо нічого не турбує?", a: "Для скринінгу після 50 спочатку роблять тест калу на приховану кров раз на 2 роки. Колоноскопію призначають, якщо тест позитивний, протягом 1–2 місяців." },
  { q: "Чи потрібен аналіз PSA після 50?", a: "Автоматично – ні. Урологи Mayo Clinic підтримують щорічний аналіз з 50, USPSTF пропонує вирішувати щодо нього у 55–69 років разом з лікарем. Після 75, за Mayo Clinic, достатньо щорічного пальцевого огляду. Докладніше – на сторінці про аналіз PSA." },
  { q: "Чи потрібна денситометрія чоловікам?", a: "Для чоловіків без скарг доказів користі скринінгу остеопорозу недостатньо: USPSTF у 2025 році не дала рекомендації ні за, ні проти. Серед чоловіків 65 років і старше остеопороз мають 5,7 відсотка. Чи потрібна перевірка вам, вирішує лікар." },
  { q: "Чи потрібно перевіряти щитоподібну залозу?", a: "Популяційного скринінгу щитоподібної залози немає. USPSTF вважає доказів недостатньо, щоб перевіряти людей без скарг, а серед можливої шкоди називає хибнопозитивні результати, гіпердіагностику і надлікування. Перевірку вважають виправданою в старшому віці, при цукровому діабеті 1 типу, синдромі Дауна і після променевої терапії на ділянку голови і шиї. Чи потрібна вона вам, вирішує лікар." },
  { q: "Чи можна пройти перелік не в цій клініці?", a: "Так. Перелік складений за клінічними настановами, а не за прайсом клініки, і його можна пройти в будь-якому закладі. Запис до клініки-партнера на цій сторінці – зручність, а не умова." },
];

const SCHEDULE_LABELS: [string, string][] = [
  ['mon_fri', 'пн–пт'],
  ['sat', 'сб'],
  ['sun', 'нд'],
];

function fmt(n: number) {
  return n.toLocaleString('uk-UA');
}

function fmtDate(iso: string) {
  const [y, m, d] = iso.slice(0, 10).split('-');
  return `${d}.${m}.${y}`;
}

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

const has = (name: string, keywords: string[]) => keywords.some((k) => name.toLowerCase().includes(k));

/** Мала перша літера в середині речення, крім абревіатур (ПАП-тест). */
function lcFirst(s: string) {
  if (s.length > 1 && s[1] === s[1].toUpperCase() && s[1] !== s[1].toLowerCase()) return s;
  return s.charAt(0).toLowerCase() + s.slice(1);
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

export default async function MaleAgeVid50KharkivPage() {
  const { clinic, branches, clinicServiceNames, offers } = await getOffers();
  const offer = offers[0] ?? null;
  const program = offer?.program ?? null;
  const composition = offer?.composition ?? null;
  const items = composition?.items ?? [];
  const hasComposition = items.length > 0;

  // Блок 4, міст: цілі блоку 2 проти складу програми (без консультацій).
  const tests = items.filter((i) => i.serviceType !== 'consultation');
  const matched = TARGETS.map((t) => ({ ...t, found: tests.filter((i) => has(i.name, t.keywords)).map((i) => i.name) }));
  const inProgram = matched.filter((t) => t.found.length > 0);
  const missing = matched.filter((t) => t.found.length === 0 && t.missing);
  const matchedNames = new Set(inProgram.flatMap((t) => t.found));
  const beyond = tests.filter((i) => !matchedNames.has(i.name));
  const beyondInstrumental = beyond.filter((i) => i.serviceType === 'instrumental').map((i) => i.name);
  const beyondLab = beyond.filter((i) => i.serviceType === 'lab').map((i) => i.name);

  // Блок 5: доповнення, яких немає в складі; доступність – за clinic_services.
  const additions = ADDITIONS.filter((a) => !tests.some((i) => has(i.name, a.keywords)));
  const additionsAvailable = additions.filter((a) => clinicServiceNames.some((n) => has(n, a.keywords)));
  const additionsUnavailable = additions.filter((a) => !additionsAvailable.includes(a));
  const showAdditions = Boolean(program) && additions.length > 0;

  const notice = program?.price_date ? priceDateNotice(program.price_date) : undefined;

  const jsonLd: object[] = [
    {
      '@context': 'https://schema.org',
      '@type': 'MedicalWebPage',
      name: "Чекап для чоловіків після 50 років – що перевіряти і де пройти в Харкові",
      url: PAGE_URL,
      dateModified: UPDATED_ISO,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'check-up.in.ua', item: 'https://check-up.in.ua' },
        { '@type': 'ListItem', position: 2, name: 'Харків', item: 'https://check-up.in.ua/ukr/kharkiv' },
        { '@type': 'ListItem', position: 3, name: 'Чоловікам', item: 'https://check-up.in.ua/ukr/male-checkup/kharkiv' },
        { '@type': 'ListItem', position: 4, name: "Після 50 років", item: PAGE_URL },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: FAQ.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    },
  ];
  if (program && clinic) {
    jsonLd.push({
      '@context': 'https://schema.org',
      '@type': 'Offer',
      name: program.name_ua,
      price: program.price_discount,
      priceCurrency: 'UAH',
      ...(program.price_date ? { validFrom: program.price_date } : {}),
      url: PAGE_URL,
      seller: { '@type': 'MedicalClinic', name: clinic.name },
    });
  }

  return (
    <>
      <main className="text-[#0b1a24] pb-24 md:pb-0">
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
                <Link href="/ukr/male-checkup/kharkiv" className="hover:underline">Чоловікам</Link>
                <span className="mx-1.5">/</span>
                <span className="text-gray-700">Після 50 років</span>
              </nav>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#005485] mb-6">Чоловічий чекап · Харків</p>
              <h1
                className="font-bold leading-tight mb-6"
                style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 'clamp(32px, 5.5vw, 56px)' }}
              >
                Чекап для чоловіків після 50 років – що перевіряти і де пройти в Харкові
              </h1>
              <p className="text-lg text-gray-700 leading-relaxed mt-2">Сторінка для чоловіків після 50 років без скарг. Спочатку перелік за клінічними настановами, потім готова програма клініки в Харкові і що до неї додати.</p>
            </div>
          </div>
        </section>

        {/* 2. Що вам потрібно в цьому віці – не залежить від партнера */}
        <Section bg={BG_WHITE} eyebrow="За клінічними настановами">
          <H2 id="shcho-potribno">Що вам потрібно в цьому віці</H2>
          <p className={P}>Після 50 до переліку додається скринінг колоректального раку<S n={[1]} />, а аналіз PSA стає темою для розмови з лікарем<S n={[2, 3]} />.</p>
          <h3 className="text-lg font-semibold text-[#0b1a24] mt-8">Колоректальний рак</h3>
          <p className={P}>З 50 років тест калу на приховану кров або фекальний імунохімічний тест (ФІТ) роблять раз на 2 роки<S n={[1]} />. Позитивний результат означає колоноскопію протягом 1–2 місяців і консультацію проктолога або онколога<S n={[1]} />.</p>
          <h3 className="text-lg font-semibold text-[#0b1a24] mt-8">Простата: аналіз PSA</h3>
          <p className={P}>Аналіз PSA – не автоматичний пункт чекапу, а рішення, яке ухвалюють разом з лікарем. USPSTF пропонує його як спільне рішення пацієнта і лікаря у 55–69 років<S n={[2]} />. Урологи Mayo Clinic підтримують щорічний аналіз з 50 років, визнаючи недосконалість тесту, а після 75 вважають достатнім щорічний пальцевий огляд<S n={[3]} />.</p>
          <p className={P}>Через повільний розвиток раку передміхурової залози аналіз може вести до зайвих операцій чи опромінення при формах, які не спричинили б проблем<S n={[3]} />.</p>
          <p className="mt-3 text-sm"><Link href="/ukr/screening/psa" className="font-semibold text-[#005485] hover:underline">Докладніше про аналіз PSA →</Link></p>
          <h3 className="text-lg font-semibold text-[#0b1a24] mt-8">Артеріальний тиск</h3>
          <p className={P}>Від 40 років тиск вимірюють щороку<S n={[3]} />. Це вимірювання на прийомі, окремого аналізу для нього не потрібно.</p>
          <h3 className="text-lg font-semibold text-[#0b1a24] mt-8">Холестерин</h3>
          <p className={P}>Якщо показники в нормі, холестерин повторюють раз на 4–6 років від першого вимірювання у 20 років<S n={[3]} />.</p>
          <h3 className="text-lg font-semibold text-[#0b1a24] mt-8">Цукровий діабет 2 типу</h3>
          <p className={P}>До 70 років чоловікам із надлишковою вагою або ожирінням, тобто з індексом маси тіла 25 і більше, скринінг переддіабету і діабету 2 типу роблять раз на 3 роки<S n={[4]} />.</p>
        </Section>

        {/* 3. Що залежить від вашої історії */}
        <Section bg={BG_GRAY} eyebrow="Ваша історія">
          <H2 id="istoriia">Що залежить від вашої історії</H2>
          <p className={P}>Перелік вище розрахований на чоловіка без скарг і без особливої історії. Він змінюється, якщо:</p>
          <h3 className="text-lg font-semibold text-[#0b1a24] mt-8">Фактори ризику колоректального раку</h3>
          <p className={P}>Скринінг починають з 40 років і роблять щороку, а не раз на 2 роки<S n={[1]} />. Які фактори ризику є саме у вас, оцінює лікар.</p>
        </Section>

        {/* 4. Готовий варіант – програма клініки з даних */}
        <Section bg={BG_WHITE} eyebrow="Програма клініки">
          <H2 id="gotovyi-variant">Готовий варіант у Харкові</H2>
          {program && clinic && composition ? (
            <>
              <div className="mt-6 border border-[#e8edf3] rounded-[14px] p-6 bg-white">
                <p className="text-xs font-semibold text-gray-500">{clinic.name}</p>
                <p className="text-xl font-bold text-[#0b1a24] mt-1">{program.name_ua}</p>
                <p className="text-2xl font-bold text-[#0b1a24] mt-4">{fmt(program.price_discount)} грн</p>
                {program.price_date && (
                  <p className="text-xs text-gray-500 mt-1">Ціна клініки станом на {fmtDate(program.price_date)}</p>
                )}
                {notice && <p className="text-xs text-gray-500 mt-1">{notice}</p>}
                {hasComposition && (
                <div className="mt-5">
                  <CompositionSummaryText
                    consultationsSummary={composition.consultationsSummary}
                    instrumentalSummary={composition.instrumentalSummary}
                    labSummary={composition.labSummary}
                  />
                </div>
                )}
                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <BookCta programSlug={program.slug} sourceCta={`${SOURCE_CTA}_card`} label="Записатися" className="sm:!w-auto sm:px-8" />
                  {clinic.website && (
                    <a
                      href={clinic.website}
                      className="inline-flex items-center justify-center min-h-12 px-6 rounded-[10px] border border-[#005485] text-[#005485] font-semibold text-sm hover:bg-[#f0f7fb]"
                    >
                      Детальніше
                    </a>
                  )}
                </div>
              </div>

              <div className="mt-6 text-[13px] text-gray-500 leading-relaxed space-y-2">
                <p>Перелік на цій сторінці – орієнтир, а не призначення. Повний перелік обстежень визначає лікар за результатами огляду і розмови з вами.</p>
                <p>Програма дає лікарю ширшу картину, ніж окремий аналіз: висновок він робить за сукупністю показників.</p>
              </div>

              {!hasComposition && (
                <p className={P}>
                  Склад програми на сайті поки не опублікований. Чи входять у неї обстеження з переліку вище, уточніть у
                  клініці під час запису.
                </p>
              )}

              {hasComposition && inProgram.length > 0 && (
                <p className={P}>
                  З переліку вище в програмі є: {inProgram.map((t) => lcFirst(t.label)).join(', ')}.
                </p>
              )}

              {(beyondInstrumental.length > 0 || beyondLab.length > 0) && (
                <div className="mt-6">
                  <AccordionSection summary="Що ще входить у програму">
                    <div className="space-y-4 text-[14px] text-gray-700 leading-relaxed">
                      {beyondInstrumental.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-gray-500 mb-1">Обстеження</p>
                          <ul className="list-disc pl-5 space-y-1">
                            {beyondInstrumental.map((n) => (
                              <li key={n}>{n}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {beyondLab.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-gray-500 mb-1">Аналізи</p>
                          <ul className="list-disc pl-5 space-y-1">
                            {beyondLab.map((n) => (
                              <li key={n}>{n}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </AccordionSection>
                </div>
              )}

              {composition.consultationsSummary && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-[#0b1a24]">Консультації</h3>
                  <p className={P}>На першому візиті: {composition.consultationsSummary}.</p>
                  {composition.visit2Items.length > 0 && (
                    <p className={P}>
                      Другий візит – {composition.visit2Items.map(lcFirst).join(', ')}: лікар розбирає результати разом.
                    </p>
                  )}
                </div>
              )}

              {hasComposition && missing.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-[#0b1a24]">Чого з переліку в програмі немає</h3>
                  <ul className="mt-3 space-y-3">
                    {missing.map((t) => (
                      <li key={t.label} className="text-[14px] text-gray-700 leading-relaxed">
                        <span className="font-semibold text-[#0b1a24]">{t.label}.</span> {t.missing} Результат принесіть на
                        другий візит.
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <p className={P}>Дані про програму клініки зараз недоступні. Перелік вище можна пройти в будь-якій клініці.</p>
          )}
        </Section>

        {/* 5. Що варто додати – без цін */}
        {showAdditions && program && (
          <Section bg={BG_GRAY} eyebrow="Доповнення">
            <H2 id="dodaty">Що варто додати</H2>
            <p className={P}>
              {hasComposition
                ? 'Позиції з переліку за віком, яких немає в готовій програмі.'
                : 'Позиції з переліку за віком, які варто обговорити з лікарем. Чи входять вони в готову програму, уточніть під час запису.'}
            </p>
            <div className="mt-6">
              <AdditionalServices
                available={additionsAvailable.map((a) => ({ id: a.id, name: a.name, explanation: a.explanation }))}
                unavailable={additionsUnavailable.map((a) => ({ name: a.name, why: a.why, whereToGo: WHERE_TO_GO }))}
                programSlug={program.slug}
                sourceCta={`${SOURCE_CTA}_additions`}
                clinicName={clinic?.name}
                showPrices={false}
              />
            </div>
          </Section>
        )}

        {/* 6. Якщо готова не підходить */}
        <Section bg={showAdditions ? BG_WHITE : BG_GRAY} eyebrow="Інший шлях">
          <H2 id="inshyi-shliakh">Якщо готова програма не підходить</H2>
          <div className="mt-6">
            <InfoFrame>
              <p>Перелік з блоку «Що вам потрібно в цьому віці» можна пройти в будь-якій клініці. Він складений за клінічними настановами, а не за прайсом, тому придатний як основа: з його результатами лікар робить висновок і, якщо потрібно, призначає персональні обстеження.</p>
            </InfoFrame>
          </div>
        </Section>

        {/* 7. Двері до клініки */}
        {clinic && (
          <Section bg={showAdditions ? BG_GRAY : BG_WHITE} eyebrow="Контакти">
            <H2 id="kontakty">Контакти клініки</H2>
            <p className={P}>
              {clinic.name}
              {branches.length > 0 ? ` – ${branches.length} ${branchesWord(branches.length)} у Харкові.` : '.'}
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
            {clinic.website && (
              <p className="mt-4 text-sm">
                <a href={clinic.website} className="font-semibold text-[#005485] hover:underline">
                  Сторінка клініки на check-up.in.ua →
                </a>
              </p>
            )}
          </Section>
        )}

        {/* 8. Як це проходить */}
        {program && composition && composition.visitCount > 0 && (
          <Section bg={showAdditions ? BG_WHITE : BG_GRAY} eyebrow="Візити">
            <H2 id="yak-tse-prokhodyt">Як це проходить</H2>
            <p className={P}>
              Програма проходить за {composition.visitCount} {composition.visitCount === 1 ? 'візит' : 'візити'}.
            </p>
            <h3 className="text-lg font-semibold text-[#0b1a24] mt-8">Перший візит</h3>
            <div className="mt-3">
              <CompositionSummaryText
                consultationsSummary={composition.consultationsSummary}
                instrumentalSummary={composition.instrumentalSummary}
                labSummary={composition.labSummary}
              />
            </div>
            {composition.visit2Items.length > 0 && (
              <>
                <h3 className="text-lg font-semibold text-[#0b1a24] mt-8">Другий візит</h3>
                <p className={P}>{composition.visit2Items.join(', ')}.</p>
              </>
            )}
            {composition.preparationNotes.length > 0 && (
              <>
                <h3 className="text-lg font-semibold text-[#0b1a24] mt-8">Підготовка</h3>
                <ul className="mt-3 list-disc pl-5 space-y-1 text-[14px] text-gray-700 leading-relaxed">
                  {composition.preparationNotes.map((n) => (
                    <li key={n}>{n}</li>
                  ))}
                </ul>
              </>
            )}
            <p className={P}>
              Якщо ви приїжджаєте з іншого міста або з-за кордону, скажіть про це під час запису і вкажіть бажану дату.
            </p>
          </Section>
        )}

        {/* 9. FAQ – нативний <details>, відповіді в DOM */}
        <Section bg={BG_WHITE} eyebrow="Питання">
          <H2 id="faq">Часті запитання</H2>
          <div className="mt-6 space-y-3">
            {FAQ.map((f) => (
              <div key={f.q} className="border border-[#e8edf3] rounded-[10px] px-5 py-3">
                <AccordionSection summary={f.q}>
                  <p className="text-[14px] text-gray-700 leading-relaxed">{f.a}</p>
                </AccordionSection>
              </div>
            ))}
          </div>
        </Section>

        {/* 10. Інші вікові групи і стать */}
        <section style={{ backgroundColor: BG_GRAY, borderTop: BORDER }}>
          <div className="max-w-[1200px] mx-auto px-6 lg:px-14 py-10">
            <div className="max-w-3xl">
              <CrossAgeNav currentHref={PAGE_PATH} />
              <p className="text-sm mt-2">
                <Link href="/ukr/female-checkup/kharkiv" className="text-[#005485] hover:underline">
                  Чекап для жінок у Харкові →
                </Link>
              </p>
            </div>
          </div>
        </section>

        {/* 11. GEO – статичний текст з даних */}
        {clinic && branches.length > 0 && (
          <section style={{ backgroundColor: BG_WHITE, borderTop: BORDER }}>
            <div className="max-w-[1200px] mx-auto px-6 lg:px-14 py-10">
              <div className="max-w-3xl text-[14px] text-gray-600 leading-relaxed">
                <p>
                  Чекап для чоловіків після 50 років у Харкові можна пройти в {clinic.name}: {branches.length}{' '}
                  {branchesWord(branches.length)} –{' '}
                  {branches.map((b) => `${b.address_ua}${b.metro_ua ? ` (${b.metro_ua})` : ''}`).join('; ')}.
                  {program ? ` Програма клініки для цього віку – «${program.name_ua}».` : ''}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* 12. Автор – спершу «ми не лікарі». Рецензента немає. */}
        <section style={{ backgroundColor: BG_GRAY, borderTop: BORDER }}>
          <div className="max-w-[1200px] mx-auto px-6 lg:px-14 py-12">
            <div className="max-w-3xl text-xs text-gray-500 leading-relaxed space-y-2">
              <p>
                Текст підготувала редакція check-up.in.ua; ми не лікарі. Ми знаємо, як складають чекапи зсередини: сервіси
                для пацієнтів з 2014 року, чекапи з 2019 року.
              </p>
              <p>
                Розкриття: check-up.in.ua отримує комісію від клінік-партнерів за факт запису. Перелік обстежень на цій
                сторінці складений за клінічними настановами, а не за складом програм партнерів.
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

      {program && clinic && composition && (
        <>
          <BookingFlow
            programs={[program]}
            branches={branches}
            clinicId={clinic.id}
            clinicSlug={clinic.slug}
            city="kharkiv"
            programsComposition={{ [program.slug]: composition.counts }}
          />
          <StickyMobileCta programNameShort={program.name_ua} programSlug={program.slug} sourceCta={`${SOURCE_CTA}_sticky`} />
        </>
      )}
    </>
  );
}
