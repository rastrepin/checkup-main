import type { Metadata } from 'next';
import Link from 'next/link';
import { db } from '@/lib/supabase';
import type { CheckupProgram } from '@/lib/types';
import ProgramCatalogRu from '@/components/city/ProgramCatalogRu';
import FaqBlock from '@/components/city/FaqBlock';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Чекап организма в Харькове ℘ Программы обследования от 7 722 грн',
  description: 'Комплексное обследование организма в Харькове — программы для женщин и мужчин от 7 722 грн. Запись онлайн.',
  alternates: {
    canonical: 'https://check-up.in.ua/kharkov',
    languages: { ru: '/kharkov', uk: '/ukr/kharkiv' },
  },
};

async function fetchPrograms(gender?: 'female' | 'male', ageGroup?: string) {
  try {
    let q = db()
      .from('checkup_programs')
      .select('*')
      .eq('clinic_id', '4d7134c2-1ec4-4ee3-a19a-6021b085fa88')
      .eq('is_active', true)
      .eq('is_specialized', false)
      .order('price_discount', { ascending: true });
    if (gender) q = q.eq('gender', gender);
    if (ageGroup === 'after-40') {
      q = q.in('age_group', ['after-40', 'any']);
    } else if (ageGroup) {
      q = q.in('age_group', ['any', ageGroup]);
    }
    const { data } = await q;
    return (data ?? []) as CheckupProgram[];
  } catch { return []; }
}

export default async function KharkovPage() {
  const programs = await fetchPrograms();

  const faq = [
    {
      q: 'Сколько стоит чекап в Харькове?',
      a: 'Базовый мужской чекап — от 7 722 грн, женский профилактический — от 11 724 грн. Программы после 40 — от 14 634 грн.'
    },
    {
      q: 'Как подготовиться к чекапу?',
      a: 'Прийдите натощак (8 часов без еды). За сутки — без алкоголя и интенсивных нагрузок. Женщинам: оптимально 5-12 день цикла.'
    },
    {
      q: 'Где проводится чекап в Харькове?',
      a: 'В сети ОН Клиник Харьков: ул. Ярослава Мудрого, 30а; пр. Героев Харькова, 257; ул. Молочная, 48.'
    },
  ];

  return (
    <main className="max-w-3xl mx-auto px-4 pt-6 pb-24">
      <nav className="text-xs text-gray-500 mb-4">
        <Link href="/">Главная</Link>{' → '}
        <span className="text-gray-800">Харьков</span>
      </nav>

      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
        Комплексное обследование организма в Харькове
      </h1>
      <div className="h-0.5 w-16 bg-teal-400 mb-4" />

      <div className="flex flex-wrap gap-2 text-sm text-gray-500 mb-8">
        <span>{programs.length} программ</span>
        <span>·</span>
        <span>от 7 722 грн</span>
        <span>·</span>
        <span>3 филиала ОН Клиник</span>
      </div>

      {programs.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Программы обследования</h2>
          <ProgramCatalogRu programs={programs} />
        </section>
      )}

      <section className="mb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { href: '/female-checkup/kharkov', label: 'Женский чекап', desc: 'От 11 724 грн' },
            { href: '/male-checkup/kharkov', label: 'Мужской чекап', desc: 'От 7 722 грн' },
          ].map(item => (
            <Link key={item.href} href={item.href} className="block p-4 border border-gray-200 rounded-xl hover:border-teal-400 transition-colors">
              <p className="font-semibold text-gray-900">{item.label}</p>
              <p className="text-sm text-gray-500">{item.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <FaqBlock items={faq} />

      <section className="mb-8 text-sm text-gray-500">
        <p>Чекап в Харькове проводится в сети ОН Клиник. Цены проверены: апрель 2026.</p>
      </section>
    </main>
  );
}
