import type { Metadata } from 'next';
import Link from 'next/link';
import { db } from '@/lib/supabase';
import type { CheckupProgram } from '@/lib/types';
import ProgramCatalogRu from '@/components/city/ProgramCatalogRu';
import FaqBlock from '@/components/city/FaqBlock';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Женский чекап до 30 лет в Харькове ፈ от 11 724 грн',
  description: 'Комплексное обследование для женщин до 30 — репродуктивное здоровье, щитовидная железа, онкоскрининг. От 11 724 грн в ОН Клиник Харьков.',
  alternates: {
    canonical: 'https://check-up.in.ua/female-checkup/do-30-let/kharkov',
    languages: { ru: '/female-checkup/do-30-let/kharkov', uk: '/ukr/female-checkup/do-30-rokiv/kharkiv' },
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
    q = q.in('age_group', ['any', 'do-30']);
    const { data } = await q;
    return (data ?? []) as CheckupProgram[];
  } catch { return []; }
}

const FAQ = [
  { q: 'Что входит в женский профилактический чекап?', a: 'Консультация терапевта (2 визита), гинеколога, 14 анализов (ПАП-тест, Фемофлор-Скрин, тиреоидный пакет, витамин D, биохимия), 7 видов УЗИ и ЭКГ. Всего 27 исследований.' },
  { q: 'Когда лучше проходить чекап?', a: 'На 5-12 день менструального цикла. Кровь сдаётся натощак.' },
];

export default async function FemaleDo30KharkovPage() {
  const programs = await fetchPrograms();

  return (
    <main className="max-w-3xl mx-auto px-4 pt-6 pb-24">
      <nav className="text-xs text-gray-500 mb-4">
        <Link href="/">Главная</Link>{' → '}
        <Link href="/female-checkup/kharkov">Женский чекап</Link>{' → '}
        <span className="text-gray-800">До 30 лет</span>
      </nav>

      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
        Женский чекап до 30 лет в Харькове
      </h1>
      <div className="h-0.5 w-16 bg-teal-400 mb-4" />

      <div className="flex flex-wrap gap-2 text-sm text-gray-500 mb-8">
        <span>от 11 724 грн</span>
        <span>·</span>
        <span>2 визита</span>
        <span>·</span>
        <span>ОН Клиник Харьков</span>
      </div>

      <section className="mb-10 bg-gray-50 rounded-xl p-5">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Что проверять до 30 лет</h2>
        <div className="space-y-3 text-sm">
          <div><p className="font-medium text-gray-800">Репродуктивное здоровье</p><p className="text-gray-600">Гинекологический осмотр с видеокольпоскопией, трансвагинальное УЗИ, ПАП-тест, скрининг урогенитальных инфекций (Фемофлор-Скрин).</p></div>
          <div><p className="font-medium text-gray-800">Щитовидная железа</p><p className="text-gray-600">Тиреоидный пакет (ТТГ, Т4, Т3, АТ ТПО) и УЗИ щитовидной железы. Нарушения функции — одна из самых частых причин усталости и нарушений цикла.</p></div>
          <div><p className="font-medium text-gray-800">Молочные железы</p><p className="text-gray-600">УЗИ молочных желез с допплерометрией. До 40 лет — основной метод скрининга.</p></div>
          <div><p className="font-medium text-gray-800">Базовая биохимия</p><p className="text-gray-600">Печёночные пробы, глюкоза, креатинин, общий белок. Витамин D — дефицит у более 60% женщин.</p></div>
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
        <p className="text-sm text-gray-600">Женский чекап до 30 лет в Харькове проводится в сети «ОН Клиник Харьков». Программа «Женский профилактический» — 27 исследований. Стоимость — от 11 724 грн.</p>
      </section>

      <nav className="text-sm flex flex-wrap gap-4">
        <span className="text-gray-500">Другие возрастные группы:</span>
        <Link href="/female-checkup/30-40-let/kharkov" className="text-sm text-teal-600 hover:underline">30–40 лет</Link>
        <Link href="/female-checkup/40-50-let/kharkov" className="text-sm text-teal-600 hover:underline">40–50 лет</Link>
        <Link href="/female-checkup/ot-50-let/kharkov" className="text-sm text-teal-600 hover:underline">От 50 лет</Link>
      </nav>
    </main>
  );
}
