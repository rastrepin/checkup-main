import type { Metadata } from 'next';
import Link from 'next/link';
import { fetchClinicOffers, type OfferBranch } from '@/lib/programs/clinic-offer';
import { priceDateNotice } from '@/lib/programs/type5a';
import CompositionSummaryText from '@/components/program-page/CompositionSummaryText';
import StickyMobileCta from '@/components/program-page/StickyMobileCta';
import AdditionalServices from '@/components/program-page/AdditionalServices';
import AccordionSection from '@/components/shared/AccordionSection';
import InfoFrame from '@/components/shared/InfoFrame';
import CrossAgeNav from '@/components/shared/CrossAgeNav';
import BookingFlow, { BookCta } from '@/components/city/BookingFlow';

// Вікова сторінка міста – чернетка SPRINT-KHARKIV-v0, каркас 5.2 (12 блоків).
// Контент: content/kharkiv/female-30-40-rokiv.md (v0) дослівно; файл згенеровано з того самого джерела, що й MD.
// Програма, ціна, дата ціни, склад, філії – тільки з Supabase (fetchClinicOffers):
// platform_program_offers → checkup_programs (program_type = 'clinic') → onclinic-kharkiv.
// Hero, «Двері», GEO, автор і рецензент – верстка в сторінці (рішення спринту, без нових спільних компонентів).

export const revalidate = 3600;

const PAGE_PATH = '/ukr/female-checkup/30-40-rokiv/kharkiv';
const PAGE_URL = `https://check-up.in.ua${PAGE_PATH}`;
const PLATFORM_PROGRAM = 'female-checkup-30-40';
const CLINIC_SLUG = 'onclinic-kharkiv';
const SOURCE_CTA = 'age_page_female_30_40_kharkiv';
const TITLE = "Чекап для жінок 30–40 років у Харкові: що перевіряти | check-up.in.ua";
const DESCRIPTION = "Що перевіряти жінці 30–40 років за клінічними настановами: ПАП-тест і тест на ВПЛ, тиск, холестерин, глюкоза після 35. Готова програма клініки в Харкові.";
const UPDATED_ISO = '2026-09-23';
const UPDATED_LABEL = '23.09.2026';
const REVIEWER = { name: 'Удовиченко Олена Олександрівна', jobTitle: 'лікар акушер-гінеколог', org: 'ОН Клінік Харків' };

const BORDER = '1px solid #e8edf3';
const BG_GRAY = '#f8fafc';
const BG_WHITE = '#ffffff';
const P = 'text-gray-700 leading-relaxed mt-4';

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  robots: { index: true, follow: true },
  alternates: { canonical: PAGE_URL },
  openGraph: { title: TITLE, description: DESCRIPTION, url: PAGE_URL, type: 'website' },
};

/* Джерела: [n] у тексті → пункт n */
const SOURCES: string[] = [
  "МОЗ України. Наказ №504 (2018), яким скасовано диспансеризацію; замінив наказ №728.",
  "Кабінет Міністрів України. Постанова №1652 (2025) «Скринінг здоров'я 40+», діє з 01.01.2026: серцево-судинні захворювання, цукровий діабет 2 типу, ментальне здоров'я.",
  "МОЗ України. Стандарт медичної допомоги «Скринінг раку шийки матки. Ведення пацієнток з аномальними результатами скринінгу та передраковими станами шийки матки», наказ №1057 від 18.06.2024.",
  "Mayo Clinic Family Health Book, 5th Edition.",
  "USPSTF. Prediabetes and Type 2 Diabetes: Screening, 2021. Дорослі 35–70 років з надлишковою вагою або ожирінням, кожні 3 роки.",
];

/* Цілі блоку 2 для зіставлення зі складом програми (блок 4, міст). */
const TARGETS: { label: string; keywords: string[]; missing: string | null }[] = [
  { label: "ПАП-тест", keywords: ["пап-тест", "цервікальн", "впл"], missing: "Мазок на клітини шийки матки роблять раз на 3 роки. Його можна пройти окремо в гінеколога." },
  { label: "Холестерин (ліпідограма)", keywords: ["ліпідограм"], missing: "Якщо ви не перевіряли холестерин після 20 років або з останнього аналізу минуло понад 4–6 років, його можна здати окремо." },
  { label: "Глюкоза", keywords: ["глюкоз"], missing: null },
];

/* Кандидати в доповнення (screening-evidence-matrix.md, розділ 3). */
const ADDITIONS: { id: string; name: string; keywords: string[]; explanation: string; why: string }[] = [];
const WHERE_TO_GO = 'Можна пройти в іншому закладі і принести результат на другий візит.';

const FAQ: { q: string; a: string }[] = [
  { q: "Чи змінюється щось у переліку після 35?", a: "Так. З 35 років людям із надлишковою вагою додають скринінг переддіабету і діабету 2 типу раз на 3 роки. Для скринінгу раку шийки матки з 35 з'являється інший спосіб – тест на ВПЛ раз на 10 років." },
  { q: "Чи можна пройти перелік не в цій клініці?", a: "Так. Перелік складений за клінічними настановами, а не за прайсом клініки, і його можна пройти в будь-якому закладі. Запис до клініки-партнера на цій сторінці – зручність, а не умова." },
  { q: "Чи потрібна мамографія до 40 років?", a: "Якщо немає скарг і раку молочної залози в родині, найімовірніше ні. Якщо рак був у матері, сестри або доньки, обстеження починають за 5–10 років до віку, у якому діагноз поставили родичці. Це рішення ухвалюють разом з лікарем." },
  { q: "Як часто перевіряти тиск?", a: "До 40 років – раз на 3–5 років, за наявності факторів ризику – щороку. Тиск вимірюють на прийомі." },
  { q: "Що взяти з собою на обстеження?", a: "Результати попередніх аналізів і обстежень, якщо вони є: лікар порівнює нові показники з попередніми. Про підготовку до аналізів – у блоці «Як це проходить»." },
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

export default async function FemaleAge3040KharkivPage() {
  const { clinic, branches, clinicServiceNames, offers } = await fetchClinicOffers([PLATFORM_PROGRAM], CLINIC_SLUG);
  const offer = offers[0] ?? null;
  const program = offer?.program ?? null;
  const composition = offer?.composition ?? null;
  const items = composition?.items ?? [];

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
      name: "Чекап для жінок 30–40 років у Харкові",
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
        { '@type': 'ListItem', position: 4, name: "30–40 років", item: PAGE_URL },
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
                <span className="text-gray-700">30–40 років</span>
              </nav>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#005485] mb-6">Жіночий чекап · Харків</p>
              <h1
                className="font-bold leading-tight mb-6"
                style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 'clamp(32px, 5.5vw, 56px)' }}
              >
                Чекап для жінок 30–40 років у Харкові
              </h1>
              <p className="text-lg text-gray-700 leading-relaxed mt-2">Сторінка для жінок 30–40 років без скарг. Спочатку перелік за клінічними настановами, потім готова програма клініки в Харкові і що до неї додати.</p>
            </div>
          </div>
        </section>

        {/* 2. Що вам потрібно в цьому віці – не залежить від партнера */}
        <Section bg={BG_WHITE} eyebrow="За клінічними настановами">
          <H2 id="shcho-potribno">Що вам потрібно в цьому віці</H2>
          <p className={P}>Між 30 і 40 з&apos;являються перші перевірки, які залежать не лише від віку, а й від ваги і сімейної історії.</p>
          <p className={P}>Єдиного українського протоколу профілактичного обстеження для цього віку немає. Диспансеризацію скасовано 2018 року<S n={[1]} />, а державна програма «Скринінг здоров&apos;я 40+» розрахована на людей від 40<S n={[2]} />. Тому перелік нижче складений за українськими порядками скринінгу окремих хвороб і за міжнародними рекомендаціями.</p>
          <h3 className="text-lg font-semibold text-[#0b1a24] mt-8">Рак шийки матки: ПАП-тест або тест на ВПЛ</h3>
          <p className={P}>Мазок на клітини роблять раз на 3 роки<S n={[3]} />. З 35 років стандарт МОЗ допускає інший спосіб – тест на вірус папіломи людини (ВПЛ) раз на 10 років<S n={[3]} />. Який підходить вам, обговоріть з гінекологом.</p>
          <p className="mt-3 text-sm"><Link href="/ukr/screening/pap-test" className="font-semibold text-[#005485] hover:underline">Докладніше про ПАП-тест →</Link></p>
          <h3 className="text-lg font-semibold text-[#0b1a24] mt-8">Артеріальний тиск</h3>
          <p className={P}>До 40 років тиск вимірюють раз на 3–5 років, а за наявності факторів ризику – щороку<S n={[4]} />. Це вимірювання на прийомі, окремого аналізу для нього не потрібно.</p>
          <h3 className="text-lg font-semibold text-[#0b1a24] mt-8">Холестерин</h3>
          <p className={P}>Якщо показники в нормі, холестерин повторюють раз на 4–6 років від першого вимірювання у 20 років<S n={[4]} />.</p>
          <h3 className="text-lg font-semibold text-[#0b1a24] mt-8">Цукровий діабет 2 типу</h3>
          <p className={P}>З 35 років людям із надлишковою вагою або ожирінням, тобто з індексом маси тіла 25 і більше, рекомендують скринінг переддіабету і діабету 2 типу раз на 3 роки<S n={[5]} />. Показанням є поєднання віку і ваги: за нормальної ваги рутинна перевірка не потрібна, якщо лікар не бачить інших підстав.</p>
          <h3 className="text-lg font-semibold text-[#0b1a24] mt-8">Молочні залози</h3>
          <p className={P}>Якщо вам менше 40 і немає скарг чи раку молочної залози в родині, мамографія найімовірніше не потрібна<S n={[4]} />. Вона стає потрібною раніше, якщо рак був у матері, сестри або доньки: про це в наступному блоці.</p>
          <p className="mt-3 text-sm"><Link href="/ukr/screening/mamografiia" className="font-semibold text-[#005485] hover:underline">Докладніше про мамографію →</Link></p>
        </Section>

        {/* 3. Що залежить від вашої історії */}
        <Section bg={BG_GRAY} eyebrow="Ваша історія">
          <H2 id="istoriia">Що залежить від вашої історії</H2>
          <p className={P}>Перелік вище розрахований на жінку без скарг і без особливої історії. Він змінюється, якщо:</p>
          <h3 className="text-lg font-semibold text-[#0b1a24] mt-8">Рак молочної залози в матері, сестри або доньки</h3>
          <p className={P}>Мамографію починають за 5–10 років до віку, у якому діагноз поставили родичці<S n={[4]} />. З якого віку починати вам, обговоріть з лікарем.</p>
          <h3 className="text-lg font-semibold text-[#0b1a24] mt-8">Фактори серцево-судинного ризику</h3>
          <p className={P}>Тиск вимірюють щороку, а не раз на 3–5 років<S n={[4]} />. Які фактори ризику є саме у вас, оцінює лікар.</p>
          <h3 className="text-lg font-semibold text-[#0b1a24] mt-8">ВІЛ або інший стан, що пригнічує імунітет</h3>
          <p className={P}>Графік ПАП-тесту інший: після першого нормального мазка наступний роблять через 12 місяців, а скринінг з віком не припиняють<S n={[3]} />.</p>
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
                  {composition.visit2Items.length > 0 && (
                    <p className={P}>
                      Другий візит – {composition.visit2Items.map(lcFirst).join(', ')}: лікар розбирає результати разом.
                    </p>
                  )}
                </div>
              )}

              {missing.length > 0 && (
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
            <p className={P}>Позиції з переліку за віком, яких немає в готовій програмі.</p>
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
                  Чекап для жінок 30–40 років у Харкові можна пройти в {clinic.name}: {branches.length}{' '}
                  {branchesWord(branches.length)} –{' '}
                  {branches.map((b) => `${b.address_ua}${b.metro_ua ? ` (${b.metro_ua})` : ''}`).join('; ')}.
                  {program ? ` Програма клініки для цього віку – «${program.name_ua}».` : ''}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* 12. Автор і рецензент – спершу «ми не лікарі» */}
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
