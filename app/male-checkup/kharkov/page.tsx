import type { Metadata } from 'next';
import Link from 'next/link';
import { db } from '@/lib/supabase';
import type { CheckupProgram } from '@/lib/types';
import ProgramCatalogRu from '@/components/city/ProgramCatalogRu';
import FaqBlock from '@/components/city/FaqBlock';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Мужской чекап в Харькове ፈ Программы по возрасту от 7 722 грн',
  description: 'Мужской чекап в Харькове — программы для каждого возраста. Урология, гормоны, сердце. От 7 722 грн в ОН Клиник. Запись онлайн.',
  alternates: {
    canonical: 'https://check-up.in.ua/male-checkup/kharkov',
    languages: { ru: '/male-checkup/kharkov', uk: '/ukr/male-checkup/kharkiv' },
  },
};

async function fetchPrograms() {
  try {
    const { data } = await db()
      .from('checkup_programs')
      .select('*')
      .eq('clinic_id', '4d7134c2-1ec4-4ee3-a19a-6021b085fa88')
      .eq('gender', 'male')
      .eq('is_active', true)
      .eq('is_specialized', false)
      .order('price_discount', { ascending: true });
    return (data ?? []) as CheckupProgram[];
  } catch { return []; }
}

const AGE_LINKS = [
  { label: 'До 30 лет', sub: 'от 7 722 грн', href: '/male-checkup/do-30-let/kharkov' },
  { label: '30–40 лет', sub: 'от 7 722 грн', href: '/male-checkup/30-40-let/kharkov' },
  { label: '40–50 лет', sub: 'от 15 386 грн', href: '/male-checkup/40-50-let/kharkov' },
  { label: 'От 50 лет', sub: 'от 15 386 грн', href: '/male-checkup/ot-50-let/kharkov' },
];

const FAQ = [
  {
    q: 'Чем отличается мужской чекап от общего?',
    a: 'Мужской чекап включает консультацию уролога с допплерографией, УЗИ простаты и мошонки, исследование секрета простаты, гормональный профиль (тестостерон, ДГЭА-С, ГСПГ) и бакпосев из уретры. Программа после 40 дополнительно включает ПСА и ПЦР-диагностику.',
  },
  {
    q: 'Зачем мужчинам чекап если ничего не беспокоит?',
    a: 'Большинство мужских заболеваний (гипертония, диабет, простатит, сердечно-сосудистые) развиваются бессимптомно. Чекап выявляет их на стадии, когда лечение наиболее эффективно. После 40 — ежегодно, до 40 — раз в 2-3 года.',
  },
];

export default async function MaleCheckupKharkovPage() {
  const programs = await fetchPrograms();

  return (
    <main className="max-w-3xl mx-auto px-4 pt-6 pb-24">
      <nav className="text-xs text-gray-500 mb-4">
        <Link href="/">Главная</Link>{' → '}
        <Link href="/male-checkup">Чекап для мужчин</Link>{' → '}
        <span className="text-gray-800">Харьков</span>
      </nav>

      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
        Мужской чекап в Харькове
      </h1>
      <div className="h-0.5 w-16 bg-teal-400 mb-4" />

      <p className="text-gray-600 mb-6">
        Программы обследования для каждого возраста — от базового урологического скрининга до расширенной диагностики после 40.
      </p>

      <div className="flex flex-wrap gap-2 text-sm text-gray-500 mb-8">
        <span>от 7 722 грн</span>
        <span>·</span>
        <span>2 визита</span>
        <span>·</span>
        <span>ОН Клиник Харьков</span>
      </div>

      <section className="mb-10">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Выберите возраст</h2>
        <div className="grid grid-cols-2 gap-3">
          {AGE_LINKS.map(ag => (
            <Link key={ag.href} href={ag.href}
              className="block p-4 border border-gray-200 rounded-xl hover:border-teal-400 transition-colors">
              <p className="font-semibold text-gray-900">{ag.label}</p>
              <p className="text-sm text-gray-500">{ag.sub}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mb-10 bg-gray-50 rounded-xl p-5">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Как меняется программа с возрастом</h2>
        <div className="space-y-3 text-sm text-gray-700">
          <p><strong>До 30 лет:</strong> акцент на урологическом здоровье и гормональном статусе. Тестостерон, ДГЭА-С, ГСПГ, бакпосев, УЗИ простаты.</p>
          <p><strong>30–40 лет:</strong> добавляется контроль сердечно-сосудистых рисков. Липидограмма, расширенная биохимия, щитовидная железа.</p>
          <p><strong>40–50 лет:</strong> полный урологический скрининг с ПСА, коагулограмма, 6 консультаций, расширенная ПЦР-диагностика.</p>
          <p><strong>После 50:</strong> максимальная программа. Усиленный контроль простаты и сердечно-сосудистой системы.</p>
        </div>
      </section>

      {programs.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Программы мужского чекапа</h2>
          <ProgramCatalogRu programs={programs} />
        </section>
      )}

      <FaqBlock items={FAQ} />

      <section className="mb-8">
        <p className="text-sm text-gray-600">
          Мужской чекап в Харькове проводится в сети «ОН Клиник Харьков»: ул. Ярослава Мудрого, 30а; пр. Героев Харькова, 257; ул. Молочная, 48.
          Стоимость профилактического чекапа — от 7 722 грн, расширенной программы после 40 — от 15 386 грн.
        </p>
      </section>
    </main>
  );
}
