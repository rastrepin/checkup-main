import type { Metadata } from 'next';
import Link from 'next/link';
import { db } from '@/lib/supabase';
import type { CheckupProgram } from '@/lib/types';
import ProgramCatalogRu from '@/components/city/ProgramCatalogRu';
import FaqBlock from '@/components/city/FaqBlock';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Мужской чекап до 30 лет в Харькове ፈ от 7 722 грн',
  description: 'Комплексное обследование для мужчин до 30 — урология, гормональный статус, базовая диагностика. От 7 722 грн в ОН Клиник Харьков.',
  alternates: {
    canonical: 'https://check-up.in.ua/male-checkup/do-30-let/kharkov',
    languages: { ru: '/male-checkup/do-30-let/kharkov', uk: '/ukr/male-checkup/do-30-rokiv/kharkiv' },
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
    q = q.in('age_group', ['any', 'do-30']);
    const { data } = await q;
    return (data ?? []) as CheckupProgram[];
  } catch { return []; }
}

const FAQ = [
  { q: 'Что входит в мужской профилактический чекап?', a: 'Консультация терапевта (2 визита), уролога, анализы (ОАК, ОАМ, биохимия, гормональный профиль, бакпосев), УЗИ простаты и брюшной полости, ЭКГ.' },
  { q: 'Как подготовиться к чекапу?', a: 'Прийти натощак (8 часов). За 24 часа — без алкоголя и интенсивных нагрузок.' },
];

export default async function MaleDo30KharkovPage() {
  const programs = await fetchPrograms();

  return (
    <main className="max-w-3xl mx-auto px-4 pt-6 pb-24">
      <nav className="text-xs text-gray-500 mb-4">
        <Link href="/">Главная</Link>{' → '}
        <Link href="/male-checkup/kharkov">Мужской чекап</Link>{' → '}
        <span className="text-gray-800">До 30 лет</span>
      </nav>

      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
        Мужской чекап до 30 лет в Харькове
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
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Что проверять до 30 лет</h2>
        <div className="space-y-3 text-sm">
          <div><p className="font-medium text-gray-800">Урологическое здоровье</p><p className="text-gray-600">Консультация уролога с допплерографией, УЗИ простаты и мочевого пузыря, микроскопия секрета простаты, бакпосев из уретры.</p></div>
          <div><p className="font-medium text-gray-800">Гормональный статус</p><p className="text-gray-600">Тестостерон свободный, ДГЭА-С, ГСПГ, ТТГ, Т3. Снижение тестостерона всё чаще диагностируется у молодых мужчин.</p></div>
          <div><p className="font-medium text-gray-800">Базовая диагностика</p><p className="text-gray-600">ЭКГ, УЗИ брюшной полости, щитовидной железы, почек. Биохимия крови.</p></div>
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
        <p className="text-sm text-gray-600">Мужской чекап до 30 лет в Харькове — в сети «ОН Клиник Харьков». Программа «Мужской профилактический» — гормональный профиль и урологический скрининг. Стоимость — от 7 722 грн.</p>
      </section>

      <nav className="text-sm flex flex-wrap gap-4">
        <span className="text-gray-500">Другие возрастные группы:</span>
        <Link href="/male-checkup/30-40-let/kharkov" className="text-sm text-teal-600 hover:underline">30–40 лет</Link>
        <Link href="/male-checkup/40-50-let/kharkov" className="text-sm text-teal-600 hover:underline">40–50 лет</Link>
        <Link href="/male-checkup/ot-50-let/kharkov" className="text-sm text-teal-600 hover:underline">От 50 лет</Link>
      </nav>
    </main>
  );
}
