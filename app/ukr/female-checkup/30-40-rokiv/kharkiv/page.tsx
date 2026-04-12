import type { Metadata } from 'next';
import Link from 'next/link';
import { db } from '@/lib/supabase';
import type { CheckupProgram } from '@/lib/types';
import ProgramCatalog from '@/components/city/ProgramCatalog';
import FaqBlock from '@/components/city/FaqBlock';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Чекап для жінок 30-40 років у Харкові ፈ від 11 724 грн',
  description: 'Комплексне обстеження для жінок 30-40 — розширена біохімія, ліпідограма, гормональна панель. Від 11 724 грн в ОН Клінік Харків.',
  alternates: {
    canonical: 'https://check-up.in.ua/ukr/female-checkup/30-40-rokiv/kharkiv',
    languages: { uk: '/ukr/female-checkup/30-40-rokiv/kharkiv', ru: '/female-checkup/30-40-let/kharkov' },
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
    q = q.in('age_group', ['any', '30-40']);
    const { data } = await q;
    return (data ?? []) as CheckupProgram[];
  } catch { return []; }
}


const FAQ = [
    {
      q: 'Яка різниця між програмою для 30 і для 30-40?',
      a: 'Програма ідентична — «Жіночий профілактичний». Склад та ціна однакові для обох вікових груп. Різниця у акцентах лікаря при інтерпретації результатів.',
    },
    {
      q: 'Коли краще проходити чекап?',
      a: 'На 5-12 день менструального циклу. Кров здається натщесерце.',
    },
];

export default async function Female3040KharkivPage() {
  const programs = await fetchPrograms();

  return (
    <main className="max-w-3xl mx-auto px-4 pt-6 pb-24">
      <nav className="text-xs text-gray-500 mb-4">
        <Link href="/">Головна</Link>{' → '}
        <Link href="/ukr/female-checkup/kharkiv">Чекап для жінок</Link>{' → '}
        <span className="text-gray-800">30–40 років</span>
      </nav>

      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
        Чекап для жінок 30–40 років у Харкові
      </h1>
      <div className="h-0.5 w-16 bg-teal-400 mb-4" />

      <div className="flex flex-wrap gap-2 text-sm text-gray-500 mb-8">
        <span>від 11 724 грн</span>
        <span>·</span>
        <span>2 візити</span>
        <span>·</span>
        <span>ОН Клінік Харків</span>
      </div>

      <section className="mb-10 bg-gray-50 rounded-xl p-5">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Що перевіряти у 30–40 років</h2>
        <div className="text-sm text-gray-700">
        <p>Період максимального навантаження: кар'єра, сім'я, можливе планування вагітності. Програма розширюється за рахунок контролю обмінних процесів та серцево-судинних ризиків.</p>
        <div className="mt-3 space-y-3">
          <div><p className="font-medium text-gray-800">Все з програми до 30 +</p><p className="text-gray-600">УЗД органів черевної порожнини (печінка, жовчний міхур, підшлункова, селезінка), УЗД нирок та сечового міхура.</p></div>
          <div><p className="font-medium text-gray-800">Обмін речовин</p><p className="text-gray-600">Розширена біохімія: лужна фосфатаза, сечовина — контроль роботи нирок та печінки.</p></div>
          <div><p className="font-medium text-gray-800">Серцево-судинні ризики</p><p className="text-gray-600">ЕКГ з розшифровкою — базовий контроль ритму та провідності серця.</p></div>
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
        <p className="text-sm text-gray-600">Чекап для жінок 30-40 років у Харкові доступний в мережі «ОН Клінік Харків». Програма «Жіночий профілактичний» включає 27 досліджень. Вартість — від 11 724 грн.</p>
      </section>

      <nav className="text-sm flex flex-wrap gap-4">
        <span className="text-gray-500">Інші вікові групи:</span>
          <Link href="/ukr/female-checkup/do-30-rokiv/kharkiv" className="text-sm text-teal-600 hover:underline">До 30 років</Link>
          <Link href="/ukr/female-checkup/40-50-rokiv/kharkiv" className="text-sm text-teal-600 hover:underline">40–50 років</Link>
          <Link href="/ukr/female-checkup/vid-50-rokiv/kharkiv" className="text-sm text-teal-600 hover:underline">Від 50 років</Link>
      </nav>
    </main>
  );
}
