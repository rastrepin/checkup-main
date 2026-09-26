import type { Metadata } from 'next';
import { cache } from 'react';
import Link from 'next/link';
import { fetchClinicOffers, type ClinicOffer, type OfferBranch } from '@/lib/programs/clinic-offer';
import { priceDateNotice } from '@/lib/programs/type5a';
import StickyMobileCta from '@/components/program-page/StickyMobileCta';
import AdditionalServices from '@/components/program-page/AdditionalServices';
import AccordionSection from '@/components/shared/AccordionSection';
import CrossAgeNav from '@/components/shared/CrossAgeNav';
import InPageNav, { type InPageNavItem } from '@/components/shared/InPageNav';
import BookingFlow, { BookCta } from '@/components/city/BookingFlow';
import {
  type AgeAddition,
  ADDITIONS_ASK_DOCTOR,
  ANY_CLINIC_TEXT,
  DOCTOR_DECIDES_TEXT,
  EDITORIAL_TEXT_V2,
  FIRST_VISIT_TEXT,
  SECOND_VISIT_TEXT_V2,
  additionsIntro,
  additionsUnavailableTitle,
  branchesCountText,
  faqMissingInProgramV2,
  faqOtherClinic,
  geoText,
  hoursDash,
  missingTestsSentence,
  preparationItems,
  programAgeShort,
  visitsText,
} from '@/lib/programs/age-page-shared';

// Вікова сторінка міста – SPRINT-KHARKIV-v0, тип 5a.
// Контент: content/kharkiv/female-40-50-rokiv.md дослівно.
// Задача Cowork «Нова структура сторінки 40–50» (v2, 25.09.2026): порядок блоків і компоненти – як на сторінці
// після 50; абзаци і джерело про державну програму скринінгу прибрано (рішення Ігоря), джерела 1–7.
// Сторінки до 30 і 30–40 лишаються в попередньому вигляді.
// Програма, ціна, дата ціни, склад, філії – тільки з Supabase (fetchClinicOffers):
// platform_program_offers → checkup_programs (program_type = 'clinic') → onclinic-kharkiv.
// Тексти спільних блоків і правила виводу – lib/programs/age-page-shared.ts; опис складу – lib/programs/composition.ts.

export const revalidate = 3600;

const PAGE_PATH = '/ukr/female-checkup/40-50-rokiv/kharkiv';
const PAGE_URL = `https://check-up.in.ua${PAGE_PATH}`;
const PLATFORM_PROGRAM = 'female-checkup-40-50';
const CLINIC_SLUG = 'onclinic-kharkiv';
const SOURCE_CTA = 'age_page_female_40_50_kharkiv';
// SEO-STANDARD р.4, Тип 5a. X (мінімальна ціна програм клініки для сторінки) – з Supabase у generateMetadata.
const TITLE = "Чекап для жінок 40–50 років: які обстеження проходити, програми в Харкові | check-up.in.ua";
const DESCRIPTION_BASE = "Які обстеження потрібні жінкам 40–50 років. 6 цілей скринінгу.";
const UPDATED_ISO = '2026-09-26';
const UPDATED_LABEL = '26.09.2026';
const REVIEWER = { name: 'Удовиченко Олена Олександрівна', jobTitle: 'лікар акушер-гінеколог', org: 'ОН Клінік Харків' };

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
  const description = x ? `${DESCRIPTION_BASE} Програми в Харкові від ${fmt(x)} грн.` : DESCRIPTION_BASE;
  return {
    title: { absolute: TITLE },
    description,
    robots: { index: true, follow: true },
    alternates: { canonical: PAGE_URL },
    openGraph: { title: TITLE, description, url: PAGE_URL, type: 'website' },
  };
}

/* Джерела: [n] у тексті → пункт n (нумерація задачі v2 для 40–50, розділ 12). */
const SOURCES: string[] = [
  "Mayo Clinic Family Health Book, 5th Edition.",
  "USPSTF. Prediabetes and Type 2 Diabetes: Screening, 2021. Дорослі 35–70 років з надлишковою вагою або ожирінням, кожні 3 роки.",
  "МОЗ України. Стандарт медичної допомоги «Скринінг раку шийки матки. Ведення пацієнток з аномальними результатами скринінгу та передраковими станами шийки матки», наказ №1057 від 18.06.2024.",
  "МОЗ України. Наказ №1368 від 05.08.2024: порядки скринінгу і ранньої діагностики раку молочної залози, раку шийки матки і колоректального раку.",
  "USPSTF. Osteoporosis to Prevent Fractures: Screening, 2025. Жінки 65 років і старше; жінки до 65 у постменопаузі з підвищеним ризиком перелому.",
  "МОЗ України. Стандарт медичної допомоги «Рак молочної залози», наказ №195 від 03.02.2025.",
  "МОЗ України. Стандарт медичної допомоги «Цукровий діабет 2 типу у дорослих», наказ №1300 від 24.07.2024.",
];

const PAGE_MIN_AGE = 40;

/* Якорі підрозділів блоку 2 (картка з відповіддю в Hero веде на них) і блоків сторінки. */
const ID = {
  list: 'shcho-potribno',
  pressure: 'tysk',
  cholesterol: 'kholesteryn',
  diabetes: 'diabet',
  cervix: 'rak-shyiky-matky',
  breast: 'molochni-zalozy',
  colon: 'kolorektalnyi-rak',
  history: 'istoriia',
  programs: 'prohramy',
  composition: 'sklad-prohramy',
  additions: 'dodaty',
  visits: 'yak-tse-prokhodyt',
  contacts: 'kontakty',
  faq: 'faq',
} as const;

/* Картка з відповіддю: чотири обстеження для всіх у 40–50 років (назви – ті самі, що в мості блоку 4). */
const ANSWER_ITEMS: { label: string; id: string }[] = [
  { label: 'вимірювання тиску', id: ID.pressure },
  { label: 'аналіз на холестерин', id: ID.cholesterol },
  { label: 'аналіз на цукор у крові', id: ID.diabetes },
  { label: 'ПАП-тест', id: ID.cervix },
];

/* Доповнення: усі обстеження з переліку, яких немає в програмі (screening-evidence-matrix.md, розділ 3).
 * forAll – рекомендоване у 40–50 років усім; лише такі входять у {missingTests}. Мамографію й аналіз калу
 * у 40–49 років роблять за факторів ризику: forAll = false, а riskName – назва для другого рядка мосту блоку 4
 * («… у цьому віці роблять за факторів ризику, у програму вони не входять»). Холестерин у цей рядок не потрапляє. */
type Addition = AgeAddition & { riskName?: string };
const ADDITIONS: Addition[] = [
  { id: "pap", name: "ПАП-тест", keywords: ["пап-тест", "цервікальн", "впл"], explanation: "Мазок на клітини шийки матки роблять раз на 3 роки. Його можна пройти окремо в гінеколога.", why: "Мазок на клітини шийки матки роблять раз на 3 роки. Його можна пройти окремо в гінеколога.", forAll: true, missingName: "ПАП-тест" },
  { id: "lipid", name: "Холестерин (ліпідограма)", keywords: ["ліпідограм"], explanation: "Якщо ви не перевіряли холестерин після 20 років або з останнього аналізу минуло понад 4–6 років, його можна здати окремо.", why: "Якщо ви не перевіряли холестерин після 20 років або з останнього аналізу минуло понад 4–6 років, його можна здати окремо.", forAll: false },
  { id: "mammo", name: "Мамографія", keywords: ["мамограф"], explanation: "Якщо є фактори ризику раку молочної залози: у 40–49 років кожні 2 роки.", why: <>У 40–49 років її роблять кожні 2 роки, якщо є фактори ризику<S n={[4]} />. УЗД молочних залоз не замінює мамографію: для скринінгу раку молочної залози використовують мамографію<S n={[4]} />. Лікар може призначити УЗД додатково, якщо тканина молочних залоз щільна або потрібно уточнити зміни, знайдені на мамограмі<S n={[6]} />.</>, forAll: false, riskName: "мамографію" },
  { id: "fit", name: "Аналіз калу на приховану кров", keywords: ["прихован", "імунохімічн"], explanation: <>У 40–49 років його призначає лікар, якщо є фактори ризику колоректального раку або симптоми<S n={[4]} />.</>, why: <>У 40–49 років його призначає лікар, якщо є фактори ризику колоректального раку або симптоми<S n={[4]} />.</>, forAll: false, riskName: "аналіз калу на приховану кров" },
];

/** Абзац під групою «…не проводять», коли в ній одне обстеження (для кількох – ADDITIONS_ASK_DOCTOR). */
const ADDITIONS_ASK_DOCTOR_ONE =
  'Запитайте про це обстеження лікаря на консультації: він призначить його, навіть якщо в клініці його не роблять. Результат лікар врахує на другому візиті.';

/** Другий рядок мосту блоку 4, коли {missingTests} порожній, але в програмі немає обстежень, які в цьому віці
 *  роблять за факторів ризику. Назви – у знахідному відмінку (riskName). */
function riskBasedSentence(names: string[]): string | null {
  if (names.length === 0) return null;
  const joined = names.length === 1 ? names[0] : `${names.slice(0, -1).join(', ')} й ${names[names.length - 1]}`;
  const head = joined.charAt(0).toUpperCase() + joined.slice(1);
  if (names.length === 1) {
    return `${head} у цьому віці роблять за факторів ризику, до програми це обстеження не входить. Запитайте про нього лікаря на консультації або додайте до запису.`;
  }
  return `${head} у цьому віці роблять за факторів ризику, у програму вони не входять. Запитайте про них лікаря на консультації або додайте до запису.`;
}

/** FAQ: видимий текст і FAQPage Schema будуються з одного масиву. */
function buildFaq(programName: string | null): { q: string; a: string }[] {
  return [
    { q: "Що змінюється в переліку після 40?", a: "Тиск вимірюють щороку, а не раз на 3–5 років. Якщо є фактори ризику раку молочної залози, мамографію роблять кожні 2 роки. Про фактори ризику колоректального раку лікар щороку розпитує, а аналіз калу на приховану кров призначає, якщо вони є." },
    { q: "Чи потрібна мамографія в 40–49 років?", a: "Якщо є хоча б один фактор ризику, так: кожні 2 роки за українським порядком скринінгу. Без факторів ризику єдиної думки немає, тож рішення ви ухвалюєте разом із лікарем. Детальніше на сторінці «Мамографія: що показує і коли потрібна»." },
    faqOtherClinic(),
    faqMissingInProgramV2(programName),
    { q: "Що взяти з собою на обстеження?", a: "Результати попередніх аналізів і обстежень, якщо вони є: лікар порівнює нові показники з попередніми. Про підготовку до аналізів – у блоці «Як це проходить»." },
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

/** Міст блоку 4: що з переліку є в програмі, у порядку картки з відповіддю; тиск – якщо в складі є прийом терапевта. */
function inProgramList(items: { name: string; serviceType: string }[]): string[] {
  const tests = items.filter((i) => i.serviceType !== 'consultation');
  const found = (keywords: string[]) => tests.some((i) => has(i.name, keywords));
  const out: string[] = [];
  if (items.some((i) => i.serviceType === 'consultation' && has(i.name, ['терапевт']))) out.push('вимірювання тиску на консультації терапевта');
  const chol = found(['ліпідограм']);
  const gluc = found(['глюкоз']);
  if (chol && gluc) out.push('аналізи на холестерин і цукор у крові');
  else if (chol) out.push('аналіз на холестерин');
  else if (gluc) out.push('аналіз на цукор у крові');
  if (found(['пап-тест', 'цервікальн', 'впл'])) out.push('ПАП-тест');
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

/** Блок основної колонки: білий фон, розділювач зверху (макет v2). */
// Відступ для переходу за якорем (scroll-mt): з 1024 px – під закріплене меню 1a; на mobile меню не закріплене,
// тому заголовок розділу стає біля верху екрана.
function Block({ eyebrow, children, id }: { eyebrow?: string; children: React.ReactNode; id?: string }) {
  return (
    <section id={id} className="px-5 sm:px-6 lg:px-0 py-10 lg:py-14 border-t border-[#eef0f2] -scroll-mt-6 lg:scroll-mt-16">
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

export default async function FemaleAge4050KharkivPage() {
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

  // {missingTests}: з того самого зіставлення, що й блок «Що варто додати»; лише forAll (спільний модуль).
  const missingText = program ? missingTestsSentence(additions) : null;
  // Другий рядок мосту: {missingTests} порожній, але немає обстежень, які в цьому віці роблять за факторів ризику.
  const riskText = program && !missingText ? riskBasedSentence(additions.filter((a) => a.riskName).map((a) => a.riskName as string)) : null;
  const bridgeSecond = missingText ?? riskText;
  const ageShort = programAgeShort(program?.name_ua, PAGE_MIN_AGE);
  const FAQ = buildFaq(program?.name_ua ?? null);
  const preparation = preparationItems(items);
  const visitCount = composition?.visitCount ?? 0;
  const showVisits = Boolean(program && composition && visitCount > 0);
  const cardMeta = [ageShort, visitCount > 0 ? visitsText(visitCount) : null]
    .filter((t): t is string => Boolean(t))
    .map((t, i) => (i === 0 ? t.charAt(0).toUpperCase() + t.slice(1) : t));

  const notice = program?.price_date ? priceDateNotice(program.price_date) : undefined;

  const navItems: InPageNavItem[] = [
    { id: ID.list, label: 'Що перевірити' },
    { id: ID.programs, label: 'Програми' },
    ...(showVisits ? [{ id: ID.visits, label: 'Як це проходить' }] : []),
    { id: ID.faq, label: 'Питання' },
  ];

  const jsonLd: object[] = [
    {
      '@context': 'https://schema.org',
      '@type': 'MedicalWebPage',
      name: "Чекап для жінок 40–50 років – що перевіряти і де пройти в Харкові",
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
        { '@type': 'ListItem', position: 4, name: "40–50 років", item: PAGE_URL },
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
        <section id="hero" style={{ backgroundColor: '#f4f6f8' }}>
          <div className="max-w-[1200px] mx-auto px-5 sm:px-6 lg:px-14 pt-4 pb-6 lg:py-14">
            <div className="max-w-3xl">
              <nav aria-label="Breadcrumb" className="text-[13px] text-gray-500 mb-3.5">
                <Link href="/" className="hover:underline">check-up.in.ua</Link>
                <span className="mx-1.5">/</span>
                <Link href="/ukr/kharkiv" className="hover:underline">Харків</Link>
                <span className="mx-1.5">/</span>
                <Link href="/ukr/female-checkup/kharkiv" className="hover:underline">Жінкам</Link>
                <span className="mx-1.5">/</span>
                <span className="text-gray-700">40–50 років</span>
              </nav>
              <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#005485] mb-2.5">Жіночий чекап · Харків</p>
              <h1
                className="font-bold mb-3.5"
                style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 'clamp(28px, 5vw, 52px)', lineHeight: 1.15 }}
              >
                Чекап для жінок 40–50 років – що перевіряти і де пройти в Харкові
              </h1>
              <p className="text-[#4a5a6b] leading-relaxed mb-4">
                Якщо вам від 40 до 50 років і нічого не турбує, клінічні настанови радять пройти кілька обстежень. Для
                ширшого обстеження зверніться до свого лікаря або оберіть комплексну програму в Харкові, розраховану на
                жінок вашого віку.
              </p>
              <div className="bg-white border-[1.5px] border-[#e5e7eb] rounded-[12px] px-4 pt-4 pb-3 mb-4">
                <p className="font-semibold text-[#0b1a24] mb-2">У 40–50 років жінкам без скарг рекомендують чотири обстеження:</p>
                <ul className="list-disc pl-5 space-y-1 text-[#374151] leading-snug">
                  {ANSWER_ITEMS.map((a, i) => (
                    <li key={a.id}>
                      <a href={`#${a.id}`} className={LINK}>
                        {a.label}
                      </a>
                      {i < ANSWER_ITEMS.length - 1 ? ';' : '.'}
                    </li>
                  ))}
                </ul>
                <p className="text-[15px] text-[#374151] mt-2">
                  Якщо є фактори ризику, до них додаються{' '}
                  <a href={`#${ID.breast}`} className={LINK}>
                    мамографія
                  </a>{' '}
                  й{' '}
                  <a href={`#${ID.colon}`} className={LINK}>
                    аналіз калу на приховану кров
                  </a>
                  <S n={[4]} />.
                </p>
              </div>
              <a
                href={`#${ID.programs}`}
                className="flex sm:inline-flex items-center justify-center gap-2 min-h-[52px] px-7 rounded-full bg-[#005485] text-white text-[15px] font-semibold hover:bg-[#003a5e] transition-colors"
              >
                Доступні програми в Харкові
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 5v14M6 13l6 6 6-6" />
                </svg>
              </a>
              <p className="flex items-center gap-2 mt-3 text-[13px] text-[#4a5a6b]">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#04b5ba" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0">
                  <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
                <span>Інформаційний матеріал: не замінює консультацію лікаря.</span>
              </p>
            </div>
          </div>
        </section>

        {/* 1a. Внутрішнє меню */}
        <InPageNav items={navItems} />

        <div className="max-w-[1200px] mx-auto lg:px-14 lg:grid lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-x-12">
          {/* 1b. Доступні програми в Харкові: mobile – одразу після меню, desktop – права колонка, sticky */}
          <aside id={ID.programs} className="lg:col-start-2 lg:row-start-1 -scroll-mt-3 lg:scroll-mt-16" aria-labelledby="prohramy-h2">
            <div className="px-5 sm:px-6 lg:px-0 pt-7 pb-10 lg:pt-14 lg:sticky lg:top-16">
              <H2 id="prohramy-h2" className="mb-4 lg:!text-[22px]">Доступні програми в Харкові</H2>
              {program && clinic ? (
                <>
                  <div className="border-[1.5px] border-[#e5e7eb] rounded-[12px] px-4 pt-[18px] pb-4 bg-white">
                    <p className="text-[13px] text-gray-500 mb-1">{clinic.name}</p>
                    <p className="text-xl font-bold text-[#0b1a24] leading-snug mb-1.5">{program.name_ua}</p>
                    <p className="text-sm text-[#4a5a6b] mb-3.5">
                      {cardMeta.map((t) => (
                        <span key={t}>{t} · </span>
                      ))}
                      <a href={`#${ID.composition}`} className="underline hover:no-underline text-[#005485]">
                        склад програми
                      </a>
                    </p>
                    <p className="text-[28px] font-bold text-[#005485] leading-tight" style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
                      {fmt(program.price_discount)} грн
                    </p>
                    {program.price_date && (
                      <p className="text-[13px] text-gray-500 mt-0.5">Ціна клініки станом на {fmtDate(program.price_date)}</p>
                    )}
                    {notice && <p className="text-[13px] text-gray-500 mt-1">{notice}</p>}
                    <div className="mt-4 flex flex-col gap-2.5">
                      <BookCta
                        programSlug={program.slug}
                        sourceCta={`${SOURCE_CTA}_card`}
                        label="Записатися"
                        className="!rounded-full min-h-[52px] uppercase tracking-[0.1em] font-bold text-[13px]"
                      />
                      {clinic.website && (
                        <a
                          href={clinic.website}
                          className="inline-flex items-center justify-center min-h-12 rounded-full border-[1.5px] border-[#005485]/30 text-[#005485] font-bold text-[13px] uppercase tracking-[0.1em] hover:bg-[#f0f7fb]"
                        >
                          Детальніше
                        </a>
                      )}
                    </div>
                  </div>
                  {clinic.website && (
                    <a href={clinic.website} className="block mt-4 text-[15px] font-semibold text-[#005485] hover:underline">
                      Усі програми {clinic.name} →
                    </a>
                  )}
                </>
              ) : (
                <p className={TEXT}>Дані про програму клініки зараз недоступні. Перелік обстежень із цієї сторінки можна пройти в будь-якій клініці.</p>
              )}
            </div>
          </aside>

          <div className="lg:col-start-1 lg:row-start-1 min-w-0">
            {/* 2. Які обстеження потрібні жінці у 40–50 років – не залежить від партнера */}
            <Block eyebrow="За клінічними настановами" id={ID.list}>
              <H2>Які обстеження потрібні жінці у 40–50 років</H2>
              <h3 id={ID.pressure} className={H3}>Артеріальний тиск</h3>
              <p className={P}>Від 40 років тиск вимірюють щороку<S n={[1]} />. Для цього достатньо вимірювання на прийомі, окремий аналіз не потрібен.</p>
              <h3 id={ID.cholesterol} className={H3}>Холестерин</h3>
              <p className={P}>Ліпідограма, тобто аналіз крові на холестерин і його фракції, показує, чи не підвищений ризик для серця і судин. Якщо ви її ще не здавали, аналіз варто зробити зараз. Якщо попередній результат був у нормі, його повторюють раз на 4–6 років<S n={[1]} />. Якщо результат відхиляється від норми, разом із лікарем ви визначаєте, коли повторити аналіз і що робити далі, з огляду на ваш загальний ризик.</p>
              <h3 id={ID.diabetes} className={H3}>Цукровий діабет 2 типу</h3>
              <p className={P}>Після 40 рівень цукру в крові рекомендують перевіряти всім, навіть за нормальної ваги: якщо результат у нормі, аналіз повторюють щонайменше раз на 3 роки<S n={[7]} />. Перевіряють аналізом крові на глюкозу натще або на глікований гемоглобін (HbA1c, середній рівень цукру за останні 2–3 місяці)<S n={[2]} />. Аналіз показує діабет 2 типу і переддіабет: стан, коли рівень цукру вже вищий за норму, але ще не досягає рівня діабету.</p>
              <p className={P}>Особливо важливо не пропускати аналіз, якщо є надлишкова вага (індекс маси тіла 25 і більше), діабет 2 типу був у батьків, братів чи сестер, під час вагітності був гестаційний діабет або є синдром полікістозних яєчників<S n={[2]} />.</p>
              <h3 id={ID.cervix} className={H3}>Рак шийки матки</h3>
              <p className={P}>Мазок на клітини шийки матки (ПАП-тест) роблять раз на 3 роки або тест на вірус папіломи людини (ВПЛ) раз на 5–10 років: спосіб та інтервал ви обираєте разом із гінекологом<S n={[3]} />. Державний порядок скринінгу передбачає мінімум: тест раз на 10 років до 55 років<S n={[4]} />. Детальніше на сторінці «<Link href="/ukr/screening/pap-test" className={LINK}>ПАП-тест: що показує і коли потрібен</Link>».</p>
              <h3 id={ID.breast} className={H3}>Молочні залози</h3>
              <p className={P}>У 40–49 років мамографію роблять кожні 2 роки, якщо є хоча б один фактор ризику<S n={[4]} />: вони перелічені в розділі «<a href={`#${ID.history}`} className={LINK}>Що залежить від вашої історії</a>». Без факторів ризику єдиної думки щодо цього віку немає, тож рішення ви ухвалюєте разом із лікарем<S n={[1]} />. Детальніше на сторінці «<Link href="/ukr/screening/mamografiia" className={LINK}>Мамографія: що показує і коли потрібна</Link>».</p>
              <p className={P}>Якщо з&apos;явилося ущільнення в грудях чи під пахвою, зміни шкіри, втягнення соска або виділення із соска, до лікаря звертаються одразу, не чекаючи планової мамографії<S n={[4]} />.</p>
              <h3 id={ID.colon} className={H3}>Колоректальний рак</h3>
              <p className={P}>Планову перевірку на колоректальний рак для всіх починають з 50 років: аналіз калу на приховану кров або фекальний імунохімічний тест (ФІТ) раз на 2 роки<S n={[4]} />. У 40–49 років лікар щороку розпитує про фактори ризику, а аналіз призначає, якщо вони є або з&apos;явилися симптоми<S n={[4]} />.</p>
            </Block>

            {/* 2b. Що залежить від вашої історії – у порядку переліку */}
            <Block eyebrow="Ваша історія" id={ID.history}>
              <H2>Що залежить від вашої історії</H2>
              <p className={P}>Перелік вище розрахований на жінку без скарг і без особливої історії. Він змінюється, якщо:</p>
              <h3 className={H3}>ВІЛ або інший стан, що пригнічує імунітет</h3>
              <p className={P}>Графік скринінгу інший: ПАП-тест або тест на ВПЛ роблять кожні 5 років<S n={[4]} />, і з віком скринінг не припиняють<S n={[3]} />.</p>
              <h3 className={H3}>Фактори ризику раку молочної залози</h3>
              <p className={P}>Мамографію роблять кожні 2 роки вже з 40, якщо є хоча б один із цих факторів<S n={[4]} />:</p>
              <ul className={`mt-3 list-disc pl-5 space-y-1 ${TEXT}`}>
                <li>рак молочної залози в близьких родичів;</li>
                <li>безпліддя або перші пологи у 30 років чи пізніше;</li>
                <li>тривалий прийом замісної гормональної терапії в менопаузі;</li>
                <li>ожиріння після менопаузи;</li>
                <li>куріння, зловживання алкоголем або тривалий стрес.</li>
              </ul>
              <p className={P}>Якщо рак був у матері, сестри або доньки, обстеження починають за 5–10 років до віку, у якому діагноз поставили родичці<S n={[1]} />.</p>
              <h3 className={H3}>Підтверджена мутація BRCA1 або BRCA2</h3>
              <p className={P}>Якщо у вас підтверджено мутацію в генах BRCA1 або BRCA2 (спадкова зміна, що підвищує ризик раку молочної залози), основним стандартом обстеження в Україні є щорічна МРТ молочних залоз із контрастною речовиною разом із мамографією<S n={[6]} />. Індивідуальну програму спостереження і профілактики ви узгоджуєте з онкологом-мамологом і лікарем-генетиком.</p>
              <h3 className={H3}>Фактори ризику колоректального раку</h3>
              <p className={P}>Якщо є фактори ризику колоректального раку, у 40–49 років аналіз калу на приховану кров або ФІТ призначає лікар, а з 50 років його роблять щороку<S n={[4]} />. До факторів ризику належать<S n={[4]} />:</p>
              <ul className={`mt-3 list-disc pl-5 space-y-1 ${TEXT}`}>
                <li>колоректальний рак або поліпи кишечника в близьких родичів;</li>
                <li>поліпи кишечника, знайдені у вас раніше;</li>
                <li>запальні захворювання кишечника: хвороба Крона або виразковий коліт;</li>
                <li>спадкові синдроми, зокрема сімейний аденоматозний поліпоз.</li>
              </ul>
              <p className={P}>Чи є у вас інші фактори ризику, ви оцінюєте разом із лікарем.</p>
              <h3 className={H3}>Менопауза і фактори ризику перелому</h3>
              <p className={P}>Якщо менопауза вже настала, денситометрію, тобто вимірювання щільності кісток на рентгенівському апараті з низькою дозою опромінення (метод DXA), рекомендують і до 65 років за таких факторів ризику перелому<S n={[5]} />:</p>
              <ul className={`mt-3 list-disc pl-5 space-y-1 ${TEXT}`}>
                <li>низька маса тіла;</li>
                <li>перелом стегна в батька чи матері;</li>
                <li>куріння;</li>
                <li>надмірне вживання алкоголю.</li>
              </ul>
            </Block>

            {/* 4. Що входить у програму */}
            {program && clinic && composition && (
              <Block eyebrow="Програма клініки" id={ID.composition}>
                <H2>Що входить у програму</H2>
                <p className="font-semibold text-[#0b1a24] mt-2">
                  {program.name_ua} · {clinic.name}
                </p>
                {(inProgram.length > 0 || bridgeSecond) && (
                  <div className="mt-5 bg-[#f4f6f8] rounded-[12px] p-4 flex flex-col gap-3">
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
                    {bridgeSecond && (
                      <div className="flex gap-2.5 items-start">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#005485" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true" className="shrink-0 mt-0.5">
                          <path d="M12 5v14M5 12h14" />
                        </svg>
                        <p className={TEXT}>{bridgeSecond}</p>
                      </div>
                    )}
                  </div>
                )}

                {composition.consultationsSummary && (
                  <>
                    <GroupLabel className="mt-6 mb-1">Консультації</GroupLabel>
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

                <div className="mt-6 border-y border-[#e5e7eb] py-2">
                  <AccordionSection summary="Повний склад програми">
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
                  </AccordionSection>
                </div>
              </Block>
            )}

            {/* 5. Що варто додати – без цін і без кнопки: доповнення додаються на етапі форми запису */}
            {showAdditions && program && (
              <Block eyebrow="Доповнення" id={ID.additions}>
                <H2>Що варто додати</H2>
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
                  />
                </div>
                {additionsUnavailable.length > 0 && (
                  <p className={P}>{additionsUnavailable.length === 1 ? ADDITIONS_ASK_DOCTOR_ONE : ADDITIONS_ASK_DOCTOR}</p>
                )}
              </Block>
            )}

            {/* 6. Дисклеймер і будь-яка клініка */}
            <div className="px-5 sm:px-6 lg:px-0 pb-10">
              <div className="max-w-3xl bg-[#e8f9fa] rounded-[12px] p-4" role="note">
                <p className="text-[#0b1a24] leading-relaxed">{DOCTOR_DECIDES_TEXT}</p>
                <p className="text-[15px] text-[#374151] leading-relaxed mt-2">{ANY_CLINIC_TEXT}</p>
              </div>
            </div>

            {/* 7. Як це проходить */}
            {showVisits && composition && (
              <Block eyebrow="Візити" id={ID.visits}>
                <H2>Як це проходить</H2>
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
                {preparation.length > 0 && (
                  <>
                    <h3 className={H3}>Підготовка</h3>
                    <ul className={`mt-3 list-disc pl-5 space-y-1 ${TEXT}`}>
                      {preparation.map((n, i) => (
                        <li key={n}>
                          {n}
                          {i < preparation.length - 1 ? ';' : '.'}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
                <p className={P}>
                  Якщо ви приїжджаєте з іншого міста або з-за кордону, скажіть про це під час запису і вкажіть бажану дату.
                </p>
              </Block>
            )}

            {/* 7a. Контакти клініки */}
            {clinic && (
              <Block eyebrow="Контакти" id={ID.contacts}>
                <H2>Контакти клініки</H2>
                <p className={P}>
                  {clinic.name}
                  {branches.length > 0 ? `, ${branchesCountText(branches.length)}.` : '.'}
                </p>
                {branches.length > 0 && (
                  <ul className="mt-4 space-y-3">
                    {branches.map((b) => {
                      const sch = scheduleText(b);
                      return (
                        <li key={b.id} className="border-[1.5px] border-[#e5e7eb] rounded-[12px] px-4 py-3.5 bg-white">
                          <p className="font-bold text-[#0b1a24]">{b.name_ua}</p>
                          <p className={`${TEXT} mt-1`}>
                            {b.address_ua}
                            {b.metro_ua ? `, ${b.metro_ua}` : ''}
                          </p>
                          {sch && <p className="text-sm text-gray-500 mt-1">{sch}</p>}
                          {b.tracking_phone && (
                            <p className="text-[15px] mt-1">
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
                  <p className="mt-4 text-[15px]">
                    <a href={clinic.website} className="font-semibold text-[#005485] hover:underline">
                      Сторінка клініки на check-up.in.ua →
                    </a>
                  </p>
                )}
              </Block>
            )}

            {/* 8. FAQ – нативний <details>, відповіді в DOM */}
            <Block eyebrow="Питання" id={ID.faq}>
              <H2>Часті запитання</H2>
              <div className="mt-6 space-y-3">
                {FAQ.map((f) => (
                  <div key={f.q} className="border border-[#e8edf3] rounded-[10px] px-5 py-3">
                    <AccordionSection summary={f.q}>
                      <p className={`text-[15px] ${TEXT}`}>{f.a}</p>
                    </AccordionSection>
                  </div>
                ))}
              </div>
            </Block>

            {/* 8a. Інші вікові групи */}
            <div className="px-5 sm:px-6 lg:px-0 pb-8">
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
              <div className="px-5 sm:px-6 py-6 bg-[#f4f6f8] lg:rounded-[12px]">
                <p className="max-w-3xl text-sm text-[#4a5a6b] leading-relaxed">
                  {geoText({
                    subject: 'Чекап для жінок 40–50 років',
                    clinicName: clinic.name,
                    branches,
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
                <p className="text-sm text-gray-500">
                  Розкриття: check-up.in.ua отримує комісію від клінік-партнерів за факт запису. Перелік обстежень на цій
                  сторінці складений за клінічними настановами, а не за складом програм партнерів.
                </p>
                <p className="font-bold text-[#0b1a24] pt-2">Джерела</p>
                <ol className="space-y-1.5 list-none text-sm">
                  {SOURCES.map((s, i) => (
                    <li key={i} id={`source-${i + 1}`} className="flex gap-2 scroll-mt-4 lg:scroll-mt-24">
                      <span className="font-semibold text-gray-700 shrink-0">{i + 1}.</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ol>
                <p className="text-[13px] text-gray-500 pt-2">Оновлено: {UPDATED_LABEL}</p>
              </div>
            </div>
          </div>
        </div>
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
            look="v2"
          />
        </>
      )}
    </>
  );
}
