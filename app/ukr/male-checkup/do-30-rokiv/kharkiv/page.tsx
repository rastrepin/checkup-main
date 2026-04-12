import type { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

export const revalidate = 3600;
const CLINIC_ID = '4d7134c2-1ec4-4ee3-a19a-6021b085fa88';

function db() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
}

export const metadata: Metadata = {
  title: 'Чекап для чоловіків до 30 років у Харкові 2026 | check-up.in.ua',
  description: 'Базове обстеження для чоловіків до 30 років у Харкові: ОАК, глюкоза, ЕКГ, консультація уролога. ОН Клінік Харків.',
  alternates: {
    canonical: 'https://check-up.in.ua/ukr/male-checkup/do-30-rokiv/kharkiv',
    languages: {
      'uk': 'https://check-up.in.ua/ukr/male-checkup/do-30-rokiv/kharkiv',
      'ru': 'https://check-up.in.ua/male-checkup/do-30-let/kharkov',
    },
  },
};

function fmt(n: number) { return n.toLocaleString('uk-UA'); }
function pct(r: number, s: number) { return Math.round((1 - s / r) * 100); }

export default async function Page() {
  const { data: programs } = await db()
    .from('checkup_programs')
    .select('*')
    .eq('clinic_id', CLINIC_ID)
    .eq('gender', 'male')
    .in('age_group', ['do-30', 'any'])
    .eq('is_specialized', false)
    .order('price_discount');

  const safe = programs ?? [];

  return (
    <main className="bg-[#f9fbfd] min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-8">

        <nav className="text-xs text-gray-400 mb-6 flex flex-wrap gap-1 items-center">
          <Link href="/" className="hover:text-[#005485]">Головна</Link>
          <span>→</span>
          <Link href="/ukr/kharkiv" className="hover:text-[#005485]">Харків</Link>
          <span>→</span>
          <Link href="/ukr/male-checkup/kharkiv" className="hover:text-[#005485]">Чекап для чоловіків</Link>
          <span>→</span>
          <span className="text-gray-600">До 30 років</span>
        </nav>

        <div className="mb-10">
          <h1 className="text-3xl font-bold text-[#0b1a24] mb-3 h1-teal-line">
            Чекап для чоловіків до 30 років у Харкові
          </h1>
          <p className="text-gray-500 mt-4 max-w-xl">Базове обстеження для чоловіків до 30 років у Харкові: ОАК, глюкоза, ЕКГ, консультація уролога. ОН Клінік Харків.</p>
        </div>

        {safe.length > 0 ? (
          <section className="mb-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {safe.map((p: any) => {
                const d = pct(p.price_regular, p.price_discount);
                return (
                  <div key={p.id} className="bg-white border border-gray-200 rounded-[10px] p-5">
                    <div className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full bg-[#e8f4fd] text-[#005485] mb-3">ОН Клінік Харків</div>
                    <h3 className="text-base font-bold text-[#0b1a24] mb-2 leading-snug">{p.name_ua}</h3>
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-xl font-bold text-[#0b1a24]">{fmt(p.price_discount)} грн</span>
                      {d > 0 && <><span className="text-sm text-gray-400 line-through">{fmt(p.price_regular)}</span><span className="text-xs font-bold text-white bg-[#d60242] px-1.5 py-0.5 rounded">-{d}%</span></>}
                    </div>
                    <p className="text-[13px] text-gray-500 mb-4">
                      {[p.consultations_count ? `${p.consultations_count} консультацій` : null, p.analyses_count ? `${p.analyses_count} аналізів` : null, p.diagnostics_count ? `${p.diagnostics_count} досліджень` : null].filter(Boolean).join(' · ')}
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
        ) : (
          <p className="text-gray-400 mb-10">Програми для цієї групи незабаром з'являться.</p>
        )}

        <section className="bg-white rounded-[12px] border border-gray-100 px-6 py-6 mb-10 text-sm text-gray-600 space-y-3">
          <p>У молодому віці рекомендується встановити базові показники: загальний аналіз крові, глюкоза, холестерин, ЕКГ і консультація уролога.</p>
          <p>Програма допомагає виявити ранні метаболічні порушення та відхилення в роботі серця, навіть за відсутності симптомів.</p>
        </section>

        <div className="rounded-[12px] bg-[#005485] text-white px-6 py-8 text-center">
          <h2 className="text-xl font-bold mb-2">Потрібна консультація?</h2>
          <p className="text-blue-100 text-sm mb-5">Підберемо програму за вашим станом здоров'я та бюджетом.</p>
          <Link href="/ukr/kharkiv#quiz"
            className="inline-block bg-white text-[#005485] font-bold text-sm px-6 py-3 rounded-[10px] hover:bg-blue-50 transition-colors">
            Пройти тест
          </Link>
        </div>

      </div>
    </main>
  );
}
