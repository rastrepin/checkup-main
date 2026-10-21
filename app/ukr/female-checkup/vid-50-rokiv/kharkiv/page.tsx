import type { Metadata } from 'next';
import { cache } from 'react';
import Link from 'next/link';
import { fetchClinicOffers, type ClinicOffer, type OfferBranch } from '@/lib/programs/clinic-offer';
import { priceDateNotice } from '@/lib/programs/type5a';
import StickyMobileCta from '@/components/program-page/StickyMobileCta';
import AdditionalServices from '@/components/program-page/AdditionalServices';
import CrossAgeNav from '@/components/shared/CrossAgeNav';
import InPageNav, { type InPageNavItem } from '@/components/shared/InPageNav';
import Header from '@/components/frame/Header'
import Hero from '@/components/frame/Hero'
import HeroChips from '@/components/frame/HeroChips'
import ProgramBridge from '@/components/frame/ProgramBridge'
import ZoneHeader from '@/components/frame/ZoneHeader'
import ClampMobile from '@/components/frame/ClampMobile'
import Accordion from '@/components/frame/Accordion'
import AccordionMobile from '@/components/frame/AccordionMobile'
import ProgramLocation from '@/components/frame/ProgramLocation'
import ProgramCard, { countText } from '@/components/frame/ProgramCard'
import { buttonClass } from '@/components/frame/Button';
import BookingFlow, { BookCta } from '@/components/city/BookingFlow';
import {
  type AgeAddition,
  additionsAskDoctor,
  REVIEWER,
  pageDatesText,
  additionsUnavailableReason,
  ADDITIONS_ADD_VIA_MANAGER,
  ANY_CLINIC_TEXT,
  DISCLOSURE_TEXT,
  DISCLOSURE_TITLE,
  DOCTOR_DECIDES_TEXT,
  EDITORIAL_TEXT_V2,
  FIRST_VISIT_TEXT,
  SECOND_VISIT_TEXT_V2,
  additionsIntro,
  additionsUnavailableTitle,
  faqOtherClinic,
  geoText,
  hoursDash,
  missingTestsSentence,
  preparationItems,
  programsItemListLd,
  programAgeSentence,
  programAgeShort,
  visitsText,
} from '@/lib/programs/age-page-shared';

// Вікова сторінка міста – SPRINT-KHARKIV-v0, тип 5a.
// Контент: content/kharkiv/female-vid-50-rokiv.md дослівно.
// Задача Cowork «Нова структура і тексти сторінки після 50» (v2, 24.09.2026) і доповнення з відповідями
// рецензента (цукор після 50 – Стандарт №1300 [7]; ВПЛ раз на 5–10 років і державний мінімум).
// Нова структура вмикається лише тут: сторінки до 30, 30–40 і 40–50 лишаються в попередньому вигляді.
// Програма, ціна, дата ціни, склад, філії – тільки з Supabase (fetchClinicOffers):
// platform_program_offers → checkup_programs (program_type = 'clinic') → onclinic-kharkiv.
// Тексти спільних блоків і правила виводу – lib/programs/age-page-shared.ts; опис складу – lib/programs/composition.ts.

export const revalidate = 3600;

const PAGE_PATH = '/ukr/female-checkup/vid-50-rokiv/kharkiv';
const PAGE_URL = `https://check-up.in.ua${PAGE_PATH}`;
const PLATFORM_PROGRAM = 'female-checkup-vid-50';
const CLINIC_SLUG = 'onclinic-kharkiv';
const SOURCE_CTA = 'age_page_female_vid_50_kharkiv';
// SEO-STANDARD р.4, Тип 5a. X (мінімальна ціна програм клініки для сторінки) – з Supabase у generateMetadata.
const TITLE = "Чекап для жінок після 50 років: які обстеження проходити, програми в Харкові | check-up.in.ua";
const DESCRIPTION_BASE = "Після 50 жінкам рекомендують мамографію, аналіз калу на приховану кров, ПАП-тест і перевірку тиску, холестерину й цукру.";
const UPDATED_ISO = '2026-09-29';
// Латка етапу 1, №3: рядок дат (ДД.ММ.РРРР); рецензент – спільний REVIEWER з lib/programs/age-page-shared.ts.
const PUBLISHED_LABEL = '29.09.2026';
const UPDATED_LABEL = '29.09.2026';

const TEXT = 'text-[#374151] leading-relaxed';
const P = `${TEXT} mt-4`;
const H3 = 'text-lg font-bold text-[#0b1a24] mt-8 scroll-mt-4 lg:scroll-mt-24';
const LINK = 'text-[#005485] underline hover:no-underline';

const getOffers = cache(() => fetchClinicOffers([PLATFORM_PROGRAM], CLINIC_SLUG));

/** Мінімальна ціна (price_discount) програм клініки для сторінки; null – даних немає. */
function minPrice(offers: ClinicOffer[]): number | null {
  const prices = offers.map((o) => o.program.price_discount).filter((p) => typeof p === 'number' && p > 0);
  return prices.length > 0 ? Math.min(...prices) : null;
}

export async function generateMetadata(): Promise<Metadata> {
  const { offers } = await getOffers();
  const x = minPrice(offers);
  const description = x
    ? `${DESCRIPTION_BASE} ${offers.length === 1 ? `Програма в Харкові – ${fmt(x)} грн.` : `Програми в Харкові від ${fmt(x)} грн.`}`
    : DESCRIPTION_BASE;
  return {
    title: { absolute: TITLE },
    description,
    robots: { index: true, follow: true },
    alternates: { canonical: PAGE_URL },
    openGraph: { title: TITLE, description, url: PAGE_URL, type: 'website' },
  };
}

/* Джерела: [n] у тексті → пункт n (нумерація задачі v2, розділ 15.2, і доповнення: [7] – Стандарт №1300). */
const SOURCES: string[] = [
  "МОЗ України. Наказ №1368 від 05.08.2024: порядки скринінгу і ранньої діагностики раку молочної залози, раку шийки матки і колоректального раку.",
  "USPSTF. Osteoporosis to Prevent Fractures: Screening, 2025. Жінки 65 років і старше; жінки до 65 у постменопаузі з підвищеним ризиком перелому.",
  "МОЗ України. Стандарт медичної допомоги «Скринінг раку шийки матки. Ведення пацієнток з аномальними результатами скринінгу та передраковими станами шийки матки», наказ №1057 від 18.06.2024.",
  "Mayo Clinic Family Health Book, 5th Edition.",
  "USPSTF. Prediabetes and Type 2 Diabetes: Screening, 2021. Дорослі 35–70 років з надлишковою вагою або ожирінням, кожні 3 роки.",
  "МОЗ України. Стандарт медичної допомоги «Рак молочної залози», наказ №195 від 03.02.2025.",
  "МОЗ України. Стандарт медичної допомоги «Цукровий діабет 2 типу у дорослих», наказ №1300 від 24.07.2024.",
];

const PAGE_MIN_AGE = 50;

/* Якорі підрозділів блоку 2 (картка з відповіддю в Hero веде на них). */
const ID = {
  list: 'shcho-potribno',
  breast: 'molochni-zalozy',
  colon: 'kolorektalnyi-rak',
  cervix: 'rak-shyiky-matky',
  bones: 'shchilnist-kistok',
  pressure: 'tysk',
  cholesterol: 'kholesteryn',
  diabetes: 'diabet',
  history: 'istoriia',
  programs: 'prohramy',
  composition: 'sklad-prohramy',
  additions: 'dodaty',
  visits: 'yak-tse-prokhodyt',
  contacts: 'kontakty',
  faq: 'faq',
} as const;

/* Картка з відповіддю: шість обстежень для всіх після 50 (назви – ті самі, що в мості блоку 4). */
const ANSWER_ITEMS: { label: string; id: string }[] = [
  { label: 'мамографія', id: ID.breast },
  { label: 'аналіз калу на приховану кров', id: ID.colon },
  { label: 'ПАП-тест', id: ID.cervix },
  { label: 'вимірювання тиску', id: ID.pressure },
  { label: 'аналіз на холестерин', id: ID.cholesterol },
  { label: 'аналіз на цукор', id: ID.diabetes },
];

/* Доповнення: усі обстеження з переліку, яких немає в програмі (screening-evidence-matrix.md, розділ 3).
 * forAll – рекомендоване після 50 усім; лише такі входять у {missingTests} (міст блоку 4, GEO).
 * Денситометрія після 50 не для всіх (з 65 або за факторів ризику), холестерин – залежно від попереднього
 * результату, тому forAll = false. */
const ADDITIONS: AgeAddition[] = [
  { id: "pap", name: "ПАП-тест", keywords: ["пап-тест", "цервікальн", "впл"], explanation: "Мазок на клітини шийки матки роблять раз на 3 роки. Його можна пройти окремо в гінеколога.", why: "Мазок на клітини шийки матки роблять раз на 3 роки. Його можна пройти окремо в гінеколога.", forAll: true, missingName: "ПАП-тест" },
  { id: "lipid", name: "Холестерин (ліпідограма)", keywords: ["ліпідограм"], explanation: "Якщо ви не перевіряли холестерин після 20 років або з останнього аналізу минуло понад 4–6 років, його можна здати окремо.", why: "Якщо ви не перевіряли холестерин після 20 років або з останнього аналізу минуло понад 4–6 років, його можна здати окремо.", forAll: false },
  { id: "mammo", name: "Мамографія", keywords: ["мамограф"], explanation: "У 50–69 років кожні 2 роки для всіх жінок.", why: <>У 50–69 років її роблять кожні 2 роки всім жінкам. УЗД молочних залоз не замінює мамографію: для скринінгу раку молочної залози після 50 років використовують саме мамографію<S n={[1]} />. Лікар може призначити УЗД додатково, якщо тканина молочних залоз щільна або потрібно уточнити зміни, знайдені на мамограмі: наприклад, відрізнити кісту від пухлини<S n={[6]} />.</>, forAll: true, missingName: "мамографія", missingNameAcc: "мамографію" },
  { id: "dxa", name: "Денситометрія (DXA)", keywords: ["денситометр", "dxa", "абсорбціометр"], explanation: "Її роблять з 65 років, а до 65, якщо менопауза вже настала і є фактори ризику перелому.", why: "Її роблять з 65 років, а до 65, якщо менопауза вже настала і є фактори ризику перелому.", forAll: false },
  { id: "fit", name: "Аналіз калу на приховану кров", keywords: ["прихован", "імунохімічн"], explanation: "З 50 до 75 років раз на 2 роки, за факторів ризику щороку.", why: "З 50 до 75 років раз на 2 роки, за факторів ризику щороку.", forAll: true, missingName: "аналіз калу на приховану кров" },
];

/** FAQ: видимий текст і FAQPage Schema будуються з одного масиву. */
function buildFaq(programName: string | null): { q: string; a: string }[] {
  const ageSentence = programAgeSentence(programName, 50);
  return [
    { q: "Менопауза вже настала. Що змінюється в переліку?", a: "У переліку за віком менопауза впливає лише на денситометрію. Якщо менопауза вже настала і є фактори ризику перелому, її рекомендують і до 65 років. Фактори ризику перелічені в розділі «Що залежить від вашої історії»." },
    { q: "Чи потрібна колоноскопія, якщо нічого не турбує?", a: "За порядком скринінгу МОЗ планова перевірка після 50 починається з аналізу калу на приховану кров раз на 2 роки. Колоноскопію роблять протягом 1–2 місяців, якщо в аналізі знайшли кров." },
    { q: "Чи потрібен ПАП-тест після 65?", a: "Ні, якщо попередні результати були нормальними: два негативні тести на ВПЛ або три нормальні мазки за останні 10 років. Якщо результатів ви не знаєте, скринінг продовжують." },
    faqOtherClinic(),
    ...(ageSentence
      ? [{ q: `Чому для жінок після 50 програма «${programName}»?`, a: `${ageSentence} Чого в ній немає, – у розділі «Чого немає в програмі».` }]
      : []),
  ];
}

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
  const parts = SCHEDULE_LABELS.filter(([k]) => b.schedule?.[k]).map(([k, label]) => `${label} ${hoursDash(String(b.schedule?.[k]))}`);
  return parts.length ? parts.join(', ') : null;
}

const has = (name: string, keywords: string[]) => keywords.some((k) => name.toLowerCase().includes(k));

/** Міст блоку 4: що з переліку є в програмі. Назви – як у картці з відповіддю; тиск – якщо в складі є прийом терапевта. */
function inProgramList(items: { name: string; serviceType: string }[]): string[] {
  const tests = items.filter((i) => i.serviceType !== 'consultation');
  const found = (keywords: string[]) => tests.some((i) => has(i.name, keywords));
  const out: string[] = [];
  if (found(['пап-тест', 'цервікальн', 'впл'])) out.push('ПАП-тест');
  if (items.some((i) => i.serviceType === 'consultation' && has(i.name, ['терапевт']))) out.push('вимірювання тиску на консультації терапевта');
  const chol = found(['ліпідограм']);
  const gluc = found(['глюкоз']);
  if (chol && gluc) out.push('аналізи на холестерин і цукор у крові');
  else if (chol) out.push('аналіз на холестерин');
  else if (gluc) out.push('аналіз на цукор у крові');
  return out;
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
  return <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#005485] mb-2">{children}</p>;
}

function H2({ children, id, className = '' }: { children: React.ReactNode; id?: string; className?: string }) {
  return (
    <h2 id={id} className={`font-bold text-[#0b1a24] scroll-mt-4 lg:scroll-mt-24 ${className}`} style={{ fontSize: 'clamp(24px, 3vw, 30px)', lineHeight: 1.25 }}>
      {children}
    </h2>
  );
}

/** Блок основної колонки: білий або сірий фон смуги, розділювач зверху (макет v2). */
// Відступ для переходу за якорем (scroll-mt): з 1024 px – під закріплене меню 1a; на mobile меню не закріплене,
// тому заголовок розділу стає біля верху екрана (25.09.2026).
// Фони смуг (правка Ігоря 26.09.2026): блоки чергують білий і сірий фон; блок-продовження має фон попереднього.
// Сіра смуга на desktop тягнеться на всю ширину екрана, під правою колонкою теж (тінь + clip-path, без зміни розмітки);
// картка програм у правій колонці закріплена (sticky); clip-path робить блоки окремим шаром, тому сайдбар має
// z-10; власного фону не має: над сірою смугою картка лежить на сірому, як і контент ліворуч.
const BAND_GRAY = 'bg-[#f4f6f8] shadow-[0_0_0_100vmax_#f4f6f8] [clip-path:inset(0_-100vmax)]';

function Block({ eyebrow, children, id, gray = false, className = '' }: { eyebrow?: string; children: React.ReactNode; id?: string; gray?: boolean; className?: string }) {
  return (
    <section id={id} className={`px-5 sm:px-6 lg:px-0 py-[var(--space-section)] border-t border-[#eef0f2] -scroll-mt-6 lg:scroll-mt-16 ${gray ? `${BAND_GRAY} band-gray` : 'band-white'} ${className}`}>
      <div className="max-w-3xl">
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        {children}
      </div>
    </section>
  );
}

function GroupLabel({ children, className = '' }: { children: string; className?: string }) {
  return <p className={`text-[13px] font-bold uppercase tracking-[0.08em] text-gray-500 ${className}`}>{children}</p>;
}

export default async function FemaleAgeVid50KharkivPage() {
  const { clinic, branches, clinicServiceNames, offers } = await getOffers();
  const offer = offers[0] ?? null;
  const program = offer?.program ?? null;
  const composition = offer?.composition ?? null;
  const items = composition?.items ?? [];

  const tests = items.filter((i) => i.serviceType !== 'consultation');
  const inProgram = inProgramList(items);
  const instrumentalAll = tests.filter((i) => i.serviceType === 'instrumental').map((i) => i.name);
  const labAll = tests.filter((i) => i.serviceType === 'lab').map((i) => i.name);

  // Блок 5: доповнення, яких немає в складі; доступність – за clinic_services.
  const additions = ADDITIONS.filter((a) => !tests.some((i) => has(i.name, a.keywords)));
  const additionsAvailable = additions.filter((a) => clinicServiceNames.some((n) => has(n, a.keywords)));
  const additionsUnavailable = additions.filter((a) => !additionsAvailable.includes(a));
  const showAdditions = Boolean(program) && additions.length > 0;

  // {missingTests}: з того самого зіставлення, що й блок «Чого немає в програмі»; лише forAll (спільний модуль).
  const missingText = program ? missingTestsSentence(additions, (a) => additionsAvailable.includes(a)) : null;
  const ageShort = programAgeShort(program?.name_ua, PAGE_MIN_AGE);
  const FAQ = buildFaq(program?.name_ua ?? null);
  const preparation = preparationItems(items);
  const visitCount = composition?.visitCount ?? 0;
  const showVisits = Boolean(program && composition && visitCount > 0);

  const notice = program?.price_date ? priceDateNotice(program.price_date) : undefined;
  const showComposition = Boolean(program && clinic && composition);

  const navItems: InPageNavItem[] = [
    { id: ID.list, label: 'Що перевірити' },
    { id: ID.programs, label: 'Програми' },
    { id: ID.faq, label: 'Питання' },
  ];

  const jsonLd: object[] = [
    {
      '@context': 'https://schema.org',
      '@type': 'MedicalWebPage',
      name: "Чекап для жінок після 50 років – що перевіряти і де пройти в Харкові",
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
        { '@type': 'ListItem', position: 3, name: 'Жінкам', item: 'https://check-up.in.ua/ukr/female-checkup/kharkiv' },
        { '@type': 'ListItem', position: 4, name: "Після 50 років", item: PAGE_URL },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: FAQ.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    },
  ];
  // SEO-STANDARD р.5 (тип 5a): ItemList програм блоку 1b; ціна з датою – лише всередині елемента програми.
  const programsLd = programsItemListLd({
    listName: 'Доступні програми в Харкові',
    programsUrl: `${PAGE_URL}#${ID.programs}`,
    city: 'Харків',
    clinic,
    programs: program ? [program] : [],
  });
  if (programsLd) jsonLd.push(programsLd);

  return (
    <>
      <Header city="kharkiv" section="female" tone="dark" />
      <main className="text-[#0b1a24]">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

        {/* 1. Hero – без ціни */}
        <Hero
          tone="dark"
          breadcrumbs={
            <nav aria-label="Breadcrumb">
                <Link href="/" className="hover:underline">check-up.in.ua</Link>
                <span className="mx-1.5">/</span>
                <Link href="/ukr/kharkiv" className="hover:underline">Харків</Link>
                <span className="mx-1.5">/</span>
                <Link href="/ukr/female-checkup/kharkiv" className="hover:underline">Жінкам</Link>
                <span className="mx-1.5">/</span>
                <span aria-current="page">Після 50 років</span>
              </nav>
          }
          kicker="Вам понад 50 і нічого не турбує – ця сторінка для вас"
          h1Size="clamp(30px, 5vw, 56px)"
          h1="Чекап для жінок після 50 років"
          h1Tail="що перевіряти і де пройти в Харкові"
          content={
            <HeroChips
              title="Рекомендують кожній:"
              items={ANSWER_ITEMS.map((a) => ({ label: a.label, href: `#${a.id}` }))}
              more={{ label: 'Коли проходити розширене обстеження ↓', href: `#${ID.history}` }}
            />
          }
          reassurance={
            <p className="flex items-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#04b5ba" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0">
                  <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
                <span>Інформаційний матеріал. Свій план обстеження обговоріть з лікарем.</span>
              </p>
          }
        />

        {/* 1a. Внутрішнє меню */}
        <InPageNav items={navItems} />
        {program && clinic && (
          <ProgramBridge
            className="lg:hidden"
            label="Програма клініки в Харкові"
            title={`${program.name_ua} · ${clinic.name}`}
            teaser={composition ? [composition.consultationsSummary && `Консультації: ${composition.consultationsSummary}.`, composition.instrumentalSummary].filter(Boolean).join(' ') : undefined}
            href={`#${ID.programs}`}
            cta="Переглянути програму ↓"
          />
        )}

        {/* ЗОНА РЕКОМЕНДАЦІЙ (макет зон 20.10): рекомендації для всіх, історія. Права колонка порожня. */}
        <div className="max-w-[1200px] mx-auto lg:px-14 lg:grid lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-x-12">
          <div className="min-w-0">
            {/* 2. Які обстеження рекомендують жінкам після 50 – не залежить від партнера */}
            <Block eyebrow="За клінічними настановами" id={ID.list}>
              <H2>Які обстеження рекомендують жінкам після 50</H2>
              <h3 id={ID.breast} className={H3}>Молочні залози</h3>
              <ClampMobile>
              <p className={P}>У 50–69 років мамографію роблять кожні 2 роки всім жінкам, навіть якщо факторів ризику немає<S n={[1]} />. Що робити після 69, описано на сторінці «<Link href="/ukr/screening/mamografiia" className={LINK}>Мамографія: що показує і коли потрібна</Link>».</p>
              {program && clinic && (
                <ProgramBridge
                  className="hidden lg:block mt-8 mb-2"
                  label="Програма клініки в Харкові"
                  title={`${program.name_ua} · ${clinic.name}`}
                  teaser={composition ? [composition.consultationsSummary && `Консультації: ${composition.consultationsSummary}.`, composition.instrumentalSummary].filter(Boolean).join(' ') : undefined}
                  href={`#${ID.programs}`}
                  cta="Переглянути програму ↓"
                />
              )}
              <p className={P}>Якщо з&apos;явилося ущільнення в грудях чи під пахвою, зміни шкіри, втягнення соска або виділення із соска, до лікаря звертаються одразу, не чекаючи планової мамографії<S n={[1]} />.</p>
              </ClampMobile>
              <h3 id={ID.colon} className={H3}>Колоректальний рак</h3>
              <ClampMobile>
              <p className={P}>З 50 до 75 років раз на 2 роки роблять аналіз калу на приховану кров або фекальний імунохімічний тест (ФІТ)<S n={[1]} />. Якщо цикл ще є, тест не здають під час менструації: краще зачекати кілька днів після її завершення, інакше аналіз може показати кров, якої в кишці немає.</p>
              <p className={P}>Якщо кров знайшли, протягом 1–2 місяців потрібні колоноскопія (огляд кишки зсередини тонкою гнучкою трубкою з камерою) і консультація проктолога або онколога<S n={[1]} />. Кров у калі не обов&apos;язково означає рак: частіше її причиною бувають поліпи, геморой або тріщина заднього проходу. Колоноскопія показує точну причину.</p>
              <p className={P}>Після 75 років планову перевірку припиняють. Чи потрібне обстеження далі, ви вирішуєте разом із лікарем, з огляду на стан здоров&apos;я і фактори ризику<S n={[1]} />.</p>
              </ClampMobile>
              <h3 id={ID.cervix} className={H3}>Рак шийки матки</h3>
              <ClampMobile>
              <p className={P}>До 65 років роблять мазок на клітини шийки матки (ПАП-тест) раз на 3 роки або тест на вірус папіломи людини (ВПЛ) раз на 5–10 років: інтервал ви обираєте разом із гінекологом<S n={[3]} />. Після 65 скринінг припиняють, якщо попередні результати були нормальними<S n={[3]} />. Державний порядок скринінгу передбачає мінімум: тест раз на 10 років до 55 років<S n={[1]} />. Детальніше на сторінці «<Link href="/ukr/screening/pap-test" className={LINK}>ПАП-тест: що показує і коли потрібен</Link>».</p>
              </ClampMobile>
              <h3 id={ID.bones} className={H3}>Щільність кісток</h3>
              <ClampMobile>
              <p className={P}>З 65 років рекомендують денситометрію: вимірювання щільності кісток на рентгенівському апараті з низькою дозою опромінення (метод DXA)<S n={[2]} />. Остеопороз, тобто підвищену крихкість кісток, має приблизно кожна четверта жінка 65 років і старше<S n={[2]} />. До 65 її роблять, якщо менопауза вже настала і є фактори ризику перелому: вони перелічені в розділі «<a href={`#${ID.history}`} className={LINK}>Що залежить від вашої історії</a>».</p>
              </ClampMobile>
              <h3 id={ID.pressure} className={H3}>Артеріальний тиск</h3>
              <ClampMobile>
              <p className={P}>Після 50 тиск вимірюють щороку<S n={[4]} />. Для цього достатньо вимірювання на прийомі, окремий аналіз не потрібен.</p>
              </ClampMobile>
              <h3 id={ID.cholesterol} className={H3}>Холестерин</h3>
              <ClampMobile>
              <p className={P}>Ліпідограма, тобто аналіз крові на холестерин і його фракції, показує, чи не підвищений ризик для серця і судин. Якщо ви її ще не здавали, аналіз варто зробити зараз. Якщо попередній результат був у нормі, його повторюють раз на 4–6 років<S n={[4]} />. Якщо результат відхиляється від норми, разом із лікарем ви визначаєте, коли повторити аналіз і що робити далі, з огляду на ваш загальний ризик.</p>
              </ClampMobile>
              <h3 id={ID.diabetes} className={H3}>Цукровий діабет 2 типу</h3>
              <ClampMobile>
              <p className={P}>Після 50 рівень цукру в крові рекомендують перевіряти всім, навіть за нормальної ваги: якщо результат у нормі, аналіз повторюють щонайменше раз на 3 роки<S n={[7]} />. Перевіряють аналізом крові на глюкозу натще або на глікований гемоглобін (HbA1c, середній рівень цукру за останні 2–3 місяці)<S n={[5]} />. Аналіз показує діабет 2 типу і переддіабет: стан, коли рівень цукру вже вищий за норму, але ще не досягає рівня діабету.</p>
              <p className={P}>Особливо важливо не пропускати аналіз, якщо є надлишкова вага (індекс маси тіла 25 і більше), діабет 2 типу був у батьків, братів чи сестер, під час вагітності був гестаційний діабет або є синдром полікістозних яєчників<S n={[5]} />.</p>
              </ClampMobile>
            </Block>
            {/* 2b. Що залежить від вашої історії */}
            <Block eyebrow="Ваша історія" id={ID.history}>
              <H2>Що залежить від вашої історії</H2>
              <p className={P}>Перелік вище розрахований на жінку без скарг і без особливої історії. Він змінюється, якщо:</p>
              <AccordionMobile title={<>Підтверджена мутація BRCA1 або BRCA2</>}>
                <p className={P}>Якщо у вас підтверджено мутацію в генах BRCA1 або BRCA2 (спадкова зміна, що підвищує ризик раку молочної залози), основним стандартом обстеження в Україні є щорічна МРТ молочних залоз із контрастною речовиною разом із мамографією<S n={[6]} />. Індивідуальну програму спостереження і профілактики ви узгоджуєте з онкологом-мамологом і лікарем-генетиком.</p>
              </AccordionMobile>
              <AccordionMobile title={<>Фактори ризику колоректального раку</>}>
                <p className={P}>Якщо є фактори ризику колоректального раку, аналіз калу на приховану кров або ФІТ роблять щороку<S n={[1]} />. До факторів ризику належать<S n={[1]} />:</p>
                <ul className={`mt-3 list-disc pl-5 space-y-1 ${TEXT}`}>
                  <li>колоректальний рак або поліпи кишечника в близьких родичів;</li>
                  <li>поліпи кишечника, знайдені у вас раніше;</li>
                  <li>запальні захворювання кишечника: хвороба Крона або виразковий коліт;</li>
                  <li>спадкові синдроми, зокрема сімейний аденоматозний поліпоз.</li>
                </ul>
                <p className={P}>Чи є у вас інші фактори ризику, ви оцінюєте разом із лікарем.</p>
              </AccordionMobile>
              <AccordionMobile title={<>Невідомі результати попередніх ПАП-тестів</>}>
                <p className={P}>Якщо вам більше 65 і ви не знаєте результатів попередніх мазків, скринінг продовжують, доки не буде двох негативних тестів на ВПЛ або трьох нормальних мазків за останні 10 років<S n={[3]} />.</p>
              </AccordionMobile>
              <AccordionMobile title={<>ВІЛ або інший стан, що пригнічує імунітет</>}>
                <p className={P}>Графік скринінгу інший: ПАП-тест або тест на ВПЛ роблять кожні 5 років<S n={[1]} />, і з віком скринінг не припиняють<S n={[3]} />.</p>
              </AccordionMobile>
              <AccordionMobile title={<>Менопауза і фактори ризику перелому</>}>
                <p className={P}>Якщо менопауза вже настала, денситометрію рекомендують і до 65 років за таких факторів ризику перелому<S n={[2]} />:</p>
                <ul className={`mt-3 list-disc pl-5 space-y-1 ${TEXT}`}>
                  <li>низька маса тіла;</li>
                  <li>перелом стегна в батька чи матері;</li>
                  <li>куріння;</li>
                  <li>надмірне вживання алкоголю.</li>
                </ul>
              </AccordionMobile>
            </Block>
          </div>
        </div>

        {/* ЗОНА ПРОГРАМИ (макет v2, 21.10; рішення Ігоря 1А 2А): локація – один раз на клініку, над її програмами;
            програма – картка: перший шар для рішення, решта – акордеон; ціна і запис – у картці. Сайдбара немає.
            Кілька програм – кілька ProgramCard одна під одною (зараз у даних одна програма клініки на сторінку). */}
        {program && clinic && (
          <ZoneHeader
            id={ID.programs}
            eyebrow="Програма клініки"
            title="Як пройти обстеження в Харкові"
            sub="Склад програми, її лікарі й ціна. Поруч – що з рекомендованого кожній у програму не входить."
          />
        )}
        <div className="bg-[var(--zone-program-bg)]">
          <div className="max-w-[1200px] mx-auto px-5 sm:px-6 lg:px-14 pt-8 lg:pt-12 pb-[var(--space-section)] flex flex-col gap-4 lg:gap-5">
            {clinic && (
              <ProgramLocation
                kicker="Контакти"
                name={clinic.name}
                city="в Харкові"
                moreLabel="Адреси і графік"
                branches={branches.map((b) => ({ id: b.id, name: b.name_ua, address: b.address_ua, metro: b.metro_ua, schedule: scheduleText(b), phone: b.tracking_phone }))}
                footer={
                  <>
                    {clinic.phone && (
                      <span>
                        Телефон:{' '}
                        <a href={`tel:${clinic.phone.replace(/\s/g, '')}`} className="text-link hover:underline">
                          {clinic.phone}
                        </a>
                      </span>
                    )}
                    {clinic.website && (
                      <a href={clinic.website} className="font-semibold text-link hover:underline">
                        Сторінка клініки на check-up.in.ua →
                      </a>
                    )}
                  </>
                }
              />
            )}
            {program && clinic && composition ? (
              <ProgramCard
                id={ID.composition}
                title={program.name_ua}
                meta={[
                  ...([ageShort, visitCount > 0 ? visitsText(visitCount) : null].filter(Boolean) as string[]),
                  ...(composition.counts.consultations > 0 ? [countText(composition.counts.consultations, ['консультація', 'консультації', 'консультацій'])] : []),
                  ...(composition.counts.diagnostics > 0 ? [countText(composition.counts.diagnostics, ['обстеження', 'обстеження', 'обстежень'])] : []),
                  ...(composition.counts.analyses > 0 ? [countText(composition.counts.analyses, ['аналіз', 'аналізи', 'аналізів'])] : []),
                ]}
                buyId="program-buy"
                buy={
                  <>
                    <div>
                      <p className="text-[30px] font-bold text-[var(--brand-primary)] leading-tight" style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
                        {fmt(program.price_discount)} грн
                      </p>
                      {program.price_date && <p className="text-[13px] text-text-secondary mt-1">Ціна клініки станом на {fmtDate(program.price_date)}</p>}
                      {notice && <p className="text-[13px] text-text-secondary mt-1">{notice}</p>}
                    </div>
                    <div className="flex flex-col gap-2.5">
                      <BookCta programSlug={program.slug} sourceCta={`${SOURCE_CTA}_card`} label="Записатися" className="uppercase tracking-[0.06em] text-[13px]" />
                      {clinic.website && (
                        <a href={clinic.website} className={`${buttonClass({ variant: 'secondary', size: 'lg', caps: true })} text-[13px]`}>
                          Детальніше
                        </a>
                      )}
                    </div>
                  </>
                }
                sections={
                  <>
                    <Accordion as="h4" summary="Повний склад програми">
                    <div className={`space-y-4 text-[15px] ${TEXT} pb-2`}>
                      {composition.consultationsSummary && (
                        <div>
                          <p className="font-semibold text-[#0b1a24] mb-1">Консультації</p>
                          <p>
                            Перший візит: {composition.consultationsSummary}.
                            {composition.visit2ConsultationsSummary && ` Другий візит: ${composition.visit2ConsultationsSummary}.`}
                          </p>
                        </div>
                      )}
                      {instrumentalAll.length > 0 && (
                        <div>
                          <p className="font-semibold text-[#0b1a24] mb-1">Обстеження</p>
                          <ul className="list-disc pl-5 space-y-1">
                            {instrumentalAll.map((n) => (
                              <li key={n}>{n}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {labAll.length > 0 && (
                        <div>
                          <p className="font-semibold text-[#0b1a24] mb-1">Аналізи</p>
                          <ul className="list-disc pl-5 space-y-1">
                            {labAll.map((n) => (
                              <li key={n}>{n}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    </Accordion>
                    {showAdditions && program && (
                      <Accordion as="h4" id={ID.additions} summary="Чого немає в програмі">
                <p className={P}>{additionsIntro(program.name_ua)}</p>
                <div className="mt-5">
                  <AdditionalServices
                    available={additionsAvailable.map((a) => ({ id: a.id, name: a.name, explanation: a.explanation }))}
                    unavailable={additionsUnavailable.map((a) => ({ name: a.name, why: a.why, whereToGo: '' }))}
                    programSlug={program.slug}
                    sourceCta={`${SOURCE_CTA}_additions`}
                    clinicName={clinic?.name}
                    showPrices={false}
                    mode="info"
                    unavailableTitle={additionsUnavailableTitle(clinic?.name)}
                    availableNote={ADDITIONS_ADD_VIA_MANAGER}
                  />
                </div>
                {additionsUnavailable.length > 0 && <p className={P}>{additionsUnavailableReason(additionsUnavailable.length, false)} {additionsAskDoctor(additionsUnavailable.length)}</p>}
                      </Accordion>
                    )}
                    {showVisits && composition && (
                      <Accordion as="h4" id={ID.visits} summary="Як це проходить">
                <p className={P}>Програма проходить за {visitsText(visitCount)}.</p>
                <div className="mt-4 flex flex-col gap-4">
                  <div className="flex gap-3">
                    <span className="w-8 h-8 shrink-0 rounded-full bg-[#e8f9fa] text-[#005485] font-bold flex items-center justify-center" aria-hidden="true">1</span>
                    <div>
                      <h3 className="font-bold text-[#0b1a24] mt-1">Перший візит</h3>
                      <p className={`${TEXT} mt-1`}>{FIRST_VISIT_TEXT}</p>
                    </div>
                  </div>
                  {composition.visit2Items.length > 0 && (
                    <div className="flex gap-3">
                      <span className="w-8 h-8 shrink-0 rounded-full bg-[#e8f9fa] text-[#005485] font-bold flex items-center justify-center" aria-hidden="true">2</span>
                      <div>
                        <h3 className="font-bold text-[#0b1a24] mt-1">Другий візит</h3>
                        <p className={`${TEXT} mt-1`}>{SECOND_VISIT_TEXT_V2}</p>
                      </div>
                    </div>
                  )}
                </div>
                <p className={P}>
                  Якщо ви приїжджаєте з іншого міста або з-за кордону, скажіть про це під час запису і вкажіть бажану дату.
                </p>
                      </Accordion>
                    )}
                    {preparation.length > 0 && (
                      <Accordion as="h4" summary="Підготовка">
                    <ul className={`list-disc pl-5 space-y-1 ${TEXT}`}>
                      {preparation.map((n, i) => (
                        <li key={n}>
                          {n}
                          {i < preparation.length - 1 ? ';' : '.'}
                        </li>
                      ))}
                    </ul>
                      </Accordion>
                    )}
                  </>
                }
              >
                <div className="mt-5">
                {(inProgram.length > 0 || missingText) && (
                  <div className="bg-[var(--zone-program-bg)] rounded-[var(--radius-lg)] p-4 flex flex-col gap-3">
                    {inProgram.length > 0 && (
                      <div className="flex gap-2.5 items-start">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#04b5ba" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0 mt-0.5">
                          <path d="M5 12l5 5 9-10" />
                        </svg>
                        <p className={TEXT}>
                          <span className="font-semibold text-[#0b1a24]">З переліку в програмі є:</span> {inProgram.join(', ')}.
                        </p>
                      </div>
                    )}
                    {missingText && (
                      <div className="flex gap-2.5 items-start">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#005485" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true" className="shrink-0 mt-0.5">
                          <path d="M12 5v14M5 12h14" />
                        </svg>
                        <p className={TEXT}>{missingText}</p>
                      </div>
                    )}
                  </div>
                )}

                </div>
                {composition.consultationsSummary && (
                  <>
                    <GroupLabel className="mt-5 mb-1">Консультації</GroupLabel>
                    <p className={TEXT}>{composition.consultationsSummary.charAt(0).toUpperCase() + composition.consultationsSummary.slice(1)}.</p>
                  </>
                )}
                {composition.instrumentalSummary && (
                  <>
                    <GroupLabel className="mt-4 mb-1">Обстеження</GroupLabel>
                    <p className={TEXT}>{composition.instrumentalSummary}</p>
                  </>
                )}
                {composition.labSummary && (
                  <>
                    <GroupLabel className="mt-4 mb-1">Аналізи</GroupLabel>
                    <p className={TEXT}>{composition.labSummary}</p>
                  </>
                )}

              </ProgramCard>
            ) : (
              <p className={TEXT}>Дані про програму клініки зараз недоступні. Перелік обстежень із цієї сторінки можна пройти в будь-якій клініці.</p>
            )}
            <div className="max-w-3xl mt-4 bg-[var(--teal-soft)] rounded-[var(--radius-lg)] p-4" role="note">
              <p className="text-ink leading-relaxed">{DOCTOR_DECIDES_TEXT}</p>
              <p className="text-[15px] text-text-secondary leading-relaxed mt-2">{ANY_CLINIC_TEXT}</p>
            </div>
          </div>
        </div>

        <div className="max-w-[1200px] mx-auto lg:px-14 lg:grid lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-x-12">
          <div className="min-w-0">
            {/* 8. FAQ – нативний <details>, відповіді в DOM */}
            <Block eyebrow="Питання" id={ID.faq}>
              <H2>Часті запитання</H2>
              <div className="mt-6 [&>.acc:last-child]:border-b [&>.acc:last-child]:border-section-border">
                {FAQ.map((f) => (
                  <Accordion key={f.q} as="h3" summary={f.q}>
                    <p className="text-[15px]">{f.a}</p>
                  </Accordion>
                ))}
              </div>
            </Block>
          </div>
        </div>

        {/* Другорядна інформація (правка Ігоря 26.09.2026): окрема смуга на всю ширину, поза колонками –
            картка програм сюди вже не заходить. Нижній відступ під закріплену кнопку запису на mobile – тут, а не в main,
            щоб під смугою не лишалося білої полоси. */}
        <section aria-label="Додаткова інформація" className="bg-[#e9edf1] border-t border-[#dde2e8] pb-24 md:pb-0">
          <div className="max-w-[1200px] mx-auto lg:px-14">
            {/* 8a. Інші вікові групи */}
            <div className="px-5 sm:px-6 lg:px-0 pt-10 pb-8">
              <div className="max-w-3xl">
                <CrossAgeNav currentHref={PAGE_PATH} typographicDash />
                <p className="text-[15px] mt-2">
                  <Link href="/ukr/male-checkup/kharkiv" className="font-semibold text-[#005485] hover:underline">
                    Чекап для чоловіків у Харкові →
                  </Link>
                </p>
              </div>
            </div>

            {/* 9. GEO – статичний текст з даних */}
            {clinic && branches.length > 0 && (
              <div className="mx-5 sm:mx-6 lg:mx-0 lg:max-w-3xl px-5 sm:px-6 py-6 bg-white rounded-[12px]">
                <p className="max-w-3xl text-sm text-[#4a5a6b] leading-relaxed">
                  {geoText({
                    subject: 'Чекап для жінок після 50 років',
                    clinicName: clinic.name,
                    branches,
                    phone: clinic.phone,
                    programName: program?.name_ua,
                    missingText,
                  })}
                </p>
              </div>
            )}

            {/* 10. Автор, рецензент, розкриття, джерела */}
            <div className="px-5 sm:px-6 lg:px-0 pt-8 pb-12">
              <div className="max-w-3xl text-[#374151] leading-relaxed space-y-3">
                <p className="text-[#0b1a24]">{EDITORIAL_TEXT_V2}</p>
                <p className="text-[15px]">
                  <span className="font-semibold text-[#0b1a24]">Медичний рецензент:</span> {REVIEWER.name}, {REVIEWER.jobTitle},{' '}
                  {REVIEWER.org}.
                </p>
                <GroupLabel className="pt-2">{DISCLOSURE_TITLE}</GroupLabel>
                <p className="text-sm text-gray-500">{DISCLOSURE_TEXT}</p>
                <p className="font-bold text-[#0b1a24] pt-2">Джерела</p>
                <ol className="space-y-1.5 list-none text-sm">
                  {SOURCES.map((s, i) => (
                    <li key={i} id={`source-${i + 1}`} className="flex gap-2 scroll-mt-4 lg:scroll-mt-24">
                      <span className="font-semibold text-gray-700 shrink-0">{i + 1}.</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ol>
                <p className="text-[13px] text-gray-500 pt-2">{pageDatesText(PUBLISHED_LABEL, UPDATED_LABEL)}</p>
              </div>
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
          <StickyMobileCta
            programNameShort={program.name_ua}
            price={program.price_discount}
            programSlug={program.slug}
            sourceCta={`${SOURCE_CTA}_sticky`}
            revealAfterId="hero"
            zoneId={ID.programs}
            hideWhenVisibleId="program-buy"
            look="v2"
          />
        </>
      )}
    </>
  );
}
