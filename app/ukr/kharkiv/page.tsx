import type { Metadata } from 'next';
import Link from 'next/link';
import { db } from '@/lib/supabase';
import type { CheckupProgram } from '@/lib/types';
import QuizWrapper from '@/components/quiz/QuizWrapper';
import ProgramCatalog from '@/components/city/ProgramCatalog';
import FaqBlock from '@/components/city/FaqBlock';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Чекап організму в Харкові — Програми обстеження від 6 110 грн',
  description: 'Комплексне обстеження організму в Харкові — програми для жінок та чоловіків від 6 110 грн. ОН Клінік, 3 філії. Запис онлайн.',
  alternates: {
    canonical: 'https://check-up.in.ua/ukr/kharkiv',
    languages: { uk: '/ukr/kharkiv', ru: '/kharkov' },
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
    q: 'Скільки часу займає обстеження?',
    a: 'Два візити. Перший — 2-3 години вранці натщесерце. Другий — через 5-7 днів, до 1 години. Терапевт дасть письмовий висновок з конкретними рекомендаціями.',
  },
  {
    q: 'Як підготуватися до чекапу?',
    a: 'Прийдіть натщесерце (8 годин без їжі). За добу — без алкоголю та інтенсивних фізичних навантажень. Жінкам: оптимально 5-12 день циклу для гінекологічних досліджень.',
  },
  {
    q: 'Де клініки?',
    a: 'Три філії ОН Клінік біля метро: Ярослава Мудрого, 30а; Героїв Харкова, 257; Молочна, 48.',
  },
  {
    q: 'Що після чекапу?',
    a: 'Терапевт дасть письмовий висновок: що в нормі, що контролювати, коли прийти наступного разу.',
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

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <main className="max-w-3xl mx-auto px-4 pt-6 pb-24">
        <nav className="text-xs text-gray-500 mb-4">
          <Link href="/">Головна</Link>{' → '}
          <span className="text-gray-800">Харків</span>
        </nav>

        {/* Fix 1.1 — H1 with italic "в Харкові" */}
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 leading-tight">
          {'Чекап організму '}
          <em style={{ fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif", fontStyle: 'italic', fontWeight: 400, color: '#005485' }}>
            {'в Харкові'}
          </em>
        </h1>

        {/* Fix 1.2 — teal line 40px x 2px */}
        <div style={{ width: 40, height: 2, background: '#04D3D9', marginTop: 14, marginBottom: 20 }} />

        {/* Fix 1.1 — subtitle */}
        <p className="text-gray-500 leading-relaxed mb-6" style={{ fontSize: 15 }}>
          {'Програма, ціна та запис — все на одній сторінці. Втома, поганий сон, проблеми зі шкірою або просто давно не перевірялися — чекап покаже стан організму та що робити далі.'}
        </p>

        {/* Fix 1.1 — ONE CTA only */}
        <a
          href="#programs"
          className="block w-full py-4 bg-[#005485] text-white text-center rounded-xl text-base font-bold mb-5 hover:bg-[#003d66] transition-colors"
        >
          {'Підібрати програму'}
        </a>

        {/* Fix 1.9 — rating 5.0, 88 відгуків */}
        <div className="flex flex-wrap gap-3 text-xs text-gray-500 justify-center mb-10">
          <span>{'Повна програма від 6 110 грн'}</span>
          <span>{'·'}</span>
          <span>{'ОН Клінік, 3 філії'}</span>
          <span>{'·'}</span>
          <span className="flex items-center gap-1">
            <span style={{ color: '#f59e0b' }}>{'★★★★★'}</span>
            <span>{'5.0'}</span>
          </span>
        </div>

        {/* Quiz */}
        <section id="quiz" className="mb-10">
          <QuizWrapper clinicSlug="onclinic-kharkiv" city="kharkiv" locale="ua" sourcePage="/ukr/kharkiv" />
        </section>

        {/* Programs — age pills filter via ProgramCatalog */}
        {programs.length > 0 && (
          <ProgramCatalog programs={programs} />
        )}

        {/* Fix 1.10 — Steps with teal-border numbers */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">{'Як пройти обстеження'}</h2>
          <div className="space-y-5">
            {[
              ['Оберіть програму', 'Вкажіть стать та вік — побачите що входить і скільки коштує.'],
              ['Запишіться', 'Залиште заявку — менеджер клініки погодить дату та надішле графік.'],
              ['Пройдіть обстеження', 'Один ранок натщесерце: аналізи, УЗД, ЕКГ, консультації. 2-3 години.'],
              ['Отримайте результат', 'Через 5-7 днів терапевт дасть висновок з конкретними рекомендаціями.'],
            ].map(([title, text], i) => (
              <div key={i} className="flex gap-4">
                <div
                  className="shrink-0 flex items-center justify-center text-sm font-bold"
                  style={{ width: 28, height: 28, minWidth: 28, borderRadius: '50%', border: '2px solid #04D3D9', color: '#04D3D9', marginTop: 2 }}
                >
                  {i + 1}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{title}</p>
                  <p className="text-sm text-gray-500 leading-relaxed">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Fix 1.7 — "Якщо це ваш перший чекап" block */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">{'Якщо це ваш перший чекап'}</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-gray-900 mb-1">{'Вам не потрібно розбиратися в аналізах'}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{'Програма вже містить все що рекомендовано для вашого віку. Після чекапу лікар скаже що контролювати надалі.'}</p>
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 mb-1">{'Вам не потрібно знати до кого йти'}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{'Терапевт координує процес. Гінеколог, уролог, кардіолог підключаються за програмою — записуватися окремо не потрібно.'}</p>
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 mb-1">{'Вам потрібен один ранок'}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{'Прийшли натщесерце — пройшли все за 2-3 години. Результати на пошту за 1-2 дні. Через тиждень — терапевт за результатами.'}</p>
            </div>
          </div>
          <a
            href="#programs"
            className="block w-full mt-6 py-4 bg-[#005485] text-white text-center rounded-xl text-base font-bold hover:bg-[#003d66] transition-colors"
          >
            {'Обрати програму'}
          </a>
        </section>

        {/* Clinic section */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-1">{'Клініка'}</h2>
          <p className="text-sm text-gray-500 mb-4">{'ОН Клінік Харків — 3 філії біля метро. Власна лабораторія, результати онлайн.'}</p>
          <div className="space-y-2">
            {[
              { name: 'Ярослава Мудрого', address: 'вул. Ярослава Мудрого, 30а · м. Ярослава Мудрого', schedule: 'Пн-Пт 8-18 · Сб 9-16 · Нд 9-13' },
              { name: 'Палац Спорту', address: 'пр. Героїв Харкова, 257 · м. Палац Спорту', schedule: 'Пн-Пт 8-19 · Сб 8-17 · Нд 9-14' },
              { name: 'Левада', address: 'вул. Молочна, 48 · м. Левада', schedule: 'Пн-Пт 8-18 · Сб 8-17 · Нд 8:30-14' },
            ].map(branch => (
              <div key={branch.name} className="bg-gray-50 rounded-xl px-4 py-3">
                <p className="text-sm font-semibold text-gray-900">{branch.name}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{branch.address}<br />{branch.schedule}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Fix 1.8 — E-E-A-T author block */}
        <section className="mb-10">
          <div className="flex gap-4 items-start">
            <div className="shrink-0 w-14 h-14 rounded-full bg-gray-200" />
            <div>
              <p className="text-sm font-bold text-gray-900">{'Ігор Растрепін'}</p>
              <p className="text-xs text-gray-500 mb-1">{'Засновник check-up.in.ua'}</p>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <span style={{ color: '#f59e0b' }}>{'★★★★★'}</span>
                <span>{'5.0 · 88 відгуків на Google Maps'}</span>
              </div>
            </div>
          </div>
          <div className="mt-4 space-y-3 text-sm text-gray-700 leading-relaxed">
            <p>{'Програми розроблені за рекомендаціями провідних медичних організацій та перевірені на практиці з 2019 року — понад 6 800 пацієнтів у 80+ клініках.'}</p>
            <p>{'Чому я створив цей сервіс: більшість людей відкладають обстеження не тому що їм байдуже — а тому що незрозуміло з чого почати, куди йти, скільки це коштує і що вони отримають. Я хотів прибрати ці питання.'}</p>
          </div>
        </section>

        {/* SEO nav links */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">{'Програми за статтю та віком'}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { href: '/ukr/female-checkup/kharkiv', label: 'Жіночий чекап', desc: 'Від 6 110 грн · Гінеколог + терапевт' },
              { href: '/ukr/male-checkup/kharkiv', label: 'Чоловічий чекап', desc: 'Від 4 870 грн · Уролог + терапевт' },
            ].map(item => (
              <Link key={item.href} href={item.href} className="block p-4 border border-gray-200 rounded-xl hover:border-[#04D3D9] transition-colors">
                <p className="font-semibold text-gray-900">{item.label}</p>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </Link>
            ))}
          </div>
        </section>

        <FaqBlock items={FAQ} />

        {/* GEO */}
        <section className="mb-8 text-sm text-gray-600 bg-gray-50 rounded-xl p-5">
          <p>{'Чекап організму в Харкові проводиться в мережі медичних центрів «ОН Клінік» за трьома адресами: вул. Ярослава Мудрого, 30а; пр. Героїв Харкова, 257; вул. Молочна, 48. Повні програми — від 6 110 грн до 14 634 грн. Регулярні — від 2 785 грн. Ціни перевірено: квітень 2026.'}</p>
        </section>
      </main>

      {/* Fix 1.11 — Sticky bar */}
      <div
        className="fixed bottom-0 z-50 bg-white border-t border-gray-200 px-4 py-3 flex justify-between items-center"
        style={{ left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 430 }}
      >
        <div>
          <p className="text-[11px] text-gray-500">{'Повна програма'}</p>
          <p className="text-base font-extrabold text-[#005485]">{'від 6 110 грн'}</p>
        </div>
        <a
          href="#programs"
          className="py-3 px-6 bg-[#005485] text-white rounded-xl text-sm font-bold hover:bg-[#003d66] transition-colors"
        >
          {'Підібрати програму'}
        </a>
      </div>
    </>
  );
}
