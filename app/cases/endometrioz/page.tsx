import type { Metadata } from 'next';
import { type ReactNode } from 'react';
import Script from 'next/script';
import Link from 'next/link';

import MedicalHero from '@/components/hub/MedicalHero';
import QuizEndometrioz from '@/components/endometrioz/QuizEndometrioz';
import GeoBlock from '@/components/hub/GeoBlock';
import Disclaimer from '@/components/shared/Disclaimer';
import StickyMobileCTA from '@/components/shared/StickyMobileCTA';
import LeadForm from '@/components/shared/LeadForm';

// ─── Metadata ────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: 'Ендометріоз — методи лікування, клініки та ціни в Україні | check-up.in.ua',
  description:
    'Ендометріоз: коли медикаменти, коли операція, як зберегти фертильність. Лапароскопія, гормональна терапія, IVF. Клініки в Рівному, Харкові та інших містах. Рецензовано акушером-гінекологом.',
  alternates: {
    canonical: 'https://check-up.in.ua/cases/endometrioz',
  },
  openGraph: {
    title: 'Ендометріоз — методи лікування, клініки та ціни в Україні | check-up.in.ua',
    description:
      'Порівняння методів лікування ендометріозу, ціни, клініки у містах України. Рецензовано акушером-гінекологом.',
    url: 'https://check-up.in.ua/cases/endometrioz',
    locale: 'uk_UA',
    type: 'article',
  },
  robots: {
    index: true,
    follow: true,
  },
};

// ─── Schema.org JSON-LD ──────────────────────────────────────────────────────

const schemaJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'MedicalWebPage',
      '@id': 'https://check-up.in.ua/cases/endometrioz#webpage',
      url: 'https://check-up.in.ua/cases/endometrioz',
      name: 'Ендометріоз — методи лікування, клініки та ціни в Україні',
      description:
        'Повна інформація про ендометріоз: симптоми, методи лікування, ціни, клініки та лікарі в Україні.',
      dateModified: '2026-04-17',
      inLanguage: 'uk',
      publisher: {
        '@type': 'Organization',
        name: 'check-up.in.ua',
        url: 'https://check-up.in.ua',
      },
      author: {
        '@type': 'Person',
        name: 'Ігор Растрепін',
        jobTitle: 'Медичний редактор check-up.in.ua',
      },
      reviewedBy: {
        '@type': 'Physician',
        name: 'Трохимович Руслана Миколаївна',
        description: 'Акушер-гінеколог, вища категорія, 26 років досвіду',
      },
      about: {
        '@type': 'MedicalCondition',
        name: 'Ендометріоз',
        alternateName: 'Endometriosis',
        code: {
          '@type': 'MedicalCode',
          code: 'N80',
          codingSystem: 'ICD-10',
        },
        relevantSpecialty: 'Obstetrics',
      },
      medicalAudience: {
        '@type': 'MedicalAudience',
        audienceType: 'Patient',
      },
    },
    {
      '@type': 'FAQPage',
      '@id': 'https://check-up.in.ua/cases/endometrioz#faq',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Чи може ендометріоз перейти в рак?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Ризик розвитку раку яєчників при ендометріозі дещо вищий, але в абсолютних числах залишається невисоким. Сам ендометріоз — не передраковий стан [ESHRE].',
          },
        },
        {
          '@type': 'Question',
          name: 'Чи можна завагітніти при ендометріозі?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Так, у багатьох випадках. Близько половини жінок з ендометріозом мають проблеми з природним зачаттям, але інша половина вагітніє без додаткових втручань [ESHRE].',
          },
        },
        {
          '@type': 'Question',
          name: 'Чи зникне ендометріоз після менопаузи?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'У більшості випадків так — після природної менопаузи симптоми поступово зникають через зниження рівня естрогену [Mayo Clinic].',
          },
        },
      ],
    },
  ],
};

// ─── Static data ─────────────────────────────────────────────────────────────

// TODO: replace with Supabase when tables are ready
const STATS = {
  clinics_count: 10,
  cities_count: 6,
  doctors_count: 22,
};

const METHODS_TABLE = [
  { name: 'Гормональна терапія (КОК, прогестини)', invasiveness: 'Неінвазивне', duration: 'Тривала, роками', fertility: 'Заблокована', priceFrom: 'від 800 грн/міс' },
  { name: 'ВМС з прогестероном', invasiveness: 'Мінімальна', duration: 'До 5 років', fertility: 'Заблокована', priceFrom: 'від 8 000 грн' },
  { name: 'ГнРГ-агоністи', invasiveness: 'Неінвазивне', duration: 'До 6 місяців', fertility: 'Заблокована', priceFrom: 'від 4 000 грн/міс' },
  { name: 'Лапароскопія консервативна', invasiveness: 'Мала (3-4 проколи)', duration: 'Одноразово', fertility: 'Збережена', priceFrom: 'від 40 000 грн' },
  { name: 'Гістеректомія', invasiveness: 'Різна', duration: 'Одноразово, остаточна', fertility: 'Втрачена', priceFrom: 'від 45 000 грн' },
  { name: 'IVF (при безплідді)', invasiveness: 'Мінімальна', duration: 'Цикли 4-6 тижнів', fertility: '—', priceFrom: 'від 90 000 грн/цикл' },
];

const PRIVATE_PRICES = [
  { method: 'Гормональна терапія (місяць)', priceFrom: 'від 800 грн' },
  { method: 'ВМС з прогестероном', priceFrom: 'від 8 000 грн' },
  { method: 'Лапароскопія консервативна', priceFrom: 'від 40 000 грн' },
  { method: 'Лапароскопія складна (з резекцією)', priceFrom: 'від 80 000 грн' },
  { method: 'Гістеректомія', priceFrom: 'від 45 000 грн' },
  { method: 'IVF (один цикл)', priceFrom: 'від 90 000 грн' },
];

const DOCTORS = [
  {
    id: 'trokhymovych-endo',
    name: 'Трохимович Руслана Миколаївна',
    specialty: 'Акушер-гінеколог',
    category: 'вища категорія',
    experience_years: 26,
    operations_count: 180,
    operations_label: 'операцій з ендометріозу',
    city: 'Рівне',
    clinic: 'РОКЛ',
    methods: ['Лапароскопія консервативна', 'Гормональна терапія'],
    profile_url: 'https://rokl.check-up.in.ua/doctors/trokhymovych-ruslana?case=endometrioz',
  },
  {
    id: 'doctor-kharkiv-endo',
    name: 'Афанасьєв [ПІБ уточнити]', // TODO: замінити на повне ПІБ
    specialty: 'Акушер-гінеколог',
    category: null as string | null,
    experience_years: null as number | null,
    operations_count: null as number | null,
    operations_label: null as string | null,
    city: 'Харків',
    clinic: 'ON Clinic',
    methods: ['Лапароскопія консервативна'],
    profile_url: 'https://onclinic.check-up.in.ua/kharkiv/doctors/afanasiev?case=endometrioz',
  },
];

const FAQ_ITEMS = [
  {
    id: 'e-faq-1',
    q: 'Чи може ендометріоз перейти в рак?',
    a: 'Ризик розвитку раку яєчників у жінок з ендометріозом дещо вищий, ніж у популяції в цілому, але залишається невисоким в абсолютних числах. Сам ендометріоз — не передраковий стан. Регулярний контроль і своєчасне лікування ендометріом значно знижують цей ризик [ESHRE].',
  },
  {
    id: 'e-faq-2',
    q: 'Чи можна завагітніти при ендометріозі?',
    a: 'Так, у багатьох випадках. Близько половини жінок з ендометріозом мають проблеми з природним зачаттям, але інша половина вагітніє без додаткових втручань. Якщо вагітність не настає протягом 6-12 місяців спроб — варто звернутись до репродуктолога. Лапароскопія часто покращує шанси, IVF — наступний крок при невдачі [ESHRE].',
  },
  {
    id: 'e-faq-3',
    q: 'Чи зникне ендометріоз після менопаузи?',
    a: 'У більшості випадків так — після природної менопаузи симптоми поступово зникають, бо ендометріоїдні осередки втрачають естрогенову підтримку. Виняток — жінки на замісній гормональній терапії та дуже глибокий інфільтративний ендометріоз [Mayo Clinic].',
  },
  {
    id: 'e-faq-4',
    q: 'Чи погіршиться ендометріоз після припинення гормональної терапії?',
    a: 'Гормональна терапія контролює активність осередків, але не видаляє їх. Після припинення симптоми поступово повертаються — це не "погіршення від гормонів", а повернення до природного перебігу хвороби. Тому корисно мати чіткий план після відміни терапії.',
  },
  {
    id: 'e-faq-5',
    q: 'Чи допоможе лапароскопія при проблемах з зачаттям?',
    a: 'При ендометріоз-асоційованому безплідді консервативна лапароскопія може покращити шанси природного зачаття, особливо при стадіях I-II. При тяжчих стадіях часто рекомендують IVF. Конкретна стратегія залежить від вашого віку, стадії та інших факторів — визначає репродуктолог [ESHRE].',
  },
  {
    id: 'e-faq-6',
    q: 'Скільки триває реабілітація після лапароскопії з ендометріозу?',
    a: 'При консервативній лапароскопії — повернення до звичайної активності через 21 день. При складніших операціях (з резекцією органів) — до 4-6 тижнів. Точний термін визначає лікар на контрольному огляді.',
  },
  {
    id: 'e-faq-7',
    q: 'Чи може ендометріоз повернутись після операції?',
    a: 'Так. Навіть після успішної операції ендометріоз може повернутись через кілька років. За даними досліджень, рецидив протягом 5 років буває у 20-50% випадків. Тому після лапароскопії часто рекомендують гормональну підтримку для зниження ризику рецидиву.',
  },
  {
    id: 'e-faq-8',
    q: 'Чи правда, що ендометріоз не діагностують роками?',
    a: 'Так, середня затримка з моменту перших симптомів до встановлення діагнозу — 7-10 років [ESHRE]. Болісні місячні часто сприймаються як "норма", а надійне підтвердження потребує лапароскопії з біопсією. При стійких симптомах варто наполягати на обстеженні та, за потреби, отримати другу думку.',
  },
];

const SOURCES_ENDO = [
  'Mayo Clinic Family Health Book (розділ Endometriosis)',
  'ESHRE Guideline on the Management of Endometriosis (2022)',
  'ACOG Practice Bulletin #114 — Management of Endometriosis',
  'МОЗ України — Уніфікований клінічний протокол з ендометріозу',
  'StatPearls — Endometriosis (останнє оновлення 2024)',
  'IQWiG — Patient Decision Aid: Endometriosis',
];


// ─── Facts ────────────────────────────────────────────────────────────────────

const FACTS_ENDO = [
  { number: '1 з 10', label: 'жінок репродуктивного віку має ендометріоз', source: 'ESHRE' },
  { number: '2', label: 'базові підходи: гормональна терапія та лапароскопія' },
  { number: '10', label: 'клінік у 6 містах України' },
  { number: '22', label: 'лікарі з профільним досвідом' },
];

// ─── Page ────────────────────────────────────────────────────────────────────

export default function EndometriozPage() {
  return (
    <>
      <Script
        id="schema-endometrioz-hub"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaJsonLd) }}
      />

      <main>
        {/* 1. HERO */}
        <MedicalHero
          diagnosisLabel="Ендометріоз"
          eyebrow="Гінекологія · Поширений діагноз"
          h1="Ендометріоз — методи лікування, клініки та ціни в Україні"
          h1Em="ціни"
          lead="Розбираємось крок за кроком: чим відрізняється медикаментозний шлях від хірургічного, коли важлива швидкість, як ендометріоз впливає на можливість завагітніти. На основі Mayo Clinic, рекомендацій ESHRE та рецензії акушера-гінеколога."
          primaryHref="#lead-form"
          secondaryHref="#methods"
          facts={FACTS_ENDO}
          headingId="endo-h1"
        />

        {/* 2. ORIENTATION BLOCK */}
        <section className="px-4 pt-16 md:pt-24 lg:pt-32 pb-12 md:pb-16 bg-white" aria-labelledby="endo-orientation-heading">
          <div className="max-w-7xl mx-auto">
            <h2 id="endo-orientation-heading" className="font-display font-bold text-[22px] md:text-[26px] text-text-primary mb-4 md:mb-5 tracking-tight">
              Ваш вік впливає на пріоритети
            </h2>
            <p className="text-[14px] text-gray-600 mb-5 leading-relaxed">
              Ендометріоз прогресує з часом і досягає піку у репродуктивному віці. Стратегія лікування
              дуже різна для жінки 25, 38 та 47 років. Оберіть свою вікову групу.
            </p>

            {/* Desktop: 3 cards; Mobile: accordion */}
            <div className="hidden md:grid md:grid-cols-3 md:gap-6">
              {[
                {
                  label: '20–35 років',
                  subtitle: 'Фертильність як визначальний фактор',
                  body: 'У цьому віці ендометріоз часто поєднує дві проблеми: біль і вплив на фертильність. Якщо плануєте вагітність — гормональна терапія не варіант (блокує овуляцію). Розглядається лапароскопія з ексцизією осередків. Після операції варто починати спроби вагітніти якнайшвидше — ендометріоз прогресує [Mayo Clinic, ESHRE].',
                  questions: ['Як саме мій ендометріоз впливає на фертильність зараз?', 'Якщо потрібна операція — як вона змінить мої шанси завагітніти?', 'Якщо не планую вагітність — який варіант гормональної терапії підходить?'],
                },
                {
                  label: '35–45 років',
                  subtitle: 'Баланс контролю симптомів та якості життя',
                  body: 'У цьому віці ендометріоз часто досягає піку інтенсивності. Якщо діти вже народжені — фокус зміщується з фертильності на контроль симптомів. Гормональна терапія залишається першою лінією, ВМС з прогестероном — довгостроковий інструмент. Лапароскопія — при болі, що не реагує на медикаменти [ESHRE].',
                  questions: ['Чи є ознаки прогресування, які потребують активних дій?', 'Яка довгострокова стратегія: продовжувати гормони чи розглядати операцію?', 'Як планується спостереження?'],
                },
                {
                  label: '45+ років',
                  subtitle: 'Підхід до менопаузи',
                  body: 'Менопауза переважно усуває симптоми ендометріозу — без рівня естрогену осередки припиняють активність. Якщо до менопаузи 1-2 роки і симптоми терпимі — часто оптимальним є очікування. Якщо симптоми сильні або є ендометріоми — операція доцільна. Кісти яєчників у цьому віці потребують додаткового обстеження [Mayo Clinic].',
                  questions: ['Як швидко симптоми зменшаться після менопаузи?', 'Чи є ознаки, що потребують втручання незалежно від менопаузи?', 'Який план обстеження для виключення інших причин болю?'],
                },
              ].map((g) => (
                <div key={g.label} className="bg-gray-50 border border-gray-200 rounded-[10px] p-5">
                  <div className="text-[16px] font-semibold text-[#0b1a24] mb-0.5">{g.label}</div>
                  <div className="text-[12px] text-[#005485] font-medium mb-3">{g.subtitle}</div>
                  <p className="text-[14px] text-[#0b1a24] leading-relaxed mb-3">{g.body}</p>
                  <div className="bg-[#e8f4fd] border border-[#005485]/20 rounded-[8px] p-3">
                    <div className="text-[11px] font-semibold text-[#005485] mb-2 uppercase tracking-wide">Питання до лікаря</div>
                    <ul className="space-y-1.5 text-[13px] text-[#0b1a24]">
                      {g.questions.map((q) => <li key={q}>— {q}</li>)}
                    </ul>
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile accordion */}
            <OrientationAccordion />
          </div>
        </section>

        {/* 3. PATIENT PATH */}
        <section id="patient-path" className="px-4 pt-16 md:pt-24 lg:pt-32 pb-12 md:pb-16 bg-gray-50" aria-labelledby="endo-path-heading">
          <div className="max-w-4xl mx-auto">
            <h2 id="endo-path-heading" className="font-display font-bold text-[22px] md:text-[26px] text-text-primary mb-4 md:mb-5 tracking-tight">
              Маршрут після діагнозу
            </h2>
            <p className="text-[14px] text-gray-600 mb-5 leading-relaxed">
              Ендометріоз — хронічне захворювання. Лікування часто триває роками, з
              ремісіями та загостреннями. Задача — побудувати стратегію, яка відповідатиме
              вашим пріоритетам.
            </p>
            <div className="space-y-3">
              {[
                {
                  num: 1,
                  title: 'Зрозуміти стадію та поширеність',
                  summary: 'Типи, локалізація, чи уражені яєчники',
                  body: (
                    <>
                      <p className="mb-3">Ендометріоз класифікують за стадіями I-IV, але стадія не завжди корелює з інтенсивністю болю — мінімальний ендометріоз інколи дає сильніший біль, ніж глибокий інфільтративний. Важливі деталі: чи уражені яєчники (ендометріоми), чи є осередки поза органами малого тазу, чи є ознаки інфільтрації кишківника або сечового міхура.</p>
                      <div className="bg-amber-50 border border-amber-200 rounded-[8px] p-3 text-[13px] text-amber-900" role="note">
                        Стадія ендометріозу не завжди корелює з інтенсивністю болю. Тому стратегія підбирається не "за стадією", а за поєднанням стадії, симптомів та ваших пріоритетів [ESHRE].
                      </div>
                    </>
                  ),
                },
                {
                  num: 2,
                  title: 'Визначити свої пріоритети',
                  summary: '3 ключових питання для вибору між медикаментами і хірургією',
                  body: (
                    <>
                      <p className="mb-3">Вибір між медикаментозним лікуванням і хірургією — це питання пріоритетів:</p>
                      <ol className="space-y-2 text-[13px] mb-3">
                        {['Наскільки інтенсивний біль і як він впливає на повсякденне життя?', 'Чи плануєте вагітність у найближчі 1-2 роки?', 'Як ви ставитесь до тривалого прийому гормональних препаратів?'].map((q, i) => (
                          <li key={i} className="flex gap-2">
                            <span className="text-[#04D3D9] font-bold shrink-0">{i+1}.</span>
                            <span>{q}</span>
                          </li>
                        ))}
                      </ol>
                      <p className="text-[13px] text-gray-600">Якщо біль терпимий і вагітність не планується — гормональна терапія часто оптимальна. Якщо плануєте вагітність — лапароскопія доцільніша. Якщо біль сильний і не реагує на медикаменти — операція показана незалежно від планів.</p>
                    </>
                  ),
                },
                {
                  num: 3,
                  title: 'Обрати метод та клініку',
                  summary: 'Перейти до блоку Методи та квізу',
                  body: (
                    <>
                      <p className="text-[14px] mb-3">
                        Визначте який метод вам підходить. Квіз з 5 питань допоможе зорієнтуватись,
                        який з шести варіантів відповідає вашій ситуації — вік, плани на вагітність,
                        інтенсивність болю, попередня терапія.
                      </p>
                      <a href="#methods" className="inline-flex items-center gap-2 text-[14px] font-semibold text-[#005485] hover:text-[#004070] transition-colors">
                        Перейти до блоку Методи лікування
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </a>
                    </>
                  ),
                },
                {
                  num: 4,
                  title: 'Підготуватись, пройти, відновитись',
                  summary: 'Матеріали у розділі Careway',
                  body: (
                    <ul className="space-y-2">
                      {[
                        { href: '/careway/rishennya/yak-obraty-likaria', label: 'Як обрати лікаря для гінекологічної операції', soon: true },
                        { href: '/careway/rishennya/pidhotovka-do-operatsiii', label: 'Підготовка до планової гінекологічної операції', soon: true },
                        { href: '/careway/rishennya/vidnovlennya-pislia-operatsiii', label: 'Відновлення після гінекологічної операції', soon: true },
                      ].map(({ href, label, soon }) => (
                        <li key={href} className="flex items-start gap-2 text-[13px]">
                          <svg className="w-4 h-4 text-[#04D3D9] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                          </svg>
                          {soon ? (
                            <span className="text-gray-400">{label} <span className="text-[11px]">[скоро]</span></span>
                          ) : (
                            <a href={href} className="text-[#005485] hover:underline">{label}</a>
                          )}
                        </li>
                      ))}
                    </ul>
                  ),
                },
              ].map((step) => (
                <StepAccordion key={step.num} num={step.num} title={step.title} summary={step.summary}>
                  {step.body}
                </StepAccordion>
              ))}
            </div>
          </div>
        </section>

        {/* 4+5. Symptoms + When to act — 2 cols on desktop */}
        <div className="pt-16 md:pt-24 lg:pt-32 md:grid md:grid-cols-2 md:max-w-7xl md:mx-auto">
          {/* 4. Symptoms */}
          <section className="px-4 py-8 bg-white h-full" aria-labelledby="endo-symptoms-heading">
            <div className="max-w-2xl mx-auto md:max-w-none">
              <h2 id="endo-symptoms-heading" className="font-display font-bold text-[22px] md:text-[26px] text-text-primary mb-4 md:mb-5 tracking-tight">
                Симптоми — коли потрібне лікування
              </h2>
              <div className="text-[14px] text-[#0b1a24] leading-relaxed space-y-3 mt-4">
                <p>Ендометріоз має кілька типових проявів, але ключове — як вони впливають на ваше життя. Той самий "біль під час місячних" може бути терпимим для однієї жінки і повністю виключати іншу — і друге означає, що лікування потрібне.</p>
                <p>Найчастіший симптом — <strong>дисменорея</strong>, тобто болісні місячні. При ендометріозі цей біль прогресує: посилюється з роками, починається за день-два до менструації, гірше реагує на знеболювальні. Середня затримка діагнозу — 7-10 років через те, що жінки звикають терпіти [ESHRE].</p>
                <p><strong>Хронічний тазовий біль поза менструацією</strong>, <strong>біль під час статевого акту</strong> (диспареунія) — характерні для ендометріозу, особливо при ураженні дугласового простору.</p>
                <p><strong>Проблеми із зачаттям</strong> — у 30-50% жінок з ендометріозом [ESHRE]. Іноді саме це і стає причиною першого звернення.</p>
              </div>
              <div className="mt-4">
                <Link href="/careway/simptomy/bil-pid-chas-statevoho-aktu" className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#005485] hover:underline">
                  Детальніше: Біль під час статевого акту
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
              <div className="mt-5 bg-red-50 border border-red-200 rounded-[10px] p-4" role="alert" aria-label="Невідкладна ситуація">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-4 h-4 text-red-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span className="text-[13px] font-bold text-red-700 uppercase tracking-wide">Червоні прапорці — невідкладно</span>
                </div>
                <p className="text-[13px] text-red-800 leading-relaxed">
                  Гострий, раптовий біль внизу живота з нудотою або блюванням — можливий розрив ендометріоми. Це стан, що потребує <strong>негайної медичної допомоги: швидка, не плановий запис</strong>. <span className="text-red-600">[Mayo Clinic]</span>
                </p>
              </div>
            </div>
          </section>

          {/* 5. When to act */}
          <section className="px-4 py-8 bg-gray-50 h-full" aria-labelledby="endo-when-heading">
            <div className="max-w-2xl mx-auto md:max-w-none">
              <h2 id="endo-when-heading" className="font-display font-bold text-[22px] md:text-[26px] text-text-primary mb-4 md:mb-5 tracking-tight">
                Медикаменти достатньо, а коли потрібна операція
              </h2>
              <p className="text-[14px] text-gray-600 leading-relaxed mb-4">
                При ендометріозі питання не "лікувати чи спостерігати", а "чи можна обмежитись медикаментами, чи доцільна операція".
              </p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2">
                <div className="bg-green-50 border border-green-200 rounded-[10px] p-4">
                  <div className="text-[13px] font-bold text-green-700 uppercase tracking-wide mb-3">Медикаменти зазвичай, якщо:</div>
                  <ul className="space-y-1.5 text-[13px] text-green-900">
                    {['Біль помірний і реагує на гормони', 'Не плануєте вагітність найближчим часом', 'Немає ендометріом >4 см', 'Немає глибокого інфільтративного ендометріозу'].map((item) => (
                      <li key={item} className="flex items-start gap-1.5">
                        <svg className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-[10px] p-4">
                  <div className="text-[13px] font-bold text-orange-700 uppercase tracking-wide mb-3">Операція доцільна, якщо:</div>
                  <ul className="space-y-1.5 text-[13px] text-orange-900">
                    {['Біль сильний і не реагує на медикаменти', 'Плануєте вагітність (гормони блокують овуляцію)', 'Є ендометріоми >4 см', 'Підозрюється глибокий інфільтративний ендометріоз'].map((item) => (
                      <li key={item} className="flex items-start gap-1.5">
                        <svg className="w-3.5 h-3.5 text-orange-500 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <blockquote className="mt-4 border-l-4 border-[#04D3D9] pl-4 text-[13px] text-gray-600 italic">
                Гістеректомія при ендометріозі — це не "перша лінія". Її розглядають як останній засіб у тяжких випадках, коли інші методи не дали результату і жінка не планує вагітність [Mayo Clinic].
              </blockquote>
            </div>
          </section>
        </div>

        {/* 6. METHODS */}
        <section id="methods" className="px-4 pt-16 md:pt-24 lg:pt-32 pb-12 md:pb-16 bg-white" aria-labelledby="endo-methods-heading">
          <div className="max-w-7xl mx-auto">
            <h2 id="endo-methods-heading" className="font-display font-bold text-[22px] md:text-[26px] text-text-primary mb-4 md:mb-5 tracking-tight">
              Методи лікування
            </h2>
            <p className="text-[14px] md:text-lg text-[#4a5a6b] mb-8 md:mb-10 leading-relaxed">
              При ендометріозі основних підходів менше, ніж при міомі — але всередині кожного є нюанси.
            </p>

            {/* Comparison table */}
            <div className="mt-4 overflow-x-auto md:overflow-x-visible -mx-4 px-4 md:mx-0 md:px-0">
              <table className="w-full min-w-[600px] md:min-w-0 text-[13px] border-collapse">
                <thead>
                  <tr className="bg-[#005485] text-white">
                    <th className="text-left px-3 py-2.5 font-semibold rounded-tl-[8px]">Метод</th>
                    <th className="text-left px-3 py-2.5 font-semibold">Тривалість</th>
                    <th className="text-left px-3 py-2.5 font-semibold">Фертильність</th>
                    <th className="text-left px-3 py-2.5 font-semibold rounded-tr-[8px]">Ціна від</th>
                  </tr>
                </thead>
                <tbody>
                  {METHODS_TABLE.map((m, i) => (
                    <tr key={m.name} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-3 py-2.5 font-medium text-[#0b1a24]">{m.name}</td>
                      <td className="px-3 py-2.5 text-gray-600">{m.duration}</td>
                      <td className="px-3 py-2.5">
                        <span className={`inline-block text-[11px] px-2 py-0.5 rounded-full font-medium ${
                          m.fertility === 'Збережена' ? 'bg-green-100 text-green-700'
                          : m.fertility === 'Заблокована' ? 'bg-amber-100 text-amber-700'
                          : m.fertility === 'Втрачена' ? 'bg-red-100 text-red-700'
                          : 'bg-gray-100 text-gray-600'
                        }`}>{m.fertility}</span>
                      </td>
                      <td className="px-3 py-2.5 text-[#005485] font-semibold">{m.priceFrom}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-[11px] text-gray-400 mt-2 px-1">* Гіпотетичні ціни — TODO: замінити фактичними з Supabase</p>
            </div>

            {/* Method cards — 2 cols md, 3 cols lg */}
            <div className="mt-6 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-5 space-y-3 md:space-y-0">
              {[
                {
                  id: 'endo-hormonal',
                  title: 'Гормональна терапія',
                  badge: 'Перша лінія',
                  badgeColor: 'bg-green-100 text-green-700',
                  body: 'Усі гормональні препарати стабілізують або знижують рівень естрогену. Без цього "палива" осередки перестають кровоточити циклічно, біль зменшується. КОК, прогестини, ВМС з прогестероном (до 5 років, локальна дія), ГнРГ-агоністи (до 6 місяців, "виключають" яєчники, дають 45% зменшення). Головне обмеження: після припинення симптоми повертаються, а вагітність під час терапії неможлива.',
                },
                {
                  id: 'endo-laparo',
                  title: 'Лапароскопія консервативна',
                  badge: 'Стандарт при болі та безплідді',
                  badgeColor: 'bg-teal-100 text-teal-700',
                  body: 'Через 3-4 невеликі проколи хірург видаляє ендометріоїдні осередки, спайки, ендометріоми — зі збереженням репродуктивних органів. Єдиний 100% надійний спосіб підтвердження діагнозу з біопсією. Після операції рекомендують плануючим вагітність — намагатись завагітніти якнайшвидше [Mayo Clinic].',
                },
                {
                  id: 'endo-hysterectomy',
                  title: 'Гістеректомія',
                  badge: 'Крайній засіб',
                  badgeColor: 'bg-gray-100 text-gray-600',
                  body: 'Повне видалення матки — не перша лінія при ендометріозі. Розглядається у тяжких випадках при відсутності планів на вагітність, коли інші методи не дали результату. При ендометріозі потребує одночасної ексцизії всіх осередків — це складніша операція, ніж при інших показаннях [Mayo Clinic].',
                },
                {
                  id: 'endo-ivf',
                  title: 'IVF при ендометріоз-асоційованому безплідді',
                  badge: 'Репродуктивна медицина',
                  badgeColor: 'bg-purple-100 text-purple-700',
                  body: 'Якщо ендометріоз спричинив безпліддя і хірургія не відновила природну вагітність — IVF. Рекомендований ESHRE при стадіях III-IV або після невдачі після операції. Дає змогу обійти ураження труб та спайки. Не альтернатива лікуванню ендометріозу — окремий шлях до вагітності.',
                },
              ].map((m) => (
                <div key={m.id} className="bg-white border border-gray-200 rounded-[10px] p-4">
                  <div className="flex items-center gap-2 flex-wrap mb-3">
                    <span className="text-[15px] font-semibold text-[#0b1a24]">{m.title}</span>
                    <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${m.badgeColor}`}>{m.badge}</span>
                  </div>
                  <p className="text-[13px] text-[#0b1a24] leading-relaxed">{m.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 7. QUIZ */}
        <div className="pt-16 md:pt-24 lg:pt-32"><QuizEndometrioz /></div>

        {/* 8. PRICING */}
        <section className="px-4 pt-16 md:pt-24 lg:pt-32 pb-12 md:pb-16 bg-white" aria-labelledby="endo-pricing-heading">
          <div className="max-w-7xl mx-auto">
            <h2 id="endo-pricing-heading" className="font-display font-bold text-[22px] md:text-[26px] text-text-primary mb-4 md:mb-5 tracking-tight">
              Вартість лікування
            </h2>
            <p className="text-[14px] text-gray-600 leading-relaxed mb-6">
              Ціни у приватних клініках залежать від методу, клініки, типу анестезії та обсягу
              операції. Нижче — орієнтовні ціни квітня 2026 року для основних методів.
            </p>

            {/* Pricing table — full width */}
            <div className="overflow-x-auto -mx-4 px-4 mb-6">
              <table className="w-full text-[13px] border-collapse min-w-[320px]">
                <thead>
                  <tr className="bg-[#005485] text-white">
                    <th className="text-left px-3 py-2.5 font-semibold rounded-tl-[8px]">Метод</th>
                    <th className="text-left px-3 py-2.5 font-semibold rounded-tr-[8px]">Ціна від</th>
                  </tr>
                </thead>
                <tbody>
                  {PRIVATE_PRICES.map((p, i) => (
                    <tr key={p.method} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-3 py-2.5 text-[#0b1a24]">{p.method}</td>
                      <td className="px-3 py-2.5 text-[#005485] font-semibold">{p.priceFrom}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-[11px] text-gray-400 mt-1.5 px-1">* Гіпотетичні ціни — TODO: замінити фактичними з Supabase</p>
            </div>

            {/* Included / Not included — 2 symmetric columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-green-50 border border-green-200 rounded-[10px] p-4">
                <div className="text-[12px] font-bold text-green-700 mb-2 uppercase tracking-wide">
                  Зазвичай входить
                </div>
                <ul className="space-y-1.5 text-[12px] text-green-900">
                  {["Сама операція", "Анестезія", "Стаціонар (1–3 доби)", "Перев'язки та виписка", "Контрольний огляд через місяць"].map((item) => (
                    <li key={item} className="flex items-start gap-1.5">
                      <span className="text-green-500 mt-0.5 shrink-0">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-[10px] p-4">
                <div className="text-[12px] font-bold text-red-700 mb-2 uppercase tracking-wide">
                  Зазвичай НЕ входить
                </div>
                <ul className="space-y-1.5 text-[12px] text-red-900">
                  {['Передопераційне обстеження (1 500–2 500 грн)', 'Медикаменти для домашнього прийому', 'Додаткова гістопатологія'].map((item) => (
                    <li key={item} className="flex items-start gap-1.5">
                      <span className="text-red-400 mt-0.5 shrink-0">×</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* 9. CLINICS */}
        <section className="px-4 pt-16 md:pt-24 lg:pt-32 pb-12 md:pb-16 bg-gray-50" aria-labelledby="endo-clinics-heading">
          <div className="max-w-7xl mx-auto">
            <h2 id="endo-clinics-heading" className="font-display font-bold text-[22px] md:text-[26px] text-text-primary mb-4 md:mb-5 tracking-tight">
              Клініки по містах
            </h2>
            <p className="text-[13px] text-gray-500 mb-4">
              Оберіть своє місто, щоб побачити партнерську клініку та доступні методи.
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-[10px] p-4">
              <p className="text-[13px] text-amber-900 mb-3">
                Міста з партнерськими клініками: Рівне (РОКЛ), Харків (ON Clinic). У вашому місті поки немає партнера — запишіться на онлайн-консультацію.
              </p>
              <p className="text-[11px] text-amber-600 mb-3">* TODO: замінити інтерактивним ClinicCitySelector з даними Supabase для ендометріозу</p>
              <a href="#lead-form" className="inline-block px-4 py-2.5 bg-[#005485] text-white text-[13px] font-semibold rounded-[10px] hover:bg-[#004070] transition-colors">
                Онлайн-консультація
              </a>
            </div>
          </div>
        </section>

        {/* 10. DOCTORS */}
        <section className="px-4 pt-16 md:pt-24 lg:pt-32 pb-12 md:pb-16 bg-white" aria-labelledby="endo-doctors-heading">
          <div className="max-w-7xl mx-auto">
            <h2 id="endo-doctors-heading" className="font-display font-bold text-[22px] md:text-[26px] text-text-primary mb-4 md:mb-5 tracking-tight">
              Лікарі по методах
            </h2>
            <p className="text-[13px] text-gray-500 mb-4">
              При ендометріозі — особливо при глибокому інфільтративному — досвід хірурга має критичне значення.
            </p>
            <div className="space-y-3 md:grid md:grid-cols-3 lg:grid-cols-4 md:gap-4 md:space-y-0">
              {DOCTORS.map((doctor) => {
                const initials = doctor.name.split(' ').slice(0,2).map((w) => w[0]).join('');
                return (
                  <div key={doctor.id} className="bg-white border border-gray-200 rounded-[10px] p-4 flex gap-3">
                    <div className="w-[52px] h-[52px] rounded-full bg-[#005485] flex items-center justify-center text-white font-bold text-[16px] shrink-0">
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[15px] font-bold text-[#0b1a24] leading-snug">{doctor.name}</div>
                      <div className="text-[12px] text-gray-500 mb-2">
                        {doctor.specialty}{doctor.category ? `, ${doctor.category}` : ''}
                      </div>
                      {doctor.experience_years && (
                        <div className="text-[12px] text-gray-600 mb-1">
                          Досвід: <strong>{doctor.experience_years} р.</strong>
                        </div>
                      )}
                      {doctor.operations_count && (
                        <div className="text-[12px] text-gray-600 mb-1">
                          <strong>{doctor.operations_count}+</strong> {doctor.operations_label}
                        </div>
                      )}
                      <div className="text-[12px] text-gray-500 mb-2">{doctor.city} · {doctor.clinic}</div>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {doctor.methods.map((m) => (
                          <span key={m} className="bg-gray-100 text-gray-600 text-[11px] px-2 py-0.5 rounded-full">{m}</span>
                        ))}
                      </div>
                      {doctor.profile_url ? (
                        <a href={doctor.profile_url} target="_blank" rel="noopener noreferrer" className="text-[12px] text-[#005485] font-semibold hover:underline">
                          Повний профіль →
                        </a>
                      ) : (
                        <span className="text-[12px] text-gray-300">Профіль — TODO</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-[11px] text-gray-400 mt-3">* TODO: замінити фактичними даними лікарів з Supabase</p>
          </div>
        </section>

        {/* 11. FAQ */}
        <section className="px-4 pt-16 md:pt-24 lg:pt-32 pb-8 md:pb-10 bg-gray-50" aria-labelledby="endo-faq-heading" itemScope itemType="https://schema.org/FAQPage">
          <div className="max-w-3xl mx-auto">
            <h2 id="endo-faq-heading" className="font-display font-bold text-[22px] md:text-[26px] text-text-primary mb-4 md:mb-5 tracking-tight">
              Питання та відповіді
            </h2>
            <FaqAccordionEndo items={FAQ_ITEMS} />
          </div>
        </section>

        {/* 12. GEO */}
        <section className="px-4 pt-16 md:pt-24 lg:pt-32 pb-8 bg-white" aria-labelledby="endo-geo-heading">
          <div className="max-w-3xl mx-auto">
            <h2 id="endo-geo-heading" className="text-[20px] font-bold text-[#0b1a24] mb-4">
              Лікування ендометріозу в Україні
            </h2>
            <p className="text-[14px] text-[#0b1a24] leading-relaxed">
              Платформа check-up.in.ua обʼєднує клініки-партнери з профільним досвідом у лапароскопічній
              хірургії ендометріозу, гормональній терапії та репродуктивній медицині (IVF). Клініки
              доступні у містах: Рівне, Харків та інші. У Рівному операції з ендометріозу виконує
              команда РОКЛ — провідний фахівець Трохимович Руслана Миколаївна, акушер-гінеколог вищої
              категорії з 26-річним досвідом. У Харкові — хірурги ON Clinic. Орієнтовна вартість
              консервативної лапароскопії від 40 000 грн. Для міст без партнера доступна
              онлайн-консультація. Редактор контенту — Ігор Растрепін. Рецензент — Трохимович Руслана
              Миколаївна.
            </p>
            <p className="text-[11px] text-gray-400 mt-2">* TODO: замінити гіпотетичні дані фактичними з Supabase</p>
          </div>
        </section>

        {/* 13. E-E-A-T */}
        <section className="px-4 pt-16 md:pt-24 lg:pt-32 pb-8 bg-gray-50" aria-labelledby="endo-eeat-heading">
          <div className="max-w-7xl mx-auto">
            <h2 id="endo-eeat-heading" className="text-[18px] font-bold text-[#0b1a24] mb-4">Про матеріал</h2>
            <div className="md:grid md:grid-cols-2 md:gap-8 md:items-start">
              {/* Left */}
              <div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 mb-5">
                  <div className="bg-white border border-gray-200 rounded-[10px] p-3.5" itemScope itemType="https://schema.org/Person">
                    <div className="text-[11px] text-gray-400 uppercase tracking-wide mb-1">Автор</div>
                    <div className="text-[14px] font-bold text-[#0b1a24]" itemProp="name">Ігор Растрепін</div>
                    <div className="text-[12px] text-gray-500" itemProp="jobTitle">Медичний редактор check-up.in.ua</div>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-[10px] p-3.5" itemScope itemType="https://schema.org/Physician">
                    <div className="text-[11px] text-gray-400 uppercase tracking-wide mb-1">Рецензент</div>
                    <a href="https://rokl.check-up.in.ua/doctors/trokhymovych-ruslana?case=endometrioz" target="_blank" rel="noopener noreferrer" className="text-[14px] font-bold text-[#005485] hover:underline" itemProp="name">
                      Трохимович Руслана Миколаївна →
                    </a>
                    <div className="text-[12px] text-gray-500" itemProp="description">Акушер-гінеколог, вища категорія, 26 років досвіду</div>
                  </div>
                </div>
                <blockquote className="bg-white border-l-4 border-[#04D3D9] rounded-r-[10px] p-4 mb-5">
                  <p className="text-[14px] text-[#0b1a24] leading-relaxed italic mb-2">
                    &ldquo;Ендометріоз — хвороба, з якою живуть роками. Ключове — не одна операція чи один рецепт, а довгострокова стратегія, узгоджена з пацієнткою. Кожен наступний крок ми обговорюємо разом, з повним розумінням наслідків.&rdquo;
                  </p>
                  <footer className="text-[12px] text-gray-500">— Трохимович Р.М.</footer>
                  <p className="text-[11px] text-gray-400 mt-1">* TODO: підтвердити цитату з рецензентом</p>
                </blockquote>
                <p className="text-[12px] text-gray-500 mb-4">
                  Останнє оновлення: <time dateTime="2026-04-17">квітень 2026</time>
                </p>
              </div>

              {/* Right */}
              <div>
                <div className="mb-4">
                  <div className="text-[12px] font-semibold text-gray-600 uppercase tracking-wide mb-2">Методологія</div>
                  <p className="text-[13px] text-gray-600 leading-relaxed">
                    Матеріал підготовлений на основі Mayo Clinic Family Health Book, ESHRE Guideline on Endometriosis (2022), ACOG Practice Bulletin #114, IQWiG Patient Decision Aid, МОЗ України Уніфікований клінічний протокол, StatPearls. Принципи подачі — за стандартами shared decision-making (NHS, IQWiG).
                  </p>
                </div>
                <div>
                  <div className="text-[12px] font-semibold text-gray-600 uppercase tracking-wide mb-2">Джерела</div>
                  <ul className="space-y-1">
                    {SOURCES_ENDO.map((src) => (
                      <li key={src} className="text-[12px] text-gray-600 flex items-start gap-1.5">
                        <span className="text-[#04D3D9] shrink-0 mt-0.5">›</span>
                        {src}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Disclaimer */}
        <div className="px-4 pb-8 bg-gray-50">
          <div className="max-w-3xl mx-auto">
            <Disclaimer />
          </div>
        </div>

        {/* Lead form */}
        <section id="lead-form" className="px-4 pt-16 md:pt-24 pb-16 md:pb-24 bg-white border-t border-gray-100" aria-label="Форма запису на консультацію">
          <div className="max-w-[480px] mx-auto">
            <h2 className="text-[20px] font-bold text-[#0b1a24] mb-1">Записатись на консультацію</h2>
            <p className="text-[13px] text-gray-500 mb-4">
              Залиште заявку — ми підберемо лікаря у вашому місті та зв&apos;яжемось для узгодження деталей.
            </p>
            <LeadForm intent="online_consultation" sourcePage="/cases/endometrioz" ctaLabel="Записатись на онлайн-консультацію" />
          </div>
        </section>

        {/* 14. Related links */}
        <section className="px-4 py-8 bg-white border-t border-gray-100" aria-labelledby="endo-related-heading">
          <div className="max-w-3xl mx-auto">
            <h2 id="endo-related-heading" className="text-[18px] font-bold text-[#0b1a24] mb-4">Пов&apos;язані матеріали</h2>
            <div className="space-y-2">
              {[
                { href: '/careway/simptomy/bil-pid-chas-statevoho-aktu', label: 'Біль під час статевого акту — що це може бути', soon: false },
                { href: '/careway/simptomy/ryasni-misyachni', label: 'Рясні місячні — що це може бути', soon: false },
                { href: '/cases/mioma-matky', label: 'Міома матки — методи лікування, клініки, ціни', soon: false },
                { href: '#', label: 'Проблеми із зачаттям — план дій', soon: true },
                { href: '#', label: 'Медикаменти чи операція?', soon: true },
                { href: '/careway/dzherela', label: 'Наші джерела та медичні стандарти', soon: false },
              ].map(({ href, label, soon }) => (
                <div key={label}>
                  {soon ? (
                    <span className="flex items-center gap-2 text-[14px] text-gray-300" aria-disabled="true">
                      <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                      {label} <span className="text-[11px]">[скоро]</span>
                    </span>
                  ) : (
                    <Link href={href} className="flex items-center gap-2 text-[14px] text-[#005485] font-medium hover:underline">
                      <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                      {label}
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Sticky CTA (mobile only) */}
        <StickyMobileCTA href="#lead-form" ctaLabel="Записатись на консультацію" />
      </main>
    </>
  );
}

// ─── Sub-components (server-side accordion helpers using native details/summary) ──

function OrientationAccordion() {
  // This is a server component page — inline accordions use details/summary
  const groups = [
    {
      id: 'endo-20-35',
      label: '20–35 років',
      subtitle: 'Фертильність як визначальний фактор',
      body: 'У цьому віці ендометріоз часто поєднує дві проблеми: біль і вплив на фертильність. Якщо плануєте вагітність — гормональна терапія не варіант. Розглядається лапароскопія з ексцизією. Після операції варто починати спроби завагітніти якнайшвидше [Mayo Clinic, ESHRE].',
      questions: ['Як мій ендометріоз впливає на фертильність зараз?', 'Якщо потрібна операція — як вона змінить мої шанси?', 'Якщо не планую вагітність — який варіант гормональної терапії підходить?'],
    },
    {
      id: 'endo-35-45',
      label: '35–45 років',
      subtitle: 'Баланс контролю симптомів та якості життя',
      body: 'У цьому віці ендометріоз часто досягає піку. Якщо діти народжені — фокус на контроль симптомів. Гормональна терапія залишається першою лінією, ВМС з прогестероном — довгостроковий інструмент. Лапароскопія — при болі, що не реагує на медикаменти [ESHRE].',
      questions: ['Чи є ознаки прогресування?', 'Яка довгострокова стратегія?', 'Як планується спостереження?'],
    },
    {
      id: 'endo-45plus',
      label: '45+ років',
      subtitle: 'Підхід до менопаузи',
      body: 'Менопауза переважно усуває симптоми. Якщо до менопаузи 1-2 роки і симптоми терпимі — часто оптимальним є очікування. Кісти яєчників у цьому віці потребують додаткового обстеження для виключення малігнізації [Mayo Clinic].',
      questions: ['Як швидко симптоми зменшаться?', 'Чи є ознаки, що потребують втручання?', 'Який план для виключення інших причин болю?'],
    },
  ];

  return (
    <div className="md:hidden space-y-2">
      {groups.map((g) => (
        <details key={g.id} className="bg-gray-50 border border-gray-200 rounded-[10px] overflow-hidden" open={g.id === 'endo-20-35'}>
          <summary className="flex items-center justify-between gap-3 p-4 cursor-pointer list-none">
            <div>
              <div className="text-[15px] font-semibold text-[#0b1a24]">{g.label}</div>
              <div className="text-[12px] text-gray-500 mt-0.5">{g.subtitle}</div>
            </div>
            <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </summary>
          <div className="px-4 pb-4 border-t border-gray-200">
            <p className="pt-3 text-[14px] text-[#0b1a24] leading-relaxed mb-3">{g.body}</p>
            <div className="bg-[#e8f4fd] border border-[#005485]/20 rounded-[8px] p-3">
              <div className="text-[11px] font-semibold text-[#005485] mb-2 uppercase tracking-wide">Питання до лікаря</div>
              <ul className="space-y-1 text-[13px] text-[#0b1a24]">
                {g.questions.map((q) => <li key={q}>— {q}</li>)}
              </ul>
            </div>
          </div>
        </details>
      ))}
    </div>
  );
}

function StepAccordion({ num, title, summary, children }: { num: number; title: string; summary: string; children: ReactNode }) {
  return (
    <details className="bg-white border border-gray-200 rounded-[10px] overflow-hidden">
      <summary className="flex items-center gap-3 p-4 cursor-pointer list-none">
        <div className="step-num shrink-0 text-white font-bold text-[14px] flex items-center justify-center">{num}</div>
        <div className="flex-1 min-w-0">
          <div className="text-[15px] font-semibold text-[#0b1a24]">{title}</div>
          <div className="text-[12px] text-gray-500 mt-0.5">{summary}</div>
        </div>
        <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </summary>
      <div className="px-4 pb-4 border-t border-gray-100">
        <div className="pt-3 text-[14px] text-[#0b1a24] leading-relaxed">{children}</div>
      </div>
    </details>
  );
}

function FaqAccordionEndo({ items }: { items: { id: string; q: string; a: string }[] }) {
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <details
          key={item.id}
          className="bg-white border border-gray-200 rounded-[10px] overflow-hidden"
          itemScope
          itemProp="mainEntity"
          itemType="https://schema.org/Question"
        >
          <summary className="flex items-center gap-3 p-4 cursor-pointer list-none" itemProp="name">
            <div className="flex-1 text-[15px] font-semibold text-[#0b1a24]">{item.q}</div>
            <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </summary>
          <div className="px-4 pb-4 border-t border-gray-100" itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
            <p className="pt-3 text-[14px] text-[#0b1a24] leading-relaxed" itemProp="text">{item.a}</p>
          </div>
        </details>
      ))}
    </div>
  );
}
