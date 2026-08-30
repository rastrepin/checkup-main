import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchType5aData, priceDateNotice } from '@/lib/programs/type5a';
import { fetchProgramComposition } from '@/lib/programs/composition';
import ProgramSidebar from '@/components/program-page/ProgramSidebar';
import StickyMobileCta from '@/components/program-page/StickyMobileCta';
import AdditionalServices from '@/components/program-page/AdditionalServices';
import InPageNav from '@/components/shared/InPageNav';
import AccordionSection from '@/components/shared/AccordionSection';
import CrossAgeNav from '@/components/shared/CrossAgeNav';
import BookingFlow from '@/components/city/BookingFlow';
import FaqBlock from '@/components/city/FaqBlock';
import { Badge } from '@/components/ui';

// Тип 5a — жіночий чекап після 50 років, Харків.
// Джерело контенту: 5a-female-vid-50-kharkiv.md (дата контенту 25.07.2026), дослівно.
// Блокер даних, зазначений у MD (platform_program_offers zhinochyi-pislya-40 →
// female-checkup-vid-50), закрито попередньою міграцією — підтверджено прямим SQL
// власником і Cowork незалежно 29.08.2026 (task-cowork-01-migration.md, Частина 5).
// ОНОВЛЕНО (завдання "Наповнення складу програми", 29.08.2026): Блок 7 «Як це
// проходить» і лічильники сайдбара тепер рахуються з program_services через
// lib/programs/composition.ts (Частина 3/4 завдання), не з застарілих
// checkup_programs.consultations_count/analyses_count/diagnostics_count.

export const revalidate = 3600;

const CHECKUP_PROGRAM_SLUG = 'zhinochyi-pislya-40';
const SOURCE_CTA = 'age_page_female_vid50_kharkiv';
const PAGE_PATH = '/ukr/female-checkup/vid-50-rokiv/kharkiv';
const PAGE_URL = `https://check-up.in.ua${PAGE_PATH}`;
const SUBDOMAIN_HREF = 'https://onclinic.check-up.in.ua/kharkiv/zhinochyi-pislya-40';

function fmt(n: number) {
  return n.toLocaleString('uk-UA');
}

export async function generateMetadata(): Promise<Metadata> {
  const { program } = await fetchType5aData(CHECKUP_PROGRAM_SLUG);
  const price = program?.price_discount ?? null;
  const title = 'Чекап для жінок після 50: які обстеження проходити, програми в Харкові | check-up.in.ua';
  const description = price
    ? `Які обстеження потрібні жінці після 50 років: тиск, холестерин, глюкоза, мамографія, колоректальний скринінг, щільність кісток. Програми в Харкові від ${fmt(price)} грн.`
    : 'Які обстеження потрібні жінці після 50 років: тиск, холестерин, глюкоза, мамографія, колоректальний скринінг, щільність кісток.';
  return {
    title: { absolute: title },
    description,
    robots: { index: true, follow: true },
    alternates: { canonical: PAGE_URL },
    openGraph: { title, description, url: PAGE_URL, type: 'website' },
  };
}

const FAQ = [
  {
    q: 'Які обстеження потрібно пройти жінці після 50 років?',
    a: 'Базовий набір: артеріальний тиск щороку, ліпідограма, глюкоза за наявності надлишкової ваги, мамографія раз на два роки, аналіз калу на приховану кров раз на два роки, скринінг раку шийки матки до 65 років. Від 65 років додається оцінка щільності кісток.',
  },
  {
    q: 'Чи можна пройти чекап без скарг?',
    a: 'Так, у цьому і полягає його сенс. Більшість станів, які шукають під час скринінгу, роками не дають симптомів: підвищений тиск, переддіабет, остеопороз, ранні стадії раку.',
  },
  {
    q: 'Скільки часу займає чекап?',
    a: 'Два візити. Перший для жінки 50+ зазвичай триває дві-три години: здача аналізів і інструментальні обстеження. Другий – близько години, якщо за результатами не призначено додаткових досліджень чи консультацій. Між візитами кілька днів.',
  },
  {
    q: 'Чим програма для 50+ відрізняється від програми для 40-50?',
    a: 'Основа однакова: обстеження серцево-судинної системи, обміну речовин і базові показники крові. Різниця в доповненнях – мамографія, скринінг колоректального раку і, від 65 років, оцінка щільності кісток.',
  },
  {
    q: 'Чи потрібна колоноскопія кожній жінці після 50?',
    a: 'Ні. Скринінг починають з аналізу калу на приховану кров. Колоноскопію призначають, якщо результат позитивний – її роблять протягом одного-двох місяців після тесту.',
  },
  {
    q: 'Як часто повторювати чекап?',
    a: 'Базові показники – тиск, ліпідограма, глюкоза – перевіряють щороку або раз на кілька років залежно від результатів попереднього разу. Мамографію і скринінг колоректального раку – раз на два роки. Періодичність для вас визначає лікар за результатами першого чекапу.',
  },
];

const SCREENING_ITEMS = [
  'Артеріальний тиск',
  'Холестерин і ліпідний профіль',
  'Глюкоза і ризик цукрового діабету 2 типу',
  'Рак молочної залози',
  'Рак шийки матки',
  'Колоректальний рак',
  'Щільність кісток',
];

const SOURCES = [
  'Порядок скринінгу і ранньої діагностики раку молочної залози, раку шийки матки та колоректального раку, наказ МОЗ України №1368 від 05.08.2024.',
  'Стандарт медичної допомоги «Скринінг раку шийки матки», наказ МОЗ України №1057 від 18.06.2024.',
  'Стандарт медичної допомоги «Рак молочної залози», наказ МОЗ України №195 від 03.02.2025.',
  'УКПМД «Гіпертонічна хвороба (артеріальна гіпертензія)», наказ МОЗ України №1581 від 12.09.2024.',
  'УКПМД «Цукровий діабет 2 типу у дорослих», наказ МОЗ України №1300 від 24.07.2024.',
  'Клінічна настанова «Профілактика серцево-судинних захворювань», наказ МОЗ України №564 від 13.06.2016.',
  'Настанови «Скринінг та профілактика колоректального раку» і «Остеопороз», Реєстр медико-технологічних документів ДЕЦ МОЗ (dec.gov.ua).',
  'U.S. Preventive Services Task Force: скринінг остеопорозу (2025), скринінг переддіабету і цукрового діабету 2 типу (2021).',
  'Mayo Clinic Family Health Book, п’яте видання, розділ «Breast Health».',
  'Національний канцер-реєстр України, бюлетень за 2024 рік.',
];

export default async function Page() {
  const { program, branches } = await fetchType5aData(CHECKUP_PROGRAM_SLUG);

  if (!program || !program.price_date) {
    notFound();
  }

  const notice = priceDateNotice(program.price_date);
  const composition = await fetchProgramComposition(program.id);
  // Лічильники — з реального складу (program_services), не з застарілих полів
  // checkup_programs (Частина 3 завдання "Наповнення складу програми"). Консультації
  // рахують лише візит 1 — повторний прийом терапевта на другому візиті не є новим
  // спеціалістом і в лічильник не входить (показується в блоці 7).
  const counts = [
    composition.counts.consultations ? { label: 'консультацій', count: composition.counts.consultations } : null,
    composition.counts.analyses ? { label: 'аналізів', count: composition.counts.analyses } : null,
    composition.counts.diagnostics ? { label: 'обстежень', count: composition.counts.diagnostics } : null,
  ].filter((c): c is { label: string; count: number } => c !== null);

  const sidebarBranches = branches.map((b) => ({ name: b.name_ua, address: b.address_ua }));
  const compositionSummary = composition.summaryGroups;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'MedicalWebPage',
        name: 'Обстеження для жінок після 50: що перевіряти і де пройти в Харкові',
        url: PAGE_URL,
        lastReviewed: '2026-08-29',
        reviewedBy: { '@type': 'Person', name: 'Удовиченко Олена Олександрівна', jobTitle: 'Лікар акушер-гінеколог' },
        author: { '@type': 'Organization', name: 'check-up.in.ua' },
      },
      {
        '@type': 'ItemList',
        name: 'Обстеження для жінок після 50 років',
        itemListElement: SCREENING_ITEMS.map((name, i) => ({ '@type': 'ListItem', position: i + 1, name })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Чекапи в Харкові', item: 'https://check-up.in.ua/ukr/kharkiv' },
          { '@type': 'ListItem', position: 2, name: 'Жіночий чекап', item: 'https://check-up.in.ua/ukr/female-checkup/kharkiv' },
          { '@type': 'ListItem', position: 3, name: 'Після 50 років', item: PAGE_URL },
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
            <span className="text-gray-700">Після 50 років</span>
          </nav>

          <div className="max-w-[680px]">
            <h1 id="hero" className="text-[28px] sm:text-3xl font-bold text-text-primary leading-tight mb-4 scroll-mt-24">
              Обстеження для жінок після 50: що перевіряти і де пройти в Харкові
            </h1>
            <p className="text-[15px] text-text-secondary leading-relaxed">
              Після 50 років у перелік обстежень додаються ті, що шукають захворювання, ймовірність яких у цьому віці
              зростає. Перевірити варто артеріальний тиск, холестерин, глюкозу, стан молочних залоз і кишківника, а від
              65 років – щільність кісток. Обсяг залежить від спадкової історії, ваги і того, що ви проходили раніше.
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
              compositionSummary={compositionSummary}
              subdomainHref={SUBDOMAIN_HREF}
              additionalServices={[]}
              programSlug={CHECKUP_PROGRAM_SLUG}
              sourceCta={SOURCE_CTA}
            />
          </aside>

          <div className="flex-1 lg:order-1 min-w-0">
            <section id="shcho-pereviryaty" className="scroll-mt-24 mb-10">
              <h2 className="text-xl font-bold text-[#0b1a24] mb-3">Що перевіряти після 50</h2>
              <p className="text-[15px] text-gray-600 leading-relaxed mb-3">
                Після менопаузи знижується рівень естрогену, і це змінює одразу кілька процесів. Зростає
                серцево-судинний ризик – до менопаузи він у жінок нижчий, ніж у чоловіків того самого віку. Кістка
                починає втрачати щільність, причому найшвидше саме в перші роки після менопаузи. Змінюється
                розподіл жирової тканини зі зміщенням до середини тіла. Тканина молочної залози стає менш
                щільною, а ризик раку молочної залози при цьому зростає.
              </p>
              <p className="text-[15px] text-gray-600 leading-relaxed mb-3">
                Саме ці зміни, а не вік як число, визначають набір обстежень після 50.
              </p>
              <p className="text-[15px] text-gray-600 leading-relaxed mb-6">
                Нижче – кожне з них: навіщо роблять, яким методом і як часто повторюють. Поряд вказано ступінь
                рекомендації USPSTF – американської робочої групи з профілактики, чиї оцінки використовують як
                орієнтир у світі. Ступінь A означає високу впевненість у користі, B – помірну. Обидва означають, що
                обстеження рекомендоване.
              </p>

              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-[#0b1a24] mb-1.5 flex items-center gap-2">
                    Артеріальний тиск <Badge variant="uspstf" size="sm">USPSTF A</Badge>
                  </h3>
                  <p className="text-[14px] text-gray-600 leading-relaxed mb-2">Після 50 років тиск вимірюють щороку.</p>
                  <p className="text-[14px] text-gray-600 leading-relaxed mb-2">
                    Підвищений тиск роками не дає жодних відчуттів, поки не з&apos;являються наслідки з боку серця,
                    судин і нирок. Виміряне значення – єдиний спосіб дізнатися про нього завчасно. Разом із рівнем
                    холестерину і глюкози воно формує оцінку серцево-судинного ризику на найближчі десять років.
                  </p>
                  <p className="text-[12px] text-gray-500">
                    Джерело: УКПМД «Гіпертонічна хвороба (артеріальна гіпертензія)», наказ МОЗ України №1581 від
                    12.09.2024.
                  </p>
                </div>

                <div>
                  <h3 className="text-base font-bold text-[#0b1a24] mb-1.5 flex items-center gap-2">
                    Холестерин і ліпідний профіль <Badge variant="uspstf" size="sm">USPSTF B</Badge>
                  </h3>
                  <p className="text-[14px] text-gray-600 leading-relaxed mb-2">
                    Ліпідограма показує рівень холестерину і його фракцій. Після 50 років її здають щонайменше раз
                    на чотири-шість років, за наявності факторів ризику – частіше.
                  </p>
                  <p className="text-[14px] text-gray-600 leading-relaxed mb-2">
                    Ліпопротеїни низької щільності переносять жирові речовини до стінок артерій, ліпопротеїни
                    високої щільності забирають їх звідти до печінки. Проблема виникає, коли перших забагато або
                    других замало – саме тому в результаті важливий не загальний холестерин, а співвідношення
                    фракцій.
                  </p>
                  <p className="text-[14px] text-gray-600 leading-relaxed mb-2">
                    Показник набуває змісту в порівнянні з попереднім: важливий не лише рівень, а й напрямок
                    зміни. Тому результат зберігають і показують лікарю разом із попередніми.
                  </p>
                  <p className="text-[12px] text-gray-500">
                    Джерело: клінічна настанова «Профілактика серцево-судинних захворювань», наказ МОЗ України
                    №564 від 13.06.2016.
                  </p>
                </div>

                <div>
                  <h3 className="text-base font-bold text-[#0b1a24] mb-1.5 flex items-center gap-2">
                    Глюкоза і ризик цукрового діабету 2 типу <Badge variant="uspstf" size="sm">USPSTF B</Badge>
                  </h3>
                  <p className="text-[14px] text-gray-600 leading-relaxed mb-2">
                    Скринінг переддіабету і діабету 2 типу проводять кожні три роки жінкам із надлишковою вагою або
                    ожирінням, тобто з індексом маси тіла від 25.
                  </p>
                  <p className="text-[14px] text-gray-600 leading-relaxed mb-2">
                    Показанням є поєднання віку і маси тіла, а не вік окремо. За нормальної ваги і без діабету в
                    родині щорічна перевірка глюкози не дає додаткової інформації.
                  </p>
                  <p className="text-[14px] text-gray-600 leading-relaxed mb-2">
                    Переддіабет – стан, за якого рівень глюкози вже вищий за норму, але ще не досягає діабетичних
                    значень. На цьому етапі зміна харчування і фізичної активності здатна зупинити перехід у
                    діабет.
                  </p>
                  <p className="text-[12px] text-gray-500">
                    Джерела: УКПМД «Цукровий діабет 2 типу у дорослих», наказ МОЗ України №1300 від 24.07.2024;
                    USPSTF, 2021.
                  </p>
                </div>

                <AccordionSection summary="Показати всі обстеження">
                <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-[#0b1a24] mb-1.5 flex items-center gap-2">
                    Рак молочної залози <Badge variant="uspstf" size="sm">USPSTF B</Badge>
                  </h3>
                  <p className="text-[14px] text-gray-600 leading-relaxed mb-2">
                    Метод скринінгу – мамографія, раз на два роки. В Україні популяційна програма охоплює жінок
                    50-69 років.
                  </p>
                  <p className="text-[14px] text-gray-600 leading-relaxed mb-2">
                    Мамографія знаходить пухлину на стадії, коли лікування найефективніше. Але метод не
                    безпомилковий: стандартна мамографія пропускає близько 15 відсотків випадків, найчастіше при
                    щільній тканині залози. У зворотний бік похибка теж є – приблизно три з чотирьох ділянок, що
                    виглядають підозріло на знімку, виявляються доброякісними.
                  </p>
                  <p className="text-[14px] text-gray-600 leading-relaxed mb-2">
                    Це не аргумент відмовитися від обстеження, а причина не панікувати після виклику на
                    дообстеження: у більшості випадків воно нічого не підтверджує.
                  </p>
                  <p className="text-[14px] text-gray-600 leading-relaxed mb-2">
                    Приблизно одна жінка з восьми стикається з раком молочної залози протягом життя. Якщо
                    захворювання було в матері, сестри чи доньки, скринінг починають раніше – за п&apos;ять-десять
                    років до віку, у якому діагноз поставили родичці.
                  </p>
                  <p className="text-[12px] text-gray-500">
                    Джерела: наказ МОЗ України №1368 від 05.08.2024; наказ МОЗ України №195 від 03.02.2025.
                  </p>
                </div>

                <div>
                  <h3 className="text-base font-bold text-[#0b1a24] mb-1.5 flex items-center gap-2">
                    Рак шийки матки <Badge variant="uspstf" size="sm">USPSTF A</Badge>
                  </h3>
                  <p className="text-[14px] text-gray-600 leading-relaxed mb-2">
                    Скринінг охоплює жінок до 65 років. Метод – цитологічне дослідження, тест на вірус папіломи
                    людини або їх поєднання. Тест на ВПЛ рідше пропускає передракові зміни, тому дозволяє
                    повторювати скринінг не так часто.
                  </p>
                  <p className="text-[14px] text-gray-600 leading-relaxed mb-2">
                    Позитивний результат означає потребу в дообстеженні, а не наявність раку чи дисплазії.
                  </p>
                  <p className="text-[12px] text-gray-500">
                    Джерела: наказ МОЗ України №1368 від 05.08.2024; наказ МОЗ України №1057 від 18.06.2024.
                  </p>
                </div>

                <div>
                  <h3 className="text-base font-bold text-[#0b1a24] mb-1.5 flex items-center gap-2">
                    Колоректальний рак <Badge variant="uspstf" size="sm">USPSTF A</Badge>
                  </h3>
                  <p className="text-[14px] text-gray-600 leading-relaxed mb-2">Скринінг проводять від 50 років. Є два шляхи.</p>
                  <p className="text-[14px] text-gray-600 leading-relaxed mb-2">
                    Аналіз калу на приховану кров або фекальний імунохімічний тест – простий і неінвазивний,
                    повторюється раз на два роки. За позитивного результату далі призначають колоноскопію.
                    Обмеження методу в тому, що не кожен поліп і не кожна пухлина кровоточать, тому негативний
                    результат не виключає їх повністю.
                  </p>
                  <p className="text-[14px] text-gray-600 leading-relaxed mb-2">
                    Колоноскопія – огляд кишківника зсередини. Виявляє поліпи і видаляє їх за ту саму процедуру,
                    тому повторюється значно рідше, зазвичай раз на десять років. Потребує підготовки і седації.
                  </p>
                  <p className="text-[14px] text-gray-600 leading-relaxed mb-2">
                    Практично кожен колоректальний рак розвинувся з поліпа, хоча не кожен поліп стає раком.
                    Більшість пухлин розвиваються повільно, роками – саме тому регулярний скринінг зазвичай встигає
                    знайти зміни до того, як вони стануть небезпечними. У 2024 році в Україні зареєстрували 13 239
                    нових випадків.
                  </p>
                  <p className="text-[12px] text-gray-500">
                    Джерела: наказ МОЗ України №1368 від 05.08.2024; настанова «Скринінг та профілактика
                    колоректального раку», Реєстр медико-технологічних документів ДЕЦ МОЗ; Національний
                    канцер-реєстр України, 2024.
                  </p>
                </div>

                <div>
                  <h3 className="text-base font-bold text-[#0b1a24] mb-1.5 flex items-center gap-2">
                    Щільність кісток <Badge variant="uspstf" size="sm">USPSTF B</Badge>
                  </h3>
                  <p className="text-[14px] text-gray-600 leading-relaxed mb-2">
                    Оцінку щільності кісток рекомендують усім жінкам від 65 років. У молодшому віці після
                    менопаузи – за наявності факторів ризику: перелом стегна в батьків, низька маса тіла, куріння,
                    надмірне вживання алкоголю.
                  </p>
                  <p className="text-[14px] text-gray-600 leading-relaxed mb-2">
                    Метод – двоенергетична рентгенівська абсорбціометрія, або DXA. Обстеження вимірює, скільки
                    мінералів міститься в ділянці кістки; зазвичай досліджують хребет, стегно і передпліччя. Серед
                    жінок від 65 років остеопороз мають 27 відсотків.
                  </p>
                  <p className="text-[14px] text-gray-600 leading-relaxed mb-2">
                    Кістка втрачає щільність без болю і без будь-яких відчуттів. Перший симптом остеопорозу
                    зазвичай – перелом, найчастіше стегна, зап&apos;ястка або хребців.
                  </p>
                  <p className="text-[12px] text-gray-500">
                    Джерела: USPSTF, рекомендація 2025 року (ступінь B); настанова «Остеопороз», Реєстр
                    медико-технологічних документів ДЕЦ МОЗ.
                  </p>
                </div>

                <div>
                  <h3 className="text-base font-bold text-[#0b1a24] mb-1.5">Загальні показники крові та функція органів</h3>
                  <p className="text-[14px] text-gray-600 leading-relaxed">
                    Загальний аналіз крові, показники функції нирок і печінки не є скринінгом конкретного
                    захворювання. Вони дають лікарю базову картину, на тлі якої інтерпретуються решта результатів,
                    і допомагають помітити відхилення, яких ви ще не відчуваєте.
                  </p>
                </div>
                </div>
                </AccordionSection>
              </div>
            </section>

            <section id="chogo-ne-potribno" className="scroll-mt-24 mb-10 bg-gray-50 rounded-xl p-6">
              {/* Приглушений стиль, без рамки-акценту — зняття занепокоєння, не CalloutBlock (п.6).
                  ОНОВЛЕНО (п.4, "UX-виправлення, ітерація 2", 29.08.2026): вступ тепер завжди видимий
                  розгорнутим — раніше блок згортався цілком і поруч із іншим згорнутим блоком виглядав
                  як два порожні місця підряд. Під розкриттям лишаються лише самі пункти. */}
              <h3 className="text-base font-bold text-text-primary mb-3">Чого зазвичай не потрібно</h3>
              <p className="text-[15px] text-gray-600 leading-relaxed mb-4">
                Кожне обстеження у скринінгу має підставу: воно шукає конкретний стан у конкретній групі людей. За
                межами цієї групи воно дає більше уточнень і тривоги, ніж відповідей.
              </p>
              <AccordionSection summary="Показати приклади">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-[#0b1a24] mb-1.5">Самообстеження грудей замість мамографії</h3>
                    <p className="text-[14px] text-gray-600 leading-relaxed mb-2">
                      Регулярне самообстеження не замінює мамографію і не показало здатності знижувати смертність від
                      раку молочної залози. Знати, як виглядають і відчуваються ваші груди в нормі, корисно – але це
                      доповнення до скринінгу, а не його заміна.
                    </p>
                    <p className="text-[12px] text-gray-500">Джерело: Mayo Clinic Family Health Book, розділ «Breast Health».</p>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#0b1a24] mb-1.5">Мамографія частіше, ніж раз на два роки</h3>
                    <p className="text-[14px] text-gray-600 leading-relaxed mb-2">
                      Для жінки 50-69 років без факторів ризику щорічна мамографія не дає переваги перед
                      обстеженням раз на два роки. Частіше – якщо так рекомендує лікар з огляду на вашу історію.
                    </p>
                    <p className="text-[12px] text-gray-500">
                      Джерело: Порядок скринінгу і ранньої діагностики раку молочної залози, наказ МОЗ України
                      №1368 від 05.08.2024.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#0b1a24] mb-1.5">Скринінг раку шийки матки після 65 років</h3>
                    <p className="text-[14px] text-gray-600 leading-relaxed mb-2">
                      Популяційний скринінг охоплює жінок до 65 років. Після 65 його припиняють, якщо попередні
                      результати були в нормі й обстеження проводились за графіком. Продовжують тоді, коли скринінг
                      раніше не проводився, результати були відсутні або в них були відхилення.
                    </p>
                    <p className="text-[12px] text-gray-500">
                      Джерело: Стандарт медичної допомоги «Скринінг раку шийки матки», наказ МОЗ України №1057 від
                      18.06.2024.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#0b1a24] mb-1.5">Скринінг після 75 років</h3>
                    <p className="text-[14px] text-gray-600 leading-relaxed mb-2">
                      Рутинний скринінг припиняють, коли вік або супутні захворювання роблять малоймовірним ще
                      десять років життя. Для колоректального раку орієнтир – 75 років, далі рішення індивідуальне.
                      Щодо мамографії після 75 років рекомендація та сама: обговорити з лікарем, зважаючи на
                      загальний стан здоров&apos;я.
                    </p>
                    <p className="text-[14px] text-gray-600 leading-relaxed mb-2">
                      Причина не в тому, що обстеження стає непотрібним, а в тому, що скринінг знаходить зміни, які
                      розвиваються роками. Якщо цих років попереду менше, ніж потрібно пухлині для прояву,
                      обстеження створює більше втручань, ніж користі.
                    </p>
                    <p className="text-[12px] text-gray-500">
                      Джерело: Mayo Clinic Family Health Book, п&apos;яте видання, розділи «Cancer» і «Breast Health».
                    </p>
                  </div>
                </div>
              </AccordionSection>
            </section>

            {/* Блок 4 — головний на сторінці (п.1, "UX-виправлення, ітерація 2", 29.08.2026):
                контрастний бокс (border-2 + shadow-md), більший внутрішній відступ, ключовий
                склад показується РОЗГОРНУТО тут (не під розкриттям) — на відміну від сайдбара,
                де той самий склад згорнутий для швидкого погляду. */}
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

                {compositionSummary.length > 0 && (
                  <div className="space-y-3 mb-4 pt-4 border-t border-gray-100">
                    {compositionSummary.map((group) => (
                      <div key={group.type}>
                        <p className="text-xs font-semibold text-text-secondary mb-1">{group.type}</p>
                        <ul className="text-[14px] text-gray-700 space-y-0.5 list-disc list-inside">
                          {group.items.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}

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
                Це базова програма ОН Клінік для жінок від 40 років. Вона закриває більшість цілей, перелічених
                вище: тиск, ліпідограму, глюкозу, огляд гінеколога і базові показники крові. Обстеження, специфічні
                саме для віку після 50, до неї додають окремо – нижче видно, які саме.
              </p>
            </section>

            <section id="dopovnennya" className="scroll-mt-24 mb-10 bg-gray-50 rounded-xl p-6">
              <h2 className="text-xl font-bold text-[#0b1a24] mb-3">Що варто додати після 50</h2>
              <p className="text-[15px] text-gray-600 leading-relaxed mb-5">
                Готова програма розрахована на вік від 40 років. Нижче – обстеження, які для віку після 50 мають
                окрему підставу.
              </p>

              <AdditionalServices
                available={[
                  {
                    id: 'fecal-occult-blood-test',
                    name: 'Аналіз калу на приховану кров',
                    priceVariants: [{ label: 'Аналіз калу на приховану кров (код 11098-OH)', price: 315 }],
                    priceType: 'exact',
                    priceDate: '2026-08-09',
                    explanation: 'Скринінг колоректального раку від 50 років, раз на два роки. У складі програми його немає.',
                  },
                  {
                    id: 'colonoscopy',
                    name: 'Колоноскопія',
                    priceVariants: [{ label: 'Колоноскопія', price: 2000 }],
                    priceType: 'exact',
                    priceNote: 'До ціни додається анестезія внутрішньовенна при фіброколоноскопії — 2000 грн окремою позицією. Разом 4000 грн: показувати лише 2000 грн — ввести в оману.',
                    priceDate: '2026-08-09',
                    explanation: 'Альтернатива аналізу калу: огляд кишківника зсередини з можливістю видалити поліпи під час процедури. Повторюється значно рідше.',
                  },
                ]}
                unavailable={[
                  {
                    name: 'Мамографія',
                    why: 'Основний метод скринінгу раку молочної залози для жінок 50-69 років, раз на два роки. В ОН Клінік не проводиться.',
                    whereToGo:
                      'Мамографію можна пройти безкоштовно за направленням сімейного лікаря – вона входить у програму медичних гарантій. Для цього зверніться до лікаря, з яким укладено декларацію. Направлення дійсне в будь-якому закладі, що має договір з Національною службою здоров’я.',
                  },
                  {
                    name: 'Денситометрія (DXA)',
                    why: 'Оцінка щільності кісткової тканини, рекомендована жінкам від 65 років. В ОН Клінік не проводиться.',
                    whereToGo: 'Уточнюється в клініці.',
                  },
                ]}
                programSlug={CHECKUP_PROGRAM_SLUG}
                sourceCta={SOURCE_CTA}
              />

              <div className="mt-6">
                <h3 className="text-base font-bold text-[#0b1a24] mb-2">УЗД молочних залоз і мамографія – різні обстеження</h3>
                <p className="text-[14px] text-gray-600 leading-relaxed mb-2">
                  У складі програми є УЗД молочних залоз з доплерометрією і регіонарними лімфовузлами. Після 50
                  років воно не замінює мамографію, і це варто розуміти до візиту.
                </p>
                <p className="text-[14px] text-gray-600 leading-relaxed mb-2">
                  УЗД добре показує рідинні утворення: кісти, розширені протоки, а також стан регіонарних
                  лімфовузлів. Мамографія бачить інше – зокрема дрібні відкладення солей кальцію, які можуть бути
                  ранньою ознакою змін і на УЗД не візуалізуються.
                </p>
                <p className="text-[14px] text-gray-600 leading-relaxed mb-2">
                  Значення має і вік. У молодших жінок тканина залози щільна, і рентгенівський знімок читається
                  гірше – там УЗД інформативніше. Після менопаузи залозиста тканина заміщується жировою, і
                  мамографія працює точніше. Тому до 40 років основним методом частіше є УЗД, після 50 –
                  мамографія.
                </p>
                <p className="text-[13px] font-semibold text-[#0b1a24] mt-3 mb-1.5">Що відбувається за результатами УЗД</p>
                <p className="text-[14px] text-gray-600 leading-relaxed mb-2">
                  Лікар ультразвукової діагностики описує знахідку і відносить її до категорії за міжнародною
                  класифікацією. Гінеколог інтерпретує опис разом з оглядом і вашою історією.
                </p>
                <p className="text-[14px] text-gray-600 leading-relaxed mb-2">
                  Якщо змін немає або вони явно доброякісні – рекомендують плановий скринінг за віком, тобто
                  мамографію раз на два роки.
                </p>
                <p className="text-[14px] text-gray-600 leading-relaxed mb-2">
                  Якщо знахідка потребує уточнення – направляють до мамолога і на мамографію, іноді додатково на
                  прицільне УЗД або біопсію.
                </p>
                <p className="text-[14px] text-gray-600 leading-relaxed mb-3">
                  Якщо ви прийшли зі скаргою – ущільнення, виділення, зміна форми чи шкіри – це вже не скринінг, а
                  діагностика. Маршрут інший: огляд мамолога, і обстеження призначає він.
                </p>
                <p className="text-[13px] text-gray-500 leading-relaxed italic">
                  Обране вами не є остаточним замовленням. Це те, що ви хочете обговорити на консультації: лікар
                  підтвердить, чи потрібне кожне обстеження саме вам, і назве остаточну вартість.
                </p>
              </div>
            </section>

            {/* Дисклеймер про роль лікаря — простий текст, без рамки й акценту, не CalloutBlock (п.6) */}
            <section className="mt-10 mb-10">
              <p className="text-[13px] text-gray-600 leading-relaxed mb-2">
                Перелічене вище – орієнтир, а не призначення. Повний перелік обстежень визначає лікар за
                результатами огляду і розмови з вами: те, що потрібно одній жінці 55 років, може бути зайвим для
                іншої.
              </p>
              <p className="text-[13px] text-gray-600 leading-relaxed">
                Програма чекапу дає лікарю ширшу картину, ніж окремий аналіз. Саме на підставі сукупності
                показників він робить висновок, а не на підставі одного значення поза контекстом.
              </p>
            </section>

            {/* Блок 7 "Як це проходить" (завдання "Наповнення складу програми", 29.08.2026,
                Частина 4). Склад за візитами і підготовка виводяться зі складу програми —
                правило рахується один раз у lib/programs/composition.ts, не дублюється тут. */}
            <section id="yak-tse-prohodyt" className="scroll-mt-24 mb-10 bg-gray-50 rounded-xl p-6">
              <h2 className="text-xl font-bold text-[#0b1a24] mb-3">Як це проходить</h2>
              <p className="text-[15px] text-gray-600 leading-relaxed mb-3">
                Чекап проходить у два візити. На першому здають аналізи і проходять інструментальні
                обстеження, на другому лікар розбирає готові результати. Між візитами кілька днів –
                час, потрібний лабораторії.
              </p>
              <p className="text-[15px] text-gray-600 leading-relaxed mb-5">
                Висновок формується саме на другому візиті: окремі показники інтерпретуються разом,
                у контексті вашого віку, ваги, спадкової історії і того, що показав огляд.
              </p>

              {composition.visit1Groups.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-[10px] p-5 mb-4">
                  <p className="text-xs font-semibold text-text-secondary mb-3">Візит 1</p>
                  <div className="space-y-3">
                    {composition.visit1Groups.map((group) => (
                      <div key={group.type}>
                        <p className="text-[13px] font-semibold text-text-secondary mb-1">{group.type}</p>
                        <ul className="text-[14px] text-gray-700 space-y-0.5 list-disc list-inside">
                          {group.items.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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

        <CrossAgeNav currentHref={PAGE_PATH} />

        <section className="py-8 border-t border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Де пройти в Харкові</h2>
          <p className="text-[14px] text-gray-600 leading-relaxed">
            Пройти чекап для жінок після 50 у Харкові можна в ОН Клінік – у трьох локаціях: на вулиці Ярослава
            Мудрого, 30а, на проспекті Героїв Харкова, 257 (біля станції метро «Палац Спорту») і на вулиці
            Молочній, 48 (Левада). Програму «Check-up жіночий після 40» проводять лікарі Check-Up Центру ОН Клінік
            Харків. Конкретну локацію узгоджує оператор клініки під час підтвердження запису – залежно від того,
            які обстеження ви обрали.
          </p>
        </section>

        <section className="py-8 border-t border-gray-100 text-[13px] text-gray-500 leading-relaxed">
          <p className="mb-1"><span className="font-semibold text-gray-700">Медичний редактор:</span> Ігор Растрепін, check-up.in.ua</p>
          <p className="mb-1">
            <span className="font-semibold text-gray-700">Рецензент:</span> Удовиченко Олена Олександрівна, лікар
            акушер-гінеколог, ОН Клінік Харків
          </p>
          <p className="mb-1">Дата публікації: 25.07.2026</p>
          <p className="mb-4">Дата оновлення: 29.08.2026</p>

          <p className="font-semibold text-gray-700 mb-1.5">Джерела</p>
          <ol className="list-decimal list-inside space-y-1 mb-4">
            {SOURCES.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>

          <p className="font-semibold text-gray-700 mb-1">Про повноту джерел</p>
          <p className="mb-4">
            Єдиного українського стандарту профілактичного чекапу не існує: диспансеризацію скасовано 2018 року
            наказом МОЗ №504, а програма «Скринінг здоров&apos;я 40+» охоплює лише серцево-судинні захворювання,
            цукровий діабет і ментальне здоров&apos;я. Рекомендації щодо решти напрямків на цій сторінці
            спираються на окремі українські порядки скринінгу і на міжнародні клінічні настанови.
          </p>

          <p className="font-semibold text-gray-700 mb-1">Розкриття</p>
          <p>
            check-up.in.ua – медичний маркетплейс. Ми отримуємо комісію від клінік-партнерів. Це не впливає на
            медичний зміст: перелік обстежень на цій сторінці складений за клінічними настановами, а не за складом
            програм партнерів.
          </p>
        </section>
      </main>

      <BookingFlow
        programs={[program]}
        branches={branches}
        clinicId={program.clinic_id}
        clinicSlug="onclinic-kharkiv"
        city="kharkiv"
      />
      <StickyMobileCta
        programNameShort="Check-Up жіночий після 40"
        price={program.price_discount}
        programSlug={CHECKUP_PROGRAM_SLUG}
        sourceCta={`${SOURCE_CTA}_sticky`}
      />
    </>
  );
}
