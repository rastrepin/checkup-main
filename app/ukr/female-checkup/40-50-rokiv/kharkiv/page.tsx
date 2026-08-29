import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchType5aData, priceDateNotice } from '@/lib/programs/type5a';
import ProgramSidebar from '@/components/program-page/ProgramSidebar';
import StickyMobileCta from '@/components/program-page/StickyMobileCta';
import AdditionalServices from '@/components/program-page/AdditionalServices';
import InPageNav from '@/components/shared/InPageNav';
import AccordionSection from '@/components/shared/AccordionSection';
import InfoFrame from '@/components/shared/InfoFrame';
import CrossAgeNav from '@/components/shared/CrossAgeNav';
import BookingFlow from '@/components/city/BookingFlow';
import FaqBlock from '@/components/city/FaqBlock';
import { Badge } from '@/components/ui';

// Тип 5a — жіночий чекап 40-50 років, Харків.
// Джерело контенту: 5a-female-40-50-kharkiv.md (дата контенту 09.08.2026), дослівно.
// Блок 7 «Як це проходить» СВІДОМО ВІДСУТНІЙ у v1 (рішення Cowork 29.08.2026:
// visit_number/підготовка відсутні в базі, деградація замість вигаданого тексту).
// Відповідно й пункт «Як це проходить» прибрано з InPageNav (Блок 1a) — якір
// на відсутню секцію був би мертвим посиланням.

export const revalidate = 3600;

const CHECKUP_PROGRAM_SLUG = 'zhinochyi-pislya-40';
const SOURCE_CTA = 'age_page_female_40_50_kharkiv';
const PAGE_PATH = '/ukr/female-checkup/40-50-rokiv/kharkiv';
const PAGE_URL = `https://check-up.in.ua${PAGE_PATH}`;
const SUBDOMAIN_HREF = 'https://onclinic.check-up.in.ua/kharkiv/zhinochyi-pislya-40';

function fmt(n: number) {
  return n.toLocaleString('uk-UA');
}

export async function generateMetadata(): Promise<Metadata> {
  const { program } = await fetchType5aData(CHECKUP_PROGRAM_SLUG);
  const price = program?.price_discount ?? null;
  const title = 'Чекап для жінок 40-50 років: які обстеження проходити, програми в Харкові | check-up.in.ua';
  const description = price
    ? `Які обстеження потрібні жінці 40-50 років: тиск, холестерин, глюкоза, огляд гінеколога, стан молочних залоз. Програма в Харкові – ${fmt(price)} грн.`
    : 'Які обстеження потрібні жінці 40-50 років: тиск, холестерин, глюкоза, огляд гінеколога, стан молочних залоз.';
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
    q: 'Які обстеження потрібно пройти жінці в 40-50 років?',
    a: 'Базовий набір: артеріальний тиск щороку, ліпідограма раз на кілька років, глюкоза за наявності надлишкової ваги, огляд гінеколога зі скринінгом раку шийки матки, обстеження молочних залоз.',
  },
  {
    q: 'Чи можна пройти чекап без скарг?',
    a: 'Так, у цьому і полягає його сенс. Підвищений тиск, переддіабет і зміни ліпідного профілю роками не дають симптомів і виявляються тільки вимірюванням.',
  },
  {
    q: 'Скільки часу займає чекап?',
    a: 'Два візити. Перший триває дві-три години: здача аналізів і інструментальні обстеження. Другий – близько години, якщо за результатами не призначено додаткових досліджень. Між візитами кілька днів.',
  },
  {
    q: 'Чим програма для 40-50 відрізняється від програми після 50?',
    a: 'Це та сама програма. Різниця в доповненнях: після 50 до неї додають скринінг колоректального раку.',
  },
  {
    q: 'Чи потрібна мамографія в 45 років?',
    a: 'Залежить від спадкової історії. В Україні популяційна програма починається з 50 років, для 40-49 мамографія передбачена за наявності факторів ризику. Якщо рак молочної залози був у близької родички, обстеження показане раніше.',
  },
  {
    q: 'Як часто повторювати чекап?',
    a: 'Базові показники – тиск, ліпідограма, глюкоза – перевіряють щороку або раз на кілька років залежно від результатів попереднього разу. Періодичність для вас визначає лікар за результатами першого чекапу.',
  },
];

const SCREENING_ITEMS = [
  'Артеріальний тиск',
  'Холестерин і ліпідний профіль',
  'Глюкоза і ризик цукрового діабету 2 типу',
  'Рак шийки матки',
  'Стан молочних залоз',
];

const SOURCES = [
  'Порядок скринінгу і ранньої діагностики раку молочної залози, раку шийки матки та колоректального раку, наказ МОЗ України №1368 від 05.08.2024.',
  'Стандарт медичної допомоги «Скринінг раку шийки матки», наказ МОЗ України №1057 від 18.06.2024.',
  'Стандарт медичної допомоги «Рак молочної залози», наказ МОЗ України №195 від 03.02.2025.',
  'УКПМД «Гіпертонічна хвороба (артеріальна гіпертензія)», наказ МОЗ України №1581 від 12.09.2024.',
  'УКПМД «Цукровий діабет 2 типу у дорослих», наказ МОЗ України №1300 від 24.07.2024.',
  'Клінічна настанова «Профілактика серцево-судинних захворювань», наказ МОЗ України №564 від 13.06.2016.',
  'Настанови «Скринінг та профілактика колоректального раку» і «Остеопороз», Реєстр медико-технологічних документів ДЕЦ МОЗ.',
  'U.S. Preventive Services Task Force: скринінг раку молочної залози (2024), скринінг остеопорозу (2025), скринінг переддіабету і цукрового діабету 2 типу (2021).',
  'Mayo Clinic Family Health Book, п’яте видання, розділи «Breast Health» і «Women’s Health».',
];

export default async function Page() {
  const { program, branches } = await fetchType5aData(CHECKUP_PROGRAM_SLUG);

  // §3: дата ціни порожня → сторінка взагалі не рендериться.
  if (!program || !program.price_date) {
    notFound();
  }

  const notice = priceDateNotice(program.price_date);
  const counts = [
    program.consultations_count ? { label: 'консультацій', count: program.consultations_count } : null,
    program.analyses_count ? { label: 'аналізів', count: program.analyses_count } : null,
    program.diagnostics_count ? { label: 'обстежень', count: program.diagnostics_count } : null,
  ].filter((c): c is { label: string; count: number } => c !== null);

  const sidebarBranches = branches.map((b) => ({ name: b.name_ua, address: b.address_ua }));

  // Розкривний повний склад (п.4, 29.08.2026) — лише групи, для яких є реальні дані
  // в checkup_programs.composition. Візити не показуємо: program_services порожня.
  const composition = (program.composition ?? {}) as { consultations?: string[]; analyses_extra?: string[] };
  const compositionSummary = [
    composition.consultations?.length ? { type: 'Консультації', items: composition.consultations } : null,
    composition.analyses_extra?.length
      ? { type: 'Аналізи — додатково до профілактичного набору', items: composition.analyses_extra }
      : null,
  ].filter((g): g is { type: string; items: string[] } => g !== null);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'MedicalWebPage',
        name: 'Обстеження для жінок 40-50 років: що перевіряти і де пройти в Харкові',
        url: PAGE_URL,
        lastReviewed: '2026-08-29',
        reviewedBy: { '@type': 'Person', name: 'Удовиченко Олена Олександрівна', jobTitle: 'Лікар акушер-гінеколог' },
        author: { '@type': 'Organization', name: 'check-up.in.ua' },
      },
      {
        '@type': 'ItemList',
        name: 'Обстеження для жінок 40-50 років',
        itemListElement: SCREENING_ITEMS.map((name, i) => ({ '@type': 'ListItem', position: i + 1, name })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Чекапи в Харкові', item: 'https://check-up.in.ua/ukr/kharkiv' },
          { '@type': 'ListItem', position: 2, name: 'Жіночий чекап', item: 'https://check-up.in.ua/ukr/female-checkup/kharkiv' },
          { '@type': 'ListItem', position: 3, name: '40-50 років', item: PAGE_URL },
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
            <span className="text-gray-700">40-50 років</span>
          </nav>

          <div className="max-w-[680px]">
            <h1 id="hero" className="text-[28px] sm:text-3xl font-bold text-text-primary leading-tight mb-4 scroll-mt-24">
              Обстеження для жінок 40-50 років: що перевіряти і де пройти в Харкові
            </h1>
            <p className="text-[15px] text-text-secondary leading-relaxed">
              У проміжку 40-50 років більшість жінок ще не мають скарг, але саме в цей час починають накопичуватися
              зміни, які проявляться пізніше. Перевірити варто артеріальний тиск, холестерин, глюкозу, стан щитоподібної
              залози за наявності підстав, а також пройти огляд гінеколога зі скринінгом шийки матки. Обсяг залежить від
              спадкової історії, ваги і того, що ви проходили раніше.
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
              <h2 className="text-xl font-bold text-[#0b1a24] mb-3">Що перевіряти в 40-50 років</h2>
              <p className="text-[15px] text-gray-600 leading-relaxed mb-3">
                Період 40-50 років – це перименопауза: менструальний цикл ще зберігається, але рівень естрогену
                коливається дедалі сильніше. Ці коливання поступово змінюють ліпідний профіль, розподіл жирової
                тканини і швидкість оновлення кісткової тканини. Наслідки цих змін стають помітними після
                менопаузи, але формуються вони саме зараз.
              </p>
              <p className="text-[15px] text-gray-600 leading-relaxed mb-3">
                Друга особливість віку – більшість станів, які шукають у цей період, ще не дають симптомів.
                Підвищений тиск, переддіабет і зміни ліпідного профілю виявляються тільки вимірюванням.
              </p>
              <p className="text-[15px] text-gray-600 leading-relaxed mb-6">
                Нижче – кожне обстеження: навіщо роблять, яким методом і як часто повторюють. Поряд вказано
                ступінь рекомендації USPSTF – американської робочої групи з профілактики, чиї оцінки
                використовують як орієнтир у світі. Ступінь A означає високу впевненість у користі, B – помірну.
              </p>

              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-[#0b1a24] mb-1.5 flex items-center gap-2">
                    Артеріальний тиск <Badge variant="uspstf" size="sm">USPSTF A</Badge>
                  </h3>
                  <p className="text-[14px] text-gray-600 leading-relaxed mb-2">Від 40 років тиск вимірюють щороку.</p>
                  <p className="text-[14px] text-gray-600 leading-relaxed mb-2">
                    Підвищений тиск роками не дає жодних відчуттів, поки не з&apos;являються наслідки з боку серця,
                    судин і нирок. Виміряне значення – єдиний спосіб дізнатися про нього завчасно.
                  </p>
                  <p className="text-[14px] text-gray-600 leading-relaxed mb-2">
                    Разом із рівнем холестерину і глюкози воно формує оцінку серцево-судинного ризику на
                    найближчі десять років. Саме в 40-50 років ця оцінка вперше стає практично значущою: до 40
                    ризик у більшості жінок низький незалежно від показників.
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
                    Ліпідограму здають раз на чотири-шість років за нормальних показників, за наявності факторів
                    ризику – частіше.
                  </p>
                  <p className="text-[14px] text-gray-600 leading-relaxed mb-2">
                    Ліпопротеїни низької щільності переносять жирові речовини до стінок артерій, ліпопротеїни
                    високої щільності забирають їх звідти до печінки. Проблема виникає, коли перших забагато або
                    других замало – тому в результаті важливе співвідношення фракцій, а не лише загальний
                    холестерин.
                  </p>
                  <p className="text-[14px] text-gray-600 leading-relaxed mb-2">
                    У перименопаузі ліпідний профіль зазвичай зміщується: рівень ліпопротеїнів низької щільності
                    зростає. Це відбувається поступово, тому значення має не одне вимірювання, а порівняння з
                    попереднім.
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
                    ожирінням, тобто з індексом маси тіла від 25. Вік початку скринінгу – 35 років.
                  </p>
                  <p className="text-[14px] text-gray-600 leading-relaxed mb-2">
                    Показанням є поєднання віку і маси тіла, а не вік окремо. За нормальної ваги і без діабету в
                    родині щорічна перевірка глюкози не дає додаткової інформації.
                  </p>
                  <p className="text-[14px] text-gray-600 leading-relaxed mb-2">
                    Переддіабет – стан, за якого рівень глюкози вже вищий за норму, але ще не досягає діабетичних
                    значень. На цьому етапі зміна харчування і фізичної активності здатна зупинити перехід у
                    діабет. Саме тому виявити його в 40-50 років практичніше, ніж у 60.
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
                    Рак шийки матки <Badge variant="uspstf" size="sm">USPSTF A</Badge>
                  </h3>
                  <p className="text-[14px] text-gray-600 leading-relaxed mb-2">
                    Скринінг охоплює жінок 25-65 років. Метод – цитологічне дослідження, тест на вірус папіломи
                    людини або їх поєднання.
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
                    Стан молочних залоз <Badge variant="uspstf" size="sm">USPSTF B</Badge>
                  </h3>
                  <p className="text-[14px] text-gray-600 leading-relaxed mb-2">Це єдиний пункт, де рекомендації розходяться.</p>
                  <p className="text-[14px] text-gray-600 leading-relaxed mb-2">
                    В Україні популяційна програма мамографічного скринінгу охоплює жінок 50-69 років. Для віку
                    40-49 мамографія передбачена за наявності факторів ризику. USPSTF рекомендує починати
                    мамографію з 40 років усім жінкам, раз на два роки.
                  </p>
                  <p className="text-[14px] text-gray-600 leading-relaxed mb-2">
                    Розбіжність пояснюється балансом: у віці 40-49 рак молочної залози трапляється рідше, а
                    тканина залози щільніша, тому знімок читається гірше і частина знахідок виявляється
                    хибними. Стандартна мамографія пропускає близько 15 відсотків випадків, найчастіше саме при
                    щільній тканині. У зворотний бік похибка теж є: приблизно три з чотирьох підозрілих ділянок
                    виявляються доброякісними.
                  </p>
                  <p className="text-[14px] text-gray-600 leading-relaxed mb-2">
                    Якщо рак молочної залози був у матері, сестри чи доньки, скринінг починають раніше – за
                    п&apos;ять-десять років до віку, у якому діагноз поставили родичці. У цьому випадку розбіжності
                    немає: обстеження показане.
                  </p>
                  <p className="text-[14px] text-gray-600 leading-relaxed mb-2">
                    Практичний висновок для 40-50 років: рішення про мамографію приймають індивідуально, з огляду
                    на спадкову історію і результати огляду.
                  </p>
                  <p className="text-[12px] text-gray-500">
                    Джерела: наказ МОЗ України №1368 від 05.08.2024; наказ МОЗ України №195 від 03.02.2025;
                    USPSTF, 2024; Mayo Clinic Family Health Book, розділ «Breast Health».
                  </p>
                </div>

                <div>
                  <h3 className="text-base font-bold text-[#0b1a24] mb-1.5">Загальні показники крові та функція органів</h3>
                  <p className="text-[14px] text-gray-600 leading-relaxed mb-2">
                    Загальний аналіз крові, показники функції нирок і печінки не є скринінгом конкретного
                    захворювання. Вони дають лікарю базову картину, на тлі якої інтерпретуються решта результатів.
                  </p>
                  <p className="text-[14px] text-gray-600 leading-relaxed">
                    У цьому віці до них часто додають феритин: приховану залізодефіцитну анемію в жінок з
                    рясними менструаціями загальний аналіз крові виявляє не завжди.
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
                Кожне обстеження у скринінгу має підставу: воно шукає конкретний стан у конкретній групі людей.
                За межами цієї групи воно дає більше уточнень і тривоги, ніж відповідей.
              </p>
              <AccordionSection summary="Показати приклади">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-[#0b1a24] mb-1.5">Скринінг колоректального раку до 50 років</h3>
                    <p className="text-[14px] text-gray-600 leading-relaxed mb-2">
                      Жінці до 50 років без симптомів і без обтяженої спадковості рутинний скринінг колоректального
                      раку не показаний. Раніше його починають, якщо в родині був колоректальний рак або
                      аденоматозні поліпи, є спадкові синдроми чи запальні захворювання кишківника.
                    </p>
                    <p className="text-[12px] text-gray-500">
                      Джерела: наказ МОЗ України №1368 від 05.08.2024; настанова «Скринінг та профілактика
                      колоректального раку», Реєстр медико-технологічних документів ДЕЦ МОЗ.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#0b1a24] mb-1.5">Самообстеження грудей замість мамографії</h3>
                    <p className="text-[14px] text-gray-600 leading-relaxed mb-2">
                      Регулярне самообстеження не замінює мамографію і не показало здатності знижувати смертність
                      від раку молочної залози. Знати, як виглядають і відчуваються ваші груди в нормі, корисно –
                      але це доповнення до скринінгу, а не його заміна.
                    </p>
                    <p className="text-[12px] text-gray-500">Джерело: Mayo Clinic Family Health Book, розділ «Breast Health».</p>
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
                Програма охоплює основні цілі для цього віку: оцінку серцево-судинного ризику, обмін речовин,
                огляд гінеколога зі скринінгом шийки матки, стан щитоподібної залози і базові показники крові.
                Обстеження молочних залоз входить у вигляді УЗД – про різницю між УЗД і мамографією нижче.
              </p>
            </section>

            <section id="dopovnennya" className="scroll-mt-24 mb-10 bg-gray-50 rounded-xl p-6">
              <h2 className="text-xl font-bold text-[#0b1a24] mb-3">Що варто знати про доповнення</h2>
              <p className="text-[15px] text-gray-600 leading-relaxed mb-5">
                Для віку 40-50 років програма закриває більшість цілей. Окремо варто розібратися з обстеженням
                молочних залоз.
              </p>

              <AdditionalServices
                available={[]}
                unavailable={[
                  {
                    name: 'Мамографія',
                    why: 'Показана в 40-50 років за наявності факторів ризику, насамперед раку молочної залози в матері, сестри чи доньки. В ОН Клінік не проводиться.',
                    whereToGo:
                      'Мамографію можна пройти безкоштовно за направленням сімейного лікаря – вона входить у програму медичних гарантій. Для цього зверніться до лікаря, з яким укладено декларацію. Направлення дійсне в будь-якому закладі, що має договір з Національною службою здоров’я.',
                  },
                ]}
                programSlug={CHECKUP_PROGRAM_SLUG}
                sourceCta={SOURCE_CTA}
              />

              <div className="mt-6">
                <h3 className="text-base font-bold text-[#0b1a24] mb-2">УЗД молочних залоз і мамографія – різні обстеження</h3>
                <p className="text-[14px] text-gray-600 leading-relaxed mb-2">
                  У складі програми є УЗД молочних залоз з доплерометрією і регіонарними лімфовузлами.
                </p>
                <p className="text-[14px] text-gray-600 leading-relaxed mb-2">
                  УЗД добре показує рідинні утворення: кісти, розширені протоки, а також стан регіонарних
                  лімфовузлів. Мамографія бачить інше – зокрема дрібні відкладення солей кальцію, які можуть бути
                  ранньою ознакою змін і на УЗД не візуалізуються.
                </p>
                <p className="text-[14px] text-gray-600 leading-relaxed mb-2">
                  У віці 40-50 років тканина залози ще щільна, і рентгенівський знімок читається гірше. Саме тому
                  в цьому віці УЗД часто є основним методом, а мамографія додається за наявності підстав. Після
                  менопаузи співвідношення змінюється на протилежне.
                </p>
                <p className="text-[13px] font-semibold text-[#0b1a24] mt-3 mb-1.5">Що відбувається за результатами УЗД</p>
                <p className="text-[14px] text-gray-600 leading-relaxed mb-2">
                  Лікар ультразвукової діагностики описує знахідку і відносить її до категорії за міжнародною
                  класифікацією. Гінеколог інтерпретує опис разом з оглядом і вашою історією.
                </p>
                <p className="text-[14px] text-gray-600 leading-relaxed mb-2">
                  Якщо змін немає або вони явно доброякісні – рекомендують плановий скринінг за віком.
                </p>
                <p className="text-[14px] text-gray-600 leading-relaxed mb-2">
                  Якщо знахідка потребує уточнення – направляють до мамолога, іноді на мамографію, прицільне УЗД
                  або біопсію.
                </p>
                <p className="text-[14px] text-gray-600 leading-relaxed">
                  Якщо ви прийшли зі скаргою – ущільнення, виділення, зміна форми чи шкіри – це вже не скринінг, а
                  діагностика. Обстеження призначає мамолог.
                </p>
              </div>
            </section>

            <InfoFrame linkLabel="Детальніше про програму">
              <p className="font-semibold text-[#0b1a24]">Національна програма «Скринінг здоров&apos;я 40+»</p>
              <p>
                З 1 січня 2026 року в Україні діє державна програма «Скринінг здоров&apos;я 40+». Вона розрахована
                саме на ваш вік і покриває три напрямки: серцево-судинні захворювання, цукровий діабет 2 типу і
                ментальне здоров&apos;я.
              </p>
              <p>Учасники програми отримують 2000 грн на Дія.Картку для оплати обстежень у закладах, що приєдналися до неї.</p>
              <p>ОН Клінік – учасник програми.</p>
              <p>
                Частина обстежень із переліку вище входить у цю програму. Уточніть у клініці, які саме послуги
                можна оплатити коштами скринінгу, а які – ні.
              </p>
            </InfoFrame>

            {/* Дисклеймер про роль лікаря — простий текст, без рамки й акценту, не CalloutBlock (п.6) */}
            <section className="mt-10 mb-10">
              <p className="text-[13px] text-gray-600 leading-relaxed mb-2">
                Перелічене вище – орієнтир, а не призначення. Повний перелік обстежень визначає лікар за
                результатами огляду і розмови з вами: те, що потрібно одній жінці 45 років, може бути зайвим для
                іншої.
              </p>
              <p className="text-[13px] text-gray-600 leading-relaxed">
                Програма чекапу дає лікарю ширшу картину, ніж окремий аналіз. Саме на підставі сукупності
                показників він робить висновок, а не на підставі одного значення поза контекстом.
              </p>
            </section>
          </div>
        </div>

        <FaqBlock items={FAQ} />

        <CrossAgeNav currentHref={PAGE_PATH} />

        <section className="py-8 border-t border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Де пройти в Харкові</h2>
          <p className="text-[14px] text-gray-600 leading-relaxed">
            Пройти чекап для жінок 40-50 років у Харкові можна в ОН Клінік – у трьох локаціях: на вулиці Ярослава
            Мудрого, 30а, на проспекті Героїв Харкова, 257 (біля станції метро «Палац Спорту») і на вулиці
            Молочній, 48 (Левада). Програму «Check-up жіночий після 40» проводять лікарі Check-Up Центру ОН Клінік
            Харків. Конкретну локацію узгоджує оператор клініки під час підтвердження запису.
          </p>
        </section>

        <section className="py-8 border-t border-gray-100 text-[13px] text-gray-500 leading-relaxed">
          <p className="mb-1"><span className="font-semibold text-gray-700">Медичний редактор:</span> Ігор Растрепін, check-up.in.ua</p>
          <p className="mb-1">
            <span className="font-semibold text-gray-700">Рецензент:</span> Удовиченко Олена Олександрівна, лікар
            акушер-гінеколог, ОН Клінік Харків
          </p>
          <p className="mb-1">Дата публікації: 09.08.2026</p>
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
            наказом МОЗ №504. Рекомендації щодо окремих напрямків спираються на українські порядки скринінгу і на
            міжнародні клінічні настанови.
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
