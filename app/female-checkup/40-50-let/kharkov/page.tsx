import type { Metadata } from 'next';
import Link from 'next/link';
import { db } from '@/lib/supabase';
import type { CheckupProgram } from '@/lib/types';
import ProgramCatalogRu from '@/components/city/ProgramCatalogRu';
import FaqBlock from '@/components/city/FaqBlock';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Женский чекап 40-50 лет в Харькове ፈ от 14 634 грн',
  description: 'Комплексное обследование для женщин 40-50 — кардиодиагностика, коагулограмма, 6 консультаций. От 14 634 грн в ОН Клиник Харьков.',
  alternates: {
    canonical: 'https://check-up.in.ua/female-checkup/40-50-let/kharkov',
    languages: { ru: '/female-checkup/40-50-let/kharkov', uk: '/ukr/female-checkup/40-50-rokiv/kharkiv' },
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
  { q: 'Что добавляется в программе после 40?', a: 'Коагулограмма, липидограмма, тест на H. pylori, консультации гастроэнтеролога, невропатолога и проктолога. Итого 20 анализов и 6 консультаций.' },
  { q: 'Как часто проходить чекап после 40?', a: 'Ежегодно. ВОЗ рекомендует ежегодное полное обследование после 40 лет.' },
];

export default async function Female4050KharkovPage() {
  const programs = await fetchPrograms();

  return (
    <main className="max-w-3xl mx-auto px-4 pt-6 pb-24">
      <nav className="text-xs text-gray-500 mb-4">
        <Link href="/">Главная</Link>{' → '}
        <Link href="/female-checkup/kharkov">Женский чекап</Link>{' → '}
        <span className="text-gray-800">40–50 лет</span>
      </nav>

      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
        Женский чекап 40–50 лет в Харькове
      </h1>
      <div className="h-0.5 w-16 bg-teal-400 mb-4" />

      <div className="flex flex-wrap gap-2 text-sm text-gray-500 mb-8">
        <span>от 14 634 грн</span>
        <span>·</span>
        <span>2 визита</span>
        <span>·</span>
        <span>ОН Клиник Харьков</span>
      </div>

      <section className="mb-10 bg-gray-50 rounded-xl p-5">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Что проверять в 40–50 лет</h2>
        <div className="space-y-3 text-sm">
          <div><p className="font-medium text-gray-800">6 консультаций специалистов</p><p className="text-gray-600">Терапевт (2 визита), гинеколог, гастроэнтеролог, невропатолог, проктолог. Каждый специалист оценивает свою систему.</p></div>
          <div><p className="font-medium text-gray-800">Кардиориски</p><p className="text-gray-600">Коагулограмма (6 показателей свёртываемости крови), липидограмма, ЭКГ. Выявляют риски инфаркта и инсульта за годы до их возникновения.</p></div>
          <div><p className="font-medium text-gray-800">ЖКТ</p><p className="text-gray-600">Тест на Helicobacter pylori, УЗИ брюшной полости, консультация проктолога — скрининг колоректального рака.</p></div>
        </div>
      </section>

      {programs.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Программа обследования в ОН Клиник Харьков</h2>
          <ProgramCatalogRu programs={programs} />
        </section>
      )}

      <FaqBlock items={FAQ} />

      <section className="mb-8">
        <p className="text-sm text-gray-600">Женский чекап 40-50 лет в Харькове проводится в сети «ОН Клиник Харьков». Программа «Женский после 40» — 6 консультаций и 20 анализов. Стоимость — от 14 634 грн.</p>
      </section>

      <nav className="text-sm flex flex-wrap gap-4">
        <span className="text-gray-500">Другие возрастные группы:</span>
        <Link href="/female-checkup/do-30-let/kharkov" className="text-sm text-teal-600 hover:underline">До 30 лет</Link>
        <Link href="/female-checkup/30-40-let/kharkov" className="text-sm text-teal-600 hover:underline">30–40 лет</Link>
        <Link href="/female-checkup/ot-50-let/kharkov" className="text-sm text-teal-600 hover:underline">От 50 лет</Link>
      </nav>
    </main>
  );
}
