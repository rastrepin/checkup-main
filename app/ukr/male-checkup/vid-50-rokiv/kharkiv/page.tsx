import type { Metadata } from 'next';
import Link from 'next/link';
import { db } from '@/lib/supabase';
import type { CheckupProgram } from '@/lib/types';
import ProgramCatalog from '@/components/city/ProgramCatalog';
import FaqBlock from '@/components/city/FaqBlock';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Чекап для чоловіків після 50 років у Харкові ፈ від 15 386 грн',
  description: 'Комплексне обстеження для чоловіків після 50 — простата, серце, судини, метаболізм. Від 15 386 грн в ОН Клінік Харків.',
  alternates: {
    canonical: 'https://check-up.in.ua/ukr/male-checkup/vid-50-rokiv/kharkiv',
    languages: { uk: '/ukr/male-checkup/vid-50-rokiv/kharkiv', ru: '/male-checkup/ot-50-let/kharkov' },
  },
};

async function fetchPrograms() {
  try {
    let q = db()
      .from('checkup_programs')
      .select('*')
      .eq('clinic_id', '4d7134c2-1ec4-4ee3-a19a-6021b085fa88')
      .eq('gender', 'male')
      .eq('is_active', true)
      .eq('is_specialized', false)
      .order('price_discount', { ascending: true });
    q = q.in('age_group', ['after-40', 'any']);
    const { data } = await q;
    return (data ?? []) as CheckupProgram[];
  } catch { return []; }
}

const FAQ = [
  { q: 'Чи однакова програма для 40-50 та після 50?', a: 'Так, програма «Чоловічий після 40» однакова за складом. Різниця — в акцентах: після 50 особлива увага ПСА та серцево-судинній системі.' },
  { q: 'Як часто проходити чекап після 50?', a: "Щорічно. ПСА — щорічний контроль обов'язковий." },
];

export default async function MaleVid50KharkivPage() {
  const programs = await fetchPrograms();

  return (
    <main className="max-w-3xl mx-auto px-4 pt-6 pb-24">
      <nav className="text-xs text-gray-500 mb-4">
        <Link href="/">Головна</Link>{' → '}
        <Link href="/ukr/male-checkup/kharkiv">Чекап для чоловіків</Link>{' → '}
        <span className="text-gray-800">Від 50 років</span>
      </nav>

      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
        Чекап для чоловіків після 50 років у Харкові
      </h1>
      <div className="h-0.5 w-16 bg-teal-400 mb-4" />

      <div className="flex flex-wrap gap-2 text-sm text-gray-500 mb-8">
        <span>від 15 386 грн</span>
        <span>·</span>
        <span>2 візити</span>
        <span>·</span>
        <span>ОН Клінік Харків</span>
      </div>

      <section className="mb-10 bg-gray-50 rounded-xl p-5">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Що перевіряти після 50 років</h2>
        <div className="space-y-3 text-sm">
          <div><p className="font-medium text-gray-800">Простата</p><p className="text-gray-600">Обов'язковий щорічний контроль ПСА. Рак простати — найпоширеніше онкозахворювання у чоловіків після 50. Раннє виявлення через ПСА рятує життя.</p></div>
          <div><p className="font-medium text-gray-800">Серце та судини</p><p className="text-gray-600">Коагулограма, ліпідограма, ЕКГ щорічно. При відхиленнях — рекомендація на кардіологічний (11 336 грн) або судинний (10 263 грн) чекап.</p></div>
          <div><p className="font-medium text-gray-800">Метаболізм</p><p className="text-gray-600">Глюкоза, гормональний профіль, щитоподібна залоза. Ризик діабету 2 типу зростає після 50.</p></div>
        </div>
      </section>

      {programs.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Програма обстеження в ОН Клінік Харків</h2>
          <ProgramCatalog programs={programs} />
        </section>
      )}

      <FaqBlock items={FAQ} />

      <section className="mb-8">
        <p className="text-sm text-gray-600">Чекап для чоловіків після 50 у Харкові проводиться в мережі «ОН Клінік Харків». Програма «Чоловічий після 40» включає ПСА та розширену діагностику. Вартість — від 15 386 грн.</p>
      </section>

      <nav className="text-sm flex flex-wrap gap-4">
        <span className="text-gray-500">Інші вікові групи:</span>
        <Link href="/ukr/male-checkup/do-30-rokiv/kharkiv" className="text-sm text-teal-600 hover:underline">До 30 років</Link>
        <Link href="/ukr/male-checkup/30-40-rokiv/kharkiv" className="text-sm text-teal-600 hover:underline">30–40 років</Link>
        <Link href="/ukr/male-checkup/40-50-rokiv/kharkiv" className="text-sm text-teal-600 hover:underline">40–50 років</Link>
      </nav>
    </main>
  );
}
