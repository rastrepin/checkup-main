import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchType5aData, priceDateNotice } from '@/lib/programs/type5a';
import { fetchProgramComposition } from '@/lib/programs/composition';
import ProgramSidebar from '@/components/program-page/ProgramSidebar';
import CompositionSummaryText from '@/components/program-page/CompositionSummaryText';
import StickyMobileCta from '@/components/program-page/StickyMobileCta';
import InPageNav from '@/components/shared/InPageNav';
import AccordionSection from '@/components/shared/AccordionSection';
import CrossAgeNav from '@/components/shared/CrossAgeNav';
import BookingFlow from '@/components/city/BookingFlow';
import FaqBlock from '@/components/city/FaqBlock';

// Тип 5a — жіночий чекап до 30 років, Харків.
// Джерело контенту: спека Cowork "Жіночий чекап до 30 років · Харків" (30.08.2026), дослівно,
// адаптовано під живі дані program_services (задача "Склад zhinochyi-profilaktychnyi", 29.08.2026).
//
// СТАТУС: draft. Рецензента не узгоджено з клінікою (власник позначив [УТОЧНИТИ] у спеці) —
// сторінка йде з robots noindex, поки рецензент не підтверджений. Індекс вмикається зміною
// generateMetadata нижче, коли реальне ім'я з'явиться.
//
// Блок 5 "Доповнення" і Блок 5а (нацпрограма) на цій сторінці відсутні — рішення власника
// (чат 29.08.2026): для віку до 30 років додавати нічого не потрібно, нацпрограма "Скринінг
// здоров'я 40+" починається з 40 років.

export const revalidate = 3600;

const CHECKUP_PROGRAM_SLUG = 'zhinochyi-profilaktychnyi';
const SOURCE_CTA = 'age_page_female_do_30_kharkiv';
const PAGE_PATH = '/ukr/female-checkup/do-30-rokiv/kharkiv';
const PAGE_URL = `https://check-up.in.ua${PAGE_PATH}`;
const SUBDOMAIN_HREF = 'https://onclinic.check-up.in.ua/kharkiv/zhinochyi-profilaktychnyi';

function fmt(n: number) {
  return n.toLocaleString('uk-UA');
}

export async function generateMetadata(): Promise<Metadata> {
  const { program } = await fetchType5aData(CHECKUP_PROGRAM_SLUG);
  const price = program?.price_discount ?? null;
  const title = 'Чекап для жінок до 30 років: які обстеження проходити, програми в Харкові | check-up.in.ua';
  const description = price
    ? `Які обстеження потрібні жінці до 30 років: тиск, загальні аналізи крові й сечі, залізо, вітамін D, огляд гінеколога зі скринінгом шийки матки. Програми в Харкові від ${fmt(price)} грн.`
    : 'Які обстеження потрібні жінці до 30 років: тиск, загальні аналізи крові й сечі, залізо, вітамін D, огляд гінеколога зі скринінгом шийки матки.';
  return {
    title: { absolute: title },
    description,
    // Draft: рецензента ще не узгоджено з клінікою (див. коментар вище файлу).
    robots: { index: false, follow: false },
    alternates: { canonical: PAGE_URL },
    openGraph: { title, description, url: PAGE_URL, type: 'website' },
  };
}

const FAQ = [
  {
    q: 'Які обстеження потрібно пройти жінці до 30 років?',
    a: 'Базовий набір: артеріальний тиск, загальні аналізи крові й сечі, залізо і вітамін D як вихідні показники, огляд гінеколога зі скринінгом шийки матки від 25 років.',
  },
  {
    q: 'Чи можна пройти чекап без скарг?',
    a: 'Так. У цьому віці мета не пошук хвороби, а фіксація вихідних значень, з якими лікар порівнюватиме результати в майбутньому.',
  },
  {
    q: 'Скільки часу займає чекап?',
    a: 'Два візити. Перший – здача аналізів, інструментальні обстеження і огляд гінеколога. Другий – прийом терапевта з готовими результатами, за кілька днів.',
  },
  {
    q: 'Чи потрібна мамографія до 30 років?',
    a: 'Зазвичай ні. Виняток – рак молочної залози у матері, сестри чи доньки: тоді скринінг починають за п’ять-десять років до віку, у якому їй поставили діагноз.',
  },
  {
    q: 'З якого віку робити Пап-тест?',
    a: 'Від 25 років кожні три роки за відсутності відхилень. Жінкам з груп ризику – від 21 року.',
  },
  {
    q: 'Чим ця програма відрізняється від програми для 30-40 років?',
    a: 'Основа та сама – базові показники і огляд гінеколога. Різниця в акцентах: після 30 зростає увага до обміну речовин і серцево-судинних факторів, які до 30 років ще рідко проявляються.',
  },
];

const SCREENING_ITEMS = [
  'Артеріальний тиск',
  'Загальні аналізи крові й сечі',
  'Залізо і вітамін D',
  'Скринінг шийки матки',
];

const SOURCES = [
  'Порядок скринінгу і ранньої діагностики раку молочної залози, раку шийки матки та колоректального раку, наказ МОЗ України №1368 від 05.08.2024.',
  'Стандарт медичної допомоги «Скринінг раку шийки матки», наказ МОЗ України №1057 від 18.06.2024.',
  'Mayo Clinic Family Health Book, п’яте видання, розділи «Cardiovascular Health», «Breast Health».',
  'U.S. Preventive Services Task Force: скринінг дефіциту вітаміну D у дорослих (2021), скринінг дисфункції щитоподібної залози (2021).',
];

export default async function Page() {
  const { program, branches } = await fetchType5aData(CHECKUP_PROGRAM_SLUG);

  if (!program || !program.price_date) {
    notFound();
  }

  const notice = priceDateNotice(program.price_date);
  const composition = await fetchProgramComposition(program.id);
  const counts = [
    composition.counts.consultations ? { label: 'консультацій', count: composition.counts.consultations } : null,
    composition.counts.analyses ? { label: 'аналізів', count: composition.counts.analyses } : null,
    composition.counts.diagnostics ? { label: 'обстежень', count: composition.counts.diagnostics } : null,
  ].filter((c): c is { label: string; count: number } => c !== null);

  const sidebarBranches = branches.map((b) => ({ name: b.name_ua, address: b.address_ua }));
  const compositionText = {
    consultationsSummary: composition.consultationsSummary,
    instrumentalSummary: composition.instrumentalSummary,
    labSummary: composition.labSummary,
  };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'MedicalWebPage',
        name: 'Обстеження для жінок до 30 років: що перевіряти і де пройти в Харкові',
        url: PAGE_URL,
        author: { '@type': 'Organization', name: 'check-up.in.ua' },
      },
      {
        '@type': 'ItemList',
        name: 'Обстеження для жінок до 30 років',
        itemListElement: SCREENING_ITEMS.map((name, i) => ({ '@type': 'ListItem', position: i + 1, name })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Чекапи в Харкові', item: 'https://check-up.in.ua/ukr/kharkiv' },
          { '@type': 'ListItem', position: 2, name: 'Жіночий чекап', item: 'https://check-up.in.ua/ukr/female-checkup/kharkiv' },
          { '@type': 'ListItem', position: 3, name: 'До 30 років', item: PAGE_URL },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: FAQ.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="bg-warm-bg">
        <div className="max-w-6xl mx-auto px-4 pt-8 pb-6">
          <nav className="text-sm text-gray-500 mb-4" aria-label="Хлібні крихти">
            <Link href="/ukr/kharkiv" className="hover:underline">Чекапи в Харкові</Link>
            {' → '}
            <Link href="/ukr/female-checkup/kharkiv" className="hover:underline">Жіночий чекап</Link>
            {' → '}
            <span className="text-gray-700">До 30 років</span>
          </nav>

          <div className="max-w-[680px]">
            <h1 id="hero" className="text-[28px] sm:text-3xl font-bold text-text-primary leading-tight mb-4 scroll-mt-24">
              Обстеження для жінок до 30 років: що перевіряти і де пройти в Харкові
            </h1>
            <p className="text-[15px] text-text-secondary leading-relaxed">
              До 30 років більшість обстежень потрібні не для пошуку хвороб, а щоб зафіксувати вихідні показники,
              з якими порівнюватимуть усі наступні. Перевірити варто артеріальний тиск, загальні аналізи крові й
              сечі, рівень заліза та вітаміну D, а також пройти огляд гінеколога зі скринінгом шийки матки. Обсяг
              залежить від спадкової історії і того, що вас турбує.
            </p>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <InPageNav
          items={[
            { id: 'shcho-pereviryaty', label: 'Що перевіряти' },
            { id: 'chogo-ne-potribno', label: 'Чого не потрібно' },
            { id: 'programa', label: 'Програма' },
            { id: 'yak-tse-prohodyt', label: 'Як це проходить' },
            { id: 'faq', label: 'Питання і відповіді' },
          ]}
        />

        <div className="flex flex-col lg:flex-row gap-8 lg:items-start mt-2">
          <aside className="lg:order-2 lg:w-[320px] shrink-0 lg:sticky lg:top-6">
            <ProgramSidebar
              mode="program"
              price={program.price_discount}
              priceDate={program.price_date}
              priceDateNotice={notice}
              official_name={program.name_ua}
              branches={sidebarBranches}
              counts={counts}
              compositionText={compositionText}
              subdomainHref={SUBDOMAIN_HREF}
              additionalServices={[]}
              programSlug={CHECKUP_PROGRAM_SLUG}
              sourceCta={SOURCE_CTA}
            />
          </aside>

          <div className="flex-1 lg:order-1 min-w-0">
            <section id="shcho-pereviryaty" className="scroll-mt-24 mb-10">
              <h2 className="text-xl font-bold text-[#0b1a24] mb-3">Що перевіряти до 30</h2>
              <p className="text-[15px] text-gray-600 leading-relaxed mb-3">
                До 30 років організм здебільшого ще не показує наслідків способу життя – вони накопичуються
                повільно і стають вимірюваними пізніше. Тому мета обстежень у цьому віці інша, ніж після 40: не
                знайти хворобу, а зафіксувати вихідні значення, з якими лікар зможе порівнювати результати через
                п&apos;ять, десять і двадцять років. Виняток – скринінг шийки матки: це вже профілактика конкретного
                захворювання, а не точка відліку.
              </p>
              <p className="text-[15px] text-gray-600 leading-relaxed mb-6">
                Єдиного українського стандарту профілактичного чекапу для цього віку не існує: диспансеризацію
                скасовано 2018 року, а «Скринінг здоров&apos;я 40+» починається з 40 років. Нижче – рекомендації, що
                спираються на міжнародні джерела там, де українського протоколу немає.
              </p>

              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-[#0b1a24] mb-1.5">Артеріальний тиск</h3>
                  <p className="text-[14px] text-gray-600 leading-relaxed mb-2">
                    До 40 років тиск достатньо вимірювати раз на три-п&apos;ять років за відсутності факторів ризику –
                    надлишкової ваги, куріння, підвищеного тиску в батьків.
                  </p>
                  <p className="text-[14px] text-gray-600 leading-relaxed mb-2">
                    Підвищений тиск у цьому віці зустрічається рідше, ніж після 40, але саме зараз зручний момент
                    зафіксувати вихідне значення: подальші виміри порівнюють не з нормою «в середньому», а з вашим
                    власним показником кілька років тому.
                  </p>
                  <p className="text-[12px] text-gray-500">
                    Джерело: Mayo Clinic Family Health Book, п&apos;яте видання, розділ «Cardiovascular Health».
                  </p>
                </div>

                <div>
                  <h3 className="text-base font-bold text-[#0b1a24] mb-1.5">Загальні аналізи крові й сечі</h3>
                  <p className="text-[14px] text-gray-600 leading-relaxed mb-2">
                    Формального скринінгового графіка для загального аналізу крові й сечі в цьому віці немає – це не
                    пошук конкретного захворювання, а базова точка відліку для показників, які лікар порівнюватиме в
                    майбутньому: гемоглобін, лейкоцити, показники нирок і сечовидільної системи.
                  </p>
                </div>

                <AccordionSection summary="Показати всі обстеження">
                <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-[#0b1a24] mb-1.5">Залізо і вітамін D</h3>
                  <p className="text-[14px] text-gray-600 leading-relaxed mb-2">
                    Дефіцит заліза частіше зустрічається у жінок репродуктивного віку через менструальну крововтрату,
                    тому рівень феритину чи заліза варто перевірити хоча б один раз як вихідну точку.
                  </p>
                  <p className="text-[14px] text-gray-600 leading-relaxed mb-2">
                    Щодо вітаміну D варто сказати чесно: популяційного скринінгу дефіциту вітаміну D у безсимптомних
                    дорослих USPSTF не рекомендує через недостатність доказів для оцінки користі й шкоди (ступінь I).
                    Аналіз включають у профілактичні програми як зручний базовий маркер, а не як доказово
                    обґрунтований скринінг.
                  </p>
                  <p className="text-[12px] text-gray-500">
                    Джерело: U.S. Preventive Services Task Force, скринінг дефіциту вітаміну D у дорослих (2021).
                  </p>
                </div>

                <div>
                  <h3 className="text-base font-bold text-[#0b1a24] mb-1.5">Скринінг шийки матки</h3>
                  <p className="text-[14px] text-gray-600 leading-relaxed mb-2">
                    Пап-тест роблять від 25 років кожні три роки за відсутності відхилень; жінкам з груп ризику – від
                    21 року.
                  </p>
                  <p className="text-[14px] text-gray-600 leading-relaxed mb-2">
                    Рак шийки матки на ранній стадії не дає симптомів, а причина – вірус папіломи людини, яким на
                    якомусь етапі життя інфікується більшість сексуально активних людей. Скринінг ловить передракові
                    зміни клітин задовго до того, як вони стають раком.
                  </p>
                  <p className="text-[12px] text-gray-500">
                    Джерела: наказ МОЗ України №1368 від 05.08.2024; наказ МОЗ України №1057 від 18.06.2024.
                  </p>
                </div>
                </div>
                </AccordionSection>
              </div>
            </section>

            <section id="chogo-ne-potribno" className="scroll-mt-24 mb-10 bg-gray-50 rounded-xl p-6">
              <h3 className="text-base font-bold text-text-primary mb-3">Чого зазвичай не потрібно</h3>
              <p className="text-[15px] text-gray-600 leading-relaxed mb-4">
                До 30 років без симптомів і спадкових факторів ризику зазвичай не потрібні:
              </p>
              <AccordionSection summary="Показати приклади">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-[#0b1a24] mb-1.5">Мамографія</h3>
                    <p className="text-[14px] text-gray-600 leading-relaxed mb-2">
                      Mayo Clinic прямо вказує: жінкам до 35 років без факторів ризику мамографія не потрібна –
                      тканина молочної залози в цьому віці щільна, і метод погано розрізняє зміни. Винятком є
                      спадковий ризик: якщо рак молочної залози діагностували матері, сестрі чи доньці, скринінг
                      починають за 5-10 років до віку, у якому їй поставили діагноз.
                    </p>
                    <p className="text-[12px] text-gray-500">
                      Джерело: Mayo Clinic Family Health Book, розділ «Breast Health».
                    </p>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#0b1a24] mb-1.5">Колоноскопія і тест на приховану кров</h3>
                    <p className="text-[14px] text-gray-600 leading-relaxed mb-2">
                      Популяційний скринінг колоректального раку починається з 45-50 років. До 30 без сімейної
                      історії поліпів чи раку кишківника і без скарг обстеження не показане.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#0b1a24] mb-1.5">Регулярний контроль щитоподібної залози</h3>
                    <p className="text-[14px] text-gray-600 leading-relaxed mb-2">
                      Популяційного скринінгу дисфункції щитоподібної залози у безсимптомних дорослих не існує –
                      USPSTF оцінює доказову базу як недостатню (ступінь I). Перевірка виправдана за наявності
                      скарг, цукрового діабету 1 типу чи опромінення голови й шиї в анамнезі.
                    </p>
                    <p className="text-[12px] text-gray-500">
                      Джерело: U.S. Preventive Services Task Force, скринінг дисфункції щитоподібної залози (2021).
                    </p>
                  </div>
                </div>
              </AccordionSection>
            </section>

            <section id="programa" className="scroll-mt-24 mb-10">
              <h2 className="text-xl font-bold text-[#0b1a24] mb-3">Готова програма для цього віку</h2>
              <div className="bg-white border-2 border-navy/15 shadow-md rounded-2xl p-6 sm:p-8 mb-4">
                <h3 className="text-lg font-bold text-[#0b1a24] mb-1">{program.name_ua}</h3>
                <div className="text-2xl font-bold text-[#0b1a24] mb-1">{fmt(program.price_discount)} грн</div>
                {counts.length > 0 && (
                  <p className="text-[13px] text-gray-500 mb-4">
                    {counts.map((c) => `${c.count} ${c.label}`).join(' · ')}
                  </p>
                )}

                <div className="mb-4 pt-4 border-t border-gray-100">
                  <CompositionSummaryText
                    consultationsSummary={composition.consultationsSummary}
                    instrumentalSummary={composition.instrumentalSummary}
                    labSummary={composition.labSummary}
                  />
                </div>

                <a
                  href={SUBDOMAIN_HREF}
                  className="inline-flex items-center gap-1.5 text-[13px] text-navy underline decoration-navy/40 underline-offset-2 hover:decoration-navy"
                >
                  Повний склад програми, лікарі та підготовка – на сторінці програми
                  <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H9M17 7V15" />
                  </svg>
                </a>
              </div>
              <p className="text-[15px] text-gray-600 leading-relaxed">
                Програма «{program.name_ua}» покриває базовий набір для цього віку: вимірювання тиску, загальні
                аналізи крові й сечі та огляд гінеколога. Повний перелік аналізів і обстежень – на сторінці програми.
              </p>
            </section>

            {/* Дисклеймер про роль лікаря – простий текст, без рамки й акценту */}
            <section className="mt-10 mb-10">
              <p className="text-[13px] text-gray-600 leading-relaxed mb-2">
                Перелічене вище – орієнтир, а не призначення. Повний перелік обстежень визначає лікар за
                результатами огляду і розмови з вами: те, що потрібно одній жінці до 30 років, може бути зайвим для
                іншої.
              </p>
              <p className="text-[13px] text-gray-600 leading-relaxed">
                Програма чекапу дає лікарю ширшу картину, ніж окремий аналіз. Саме на підставі сукупності показників
                він робить висновок, а не на підставі одного значення поза контекстом.
              </p>
            </section>

            <section id="yak-tse-prohodyt" className="scroll-mt-24 mb-10 bg-gray-50 rounded-xl p-6">
              <h2 className="text-xl font-bold text-[#0b1a24] mb-3">Як це проходить</h2>
              <p className="text-[15px] text-gray-600 leading-relaxed mb-3">
                Чекап проходить у два візити. На першому здають аналізи, проходять інструментальні обстеження і
                огляд гінеколога, на другому лікар розбирає готові результати. Між візитами кілька днів – час,
                потрібний лабораторії.
              </p>
              <p className="text-[15px] text-gray-600 leading-relaxed mb-5">
                Програма для цього віку простіша за пізніші вікові кроки: три спеціалісти на першому візиті замість
                шести, менший обсяг лабораторних аналізів.
              </p>

              <div className="bg-white border border-gray-200 rounded-[10px] p-5 mb-4">
                <p className="text-xs font-semibold text-text-secondary mb-3">Візит 1</p>
                <CompositionSummaryText
                  consultationsSummary={composition.consultationsSummary}
                  instrumentalSummary={composition.instrumentalSummary}
                  labSummary={composition.labSummary}
                />
              </div>

              {composition.visit2Items.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-[10px] p-5 mb-4">
                  <p className="text-xs font-semibold text-text-secondary mb-2">Візит 2</p>
                  <ul className="text-[14px] text-gray-700 space-y-0.5 list-disc list-inside">
                    {composition.visit2Items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {composition.preparationNotes.length > 0 && (
                <div>
                  <p className="text-[13px] font-semibold text-text-secondary mb-1.5">Підготовка</p>
                  <ul className="text-[14px] text-gray-600 space-y-1 list-disc list-inside">
                    {composition.preparationNotes.map((note) => (
                      <li key={note}>{note}</li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          </div>
        </div>

        <FaqBlock items={FAQ} />

        <div className="mt-6 bg-gray-50 rounded-2xl px-4 sm:px-6">
          <CrossAgeNav currentHref={PAGE_PATH} />

          <section className="py-8 border-t border-gray-200">
            <h2 className="text-base font-semibold text-gray-700 mb-3">Де пройти в Харкові</h2>
            <p className="text-[13px] text-gray-600 leading-relaxed">
              Пройти чекап для жінок до 30 років у Харкові можна в ОН Клінік – у трьох локаціях: на вулиці Ярослава
              Мудрого, 30а, на проспекті Героїв Харкова, 257 (біля станції метро «Палац Спорту») і на вулиці
              Молочній, 48 (Левада). Програму «{program.name_ua}» проводять лікарі Check-Up Центру ОН Клінік
              Харків. Конкретну локацію узгоджує оператор клініки під час підтвердження запису.
            </p>
          </section>

          <section className="py-8 border-t border-gray-200 text-[13px] text-gray-500 leading-relaxed">
            <p className="mb-1"><span className="font-semibold text-gray-700">Медичний редактор:</span> Ігор Растрепін, check-up.in.ua</p>
            <p className="mb-1">
              <span className="font-semibold text-gray-700">Рецензент:</span> [УТОЧНИТИ: ПІБ, посада – узгодити з
              клінікою для профілактичної програми]
            </p>
            <p className="mb-1">Дата публікації: 30.08.2026</p>
            <p className="mb-4">Дата оновлення: 30.08.2026</p>

            <p className="font-semibold text-gray-700 mb-1.5">Джерела</p>
            <ol className="list-decimal list-inside space-y-1 mb-4">
              {SOURCES.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ol>

            <p className="font-semibold text-gray-700 mb-1">Про повноту джерел</p>
            <p className="mb-4">
              Єдиного українського стандарту профілактичного чекапу для віку до 30 років не існує: диспансеризацію
              скасовано 2018 року наказом МОЗ №504, а «Скринінг здоров&apos;я 40+» охоплює лише вік від 40 років.
              Рекомендації щодо базових показників на цій сторінці спираються на міжнародні джерела за відсутності
              українського протоколу.
            </p>

            <p className="font-semibold text-gray-700 mb-1">Розкриття</p>
            <p>
              check-up.in.ua – медичний маркетплейс. Ми отримуємо комісію від клінік-партнерів. Це не впливає на
              медичний зміст: перелік обстежень на цій сторінці складений за клінічними настановами, а не за
              складом програм партнерів.
            </p>
          </section>
        </div>
      </main>

      <BookingFlow
        programs={[program]}
        branches={branches}
        clinicId={program.clinic_id}
        clinicSlug="onclinic-kharkiv"
        city="kharkiv"
        programsComposition={{ [program.slug]: composition.counts }}
      />
      <StickyMobileCta
        programNameShort="Check-Up жіночий профілактичний"
        price={program.price_discount}
        programSlug={CHECKUP_PROGRAM_SLUG}
        sourceCta={`${SOURCE_CTA}_sticky`}
      />
    </>
  );
}
