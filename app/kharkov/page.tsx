import type { Metadata } from 'next';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import type { CheckupProgram, ClinicBranch } from '@/lib/types';
import QuizWrapper from '@/components/quiz/QuizWrapper';
import ProgramCatalogRu from '@/components/city/ProgramCatalogRu';
import FaqBlock from '@/components/city/FaqBlock';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Чекап организма в Харькове ᐈ Программы обследования от 7 722 грн',
  description:
    'Комплексное обследование организма в Харькове — программы для женщин и мужчин от 7 722 грн. 27 исследований за 2 визита. Запись онлайн.',
  alternates: {
    canonical: 'https://check-up.in.ua/kharkov',
    languages: {
      uk: 'https://check-up.in.ua/ukr/kharkiv',
      ru: 'https://check-up.in.ua/kharkov',
    },
  },
};

const CLINIC_SLUG = 'onclinic-kharkiv';
const SUBDOMAIN = 'https://onclinic.check-up.in.ua/kharkiv';

const FAQ_ITEMS = [
  {
    q: 'Сколько стоит чекап организма в Харькове?',
    a: 'Стоимость зависит от программы. Мужской профилактический — от 7 722 грн, женский профилактический — от 11 724 грн. Программы после 40 лет включают расширенную диагностику и стоят от 14 634 грн (женщины) и от 15 386 грн (мужчины). Цена включает все анализы, УЗИ и консультации специалистов.',
  },
  {
    q: 'Сколько времени занимает обследование?',
    a: 'Обследование проходит за 2 визита. Первый визит — 2-3 часа утром натощак (анализы, УЗИ, ЭКГ, консультации). Второй визит — через 5-7 дней, до 1 часа (терапевт с результатами и рекомендациями). Второй визит возможен онлайн.',
  },
  {
    q: 'Как подготовиться к чекапу?',
    a: 'За 24 часа до обследования не употребляйте алкоголь. Приходите натощак (последний приём пищи за 8-12 часов). Для женщин рекомендуется планировать визит на 5-12 день менструального цикла. Подробная инструкция по подготовке придёт после записи.',
  },
  {
    q: 'Где находятся клиники?',
    a: 'Обследования проводятся в сети «ОН Клиник Харьков» — три филиала у станций метро: ул. Ярослава Мудрого, 30а (М Пушкинская), пр. Героев Харькова, 257 (М Дворец Спорта), ул. Молочная, 48 (М Гагарина). Программы доступны во всех филиалах.',
  },
  {
    q: 'Можно ли пройти чекап в выходной день?',
    a: 'Да. Все три филиала работают в субботу (с 8:00–9:00). Филиал на Героев Харькова и Молочной также работает в воскресенье. Точный график зависит от филиала — уточняйте при записи.',
  },
];

const SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'MedicalWebPage',
  name: 'Комплексное обследование организма в Харькове',
  url: 'https://check-up.in.ua/kharkov',
  inLanguage: 'ru',
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Главная', item: 'https://check-up.in.ua' },
      { '@type': 'ListItem', position: 2, name: 'Харьков', item: 'https://check-up.in.ua/kharkov' },
    ],
  },
};

export default async function KharkovPage() {
  const { data: clinic } = await supabase
    .from('clinics')
    .select('id')
    .eq('slug', CLINIC_SLUG)
    .single();

  const clinicId = clinic?.id;

  const [{ data: programs }, { data: branches }] = await Promise.all([
    supabase
      .from('checkup_programs')
      .select('*')
      .eq('clinic_id', clinicId)
      .eq('is_active', true)
      .order('sort_order'),
    supabase
      .from('clinic_branches')
      .select('*')
      .eq('clinic_id', clinicId)
      .order('sort_order'),
  ]);

  const safePrograms: CheckupProgram[] = programs ?? [];
  const safeBranches: ClinicBranch[] = branches ?? [];

  const totalPrograms = safePrograms.filter(p => !p.is_specialized).length;
  const minPrice = Math.min(...safePrograms.map(p => p.price_discount));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA) }}
      />
      <main className="max-w-2xl mx-auto px-4 pb-24">

        {/* Breadcrumbs */}
        <nav className="text-xs text-gray-400 pt-4 pb-5">
          <Link href="/" className="hover:text-[#005485]">Главная</Link>
          <span className="mx-1.5">→</span>
          <span className="text-gray-600">Харьков</span>
        </nav>

        {/* Hero */}
        <section className="mb-10">
          <h1 className="text-[28px] sm:text-[32px] font-bold text-[#0b1a24] leading-tight mb-2">
            Комплексное обследование организма в Харькове
            <span className="h1-teal-line" />
          </h1>
          <p className="text-gray-600 mt-4 mb-4 text-[15px] leading-relaxed">
            Подберите программу за 2 минуты — получите план обследования со стоимостью
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 mb-6">
            <span>{totalPrograms} программ</span>
            <span>·</span>
            <span>от {minPrice.toLocaleString('uk-UA')} грн</span>
            <span>·</span>
            <span>3 филиала ОН Клиник</span>
          </div>
          <a
            href="#quiz"
            className="inline-flex items-center px-6 py-3.5 rounded-[10px] bg-[#005485] text-white font-semibold text-[15px] hover:bg-[#004470] transition-colors"
          >
            Подобрать программу
          </a>
        </section>

        {/* Quiz */}
        <section id="quiz" className="mb-14 scroll-mt-4">
          <QuizWrapper
            clinicSlug={CLINIC_SLUG}
            city="kharkiv"
            locale="ru"
            sourcePage="/kharkov"
            branches={safeBranches}
          />
        </section>

        {/* How it works */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold text-[#0b1a24] mb-6">Как пройти чекап в Харькове</h2>
          <div className="space-y-5">
            {[
              { title: 'Выберите программу', text: 'Пройдите короткий опрос — укажите пол, возраст и что беспокоит. Получите персональную дорожную карту обследования со стоимостью.' },
              { title: 'Запишитесь на удобный день', text: 'Выберите филиал ОН Клиник и дату. Обследования проводятся утром натощак. Продолжительность первого визита — до 3 часов.' },
              { title: 'Пройдите обследование', text: 'Первый визит: забор крови, УЗИ, ЭКГ, консультации специалистов. Результаты анализов — в течение 1-2 дней на электронную почту.' },
              { title: 'Получите заключение', text: 'Второй визит (через 5-7 дней): терапевт анализирует все результаты, даёт персональные рекомендации. Возможен формат онлайн-консультации.' },
            ].map((step, i) => (
              <div key={i} className="flex gap-4">
                <div className="step-num">{i + 1}</div>
                <div className="pt-1">
                  <div className="font-semibold text-[15px] text-[#0b1a24] mb-0.5">{step.title}</div>
                  <p className="text-sm text-gray-600 leading-relaxed">{step.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Programs */}
        <ProgramCatalogRu programs={safePrograms} />

        {/* Clinic branches */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold text-[#0b1a24] mb-3">Где пройти обследование</h2>
          <p className="text-[14px] text-gray-600 leading-relaxed mb-5">
            Медицинский центр «ОН Клиник Харьков» — сеть из трёх многопрофильных клиник международной
            сети ON Clinic, работающей в Украине с 2007 года. Собственная лаборатория «ОН Лаб», современное
            диагностическое оборудование и команда более 50 специалистов в трёх филиалах города.
          </p>
          <div className="space-y-3 mb-5">
            {safeBranches.map(branch => (
              <div key={branch.id} className="bg-white border border-gray-200 rounded-[10px] p-4">
                <div className="font-semibold text-sm text-[#0b1a24] mb-1">{branch.name_ru}</div>
                <div className="text-xs text-gray-500 mb-0.5">
                  📍 {branch.address_ru}
                  {branch.metro_ru && <span className="ml-2">· 🚇 {branch.metro_ru}</span>}
                </div>
                <div className="text-xs text-gray-400">
                  Пн-Пт: {branch.schedule.mon_fri} · Сб: {branch.schedule.sat}
                </div>
              </div>
            ))}
          </div>
          <a href={SUBDOMAIN} className="text-sm font-semibold text-[#005485] hover:underline" target="_blank" rel="noopener noreferrer">
            Подробнее о клинике →
          </a>
        </section>

        {/* GEO block */}
        <section
          className="mb-14 text-[13px] text-gray-500 leading-relaxed space-y-2 border-t border-gray-100 pt-8"
          dangerouslySetInnerHTML={{
            __html: `
              <p>Комплексное обследование организма (чекап) в Харькове доступно в сети медицинских центров
              «ОН Клиник Харьков» по трём адресам: ул. Ярослава Мудрого, 30а (район Пушкинской),
              пр. Героев Харькова, 257 (район Дворца Спорта) и ул. Молочная, 48 (район Левады).
              Все филиалы расположены рядом со станциями метро.</p>
              <p>Стоимость комплексного обследования в Харькове — от 7 722 грн (мужской профилактический)
              до 15 386 грн (мужской после 40). Женские программы — от 11 724 грн. Специализированные
              программы (кардиологический, сосудистый, метаболический) — от 10 263 грн.</p>
              <p>Сервис check-up.in.ua организовывает запись на комплексное обследование в Харькове
              с 2019 года. Для записи заполните форму на сайте — консультант свяжется с вами
              в течение рабочего дня.</p>
            `,
          }}
        />

        {/* FAQ */}
        <FaqBlock items={FAQ_ITEMS} />

        {/* Footer CTA */}
        <section className="text-center py-10 border-t border-gray-100">
          <h3 className="text-xl font-bold text-[#0b1a24] mb-2">Готовы позаботиться о здоровье?</h3>
          <p className="text-gray-500 text-sm mb-5">Пройдите опрос — получите персональную программу со стоимостью.</p>
          <a href="#quiz" className="inline-flex items-center px-8 py-4 rounded-[10px] bg-[#005485] text-white font-semibold text-[15px] hover:bg-[#004470] transition-colors">
            Подобрать программу
          </a>
        </section>

      </main>
    </>
  );
}
