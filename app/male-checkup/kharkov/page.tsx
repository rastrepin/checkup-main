import type { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

export const revalidate = 3600;
const CLINIC_ID = '4d7134c2-1ec4-4ee3-a19a-6021b085fa88';

function db() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
}

export const metadata: Metadata = {
  title: 'Чекап для мужчин в Харькове 2026 — программы и цены | check-up.in.ua',
  description: 'Комплексное обследование для мужчин в Харькове: сердце, сосуды, простата, гормоны. Программы по возрасту. ОН Клиник Харьков.',
  alternates: {
    canonical: 'https://check-up.in.ua/male-checkup/kharkov',
    languages: {
      'ru': 'https://check-up.in.ua/male-checkup/kharkov',
      'uk': 'https://check-up.in.ua/ukr/male-checkup/kharkiv',
    },
  },
};

const AGE_NAV = [
  { label: 'До 30 лет', href: '/male-checkup/do-30-let/kharkov' },
  { label: '30–40 лет', href: '/male-checkup/30-40-let/kharkov' },
  { label: '40–50 лет', href: '/male-checkup/40-50-let/kharkov' },
  { label: 'От 50 лет', href: '/male-checkup/ot-50-let/kharkov' },
];

const FAQ = [
  { q: 'Что входит в мужской чекап?', a: 'ОАК, липидный профиль, ПСА (простата), тестостерон, УЗИ брюшной полости, ЭКГ, консультация уролога и кардиолога.' },
  { q: 'Как часто мужчинам нужен чекап?', a: 'До 40 лет — раз в год. После 40 — раз в 6 месяцев, особенно при наличии рисков: курение, гипертония, лишний вес.' },
  { q: 'Выявляет ли чекап рак простаты?', a: 'Да: анализ на ПСА входит в большинство мужских программ после 40 лет. При повышенном ПСА назначается биопсия.' },
  { q: 'Сколько времени занимает обследование?', a: 'Базовые программы проходятся за один визит — 2–4 часа. Расширенные могут потребовать 2 визита.' },
];

function fmt(n: number) { return n.toLocaleString('ru-UA'); }
function pct(r: number, s: number) { return Math.round((1 - s / r) * 100); }

export default async function Page() {
  const { data: programs } = await db()
    .from('checkup_programs').select('*')
    .eq('clinic_id', CLINIC_ID).eq('gender', 'male').eq('is_specialized', false)
    .order('price_discount');

  const safe = programs ?? [];
  const minPrice = safe.length ? Math.min(...safe.map((p: any) => p.price_discount)) : 0;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({
        '@context': 'https://schema.org', '@type': 'MedicalWebPage',
        name: 'Чекап для мужчин в Харькове', url: 'https://check-up.in.ua/male-checkup/kharkov', inLanguage: 'ru',
      })}} />
      <main className="bg-[#f9fbfd] min-h-screen">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <nav className="text-xs text-gray-400 mb-6 flex flex-wrap gap-1 items-center">
            <Link href="/" className="hover:text-[#005485]">Главная</Link><span>→</span>
            <Link href="/kharkov" className="hover:text-[#005485]">Харьков</Link><span>→</span>
            <span className="text-gray-600">Чекап для мужчин</span>
          </nav>
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-[#0b1a24] mb-3 h1-teal-line">Мужской чекап в Харькове</h1>
            <p className="text-gray-500 mt-4 mb-4 max-w-xl">Комплексные программы для мужчин: сердечно-сосудистая система, урологическое здоровье, гормональный баланс. Обследования подобраны по возрасту и рискам.</p>
            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#04D3D9] inline-block" />{safe.length} программ для мужчин</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#04D3D9] inline-block" />от {fmt(minPrice)} грн</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#04D3D9] inline-block" />ОН Клиник Харьков</span>
            </div>
          </div>
          <section className="mb-10">
            <h2 className="text-lg font-bold text-[#0b1a24] mb-4">Выберите вашу возрастную группу</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {AGE_NAV.map(ag => (
                <Link key={ag.href} href={ag.href}
                  className="block text-center py-3 px-4 rounded-[10px] bg-white border-2 border-[#005485] text-[#005485] text-sm font-semibold hover:bg-[#005485] hover:text-white transition-all">
                  {ag.label}
                </Link>
              ))}
            </div>
          </section>
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-[#0b1a24] mb-6">Все программы мужского чекапа</h2>
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
          <section className="bg-white rounded-[12px] border border-gray-100 px-6 py-7 mb-10">
            <h2 className="text-xl font-bold text-[#0b1a24] mb-4">Зачем мужчине регулярный чекап</h2>
            <div className="space-y-3 text-sm text-gray-600">
              <p>Мужчины реже обращаются к врачам профилактически — и поэтому чаще выявляют болезни уже на поздних стадиях. Чекап меняет эту ситуацию: обследование занимает несколько часов, а выявленные риски можно устранить на раннем этапе.</p>
              <p>Мужские программы в ОН Клиник Харьков включают кардиологический скрининг, оценку уровня тестостерона, состояние простаты (ПСА) и общий метаболический профиль.</p>
              <p>После 40 риски сердечно-сосудистых заболеваний и онкологии существенно возрастают — именно поэтому расширенный чекап раз в 6 месяцев является стандартом профилактической медицины.</p>
            </div>
          </section>
          <section className="mb-10">
            <h2 className="text-xl font-bold text-[#0b1a24] mb-5">Частые вопросы</h2>
            <div className="space-y-3">
              {FAQ.map((item, i) => (
                <details key={i} className="bg-white border border-gray-200 rounded-[10px] group">
                  <summary className="flex items-center justify-between px-5 py-4 cursor-pointer text-sm font-semibold text-[#0b1a24] list-none">
                    {item.q}
                    <svg className="w-4 h-4 text-gray-400 shrink-0 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                  </summary>
                  <div className="px-5 pb-4 text-sm text-gray-600">{item.a}</div>
                </details>
              ))}
            </div>
          </section>
          <div className="rounded-[12px] bg-[#005485] text-white px-6 py-8 text-center">
            <h2 className="text-xl font-bold mb-2">Не знаете, какая программа подходит?</h2>
            <p className="text-blue-100 text-sm mb-5">Пройдите короткий тест — подберём оптимальный вариант за 2 минуты.</p>
            <Link href="/kharkov#quiz" className="inline-block bg-white text-[#005485] font-bold text-sm px-6 py-3 rounded-[10px] hover:bg-blue-50 transition-colors">Пройти тест</Link>
          </div>
        </div>
      </main>
    </>
  );
}
