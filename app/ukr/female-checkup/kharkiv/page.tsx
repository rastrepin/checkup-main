import type { Metadata } from 'next';
import Link from 'next/link';
import { db } from '@/lib/supabase';
import type { CheckupProgram } from '@/lib/types';
import Accordion from '@/components/shared/Accordion';
import BookingFlow, { BookCta, type BranchLite } from '@/components/city/BookingFlow';

export const revalidate = 3600;

const CLINIC_SLUG = 'onclinic-kharkiv';
const CITY_SLUG = 'kharkiv';
const PAGE_URL = 'https://check-up.in.ua/ukr/female-checkup/kharkiv';

// Канонічні slug — нові (pislya). Старий slug (pislia) у запиті — перехідний,
// до pre-merge міграції rename (див. DATABASE.md, розділ "Критичні", п.2).
const SLUG_PROF = 'zhinochyi-profilaktychnyi';
const SLUG_AFTER40 = 'zhinochyi-pislya-40';
const SLUG_AFTER40_LEGACY = 'zhinochyi-pislia-40';

const SUBDOMAIN_BASE = 'https://onclinic.check-up.in.ua/kharkiv/checkup';

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
    const { data: clinic } = await sb
      .from('clinics')
      .select('id')
      .eq('slug', CLINIC_SLUG)
      .single();
    if (!clinic?.id) return { clinicId: null, femProf: null, femAfter40: null, branches: [] };

    const [{ data: programs }, { data: branches }] = await Promise.all([
      sb
        .from('checkup_programs')
        .select('*')
        .eq('clinic_id', clinic.id)
        .eq('is_active', true)
        .in('slug', [SLUG_PROF, SLUG_AFTER40, SLUG_AFTER40_LEGACY]),
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
      femAfter40: list.find((p) => p.slug === SLUG_AFTER40 || p.slug === SLUG_AFTER40_LEGACY) ?? null,
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

const FAQ = [
  {
    q: 'З якого віку і як часто проходити чекап?',
    a: 'Профілактичне обстеження рекомендується проходити раз на рік починаючи з 18 років. Програма «Жіночий профілактичний» розрахована на вік 18-40 років, «Жіночий після 40» — на жінок від 40 років з урахуванням вікових ризиків.',
  },
  {
    q: 'Чим відрізняються дві програми?',
    a: 'Програма «після 40» додає до базового складу консультації гастроентеролога, невролога і проктолога, а також ліпідограму, коагулограму й тест на Helicobacter pylori. Жіночий блок (ПАП-тест, УЗД молочних залоз, кольпоскопія) однаковий в обох програмах.',
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
    q: 'Чи можна додати до програми інші дослідження?',
    a: 'Так. Якщо у вас є конкретні скарги, хронічні захворювання або спадкові ризики, програму можна розширити окремими аналізами чи консультаціями. Рекомендуємо приймати це рішення разом із лікарем на першій консультації — так додаткові дослідження будуть обґрунтованими, а не випадковими.',
  },
  {
    q: 'У якій філії можна пройти програму?',
    a: 'У будь-якій з трьох філій ОН Клінік Харків: вул. Ярослава Мудрого, 30а, пр. Героїв Харкова, 257 або вул. Молочна, 48. Усі філії розташовані біля станцій метро.',
  },
];

const SCREENING_CARDS = [
  {
    title: "Репродуктивне здоров'я",
    text: 'Огляд акушера-гінеколога, ПАП-тест (скринінг раку шийки матки), відеокольпоскопія та УЗД органів малого таза. ПЛР-дослідження виявляє 11 збудників урогенітальних інфекцій, включно з ВПЛ 16 і 18 типів — основною причиною раку шийки матки.',
  },
  {
    title: 'Молочні залози',
    text: 'УЗД молочних залоз з доплерометрією та оцінкою регіонарних лімфовузлів. До 40 років УЗД — основний метод скринінгу: тканина залози щільніша, і ультразвук інформативніший за мамографію.',
  },
  {
    title: 'Щитоподібна залоза та гормони',
    text: 'УЗД щитоподібної залози з доплерометрією і тиреоїдна панель (ТТГ, Т4 вільний, Т3 вільний, АТ ТПО). Порушення роботи щитоподібної залози у жінок трапляються у 5-8 разів частіше, ніж у чоловіків, і часто маскуються під втому чи коливання ваги. Додатково — вітамін D, дефіцит якого поширений у більшості дорослих.',
  },
  {
    title: 'Базовий контроль організму',
    text: 'Клінічний і біохімічний аналізи крові, аналіз сечі, ЕКГ, УЗД органів черевної порожнини та сечовидільної системи, цифрова флюорографія, перевірка зору з консультацією офтальмолога.',
  },
];

const AFTER40_ITEMS = [
  {
    title: 'Серце та судини.',
    text: 'Ліпідограма показує рівень холестерину і ризик атеросклерозу, коагулограма — схильність до тромбозів. Обидва дослідження виявляють ризики до появи симптомів.',
  },
  {
    title: 'Травна система.',
    text: "Консультація гастроентеролога та аналіз на Helicobacter pylori — бактерію, що пов'язана з гастритом, виразковою хворобою та раком шлунка.",
  },
  {
    title: 'Неврологічний огляд.',
    text: 'Консультація невролога — оцінка судинних ризиків мозку, якості сну, головного болю.',
  },
  {
    title: 'Огляд проктолога.',
    text: 'Скринінговий огляд для раннього виявлення захворювань прямої кишки, актуальність якого після 40 років зростає.',
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
      lastReviewed: '2026-06-10',
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
    <main className="bg-[#fdfbf7] text-[#0b1a24]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="text-xs text-gray-500 mb-6">
          <Link href="/" className="hover:underline">check-up.in.ua</Link>
          <span className="mx-1.5">/</span>
          <Link href="/ukr/kharkiv" className="hover:underline">Check-up у Харкові</Link>
          <span className="mx-1.5">/</span>
          <span className="text-gray-700">Жіночий чекап</span>
        </nav>

        {/* ── 2. Hero ── */}
        <section className="mb-14">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#005485] mb-3">
            Чекап-програми · ОН Клінік Харків
          </p>
          <h1
            className="text-3xl sm:text-5xl font-bold leading-tight mb-5"
            style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
          >
            Жіночий чекап у <em className="text-[#005485]">Харкові</em>
          </h1>
          <p className="text-base sm:text-lg text-gray-700 leading-relaxed max-w-3xl mb-7">
            ОН Клінік Харків проводить дві комплексні програми жіночого чекапу: «Жіночий профілактичний» для віку
            18-40 років і «Жіночий після 40» з розширеною серцево-судинною діагностикою та онкоскринінгом.
            Обстеження проходить за два візити в будь-якій з трьох філій біля метро.
            {femProf && (
              <>
                {' '}Вартість — від {fmt(femProf.price_discount)} грн замість {fmt(femProf.price_regular)} грн.
              </>
            )}
            {' '}Програму та додаткові дослідження допоможе підібрати терапевт на першій консультації.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mb-9">
            <BookCta sourceCta="hero" label="Записатися на чекап →" variant="hero" />
            <a
              href="#programs"
              className="inline-flex items-center justify-center min-h-12 px-7 rounded-[10px] border border-[#005485] text-[#005485] font-semibold text-base hover:bg-[#f4f9fb] transition-colors"
            >
              Програми ↓
            </a>
          </div>
          {/* Рядок метрик */}
          <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { v: '2', l: 'програми за віком' },
              { v: '3', l: 'філії біля метро' },
              { v: '2', l: 'візити до клініки' },
              { v: femProf ? `від ${fmt(femProf.price_discount)} грн` : '—', l: 'вартість програми' },
            ].map((m) => (
              <div key={m.l} className="border-l-2 border-[#04D3D9] pl-3">
                <dt className="sr-only">{m.l}</dt>
                <dd>
                  <span className="block text-xl font-bold">{m.v}</span>
                  <span className="block text-xs text-gray-500 mt-0.5">{m.l}</span>
                </dd>
              </div>
            ))}
          </dl>
        </section>

        {/* ── 3. Що перевіряти жінці в будь-якому віці ── */}
        <section className="mb-14">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            Що варто перевіряти жінці щороку — незалежно від віку
          </h2>
          <p className="text-gray-700 leading-relaxed max-w-3xl mb-7">
            Більшість захворювань, які впливають на жіноче здоров&apos;я, на ранній стадії не мають симптомів.
            Щорічне профілактичне обстеження дозволяє виявити зміни тоді, коли їх найпростіше скоригувати.
            Базовий набір досліджень однаковий для будь-якого віку — відрізняється лише глибина перевірки
            окремих систем.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {SCREENING_CARDS.map((c) => (
              <div key={c.title} className="bg-white border border-gray-200 rounded-[10px] p-5">
                <h3 className="text-base font-bold mb-2">{c.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{c.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── 4. Що додається після 40 ── */}
        <section className="mb-14">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Що змінюється після 40 років</h2>
          <p className="text-gray-700 leading-relaxed max-w-3xl mb-6">
            Після 40 років зростають ризики серцево-судинних захворювань, хвороб травної системи та окремих
            онкологічних захворювань. Тому програма «Жіночий після 40» розширює базовий чекап додатковими
            консультаціями та лабораторними дослідженнями.
          </p>
          <ul className="space-y-4 max-w-3xl mb-6">
            {AFTER40_ITEMS.map((i) => (
              <li key={i.title} className="flex gap-3">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#04D3D9] shrink-0" aria-hidden="true" />
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                  <strong className="text-[#0b1a24]">{i.title}</strong> {i.text}
                </p>
              </li>
            ))}
          </ul>
          <p className="text-sm text-gray-600 leading-relaxed max-w-3xl bg-white border border-gray-200 rounded-[10px] p-5">
            Якщо у вас є спадкова схильність до серцево-судинних захворювань, підвищений тиск, задишка чи
            дискомфорт у грудях при навантаженні — в ОН Клінік Харків доступна окрема програма «Кардіологічний
            чекап» з УЗД серця та дуплексним скануванням судин голови і шиї. Розповісти про неї детальніше та
            оцінити доцільність зможе терапевт на першій консультації.
          </p>
        </section>

        {/* ── 5. Картки програм ── */}
        <section className="mb-14 scroll-mt-20" id="programs">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Програми жіночого чекапу в ОН Клінік Харків</h2>
          <p className="text-gray-700 leading-relaxed max-w-3xl mb-7">
            Обидві програми проходять за два візити. У вартість включені всі консультації, аналізи у власній
            лабораторії «ОН Лаб» та інструментальна діагностика. Доступні в усіх трьох філіях.
          </p>
          <div className="grid sm:grid-cols-2 gap-5">
            {femProf && (
              <ProgramCard
                program={femProf}
                eyebrow="18-40 років"
                detailsSlug={SLUG_PROF}
                composition={[
                  `${femProf.consultations_count} консультації: терапевт (первинна і підсумкова), акушер-гінеколог, офтальмолог з діагностикою зору`,
                  `${femProf.analyses_count} лабораторних досліджень: клінічні аналізи, біохімія крові, ПАП-тест, ПЛР-скринінг урогенітальних інфекцій, тиреоїдна панель, вітамін D`,
                  `${femProf.diagnostics_count} інструментальних досліджень: 5 УЗД, відеокольпоскопія, ЕКГ, цифрова флюорографія`,
                ]}
              />
            )}
            {femAfter40 && (
              <ProgramCard
                program={femAfter40}
                eyebrow="від 40 років"
                detailsSlug={SLUG_AFTER40}
                composition={[
                  `${femAfter40.consultations_count} консультацій: терапевт (первинна і підсумкова), акушер-гінеколог, гастроентеролог, невролог, проктолог, офтальмолог з діагностикою зору`,
                  `${femAfter40.analyses_count} лабораторних досліджень: усе з базової програми + ліпідограма, коагулограма, тест на Helicobacter pylori`,
                  `${femAfter40.diagnostics_count} інструментальних досліджень: 5 УЗД, відеокольпоскопія, ЕКГ, цифрова флюорографія`,
                ]}
              />
            )}
          </div>
        </section>

        {/* ── 6. Порівняння програм ── */}
        <section className="mb-14">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Профілактичний чи після 40 — яку програму обрати</h2>
          <p className="text-gray-700 leading-relaxed max-w-3xl mb-7">
            Основний критерій — вік: до 40 років достатньо базової програми, після 40 додається контроль
            серцево-судинних і онкологічних ризиків. Але вік — не єдиний фактор. Якщо вам менше 40, проте є
            спадкова схильність до хвороб серця, зайва вага або хронічні скарги з боку травлення — обговоріть
            із терапевтом розширення базової програми окремими дослідженнями з програми «після 40».
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse bg-white border border-gray-200 rounded-[10px] overflow-hidden">
              <thead>
                <tr className="bg-[#f4f9fb] text-left">
                  <th className="px-4 py-3 font-semibold border-b border-gray-200">Що входить</th>
                  <th className="px-4 py-3 font-semibold border-b border-gray-200">Жіночий профілактичний</th>
                  <th className="px-4 py-3 font-semibold border-b border-gray-200">Жіночий після 40</th>
                </tr>
              </thead>
              <tbody>
                <Tr a="Вік" b="18-40 років" c="від 40 років" />
                <Tr
                  a="Консультації лікарів"
                  b="Терапевт ×2, акушер-гінеколог, офтальмолог"
                  c="Терапевт ×2, акушер-гінеколог, гастроентеролог, невролог, проктолог, офтальмолог"
                />
                <Tr
                  a="Жіноче здоров'я"
                  b="ПАП-тест, ПЛР-скринінг 11 збудників, відеокольпоскопія, УЗД малого таза і молочних залоз"
                  c="Те саме"
                />
                <Tr a="Серце та судини" b="ЕКГ" c="ЕКГ + ліпідограма + коагулограма" />
                <Tr
                  a="Травна система"
                  b="УЗД органів черевної порожнини"
                  c="УЗД + консультація гастроентеролога + тест на Helicobacter pylori"
                />
                <Tr a="Гормони та вітаміни" b="Тиреоїдна панель, вітамін D" c="Тиреоїдна панель, вітамін D" />
                <Tr
                  a="Вартість"
                  b={femProf ? `${fmt(femProf.price_discount)} грн замість ${fmt(femProf.price_regular)} грн` : '—'}
                  c={femAfter40 ? `${fmt(femAfter40.price_discount)} грн замість ${fmt(femAfter40.price_regular)} грн` : '—'}
                />
              </tbody>
            </table>
          </div>
        </section>

        {/* ── 7. Як проходить чекап ── */}
        <section className="mb-14">
          <h2 className="text-2xl sm:text-3xl font-bold mb-7">Як проходить жіночий чекап в ОН Клінік Харків</h2>
          <ol className="grid sm:grid-cols-2 gap-4">
            {STEPS.map((s, i) => (
              <li key={s.title} className="bg-white border border-gray-200 rounded-[10px] p-5">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#005485] text-white text-sm font-bold mb-3">
                  {i + 1}
                </span>
                <h3 className="text-base font-bold mb-2">{s.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{s.text}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* ── 8. Філії ── */}
        <section className="mb-14">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Де пройти жіночий чекап у Харкові</h2>
          <p className="text-gray-700 leading-relaxed max-w-3xl mb-7">
            Обидві програми доступні в усіх трьох філіях ОН Клінік Харків. Обирайте зручну за розташуванням —
            склад і вартість однакові.
          </p>
          <div className="grid sm:grid-cols-3 gap-4">
            {branches.map((b) => (
              <div key={b.id} className="bg-white border border-gray-200 rounded-[10px] p-5">
                <h3 className="text-sm font-bold mb-2">{b.name_ua ?? `ОН Клінік Харків`}</h3>
                <p className="text-sm text-gray-700">
                  {b.address_ua}
                  {b.metro_ua && <span className="text-gray-500"> · м. {b.metro_ua}</span>}
                </p>
                {b.schedule_ua && <p className="text-xs text-gray-500 mt-2 whitespace-pre-line">{b.schedule_ua}</p>}
              </div>
            ))}
          </div>
        </section>

        {/* ── 9. FAQ ── */}
        <section className="mb-14">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6">Часті питання про жіночий чекап</h2>
          <Accordion
            single
            items={FAQ.map((f, i) => ({
              id: String(i),
              title: f.q,
              content: <p className="text-sm text-gray-700 leading-relaxed">{f.a}</p>,
            }))}
          />
        </section>

        {/* ── 10. Фінальний CTA ── */}
        <section className="mb-14 bg-[#005485] rounded-2xl p-7 sm:p-10 text-white">
          <h2
            className="text-2xl sm:text-3xl font-bold mb-3"
            style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
          >
            ПЕРШИЙ КРОК — <em className="text-[#04D3D9]">заявка на чекап</em>
          </h2>
          <p className="text-white/85 leading-relaxed max-w-2xl mb-6">
            Менеджер зв&apos;яжеться з вами, допоможе обрати програму під ваш вік і потреби та запише на зручний
            час. Перший візит займе 2-3 години.
          </p>
          <BookCta
            sourceCta="final_cta"
            label="Залишити заявку"
            variant="hero"
            className="!bg-white !text-[#005485] hover:!bg-gray-100"
          />
        </section>

        {/* ── 11. GEO-блок (статичний HTML, ціни SSR) ── */}
        <section className="mb-14">
          <h2 className="text-xl font-bold mb-3">Жіночий чекап в ОН Клінік Харків</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Медичний центр «ОН Клінік Харків» проводить комплексні програми жіночого чекапу у трьох філіях:
            вул. Ярослава Мудрого, 30а (м. Ярослава Мудрого), пр. Героїв Харкова, 257 (м. Палац Спорту),
            вул. Молочна, 48 (м. Левада).
            {femProf && femAfter40 && (
              <>
                {' '}Програма «Жіночий профілактичний» (18-40 років) — {fmt(femProf.price_discount)} грн замість{' '}
                {fmt(femProf.price_regular)} грн, «Жіночий після 40» — {fmt(femAfter40.price_discount)} грн замість{' '}
                {fmt(femAfter40.price_regular)} грн.
              </>
            )}
            {' '}Обстеження за два візити: консультації терапевта, акушера-гінеколога та офтальмолога, лабораторні
            аналізи у власній лабораторії «ОН Лаб», п&apos;ять УЗД, відеокольпоскопія, ЕКГ і цифрова флюорографія;
            у програмі «після 40» додатково — гастроентеролог, невролог, проктолог, ліпідограма та коагулограма.
            Результати — за 1-2 дні в електронній медичній картці. Запис — через форму заявки на цій сторінці.
          </p>
        </section>

        {/* ── 12. E-E-A-T ── */}
        <section className="border-t border-gray-200 pt-6 text-xs text-gray-500 leading-relaxed">
          <p>
            <strong className="text-gray-700">Автор:</strong> Ігор Растрепін, засновник check-up.in.ua
          </p>
          <p className="mt-1">
            <strong className="text-gray-700">Опубліковано:</strong> 10.06.2026 ·{' '}
            <strong className="text-gray-700">Оновлено:</strong> 10.06.2026
          </p>
          <p className="mt-1">
            <strong className="text-gray-700">Джерела:</strong> Mayo Clinic Family Health Book, 5th Edition —
            розділи про профілактичні обстеження та жіноче здоров&apos;я
          </p>
          <p className="mt-3">
            check-up.in.ua — медичний маркетплейс. Ми отримуємо комісію від клінік-партнерів. Це не впливає на
            зміст: усі медичні дані перевірені рецензентом.
          </p>
        </section>
      </div>

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

function Tr({ a, b, c }: { a: string; b: string; c: string }) {
  return (
    <tr className="border-b border-gray-100 last:border-0 align-top">
      <td className="px-4 py-3 font-semibold text-[#0b1a24]">{a}</td>
      <td className="px-4 py-3 text-gray-700">{b}</td>
      <td className="px-4 py-3 text-gray-700">{c}</td>
    </tr>
  );
}

function ProgramCard({
  program,
  eyebrow,
  detailsSlug,
  composition,
}: {
  program: CheckupProgram;
  eyebrow: string;
  detailsSlug: string;
  composition: string[];
}) {
  const pct = discountPct(program);
  return (
    <article className="bg-white border border-gray-200 rounded-[10px] p-6 flex flex-col">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#e8f4fd] text-[#005485]">{eyebrow}</span>
        {pct > 0 && (
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#04D3D9]/15 text-[#007a7e]">
            −{pct}%
          </span>
        )}
      </div>
      <h3 className="text-lg font-bold mb-3">{program.name_ua}</h3>
      <ul className="space-y-2 mb-5 flex-1">
        {composition.map((line) => (
          <li key={line} className="flex gap-2 text-sm text-gray-600 leading-relaxed">
            <span className="mt-2 w-1 h-1 rounded-full bg-[#04D3D9] shrink-0" aria-hidden="true" />
            {line}
          </li>
        ))}
      </ul>
      <div className="flex items-baseline gap-2 mb-4">
        <span className="text-2xl font-bold">{fmt(program.price_discount)} грн</span>
        <span className="text-sm text-gray-400 line-through">{fmt(program.price_regular)} грн</span>
      </div>
      <BookCta programSlug={program.slug} sourceCta={`program_card_${detailsSlug}`} label="Записатися" />
      <a href={`${SUBDOMAIN_BASE}/${detailsSlug}`} className="block text-center text-sm text-[#005485] mt-3 hover:underline">
        Детальніше про програму →
      </a>
    </article>
  );
}
