import type { Metadata } from 'next';
import Link from 'next/link';
import { db } from '@/lib/supabase';
import type { CheckupProgram } from '@/lib/types';
import FaqBlock from '@/components/city/FaqBlock';
import QuizWrapper from '@/components/quiz/QuizWrapper';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Чекап для жінок 40-50 років у Харкові — від 9 390 грн',
  description: 'Комплексне обстеження для жінок 40-50: ехокардіографія, УЗД щитовидної залози, онкоскринінг. Терапевт + гінеколог. Від 9 390 грн в ОН Клінік Харків.',
  alternates: {
    canonical: 'https://check-up.in.ua/ukr/female-checkup/40-50-rokiv/kharkiv',
    languages: { uk: '/ukr/female-checkup/40-50-rokiv/kharkiv', ru: '/female-checkup/40-50-let/kharkov' },
  },
};

async function fetchPrograms() {
  try {
    const { data } = await db()
      .from('checkup_programs')
      .select('*')
      .eq('clinic_id', '4d7134c2-1ec4-4ee3-a19a-6021b085fa88')
      .eq('gender', 'female')
      .eq('is_active', true)
      .eq('is_specialized', false)
      .in('age_group', ['40-50', 'after-40', 'any'])
      .order('sort_order', { ascending: true });
    return (data ?? []) as CheckupProgram[];
  } catch { return []; }
}

function fmt(n: number) { return n.toLocaleString('uk-UA'); }
function isStandard(p: CheckupProgram) { return p.slug.startsWith('standard-'); }
function isRegular(p: CheckupProgram) { return p.slug.startsWith('regular-'); }
function discountPct(regular: number, sale: number) {
  if (regular <= sale) return 0;
  return Math.round((1 - sale / regular) * 100);
}

// Текст суворо з full-checkup-female-40-50.md
const SYSTEMS = [
  {
    title: 'Репродуктивна система та молочні залози',
    why: 'Після 40 ризик раку молочної залози та шийки матки зростає. Перименопаузальні зміни можуть маскувати ранні симптоми.',
    items: ['Консультація гінеколога', 'УЗД органів малого тазу', 'УЗД молочних залоз', 'ПАП-тест (рідинна цитологія)', 'Аналіз на мікрофлору'],
  },
  {
    title: 'Серцево-судинна система',
    why: 'Ехокардіографія оцінює структуру та функцію серця — виявляє приховані порушення скоротливості, стан клапанів.',
    items: ['ЕКГ', 'Ехокардіографія (УЗД серця)', 'Ліпідограма (5 показників)', 'Вимірювання АТ'],
  },
  {
    title: 'Ендокринна система',
    why: 'Після 40 порушення щитовидної залози трапляються частіше. УЗД додається до ТТГ для повної картини.',
    items: ['УЗД щитовидної залози', 'ТТГ', 'Глюкоза крові'],
  },
  {
    title: 'ШКТ та внутрішні органи',
    why: '',
    items: ['УЗД органів черевної порожнини', 'Печінкові проби (АЛТ, АСТ, ГГТ, білірубін)', 'Гепатит B (HBsAg)', 'Гепатит C (anti-HCV)'],
  },
  {
    title: 'Сечовидільна система',
    why: '',
    items: ['УЗД нирок', 'Загальний аналіз сечі', 'Ниркові проби (креатинін, сечовина, сечова кислота)'],
  },
];

// FAQ суворо з full-checkup-female-40-50.md
const FAQ = [
  {
    q: 'Чим відрізняється від програми 30-40?',
    a: 'Додано ехокардіографію (УЗД серця) та УЗД щитовидної залози. Серцево-судинні та ендокринні ризики потребують глибшої діагностики після 40.',
  },
  {
    q: 'Чи потрібна маммографія?',
    a: 'Стандартна рекомендація — маммографія з 50 років. Але якщо УЗД покаже зміни або є обтяжена спадковість — лікар може рекомендувати раніше.',
  },
  {
    q: 'Перименопауза — чи покаже чекап?',
    a: 'Гінеколог оцінить симптоми, ТТГ покаже стан щитовидки. Для детальної оцінки гормонального статусу лікар може призначити додаткові аналізи.',
  },
  {
    q: 'Як підготуватися?',
    a: 'За 24 години: без алкоголю та інтенсивних навантажень. За 8 годин: без їжі (натщесерце). Оптимально: 5-12 день циклу (якщо зберігається). Виключіть продукти що викликають метеоризм. Візьміть паспорт, попередні результати, список ліків.',
  },
  {
    q: 'Скільки часу займе?',
    a: 'Два візити. Перший — ранок натщесерце, до 3 годин: аналізи, УЗД, ЕКГ, ехокардіографія, гінеколог. Другий — через 3-5 днів, до 1 години: терапевт з висновком.',
  },
];

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Головна', item: 'https://check-up.in.ua/' },
    { '@type': 'ListItem', position: 2, name: 'Жіночий чекап Харків', item: 'https://check-up.in.ua/ukr/female-checkup/kharkiv' },
    { '@type': 'ListItem', position: 3, name: '40-50 років', item: 'https://check-up.in.ua/ukr/female-checkup/40-50-rokiv/kharkiv' },
  ],
};

export default async function Female4050KharkivPage() {
  const programs = await fetchPrograms();

  const standard = programs.filter(isStandard);
  const regular = programs.filter(isRegular);
  const onclinic = programs.filter(p => !isStandard(p) && !isRegular(p));
  const stdProgram = standard[0] ?? null;
  const minPrice = stdProgram?.price_discount ?? 9390;

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

        {/* Breadcrumbs */}
        <nav className="text-xs text-gray-500 mb-4">
          <Link href="/">Головна</Link>{' → '}
          <Link href="/ukr/female-checkup/kharkiv">Чекап для жінок</Link>{' → '}
          <span className="text-gray-800">40–50 років</span>
        </nav>

        {/* H1 */}
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 leading-tight">
          Чекап для жінок 40–50 років у Харкові
        </h1>
        <div style={{ width: 40, height: 2, background: '#04D3D9', marginTop: 14, marginBottom: 20 }} />

        {/* Hero meta */}
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-gray-500 mb-8">
          <span>від {fmt(minPrice)} грн</span>
          <span>·</span>
          <span>2 візити</span>
          <span>·</span>
          <span>ОН Клінік Харків</span>
        </div>

        {/* Вступ — строго з full-checkup-female-40-50.md */}
        <section className="mb-8">
          <p className="text-sm text-gray-700 leading-relaxed mb-3">
            {'Для жінок 40-50 років. Починаються перименопаузальні зміни, зростають серцево-судинні та онкологічні ризики. Порівняно з 30-40: додано ехокардіографію (УЗД серця), УЗД щитовидної залози.'}
          </p>
          <p className="text-sm text-gray-700 leading-relaxed">
            {'Програма підходить, якщо ви помічаєте зміни циклу, приливи, зміни настрою; маєте фактори ризику (зайва вага, стрес, тиск, спадковість); хочете оцінити стан серця та внутрішніх органів; не проходили обстеження більше року.'}
          </p>
        </section>

        {/* Як змінюється з віком — текст з fixlist */}
        <section className="mb-8 bg-gray-50 rounded-xl p-5">
          <h2 className="text-base font-bold text-gray-900 mb-3">Як змінюється програма з віком</h2>
          <div className="space-y-2 text-sm text-gray-700">
            <div className="flex gap-2">
              <span className="text-gray-400 shrink-0">До 30</span>
              <span>{'Репродуктивне здоров\'я, щитовидна залоза (ТТГ), онкоскринінг шийки матки, молочні залози, базова кардіодіагностика.'}</span>
            </div>
            <div className="flex gap-2">
              <span className="text-gray-400 shrink-0">30-40</span>
              <span>{'Додається УЗД органів черевної порожнини та нирок, ліпідограма замість загального холестерину.'}</span>
            </div>
            <div className="flex gap-2 font-medium text-[#005485]">
              <span className="shrink-0">40-50 ←</span>
              <span>{'Додається ехокардіографія (УЗД серця), УЗД щитовидної залози. Повна кардіо та ендокринна діагностика.'}</span>
            </div>
            <div className="flex gap-2">
              <span className="text-gray-400 shrink-0">Від 50</span>
              <span>{'Додається дуплексне сканування сонних артерій, скринінг колоректального раку (аналіз калу на приховану кров).'}</span>
            </div>
          </div>
        </section>

        {/* Що перевіряється — з .md Системи організму */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Що перевіряється</h2>
          <div className="space-y-4">
            {SYSTEMS.map(sys => (
              <div key={sys.title} className="border border-gray-200 rounded-xl p-4">
                <h3 className="text-sm font-bold text-gray-900 mb-1">{sys.title}</h3>
                {sys.why && <p className="text-xs text-gray-500 mb-2 leading-relaxed">{sys.why}</p>}
                <ul className="space-y-0.5">
                  {sys.items.map(item => (
                    <li key={item} className="text-xs text-gray-700 flex gap-1.5">
                      <span className="text-gray-400 shrink-0">—</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* ===== ПРОГРАМИ ===== */}
        <section className="mb-10" id="programs">

          {/* СТАНДАРТ */}
          {standard.length > 0 && (
            <>
              <div className="text-[11px] font-bold tracking-widest uppercase text-[#005485] mb-1">
                Стандарт check-up.in.ua
              </div>
              <p className="text-xs text-gray-500 mb-3">
                Розроблена за міжнародними рекомендаціями. Терапевт та гінеколог — 2 візити.
              </p>
              {standard.map(p => {
                const pct = discountPct(p.price_regular, p.price_discount);
                return (
                  <div key={p.id} className="border-[1.5px] border-[#005485] rounded-xl p-5 mb-3">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[10px] font-bold tracking-widest uppercase text-white bg-[#005485] px-2.5 py-1 rounded-full">
                        Стандарт
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-gray-900 mb-1">{p.name_ua}</h3>
                    <p className="text-[13px] text-gray-500 mb-3">
                      {'Терапевт, гінеколог · 2 візити · 12 аналізів · УЗД серця, щитовидної, малого тазу'}
                    </p>
                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="text-2xl font-bold text-[#005485]">{fmt(p.price_discount)} грн</span>
                      {pct > 0 && (
                        <>
                          <span className="text-sm text-gray-400 line-through">{fmt(p.price_regular)}</span>
                          <span className="text-xs font-bold text-[#d60242] bg-red-50 px-2 py-0.5 rounded-full">-{pct}%</span>
                        </>
                      )}
                    </div>
                    <a
                      href="#quiz"
                      className="block w-full text-center py-3 bg-[#005485] text-white rounded-xl text-sm font-semibold hover:bg-[#003d66] transition-colors mb-2"
                    >
                      Записатися
                    </a>
                    <Link
                      href="/ukr/female-checkup/first-checkup-40-50"
                      className="block text-center text-[13px] text-[#005485] hover:underline"
                    >
                      Детальний склад програми →
                    </Link>
                  </div>
                );
              })}

              {/* Regular toggle */}
              {regular.length > 0 && (
                <details className="mb-4">
                  <summary className="cursor-pointer text-sm text-[#005485] font-semibold py-2 list-none flex justify-between items-center">
                    <span>Регулярна програма — {fmt(regular[0].price_discount)} грн</span>
                    <span className="text-gray-400">↓</span>
                  </summary>
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 mb-2">
                      Скорочений склад для тих, хто вже проходив чекап 1-2 роки тому.
                    </p>
                    {regular.map(p => (
                      <div key={p.id} className="flex items-center justify-between border border-gray-200 rounded-xl px-4 py-3">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{p.name_ua}</p>
                          <p className="text-xs text-gray-500">Щорічний моніторинг</p>
                        </div>
                        <span className="text-base font-bold text-[#005485] ml-4 shrink-0">
                          {fmt(p.price_discount)} грн
                        </span>
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </>
          )}

          {/* ПРОГРАМИ ОН КЛІНІК */}
          {onclinic.length > 0 && (
            <>
              <div className="h-px bg-gray-200 my-6" />
              <div className="text-[11px] font-bold tracking-widest uppercase text-gray-500 mb-1">
                Програми ОН Клінік
              </div>
              <p className="text-xs text-gray-500 mb-3">
                Розширена діагностика клініки — більше спеціалістів та досліджень.
              </p>
              {onclinic.map(p => {
                const pct = discountPct(p.price_regular, p.price_discount);
                return (
                  <div key={p.id} className="border-[1.5px] border-gray-200 rounded-xl p-5 mb-3">
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-[10px] font-bold tracking-widest uppercase text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                        Програма ОН Клінік
                      </span>
                      {pct > 0 && (
                        <span className="text-xs font-bold text-[#d60242] bg-red-50 px-2 py-0.5 rounded-full">
                          -{pct}%
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-gray-900 mb-1">{p.name_ua}</h3>
                    <p className="text-[13px] text-gray-500 mb-3">
                      {[
                        p.consultations_count ? `${p.consultations_count} консультацій` : null,
                        p.analyses_count ? `${p.analyses_count} аналізів` : null,
                        p.diagnostics_count ? `${p.diagnostics_count} досліджень` : null,
                      ].filter(Boolean).join(' · ')}
                    </p>
                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="text-2xl font-bold text-[#005485]">{fmt(p.price_discount)} грн</span>
                      {p.price_regular > p.price_discount && (
                        <span className="text-sm text-gray-400 line-through">{fmt(p.price_regular)}</span>
                      )}
                    </div>
                    <a
                      href="#quiz"
                      className="block w-full text-center py-3 bg-[#005485] text-white rounded-xl text-sm font-semibold hover:bg-[#003d66] transition-colors"
                    >
                      Записатися
                    </a>
                  </div>
                );
              })}
            </>
          )}
        </section>

        {/* Квіз */}
        <section id="quiz" className="mb-10">
          <QuizWrapper clinicSlug="onclinic-kharkiv" city="kharkiv" locale="ua" sourcePage="/ukr/female-checkup/40-50-rokiv/kharkiv" />
        </section>

        {/* Підготовка — з .md */}
        <section className="mb-10 bg-gray-50 rounded-xl p-5">
          <h2 className="text-base font-bold text-gray-900 mb-3">Підготовка</h2>
          <ul className="space-y-1.5 text-sm text-gray-700">
            <li>{'— За 24 години: без алкоголю та інтенсивних навантажень'}</li>
            <li>{'— За 8 годин: без їжі (натщесерце)'}</li>
            <li>{'— Оптимально: 5-12 день циклу (якщо зберігається)'}</li>
            <li>{'— Виключіть продукти що викликають метеоризм'}</li>
            <li>{'— Візьміть: паспорт, попередні результати, список ліків'}</li>
          </ul>
        </section>

        <FaqBlock items={FAQ} />

        {/* GEO блок */}
        <section className="mb-8 text-sm text-gray-600 bg-gray-50 rounded-xl p-5">
          <p>
            {'Чекап для жінок 40-50 років у Харкові проводиться в мережі «ОН Клінік» за трьома адресами: вул. Ярослава Мудрого, 30а; пр. Героїв Харкова, 257; вул. Молочна, 48. Стандартна програма — від 9 390 грн, програма ОН Клінік «Жіночий після 40» — 14 634 грн. Ціни перевірено: квітень 2026.'}
          </p>
        </section>

        {/* E-E-A-T */}
        <section className="mb-10">
          <div className="flex gap-4 items-start">
            <div className="shrink-0 w-12 h-12 rounded-full bg-gray-200" />
            <div>
              <p className="text-sm font-bold text-gray-900">Ігор Растрепін</p>
              <p className="text-xs text-gray-500 mb-1">Засновник check-up.in.ua</p>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <span style={{ color: '#f59e0b' }}>{'★★★★★'}</span>
                <span>{'5.0 · 88 відгуків на Google Maps'}</span>
              </div>
            </div>
          </div>
          <p className="mt-3 text-sm text-gray-600 leading-relaxed">
            {'Програми розроблені за рекомендаціями провідних медичних організацій та перевірені на практиці з 2019 року.'}
          </p>
        </section>

        {/* Дисклеймер */}
        <p className="text-xs text-gray-400 leading-relaxed mb-8">
          {'Інформація має ознайомчий характер і не є медичною консультацією. Зверніться до лікаря для індивідуальних рекомендацій.'}
        </p>

        {/* Перелінковка */}
        <nav className="text-sm">
          <p className="text-gray-500 mb-3">Інші вікові групи:</p>
          <div className="flex flex-wrap gap-2">
            <Link href="/ukr/female-checkup/do-30-rokiv/kharkiv" className="px-3 py-1.5 border border-gray-200 rounded-full text-gray-700 hover:border-[#005485] transition-colors text-xs">До 30 років</Link>
            <Link href="/ukr/female-checkup/30-40-rokiv/kharkiv" className="px-3 py-1.5 border border-gray-200 rounded-full text-gray-700 hover:border-[#005485] transition-colors text-xs">30–40 років</Link>
            <Link href="/ukr/female-checkup/vid-50-rokiv/kharkiv" className="px-3 py-1.5 border border-gray-200 rounded-full text-gray-700 hover:border-[#005485] transition-colors text-xs">Від 50 років</Link>
            <Link href="/ukr/female-checkup/kharkiv" className="px-3 py-1.5 border border-gray-200 rounded-full text-gray-700 hover:border-[#005485] transition-colors text-xs">Усі програми для жінок</Link>
          </div>
        </nav>

      </main>

      {/* Sticky bar */}
      <div
        className="fixed bottom-0 z-50 bg-white border-t border-gray-200 px-4 py-3 flex justify-between items-center"
        style={{ left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 430 }}
      >
        <div>
          <p className="text-[11px] text-gray-500">Стандарт</p>
          <p className="text-base font-extrabold text-[#005485]">від {fmt(minPrice)} грн</p>
        </div>
        <a
          href="#quiz"
          className="py-3 px-6 bg-[#005485] text-white rounded-xl text-sm font-bold hover:bg-[#003d66] transition-colors"
        >
          Записатися
        </a>
      </div>
    </>
  );
}
