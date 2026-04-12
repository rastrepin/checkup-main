import type { Metadata } from 'next';
import Link from 'next/link';
import { db } from '@/lib/supabase';
import type { CheckupProgram } from '@/lib/types';
import ProgramCatalog from '@/components/city/ProgramCatalog';
import FaqBlock from '@/components/city/FaqBlock';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Чекап для чоловіків у Харкові ፈ Програми за віком від 7 722 грн',
  description: 'Чоловічий чекап у Харкові — програми для кожного віку. Урологія, гормони, серце. Від 7 722 грн в ОН Клінік. Запис онлайн.',
  alternates: {
    canonical: 'https://check-up.in.ua/ukr/male-checkup/kharkiv',
    languages: { uk: '/ukr/male-checkup/kharkiv', ru: '/male-checkup/kharkov' },
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
  { label: 'До 30 років', sub: 'від 7 722 грн', href: '/ukr/male-checkup/do-30-rokiv/kharkiv' },
  { label: '30–40 років', sub: 'від 7 722 грн', href: '/ukr/male-checkup/30-40-rokiv/kharkiv' },
  { label: '40–50 років', sub: 'від 15 386 грн', href: '/ukr/male-checkup/40-50-rokiv/kharkiv' },
  { label: 'Від 50 років', sub: 'від 15 386 грн', href: '/ukr/male-checkup/vid-50-rokiv/kharkiv' },
];

const FAQ = [
  {
    q: 'Чим відрізняється чоловічий чекап від загального?',
    a: 'Чоловічий чекап включає консультацію уролога з доплерографією, УЗД простати та калитки, дослідження секрету простати, гормональний профіль (тестостерон, ДГЕА-С, ГСПГ) та бакпосів з уретри. Програма після 40 додатково включає ПСА та ПЛР-діагностику.',
  },
  {
    q: 'Навіщо чоловікам чекап якщо нічого не турбує?',
    a: 'Більшість чоловічих захворювань (гіпертонія, діабет, простатит, серцево-судинні) розвиваються безсимптомно. Чекап виявляє їх на стадії, коли лікування найпростіше. Після 40 — щорічно, до 40 — раз на 2-3 роки.',
  },
];

export default async function MaleCheckupKharkivPage() {
  const programs = await fetchPrograms();

  return (
    <main className="max-w-3xl mx-auto px-4 pt-6 pb-24">
      <nav className="text-xs text-gray-500 mb-4">
        <Link href="/">Головна</Link>{' → '}
        <Link href="/ukr/male-checkup">Чекап для чоловіків</Link>{' → '}
        <span className="text-gray-800">Харків</span>
      </nav>

      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
        Чекап для чоловіків у Харкові
      </h1>
      <div className="h-0.5 w-16 bg-teal-400 mb-4" />

      <p className="text-gray-600 mb-6">
        Програми обстеження для кожного віку — від базового урологічного скринінгу до розширеної діагностики після 40.
      </p>

      <div className="flex flex-wrap gap-2 text-sm text-gray-500 mb-8">
        <span>від 7 722 грн</span>
        <span>·</span>
        <span>2 візити</span>
        <span>·</span>
        <span>ОН Клінік Харків</span>
      </div>

      <section className="mb-10">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Оберіть вік</h2>
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
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Як змінюється програма з віком</h2>
        <div className="space-y-3 text-sm text-gray-700">
          <p><strong>До 30 років:</strong> акцент на урологічному здоров'ї та гормональному статусі. Тестостерон, ДГЕА-С, ГСПГ, бакпосів, УЗД простати.</p>
          <p><strong>30–40 років:</strong> додається контроль серцево-судинних ризиків. Ліпідограма, розширена біохімія, щитоподібна залоза.</p>
          <p><strong>40–50 років:</strong> повний урологічний скринінг з ПСА, коагулограма, 6 консультацій, розширена ПЛР-діагностика.</p>
          <p><strong>Після 50:</strong> максимальна програма. Посилений контроль простати та серцево-судинної системи.</p>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Що забезпечує клініка</h2>
        <p className="text-sm text-gray-600">
          ОН Клінік Харків: консультація уролога з доплерографією, УЗД простати та калитки, дослідження секрету простати, повний гормональний профіль та лабораторна ПЛР-діагностика у власній лабораторії «ОН Лаб».
        </p>
      </section>

      {programs.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Програми чоловічого чекапу</h2>
          <ProgramCatalog programs={programs} />
        </section>
      )}

      <FaqBlock items={FAQ} />

      <section className="mb-8">
        <p className="text-sm text-gray-600">
          Чекап для чоловіків у Харкові доступний в мережі «ОН Клінік Харків»: вул. Ярослава Мудрого, 30а; пр. Героїв Харкова, 257; вул. Молочна, 48.
          Вартість профілактичного чекапу — від 7 722 грн, розширеної програми після 40 — від 15 386 грн.
        </p>
      </section>

      <section className="mb-8">
        <Link href="/ukr/female-checkup/kharkiv"
          className="inline-block text-sm text-teal-600 hover:underline">
          → Чекап для жінок у Харкові
        </Link>
      </section>
    </main>
  );
}
