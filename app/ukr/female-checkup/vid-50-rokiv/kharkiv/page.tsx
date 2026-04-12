import type { Metadata } from 'next';
import Link from 'next/link';
import { db } from '@/lib/supabase';
import type { CheckupProgram } from '@/lib/types';
import ProgramCatalog from '@/components/city/ProgramCatalog';
import FaqBlock from '@/components/city/FaqBlock';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Чекап для жінок після 50 років у Харкові ፈ від 14 634 грн',
  description: 'Комплексне обстеження для жінок після 50 — серце, судини, онкоскринінг, метаболізм. Від 14 634 грн в ОН Клінік Харків.',
  alternates: {
    canonical: 'https://check-up.in.ua/ukr/female-checkup/vid-50-rokiv/kharkiv',
    languages: { uk: '/ukr/female-checkup/vid-50-rokiv/kharkiv', ru: '/female-checkup/ot-50-let/kharkov' },
  },
};

async function fetchPrograms() {
  try {
    let q = db()
      .from('checkup_programs')
      .select('*')
      .eq('clinic_id', '4d7134c2-1ec4-4ee3-a19a-6021b085fa88')
      .eq('gender', 'female')
      .eq('is_active', true)
      .eq('is_specialized', false)
      .order('price_discount', { ascending: true });
    q = q.in('age_group', ['after-40', 'any']);
    const { data } = await q;
    return (data ?? []) as CheckupProgram[];
  } catch { return []; }
}


const FAQ = [
    {
      q: 'Чи однакова програма для 40-50 та після 50?',
      a: 'Так, програма «Жіночий після 40» однакова за складом. Різниця — в акцентах лікаря: після 50 особлива увага приділяється серцево-судинній системі та профілактиці остеопорозу.',
    },
    {
      q: 'Як часто проходити чекап після 50?',
      a: 'Щорічно. При виявленні відхилень — за рекомендацією лікаря, можливо частіше.',
    },
];

export default async function FemaleVid50KharkivPage() {
  const programs = await fetchPrograms();

  return (
    <main className="max-w-3xl mx-auto px-4 pt-6 pb-24">
      <nav className="text-xs text-gray-500 mb-4">
        <Link href="/">Головна</Link>{' → '}
        <Link href="/ukr/female-checkup/kharkiv">Чекап для жінок</Link>{' → '}
        <span className="text-gray-800">Від 50 років</span>
      </nav>

      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
        Чекап для жінок після 50 років у Харкові
      </h1>
      <div className="h-0.5 w-16 bg-teal-400 mb-4" />

      <div className="flex flex-wrap gap-2 text-sm text-gray-500 mb-8">
        <span>від 14 634 грн</span>
        <span>·</span>
        <span>2 візити</span>
        <span>·</span>
        <span>ОН Клінік Харків</span>
      </div>

      <section className="mb-10 bg-gray-50 rounded-xl p-5">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Що перевіряти після 50 років</h2>
        <div className="text-sm text-gray-700">
        <p>Максимально широка програма обстеження. Після 50 зростає значення кожного компоненту — від серцево-судинної системи до метаболізму та онкоскринінгу.</p>
        <div className="mt-3 space-y-3">
          <div><p className="font-medium text-gray-800">Серцево-судинна система</p><p className="text-gray-600">Менопауза знижує захисний вплив естрогенів на серце та судини. Коагулограма, ліпідограма та ЕКГ — обов'язкові щорічно.</p></div>
          <div><p className="font-medium text-gray-800">Кісткова система та метаболізм</p><p className="text-gray-600">Вітамін D, кальцій, загальний білок, альбумін — контроль ризику остеопорозу. Глюкоза та біохімія печінки.</p></div>
          <div><p className="font-medium text-gray-800">Онкоскринінг</p><p className="text-gray-600">ПАП-тест, УЗД молочних залоз, огляд проктолога — мінімальний набір після 50. При спадковій обтяженості терапевт може рекомендувати додаткові дослідження.</p></div>
        </div>
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
        <p className="text-sm text-gray-600">Чекап для жінок після 50 у Харкові проводиться в мережі «ОН Клінік Харків». Програма «Жіночий після 40» — 6 консультацій та 20 аналізів. Вартість — від 14 634 грн.</p>
      </section>

      <nav className="text-sm flex flex-wrap gap-4">
        <span className="text-gray-500">Інші вікові групи:</span>
          <Link href="/ukr/female-checkup/do-30-rokiv/kharkiv" className="text-sm text-teal-600 hover:underline">До 30 років</Link>
          <Link href="/ukr/female-checkup/30-40-rokiv/kharkiv" className="text-sm text-teal-600 hover:underline">30–40 років</Link>
          <Link href="/ukr/female-checkup/40-50-rokiv/kharkiv" className="text-sm text-teal-600 hover:underline">40–50 років</Link>
      </nav>
    </main>
  );
}
