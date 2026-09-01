import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchType5aData, priceDateNotice } from '@/lib/programs/type5a';
import { fetchProgramComposition } from '@/lib/programs/composition';
import ProgramSidebar from '@/components/program-page/ProgramSidebar';
import CompositionSummaryText from '@/components/program-page/CompositionSummaryText';
import StickyMobileCta from '@/components/program-page/StickyMobileCta';
import AdditionalServices from '@/components/program-page/AdditionalServices';
import InPageNav from '@/components/shared/InPageNav';
import AccordionSection from '@/components/shared/AccordionSection';
import CrossAgeNav from '@/components/shared/CrossAgeNav';
import BookingFlow from '@/components/city/BookingFlow';
import FaqBlock from '@/components/city/FaqBlock';

// Тип 5a — жіночий чекап до 30 років, Харків.
// Джерело контенту: 5a-female-do-30-kharkiv.md (дата контенту 30.08.2026), дослівно.
// Це ПЕРЕЗБІРКА за оновленим MD (задача Cowork "Сторінка female do-30-rokiv, Харків",
// 30.08.2026) — попередня версія (без Блоку 5, зі спрощеним Блоком 2/7) замінена.
//
// РЕВІЗІЯ 01.09.2026 (Cowork, "оновили тексти - онови сторінку"): звірка дослівно з MD
// виявила розбіжності, не лише FAQ Q3 (CLAUDE.md, відкритий пункт 3). Виправлено: Блок 2
// вступ (два окремі абзаци замість об'єднаного переказу + додано пропущений абзац про
// USPSTF-позначки A/B), FAQ Q1/Q2 (текст не збігався з MD), FAQ Q3 (один візит → два,
// узгоджено з Блоком 7 і складом програми), FAQ Q5 (додано питання/речення про біль).
// Блок 3 "Чого зазвичай не потрібно" замінено повністю: попередній вміст (мамографія /
// колоноскопія / регулярний контроль щитоподібної) не походив з цього MD-файлу (немає
// відповідника в жодній версії тексту, немає запису в DECISIONS-checkups.md, що б це
// пояснював) — замінено на фактичний Блок 3 MD (УЗД щитоподібної, гормональні панелі,
// онкомаркери, самообстеження грудей). Джерело MD-файлу (в теці проєкту й у прикріпленому
// повторно файлі) не змінилося відтоді (byte-identical, перевірено md5) — розбіжність була
// внесена під час попередньої збірки, не новим редагуванням MD.
//
// Компонентний контракт (рішення Cowork 30.08.2026, "GeoBlock/EEAT/FAQ" п.1, підтверджено
// власником — варіант 1): GeoBlock/EeatBlock/LegalNote з переліку задачі — inline JSX, як
// на 40-50/vid-50, а не components/hub/{GeoBlock,EEATBlock,FAQAccordion}.tsx. Ті компоненти
// фізично існують, але хардкоджені під сторінку міоми (ON Clinic/Трохимович, фіброїди,
// TODO-плейсхолдери) — жодних пропів для зміни контенту, і документований контракт
// components-map-FIXED.md §11-13 (items[]/branch+focusText/author+reviewer+sources[]) НЕ
// відповідає реальному коду. Технічний борг зафіксовано, рефакторинг hub-компонентів під
// контракт — окреме завдання після виходу всіх вікових сторінок; живу сторінку міоми зараз
// не чіпаємо. FAQ — через FaqBlock (components/city), він уже generic.
//
// СТАТУС: draft. Рецензента не узгоджено з клінікою — robots noindex, доки не з'явиться
// реальне ім'я (generateMetadata нижче).
//
// Блок 5а (нацпрограма) відсутній — вік до 40, не застосовується (за MD).

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
    q: 'Чи потрібен чекап, якщо нічого не турбує?',
    a: 'У цьому віці – так, але не заради пошуку хвороб. Дві причини реальні: скринінг раку шийки матки починається з 25 років незалежно від самопочуття, і вихідні показники крові й тиску мають бути зафіксовані, поки вони в нормі. Через десять років лікар порівнюватиме з ними, а не з абстрактною нормою.',
  },
  {
    q: 'Що здати перед плануванням вагітності?',
    a: 'Базові обстеження чекапу закривають частину: показники крові, рівень заліза, глюкозу, огляд гінеколога. Решту призначає гінеколог індивідуально – склад залежить від вашої історії, попередніх вагітностей і захворювань у родині. Найпрактичніше сказати про плани на консультації, тоді перелік складуть одразу під вас.',
  },
  {
    q: 'Скільки часу займає чекап?',
    a: '[УТОЧНИТИ: DATA] Орієнтовно два візити: здача аналізів і консультацій у перший день, розбір результатів – у другий.',
  },
  {
    q: 'Чи потрібна мамографія до 30 років?',
    a: 'Зазвичай ні. Виняток – рак молочної залози у матері, сестри чи доньки: тоді скринінг починають за 5-10 років до віку, у якому їй поставили діагноз.',
  },
  {
    q: 'З якого віку робити Пап-тест і чи боляче це?',
    a: 'Від 25 років кожні три роки за відсутності відхилень, жінкам з груп ризику – від 21 року. Процедура коротка, кілька секунд, і супроводжується швидкоплинним дискомфортом, а не болем.',
  },
  {
    q: 'Чим ця програма відрізняється від програми для 30-40 років?',
    a: 'Основа та сама – базові показники і огляд гінеколога. Різниця в акцентах: після 30 зростає увага до обміну речовин і серцево-судинних факторів, які до 30 років ще рідко проявляються.',
  },
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

  // priceValidUntil (Schema ItemList/Offer): той самий поріг свіжості 2 місяці, що й
  // priceDateNotice (Р27) — не довільна дата, обчислена від price_date з бази.
  const priceValidUntilDate = new Date(program.price_date);
  priceValidUntilDate.setMonth(priceValidUntilDate.getMonth() + 2);
  const priceValidUntil = priceValidUntilDate.toISOString().slice(0, 10);

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
        // Offer вкладено всередину itemListElement (продукт-програма), НЕ на рівні
        // сторінки/MedicalWebPage — SEO-STANDARD р.5.
        '@type': 'ItemList',
        name: 'Програми чекапу для жінок до 30 років у Харкові',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            item: {
              '@type': 'Product',
              name: program.name_ua,
              url: SUBDOMAIN_HREF,
              offers: {
                '@type': 'Offer',
                price: program.price_discount,
                priceCurrency: 'UAH',
                priceValidUntil,
                url: SUBDOMAIN_HREF,
                availability: 'https://schema.org/InStock',
              },
            },
          },
        ],
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
                До 30 років привід звернутися зазвичай конкретний: планування вагітності, початок статевого життя,
                зміна контрацепції. Тоді зрозуміло, з чим іти до лікаря.
              </p>
              <p className="text-[15px] text-gray-600 leading-relaxed mb-3">
                Складніше, коли приводу немає. Нічого не турбує, скарг немає, і незрозуміло, чи варто щось
                перевіряти взагалі і з чого починати.
              </p>
              <p className="text-[15px] text-gray-600 leading-relaxed mb-3">
                Обстеження до 30 років вирішують два різні завдання.
              </p>
              <p className="text-[15px] text-gray-600 leading-relaxed mb-3">
                Перше – скринінг раку шийки матки. Він починається саме в цьому віці, з 25 років, і це профілактика
                конкретного захворювання, а не загальна перевірка.
              </p>
              <p className="text-[15px] text-gray-600 leading-relaxed mb-3">
                Друге – зафіксувати вихідні значення. Тиск, показники крові, рівень заліза й вітаміну D зараз у
                більшості жінок у нормі. Цінність не в самому результаті, а в тому, що через десять і двадцять
                років лікар матиме з чим порівнювати. Одне значення поза контекстом говорить мало, два з інтервалом
                у роки показують напрямок.
              </p>
              <p className="text-[15px] text-gray-600 leading-relaxed mb-3">
                Якщо ви плануєте вагітність, перелік буде ширшим: до нього додають обстеження, які має сенс пройти
                до зачаття, а не під час нього.
              </p>
              <p className="text-[15px] text-gray-600 leading-relaxed mb-3">
                <strong>Що означають позначки.</strong> USPSTF – незалежна робоча група з профілактичної медицини,
                чиї оцінки використовують як міжнародний орієнтир. Ступінь A означає, що користь обстеження доведена
                переконливо, ступінь B – що доказів достатньо, але вони слабші.
              </p>
              <p className="text-[15px] text-gray-600 leading-relaxed mb-6">
                Ці оцінки стосуються груп людей, а не окремої людини. Вони показують, наскільки сильні докази, і не
                замінюють рішення, яке ви приймаєте з лікарем з огляду на свою історію.
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
                  <p className="text-[13px] text-gray-500 leading-relaxed border-l-2 border-gray-200 pl-3">
                    [УТОЧНИТИ: рецензент] Періодичність повторення для здорової жінки без скарг – джерело в
                    screening-evidence-matrix.md відсутнє, потрібне підтвердження формулювання.
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
                  <p className="text-[13px] text-gray-500 leading-relaxed border-l-2 border-gray-200 pl-3">
                    [УТОЧНИТИ: рецензент] Джерело для періодичності перевірки заліза окремо від вагітності в
                    матриці відсутнє.
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
                    Джерело: Порядок скринінгу РШМ, наказ МОЗ України №1368 від 05.08.2024; Стандарт медичної
                    допомоги «Скринінг раку шийки матки», наказ МОЗ України №1057 від 18.06.2024.
                  </p>
                </div>
                </div>
                </AccordionSection>
              </div>
            </section>

            <section id="chogo-ne-potribno" className="scroll-mt-24 mb-10 bg-gray-50 rounded-xl p-6">
              <h3 className="text-base font-bold text-text-primary mb-3">Чого зазвичай не потрібно</h3>
              <p className="text-[15px] text-gray-600 leading-relaxed mb-3">
                Обстеження має сенс тоді, коли його результат щось змінює: підказує дію, знімає питання або показує,
                за чим стежити далі. Якщо жоден можливий результат не змінює нічого, це і є підстава не робити його
                зараз.
              </p>
              <p className="text-[15px] text-gray-600 leading-relaxed mb-4">
                Нижче – про те, що найчастіше здають «про всяк випадок» у цьому віці.
              </p>
              <AccordionSection summary="Показати приклади">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-[#0b1a24] mb-1.5">УЗД щитоподібної залози</h3>
                    <p className="text-[14px] text-gray-600 leading-relaxed mb-2">
                      Показує структуру залози: вузли, кісти, зміни розміру.
                    </p>
                    <p className="text-[14px] text-gray-600 leading-relaxed mb-2">
                      Не показує, як залоза працює – за це відповідає ТТГ, аналіз крові. Вузол на УЗД не означає
                      порушення функції, а нормальна функція не виключає вузлів.
                    </p>
                    <p className="text-[14px] text-gray-600 leading-relaxed mb-2">
                      Що змінює результат. Вузли трапляються приблизно в третини дорослих, і переважна більшість з
                      них не потребує жодного лікування. Знахідка запускає ланцюг: повторне УЗД через півроку,
                      іноді пункція. Для жінки до 30 без симптомів і без опромінення в анамнезі цей ланцюг
                      найчастіше закінчується тим, з чого почався, але з дорожчою тривогою.
                    </p>
                    <p className="text-[14px] text-gray-600 leading-relaxed mb-2">
                      Коли обстеження виправдане: є симптоми, є вузол, який промацується, є захворювання
                      щитоподібної залози в матері чи сестри, було опромінення ділянки голови і шиї в дитинстві.
                    </p>
                    <p className="text-[14px] text-gray-600 leading-relaxed mb-2">
                      Окремо про Чорнобиль. Підвищений ризик стосується тих, хто був дитиною або підлітком у 1986
                      році, тобто людей віком від 39 років. Якщо ви народилися після 1986, ця підстава до вас не
                      застосовується.
                    </p>
                    <p className="text-[13px] text-gray-500 leading-relaxed border-l-2 border-gray-200 pl-3">
                      [УТОЧНИТИ: рецензент] Формулювання про частоту вузлів і про чорнобильську групу.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#0b1a24] mb-1.5">Розширені гормональні панелі</h3>
                    <p className="text-[14px] text-gray-600 leading-relaxed mb-2">
                      Показують рівень кількох гормонів у конкретний день циклу.
                    </p>
                    <p className="text-[14px] text-gray-600 leading-relaxed mb-2">
                      Не показують, чи є проблема, якщо немає скарг. Значення статевих гормонів у здорової жінки
                      коливаються протягом циклу настільки, що результат поза контекстом скарг і дня циклу
                      інтерпретувати неможливо.
                    </p>
                    <p className="text-[14px] text-gray-600 leading-relaxed mb-2">
                      Що змінює результат. Якщо цикл регулярний, вагітність не планується і скарг немає – нічого.
                      Ці аналізи призначає гінеколог під конкретне питання: нерегулярний цикл, труднощі із
                      зачаттям, підозра на певний стан.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#0b1a24] mb-1.5">Онкомаркери</h3>
                    <p className="text-[14px] text-gray-600 leading-relaxed mb-2">
                      Показують рівень білків, що можуть підвищуватися при пухлинах.
                    </p>
                    <p className="text-[14px] text-gray-600 leading-relaxed mb-2">
                      Не показують наявність або відсутність раку. Ті самі білки підвищуються при запаленні, кістах,
                      під час менструації, іноді без будь-якої причини.
                    </p>
                    <p className="text-[14px] text-gray-600 leading-relaxed mb-2">
                      Що змінює результат. Підвищене значення у здорової жінки до 30 майже завжди виявляється
                      хибним, але веде до УЗД, повторних аналізів і кількох тижнів очікування. Онкомаркери –
                      інструмент спостереження за вже встановленим діагнозом, не інструмент пошуку.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#0b1a24] mb-1.5">Самообстеження грудей замість огляду</h3>
                    <p className="text-[14px] text-gray-600 leading-relaxed mb-2">
                      Показує помітні зміни: ущільнення, зміну форми, виділення.
                    </p>
                    <p className="text-[14px] text-gray-600 leading-relaxed mb-2">
                      Не замінює огляд і не є скринінгом. Дослідження не підтвердили, що регулярне самообстеження
                      знижує смертність від раку молочної залози.
                    </p>
                    <p className="text-[14px] text-gray-600 leading-relaxed mb-2">
                      Що змінює результат. Знати, як ваші груди виглядають і відчуваються в нормі, корисно: ви
                      помітите зміну раніше. Але це причина звернутися до лікаря, а не заміна планового огляду.
                    </p>
                    <p className="text-[12px] text-gray-500">
                      Джерело: Mayo Clinic Family Health Book, розділ «Breast Health».
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

            <section id="dopovnennya" className="scroll-mt-24 mb-10 bg-gray-50 rounded-xl p-6">
              <h2 className="text-xl font-bold text-[#0b1a24] mb-3">Доповнення</h2>
              <p className="text-[15px] text-gray-600 leading-relaxed mb-5">
                До 30 років у програму варто додати аналізи, які базова консультація не завжди включає, але які
                дають повнішу вихідну картину.
              </p>

              <AdditionalServices
                available={[
                  {
                    id: 'lipidogram-package-36',
                    name: 'Пакет №36 Ліпідограма',
                    priceVariants: [{ label: 'Пакет №36 Ліпідограма (код 10044-OH)', price: 655 }],
                    priceType: 'exact',
                    priceDate: '2026-08-09',
                    explanation:
                      'Розширений ліпідний профіль – холестерин, ліпопротеїни і тригліцериди разом, а не лише загальний показник. У базовій програмі до 30 років немає.',
                  },
                ]}
                unavailable={[
                  {
                    name: 'Залізо (феритин)',
                    why: 'Дефіцит заліза частіше зустрічається у жінок репродуктивного віку через менструальну крововтрату. У базовій програмі окремого аналізу феритину немає. В ОН Клінік не проводиться.',
                    whereToGo:
                      'Аналіз на феритин можна замовити самостійно в будь-якій лабораторії або за направленням сімейного лікаря.',
                  },
                ]}
                programSlug={CHECKUP_PROGRAM_SLUG}
                sourceCta={SOURCE_CTA}
              />
            </section>

            {/* Дисклеймер про роль лікаря – простий текст, без рамки й акценту (LegalNote
                не створювався, рішення Cowork 30.08.2026, "GeoBlock/EEAT/FAQ" п.1) */}
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
              <p className="text-[15px] text-gray-600 leading-relaxed mb-5">
                Чекап проходить у два візити. На першому – консультації терапевта, гінеколога та офтальмолога,
                здача аналізів і інструментальні обстеження. На другому лікар-терапевт розбирає готові результати.
                Між візитами кілька днів – час, потрібний лабораторії.
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
              <span className="font-semibold text-gray-700">Рецензент:</span> [УТОЧНИТИ: ПІБ, посада, стаж – узгодити з
              клінікою]
            </p>
            <p className="mb-1">Дата публікації: 30.08.2026</p>
            <p className="mb-4">Дата оновлення: 01.09.2026</p>

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
