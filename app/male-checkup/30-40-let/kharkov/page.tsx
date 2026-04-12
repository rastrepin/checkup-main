import type { Metadata } from 'next';
import Link from 'next/link';
import { db } from '@/lib/supabase';
import type { CheckupProgram } from '@/lib/types';
import ProgramCatalogRu from '@/components/city/ProgramCatalogRu';
import FaqBlock from '@/components/city/FaqBlock';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Мужской чекап 30-40 лет в Харькове ፈ от 7 722 грн',
  description: 'Комплексное обследование для мужчин 30-40 — сердечно-сосудистые риски, липидограмма, щитовидная железа. От 7 722 грн в ОН Клиник Харьков.',
  alternates: {
    canonical: 'https://check-up.in.ua/male-checkup/30-40-let/kharkov',
    languages: { ru: '/male-checkup/30-40-let/kharkov', uk: '/ukr/male-checkup/30-40-rokiv/kharkiv' },
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
    q = q.in('age_group', ['any', '30-40']);
    const { data } = await q;
    return (data ?? []) as CheckupProgram[];
  } catch { return []; }
}

const FAQ = [
  { q: 'Чем отличается программа 30-40 от до 30?', a: 'Состав одинаковый. Разница — в акцентах: в 30-40 больше внимания липидному профилю и сердечно-сосудистым рискам.' },
  { q: 'Как часто проходить чекап?', a: 'До 40 лет — раз в 2-3 года при отсутствии жалоб.' },
];

export default async function Male3040KharkovPage() {
  const programs = await fetchPrograms();

  return (
    <main className="max-w-3xl mx-auto px-4 pt-6 pb-24">
      <nav className="text-xs text-gray-500 mb-4">
        <Link href="/">Главная</Link>{' → '}
        <Link href="/male-checkup/kharkov">Мужской чекап</Link>{' → '}
        <span className="text-gray-800">30–40 лет</span>
      </nav>

      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
        Мужской чекап 30–40 лет в Харькове
      </h1>
      <div className="h-0.5 w-16 bg-teal-400 mb-4" />

      <div className="flex flex-wrap gap-2 text-sm text-gray-500 mb-8">
        <span>от 7 722 грн</span>
        <span>·</span>
        <span>2 визита</span>
        <span>·</span>
        <span>ОН Клиник Харьков</span>
      </div>

      <section className="mb-10 bg-gray-50 rounded-xl p-5">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Что проверять в 30–40 лет</h2>
        <div className="space-y-3 text-sm">
          <div><p className="font-medium text-gray-800">Всё из программы до 30</p><p className="text-gray-600">Урологический скрининг и гормональный профиль сохраняются.</p></div>
          <div><p className="font-medium text-gray-800">Сердечно-сосудистые риски</p><p className="text-gray-600">Липидограмма — контроль холестерина и риска атеросклероза.</p></div>
          <div><p className="font-medium text-gray-800">Метаболизм</p><p className="text-gray-600">Расширенная биохимия — мочевая кислота (риск подагры). Полный тиреоидный пакет.</p></div>
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
        <p className="text-sm text-gray-600">Мужской чекап 30-40 лет в Харькове — в сети «ОН Клиник Харьков». Программа «Мужской профилактический». Стоимость — от 7 722 грн.</p>
      </section>

      <nav className="text-sm flex flex-wrap gap-4">
        <span className="text-gray-500">Другие возрастные группы:</span>
        <Link href="/male-checkup/do-30-let/kharkov" className="text-sm text-teal-600 hover:underline">До 30 лет</Link>
        <Link href="/male-checkup/40-50-let/kharkov" className="text-sm text-teal-600 hover:underline">40–50 лет</Link>
        <Link href="/male-checkup/ot-50-let/kharkov" className="text-sm text-teal-600 hover:underline">От 50 лет</Link>
      </nav>
    </main>
  );
}
