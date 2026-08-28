import type { Metadata } from 'next';
import Link from 'next/link';
import { db } from '@/lib/supabase';
import type { CheckupProgram } from '@/lib/types';
import BookingFlow, { BookCta, type BranchLite } from '@/components/city/BookingFlow';
import CollapsibleOnMobile from '@/components/shared/CollapsibleOnMobile';

export const revalidate = 3600;

// Контент: content/kharkiv/female-checkup-kharkiv.md · v1.2 (червень 2026)
// Layout: layout-standards-v2.md (чергування фонів, py-14, borderTop, Eyebrow перед H2)

const CLINIC_SLUG = 'onclinic-kharkiv';
const CITY_SLUG = 'kharkiv';
const PAGE_URL = 'https://check-up.in.ua/ukr/female-checkup/kharkiv';

const SLUG_PROF = 'zhinochyi-profilaktychnyi';
const SLUG_AFTER40 = 'zhinochyi-pislya-40';

const SUBDOMAIN_BASE = 'https://onclinic.check-up.in.ua/kharkiv/checkup';

const BORDER = '1px solid #e8edf3';
const BG_GRAY = '#f8fafc';
const BG_WHITE = '#ffffff';

interface Branch extends BranchLite {
  schedule_ua?: string | null;
  name_ua?: string | null;
}

interface PageData {
  clinicId: string | null;
  femProf: CheckupProgram | null;
  femAfter40: CheckupProgram | null;
  branches: Branch[];
}

async function fetchData(): Promise<PageData> {
  try {
    const sb = db() as any;
    const { data: clinic } = await sb.from('clinics').select('id').eq('slug', CLINIC_SLUG).single();
    if (!clinic?.id) return { clinicId: null, femProf: null, femAfter40: null, branches: [] };

    const [{ data: programs }, { data: branches }] = await Promise.all([
      sb
        .from('checkup_programs')
        .select('*')
        .eq('clinic_id', clinic.id)
        .eq('is_active', true)
        .in('slug', [SLUG_PROF, SLUG_AFTER40]),
      sb
        .from('clinic_branches')
        .select('id, address_ua, metro_ua, schedule_ua, name_ua')
        .eq('clinic_id', clinic.id)
        .eq('is_active', true)
        .order('sort_order', { ascending: true }),
    ]);

    const list = (programs ?? []) as CheckupProgram[];
    return {
      clinicId: clinic.id,
      femProf: list.find((p) => p.slug === SLUG_PROF) ?? null,
      femAfter40: list.find((p) => p.slug === SLUG_AFTER40) ?? null,
      branches: (branches ?? []) as Branch[],
    };
  } catch {
    return { clinicId: null, femProf: null, femAfter40: null, branches: [] };
  }
}

function fmt(n: number) {
  return n.toLocaleString('uk-UA');
}

function discountPct(p: CheckupProgram) {
  return Math.round((1 - p.price_discount / p.price_regular) * 100);
}

export async function generateMetadata(): Promise<Metadata> {
  const { femProf } = await fetchData();
  const title = 'Жіночий чекап у Харкові: програми, ціни, запис | check-up.in.ua';
  const description = femProf
    ? `Програми жіночого чекапу в Харкові від ${fmt(femProf.price_discount)} грн замість ${fmt(femProf.price_regular)} грн. ОН Клінік — 3 філії біля метро. Обстеження за два візити, результати за 1-2 дні.`
    : 'Програми жіночого чекапу в Харкові. ОН Клінік — 3 філії біля метро. Обстеження за два візити, результати за 1-2 дні.';
  return {
    title: { absolute: title },
    description,
    robots: { index: true, follow: true },
    alternates: {
      canonical: PAGE_URL,
      languages: { uk: '/ukr/female-checkup/kharkiv', ru: '/female-checkup/kharkov' },
    },
    openGraph: { title, description, url: PAGE_URL, type: 'website' },
  };
}

/* ── Контент (v1.2) ── */

const FAQ = [
  {
    q: 'Як часто потрібно проходити чекап?',
    a: 'Mayo Clinic радить профілактичний медичний огляд двічі у 20-29 років, тричі у 30-39, чотири рази у 40-49, пʼять разів у 50-59 і щороку після 60. Окремо МОЗ України рекомендує жінкам щорічний гінекологічний огляд. Точний графік залежить від вашого стану здоровʼя і факторів ризику — узгодьте його з терапевтом.',
  },
  {
    q: 'Чим відрізняються дві програми?',
    // COUPLED TO PROGRAM COMPOSITION — update on change (fallback v1.1; ціль — рендер дельти з composition jsonb)
    a: 'Програма «після 40» додає до базового складу консультації гастроентеролога, невролога і проктолога, а також ліпідограму, коагулограму й тест на Helicobacter pylori. Жіночий блок (ПАП-тест, УЗД молочних залоз, кольпоскопія) однаковий в обох програмах.',
  },
  {
    q: 'Чи всі дослідження у програмах обовʼязкові?',
    a: 'Ні. Частина досліджень виходить за межі базових скринінгових рекомендацій — вони корисні за конкретних скарг, ризиків чи сімейної історії. На першій консультації терапевт допоможе визначити, що важливо саме для вас.',
  },
  {
    q: 'Чи можна додати до програми інші дослідження?',
    a: 'Так. Якщо у вас є конкретні скарги, хронічні захворювання або спадкові ризики, програму можна розширити окремими аналізами чи консультаціями. Рекомендуємо приймати це рішення разом із лікарем — так додаткові дослідження будуть обґрунтованими, а не випадковими.',
  },
  {
    q: 'Як підготуватися до обстеження?',
    a: 'За 24 години утримайтеся від алкоголю та інтенсивних фізичних навантажень, виключіть продукти, що викликають метеоризм. За 6 годин до візиту не їжте і не пийте — аналізи крові здаються натще. Візьміть із собою наявні медичні документи та результати попередніх обстежень.',
  },
  {
    q: 'Скільки триває чекап і скільки візитів потрібно?',
    a: 'Два візити. Перший займає 2-3 години: консультації, забір аналізів, УЗД, ЕКГ і флюорографія. Результати аналізів готові за 1-2 дні. Другий візит — консультації профільних лікарів і підсумковий висновок терапевта.',
  },
  {
    q: 'У якій філії можна пройти програму?',
    a: 'У будь-якій з трьох філій ОН Клінік Харків: вул. Ярослава Мудрого, 30а, пр. Героїв Харкова, 257 або вул. Молочна, 48. Усі філії розташовані біля станцій метро.',
  },
];

const SCREENING_ROWS: [string, string][] = [
  ['Гінекологічний огляд', 'Щороку (рекомендація МОЗ України)'],
  ['Скринінг раку шийки матки', 'ПАП-тест із 21 року; після 30 років — у поєднанні з тестом на ВПЛ кожні 5 років'],
  ['Артеріальний тиск', 'Кожні 3-5 років до 40 років, щороку після 40'],
  ['Холестерин (ліпідограма)', 'Базовий тест у 20 років, далі кожні 4-6 років за нормальних показників'],
  ['Глюкоза крові натще', 'З 45 років кожні 3 роки; раніше — за факторів ризику'],
  ['Мамографія', 'Базовий знімок у 40 років; з 50 років — кожні 1-2 роки'],
  ['Скринінг на хламідіоз і гонорею', 'Сексуально активні жінки 24 років і молодші; старші — за підвищеного ризику'],
  ['Скринінг раку товстої кишки', 'З 50 років (новіші міжнародні протоколи — з 45); за високого ризику — раніше'],
  ['Перевірка зору', 'Базовий огляд у 40 років; кожні 2-4 роки у 40-54; щороку з 55'],
  ['Денситометрія (щільність кісток)', 'Жінкам із 65 років; раніше — за підвищеного ризику переломів'],
];

const BEYOND_ITEMS: { title: string; text: string }[] = [
  {
    title: 'Тиреоїдна панель (ТТГ, Т4, Т3, АТ ТПО)',
    text: 'Щодо рутинного скринінгу щитоподібної залози серед експертів немає єдиної думки — Mayo Clinic радить вирішувати індивідуально з лікарем. Доцільна за втоми, коливань ваги, порушень циклу.',
  },
  {
    title: 'Вітамін D',
    text: 'Рутинне визначення рівня не входить до скринінгових переліків; перевірка має сенс для жінок у постменопаузі та за обмеженого перебування на сонці.',
  },
  {
    title: 'УЗД молочних залоз',
    text: 'Не замінює мамографію як скринінг — це додатковий метод для оцінки ущільнень чи уточнення результатів. До 40 років застосовується за показаннями.',
  },
  {
    title: 'ЕКГ і рентгенографія органів грудної клітки',
    text: 'Не входять до періодичних скринінгів для здорових дорослих; Mayo Clinic пропонує розглянути базовий знімок грудної клітки після 40 років.',
  },
  {
    title: 'Клінічні аналізи крові та сечі',
    text: 'Не є обовʼязковим щорічним скринінгом для здорових людей, але дають лікарю базову картину і точку відліку для порівняння в динаміці.',
  },
  {
    title: 'ПЛР-діагностика урогенітальних інфекцій',
    text: 'Скринінг на ІПСШ має чіткі вікові й ризикові межі (див. таблицю вище); розширена панель — за показаннями, не як рутина.',
  },
];

const STEPS = [
  {
    title: 'Запис на обстеження',
    text: 'Залиште заявку — менеджер звʼяжеться з вами, допоможе обрати програму та запише на зручний час. Кожна послуга в програмі бронюється на конкретний час, щоб ви не чекали під кабінетами.',
  },
  {
    title: 'Перший візит',
    text: 'Консультація терапевта, огляд акушера-гінеколога, здача аналізів крові та сечі, УЗД, ЕКГ і флюорографія. На перший візит потрібно прийти натще. Триває 2-3 години.',
  },
  {
    title: 'Результати аналізів',
    text: 'Залежно від складу досліджень результати готові протягом 1-2 днів. Вони зʼявляються в електронній медичній картці та надсилаються на вашу електронну пошту.',
  },
  {
    title: 'Підсумкова консультація',
    text: 'На другому візиті терапевт аналізує всі результати, надає висновок і персональні рекомендації. За потреби — направляє до вузькопрофільного спеціаліста.',
  },
];

// COUPLED TO PROGRAM COMPOSITION — update on change
// (fallback v1.1; ціль — рендер з composition jsonb, коли структура отримає групи)
const COMPARISON_ROWS: [string, string, string][] = [
  ['Вік', '18-40 років', 'від 40 років'],
  [
    'Консультації лікарів',
    'Терапевт ×2, акушер-гінеколог, офтальмолог',
    'Терапевт ×2, акушер-гінеколог, гастроентеролог, невролог, проктолог, офтальмолог',
  ],
  [
    'Жіноче здоровʼя',
    'ПАП-тест, ПЛР-скринінг 11 збудників, відеокольпоскопія, УЗД малого таза і молочних залоз',
    'Те саме',
  ],
  ['Серце та судини', 'ЕКГ', 'ЕКГ + ліпідограма + коагулограма'],
  [
    'Травна система',
    'УЗД органів черевної порожнини',
    'УЗД + консультація гастроентеролога + тест на Helicobacter pylori',
  ],
  ['Гормони та вітаміни', 'Тиреоїдна панель, вітамін D', 'Тиреоїдна панель, вітамін D'],
];

// COUPLED TO PROGRAM COMPOSITION — update on change
// (fallback v1.1: 3-4 ключові позиції; ціль — витяг з composition jsonb)
const CARD_KEY_ITEMS: Record<string, string[]> = {
  [SLUG_PROF]: [
    'ПАП-тест і ПЛР-скринінг урогенітальних інфекцій',
    "5 УЗД, відеокольпоскопія, ЕКГ, цифрова флюорографія",
    'Тиреоїдна панель і вітамін D',
  ],
  [SLUG_AFTER40]: [
    'Усе з базової програми',
    '+ гастроентеролог, невролог, проктолог',
    '+ ліпідограма, коагулограма, тест на Helicobacter pylori',
  ],
};

/* ── Допоміжні компоненти ── */

function Eyebrow({ children }: { children: string }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#005485] mb-6">{children}</p>
  );
}

function H2({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <h2
      id={id}
      className="font-bold text-[#0b1a24]"
      style={{ fontSize: 'clamp(22px, 3vw, 30px)', lineHeight: 1.25 }}
    >
      {children}
    </h2>
  );
}

function Section({
  bg,
  eyebrow,
  children,
  className = '',
  py = 'py-14',
}: {
  bg: string;
  eyebrow?: string;
  children: React.ReactNode;
  className?: string;
  py?: string;
}) {
  return (
    <section style={{ backgroundColor: bg, borderTop: BORDER }} className={className}>
      <div className={`max-w-[1200px] mx-auto px-6 lg:px-14 ${py}`}>
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        {children}
      </div>
    </section>
  );
}

function ProgramCard({
  program,
  eyebrow,
  detailsSlug,
}: {
  program: CheckupProgram;
  eyebrow: string;
  detailsSlug: string;
}) {
  const pct = discountPct(program);
  const keyItems = CARD_KEY_ITEMS[detailsSlug] ?? [];
  return (
    <article className="bg-white border border-[#e8edf3] rounded-[10px] p-6 md:p-8 flex flex-col">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#e8f4fd] text-[#005485]">{eyebrow}</span>
        {pct > 0 && (
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#04D3D9]/15 text-[#007a7e]">−{pct}%</span>
        )}
      </div>
      <h3 className="text-lg font-bold text-[#0b1a24] mb-2 md:mb-3">{program.name_ua}</h3>
      <p className="text-sm text-gray-600 mb-3">
        {[
          program.consultations_count ? `${program.consultations_count} консультації` : null,
          program.analyses_count ? `${program.analyses_count} лабораторних досліджень` : null,
          program.diagnostics_count ? `${program.diagnostics_count} інструментальних досліджень` : null,
        ]
          .filter(Boolean)
          .join(' · ')}
      </p>
      <ul className="space-y-1.5 mb-5 flex-1">
        {keyItems.map((line) => (
          <li key={line} className="flex gap-2 text-sm text-gray-600 leading-relaxed">
            <span className="mt-2 w-1 h-1 rounded-full bg-[#04D3D9] shrink-0" aria-hidden="true" />
            {line}
          </li>
        ))}
      </ul>
      <div className="flex items-baseline gap-2 mb-4 md:mb-5">
        <span className="text-2xl font-bold text-[#0b1a24]">{fmt(program.price_discount)} грн</span>
        <span className="text-sm text-gray-400 line-through">{fmt(program.price_regular)} грн</span>
      </div>
      <BookCta programSlug={program.slug} sourceCta={`program_card_${detailsSlug}`} label="Записатися" />
      <a href={`${SUBDOMAIN_BASE}/${detailsSlug}`} className="block text-center text-sm text-[#005485] mt-3 hover:underline">
        Детальніше про програму →
      </a>
    </article>
  );
}

/* ── Сторінка ── */

export default async function FemaleCheckupKharkivPage() {
  const { clinicId, femProf, femAfter40, branches } = await fetchData();
  const programs = [femProf, femAfter40].filter(Boolean) as CheckupProgram[];

  const jsonLd: object[] = [
    {
      '@context': 'https://schema.org',
      '@type': 'MedicalWebPage',
      name: 'Жіночий чекап у Харкові',
      url: PAGE_URL,
      about: {
        '@type': 'MedicalProcedure',
        name: 'Комплексне профілактичне обстеження для жінок (Check-Up)',
        procedureType: 'Diagnostic',
      },
      lastReviewed: '2026-06-11',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: FAQ.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'check-up.in.ua', item: 'https://check-up.in.ua' },
        { '@type': 'ListItem', position: 2, name: 'Check-up у Харкові', item: 'https://check-up.in.ua/ukr/kharkiv' },
        { '@type': 'ListItem', position: 3, name: 'Жіночий чекап', item: PAGE_URL },
      ],
    },
  ];

  return (
    <main className="text-[#0b1a24]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ── 2. Hero ── */}
      <section style={{ backgroundColor: BG_GRAY }}>
        <div className="max-w-[1200px] mx-auto px-6 lg:px-14 py-14">
          <nav aria-label="Breadcrumb" className="text-xs text-gray-500 mb-8">
            <Link href="/" className="hover:underline">check-up.in.ua</Link>
            <span className="mx-1.5">/</span>
            <Link href="/ukr/kharkiv" className="hover:underline">Check-up у Харкові</Link>
            <span className="mx-1.5">/</span>
            <span className="text-gray-700">Жіночий чекап</span>
          </nav>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#005485] mb-6">
            Чекап-програми · ОН Клінік Харків
          </p>
          <h1
            className="font-bold leading-tight mb-5"
            style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 'clamp(32px, 5.5vw, 64px)' }}
          >
            Жіночий чекап у <em className="text-[#005485]">Харкові</em>
          </h1>
          <p className="text-base sm:text-lg text-gray-700 leading-relaxed max-w-3xl mb-8">
            Жіночий чекап — планове обстеження, яке допомагає виявити зміни в організмі до появи симптомів. На цій
            сторінці — дві програми ОН Клінік Харків за віком, базові скринінгові рекомендації для жінок і пояснення,
            які дослідження потрібні всім, а які — лише за показаннями.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <BookCta sourceCta="hero" label="Записатися на чекап →" variant="hero" />
            <a
              href="#programs"
              className="inline-flex items-center justify-center min-h-12 px-7 rounded-[10px] border border-[#005485] text-[#005485] font-semibold text-base hover:bg-white transition-colors"
            >
              Програми ↓
            </a>
          </div>
        </div>
      </section>

      {/* ── 3. Картки програм ── */}
      <Section bg={BG_WHITE} eyebrow="Програми та ціни" className="scroll-mt-20">
        <div id="programs" className="scroll-mt-24">
          <H2>Програми жіночого чекапу в ОН Клінік Харків</H2>
        </div>
        <p className="text-gray-700 leading-relaxed max-w-3xl mt-4 mb-10">
          Обидві програми проходять за два візити. У вартість включені всі консультації, аналізи у власній
          лабораторії «ОН Лаб» та інструментальна діагностика. Доступні в усіх трьох філіях.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {femProf && <ProgramCard program={femProf} eyebrow="18-40 років" detailsSlug={SLUG_PROF} />}
          {femAfter40 && <ProgramCard program={femAfter40} eyebrow="від 40 років" detailsSlug={SLUG_AFTER40} />}
        </div>
      </Section>

      {/* ── 4. Базові скринінги ── */}
      <Section bg={BG_GRAY} eyebrow="Профілактика">
        <H2>Що рекомендовано перевіряти жінці — базові скринінги</H2>
        <p className="text-gray-700 leading-relaxed max-w-3xl mt-4 mb-10">
          Скринінг — це обстеження за відсутності симптомів, доцільність якого підтверджена дослідженнями. Нижче —
          базовий перелік для жінок за міжнародними та українськими рекомендаціями. Він коротший за склад більшості
          чекап-програм — і це нормально: програми ширші за скринінговий мінімум, а що з цього потрібно саме вам,
          визначає лікар.
        </p>
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-sm border-collapse bg-white border border-[#e8edf3] rounded-[10px] overflow-hidden">
            <thead>
              <tr className="bg-[#eef4f8] text-left">
                <th className="px-4 py-3 font-semibold border-b border-[#e8edf3]">Обстеження</th>
                <th className="px-4 py-3 font-semibold border-b border-[#e8edf3]">Кому і як часто</th>
              </tr>
            </thead>
            <tbody>
              {SCREENING_ROWS.map(([a, b]) => (
                <tr key={a} className="border-b border-[#f0f4f8] last:border-0 align-top">
                  <td className="px-4 py-3 font-semibold text-[#0b1a24] whitespace-nowrap sm:whitespace-normal">{a}</td>
                  <td className="px-4 py-3 text-gray-700">{b}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <CollapsibleOnMobile
          className="bg-white border border-[#e8edf3] rounded-[10px] px-5 py-4"
          summaryClassName="text-sm font-semibold text-[#0b1a24] min-h-11 flex items-center"
          summary="Що змінює цей графік"
        >
          <div className="pt-3 space-y-3 text-sm text-gray-700 leading-relaxed">
            <p>
              Цей графік — для жінок із середнім ризиком. Його змінюють: сімейна історія раку грудей чи яєчників
              (зокрема мутації BRCA1/2 — скринінги починають на 5-10 років раніше, ніж захворів родич), менопауза
              (зростає контроль щільності кісток, будь-яка кровотеча після менопаузи — привід для негайного
              обстеження), ожиріння, куріння, планування вагітності. Саме тому графік обстежень варто узгоджувати з
              лікарем, а не складати самостійно.
            </p>
            <p>
              Загальне правило частоти оглядів (Mayo Clinic): профілактичний медичний огляд — двічі у 20-29 років,
              тричі у 30-39, чотири рази у 40-49, пʼять разів у 50-59 і щороку після 60.
            </p>
          </div>
        </CollapsibleOnMobile>
      </Section>

      {/* ── 5. Понад базові скринінги ── */}
      <Section bg={BG_WHITE} eyebrow="Доказовий підхід">
        <H2>Дослідження понад базові скринінги — коли вони доречні</H2>
        <p className="text-gray-700 leading-relaxed max-w-3xl mt-4 mb-10">
          До чекап-програм часто включають дослідження, які не входять до універсальних скринінгових рекомендацій для
          безсимптомних людей. Це не робить їх зайвими — але рішення про них варто приймати за показаннями, а не за
          переліком у прайсі.
        </p>
        <div className="max-w-3xl">
          {BEYOND_ITEMS.map((item) => (
            <CollapsibleOnMobile
              key={item.title}
              className="border-b border-[#e8edf3] last:border-0"
              summaryClassName="py-4 text-sm sm:text-base font-semibold text-[#0b1a24] min-h-11 flex items-center"
              summary={item.title}
            >
              <p className="pb-4 text-sm text-gray-700 leading-relaxed">{item.text}</p>
            </CollapsibleOnMobile>
          ))}
        </div>
        <p className="text-gray-700 leading-relaxed max-w-3xl mt-8">
          Це не означає, що такі дослідження зайві — це означає, що рішення про них варто приймати не за прайсом, а з
          лікарем. На першій консультації терапевт збирає анамнез і допомагає визначити, які дослідження важливі саме
          для вас, а які можна пропустити чи відкласти. Головне джерело правди про ваше здоровʼя — лікар, а не
          сайт.
        </p>
      </Section>

      {/* ── 6. Порівняння програм ── */}
      {/* COUPLED TO PROGRAM COMPOSITION — update on change (fallback v1.1; ціль — рендер з composition) */}
      <Section bg={BG_GRAY} eyebrow="Вибір програми">
        <H2>Профілактичний чи після 40 — яку програму обрати</H2>
        <p className="text-gray-700 leading-relaxed max-w-3xl mt-4 mb-10">
          Основний критерій — вік: до 40 років достатньо базової програми, після 40 додається контроль
          серцево-судинних і онкологічних ризиків. Але вік — не єдиний фактор. Якщо вам менше 40, проте є спадкова
          схильність до хвороб серця, зайва вага або хронічні скарги з боку травлення — обговоріть із терапевтом, чи
          варто розширити базову програму.
        </p>

        {/* Desktop: таблиця */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm border-collapse bg-white border border-[#e8edf3] rounded-[10px] overflow-hidden">
            <thead>
              <tr className="bg-[#eef4f8] text-left">
                <th className="px-4 py-3 font-semibold border-b border-[#e8edf3]">Що входить</th>
                <th className="px-4 py-3 font-semibold border-b border-[#e8edf3]">Жіночий профілактичний</th>
                <th className="px-4 py-3 font-semibold border-b border-[#e8edf3]">Жіночий після 40</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON_ROWS.map(([a, b, c]) => (
                <tr key={a} className="border-b border-[#f0f4f8] align-top">
                  <td className="px-4 py-3 font-semibold text-[#0b1a24]">{a}</td>
                  <td className="px-4 py-3 text-gray-700">{b}</td>
                  <td className="px-4 py-3 text-gray-700">{c}</td>
                </tr>
              ))}
              <tr className="align-top">
                <td className="px-4 py-3 font-semibold text-[#0b1a24]">Вартість</td>
                <td className="px-4 py-3 text-gray-700">
                  {femProf ? `${fmt(femProf.price_discount)} грн замість ${fmt(femProf.price_regular)} грн` : '—'}
                </td>
                <td className="px-4 py-3 text-gray-700">
                  {femAfter40 ? `${fmt(femAfter40.price_discount)} грн замість ${fmt(femAfter40.price_regular)} грн` : '—'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Mobile: accordion-рядки (патерн 7.3 layout-standards-v2) */}
        <div className="md:hidden bg-white border border-[#e8edf3] rounded-[10px] px-5">
          {COMPARISON_ROWS.map(([a, b, c]) => (
            <details key={a} className="border-b border-[#e8edf3]">
              <summary className="py-4 text-sm font-semibold text-[#0b1a24] cursor-pointer min-h-11 flex items-center">
                {a}
              </summary>
              <div className="pb-4 space-y-2 text-sm text-gray-700">
                <p>
                  <span className="font-semibold">Профілактичний:</span> {b}
                </p>
                <p>
                  <span className="font-semibold">Після 40:</span> {c}
                </p>
              </div>
            </details>
          ))}
          <details className="last:border-0">
            <summary className="py-4 text-sm font-semibold text-[#0b1a24] cursor-pointer min-h-11 flex items-center">
              Вартість
            </summary>
            <div className="pb-4 space-y-2 text-sm text-gray-700">
              <p>
                <span className="font-semibold">Профілактичний:</span>{' '}
                {femProf ? `${fmt(femProf.price_discount)} грн замість ${fmt(femProf.price_regular)} грн` : '—'}
              </p>
              <p>
                <span className="font-semibold">Після 40:</span>{' '}
                {femAfter40 ? `${fmt(femAfter40.price_discount)} грн замість ${fmt(femAfter40.price_regular)} грн` : '—'}
              </p>
            </div>
          </details>
        </div>
      </Section>

      {/* ── 7. Як проходить чекап ── */}
      <Section bg={BG_WHITE} eyebrow="Маршрут пацієнта">
        <H2>Як проходить жіночий чекап в ОН Клінік Харків</H2>
        <ol className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-5">
          {STEPS.map((s, i) => (
            <li
              key={s.title}
              className="flex md:block gap-3 md:bg-[#f8fafc] md:border md:border-[#e8edf3] md:rounded-[10px] px-0 md:px-5 py-2 md:py-4"
            >
              <span className="inline-flex items-center justify-center w-7 h-7 md:w-8 md:h-8 rounded-full bg-[#005485] text-white text-sm font-bold shrink-0 md:mb-3">
                {i + 1}
              </span>
              <div>
                <h3 className="text-sm md:text-base font-bold text-[#0b1a24] mb-1 md:mb-2">{s.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      {/* ── 8. Філії ── */}
      <Section bg={BG_GRAY} eyebrow="Адреси та графік">
        <H2>Де пройти жіночий чекап у Харкові</H2>
        <p className="text-gray-700 leading-relaxed max-w-3xl mt-4 mb-10">
          Обидві програми доступні в усіх трьох філіях ОН Клінік Харків. Обирайте зручну за розташуванням — склад і
          вартість однакові.
        </p>
        {/* Mobile: компактні рядки, видимі без кліку (адреси — named entities). Desktop: картки */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-5">
          {branches.map((b) => (
            <div
              key={b.id}
              className="bg-white border border-[#e8edf3] rounded-[10px] px-5 py-3 md:py-4"
            >
              <h3 className="text-sm font-bold text-[#0b1a24] md:mb-2">{b.name_ua ?? 'ОН Клінік Харків'}</h3>
              <p className="text-sm text-gray-700">
                {b.address_ua}
                {b.metro_ua && <span className="text-gray-500"> · м. {b.metro_ua}</span>}
              </p>
              {b.schedule_ua && (
                <p className="text-xs text-gray-500 mt-1 md:mt-2 whitespace-pre-line">{b.schedule_ua}</p>
              )}
            </div>
          ))}
        </div>
      </Section>

      {/* ── 9. FAQ ── */}
      <Section bg={BG_WHITE} eyebrow="Питання та відповіді">
        <H2>Часті питання про жіночий чекап</H2>
        <div className="mt-5 max-w-4xl">
          {FAQ.map((f) => (
            <details key={f.q} className="border-b border-[#e8edf3] last:border-0">
              <summary className="py-4 text-sm sm:text-base font-semibold text-[#0b1a24] cursor-pointer min-h-11 flex items-center">
                {f.q}
              </summary>
              <p className="pb-4 text-sm text-gray-700 leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
      </Section>

      {/* ── 10. Фінальний CTA (патерн "ПЕРШИЙ КРОК") ── */}
      <section style={{ backgroundColor: '#005485', borderTop: BORDER }}>
        <div className="max-w-[1200px] mx-auto px-6 lg:px-14 py-14 text-white">
          <h2
            className="font-bold mb-3"
            style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 'clamp(22px, 3vw, 30px)' }}
          >
            ПЕРШИЙ КРОК — <em className="text-[#04D3D9]">заявка на чекап</em>
          </h2>
          <p className="text-white/85 leading-relaxed max-w-2xl mb-6">
            Менеджер звʼяжеться з вами, допоможе обрати програму під ваш вік і потреби та запише на зручний час.
            Перший візит займе 2-3 години.
          </p>
          <BookCta
            sourceCta="final_cta"
            label="Залишити заявку"
            variant="hero"
            className="!bg-white !text-[#005485] hover:!bg-gray-100"
          />
        </div>
      </section>

      {/* ── 11. GEO-блок (статичний HTML, ніколи не згортати) ── */}
      <Section bg={BG_GRAY} eyebrow="Коротко про програму">
        <div className="max-w-4xl">
          <H2>Жіночий чекап в ОН Клінік Харків</H2>
          <p className="text-sm text-gray-600 leading-relaxed mt-4">
            Медичний центр «ОН Клінік Харків» проводить комплексні програми жіночого чекапу у трьох філіях: вул.
            Ярослава Мудрого, 30а (м. Ярослава Мудрого), пр. Героїв Харкова, 257 (м. Палац Спорту), вул. Молочна, 48
            (м. Левада).
            {femProf && femAfter40 && (
              <>
                {' '}Програма «Жіночий профілактичний» (18-40 років) — {fmt(femProf.price_discount)} грн замість{' '}
                {fmt(femProf.price_regular)} грн, «Жіночий після 40» — {fmt(femAfter40.price_discount)} грн замість{' '}
                {fmt(femAfter40.price_regular)} грн.
              </>
            )}
            {' '}Обстеження за два візити: консультації терапевта, акушера-гінеколога та офтальмолога, лабораторні
            аналізи у власній лабораторії «ОН Лаб», пʼять УЗД, відеокольпоскопія, ЕКГ і цифрова флюорографія; у
            програмі «після 40» додатково — гастроентеролог, невролог, проктолог, ліпідограма та коагулограма.
            Результати — за 1-2 дні в електронній медичній картці. Запис — через форму заявки на цій сторінці.
          </p>
        </div>
      </Section>

      {/* ── 12. E-E-A-T (компактна, py-12) ── */}
      <section style={{ backgroundColor: BG_WHITE, borderTop: BORDER }}>
        <div className="max-w-[1200px] mx-auto px-6 lg:px-14 py-12">
          <div className="max-w-4xl text-xs text-gray-500 leading-relaxed">
            <p>
              <strong className="text-gray-700">Автор:</strong> Ігор Растрепін, засновник check-up.in.ua
            </p>
            <p className="mt-1">
              <strong className="text-gray-700">Опубліковано:</strong> 11.06.2026 ·{' '}
              <strong className="text-gray-700">Оновлено:</strong> 11.06.2026
            </p>
            <p className="mt-1">
              <strong className="text-gray-700">Джерела:</strong> Mayo Clinic Family Health Book, 5th Edition (2018) —
              Chapter 7 «Staying Healthy» (pp. 210-221: скринінги, частота оглядів), Chapter 15 (p. 385-386), Chapter
              33 «Womenʼs Health» (p. 535); Стандарт медичної допомоги МОЗ України «Лейоміома матки» (2023) —
              розд. II, п. 3 (щорічний гінекологічний огляд, критерії якості).
            </p>
            <p className="mt-3">
              check-up.in.ua — медичний маркетплейс. Ми отримуємо комісію від клінік-партнерів. Це не впливає на
              зміст: усі медичні дані перевірені рецензентом.
            </p>
          </div>
        </div>
      </section>

      {/* Booking modal host */}
      {clinicId && (
        <BookingFlow
          programs={programs}
          branches={branches.map(({ id, address_ua, metro_ua }) => ({ id, address_ua, metro_ua }))}
          clinicId={clinicId}
          clinicSlug={CLINIC_SLUG}
          city={CITY_SLUG}
        />
      )}
    </main>
  );
}
