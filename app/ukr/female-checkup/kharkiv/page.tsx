import type { Metadata } from 'next';
import Link from 'next/link';
import { db } from '@/lib/supabase';
import type { CheckupProgram } from '@/lib/types';
import ProgramCatalog from '@/components/city/ProgramCatalog';
import FaqBlock from '@/components/city/FaqBlock';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Чекап для жінок у Харкові ፈ Програми за віком від 11 724 грн',
  description: "Жіночий чекап у Харкові — програми для кожного віку. Репродуктивне здоров'я, онкоскринінг, гормони. Від 11 724 грн в ОН Клінік. Запис онлайн.",
  alternates: {
    canonical: 'https://check-up.in.ua/ukr/female-checkup/kharkiv',
    languages: { uk: '/ukr/female-checkup/kharkiv', ru: '/female-checkup/kharkov' },
  },
};

async function fetchPrograms() {
  try {
    const { data } = await db()
      .from('checkup_programs')
      .select('*')
      .eq('clinic_id', '4d7134c2-1ec4-4ee3-a19a-6021b085fa88')
      .eq('gender', 'female')
      .eq('is_active', true)
      .eq('is_specialized', false)
      .order('price_discount', { ascending: true });
    return (data ?? []) as CheckupProgram[];
  } catch { return []; }
}

const AGE_LINKS = [
  { label: 'До 30 років', sub: 'від 11 724 грн', href: '/ukr/female-checkup/do-30-rokiv/kharkiv' },
  { label: '30–40 років', sub: 'від 11 724 грн', href: '/ukr/female-checkup/30-40-rokiv/kharkiv' },
  { label: '40–50 років', sub: 'від 14 634 грн', href: '/ukr/female-checkup/40-50-rokiv/kharkiv' },
  { label: 'Від 50 років', sub: 'від 14 634 грн', href: '/ukr/female-checkup/vid-50-rokiv/kharkiv' },
];

const FAQ = [
  {
    q: 'Чим відрізняється жіночий чекап від загального?',
    a: "Жіночий чекап додатково включає консультацію гінеколога, трансвагінальне УЗД, УЗД молочних залоз, ПАП-тест та скринінг на урогенітальні інфекції (Фемофлор). Ці дослідження відсутні в загальних програмах обстеження.",
  },
  {
    q: 'Коли краще проходити жіночий чекап?',
    a: 'Оптимально — на 5-12 день менструального циклу. Це важливо для ПАП-тесту, УЗД молочних залоз та органів малого тазу. Кров здається натщесерце, тому обстеження призначають на ранок.',
  },
  {
    q: 'Як часто потрібно проходити чекап?',
    a: 'До 40 років — раз на 2-3 роки за відсутності скарг. Після 40 — щорічно. При хронічних захворюваннях або спадковій обтяженості — за рекомендацією лікаря.',
  },
];

export default async function FemalCheckupKharkivPage() {
  const programs = await fetchPrograms();

  return (
    <main className="max-w-3xl mx-auto px-4 pt-6 pb-24">
      <nav className="text-xs text-gray-500 mb-4">
        <Link href="/">Головна</Link>{' → '}
        <Link href="/ukr/female-checkup">Чекап для жінок</Link>{' → '}
        <span className="text-gray-800">Харків</span>
      </nav>

      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
        Чекап для жінок у Харкові
      </h1>
      <div className="h-0.5 w-16 bg-teal-400 mb-4" />

      <p className="text-gray-600 mb-6">
        Програми обстеження для кожного віку — від базової перевірки до розширеної діагностики після 40.
      </p>

      <div className="flex flex-wrap gap-2 text-sm text-gray-500 mb-8">
        <span>від 11 724 грн</span>
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
          <p><strong>До 30 років:</strong> акцент на репродуктивному здоров'ї та щитоподібній залозі. ПАП-тест, УЗД молочних залоз, гормональний скринінг.</p>
          <p><strong>30–40 років:</strong> додається розширена біохімія, ліпідограма, УЗД органів черевної порожнини. Зростає значення контролю обмінних процесів.</p>
          <p><strong>40–50 років:</strong> розширена кардіодіагностика, коагулограма, 6 консультацій спеціалістів. Онкоскринінг стає обов'язковим.</p>
          <p><strong>Після 50:</strong> максимально широкий спектр досліджень. Посилений контроль серцево-судинної системи та метаболізму.</p>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Що забезпечує клініка</h2>
        <p className="text-sm text-gray-600 mb-3">
          Для жіночого чекапу клініка має забезпечити: гінекологічний огляд з відеокольпоскопією, УЗД молочних залоз з доплерометрією, трансвагінальне УЗД, ПАП-тест на основі рідинної цитології та повний спектр лабораторних досліджень.
        </p>
        <p className="text-sm text-gray-600">
          ОН Клінік Харків відповідає всім вимогам: власна лабораторія «ОН Лаб», сертифіковане обладнання УЗД експертного класу, досвідчені гінекологи у всіх трьох філіях.
        </p>
      </section>

      {programs.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Програми жіночого чекапу</h2>
          <ProgramCatalog programs={programs} />
        </section>
      )}

      <FaqBlock items={FAQ} />

      <section className="mb-8">
        <p className="text-sm text-gray-600">
          Чекап для жінок у Харкові доступний в мережі «ОН Клінік Харків»: вул. Ярослава Мудрого, 30а; пр. Героїв Харкова, 257; вул. Молочна, 48.
          Вартість профілактичного обстеження — від 11 724 грн, розширеної програми після 40 — від 14 634 грн.
        </p>
      </section>

      <section className="mb-8">
        <Link href="/ukr/male-checkup/kharkiv"
          className="inline-block text-sm text-teal-600 hover:underline">
          → Чекап для чоловіків у Харкові
        </Link>
      </section>
    </main>
  );
}
