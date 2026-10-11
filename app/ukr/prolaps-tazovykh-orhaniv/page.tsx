import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeader from '@/components/shared/SiteHeader';
import OffersArea, { MethodOffersLink } from '@/components/hub-diagnosis/OffersArea';
import { fetchProlapsOffers } from '@/lib/hub/prolaps-offers';
import {
  CITY_ORDER,
  GEO_TEMPLATES,
  GEO_TITLE,
  HUB_URL,
  METHODS,
  OFFERS_ANCHOR,
  type HubOffer,
} from '@/lib/hub/prolaps-content';

// Хаб діагнозу платформи (тип 1): пролапс тазових органів, реліз 1.
// Контент: content/hub/prolaps-tazovykh-orhaniv.md (v2) дослівно.
// Розділи релізу 1: Hero, що таке пролапс, лікування, кейси, область пропозицій, E-E-A-T.
// Інформаційна частина – без імен лікарів і клінік, без цін. Лікарі, клініки, адреси і посилання
// на сторінки операцій – лише в області пропозицій і GEO-блоці, з реєстру (Supabase).
// Верстка – за скринінговими сторінками (app/ukr/screening/*).

export const revalidate = 3600;

const BORDER = '1px solid #e8edf3';
const BG_GRAY = '#f8fafc';
const BG_WHITE = '#ffffff';
const UPDATED_ISO = '2026-10-11';
const PUBLISHED_LABEL = '11.10.2026';
const UPDATED_LABEL = '11.10.2026';

const TITLE =
  'Лікування пролапсу тазових органів: опущення матки, кольпорафія, сакрокольпопексія, слінг | check-up.in.ua';
const H1 = 'Лікування пролапсу тазових органів: які операції розглядають при опущенні матки і піхви';
const DESCRIPTION =
  'Опущення матки і піхви: вправи, песарій і чотири види операцій. Як підбирають метод під тип пролапсу. Лікарі в Києві, Харкові та Миколаєві, запис онлайн.';

const REVIEWER_NAME = 'Бондарук Володимир Петрович';
const REVIEWER_TITLE = 'лікар акушер-гінеколог вищої категорії, кандидат медичних наук';

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  robots: { index: true, follow: true },
  alternates: { canonical: HUB_URL },
  openGraph: { title: TITLE, description: DESCRIPTION, url: HUB_URL, type: 'website' },
};

const SOURCES: { text: string; url: string }[] = [
  {
    text: 'Hadizadeh-Talasaz Z, Khadivzadeh T, Mohajeri T, Sadeghi M. Worldwide Prevalence of Pelvic Organ Prolapse: A Systematic Review and Meta-Analysis. Iranian Journal of Public Health. 2024;53(3):524–538. DOI 10.18502/ijph.v53i3.15134',
    url: 'https://doi.org/10.18502/ijph.v53i3.15134',
  },
  {
    text: 'National Institute for Health and Care Excellence (NICE). Urinary incontinence and pelvic organ prolapse in women: management. NICE guideline NG123. 2019',
    url: 'https://www.nice.org.uk/guidance/ng123',
  },
];

const NON_SURGICAL: { title: string; teaser: string }[] = [
  {
    title: "Тренування м'язів тазового дна",
    teaser: "Щоденні вправи зміцнюють м'язи, які тримають органи. Найкраще допомагають на ранніх стадіях.",
  },
  {
    title: 'Песарій',
    teaser:
      'Силіконове кільце або кубик у піхві підтримує органи. Підходить тим, кому операція не доцільна або протипоказана.',
  },
  {
    title: 'Зміна звичок',
    teaser:
      'Лікування закрепів і кашлю, контроль ваги, обмеження важкої роботи зменшують навантаження на тазове дно.',
  },
];

const CASE_PLATE = 'Приклад складений із типових випадків, щоб показати логіку рішень. Це не історія реальної жінки.';
const CASES: { title: string; story: string; scope: string; extra: string[] }[] = [
  {
    title: 'Опущення передньої стінки після пологів',
    story:
      'Жінка 40–45 років, двоє пологів. Відчуває тиск у піхві, часто ходить у туалет і не може повністю спорожнити сечовий міхур. Вправи кілька місяців допомагали лише частково. Огляд показав опущення передньої стінки піхви разом із сечовим міхуром. Матка на місці.',
    scope: 'Передня кольпорафія через піхву. Окремих етапів не знадобилося.',
    extra: ['стандартне обстеження перед операцією'],
  },
  {
    title: 'Опущення матки і підтікання сечі',
    story:
      'Жінка 50–55 років. Відчуття кульки в піхві надвечір і підтікання сечі при кашлі та бігу. Хоче зберегти матку і продовжувати займатися спортом. Огляд показав опущення матки, обстеження сечового міхура підтвердило стресове нетримання.',
    scope:
      'Лапароскопічна сакрогістеропексія зі збереженням матки і слінг під сечівник під час тієї ж операції.',
    extra: ['уродинамічне дослідження перед операцією', 'сітка і стрічка для слінгу'],
  },
  {
    title: 'Повне випадіння у старшому віці',
    story:
      "Жінка 70–75 років, хворіє на гіпертонію. Матка повністю вийшла назовні, на слизовій з'явилися подразнення. Важко ходити й сидіти. Статевим життям не живе. Песарій не тримався.",
    scope:
      "Видалення матки через піхву, закріплення верхівки піхви до зв'язки таза і зміцнення передньої та задньої стінок. Вид анестезії обирає анестезіолог з урахуванням стану серця.",
    extra: [
      'консультація терапевта або кардіолога перед операцією',
      'довше перебування в стаціонарі',
      'лікування подразнень слизової перед операцією',
    ],
  },
];

function Eyebrow({ children }: { children: string }) {
  return <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#005485] mb-6">{children}</p>;
}

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-bold text-[#0b1a24]" style={{ fontSize: 'clamp(22px, 3vw, 30px)', lineHeight: 1.25 }}>
      {children}
    </h2>
  );
}

function H3({ children }: { children: React.ReactNode }) {
  return <h3 className="text-[19px] font-bold text-[#0b1a24] leading-snug mt-10">{children}</h3>;
}

function Section({
  bg,
  eyebrow,
  wide = false,
  id,
  children,
}: {
  bg: string;
  eyebrow: string;
  wide?: boolean;
  id?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-6" style={{ backgroundColor: bg, borderTop: BORDER }}>
      <div className="max-w-[1200px] mx-auto px-6 lg:px-14 py-14">
        <div className={wide ? '' : 'max-w-3xl'}>
          <Eyebrow>{eyebrow}</Eyebrow>
          {children}
        </div>
      </div>
    </section>
  );
}

const P = 'text-gray-700 leading-relaxed mt-4';

function joinNames(names: string[]): string {
  if (names.length <= 1) return names.join('');
  return `${names.slice(0, -1).join(', ')} і ${names[names.length - 1]}`;
}

/** GEO-блок: одне речення на місто, де є пропозиції. Лікарі, клініка, адреса – з реєстру. */
function geoParagraphs(offers: HubOffer[]): string[] {
  return CITY_ORDER.flatMap((city) => {
    const inCity = offers.filter((o) => o.cityKey === city);
    const template = GEO_TEMPLATES[city];
    if (inCity.length === 0 || !template) return [];
    return [
      template
        .replace('{doctors}', joinNames(inCity.map((o) => o.fullName)))
        .replace('{clinic}', inCity[0].clinicLabel)
        .replace('{address}', inCity[0].street),
    ];
  });
}

export default async function ProlapsHubPage() {
  const offers = await fetchProlapsOffers();
  const geo = geoParagraphs(offers);

  const jsonLd: object[] = [
    {
      '@context': 'https://schema.org',
      '@type': 'MedicalWebPage',
      name: H1,
      url: HUB_URL,
      mainEntity: {
        '@type': 'MedicalCondition',
        name: 'Пролапс тазових органів',
        alternateName: ['Опущення матки', 'Опущення піхви', 'Випадіння матки', 'Генітальний пролапс'],
        code: { '@type': 'MedicalCode', codingSystem: 'ICD-10', codeValue: 'N81' },
      },
      about: METHODS.map((m) => ({ '@type': 'MedicalProcedure', name: m.title })),
      dateModified: UPDATED_ISO,
      lastReviewed: UPDATED_ISO,
      reviewedBy: { '@type': 'Physician', name: REVIEWER_NAME },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'check-up.in.ua', item: 'https://check-up.in.ua' },
        { '@type': 'ListItem', position: 2, name: 'Пролапс тазових органів', item: HUB_URL },
      ],
    },
  ];

  return (
    <>
      <SiteHeader city={null} />
      <main className="text-[#0b1a24]">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

        {/* 1. Hero */}
        <section style={{ backgroundColor: BG_GRAY }}>
          <div className="max-w-[1200px] mx-auto px-6 lg:px-14 py-14">
            <div className="max-w-3xl">
              <nav aria-label="Breadcrumb" className="text-xs text-gray-500 mb-8">
                <Link href="/" className="hover:underline">
                  check-up.in.ua
                </Link>
                <span className="mx-1.5">/</span>
                <span className="text-gray-700">Пролапс тазових органів</span>
              </nav>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#005485] mb-6">
                Оперативна гінекологія · Тазове дно
              </p>
              <h1
                className="font-bold leading-tight mb-6"
                style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 'clamp(30px, 4.6vw, 52px)' }}
              >
                {H1}
              </h1>
              <p className="text-[17px] text-gray-700 leading-relaxed">
                Відчуття кульки чи тиску в піхві, яке посилюється надвечір, часто означає опущення матки або стінок
                піхви. Це не небезпечно для життя, але з часом заважає ходити, працювати, жити статевим життям.
                Опущення лікується: від вправ до операції.
              </p>
              <a
                href={`#${OFFERS_ANCHOR}`}
                className="inline-flex items-center justify-center min-h-[48px] mt-8 px-7 py-3 rounded-[10px] bg-[#005485] text-white text-[16px] font-semibold hover:bg-[#003a5e] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#005485]"
              >
                Обрати метод і лікаря
              </a>
            </div>
          </div>
        </section>

        {/* 2. Що таке пролапс */}
        <Section bg={BG_WHITE} eyebrow="Про діагноз">
          <H2>Що таке пролапс тазових органів</H2>
          <p className={P}>
            При пролапсі матка або стінки піхви зміщуються вниз, до входу в піхву. На пізніх стадіях вони можуть
            виходити назовні.
          </p>
          <p className={P}>
            Якщо опускається передня стінка піхви, разом із нею зміщується сечовий міхур. Якщо задня, то пряма кишка.
            Після видалення матки може опуститися верхівка піхви.
          </p>
          <p className={P}>
            Органи малого таза тримаються на м&apos;язах і зв&apos;язках тазового дна. Ці тканини розтягуються після
            пологів, слабшають з віком і після менопаузи. Опущенню також сприяють важка фізична робота, закрепи,
            тривалий кашель, надмірна вага.
          </p>
          <p className={P}>
            Опущення трапляється приблизно в кожної третьої жінки
            <sup className="text-[#005485]">
              {' '}
              [
              <a href="#source-1" className="hover:underline">
                1
              </a>
              ]
            </sup>
            . Багато хто роками не звертається до лікаря, бо вважає це нормою після пологів або соромиться говорити
            про це.
          </p>
          <div className="mt-8 bg-[#e8f4fd] border border-[#cfe3f3] rounded-[10px] px-5 py-4">
            <p className="text-[15px] font-semibold text-[#0b1a24]">Важливо знати</p>
            <p className="text-[15px] text-gray-700 leading-relaxed mt-2">
              Пролапс не є пухлиною і не загрожує життю. Без лікування він зазвичай повільно посилюється. На ранніх
              стадіях лікування починають із вправ, на пізніх розглядають операцію.
            </p>
          </div>
        </Section>

        {/* 6. Лікування */}
        <Section bg={BG_GRAY} eyebrow="Лікування">
          <H2>Як лікують опущення матки і піхви</H2>

          <H3>Коли можна без операції</H3>
          <p className={P}>На ранніх стадіях і при помірних скаргах лікування починають без операції.</p>
          <ul className="mt-5 space-y-4 list-none">
            {NON_SURGICAL.map((m) => (
              <li key={m.title} className="bg-white border border-[#e8edf3] rounded-[10px] px-5 py-4">
                <p className="text-[16px] font-semibold text-[#0b1a24]">{m.title}</p>
                <p className="text-[15px] text-gray-700 leading-relaxed mt-1.5">{m.teaser}</p>
              </li>
            ))}
          </ul>
          <p className={P}>Ці методи зменшують скарги, але не повертають органи на місце при вираженому опущенні.</p>

          <H3>Коли розглядають операцію</H3>
          <p className={P}>
            Операцію розглядають, коли опущення заважає жити, а вправи чи песарій не допомогли або не підходять.
          </p>
          <p className={P}>
            Оперують двома способами: через кілька проколів на животі (лапароскопічно) або через піхву. Спосіб
            залежить від того, що саме опустилося, від віку, стану здоров&apos;я і планів жінки.
          </p>

          <H3>Які операції виконують при опущенні</H3>
          <ul className="mt-5 space-y-4 list-none">
            {METHODS.map((m) => (
              <li key={m.key} className="bg-white border border-[#e8edf3] rounded-[14px] p-6">
                {m.context && <p className="text-[13px] font-semibold text-[#005485] mb-2">{m.context}</p>}
                <p className="text-[18px] font-bold text-[#0b1a24] leading-snug">{m.title}</p>
                <p className="text-[15px] text-gray-700 leading-relaxed mt-2 mb-5">{m.teaser}</p>
                <MethodOffersLink method={m.key} />
              </li>
            ))}
          </ul>
          <p className={P}>Часто кілька операцій поєднують в одну. Обсяг визначає хірург після огляду.</p>
        </Section>

        {/* 7. Кейси */}
        <Section bg={BG_WHITE} eyebrow="Приклади">
          <H2>Чому обсяг лікування в кожної жінки свій</H2>
          <p className={P}>
            Діагноз однаковий, а лікування може дуже відрізнятися: від однієї короткої операції до кількох етапів в
            одне втручання.
          </p>
          <ul className="mt-6 space-y-5 list-none">
            {CASES.map((c) => (
              <li key={c.title} className="border border-[#e8edf3] rounded-[14px] p-6" style={{ backgroundColor: BG_GRAY }}>
                <p className="text-[18px] font-bold text-[#0b1a24] leading-snug">{c.title}</p>
                <p className="text-[13px] text-gray-600 bg-white border border-[#e8edf3] rounded-[8px] px-3 py-2 mt-3">
                  {CASE_PLATE}
                </p>
                <p className="text-[15px] text-gray-700 leading-relaxed mt-4">{c.story}</p>
                <p className="text-[14px] font-semibold text-[#0b1a24] mt-4">Обсяг втручання</p>
                <p className="text-[15px] text-gray-700 leading-relaxed mt-1">{c.scope}</p>
                <p className="text-[14px] font-semibold text-[#0b1a24] mt-4">Додаткові послуги</p>
                <ul className="mt-1 space-y-1 list-disc pl-5 text-[15px] text-gray-700">
                  {c.extra.map((e) => (
                    <li key={e}>{e}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </Section>

        {/* 12. Область пропозицій + GEO-блок */}
        <Section bg={BG_GRAY} eyebrow="Де лікувати" wide id={OFFERS_ANCHOR}>
          <H2>Лікарі, які оперують опущення матки і піхви</H2>
          <p className={`${P} max-w-3xl`}>
            Оберіть метод і місто. У картці лікаря: рівень, досвід, клініка і запис на консультацію.
          </p>
          <OffersArea offers={offers} />

          {geo.length > 0 && (
            <div className="max-w-3xl mt-12">
              <h3 className="text-[19px] font-bold text-[#0b1a24] leading-snug">{GEO_TITLE}</h3>
              {geo.map((text) => (
                <p key={text} className={P}>
                  {text}
                </p>
              ))}
            </div>
          )}
        </Section>

        {/* E-E-A-T */}
        <Section bg={BG_WHITE} eyebrow="Першоджерела">
          <H2>Джерела</H2>
          <p className={P}>
            Затвердженого протоколу МОЗ України з лікування пролапсу тазових органів немає. Сторінка спирається на
            міжнародні дослідження.
          </p>
          <ol className="mt-4 space-y-3 list-none">
            {SOURCES.map((s, i) => (
              <li key={s.url} id={`source-${i + 1}`} className="flex gap-3 text-sm text-gray-600 leading-relaxed scroll-mt-24">
                <span className="font-semibold text-[#0b1a24] shrink-0">{i + 1}.</span>
                <a href={s.url} target="_blank" rel="noopener" className="text-[#005485] underline hover:no-underline">
                  {s.text}
                </a>
              </li>
            ))}
          </ol>
        </Section>

        <section style={{ backgroundColor: BG_GRAY, borderTop: BORDER }}>
          <div className="max-w-[1200px] mx-auto px-6 lg:px-14 py-12">
            <div className="max-w-3xl text-[#374151] leading-relaxed space-y-3">
              <p className="text-[15px]">
                <span className="font-semibold text-[#0b1a24]">Автор:</span> Ігор Растрепін, засновник check-up.in.ua
              </p>
              <p className="text-[15px]">
                <span className="font-semibold text-[#0b1a24]">Медичний рецензент:</span> {REVIEWER_NAME},{' '}
                {REVIEWER_TITLE}
              </p>
              <p className="text-sm text-gray-500">
                check-up.in.ua: медичний маркетплейс. Ми отримуємо комісію від клінік і лікарів-партнерів. Це не
                впливає на медичний зміст сторінки. Рецензент сторінки є одним із лікарів, до яких тут можна
                записатися.
              </p>
              <p className="text-sm text-gray-500">
                Сторінка є інформаційним матеріалом і не замінює консультацію лікаря. Тактику лікування визначають
                після огляду.
              </p>
              <p className="text-[13px] text-gray-500">
                Опубліковано: {PUBLISHED_LABEL} · Оновлено: {UPDATED_LABEL}
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
