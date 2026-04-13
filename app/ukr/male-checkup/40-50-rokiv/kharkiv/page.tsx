import type { Metadata } from 'next';
import Link from 'next/link';
import { db } from '@/lib/supabase';
import type { CheckupProgram } from '@/lib/types';
import FaqBlock from '@/components/city/FaqBlock';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Чекап для чоловіків 40-50 років у Харкові — від 6 930 грн',
  description: 'Комплексне обстеження для чоловіків 40-50: уролог, дуплексне сканування судин, скринінг колоректального раку. Від 6 930 грн в ОН Клінік Харків.',
  alternates: {
    canonical: 'https://check-up.in.ua/ukr/male-checkup/40-50-rokiv/kharkiv',
  },
};

async function fetchPrograms() {
  try {
    const { data } = await db()
      .from('checkup_programs')
      .select('*')
      .eq('clinic_id', '4d7134c2-1ec4-4ee3-a19a-6021b085fa88')
      .eq('gender', 'male')
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

const FAQ = [
  { q: 'Чим відрізняється від 30-40?', a: 'Додано консультацію уролога, дуплексне сканування сонних артерій, УЗД щитовидної залози, аналіз калу на приховану кров.' },
  { q: 'Чи входить ПСА в програму?', a: 'ПСА не входить у стандартну програму. Уролог оцінює ваші результати та за потреби призначає ПСА та УЗД простати індивідуально.' },
  { q: 'Як часто?', a: 'Щорічно після 40.' },
];

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Головна', item: 'https://check-up.in.ua/' },
    { '@type': 'ListItem', position: 2, name: 'Чекап для чоловіків', item: 'https://check-up.in.ua/ukr/male-checkup/kharkiv' },
    { '@type': 'ListItem', position: 3, name: '40–50 років', item: 'https://check-up.in.ua/ukr/male-checkup/40-50-rokiv/kharkiv' },
  ],
};

export default async function CatalogPage() {
  const programs = await fetchPrograms();
  const standard = programs.filter(isStandard);
  const regular = programs.filter(isRegular);
  const onclinic = programs.filter(p => !isStandard(p) && !isRegular(p));
  const minPrice = standard[0]?.price_discount ?? 6930;

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
          <Link href="/ukr/male-checkup/kharkiv">Чекап для чоловіків</Link>{' → '}
          <span className="text-gray-800">40–50 років</span>
        </nav>

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 leading-tight">
          Чекап для чоловіків 40-50 років у Харкові
        </h1>
        <div style={{ width: 40, height: 2, background: '#04D3D9', marginTop: 14, marginBottom: 20 }} />

        <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-gray-500 mb-8">
          <span>від {fmt(minPrice)} грн</span>
          <span>·</span>
          <span>ОН Клінік Харків</span>
        </div>

        {/* Вступ з .md */}
        <section className="mb-8">
          <p className="text-sm text-gray-700 leading-relaxed mb-3">
            {'Для чоловіків 40-50 років. Порівняно з 30-40: додано консультацію уролога, дуплексне сканування сонних артерій, УЗД щитовидної залози, скринінг колоректального раку.'}
          </p>
          <p className="text-sm text-gray-700 leading-relaxed">
            {'Розширена діагностика з урологом та скринінгом судин. Уролог оцінює результати базових аналізів та дає рекомендації щодо чоловічого здоров\'я.'}
          </p>
        </section>

        {/* Як змінюється з віком — точний текст з fixlist */}
        <section className="mb-8 bg-gray-50 rounded-xl p-5">
          <h2 className="text-base font-bold text-gray-900 mb-3">Як змінюється програма з віком</h2>
          <div className="space-y-2 text-sm text-gray-700">
            <div className="flex gap-2">
              <span className="text-gray-400 shrink-0">До 30 років</span>
              <span>{'серцево-судинна система, печінка, нирки, інфекційний скринінг (включаючи сифіліс).'}</span>
            </div>
            <div className="flex gap-2">
              <span className="text-gray-400 shrink-0">30-40 років</span>
              <span>{'додається ліпідограма, УЗД органів черевної порожнини та нирок.'}</span>
            </div>
            <div className="flex gap-2 font-medium text-[#005485]">
              <span className="shrink-0">40-50 років ←</span>
              <span>{'додається консультація уролога, дуплексне сканування сонних артерій, УЗД щитовидної залози, скринінг колоректального раку.'}</span>
            </div>
            <div className="flex gap-2">
              <span className="text-gray-400 shrink-0">Від 50 років</span>
              <span>{'додається ехокардіографія (УЗД серця). Найповніша програма.'}</span>
            </div>
          </div>
        </section>

        {/* Що перевіряється — з .md Системи організму */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Що перевіряється</h2>
          <div className="space-y-3">
            <div className="border border-gray-200 rounded-xl p-4">
              <h3 className="text-sm font-bold text-gray-900 mb-1">{'Серцево-судинна система'}</h3>
                <p className="text-xs text-gray-500 mb-2 leading-relaxed">Серцево-судинні захворювання — причина №1 смертності у чоловіків. Дуплексне сканування сонних артерій виявляє атеросклеротичні бляшки — ранню ознаку ризику інсульту.</p>
              <ul className="space-y-0.5">
                  <li className="text-xs text-gray-700 flex gap-1.5"><span className="text-gray-400 shrink-0">—</span><span>{'ЕКГ'}</span></li>
                  <li className="text-xs text-gray-700 flex gap-1.5"><span className="text-gray-400 shrink-0">—</span><span>{'Дуплексне сканування сонних артерій'}</span></li>
                  <li className="text-xs text-gray-700 flex gap-1.5"><span className="text-gray-400 shrink-0">—</span><span>{'Ліпідограма'}</span></li>
                  <li className="text-xs text-gray-700 flex gap-1.5"><span className="text-gray-400 shrink-0">—</span><span>{'Вимірювання артеріального тиску'}</span></li>
              </ul>
            </div>
            <div className="border border-gray-200 rounded-xl p-4">
              <h3 className="text-sm font-bold text-gray-900 mb-1">{'Чоловіче здоров\'я (уролог)'}</h3>
                <p className="text-xs text-gray-500 mb-2 leading-relaxed">Після 40 зростають ризики захворювань сечостатевої системи. Уролог оцінює результати базових аналізів та за потреби може індивідуально призначити ПСА та УЗД простати.</p>
              <ul className="space-y-0.5">
                  <li className="text-xs text-gray-700 flex gap-1.5"><span className="text-gray-400 shrink-0">—</span><span>{'Консультація уролога — оцінка результатів, рекомендації'}</span></li>
              </ul>
            </div>
            <div className="border border-gray-200 rounded-xl p-4">
              <h3 className="text-sm font-bold text-gray-900 mb-1">{'Ендокринна система'}</h3>
                <p className="text-xs text-gray-500 mb-2 leading-relaxed">УЗД щитовидної залози додається з 40 років для повнішої картини.</p>
              <ul className="space-y-0.5">
                  <li className="text-xs text-gray-700 flex gap-1.5"><span className="text-gray-400 shrink-0">—</span><span>{'УЗД щитовидної залози'}</span></li>
                  <li className="text-xs text-gray-700 flex gap-1.5"><span className="text-gray-400 shrink-0">—</span><span>{'ТТГ (тиреотропний гормон)'}</span></li>
                  <li className="text-xs text-gray-700 flex gap-1.5"><span className="text-gray-400 shrink-0">—</span><span>{'Глюкоза крові'}</span></li>
              </ul>
            </div>
            <div className="border border-gray-200 rounded-xl p-4">
              <h3 className="text-sm font-bold text-gray-900 mb-1">{'Шлунково-кишковий тракт та внутрішні органи'}</h3>
                <p className="text-xs text-gray-500 mb-2 leading-relaxed">Аналіз калу на приховану кров — скринінг колоректального раку.</p>
              <ul className="space-y-0.5">
                  <li className="text-xs text-gray-700 flex gap-1.5"><span className="text-gray-400 shrink-0">—</span><span>{'УЗД органів черевної порожнини'}</span></li>
                  <li className="text-xs text-gray-700 flex gap-1.5"><span className="text-gray-400 shrink-0">—</span><span>{'Аналіз калу на приховану кров'}</span></li>
                  <li className="text-xs text-gray-700 flex gap-1.5"><span className="text-gray-400 shrink-0">—</span><span>{'Печінкові проби: АЛТ, АСТ, ГГТ, білірубін'}</span></li>
                  <li className="text-xs text-gray-700 flex gap-1.5"><span className="text-gray-400 shrink-0">—</span><span>{'Гепатит B (HBsAg)'}</span></li>
                  <li className="text-xs text-gray-700 flex gap-1.5"><span className="text-gray-400 shrink-0">—</span><span>{'Гепатит C (anti-HCV)'}</span></li>
              </ul>
            </div>
            <div className="border border-gray-200 rounded-xl p-4">
              <h3 className="text-sm font-bold text-gray-900 mb-1">{'Сечовидільна система'}</h3>
              <ul className="space-y-0.5">
                  <li className="text-xs text-gray-700 flex gap-1.5"><span className="text-gray-400 shrink-0">—</span><span>{'УЗД нирок'}</span></li>
                  <li className="text-xs text-gray-700 flex gap-1.5"><span className="text-gray-400 shrink-0">—</span><span>{'Загальний аналіз сечі'}</span></li>
                  <li className="text-xs text-gray-700 flex gap-1.5"><span className="text-gray-400 shrink-0">—</span><span>{'Ниркові проби: креатинін, сечовина, сечова кислота'}</span></li>
              </ul>
            </div>
            <div className="border border-gray-200 rounded-xl p-4">
              <h3 className="text-sm font-bold text-gray-900 mb-1">{'Загальне обстеження'}</h3>
              <ul className="space-y-0.5">
                  <li className="text-xs text-gray-700 flex gap-1.5"><span className="text-gray-400 shrink-0">—</span><span>{'Загальний аналіз крові з лейкоформулою'}</span></li>
                  <li className="text-xs text-gray-700 flex gap-1.5"><span className="text-gray-400 shrink-0">—</span><span>{'Тест на ВІЛ'}</span></li>
                  <li className="text-xs text-gray-700 flex gap-1.5"><span className="text-gray-400 shrink-0">—</span><span>{'Консультація терапевта'}</span></li>
              </ul>
            </div>
          </div>
        </section>

        {/* Програми */}
        <section className="mb-10" id="programs">
          {standard.length > 0 && (
            <>
              <div className="text-[11px] font-bold tracking-widest uppercase text-[#005485] mb-1">
                Стандарт check-up.in.ua
              </div>
              <p className="text-xs text-gray-500 mb-3">
                Розроблена за міжнародними рекомендаціями. Однаковий склад у будь-якій клініці-партнері.
              </p>
              {standard.map(p => {
                const pct = discountPct(p.price_regular, p.price_discount);
                return (
                  <div key={p.id} className="border-[1.5px] border-[#005485] rounded-xl p-5 mb-3">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[10px] font-bold tracking-widest uppercase text-white bg-[#005485] px-2.5 py-1 rounded-full">
                        Стандарт
                      </span>
                      {pct > 0 && <span className="text-xs font-bold text-[#d60242] bg-red-50 px-2 py-0.5 rounded-full">-{pct}%</span>}
                    </div>
                    <h3 className="text-base font-bold text-gray-900 mb-1">{p.name_ua}</h3>
                    <p className="text-[13px] text-gray-500 mb-3">{'Терапевт, уролог · 2 візити · 11 аналізів · Дуплекс судин, УЗД щитовидної'}</p>
                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="text-2xl font-bold text-[#005485]">{fmt(p.price_discount)} грн</span>
                      {pct > 0 && <span className="text-sm text-gray-400 line-through">{fmt(p.price_regular)}</span>}
                    </div>
                    <a href="#programs" className="block w-full text-center py-3 bg-[#005485] text-white rounded-xl text-sm font-semibold hover:bg-[#003d66] transition-colors mb-2">
                      Записатися
                    </a>
                    <Link href="/ukr/male-checkup/first-checkup-40-50" className="block text-center text-[13px] text-[#005485] hover:underline">
                      Детальний склад програми →
                    </Link>
                  </div>
                );
              })}

              {regular.length > 0 && (
                <details className="mb-4">
                  <summary className="cursor-pointer text-sm text-[#005485] font-semibold py-2 list-none flex justify-between">
                    <span>Регулярна програма — {fmt(regular[0].price_discount)} грн</span>
                    <span className="text-gray-400">↓</span>
                  </summary>
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 mb-2">Скорочений склад для тих, хто вже проходив чекап 1-2 роки тому.</p>
                    {regular.map(r => (
                      <div key={r.id} className="flex items-center justify-between border border-gray-200 rounded-xl px-4 py-3">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{r.name_ua}</p>
                          <p className="text-xs text-gray-500">Щорічний моніторинг</p>
                        </div>
                        <span className="text-base font-bold text-[#005485] ml-4 shrink-0">{fmt(r.price_discount)} грн</span>
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </>
          )}

          {onclinic.length > 0 && (
            <>
              <div className="h-px bg-gray-200 my-6" />
              <div className="text-[11px] font-bold tracking-widest uppercase text-gray-500 mb-1">
                Програми ОН Клінік
              </div>
              <p className="text-xs text-gray-500 mb-3">Розширена діагностика клініки — більше спеціалістів та досліджень.</p>
              {onclinic.map(p => {
                const pct = discountPct(p.price_regular, p.price_discount);
                return (
                  <div key={p.id} className="border-[1.5px] border-gray-200 rounded-xl p-5 mb-3">
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-[10px] font-bold tracking-widest uppercase text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                        Програма ОН Клінік
                      </span>
                      {pct > 0 && <span className="text-xs font-bold text-[#d60242] bg-red-50 px-2 py-0.5 rounded-full">-{pct}%</span>}
                    </div>
                    <h3 className="text-base font-bold text-gray-900 mb-1">{p.name_ua}</h3>
                    <p className="text-[13px] text-gray-500 mb-3">
                      {[p.consultations_count ? `${p.consultations_count} консультацій` : null, p.analyses_count ? `${p.analyses_count} аналізів` : null, p.diagnostics_count ? `${p.diagnostics_count} досліджень` : null].filter(Boolean).join(' · ')}
                    </p>
                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="text-2xl font-bold text-[#005485]">{fmt(p.price_discount)} грн</span>
                      {p.price_regular > p.price_discount && <span className="text-sm text-gray-400 line-through">{fmt(p.price_regular)}</span>}
                    </div>
                    <a href="#programs" className="block w-full text-center py-3 bg-[#005485] text-white rounded-xl text-sm font-semibold hover:bg-[#003d66] transition-colors">
                      Записатися
                    </a>
                  </div>
                );
              })}
            </>
          )}
        </section>

        {/* Підготовка з .md */}
        <section className="mb-10 bg-gray-50 rounded-xl p-5">
          <h2 className="text-base font-bold text-gray-900 mb-3">Підготовка</h2>
          <ul className="space-y-1.5 text-sm text-gray-700">
            <li>{'За 24 години: без алкоголю та навантажень'}</li>
            <li>{'За 8 годин: без їжі'}</li>
            <li>{'Виключіть продукти що викликають метеоризм'}</li>
            <li>{'Підготувати зразок калу (контейнер при записі)'}</li>
            <li>{'Візьміть: паспорт, попередні результати, список ліків'}</li>
          </ul>
        </section>

        <FaqBlock items={FAQ} />

        {/* GEO — статичний блок */}
        <section className="mb-8 text-sm text-gray-600 bg-gray-50 rounded-xl p-5">
          <p>
            {`Чекап для чоловіків 40-50 років у Харкові проводиться в мережі «ОН Клінік» за трьома адресами: вул. Ярослава Мудрого, 30а; пр. Героїв Харкова, 257; вул. Молочна, 48. Стандартна програма — від 6 930 грн, розширена «Чоловічий після 40» — 15 386 грн. Ціни перевірено: квітень 2026.`}
          </p>
        </section>

        {/* E-E-A-T */}
        <section className="mb-8">
          <div className="flex gap-4 items-start">
            <div className="shrink-0 w-12 h-12 rounded-full bg-gray-200" />
            <div>
              <p className="text-sm font-bold text-gray-900">Ігор Растрепін</p>
              <p className="text-xs text-gray-500 mb-1">Засновник check-up.in.ua</p>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <span style={{ color: '#f59e0b' }}>★★★★★</span>
                <span>5.0 · 88 відгуків на Google Maps</span>
              </div>
            </div>
          </div>
          <p className="mt-3 text-sm text-gray-600 leading-relaxed">
            Програми розроблені за рекомендаціями провідних медичних організацій та перевірені на практиці з 2019 року.
          </p>
        </section>

        <p className="text-xs text-gray-400 leading-relaxed mb-8">
          Інформація має ознайомчий характер і не є медичною консультацією. Зверніться до лікаря для індивідуальних рекомендацій.
        </p>

        <nav className="text-sm">
          <p className="text-gray-500 mb-3">Інші вікові групи:</p>
          <div className="flex flex-wrap gap-2">
            <Link href="/ukr/male-checkup/do-30-rokiv/kharkiv" className="px-3 py-1.5 border border-gray-200 rounded-full text-gray-700 hover:border-[#005485] transition-colors text-xs">{'До 30 років'}</Link>
            <Link href="/ukr/male-checkup/30-40-rokiv/kharkiv" className="px-3 py-1.5 border border-gray-200 rounded-full text-gray-700 hover:border-[#005485] transition-colors text-xs">{'30–40 років'}</Link>
            <Link href="/ukr/male-checkup/vid-50-rokiv/kharkiv" className="px-3 py-1.5 border border-gray-200 rounded-full text-gray-700 hover:border-[#005485] transition-colors text-xs">{'Від 50 років'}</Link>
            <Link href="/ukr/male-checkup/kharkiv" className="px-3 py-1.5 border border-gray-200 rounded-full text-gray-700 hover:border-[#005485] transition-colors text-xs">Усі програми</Link>
          </div>
        </nav>

      </main>

      <div
        className="fixed bottom-0 z-50 bg-white border-t border-gray-200 px-4 py-3 flex justify-between items-center"
        style={{ left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 430 }}
      >
        <div>
          <p className="text-[11px] text-gray-500">Стандарт</p>
          <p className="text-base font-extrabold text-[#005485]">від {fmt(minPrice)} грн</p>
        </div>
        <a href="#programs" className="py-3 px-6 bg-[#005485] text-white rounded-xl text-sm font-bold hover:bg-[#003d66] transition-colors">
          Записатися
        </a>
      </div>
    </>
  );
}
