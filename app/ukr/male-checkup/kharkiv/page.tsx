import type { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

export const revalidate = 3600;
const CLINIC_ID = '4d7134c2-1ec4-4ee3-a19a-6021b085fa88';

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export const metadata: Metadata = {
  title: 'Чекап для чоловіків у Харкові 2026 — програми та ціни | check-up.in.ua',
  description: 'Комплексне обстеження для чоловіків у Харкові: програми за віком від 20 до 60+. Серце, судини, простата, гормони. ОН Клінік Харків.',
  alternates: {
    canonical: 'https://check-up.in.ua/ukr/male-checkup/kharkiv',
    languages: {
      'uk': 'https://check-up.in.ua/ukr/male-checkup/kharkiv',
      'ru': 'https://check-up.in.ua/male-checkup/kharkov',
    },
  },
};

const AGE_NAV = [
  { label: 'До 30 років', href: '/ukr/male-checkup/do-30-rokiv/kharkiv' },
  { label: '30–40 років', href: '/ukr/male-checkup/30-40-rokiv/kharkiv' },
  { label: '40–50 років', href: '/ukr/male-checkup/40-50-rokiv/kharkiv' },
  { label: 'Від 50 років', href: '/ukr/male-checkup/vid-50-rokiv/kharkiv' },
];

const FAQ = [
  {
    q: 'Які аналізи входять у чоловічий чек-ап?',
    a: 'Залежно від програми: загальний аналіз крові, ліпідний профіль, ПСА (простата), тестостерон, УЗД органів черевної порожнини, ЕКГ, консультація уролога та кардіолога.',
  },
  {
    q: 'Як часто чоловікам потрібен чек-ап?',
    a: 'До 40 років — раз на рік. Після 40 — раз на 6 місяців, особливо за наявності ризиків: куріння, гіпертонія, зайва вага.',
  },
  {
    q: 'Чи виявляє чек-ап рак простати?',
    a: 'Так: аналіз на ПСА (простатичний специфічний антиген) входить у більшість чоловічих програм після 40 років. При підвищеному ПСА призначається біопсія.',
  },
  {
    q: 'Скільки часу займає обстеження?',
    a: 'Базові програми проходяться за один візит — 2–4 години. Розширені можуть потребувати 2 візити.',
  },
];

function fmt(n: number) { return n.toLocaleString('uk-UA'); }
function pct(regular: number, sale: number) { return Math.round((1 - sale / regular) * 100); }

export default async function Page() {
  const { data: programs } = await db()
    .from('checkup_programs')
    .select('*')
    .eq('clinic_id', CLINIC_ID)
    .eq('gender', 'male')
    .eq('is_specialized', false)
    .order('price_discount');

  const safe = programs ?? [];
  const minPrice = safe.length ? Math.min(...safe.map((p: any) => p.price_discount)) : 0;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{__html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'MedicalWebPage',
          name: 'Чекап для чоловіків у Харкові',
          url: 'https://check-up.in.ua/ukr/male-checkup/kharkiv',
          inLanguage: 'uk',
        })}}
      />
      <main className="bg-[#f9fbfd] min-h-screen">
        <div className="max-w-4xl mx-auto px-4 py-8">

          <nav className="text-xs text-gray-400 mb-6 flex flex-wrap gap-1 items-center">
            <Link href="/" className="hover:text-[#005485]">Головна</Link>
            <span>→</span>
            <Link href="/ukr/kharkiv" className="hover:text-[#005485]">Харків</Link>
            <span>→</span>
            <span className="text-gray-600">Чекап для чоловіків</span>
          </nav>

          <div className="mb-10">
            <h1 className="text-3xl font-bold text-[#0b1a24] mb-3 h1-teal-line">
              Чоловічий чек-ап у Харкові
            </h1>
            <p className="text-gray-500 mt-4 mb-4 max-w-xl">
              Комплексні програми для чоловіків: серцево-судинна система, урологічне здоров'я, гормональний баланс. Обстеження підібрані за вашим віком і ризиками.
            </p>
            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#04D3D9] inline-block" />{safe.length} програм для чоловіків</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#04D3D9] inline-block" />від {fmt(minPrice)} грн</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#04D3D9] inline-block" />ОН Клінік Харків</span>
            </div>
          </div>

          <section className="mb-10">
            <h2 className="text-lg font-bold text-[#0b1a24] mb-4">Оберіть вашу вікову групу</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {AGE_NAV.map(ag => (
                <Link key={ag.href} href={ag.href}
                  className="block text-center py-3 px-4 rounded-[10px] bg-white border-2 border-[#005485] text-[#005485] text-sm font-semibold hover:bg-[#005485] hover:text-white transition-all">
                  {ag.label}
                </Link>
              ))}
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-[#0b1a24] mb-6">Усі програми чоловічого чек-апу</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {safe.map((p: any) => {
                const d = pct(p.price_regular, p.price_discount);
                return (
                  <div key={p.id} className="bg-white border border-gray-200 rounded-[10px] p-5">
                    <div className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full bg-[#e8f4fd] text-[#005485] mb-3">ОН Клінік Харків</div>
                    <h3 className="text-base font-bold text-[#0b1a24] mb-2 leading-snug">{p.name_ua}</h3>
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-xl font-bold text-[#0b1a24]">{fmt(p.price_discount)} грн</span>
                      {d > 0 && <>
                        <span className="text-sm text-gray-400 line-through">{fmt(p.price_regular)}</span>
                        <span className="text-xs font-bold text-white bg-[#d60242] px-1.5 py-0.5 rounded">-{d}%</span>
                      </>}
                    </div>
                    <p className="text-[13px] text-gray-500 mb-4">
                      {[
                        p.consultations_count ? `${p.consultations_count} консультацій` : null,
                        p.analyses_count ? `${p.analyses_count} аналізів` : null,
                        p.diagnostics_count ? `${p.diagnostics_count} досліджень` : null,
                      ].filter(Boolean).join(' · ')}
                    </p>
                    <a href={`https://onclinic.check-up.in.ua/kharkiv/checkup/${p.slug}`}
                      className="block w-full text-center py-3 rounded-[10px] bg-[#005485] text-white font-semibold text-sm hover:bg-[#004470] transition-colors">
                      Записатися
                    </a>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="bg-white rounded-[12px] border border-gray-100 px-6 py-7 mb-10">
            <h2 className="text-xl font-bold text-[#0b1a24] mb-4">Навіщо чоловіку регулярний чек-ап</h2>
            <div className="space-y-3 text-sm text-gray-600">
              <p>Чоловіки рідше звертаються до лікарів профілактично — і тому частіше виявляють хвороби вже на пізніх стадіях. Чек-ап змінює цю ситуацію: обстеження займає кілька годин, а виявлені ризики можна усунути на ранньому етапі.</p>
              <p>Чоловічі програми в ОН Клінік Харків включають кардіологічний скринінг, оцінку рівня тестостерону, стан простати (ПСА) та загальний метаболічний профіль.</p>
              <p>Після 40 ризики серцево-судинних захворювань і онкології суттєво зростають — саме тому розширений чек-ап раз на 6 місяців є стандартом профілактичної медицини.</p>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-bold text-[#0b1a24] mb-5">Часті запитання</h2>
            <div className="space-y-3">
              {FAQ.map((item, i) => (
                <details key={i} className="bg-white border border-gray-200 rounded-[10px] group">
                  <summary className="flex items-center justify-between px-5 py-4 cursor-pointer text-sm font-semibold text-[#0b1a24] list-none">
                    {item.q}
                    <svg className="w-4 h-4 text-gray-400 shrink-0 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="px-5 pb-4 text-sm text-gray-600">{item.a}</div>
                </details>
              ))}
            </div>
          </section>

          <div className="rounded-[12px] bg-[#005485] text-white px-6 py-8 text-center">
            <h2 className="text-xl font-bold mb-2">Не знаєте, яка програма підходить?</h2>
            <p className="text-blue-100 text-sm mb-5">Пройдіть короткий тест — підберемо оптимальний варіант за 2 хвилини.</p>
            <Link href="/ukr/kharkiv#quiz"
              className="inline-block bg-white text-[#005485] font-bold text-sm px-6 py-3 rounded-[10px] hover:bg-blue-50 transition-colors">
              Пройти тест
            </Link>
          </div>

        </div>
      </main>
    </>
  );
}
