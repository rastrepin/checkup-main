import type { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export const metadata: Metadata = {
  title: 'Ваш запис — check-up.in.ua',
  robots: 'noindex, nofollow',
};

const PREP_ITEMS = [
  { hours: '24', title: 'За 24 години', desc: 'Без алкоголю та інтенсивних фізичних навантажень' },
  { hours: '8',  title: 'За 8 годин',  desc: 'Без їжі (приходьте натщесерце)' },
  { hours: '6',  title: 'За 6 годин',  desc: 'Без пиття (можна трохи води)' },
  { hours: '📅', title: 'Оптимальний день', desc: '5–12 день менструального циклу (для жінок)' },
  { hours: '📋', title: 'Що взяти з собою', desc: 'Паспорт, попередні результати (якщо є), список ліків' },
];

const DOCTOR_QUESTIONS = [
  'Які результати потребують уваги?',
  'Що я можу контролювати самостійно?',
  'Чи потрібні додаткові обстеження?',
  'Коли прийти наступного разу?',
  'Чи впливають ліки/контрацепція на результати?',
];

function fmt(n: number) { return n.toLocaleString('uk-UA'); }

export default async function Page({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const { data: lead, error } = await db()
    .from('leads')
    .select('id, name, program_name, price, branch_address, selected_date_label, status, created_at')
    .eq('id', token)
    .single();

  if (error || !lead) {
    notFound();
  }

  const isConfirmed = lead.status === 'confirmed';
  const firstName = lead.name?.split(' ')[0] ?? lead.name ?? '';

  return (
    <div className="bg-[#f3f4f6] min-h-screen">
      <div className="max-w-[430px] mx-auto bg-white min-h-screen pb-8">

        {/* Header */}
        <header className="px-5 py-3.5 flex items-center justify-between border-b border-gray-100 sticky top-0 bg-white/95 backdrop-blur-md z-10">
          <div className="text-[13px] font-bold text-[#0b1a24]">CHECK-UP<span className="text-[#005485]">.IN.UA</span></div>
          <div className="text-[12px] text-gray-500">Ваш запис</div>
        </header>

        {/* Hero */}
        <div className="text-center px-5 py-8">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3.5 text-2xl ${
            isConfirmed ? 'bg-green-50' : 'bg-[#e8f4fd]'
          }`}>✓</div>
          <h1 className="text-[22px] font-bold text-[#0b1a24] mb-1">
            {isConfirmed ? 'Запис підтверджено' : `${firstName}, запис створено`}
          </h1>
          <p className="text-[13px] text-gray-500">
            {isConfirmed
              ? 'ОН Клінік підтвердив вашу дату та підготував деталі'
              : 'Деталі обстеження та інструкції нижче'
            }
          </p>
        </div>

        {/* Temp cabinet notice */}
        <div className="mx-5 mb-2 bg-blue-50 border border-blue-200 rounded-[12px] px-4 py-4 text-[13px] text-blue-800 leading-relaxed">
          <strong className="block text-[14px] mb-1">Тимчасовий кабінет</strong>
          Ця сторінка допоможе підготуватися до візиту. ОН Клінік запропонує створити власний кабінет з медичною інформацією та результатами.
        </div>

        {/* Status badge */}
        <div className="px-5 py-3 flex items-center gap-2.5 flex-wrap">
          {isConfirmed ? (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12px] font-bold bg-green-50 text-green-800 border border-green-200">✓ Підтверджено</span>
          ) : (
            <>
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12px] font-bold bg-amber-50 text-amber-800 border border-amber-200">◉ Очікує підтвердження</span>
              <span className="text-[12px] text-gray-500">Клініка підтвердить протягом кількох годин</span>
            </>
          )}
        </div>

        <hr className="border-gray-100 mx-5" />

        {/* Booking details */}
        <section className="px-5 py-6">
          <div className="text-[11px] font-bold tracking-widest uppercase text-gray-400 mb-3">Деталі запису</div>
          <div className="bg-gray-50 rounded-[12px] p-4 space-y-2">
            {[
              ['Програма', lead.program_name],
              ['Клініка', 'ОН Клінік Харків'],
              lead.branch_address ? ['Філія', lead.branch_address] : null,
              lead.selected_date_label ? ['Бажана дата', lead.selected_date_label] : null,
            ].filter((x): x is string[] => Array.isArray(x)).map(([label, value]) => (
              <div key={label} className="flex justify-between text-[14px]">
                <span className="text-gray-500">{label}</span>
                <span className="font-semibold text-right max-w-[60%]">{value}</span>
              </div>
            ))}
            {lead.price && (
              <div className="flex justify-between text-[14px] pt-1 border-t border-gray-200 mt-1">
                <span className="text-gray-500">Вартість</span>
                <span className="font-bold text-[16px] text-[#005485]">{fmt(lead.price)} грн</span>
              </div>
            )}
          </div>
        </section>

        <hr className="border-gray-100 mx-5" />

        {/* Preparation */}
        <section className="px-5 py-6">
          <h2 className="text-[18px] font-bold text-[#0b1a24] mb-5">Підготовка до візиту</h2>
          <div className="space-y-3.5">
            {PREP_ITEMS.map((item, i) => (
              <div key={i} className="flex gap-3 items-start">
                <div className="w-6 h-6 min-w-[24px] rounded-[6px] bg-[#e8f4fd] flex items-center justify-center text-[11px] font-bold text-[#005485] mt-0.5">
                  {item.hours}
                </div>
                <div className="text-[13px] text-gray-700 leading-relaxed">
                  <strong className="text-[#0b1a24]">{item.title}</strong><br />{item.desc}
                </div>
              </div>
            ))}
          </div>
        </section>

        <hr className="border-gray-100 mx-5" />

        {/* Visit plan */}
        <section className="px-5 py-6">
          <h2 className="text-[18px] font-bold text-[#0b1a24] mb-5">Як проходить обстеження</h2>

          <div className="border-[1.5px] border-gray-200 rounded-[12px] p-4 mb-3">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-7 h-7 rounded-full border-2 border-[#04D3D9] flex items-center justify-center text-[13px] font-bold text-[#04D3D9]">1</div>
              <div>
                <div className="text-[15px] font-bold text-[#0b1a24]">Перший візит</div>
                <div className="text-[12px] text-gray-500">Ранок · до 2 годин · натщесерце</div>
              </div>
            </div>
            <ul className="text-[13px] text-gray-700 leading-relaxed space-y-1 ml-1 list-disc list-inside">
              <li>Забір крові</li>
              <li>ЕКГ</li>
              <li>УЗД та необхідні дослідження</li>
              <li>Консультація профільного спеціаліста</li>
            </ul>
            {!isConfirmed && (
              <div className="mt-3 bg-amber-50 border border-amber-200 rounded-[8px] px-3 py-2 text-[12px] text-amber-800 leading-relaxed">
                Конкретний час та послідовність процедур з'являться після підтвердження клінікою
              </div>
            )}
          </div>

          <div className="border-[1.5px] border-gray-200 rounded-[12px] p-4">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-7 h-7 rounded-full border-2 border-[#04D3D9] flex items-center justify-center text-[13px] font-bold text-[#04D3D9]">2</div>
              <div>
                <div className="text-[15px] font-bold text-[#0b1a24]">Другий візит</div>
                <div className="text-[12px] text-gray-500">Через 3–4 дні · до 1 години</div>
              </div>
            </div>
            <ul className="text-[13px] text-gray-700 leading-relaxed space-y-1 ml-1 list-disc list-inside">
              <li>Консультація терапевта з аналізом всіх результатів</li>
              <li>Письмовий висновок та рекомендації</li>
            </ul>
          </div>
        </section>

        <hr className="border-gray-100 mx-5" />

        {/* Questions for doctor */}
        <section className="px-5 py-6">
          <h2 className="text-[18px] font-bold text-[#0b1a24] mb-1">Питання для лікаря</h2>
          <p className="text-[13px] text-gray-500 mb-4">Підготуйте заздалегідь</p>
          <div className="divide-y divide-gray-100">
            {DOCTOR_QUESTIONS.map((q, i) => (
              <div key={i} className="flex gap-2.5 py-2.5 text-[14px] text-[#0b1a24]">
                <span className="text-[#005485] font-bold">→</span>
                {q}
              </div>
            ))}
          </div>
        </section>

        <hr className="border-gray-100 mx-5" />

        {/* Location */}
        {lead.branch_address && (
          <section className="px-5 py-6">
            <h2 className="text-[18px] font-bold text-[#0b1a24] mb-4">Як дістатися</h2>
            <div className="bg-gray-50 rounded-[12px] p-4">
              <div className="text-[15px] font-bold text-[#0b1a24] mb-0.5">ОН Клінік Харків</div>
              <div className="text-[13px] text-gray-500 leading-relaxed">{lead.branch_address}</div>
              <div className="text-[12px] text-[#005485] font-semibold mt-2">🚇 Найближча станція метро → 5-10 хв пішки</div>
            </div>
          </section>
        )}

        <hr className="border-gray-100 mx-5" />

        {/* ОН Клінік banner */}
        <div className="mx-5 my-4 bg-gray-50 border-[1.5px] border-gray-200 rounded-[12px] p-4 flex gap-3.5 items-start">
          <div className="w-10 h-10 rounded-[8px] bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-500 shrink-0">ОК</div>
          <div className="text-[13px] text-gray-700 leading-relaxed">
            <strong className="block text-[14px] text-[#0b1a24] mb-0.5">Кабінет ОН Клінік</strong>
            Результати аналізів та висновок лікаря будуть у вашому кабінеті ОН Клінік. Створіть кабінет при першому візиті.
            <a href="https://onclinic.ua/cabinet" className="block mt-1.5 text-[#005485] font-semibold">onclinic.ua/cabinet →</a>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-gray-50 px-5 py-6 mt-4 text-center">
          <p className="text-[11px] text-gray-300 leading-relaxed">
            © 2019-2026 check-up.in.ua · Тимчасовий кабінет<br />
            Збережіть цю сторінку — посилання залишиться активним
          </p>
          <Link href="/ukr/kharkiv" className="block mt-3 text-[12px] text-[#005485] hover:underline">
            ← Всі програми в Харкові
          </Link>
        </footer>

      </div>
    </div>
  );
}
