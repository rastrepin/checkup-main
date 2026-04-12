import type { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import ProgramsSection from './ProgramsSection';

export const revalidate = 3600;
const CLINIC_ID = '4d7134c2-1ec4-4ee3-a19a-6021b085fa88';

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export const metadata: Metadata = {
  title: 'ОН Клінік Харків — програми чекап, філії, ціни | check-up.in.ua',
  description: 'Комплексне обстеження в ОН Клінік Харків: 3 філії біля метро, власна лабораторія. Програми для жінок і чоловіків зі знижками. Запис онлайн.',
  alternates: {
    canonical: 'https://onclinic.check-up.in.ua/kharkiv',
  },
};

const BRANCHES = [
  { id: '23a6ff31-dc8b-48a1-b03a-801e6e79865e', name_ua: 'ОН Клінік (Ярослава Мудрого)', address_ua: 'вул. Ярослава Мудрого, 30а', metro_ua: 'м. Ярослава Мудрого', schedule: 'Пн-Пт 8:00-18:00 · Сб 9:00-16:00 · Нд 9:00-13:00' },
  { id: '92f7ed51-1f46-451d-9cb4-40713104ce09', name_ua: 'ОН Клінік (Палац Спорту)', address_ua: 'пр. Героїв Харкова, 257', metro_ua: 'м. Палац Спорту', schedule: 'Пн-Пт 8:00-19:00 · Сб 8:00-17:00 · Нд 9:00-14:00' },
  { id: '2ef9c8c9-46ee-42ae-82d6-a37da4cf8cd9', name_ua: 'ОН Клінік (Левада)', address_ua: 'вул. Молочна, 48', metro_ua: 'м. Левада', schedule: 'Пн-Пт 8:00-18:00 · Сб 8:00-17:00 · Нд 8:30-14:00' },
];

const ADVANTAGES = [
  { title: 'Власна лабораторія', desc: 'Результати більшості аналізів — наступного дня в особистому кабінеті. Не потрібно чекати тижні.' },
  { title: '3 філії біля метро', desc: 'Ярослава Мудрого, Палац Спорту, Левада. Зручно з будь-якого кінця Харкова.' },
  { title: 'Все за один ранок', desc: 'Аналізи, УЗД, ЕКГ, консультації — послідовно без черг. Перший візит займає 2-4 години.' },
  { title: 'Досвідчені спеціалісти', desc: 'Терапевт, гінеколог, уролог, кардіолог — профілі, задіяні у чекапах відповідно до програми.' },
];

const DOCTORS = [
  { role: 'Консультація терапевта', desc: 'Загальна практика · висновок та рекомендації', schedule: 'Пн-Пт' },
  { role: 'Консультація гінеколога', desc: 'Огляд, мазки, ПАП-тест, кольпоскопія', schedule: 'Пн, Ср, Пт' },
  { role: 'Консультація уролога', desc: 'УЗД простати, ПСА, чоловіче здоров\'я', schedule: 'Вт, Чт' },
  { role: 'Консультація кардіолога', desc: 'ЕКГ, ехокардіографія, судинні ризики', schedule: 'Пн-Пт' },
];

export default async function Page() {
  const { data: programs } = await db()
    .from('checkup_programs')
    .select('*')
    .eq('clinic_id', CLINIC_ID)
    .eq('is_specialized', false)
    .order('gender')
    .order('price_discount');

  const safe = programs ?? [];
  const minPrice = safe.length ? Math.min(...safe.map((p: any) => p.price_discount)) : 0;
  const femaleMin = Math.min(...safe.filter((p: any) => p.gender === 'female').map((p: any) => p.price_discount));
  const maleMin = Math.min(...safe.filter((p: any) => p.gender === 'male').map((p: any) => p.price_discount));

  function fmt(n: number) { return n.toLocaleString('uk-UA'); }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'MedicalClinic',
        name: 'ОН Клінік Харків',
        url: 'https://onclinic.check-up.in.ua/kharkiv',
        address: [
          { '@type': 'PostalAddress', streetAddress: 'вул. Ярослава Мудрого, 30а', addressLocality: 'Харків', addressCountry: 'UA' },
          { '@type': 'PostalAddress', streetAddress: 'пр. Героїв Харкова, 257', addressLocality: 'Харків', addressCountry: 'UA' },
          { '@type': 'PostalAddress', streetAddress: 'вул. Молочна, 48', addressLocality: 'Харків', addressCountry: 'UA' },
        ],
        inLanguage: 'uk',
      })}} />

      <main className="bg-[#f9fafb] min-h-screen">
        {/* Header — ОН Клінік branding */}
        <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
          <div className="max-w-4xl mx-auto px-4 py-3.5 flex items-center justify-between">
            <div className="font-bold text-[14px] tracking-wide text-[#005485]">ОН КЛІНІК</div>
            <div className="flex items-center gap-4">
              <a href="#programs" className="text-[12px] text-gray-500 font-medium hover:text-[#005485]">Програми</a>
              <a href="#branches" className="text-[12px] text-gray-500 font-medium hover:text-[#005485]">Філії</a>
              <span className="text-[11px] font-semibold text-[#005485] bg-[#e8f4fd] px-2.5 py-1 rounded-full">Харків</span>
            </div>
          </div>
        </header>

        {/* Breadcrumb */}
        <div className="max-w-4xl mx-auto px-4 py-2.5 text-[12px] text-gray-400 flex gap-1 items-center">
          <Link href="/ukr/kharkiv" className="hover:text-[#005485]">Харків</Link>
          <span>→</span>
          <span className="text-gray-600 font-medium">ОН Клінік</span>
        </div>

        {/* Clinic hero */}
        <div className="bg-gray-50 border-b border-gray-100">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="w-12 h-12 rounded-[10px] bg-[#005485] flex items-center justify-center text-[10px] font-bold text-white mb-3">ОК</div>
            <h1 className="text-2xl font-bold text-[#0b1a24] mb-1">ОН Клінік Харків</h1>
            <p className="text-[13px] text-gray-500 mb-1">3 філії біля метро · Власна лабораторія</p>
            <p className="text-[14px] text-gray-700 leading-relaxed mt-3 max-w-lg">
              Багатопрофільний медичний центр з акцентом на діагностику та профілактику. Результати аналізів — за 1-2 дні в особистому кабінеті. Програми для жінок від {fmt(femaleMin)} грн, для чоловіків від {fmt(maleMin)} грн.
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8">

          {/* Programs with interactive filter */}
          <section id="programs" className="mb-12">
            <h2 className="text-2xl font-bold text-[#0b1a24] mb-1">Програми обстеження</h2>
            <p className="text-[13px] text-gray-500 mb-6">Всі ціни включають аналізи, УЗД, консультації.</p>
            <ProgramsSection programs={safe} branches={BRANCHES} />
          </section>

          {/* Doctors */}
          <section className="mb-12">
            <h2 className="text-xl font-bold text-[#0b1a24] mb-1">Лікарі</h2>
            <p className="text-[13px] text-gray-500 mb-5">Спеціалісти що проводять обстеження</p>
            <div className="divide-y divide-gray-100">
              {DOCTORS.map((doc, i) => (
                <div key={i} className="flex items-start gap-3.5 py-3.5">
                  <div className="w-12 h-12 rounded-full bg-gray-200 shrink-0" />
                  <div>
                    <div className="text-[14px] font-bold text-[#0b1a24]">{doc.role}</div>
                    <div className="text-[12px] text-gray-500">{doc.desc}</div>
                    <div className="text-[11px] text-[#005485] font-semibold mt-0.5">Графік: {doc.schedule}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Branches */}
          <section id="branches" className="mb-12">
            <h2 className="text-xl font-bold text-[#0b1a24] mb-5">Філії</h2>
            <div className="space-y-3">
              {BRANCHES.map(b => (
                <div key={b.id} className="bg-gray-50 rounded-[10px] px-4 py-3.5">
                  <h4 className="text-[14px] font-semibold text-[#0b1a24] mb-0.5">{b.address_ua}</h4>
                  <p className="text-[12px] text-gray-500">{b.metro_ua} · {b.schedule}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Advantages */}
          <section className="mb-12">
            <h2 className="text-xl font-bold text-[#0b1a24] mb-5">Переваги</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {ADVANTAGES.map((a, i) => (
                <div key={i}>
                  <h4 className="text-[14px] font-bold text-[#0b1a24] mb-1">{a.title}</h4>
                  <p className="text-[13px] text-gray-500 leading-relaxed">{a.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* GEO */}
          <section className="bg-gray-50 rounded-[12px] px-5 py-5 mb-10 text-[13px] text-gray-700 leading-relaxed">
            Чекап в ОН Клінік Харків проводиться за трьома адресами біля станцій метро: вул. Ярослава Мудрого, 30а, пр. Героїв Харкова, 257 та вул. Молочна, 48. Програми для жінок — від {fmt(femaleMin)} грн, для чоловіків — від {fmt(maleMin)} грн. Результати аналізів — в особистому кабінеті за 1-2 дні.
          </section>

          {/* Back link */}
          <div className="text-center pb-4">
            <Link href="/ukr/kharkiv" className="text-[13px] text-[#005485] font-semibold hover:underline">
              ← Всі програми в Харкові
            </Link>
          </div>

        </div>

        {/* Footer */}
        <footer className="bg-gray-50 border-t border-gray-100 px-4 py-7 mt-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-wrap gap-2 gap-x-5 mb-3">
              <Link href="/ukr/female-checkup/kharkiv" className="text-[12px] text-gray-500 hover:text-[#005485]">Жінкам</Link>
              <Link href="/ukr/male-checkup/kharkiv" className="text-[12px] text-gray-500 hover:text-[#005485]">Чоловікам</Link>
              <Link href="/ukr/kharkiv" className="text-[12px] text-gray-500 hover:text-[#005485]">Харків</Link>
            </div>
            <p className="text-[11px] text-gray-300">© 2019-2026 check-up.in.ua · ОН Клінік Харків</p>
          </div>
        </footer>

      </main>
    </>
  );
}
