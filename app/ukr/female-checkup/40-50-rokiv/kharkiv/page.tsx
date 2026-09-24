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
import {
  type AgeAddition,
  EDITORIAL_TEXT,
  FIRST_VISIT_TEXT,
  WHERE_TO_GO,
  additionsIntro,
  branchesWord,
  faqMissingInProgram,
  faqOtherClinic,
  geoText,
  lcFirst,
  missingTestsSentence,
  otherPathHeading,
  otherPathText,
  preparationItems,
  programAgeSentence,
  programHeading,
  secondVisitSentence,
} from '@/lib/programs/age-page-shared';

// Вікова сторінка міста – чернетка SPRINT-KHARKIV-v0, каркас 5.2 (12 блоків).
// Контент: content/kharkiv/female-40-50-rokiv.md (v0.1) дослівно; файл згенеровано з того самого джерела, що й MD.
// Програма, ціна, дата ціни, склад, філії – тільки з Supabase (fetchClinicOffers):
// platform_program_offers → checkup_programs (program_type = 'clinic') → onclinic-kharkiv.
// Hero, «Двері», GEO, автор і рецензент – верстка в сторінці (рішення спринту, без нових спільних компонентів).
// Задача Cowork «Оновлення текстів сторінки 40–50» (v1, 24.09.2026): тексти за редакторським аудитом і рецензентом;
// блоки [СПІЛЬНИЙ] – тексти і правила з lib/programs/age-page-shared.ts.

export const revalidate = 3600;

const PAGE_PATH = '/ukr/female-checkup/40-50-rokiv/kharkiv';
const PAGE_URL = `https://check-up.in.ua${PAGE_PATH}`;
const PLATFORM_PROGRAM = 'female-checkup-40-50';
const CLINIC_SLUG = 'onclinic-kharkiv';
const SOURCE_CTA = 'age_page_female_40_50_kharkiv';
// SEO-STANDARD р.4, Тип 5a. X (мінімальна ціна програм клініки для сторінки) – з Supabase у generateMetadata.
const TITLE = "Чекап для жінок 40–50 років: які обстеження проходити, програми в Харкові | check-up.in.ua";
const DESCRIPTION_BASE = "Які обстеження потрібні жінкам 40–50 років. 6 цілей скринінгу.";
const UPDATED_ISO = '2026-09-24';
const UPDATED_LABEL = '24.09.2026';
const REVIEWER = { name: 'Удовиченко Олена Олександрівна', jobTitle: 'лікар акушер-гінеколог', org: 'ОН Клінік Харків' };

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
  "Кабінет Міністрів України. Постанова №1652 (2025) «Скринінг здоров'я 40+», діє з 01.01.2026: серцево-судинні захворювання, цукровий діабет 2 типу, ментальне здоров'я.",
  "Mayo Clinic Family Health Book, 5th Edition.",
  "USPSTF. Prediabetes and Type 2 Diabetes: Screening, 2021. Дорослі 35–70 років з надлишковою вагою або ожирінням, кожні 3 роки.",
  "МОЗ України. Стандарт медичної допомоги «Скринінг раку шийки матки. Ведення пацієнток з аномальними результатами скринінгу та передраковими станами шийки матки», наказ №1057 від 18.06.2024.",
  "МОЗ України. Наказ №1368 від 05.08.2024: порядки скринінгу і ранньої діагностики раку молочної залози, раку шийки матки і колоректального раку.",
  "USPSTF. Osteoporosis to Prevent Fractures: Screening, 2025. Жінки 65 років і старше; жінки до 65 у постменопаузі з підвищеним ризиком перелому.",
  "МОЗ України. Стандарт медичної допомоги «Рак молочної залози», наказ №195 від 03.02.2025.",
];

/* Цілі блоку 2 для зіставлення зі складом програми (блок 4: «З переліку вище в програмі є», «Що ще входить»). */
const TARGETS: { label: string; keywords: string[] }[] = [
  { label: "ПАП-тест", keywords: ["пап-тест", "цервікальн", "впл"] },
  { label: "Холестерин (ліпідограма)", keywords: ["ліпідограм"] },
  { label: "Глюкоза", keywords: ["глюкоз"] },
  { label: "Мамографія", keywords: ["мамограф"] },
  { label: "Тест калу на приховану кров", keywords: ["прихован", "імунохімічн"] },
];

const PAGE_MIN_AGE = 40;
const LIST_HEADING = "Які обстеження потрібні жінці у 40–50 років";

/* Доповнення: усі обстеження з переліку, яких немає в програмі (screening-evidence-matrix.md, розділ 3).
 * forAll – рекомендоване у 40–50 років усім; лише такі входять у {missingTests}. Мамографію і аналіз калу
 * у 40–49 років роблять за факторів ризику, тому forAll = false і {missingTests} на цій сторінці порожній. */
const ADDITIONS: AgeAddition[] = [
  { id: "pap", name: "ПАП-тест", keywords: ["пап-тест", "цервікальн", "впл"], explanation: "Мазок на клітини шийки матки роблять раз на 3 роки. Його можна пройти окремо в гінеколога.", why: "Мазок на клітини шийки матки роблять раз на 3 роки. Його можна пройти окремо в гінеколога.", forAll: true, missingName: "ПАП-тест" },
  { id: "lipid", name: "Холестерин (ліпідограма)", keywords: ["ліпідограм"], explanation: "Якщо ви не перевіряли холестерин після 20 років або з останнього аналізу минуло понад 4–6 років, його можна здати окремо.", why: "Якщо ви не перевіряли холестерин після 20 років або з останнього аналізу минуло понад 4–6 років, його можна здати окремо.", forAll: false },
  { id: "fit", name: "Тест калу на приховану кров", keywords: ["прихован", "імунохімічн"], explanation: <>У 40–49 років його призначає лікар, якщо є фактори ризику колоректального раку або симптоми<S n={[5]} />.</>, why: <>У 40–49 років його призначає лікар, якщо є фактори ризику колоректального раку або симптоми<S n={[5]} />.</>, forAll: false },
  { id: "mammo", name: "Мамографія", keywords: ["мамограф"], explanation: "Якщо є фактори ризику раку молочної залози: у 40–49 років кожні 2 роки.", why: <>У 40–49 років її роблять кожні 2 роки, якщо є фактори ризику<S n={[5]} />. УЗД молочних залоз не замінює мамографію: для скринінгу раку молочної залози використовують мамографію<S n={[5]} />. Лікар може призначити УЗД додатково, якщо тканина молочних залоз щільна або потрібно уточнити зміни, знайдені на мамограмі<S n={[7]} />.</>, forAll: false },
];

/** FAQ: видимий текст і FAQPage Schema будуються з одного масиву. */
function buildFaq(programName: string | null): { q: string; a: string }[] {
  return [
    { q: "Що змінюється в переліку після 40?", a: "Тиск вимірюють щороку, а не раз на 3–5 років. Якщо є фактори ризику раку молочної залози, мамографію роблять кожні 2 роки. Про фактори ризику колоректального раку лікар щороку розпитує, а аналіз калу на приховану кров призначає, якщо вони є. З 40 років можна пройти державну програму «Скринінг здоров'я 40+»: серцево-судинні захворювання, діабет 2 типу, ментальне здоров'я." },
    { q: "Чи потрібна мамографія в 40–49 років?", a: "Якщо є хоча б один фактор ризику, так: кожні 2 роки за українським порядком скринінгу. Без факторів ризику єдиної думки немає, тож рішення ви ухвалюєте разом із лікарем. Детальніше на сторінці «Мамографія: що показує і коли потрібна»." },
    faqOtherClinic(),
    faqMissingInProgram(programName),
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
  const parts = SCHEDULE_LABELS.filter(([k]) => b.schedule?.[k]).map(([k, label]) => `${label} ${b.schedule?.[k]}`);
  return parts.length ? parts.join(', ') : null;
}

const has = (name: string, keywords: string[]) => keywords.some((k) => name.toLowerCase().includes(k));

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

export default async function FemaleAge4050KharkivPage() {
  const { clinic, branches, clinicServiceNames, offers } = await getOffers();
  const offer = offers[0] ?? null;
  const program = offer?.program ?? null;
  const composition = offer?.composition ?? null;
  const items = composition?.items ?? [];

  // Блок 4, міст: цілі блоку 2 проти складу програми (без консультацій).
  const tests = items.filter((i) => i.serviceType !== 'consultation');
  const matched = TARGETS.map((t) => ({ ...t, found: tests.filter((i) => has(i.name, t.keywords)).map((i) => i.name) }));
  const inProgram = matched.filter((t) => t.found.length > 0);
  const matchedNames = new Set(inProgram.flatMap((t) => t.found));
  const beyond = tests.filter((i) => !matchedNames.has(i.name));
  const beyondInstrumental = beyond.filter((i) => i.serviceType === 'instrumental').map((i) => i.name);
  const beyondLab = beyond.filter((i) => i.serviceType === 'lab').map((i) => i.name);

  // Блок 5: доповнення, яких немає в складі; доступність – за clinic_services.
  const additions = ADDITIONS.filter((a) => !tests.some((i) => has(i.name, a.keywords)));
  const additionsAvailable = additions.filter((a) => clinicServiceNames.some((n) => has(n, a.keywords)));
  const additionsUnavailable = additions.filter((a) => !additionsAvailable.includes(a));
  const showAdditions = Boolean(program) && additions.length > 0;

  // {missingTests} і речення про вік програми – за правилами розділу 1 задачі (спільний модуль).
  const missingText = program ? missingTestsSentence(additions) : null;
  const ageText = programAgeSentence(program?.name_ua, PAGE_MIN_AGE);
  const programNameQ = program ? `«${program.name_ua}»` : null;
  const FAQ = buildFaq(program?.name_ua ?? null);
  const preparation = preparationItems(items);
  const secondVisit = composition ? secondVisitSentence(composition.visit2Items) : null;

  const notice = program?.price_date ? priceDateNotice(program.price_date) : undefined;

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
        <section style={{ backgroundColor: BG_GRAY }}>
          <div className="max-w-[1200px] mx-auto px-6 lg:px-14 py-14">
            <div className="max-w-3xl">
              <nav aria-label="Breadcrumb" className="text-xs text-gray-500 mb-8">
                <Link href="/" className="hover:underline">check-up.in.ua</Link>
                <span className="mx-1.5">/</span>
                <Link href="/ukr/kharkiv" className="hover:underline">Харків</Link>
                <span className="mx-1.5">/</span>
                <Link href="/ukr/female-checkup/kharkiv" className="hover:underline">Жінкам</Link>
                <span className="mx-1.5">/</span>
                <span className="text-gray-700">40–50 років</span>
              </nav>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#005485] mb-6">Жіночий чекап · Харків</p>
              <h1
                className="font-bold leading-tight mb-6"
                style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 'clamp(32px, 5.5vw, 56px)' }}
              >
                Чекап для жінок 40–50 років – що перевіряти і де пройти в Харкові
              </h1>
              <p className="text-lg text-gray-700 leading-relaxed mt-2">
                Якщо вам від 40 до 50 років і нічого не турбує, ось що варто перевірити за клінічними настановами.
                {program && ` Комплексне обстеження організму в Харкові можна пройти за програмою ${programNameQ}.`}
                {ageText && ` ${ageText}`}
                {missingText && ` ${missingText}`}
              </p>
            </div>
          </div>
        </section>

        {/* 2. Які обстеження потрібні – не залежить від партнера */}
        <Section bg={BG_WHITE} eyebrow="За клінічними настановами">
          <H2 id="shcho-potribno">{LIST_HEADING}</H2>
          <p className={P}>У 40–50 років тиск вимірюють щороку<S n={[2]} />. Мамографію і перевірку на колоректальний рак у цьому віці роблять за факторів ризику<S n={[5]} />.</p>
          <p className={P}>З 1 січня 2026 року в Україні діє державна програма «Скринінг здоров&apos;я 40+». Вона покриває три напрямки: серцево-судинні захворювання, цукровий діабет 2 типу і ментальне здоров&apos;я<S n={[1]} />. Програма безоплатна: запрошення приходить у «Дії» після дня народження, а без «Дії» заявку можна подати через ЦНАП. Заклад ви обираєте самі: державний, комунальний чи приватний, якщо він бере участь у програмі. Програма включає анкету щодо ризиків, вимірювання тиску, ваги й окружності талії та аналізи, що показують роботу серця, судин, нирок і рівень цукру в крові<S n={[1]} />.</p>
          <h3 className="text-lg font-semibold text-[#0b1a24] mt-8">Артеріальний тиск</h3>
          <p className={P}>Від 40 років тиск вимірюють щороку<S n={[2]} />. Для цього достатньо вимірювання на прийомі, окремий аналіз не потрібен.</p>
          <h3 className="text-lg font-semibold text-[#0b1a24] mt-8">Холестерин</h3>
          <p className={P}>Ліпідограма, тобто аналіз крові на холестерин і його фракції, показує, чи не підвищений ризик для серця і судин. Якщо попередній результат був у нормі, аналіз повторюють раз на 4–6 років<S n={[2]} />. Якщо ліпідограму ви ще не здавали, її варто зробити зараз. Якщо результат відхиляється від норми, коли повторювати аналіз і що робити далі, ви визначаєте разом із лікарем, з огляду на загальний ризик для серця і судин.</p>
          <h3 className="text-lg font-semibold text-[#0b1a24] mt-8">Цукровий діабет 2 типу</h3>
          <p className={P}>Державна програма «Скринінг здоров&apos;я 40+» передбачає перевірку рівня цукру в крові для всіх від 40 років, незалежно від маси тіла<S n={[1]} />.</p>
          <p className={P}>Якщо індекс маси тіла 25 або більше, тобто є надлишкова вага чи ожиріння, раз на 3 роки роблять аналіз крові на глюкозу натще або на глікований гемоглобін (HbA1c, середній рівень цукру за останні 2–3 місяці)<S n={[3]} />. Аналіз показує діабет 2 типу і переддіабет: стан, коли рівень цукру вже вищий за норму, але ще не досягає рівня діабету.</p>
          <p className={P}>Якщо індекс маси тіла менше 25, цей аналіз особливо важливий за таких умов: діабет 2 типу був у батьків, братів чи сестер, під час вагітності був гестаційний діабет або є синдром полікістозних яєчників<S n={[3]} />.</p>
          <h3 className="text-lg font-semibold text-[#0b1a24] mt-8">Рак шийки матки</h3>
          <p className={P}>Мазок на клітини шийки матки (ПАП-тест) роблять раз на 3 роки або тест на вірус папіломи людини (ВПЛ) раз на 10 років<S n={[4]} />. Який спосіб підходить вам, обговоріть з гінекологом. Детальніше на сторінці «<Link href="/ukr/screening/pap-test" className="text-[#005485] underline hover:no-underline">ПАП-тест: що показує і коли потрібен</Link>».</p>
          <h3 className="text-lg font-semibold text-[#0b1a24] mt-8">Молочні залози</h3>
          <p className={P}>У 40–49 років мамографію роблять кожні 2 роки, якщо є хоча б один фактор ризику<S n={[5]} />: вони перелічені в розділі «Що залежить від вашої історії». Без факторів ризику єдиної думки щодо цього віку немає, тож рішення ви ухвалюєте разом із лікарем<S n={[2]} />. Якщо з&apos;явилося ущільнення в грудях чи під пахвою, зміни шкіри, втягнення соска або виділення із соска, до лікаря звертаються одразу, не чекаючи планової мамографії<S n={[5]} />. Детальніше на сторінці «<Link href="/ukr/screening/mamografiia" className="text-[#005485] underline hover:no-underline">Мамографія: що показує і коли потрібна</Link>».</p>
          <h3 className="text-lg font-semibold text-[#0b1a24] mt-8">Колоректальний рак</h3>
          <p className={P}>Планову перевірку на колоректальний рак для всіх починають з 50 років: аналіз калу на приховану кров або фекальний імунохімічний тест (ФІТ) раз на 2 роки<S n={[5]} />. У 40–49 років лікар щороку розпитує про фактори ризику, а аналіз призначає, якщо вони є або з&apos;явилися симптоми<S n={[5]} />.</p>
        </Section>

        {/* 3. Що залежить від вашої історії */}
        <Section bg={BG_GRAY} eyebrow="Ваша історія">
          <H2 id="istoriia">Що залежить від вашої історії</H2>
          <p className={P}>Перелік вище розрахований на жінку без скарг і без особливої історії. Він змінюється, якщо:</p>
          <h3 className="text-lg font-semibold text-[#0b1a24] mt-8">Фактори ризику раку молочної залози</h3>
          <p className={P}>Мамографію роблять кожні 2 роки вже з 40, якщо є хоча б один із цих факторів<S n={[5]} />:</p>
          <ul className="mt-3 list-disc pl-5 space-y-1 text-gray-700 leading-relaxed">
            <li>рак молочної залози в близьких родичів;</li>
            <li>безпліддя або перші пологи у 30 років чи пізніше;</li>
            <li>тривалий прийом замісної гормональної терапії в менопаузі;</li>
            <li>ожиріння після менопаузи;</li>
            <li>куріння або зловживання алкоголем.</li>
          </ul>
          <p className={P}>Якщо рак був у матері, сестри або доньки, обстеження починають за 5–10 років до віку, у якому діагноз поставили родичці<S n={[2]} />.</p>
          <h3 className="text-lg font-semibold text-[#0b1a24] mt-8">Підтверджена мутація BRCA1 або BRCA2</h3>
          <p className={P}>Якщо у вас підтверджено мутацію в генах BRCA1 або BRCA2 (спадкова зміна, що підвищує ризик раку молочної залози), основним стандартом обстеження в Україні є щорічна МРТ молочних залоз із контрастною речовиною разом із мамографією<S n={[7]} />. Індивідуальну програму спостереження і профілактики ви узгоджуєте з онкологом-мамологом і лікарем-генетиком.</p>
          <h3 className="text-lg font-semibold text-[#0b1a24] mt-8">Фактори ризику колоректального раку</h3>
          <p className={P}>Якщо є фактори ризику колоректального раку, у 40–49 років аналіз калу на приховану кров або ФІТ призначає лікар, а з 50 років його роблять щороку<S n={[5]} />. До факторів ризику належать<S n={[5]} />:</p>
          <ul className="mt-3 list-disc pl-5 space-y-1 text-gray-700 leading-relaxed">
            <li>колоректальний рак або поліпи кишечника в близьких родичів;</li>
            <li>поліпи кишечника, знайдені у вас раніше;</li>
            <li>запальні захворювання кишечника: хвороба Крона або виразковий коліт;</li>
            <li>спадкові синдроми, зокрема сімейний аденоматозний поліпоз.</li>
          </ul>
          <p className={P}>Чи є у вас інші фактори ризику, ви оцінюєте разом із лікарем.</p>
          <h3 className="text-lg font-semibold text-[#0b1a24] mt-8">Менопауза і фактори ризику перелому</h3>
          <p className={P}>Якщо менопауза вже настала, денситометрію, тобто вимірювання щільності кісток на рентгенівському апараті з низькою дозою опромінення (метод DXA), рекомендують і до 65 років за таких факторів ризику перелому<S n={[6]} />:</p>
          <ul className="mt-3 list-disc pl-5 space-y-1 text-gray-700 leading-relaxed">
            <li>низька маса тіла;</li>
            <li>перелом стегна в батька чи матері;</li>
            <li>куріння;</li>
            <li>надмірне вживання алкоголю.</li>
          </ul>
          <h3 className="text-lg font-semibold text-[#0b1a24] mt-8">ВІЛ або інший стан, що пригнічує імунітет</h3>
          <p className={P}>Графік скринінгу інший: ПАП-тест або тест на ВПЛ роблять кожні 5 років<S n={[5]} />, і з віком скринінг не припиняють<S n={[4]} />.</p>
        </Section>

        {/* 4. Програма клініки з даних */}
        <Section bg={BG_WHITE} eyebrow="Програма клініки">
          <H2 id="gotovyi-variant">{programHeading(program?.name_ua, clinic?.name)}</H2>
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
                {missingText && <p className="text-[14px] text-gray-700 leading-relaxed mt-4">{missingText}</p>}
                <div className="mt-5">
                  <CompositionSummaryText
                    consultationsSummary={composition.consultationsSummary}
                    instrumentalSummary={composition.instrumentalSummary}
                    labSummary={composition.labSummary}
                  />
                </div>
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

              {inProgram.length > 0 && (
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
                  {secondVisit && <p className={P}>{secondVisit}</p>}
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
            <p className={P}>{additionsIntro(program.name_ua)}</p>
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

        {/* 6. Якщо програма не підходить */}
        <Section bg={showAdditions ? BG_WHITE : BG_GRAY} eyebrow="Інший шлях">
          <H2 id="inshyi-shliakh">{otherPathHeading(program?.name_ua)}</H2>
          <div className="mt-6">
            <InfoFrame>
              <p>{otherPathText(LIST_HEADING)}</p>
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
            <p className={P}>{FIRST_VISIT_TEXT}</p>
            {composition.visit2Items.length > 0 && (
              <>
                <h3 className="text-lg font-semibold text-[#0b1a24] mt-8">Другий візит</h3>
                <p className={P}>{composition.visit2Items.join(', ')}.</p>
              </>
            )}
            {preparation.length > 0 && (
              <>
                <h3 className="text-lg font-semibold text-[#0b1a24] mt-8">Підготовка</h3>
                <ul className="mt-3 list-disc pl-5 space-y-1 text-[14px] text-gray-700 leading-relaxed">
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
                <Link href="/ukr/male-checkup/kharkiv" className="text-[#005485] hover:underline">
                  Чекап для чоловіків у Харкові →
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
                  {geoText({
                    subject: 'Чекап для жінок 40–50 років',
                    clinicName: clinic.name,
                    branches,
                    programName: program?.name_ua,
                    missingText,
                  })}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* 12. Автор і рецензент – спершу «ми не лікарі» */}
        <section style={{ backgroundColor: BG_GRAY, borderTop: BORDER }}>
          <div className="max-w-[1200px] mx-auto px-6 lg:px-14 py-12">
            <div className="max-w-3xl text-xs text-gray-500 leading-relaxed space-y-2">
              <p>{EDITORIAL_TEXT}</p>
              <p>
                Медичний рецензент: <strong className="text-gray-700">{REVIEWER.name}</strong>, {REVIEWER.jobTitle},{' '}
                {REVIEWER.org}.
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
