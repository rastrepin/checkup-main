import type { Metadata } from 'next';
import Link from 'next/link';
import { db } from '@/lib/supabase';
import type { CheckupProgram } from '@/lib/types';
import QuizHeroWidget from '@/components/quiz/QuizHeroWidget';
import { QuizOpenBtn } from '@/components/quiz/QuizModal';
import ProgramCatalog from '@/components/city/ProgramCatalog';
import FaqBlock from '@/components/city/FaqBlock';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Чекап організму в Харкові ᐈ Програми обстеження від 6 110 грн | check-up.in.ua',
  description: 'Комплексне обстеження організму в Харкові — програми для жінок та чоловіків від 6 110 грн. ОН Клінік, 3 філії біля метро. Запис онлайн.',
  alternates: {
    canonical: 'https://check-up.in.ua/ukr/kharkiv',
    languages: { uk: '/ukr/kharkiv', ru: '/kharkov' },
  },
  openGraph: {
    title: 'Чекап організму в Харкові — від 6 110 грн | check-up.in.ua',
    description: 'Програми комплексного обстеження в ОН Клінік. 3 філії біля метро, результати онлайн.',
    url: 'https://check-up.in.ua/ukr/kharkiv',
    siteName: 'check-up.in.ua',
    locale: 'uk_UA',
    type: 'website',
  },
};

async function fetchAllPrograms() {
  try {
    const { data } = await db()
      .from('checkup_programs')
      .select('*')
      .eq('clinic_id', '4d7134c2-1ec4-4ee3-a19a-6021b085fa88')
      .eq('is_active', true)
      .order('price_discount', { ascending: true });
    return (data ?? []) as CheckupProgram[];
  } catch { return []; }
}

const FAQ = [
  {
    q: 'Скільки коштує чекап в Харкові?',
    a: 'Повні стандартні програми — від 6 110 грн до 10 040 грн. Програми ОН Клінік зі знижкою — від 11 724 грн до 14 634 грн. Регулярні — від 2 785 грн. Ціна включає всі аналізи, УЗД та консультації.',
  },
  {
    q: 'Чим стандартна відрізняється від програми ОН Клінік?',
    a: 'Стандартна — рекомендований мінімум за міжнародними стандартами, однаковий склад у всіх клініках-партнерах. Програма ОН Клінік — розширена: більше спеціалістів, додаткові дослідження, персональний супровід.',
  },
  {
    q: 'Що входить у програму чекапу?',
    a: 'Склад залежить від статі та віку. Основа — аналізи крові (загальний, біохімія, гормони), УЗД органів черевної порожнини та щитовидної залози, ЕКГ, консультація терапевта. Жіночі програми включають гінеколога та онкоскринінг, чоловічі — уролога.',
  },
  {
    q: 'Скільки часу займає обстеження?',
    a: 'Два візити. Перший — 2-3 години вранці натщесерце. Другий — через 5-7 днів, до 1 години. Терапевт дасть письмовий висновок з конкретними рекомендаціями.',
  },
  {
    q: 'Як підготуватися до чекапу?',
    a: 'Прийдіть натщесерце (8 годин без їжі). За добу — без алкоголю та інтенсивних фізичних навантажень. Жінкам: оптимально 5-12 день циклу для гінекологічних досліджень.',
  },
  {
    q: 'Де розташовані клініки?',
    a: 'Три філії ОН Клінік біля метро: вул. Ярослава Мудрого, 30а (м. Ярослава Мудрого); пр. Героїв Харкова, 257 (м. Палац Спорту); вул. Молочна, 48 (м. Левада).',
  },
  {
    q: 'Що після чекапу?',
    a: 'Терапевт дасть письмовий висновок: що в нормі, що контролювати, коли прийти наступного разу.',
  },
  {
    q: 'Чи потрібне направлення від лікаря?',
    a: 'Ні. Чекап — профілактичне обстеження, яке ви можете пройти самостійно без направлення. Записатись можна онлайн на нашому сайті.',
  },
  {
    q: 'Через скільки часу будуть готові результати?',
    a: 'Результати аналізів зʼявляються в особистому кабінеті онлайн протягом 1-2 робочих днів. Через 5-7 днів відбувається другий візит: терапевт розшифровує результати та надає письмові рекомендації.',
  },
];

export default async function KharkivPage() {
  const programs = await fetchAllPrograms();

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Головна', item: 'https://check-up.in.ua/' },
      { '@type': 'ListItem', position: 2, name: 'Харків', item: 'https://check-up.in.ua/ukr/kharkiv' },
    ],
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ.map(item => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };

  const medicalBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'MedicalBusiness',
    name: 'ОН Клінік Харків — чекап організму',
    description: 'Комплексне обстеження організму в Харкові. Програми від 6 110 грн.',
    url: 'https://check-up.in.ua/ukr/kharkiv',
    telephone: '',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'вул. Ярослава Мудрого, 30а',
      addressLocality: 'Харків',
      addressCountry: 'UA',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '5.0',
      reviewCount: '88',
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(medicalBusinessSchema) }} />

      {/* ── HEADER ─────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/97 backdrop-blur-sm">
        <div className="max-w-[1120px] mx-auto px-5 lg:px-10 py-4 flex justify-between items-center">
          <Link href="/" className="text-[15px] font-bold tracking-tight">
            CHECK-UP<span className="text-[#005485]">.IN.UA</span>
          </Link>
          <nav className="hidden md:flex gap-6 items-center">
            <Link href="/ukr/female-checkup/kharkiv" className="text-sm text-gray-500 hover:text-[#005485] font-medium transition-colors">Для жінок</Link>
            <Link href="/ukr/male-checkup/kharkiv" className="text-sm text-gray-500 hover:text-[#005485] font-medium transition-colors">Для чоловіків</Link>
            <span className="text-xs font-semibold text-[#005485] bg-[#e8f4fd] px-3 py-1 rounded-full">Харків</span>
          </nav>
        </div>
      </header>

      {/* ── HERO ───────────────────────────────────────────────────── */}
      <div className="bg-white lg:bg-[#05121e]">
        {/* Breadcrumb */}
        <div className="max-w-[1120px] mx-auto px-5 lg:px-10 pt-3">
          <nav className="text-[13px]" aria-label="breadcrumb">
            <Link href="/" className="text-gray-500 hover:text-gray-700 lg:text-white/35 lg:hover:text-white/60 transition-colors">Головна</Link>
            <span className="mx-2 text-gray-300 lg:text-white/20">›</span>
            <span className="text-gray-800 font-medium lg:text-white/60">Харків</span>
          </nav>
        </div>

        {/* Hero grid */}
        <div className="max-w-[1120px] mx-auto px-5 lg:px-10 pt-8 lg:pt-20 pb-10 lg:pb-0 lg:grid lg:grid-cols-[1fr_420px] lg:gap-16 lg:items-center">
          {/* Left — headline */}
          <div>
            <h1 className="text-[28px] sm:text-[36px] lg:text-[44px] font-extrabold leading-[1.08] text-[#0b1a24] lg:text-white mb-3 tracking-tight">
              {'Чекап організму'}
              <br />
              <em
                className="not-italic"
                style={{
                  fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
                  fontStyle: 'italic',
                  fontWeight: 400,
                }}
              >
                <span className="text-[#005485] lg:text-[#04D3D9]">{'в Харкові'}</span>
              </em>
            </h1>

            {/* Teal accent */}
            <div style={{ width: 44, height: 2.5, background: '#04D3D9', marginBottom: 24 }} />

            <p className="text-[16px] lg:text-[17px] text-gray-500 lg:text-white/60 leading-relaxed mb-7 max-w-[480px]">
              {"Перевірте стан здоров\u2019я за один візит — чи турбує щось конкретне, чи просто давно не обстежувались."}
            </p>

            <div className="flex flex-wrap gap-4 text-[13px] text-gray-400 lg:text-white/45 mt-6">
              <span>{'Повна програма від 6 110 грн'}</span>
              <span>{'·'}</span>
              <span>{'ОН Клінік, 3 філії'}</span>
              <span>{'·'}</span>
              <span>{'Google 5.0 · 88 відгуків'}</span>
            </div>
          </div>

          {/* Right — quiz widget */}
          <div className="mt-8 lg:mt-0" id="quiz">
            <QuizHeroWidget
              clinicSlug="onclinic-kharkiv"
              city="kharkiv"
              sourcePage="/ukr/kharkiv"
              locale="ua"
            />
          </div>
        </div>

        {/* Desktop spacer — keeps dark bg below hero grid */}
        <div className="hidden lg:block h-[120px]" />
      </div>

      {/* ── PROGRAMS — white ────────────────────────────────────────── */}
      <section className="py-12 lg:py-24 bg-white" id="programs">
        <div className="max-w-[1120px] mx-auto px-5 lg:px-10">
          <h2 className="text-[22px] lg:text-[28px] font-bold text-[#0b1a24] mb-2 tracking-tight">
            {'Програми чекапу в Харкові'}
          </h2>
          <p className="text-[15px] text-gray-500 mb-8">{'Ціна включає все: аналізи, УЗД, консультації.'}</p>
          {programs.length > 0 && <ProgramCatalog programs={programs} />}
          <p className="text-xs text-gray-400 mt-5">{'Ціни перевірено: квітень 2026'}</p>
        </div>
      </section>

      {/* ── HOW IT WORKS — gray ─────────────────────────────────────── */}
      <section className="py-12 lg:py-24 bg-[#f8f9fb]">
        <div className="max-w-[1120px] mx-auto px-5 lg:px-10">
          <h2 className="text-[22px] lg:text-[28px] font-bold text-[#0b1a24] mb-10 tracking-tight">
            {'Як пройти чекап в Харкові'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              ['Оберіть програму', 'Вкажіть стать та вік — побачите що входить і скільки коштує.'],
              ['Запишіться', 'Залиште заявку — менеджер клініки погодить дату та надішле графік.'],
              ['Пройдіть обстеження', 'Один ранок натщесерце: аналізи, УЗД, ЕКГ, консультації. 2-3 години.'],
              ['Отримайте результат', 'Через 5-7 днів терапевт дасть висновок з конкретними рекомендаціями.'],
            ].map(([title, text], i) => (
              <div key={i} className="text-center lg:text-left">
                <div
                  className="flex items-center justify-center lg:justify-start mb-5"
                >
                  <div
                    className="flex items-center justify-center text-[17px] font-bold"
                    style={{ width: 44, height: 44, borderRadius: '50%', border: '2px solid #04D3D9', color: '#04D3D9' }}
                  >
                    {i + 1}
                  </div>
                </div>
                <p className="font-bold text-[16px] text-[#0b1a24] mb-2">{title}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FIRST CHECKUP — white ───────────────────────────────────── */}
      <section className="py-12 lg:py-24 bg-white">
        <div className="max-w-[1120px] mx-auto px-5 lg:px-10">
          <h2 className="text-[22px] lg:text-[28px] font-bold text-[#0b1a24] mb-10 tracking-tight">
            {'Якщо це ваш перший чекап'}
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {[
              {
                title: 'Вам не потрібно розбиратися в аналізах',
                text: 'Програма вже містить все що рекомендовано для вашого віку. Після чекапу лікар скаже що контролювати надалі.',
              },
              {
                title: 'Вам не потрібно знати до кого йти',
                text: 'Терапевт координує процес. Гінеколог, уролог, кардіолог підключаються за програмою — записуватися окремо не потрібно.',
              },
              {
                title: 'Вам потрібен один ранок',
                text: 'Прийшли натщесерце — пройшли все за 2-3 години. Результати на пошту за 1-2 дні. Через тиждень — терапевт за результатами.',
              },
            ].map(({ title, text }) => (
              <div key={title}>
                <h3 className="text-[17px] font-bold text-[#0b1a24] mb-3">{title}</h3>
                <p className="text-[15px] text-gray-500 leading-[1.75]">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CLINIC — gray ───────────────────────────────────────────── */}
      <section className="py-12 lg:py-24 bg-[#f8f9fb]">
        <div className="max-w-[1120px] mx-auto px-5 lg:px-10">
          <h2 className="text-[22px] lg:text-[28px] font-bold text-[#0b1a24] mb-2 tracking-tight">{'Клініка'}</h2>
          <p className="text-[15px] text-gray-500 mb-8">
            {'ОН Клінік Харків — 3 філії біля метро. Власна лабораторія, результати онлайн.'}
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {[
              { name: 'Ярослава Мудрого', address: 'вул. Ярослава Мудрого, 30а', metro: 'м. Ярослава Мудрого', schedule: 'Пн-Пт 8:00-18:00 · Сб 9:00-16:00 · Нд 9:00-13:00' },
              { name: 'Палац Спорту', address: 'пр. Героїв Харкова, 257', metro: 'м. Палац Спорту', schedule: 'Пн-Пт 8:00-19:00 · Сб 8:00-17:00 · Нд 9:00-14:00' },
              { name: 'Левада', address: 'вул. Молочна, 48', metro: 'м. Левада', schedule: 'Пн-Пт 8:00-18:00 · Сб 8:00-17:00 · Нд 8:30-14:00' },
            ].map(branch => (
              <div key={branch.name} className="bg-white border border-gray-200 rounded-xl p-7 hover:border-[#005485] hover:shadow-[0_4px_20px_rgba(0,84,133,.08)] transition-all">
                <h3 className="text-[15px] font-semibold text-[#0b1a24] mb-2">{branch.name}</h3>
                <p className="text-[13px] text-gray-500 leading-[1.65]">
                  {branch.address}<br />
                  {branch.metro}<br />
                  {branch.schedule}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AUTHOR — white ──────────────────────────────────────────── */}
      <section className="py-12 lg:py-24 bg-white">
        <div className="max-w-[1120px] mx-auto px-5 lg:px-10">
          <div className="grid grid-cols-[auto_1fr] gap-8 items-start">
            {/* Photo placeholder */}
            <div className="w-[88px] h-[88px] rounded-full bg-gray-200 shrink-0" />
            <div>
              <p className="text-[20px] font-bold text-[#0b1a24]">{'Ігор Растрепін'}</p>
              <p className="text-[14px] text-gray-500 mb-1">{'Засновник check-up.in.ua'}</p>
              <p className="text-[13px] text-gray-500">{'Google 5.0 · 88 відгуків'}</p>
            </div>
          </div>
          <div className="mt-6 max-w-[720px] space-y-4">
            <p className="text-[15px] text-gray-600 leading-[1.8]">
              {'Програми розроблені за рекомендаціями провідних медичних організацій та перевірені на практиці з 2019 року — понад 6 800 пацієнтів у 80+ клініках.'}
            </p>
            <p className="text-[15px] text-gray-600 leading-[1.8]">
              {'Чому я створив цей сервіс: більшість людей відкладають обстеження не тому що їм байдуже — а тому що незрозуміло з чого почати, куди йти, скільки це коштує і що вони отримають. Я хотів прибрати ці питання.'}
            </p>
          </div>
        </div>
      </section>

      {/* ── SEO — gray ──────────────────────────────────────────────── */}
      <section className="py-12 lg:py-24 bg-[#f8f9fb]">
        <div className="max-w-[1120px] mx-auto px-5 lg:px-10">
          <div className="lg:grid lg:grid-cols-[2fr_1fr] lg:gap-14">
            {/* Main content */}
            <div>
              <h2 className="text-[22px] lg:text-[28px] font-bold text-[#0b1a24] mb-5 tracking-tight">
                {'Комплексне обстеження організму — що це'}
              </h2>
              <div className="space-y-4 text-[15px] text-gray-600 leading-[1.75]">
                <p>{'Чекап — профілактичне обстеження для людей без скарг. Мета — виявити захворювання на безсимптомній стадії, поки лікування є ефективним.'}</p>
                <p>
                  {'Програма включає аналізи крові, УЗД ключових органів, ЕКГ та консультацію терапевта з персональними рекомендаціями. Склад залежить від статі та віку: '}
                  <Link href="/ukr/female-checkup/kharkiv" className="text-[#005485] font-medium hover:underline">{'жіночий чекап'}</Link>
                  {' включає гінеколога та онкоскринінг, '}
                  <Link href="/ukr/male-checkup/kharkiv" className="text-[#005485] font-medium hover:underline">{'чоловічий'}</Link>
                  {' — уролога.'}
                </p>
                <p>{'ВООЗ рекомендує щорічне обстеження після 40 років. До 40 — раз на 2-3 роки за відсутності скарг. Харків обслуговується через мережу ОН Клінік.'}</p>
              </div>
            </div>

            {/* Sidebar */}
            <aside className="mt-8 lg:mt-0">
              <div>
                <p className="text-[12px] font-bold uppercase tracking-[.06em] text-gray-400 mb-3">{'Програми за статтю та віком'}</p>
                <div className="flex flex-col gap-2.5">
                  {[
                    { href: '/ukr/female-checkup/kharkiv', label: 'Жіночий чекап у Харкові' },
                    { href: '/ukr/male-checkup/kharkiv', label: 'Чоловічий чекап у Харкові' },
                    { href: '/ukr/female-checkup/kharkiv?age=do-30', label: 'Жіночий чекап до 30' },
                    { href: '/ukr/female-checkup/kharkiv?age=30-40', label: 'Жіночий чекап 30-40' },
                    { href: '/ukr/female-checkup/kharkiv?age=40-50', label: 'Жіночий чекап 40-50' },
                    { href: '/ukr/male-checkup/kharkiv?age=30-40', label: 'Чоловічий чекап 30-40' },
                  ].map(item => (
                    <Link key={item.href} href={item.href} className="text-[13px] text-[#005485] font-medium hover:underline">
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* ── GEO — white ─────────────────────────────────────────────── */}
      <section className="py-8 lg:py-12 bg-white">
        <div className="max-w-[1120px] mx-auto px-5 lg:px-10">
          <p className="text-[14px] text-gray-600 leading-[1.75] max-w-[800px]">
            {'Чекап організму в Харкові проводиться в мережі медичних центрів «ОН Клінік» за трьома адресами біля станцій метро: вул. Ярослава Мудрого, 30а, пр. Героїв Харкова, 257 та вул. Молочна, 48. Вартість повних програм — від 6 110 грн до 14 634 грн. Регулярні — від 2 785 грн. Запис на check-up.in.ua. Ціни перевірено: квітень 2026.'}
          </p>
        </div>
      </section>

      {/* ── FAQ — gray ──────────────────────────────────────────────── */}
      <section className="py-12 lg:py-24 bg-[#f8f9fb]" id="faq">
        <div className="max-w-[1120px] mx-auto px-5 lg:px-10">
          <h2 className="text-[22px] lg:text-[28px] font-bold text-[#0b1a24] mb-6 tracking-tight">
            {'Часті запитання про чекап у Харкові'}
          </h2>
          <FaqBlock items={FAQ} twoColumn />
        </div>
      </section>

      {/* ── CTA BANNER — navy ───────────────────────────────────────── */}
      <section style={{ background: '#005485' }} className="py-14">
        <div className="max-w-[1120px] mx-auto px-5 lg:px-10 flex flex-col lg:flex-row justify-between items-center gap-6">
          <div>
            <h3 className="text-[24px] font-bold text-white mb-1">{"Готові подбати про здоров\u2019я?"}</h3>
            <p className="text-[14px] text-white/60">{'Оберіть програму — отримайте план обстеження з вартістю'}</p>
          </div>
          <QuizOpenBtn className="shrink-0 px-9 py-4 bg-white text-[#005485] rounded-xl text-[15px] font-bold hover:bg-gray-50 transition-colors">
            {'Підібрати програму'}
          </QuizOpenBtn>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────── */}
      <footer className="bg-[#f8f9fb] border-t border-gray-100">
        <div className="max-w-[1120px] mx-auto px-5 lg:px-10 py-12 grid grid-cols-1 lg:grid-cols-[1fr_auto_auto] gap-10">
          {/* Brand */}
          <div>
            <Link href="/" className="text-[15px] font-bold">
              CHECK-UP<span className="text-[#005485]">.IN.UA</span>
            </Link>
            <p className="mt-3 text-[13px] text-gray-500 leading-relaxed">
              {'Сервіс підбору та запису на'}
              <br />
              {'комплексне обстеження організму'}
            </p>
          </div>

          {/* Nav 1 */}
          <nav className="flex flex-col gap-2.5">
            <Link href="/ukr/female-checkup/kharkiv" className="text-[13px] text-gray-500 hover:text-[#005485] transition-colors">{'Чекап для жінок'}</Link>
            <Link href="/ukr/male-checkup/kharkiv" className="text-[13px] text-gray-500 hover:text-[#005485] transition-colors">{'Чекап для чоловіків'}</Link>
            <Link href="/" className="text-[13px] text-gray-500 hover:text-[#005485] transition-colors">{'Всі міста'}</Link>
            <Link href="/ukr/policy" className="text-[13px] text-gray-500 hover:text-[#005485] transition-colors">{'Політика конфіденційності'}</Link>
          </nav>

          {/* Nav 2 */}
          <nav className="flex flex-col gap-2.5">
            <span className="text-[13px] font-semibold text-[#005485]">{'Для клінік'}</span>
            <Link href="/ukr/policy" className="text-[13px] text-gray-500 hover:text-[#005485] transition-colors">{'Стати партнером'}</Link>
            <Link href="/ukr/policy" className="text-[13px] text-gray-500 hover:text-[#005485] transition-colors">{'Контакти'}</Link>
          </nav>

          {/* Copyright */}
          <div className="lg:col-span-3">
            <p className="text-[12px] text-gray-300">{'© 2019-2026 check-up.in.ua · Комплексне обстеження організму'}</p>
          </div>
        </div>
      </footer>

      {/* ── STICKY BAR — mobile ───────────────────────────────── */}
      <div
        data-quiz-sticky=""
        className="fixed bottom-0 z-50 bg-white border-t border-gray-200 px-4 py-3 flex justify-between items-center lg:hidden"
        style={{ left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 430 }}
      >
        <div>
          <p className="text-[11px] text-gray-500">Повна програма</p>
          <p className="text-base font-extrabold text-[#005485]">від 6 110 грн</p>
        </div>
        <QuizOpenBtn className="py-3 px-6 bg-[#005485] text-white rounded-xl text-sm font-bold hover:bg-[#003d66] transition-colors">
          Підібрати програму
        </QuizOpenBtn>
      </div>
    </>
  );
}
