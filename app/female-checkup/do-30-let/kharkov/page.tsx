import type { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

export const revalidate = 3600;
const CLINIC_ID = '4d7134c2-1ec4-4ee3-a19a-6021b085fa88';

function db() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
}

export const metadata: Metadata = {
  title: 'Чекап для женщин до 30 лет в Харькове 2026 | check-up.in.ua',
  description: 'Базовое обследование для женщин до 30 лет в Харькове: ОАК, гормоны, УЗИ малого таза, консультация гинеколога. ОН Клиник.',
  alternates: {
    canonical: 'https://check-up.in.ua/female-checkup/do-30-let/kharkov',
    languages: {
      'ru': 'https://check-up.in.ua/female-checkup/do-30-let/kharkov',
      'uk': 'https://check-up.in.ua/ukr/female-checkup/do-30-rokiv/kharkiv',
    },
  },
};

function fmt(n: number) { return n.toLocaleString('ru-UA'); }
function pct(r: number, s: number) { return Math.round((1 - s / r) * 100); }

export default async function Page() {
  const { data: programs } = await db()
    .from('checkup_programs').select('*')
    .eq('clinic_id', CLINIC_ID).eq('gender', 'female')
    .in('age_group', ['do-30', 'any']).eq('is_specialized', false)
    .order('price_discount');

  const safe = programs ?? [];

  return (
    <main className="bg-[#f9fbfd] min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <nav className="text-xs text-gray-400 mb-6 flex flex-wrap gap-1 items-center">
          <Link href="/" className="hover:text-[#005485]">Главная</Link><span>→</span>
          <Link href="/kharkov" className="hover:text-[#005485]">Харьков</Link><span>→</span>
          <Link href="/female-checkup/kharkov" className="hover:text-[#005485]">Чекап для женщин</Link><span>→</span>
          <span className="text-gray-600">До 30 лет</span>
        </nav>
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-[#0b1a24] mb-3 h1-teal-line">Чекап для женщин до 30 лет в Харькове</h1>
          <p className="text-gray-500 mt-4 max-w-xl">Базовое обследование для женщин до 30 лет в Харькове: ОАК, гормоны, УЗИ малого таза, консультация гинеколога. ОН Клиник.</p>
        </div>
        {safe.length > 0 ? (
          <section className="mb-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {safe.map((p: any) => {
                const d = pct(p.price_regular, p.price_discount);
                return (
                  <div key={p.id} className="bg-white border border-gray-200 rounded-[10px] p-5">
                    <div className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full bg-[#e8f4fd] text-[#005485] mb-3">ОН Клиник Харьков</div>
                    <h3 className="text-base font-bold text-[#0b1a24] mb-2 leading-snug">{p.name_ru ?? p.name_ua}</h3>
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-xl font-bold text-[#0b1a24]">{fmt(p.price_discount)} грн</span>
                      {d > 0 && <><span className="text-sm text-gray-400 line-through">{fmt(p.price_regular)}</span><span className="text-xs font-bold text-white bg-[#d60242] px-1.5 py-0.5 rounded">-{d}%</span></>}
                    </div>
                    <p className="text-[13px] text-gray-500 mb-4">
                      {[p.consultations_count ? `${p.consultations_count} консультаций` : null, p.analyses_count ? `${p.analyses_count} анализов` : null, p.diagnostics_count ? `${p.diagnostics_count} исследований` : null].filter(Boolean).join(' · ')}
                    </p>
                    <a href={`https://onclinic.check-up.in.ua/kharkiv/checkup/${p.slug}`}
                      className="block w-full text-center py-3 rounded-[10px] bg-[#005485] text-white font-semibold text-sm hover:bg-[#004470] transition-colors">
                      Записаться
                    </a>
                  </div>
                );
              })}
            </div>
          </section>
        ) : (
          <p className="text-gray-400 mb-10">Программы для этой группы появятся в ближайшее время.</p>
        )}
        <section className="bg-white rounded-[12px] border border-gray-100 px-6 py-6 mb-10 text-sm text-gray-600 space-y-3">
          <p>В молодом возрасте важно установить базовые показатели здоровья: ОАК, ТТГ, уровень ферритина, УЗИ органов малого таза.</p>
          <p>Программа рекомендована женщинам без хронических заболеваний, которые хотят контролировать репродуктивное здоровье и уровень микроэлементов.</p>
        </section>
        <div className="rounded-[12px] bg-[#005485] text-white px-6 py-8 text-center">
          <h2 className="text-xl font-bold mb-2">Нужна консультация?</h2>
          <p className="text-blue-100 text-sm mb-5">Подберём программу по вашему состоянию здоровья и бюджету.</p>
          <Link href="/kharkov#quiz" className="inline-block bg-white text-[#005485] font-bold text-sm px-6 py-3 rounded-[10px] hover:bg-blue-50 transition-colors">Пройти тест</Link>
        </div>
      </div>
    </main>
  );
}
