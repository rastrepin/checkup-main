import type { Metadata } from 'next';
import Link from 'next/link';
import { db } from '@/lib/supabase';
import type { CheckupProgram } from '@/lib/types';
import QuizWrapper from '@/components/quiz/QuizWrapper';
import ProgramCatalog from '@/components/city/ProgramCatalog';
import FaqBlock from '@/components/city/FaqBlock';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Чекап організму в Харкові ℘ Програми обстеження від 7 722 грн',
  description: 'Комплексне обстеження організму в Харкові — програми для жінок та чоловіків від 7 722 грн. 27 досліджень за 2 візити. Запис онлайн.',
  alternates: {
    canonical: 'https://check-up.in.ua/ukr/kharkiv',
    languages: { uk: '/ukr/kharkiv', ru: '/kharkov' },
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

export default async function KharkivPage() {
  const programs = await fetchPrograms();

  const faq = [
    {
      q: 'Скільки коштує чекап в Харкові?',
      a: 'Базовий чоловічий чекап — від 7 722 грн, жіночий профілактичний — від 11 724 грн. Програми після 40 — від 14 634 грн. Ціни включають усі дослідження та консультації.'
    },
    {
      q: 'Скільки часу займає обстеження?',
      a: 'Перший візит — до 3 годин (зранку, натщесерце). Другий візит — до 1 години через 3-5 днів. За цей час ви отримаєте повний висновок терапевта.'
    },
    {
      q: 'Як підготуватися до чекапу?',
      a: 'Прийдіть натщесерце (8 годин без їжі). За добу — без алкоголю та інтенсивних фізичних навантажень. Жінкам: оптимально 5-12 день циклу для гінекологічних досліджень.'
    },
    {
      q: 'Де проводиться чекап у Харкові?',
      a: 'В мережі ОН Клінік Харків: вул. Ярослава Мудрого, 30а; пр. Героїв Харкова, 257; вул. Молочна, 48. Власна лабораторія «ОН Лаб».'
    },
    {
      q: 'Що входить у базовий чекап?',
      a: 'Аналіз крові, сечі, ЕКГ, УЗД, гормони щитоподібної залози, глюкоза, ліпідограма, консультація терапевта. Жіноча програма додатково включає консультацію гінеколога та ПАП-тест.'
    },
  ];

  return (
    <main className="max-w-3xl mx-auto px-4 pt-6 pb-24">
      <nav className="text-xs text-gray-500 mb-4">
        <Link href="/">Головна</Link>{' → '}
        <span className="text-gray-800">Харків</span>
      </nav>

      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
        Комплексне обстеження організму в Харкові
      </h1>
      <div className="h-0.5 w-16 bg-teal-400 mb-4" />

      <p className="text-gray-600 mb-4">
        Підберіть програму за 2 хвилини — отримайте план обстеження з вартістю
      </p>
      <div className="flex flex-wrap gap-2 text-sm text-gray-500 mb-8">
        <span>{programs.length} програм</span>
        <span>·</span>
        <span>від 7 722 грн</span>
        <span>·</span>
        <span>3 філії ОН Клінік</span>
      </div>

      <section id="quiz" className="mb-10">
        <QuizWrapper clinicSlug="onclinic-kharkiv" city="kharkiv" locale="ua" sourcePage="/ukr/kharkiv" />
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Як пройти чекап в Харкові</h2>
        <div className="space-y-4">
          {[
            ['Оберіть програму', 'Пройдіть коротке опитування — вкажіть стать, вік та що турбує. Отримайте персональну дорожню карту обстеження з вартістю.'],
            ['Запишіться на зручний день', 'Оберіть філію ОН Клінік та дату. Перший візит — зранку натщесерце, до 3 годин.'],
            ['Пройдіть обстеження', 'Перший візит: забір крові, УЗД, ЕКГ, консультації. Результати аналізів — через 1-2 дні.'],
            ['Отримайте висновок', 'Другий візит: терапевт аналізує всі результати та дає рекомендації.'],
          ].map(([title, text], i) => (
            <div key={i} className="flex gap-4">
              <div className="shrink-0 w-8 h-8 rounded-full bg-teal-400 flex items-center justify-center text-white font-bold text-sm">{i+1}</div>
              <div>
                <p className="font-medium text-gray-800">{title}</p>
                <p className="text-sm text-gray-600">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {programs.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Програми обстеження</h2>
          <ProgramCatalog programs={programs} />
        </section>
      )}

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Програми за статтю та віком</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { href: '/ukr/female-checkup/kharkiv', label: 'Жіночий чекап', desc: 'Від 11 724 грн · Гінеколог + терапевт' },
            { href: '/ukr/male-checkup/kharkiv', label: 'Чоловічий чекап', desc: 'Від 7 722 грн · Уролог + терапевт' },
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
        <p>Чекап в Харкові проводиться в мережі ОН Клінік: вул. Ярослава Мудрого, 30а; пр. Героїв Харкова, 257; вул. Молочна, 48. Ціна перевірена: квітень 2026.</p>
      </section>
    </main>
  );
}
