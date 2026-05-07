import type { Metadata } from 'next';
import SystemsToggle from '@/components/program-page/SystemsToggle';
import StickyBar from '@/components/program-page/StickyBar';
import UniversalClinicOffers from '@/components/program-page/UniversalClinicOffers';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Універсальний чек-ап організму — check-up.in.ua',
  description:
    'Базове обстеження для чоловіків і жінок будь-якого віку. ЕКГ, УЗД щитоподібки, ОЧП, нирок + ключові аналізи. Запис у клініках України.',
  alternates: {
    canonical: 'https://check-up.in.ua/ukr/special-checkup/universal',
  },
};

// ─── Static data ────────────────────────────────────────────────────────────

const ANALYSES_COUNT = 6;
const DIAGNOSTICS_COUNT = 3;

const systems = [
  {
    name: 'Серцево-судинна система',
    why: 'Базова кардіодіагностика виявляє порушення ритму та оцінює ризик атеросклерозу — основних причин серцевих катастроф.',
    items: [
      'Вимірювання артеріального тиску',
      'ЕКГ з описом',
      'Загальний холестерин',
    ],
  },
  {
    name: 'Ендокринна система',
    why: 'Порушення щитоподібної залози часто перебігають безсимптомно, а підвищена глюкоза — ранній маркер діабету.',
    items: [
      'УЗД щитоподібної залози',
      'ТТГ (тиреотропний гормон)',
      'Глюкоза крові',
    ],
  },
  {
    name: 'ШКТ та сечовидільна система',
    why: 'УЗД дає швидкий огляд стану печінки, жовчного, підшлункової та нирок. Біохімія підтверджує функцію цих органів.',
    items: [
      'УЗД органів черевної порожнини',
      'УЗД нирок',
      'Печінкові проби: АЛТ, білірубін загальний',
      'Креатинін (нирковий тест)',
    ],
  },
  {
    name: 'Загальне обстеження',
    why: '',
    items: [
      'Клінічний аналіз крові з лейкоформулою (5DIFF)',
      'Консультація терапевта з оглядом',
    ],
  },
];

const analyses = [
  'Клінічний аналіз крові з лейкоформулою (5DIFF)',
  'Глюкоза крові',
  'Загальний холестерин',
  'ТТГ (тиреотропний гормон)',
  'Печінкові проби: АЛТ, білірубін загальний',
  'Креатинін',
];

const preparation = [
  'За 24 години: без алкоголю та інтенсивних навантажень',
  'За 8 годин: без їжі (натщесерце)',
  'Виключіть продукти, що викликають метеоризм',
  'Візьміть: паспорт, попередні результати, список ліків',
];

const recommendedAfter = [
  'Поглиблене обстеження за статтю та віком (повний чекап)',
  'Консультацію профільного спеціаліста при відхиленнях',
  'Гінекологічний огляд (для жінок)',
  'Скринінг простати — PSA (для чоловіків від 50)',
  'Маммографію (для жінок від 50)',
  'Колоноскопію (для всіх від 50)',
  'Щорічний чекап',
];

const faq = [
  {
    q: 'Чим ця програма відрізняється від повного чекапу?',
    a: 'Універсальна програма — це базовий мінімум, однаковий для чоловіків і жінок. Повний чекап враховує стать і вік: містить гінекологічний/урологічний огляд, онкоскринінги (мазки, УЗД молочних залоз, PSA), розширену кардіодіагностику після 50.',
  },
  {
    q: 'Чи замінює універсальний чекап повне обстеження?',
    a: 'Ні. Це швидка перевірка ключових маркерів — щоб прийти до терапевта з готовою картиною. Для повноцінної профілактики раз на рік потрібен профільний чекап за статтю та віком.',
  },
  {
    q: 'Чи підходить програма як подарунок?',
    a: 'Так. Програма універсальна — без гендерних та вікових обмежень, без інвазивних процедур. Це коректний і змістовний подарунок будь-кому.',
  },
  {
    q: 'Як часто проходити?',
    a: 'Щорічно — якщо це ваш базовий формат скринінгу. Якщо ви робите повний чекап раз на рік — універсальна програма не потрібна.',
  },
];

const sources = [
  'УКПМД «Цукровий діабет 2 типу», МОЗ України',
  'Стандарти медичної допомоги «Хронічна хвороба нирок», МОЗ України',
  'Клінічна настанова «Профілактика ССЗ», МОЗ №564, 2016',
  'ADA Standards of Care in Diabetes, 2024',
];

// ─── Schema.org ──────────────────────────────────────────────────────────────

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Головна', item: 'https://check-up.in.ua/' },
    { '@type': 'ListItem', position: 2, name: 'Програми', item: 'https://check-up.in.ua/ukr' },
    { '@type': 'ListItem', position: 3, name: 'Універсальний чек-ап організму', item: 'https://check-up.in.ua/ukr/special-checkup/universal' },
  ],
};

const medicalSchema = {
  '@context': 'https://schema.org',
  '@type': 'MedicalProcedure',
  name: 'Універсальний чек-ап організму',
  description:
    'Базове комплексне обстеження для чоловіків і жінок будь-якого віку: ЕКГ, УЗД щитоподібки, ОЧП, нирок, ключові аналізи та консультація терапевта.',
  procedureType: 'https://health-lifesci.schema.org/PhysicalExam',
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faq.map(item => ({
    '@type': 'Question',
    name: item.q,
    acceptedAnswer: { '@type': 'Answer', text: item.a },
  })),
};

// ─── Page ────────────────────────────────────────────────────────────────────

export default function UniversalCheckupPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(medicalSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <main className="max-w-3xl mx-auto px-4 pt-6 pb-24">

        {/* ── Breadcrumbs ──────────────────────────────────────────────── */}
        <nav className="text-xs text-gray-500 mb-4" aria-label="breadcrumb">
          <a href="/" className="hover:underline">Головна</a>
          {' → '}
          <a href="/ukr" className="hover:underline">Програми</a>
          {' → '}
          <span className="text-gray-800">Універсальний чек-ап організму</span>
        </nav>

        {/* ── Badge + H1 ───────────────────────────────────────────────── */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[var(--navy)] text-white rounded-full text-xs font-semibold mb-4">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Стандарт check-up.in.ua
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-1">
          Універсальний чек-ап організму
        </h1>
        <div className="h-0.5 w-16 bg-[var(--teal)] mb-4" />

        <p className="text-[var(--text-secondary)] leading-relaxed mb-6">
          Базова комплексна діагностика для обох статей: кардіодіагностика, УЗД щитоподібної залози,
          органів черевної порожнини та нирок, ключові лабораторні маркери та консультація терапевта.
        </p>

        {/* ── Meta pills ───────────────────────────────────────────────── */}
        <div className="flex flex-wrap gap-2 mb-8">
          <span className="bg-gray-100 rounded-full px-3 py-1 text-sm text-gray-700">2 візити</span>
          <span className="bg-gray-100 rounded-full px-3 py-1 text-sm text-gray-700">{ANALYSES_COUNT} аналізів</span>
          <span className="bg-gray-100 rounded-full px-3 py-1 text-sm text-gray-700">{DIAGNOSTICS_COUNT} УЗД/діагн.</span>
          <span className="bg-gray-100 rounded-full px-3 py-1 text-sm text-gray-700">Візит 1: ~2 год</span>
          <span className="bg-[var(--teal-soft)] border border-[var(--teal)] rounded-full px-3 py-1 text-sm text-[var(--navy)]">
            терапевт
          </span>
          <span className="bg-gray-100 rounded-full px-3 py-1 text-sm text-gray-700">18+</span>
          <span className="bg-gray-100 rounded-full px-3 py-1 text-sm text-gray-700">чоловіки та жінки</span>
        </div>

        {/* ── Для кого ─────────────────────────────────────────────────── */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-3">Для кого ця програма</h2>
          <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-3">
            Програма підходить, якщо ви:
          </p>
          <ul className="space-y-1.5 mb-5">
            {[
              'Хочете прийти до терапевта з готовою картиною ключових маркерів',
              'Не маєте конкретних скарг, але хочете перевірити основні системи',
              'Не любите здавати "зайвого" — лише базове і доказове',
              'Шукаєте подарунок, що підійде будь-кому: програма універсальна для обох статей і не прив\'язана до віку',
            ].map((item, i) => (
              <li key={i} className="flex gap-2 text-sm text-[var(--text-secondary)]">
                <span className="text-[var(--teal)] shrink-0 mt-0.5">✓</span>
                {item}
              </li>
            ))}
          </ul>

          {/* ── Info-box "Важливо" ──────────────────────────────────────── */}
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 space-y-3">
            <p className="text-sm font-semibold text-[var(--navy)] flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Важливо знати перед записом
            </p>
            <div className="text-sm text-[var(--text-secondary)] space-y-2">
              <p>
                Програма <strong className="text-[var(--text-primary)]">не містить гінекологічного огляду</strong>.
                Якщо ви жінка — переконайтесь, що регулярно (щонайменше раз на рік) проходите огляд гінеколога окремо.
              </p>
              <a
                href="/ukr/female-checkup"
                className="inline-flex items-center gap-1 text-[var(--navy)] font-semibold hover:underline text-sm"
              >
                Повне обстеження для жінок →
              </a>
            </div>
            <div className="text-sm text-[var(--text-secondary)] space-y-2 pt-1 border-t border-blue-200">
              <p>
                Програма <strong className="text-[var(--text-primary)]">не містить урологічного огляду та PSA</strong>.
                Якщо ви чоловік від 50 років — врахуйте, що скринінг раку простати потребує окремих досліджень.
              </p>
              <a
                href="/ukr/male-checkup/first-checkup-over-50"
                className="inline-flex items-center gap-1 text-[var(--navy)] font-semibold hover:underline text-sm"
              >
                Повне обстеження для чоловіків після 50 →
              </a>
            </div>
          </div>
        </section>

        {/* ── План візитів ─────────────────────────────────────────────── */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">План візитів</h2>
          <div className="space-y-4">
            {[
              {
                num: 1,
                label: 'Візит 1 · ранок, до 2 годин · натщесерце',
                detail: 'Забір крові, ЕКГ, УЗД щитоподібної залози, органів черевної порожнини та нирок.',
              },
              {
                num: 2,
                label: 'Візит 2 · через 2–3 дні, до 30 хвилин',
                detail: 'Терапевт аналізує результати, оцінює основні маркери здоров\'я та надає рекомендації.',
              },
            ].map(step => (
              <div key={step.num} className="flex gap-4">
                <div className="shrink-0 w-8 h-8 rounded-full bg-[var(--teal)] flex items-center justify-center text-white font-bold text-sm">
                  {step.num}
                </div>
                <div>
                  <p className="font-medium text-[var(--text-primary)] text-sm">{step.label}</p>
                  <p className="text-[var(--text-secondary)] text-sm leading-relaxed">{step.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Системи організму ────────────────────────────────────────── */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Склад програми по системах</h2>
          <SystemsToggle systems={systems} />
        </section>

        {/* ── Перелік аналізів ─────────────────────────────────────────── */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
            Перелік досліджень ({ANALYSES_COUNT + DIAGNOSTICS_COUNT})
          </h2>
          <ul className="space-y-2 mb-4 list-none">
            {analyses.map((item, i) => (
              <li key={i} className="flex gap-3 text-sm text-gray-700">
                <span className="text-[var(--navy)] font-bold text-xs shrink-0 w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* ── Підготовка ───────────────────────────────────────────────── */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-3">Підготовка до обстеження</h2>
          <ul className="space-y-2">
            {preparation.map((item, i) => (
              <li key={i} className="flex gap-2 text-sm text-[var(--text-secondary)]">
                <span className="text-[var(--teal)] mt-0.5 shrink-0">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* ── Що може рекомендувати лікар ──────────────────────────────── */}
        <section className="mb-8 bg-gray-50 rounded-xl p-5">
          <h2 className="text-base font-semibold text-[var(--text-primary)] mb-3">
            Що може рекомендувати лікар
          </h2>
          <ul className="space-y-1.5">
            {recommendedAfter.map((item, i) => (
              <li key={i} className="text-sm text-[var(--text-secondary)] flex gap-2">
                <span className="text-gray-400 shrink-0">→</span>
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* ── Clinic offers (client) ────────────────────────────────────── */}
        <UniversalClinicOffers />

        {/* ── Подарунок ────────────────────────────────────────────────── */}
        <section className="mb-8 rounded-xl border border-[var(--teal)] bg-[var(--teal-soft)] p-5">
          <div className="flex items-start gap-3">
            <span className="text-2xl" aria-hidden>🎁</span>
            <div>
              <h2 className="text-base font-semibold text-[var(--navy)] mb-1">
                Як подарунок
              </h2>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                Програма універсальна — підходить чоловікам і жінкам будь-якого віку.
                Це базовий комплекс, який не викликає дискомфорту і має чітку цінність:
                турбота про здоров'я близької людини.
              </p>
            </div>
          </div>
        </section>

        {/* ── Суміжні програми ─────────────────────────────────────────── */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Суміжні програми</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-semibold text-[var(--text-primary)] mb-2">Для жінок</p>
              <ul className="space-y-1.5">
                {[
                  { label: 'Повне обстеження до 30', href: '/ukr/female-checkup/first-checkup-under-30' },
                  { label: 'Повне обстеження 30–40', href: '/ukr/female-checkup/first-checkup-30-40' },
                  { label: 'Повне обстеження 40–50', href: '/ukr/female-checkup/first-checkup-40-50' },
                  { label: 'Повне обстеження 50+', href: '/ukr/female-checkup/first-checkup-over-50' },
                ].map(l => (
                  <li key={l.href}>
                    <a href={l.href} className="text-sm text-[var(--navy)] hover:underline">
                      {l.label} →
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--text-primary)] mb-2">Для чоловіків</p>
              <ul className="space-y-1.5">
                {[
                  { label: 'Повне обстеження до 30', href: '/ukr/male-checkup/first-checkup-under-30' },
                  { label: 'Повне обстеження 30–40', href: '/ukr/male-checkup/first-checkup-30-40' },
                  { label: 'Повне обстеження 40–50', href: '/ukr/male-checkup/first-checkup-40-50' },
                  { label: 'Повне обстеження 50+', href: '/ukr/male-checkup/first-checkup-over-50' },
                ].map(l => (
                  <li key={l.href}>
                    <a href={l.href} className="text-sm text-[var(--navy)] hover:underline">
                      {l.label} →
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────────────────────────── */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Часті запитання</h2>
          <div className="space-y-3">
            {faq.map((item, i) => (
              <details key={i} className="group border border-gray-200 rounded-lg">
                <summary className="flex items-center justify-between px-4 py-3 cursor-pointer text-sm font-medium text-[var(--text-primary)] list-none">
                  {item.q}
                  <svg
                    className="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform shrink-0 ml-2"
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <p className="px-4 pb-3 text-sm text-[var(--text-secondary)] leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* ── GEO block (статичний HTML для SEO) ───────────────────────── */}
        <section className="mb-8 text-sm text-[var(--text-secondary)] bg-gray-50 rounded-xl p-5">
          <p className="mb-2 font-medium text-[var(--text-primary)]">Програма доступна в містах:</p>
          <ul className="flex flex-wrap gap-x-4 gap-y-1">
            <li>
              <a href="/ukr/kharkiv#universal" className="text-[var(--navy)] hover:underline">Харків</a>
            </li>
            <li>
              <a href="/ukr/rivne#universal" className="text-[var(--navy)] hover:underline">Рівне</a>
            </li>
          </ul>
          <p className="mt-3 text-xs text-gray-400">
            Оберіть місто вище, щоб побачити клініки та ціни.
          </p>
        </section>

        {/* ── Джерела ──────────────────────────────────────────────────── */}
        <section className="mb-6">
          <h2 className="text-sm font-semibold text-gray-500 mb-2">Джерела</h2>
          <ol className="space-y-1">
            {sources.map((src, i) => (
              <li key={i} className="text-xs text-gray-400">[{i + 1}] {src}</li>
            ))}
          </ol>
          <p className="text-xs text-gray-400 mt-2">
            Автор: Ігор Растрепін, засновник check-up.in.ua
          </p>
        </section>

        {/* ── Disclaimer ───────────────────────────────────────────────── */}
        <div className="text-xs text-gray-400 border-t border-gray-100 pt-4">
          Інформація має ознайомчий характер і не є медичною консультацією.
          Лікар може рекомендувати додаткові дослідження з урахуванням індивідуальних особливостей.
        </div>

      </main>

      {/* ── Sticky bar ───────────────────────────────────────────────── */}
      <StickyBar
        analysesCount={ANALYSES_COUNT}
        diagnosticsCount={DIAGNOSTICS_COUNT}
        programTitle="Універсальний чек-ап"
      />
    </>
  );
}
