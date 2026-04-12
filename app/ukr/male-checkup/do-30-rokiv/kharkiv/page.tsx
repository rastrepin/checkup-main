import type { Metadata } from 'next';
import Link from 'next/link';
import { db } from '@/lib/supabase';
import type { CheckupProgram } from '@/lib/types';
import ProgramCatalog from '@/components/city/ProgramCatalog';
import FaqBlock from '@/components/city/FaqBlock';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Чекап для чоловіків до 30 років у Харкові ፈ від 7 722 грн',
  description: 'Комплексне обстеження для чоловіків до 30 — урологія, гормональний статус, базова діагностика. Від 7 722 грн в ОН Клінік Харків.',
  alternates: {
    canonical: 'https://check-up.in.ua/ukr/male-checkup/do-30-rokiv/kharkiv',
    languages: { uk: '/ukr/male-checkup/do-30-rokiv/kharkiv', ru: '/male-checkup/do-30-let/kharkov' },
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
  { q: 'Що входить у чоловічий профілактичний чекап?', a: 'Консультація терапевта (2 візити), консультація уролога, аналізи (ЗАК, ЗАС, біохімія, гормональний профіль, бакпосів), УЗД простати та черевної порожнини, ЕКГ.' },
  { q: 'Як підготуватися до чекапу?', a: 'Прийти натщесерце (8 год). За 24 год — без алкоголю та інтенсивних навантажень.' },
];

export default async function MaleDo30KharkivPage() {
  const programs = await fetchPrograms();

  return (
    <main className="max-w-3xl mx-auto px-4 pt-6 pb-24">
      <nav className="text-xs text-gray-500 mb-4">
        <Link href="/">Головна</Link>{' → '}
        <Link href="/ukr/male-checkup/kharkiv">Чекап для чоловіків</Link>{' → '}
        <span className="text-gray-800">До 30 років</span>
      </nav>

      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
        Чекап для чоловіків до 30 років у Харкові
      </h1>
      <div className="h-0.5 w-16 bg-teal-400 mb-4" />

      <div className="flex flex-wrap gap-2 text-sm text-gray-500 mb-8">
        <span>від 7 722 грн</span>
        <span>·</span>
        <span>2 візити</span>
        <span>·</span>
        <span>ОН Клінік Харків</span>
      </div>

      <section className="mb-10 bg-gray-50 rounded-xl p-5">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Що перевіряти до 30 років</h2>
        <div className="space-y-3 text-sm">
          <div><p className="font-medium text-gray-800">Урологічне здоров'я</p><p className="text-gray-600">Консультація уролога з доплерографією, УЗД простати та сечового міхура, мікроскопія секрету простати, бакпосів з уретри. Рання діагностика простатиту та інфекцій сечостатевої системи.</p></div>
          <div><p className="font-medium text-gray-800">Гормональний статус</p><p className="text-gray-600">Тестостерон вільний, ДГЕА-С, ГСПГ, ТТГ, Т3. Зниження тестостерону діагностується все частіше у молодих чоловіків — пов'язане зі стресом та малорухливим способом життя.</p></div>
          <div><p className="font-medium text-gray-800">Базова діагностика</p><p className="text-gray-600">ЕКГ, УЗД черевної порожнини, щитоподібної залози, нирок. Біохімія крові: печінкові проби, глюкоза.</p></div>
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
        <p className="text-sm text-gray-600">Чекап для чоловіків до 30 років у Харкові доступний в мережі «ОН Клінік Харків». Програма «Чоловічий профілактичний» включає гормональний профіль та урологічний скринінг. Вартість — від 7 722 грн.</p>
      </section>

      <nav className="text-sm flex flex-wrap gap-4">
        <span className="text-gray-500">Інші вікові групи:</span>
        <Link href="/ukr/male-checkup/30-40-rokiv/kharkiv" className="text-sm text-teal-600 hover:underline">30–40 років</Link>
        <Link href="/ukr/male-checkup/40-50-rokiv/kharkiv" className="text-sm text-teal-600 hover:underline">40–50 років</Link>
        <Link href="/ukr/male-checkup/vid-50-rokiv/kharkiv" className="text-sm text-teal-600 hover:underline">Від 50 років</Link>
      </nav>
    </main>
  );
}
