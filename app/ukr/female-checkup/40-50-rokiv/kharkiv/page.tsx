import type { Metadata } from 'next';
import Link from 'next/link';
import { db } from '@/lib/supabase';
import type { CheckupProgram } from '@/lib/types';
import ProgramCatalog from '@/components/city/ProgramCatalog';
import FaqBlock from '@/components/city/FaqBlock';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Чекап для жінок 40-50 років у Харкові ፈ від 14 634 грн',
  description: 'Комплексне обстеження для жінок 40-50 — кардіодіагностика, коагулограма, 6 консультацій. Від 14 634 грн в ОН Клінік Харків.',
  alternates: {
    canonical: 'https://check-up.in.ua/ukr/female-checkup/40-50-rokiv/kharkiv',
    languages: { uk: '/ukr/female-checkup/40-50-rokiv/kharkiv', ru: '/female-checkup/40-50-let/kharkov' },
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
      q: 'Що додається в програмі після 40?',
      a: 'До стандартного профілактичного чекапу додаються: коагулограма, ліпідограма, тест на H. pylori, консультації гастроентеролога, невропатолога та проктолога. Всього 20 аналізів та 6 консультацій.',
    },
    {
      q: 'Як часто проходити чекап після 40?',
      a: 'Щорічно. ВООЗ та більшість клінічних протоколів рекомендують щорічне повне обстеження після 40 років.',
    },
];

export default async function Female4050KharkivPage() {
  const programs = await fetchPrograms();

  return (
    <main className="max-w-3xl mx-auto px-4 pt-6 pb-24">
      <nav className="text-xs text-gray-500 mb-4">
        <Link href="/">Головна</Link>{' → '}
        <Link href="/ukr/female-checkup/kharkiv">Чекап для жінок</Link>{' → '}
        <span className="text-gray-800">40–50 років</span>
      </nav>

      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
        Чекап для жінок 40–50 років у Харкові
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
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Що перевіряти у 40–50 років</h2>
        <div className="text-sm text-gray-700">
        <p>Після 40 ризики зростають: серцево-судинні захворювання, онкологія, метаболічні порушення. ВООЗ рекомендує щорічне обстеження з цього віку.</p>
        <div className="mt-3 space-y-3">
          <div><p className="font-medium text-gray-800">6 консультацій спеціалістів</p><p className="text-gray-600">Терапевт (2 візити), гінеколог, гастроентеролог, невропатолог, проктолог. Кожен спеціаліст оцінює свою систему, терапевт зводить загальну картину.</p></div>
          <div><p className="font-medium text-gray-800">Кардіоризики</p><p className="text-gray-600">Коагулограма (6 показників згортання крові), ліпідограма (повний ліпідний профіль), ЕКГ. Виявляють ризики інфаркту та інсульту за роки до їх виникнення.</p></div>
          <div><p className="font-medium text-gray-800">Шлунково-кишковий тракт</p><p className="text-gray-600">Тест на Helicobacter pylori, УЗД черевної порожнини, консультація проктолога — скринінг колоректального раку.</p></div>
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
        <p className="text-sm text-gray-600">Чекап для жінок 40-50 років у Харкові проводиться в мережі «ОН Клінік Харків». Програма «Жіночий після 40» включає 6 консультацій та 20 аналізів. Вартість — від 14 634 грн.</p>
      </section>

      <nav className="text-sm flex flex-wrap gap-4">
        <span className="text-gray-500">Інші вікові групи:</span>
          <Link href="/ukr/female-checkup/do-30-rokiv/kharkiv" className="text-sm text-teal-600 hover:underline">До 30 років</Link>
          <Link href="/ukr/female-checkup/30-40-rokiv/kharkiv" className="text-sm text-teal-600 hover:underline">30–40 років</Link>
          <Link href="/ukr/female-checkup/vid-50-rokiv/kharkiv" className="text-sm text-teal-600 hover:underline">Від 50 років</Link>
      </nav>
    </main>
  );
}
