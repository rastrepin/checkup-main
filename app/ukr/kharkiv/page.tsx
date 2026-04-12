import type { Metadata } from 'next';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import type { CheckupProgram, ClinicBranch } from '@/lib/types';
import QuizWrapper from '@/components/quiz/QuizWrapper';
import ProgramCatalog from '@/components/city/ProgramCatalog';
import FaqBlock from '@/components/city/FaqBlock';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Чекап організму в Харкові ᐈ Програми обстеження від 7 722 грн',
  description: 'Комплексне обстеження організму в Харкові — програми для жінок та чоловіків від 7 722 грн. 27 досліджень за 2 візити. Запис онлайн.',
  alternates: {
    canonical: 'https://check-up.in.ua/ukr/kharkiv',
    languages: { uk: 'https://check-up.in.ua/ukr/kharkiv', ru: 'https://check-up.in.ua/kharkov' },
  },
  openGraph: {
    title: 'Чекап організму в Харкові — від 7 722 грн',
    description: 'Комплексне обстеження для жінок та чоловіків. 3 філії ОН Клінік. Запис онлайн.',
    url: 'https://check-up.in.ua/ukr/kharkiv',
    locale: 'uk_UA',
    type: 'website',
  },
};

const CLINIC_SLUG = 'onclinic-kharkiv';
const SUBDOMAIN = 'https://onclinic.check-up.in.ua/kharkiv';

const FAQ_ITEMS = [
  { q: 'Скільки коштує чекап організму в Харкові?', a: 'Вартість залежить від програми. Чоловічий профілактичний — від 7 722 грн, жіночий профілактичний — від 11 724 грн. Програми після 40 включають розширену діагностику та коштують від 14 634 грн (жінки) та від 15 386 грн (чоловіки). Ціна включає всі аналізи, УЗД та консультації спеціалістів.' },
  { q: 'Скільки часу займає обстеження?', a: 'Обстеження проходить за 2 візити. Перший візит — 2-3 години вранці натщесерце (аналізи, УЗД, ЕКГ, консультації). Другий візит — через 5-7 днів, до 1 години (терапевт з результатами та рекомендаціями). Другий візит можливий онлайн.' },
  { q: 'Як підготуватися до чекапу?', a: 'За 24 години до обстеження не вживайте алкоголь. Приходьте натщесерце (останній прийом їжі за 8-12 годин). Для жінок рекомендовано планувати візит на 5-12 день менструального циклу. Детальну інструкцію з підготовки ви отримаєте після запису.' },
  { q: 'Які аналізи входять до програми?', a: 'Залежно від програми — від 12 до 27 лабораторних досліджень. Базовий набір: загальний аналіз крові, біохімія (печінкові проби, глюкоза, креатинін), аналіз сечі. Розширені програми додатково включають ліпідограму, коагулограму, гормональну панель, онкомаркери та вітаміни.' },
  { q: 'Де знаходяться клініки?', a: 'Обстеження проводяться в мережі «ОН Клінік Харків» — три філії біля станцій метро: вул. Ярослава Мудрого, 30а (М Пушкінська), пр. Героїв Харкова, 257 (М Палац Спорту), вул. Молочна, 48 (М Гагаріна). Програми доступні в усіх філіях.' },
  { q: 'Чи можна пройти чекап у вихідний?', a: 'Так. Усі три філії працюють у суботу (з 8:00–9:00). Філія на Героїв Харкова та Молочній також працює у неділю. Точний графік залежить від філії — уточнюйте при записі.' },
];

const SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'MedicalWebPage',
  name: 'Комплексне обстеження організму в Харкові',
  url: 'https://check-up.in.ua/ukr/kharkiv',
  description: 'Програми комплексного обстеження для жінок та чоловіків у Харкові. ОН Клінік — 3 філії.',
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Головна', item: 'https://check-up.in.ua' },
      { '@type': 'ListItem', position: 2, name: 'Харків', item: 'https://check-up.in.ua/ukr/kharkiv' },
    ],
  },
  mainEntity: {
    '@type': 'FAQPage',
    mainEntity: FAQ_ITEMS.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  },
};

export default async function KharkivPage() {
  const { data: clinic } = await supabase.from('clinics').select('id').eq('slug', CLINIC_SLUG).single();
  const clinicId = clinic?.id;

  const [{ data: programs }, { data: branches }] = await Promise.all([
    supabase.from('checkup_programs').select('*').eq('clinic_id', clinicId).eq('is_active', true).order('sort_order'),
    supabase.from('clinic_branches').select('*').eq('clinic_id', clinicId).order('sort_order'),
  ]);

  const safePrograms: CheckupProgram[] = programs ?? [];
  const safeBranches: ClinicBranch[] = branches ?? [];
  const totalPrograms = safePrograms.filter(p => !p.is_specialized).length;
  const minPrice = safePrograms.length ? Math.min(...safePrograms.map(p => p.price_discount)) : 0;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA) }} />
      <main className="max-w-2xl mx-auto px-4 pb-24">

        <nav className="text-xs text-gray-400 pt-4 pb-5">
          <Link href="/" className="hover:text-[#005485]">Головна</Link>
          <span className="mx-1.5">→</span>
          <span className="text-gray-600">Харків</span>
        </nav>

        <section className="mb-10">
          <h1 className="text-[28px] sm:text-[32px] font-bold text-[#0b1a24] leading-tight">
            Комплексне обстеження організму в Харкові
          </h1>
          <span className="h1-teal-line" />
          <p className="text-gray-600 mt-4 mb-4 text-[15px] leading-relaxed">
            Підберіть програму за 2 хвилини — отримайте план обстеження з вартістю
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 mb-6">
            <span>{totalPrograms} програм</span>
            <span>·</span>
            <span>від {minPrice.toLocaleString('uk-UA')} грн</span>
            <span>·</span>
            <span>3 філії ОН Клінік</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <a href="#quiz" className="inline-flex justify-center items-center px-6 py-3.5 rounded-[10px] bg-[#005485] text-white font-semibold text-[15px] hover:bg-[#004470] transition-colors">
              Підібрати програму
            </a>
            <a href="https://t.me/checkupua" className="inline-flex justify-center items-center px-6 py-3.5 rounded-[10px] border border-gray-300 text-gray-700 text-[15px] hover:border-gray-400 transition-colors" target="_blank" rel="noopener noreferrer">
              Запитати в Telegram
            </a>
          </div>
        </section>

        <section id="quiz" className="mb-14 scroll-mt-4">
          <QuizWrapper clinicSlug={CLINIC_SLUG} city="kharkiv" locale="ua" sourcePage="/ukr/kharkiv" branches={safeBranches} />
        </section>

        <section className="mb-14">
          <h2 className="text-2xl font-bold text-[#0b1a24] mb-6">Як пройти чекап в Харкові</h2>
          <div className="space-y-5">
            {[
              { title: 'Оберіть програму', text: 'Пройдіть коротке опитування — вкажіть стать, вік та що турбує. Отримайте персональну дорожню карту обстеження з вартістю.' },
              { title: 'Запишіться на зручний день', text: 'Оберіть філію ОН Клінік та дату. Обстеження проводяться вранці, натщесерце. Тривалість першого візиту — до 3 годин.' },
              { title: 'Пройдіть обстеження', text: 'Перший візит: забір крові, УЗД, ЕКГ, консультації спеціалістів. Результати аналізів — протягом 1-2 днів на електронну пошту.' },
              { title: 'Отримайте висновок', text: 'Другий візит (через 5-7 днів): терапевт аналізує всі результати, дає персональні рекомендації. Можливий формат — онлайн-консультація.' },
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

        <ProgramCatalog programs={safePrograms} />

        <section className="mb-14">
          <h2 className="text-2xl font-bold text-[#0b1a24] mb-5">Оберіть програму за віком</h2>
          <div className="mb-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2.5">Для жінок</div>
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'До 30 років', href: '/ukr/female-checkup/do-30-rokiv/kharkiv' },
                { label: '30-40 років', href: '/ukr/female-checkup/30-40-rokiv/kharkiv' },
                { label: '40-50 років', href: '/ukr/female-checkup/40-50-rokiv/kharkiv' },
                { label: 'Від 50 років', href: '/ukr/female-checkup/vid-50-rokiv/kharkiv' },
              ].map(({ label, href }) => (
                <Link key={href} href={href} className="px-4 py-2 rounded-[40px] border-[1.5px] border-gray-200 text-sm font-medium text-[#005485] hover:border-[#005485] hover:bg-[#f0f7ff] transition-all">{label}</Link>
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2.5">Для чоловіків</div>
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'До 30 років', href: '/ukr/male-checkup/do-30-rokiv/kharkiv' },
                { label: '30-40 років', href: '/ukr/male-checkup/30-40-rokiv/kharkiv' },
                { label: '40-50 років', href: '/ukr/male-checkup/40-50-rokiv/kharkiv' },
                { label: 'Від 50 років', href: '/ukr/male-checkup/vid-50-rokiv/kharkiv' },
              ].map(({ label, href }) => (
                <Link key={href} href={href} className="px-4 py-2 rounded-[40px] border-[1.5px] border-gray-200 text-sm font-medium text-[#005485] hover:border-[#005485] hover:bg-[#f0f7ff] transition-all">{label}</Link>
              ))}
            </div>
          </div>
        </section>

        <section className="mb-14">
          <h2 className="text-2xl font-bold text-[#0b1a24] mb-3">Де пройти обстеження</h2>
          <p className="text-[14px] text-gray-600 leading-relaxed mb-5">
            Медичний центр «ОН Клінік Харків» — мережа з трьох багатопрофільних клінік міжнародної мережі ON Clinic, що працює в Україні з 2007 року. Власна лабораторія «ОН Лаб», сучасне діагностичне обладнання та команда з понад 50 спеціалістів у трьох філіях міста.
          </p>
          <div className="space-y-3 mb-5">
            {safeBranches.map(branch => (
              <div key={branch.id} className="bg-white border border-gray-200 rounded-[10px] p-4">
                <div className="font-semibold text-sm text-[#0b1a24] mb-1">{branch.name_ua}</div>
                <div className="text-xs text-gray-500 mb-0.5">
                  {branch.address_ua}{branch.metro_ua ? ` · ${branch.metro_ua}` : ''}
                </div>
                <div className="text-xs text-gray-400">Пн-Пт: {branch.schedule.mon_fri} · Сб: {branch.schedule.sat}</div>
              </div>
            ))}
          </div>
          <a href={SUBDOMAIN} className="text-sm font-semibold text-[#005485] hover:underline" target="_blank" rel="noopener noreferrer">Детальніше про клініку →</a>
        </section>

        <section className="mb-14">
          <h2 className="text-2xl font-bold text-[#0b1a24] mb-4">Чому важливо проходити чекап</h2>
          <div className="text-[14px] text-gray-700 leading-relaxed space-y-3">
            <p>Регулярне комплексне обстеження дозволяє виявити захворювання на безсимптомній стадії, коли лікування найефективніше. За даними ВООЗ, до 80% серцево-судинних захворювань та до 40% онкологічних можна попередити або виявити на ранній стадії при регулярній діагностиці.</p>
            <p>Стандартна програма обстеження включає аналізи крові (загальний, біохімічний, гормональний), інструментальну діагностику (УЗД, ЕКГ) та консультації профільних спеціалістів. Обстеження проводяться за 2 візити: перший — здача аналізів та діагностика (2-3 години натщесерце), другий — консультація терапевта з результатами (через 5-7 днів, до 1 години).</p>
            <p>ВООЗ рекомендує проходити профілактичне обстеження щорічно після 40 років. До 40 років — раз на 2-3 роки за відсутності скарг та хронічних захворювань. При наявності факторів ризику — частіше за рекомендацією лікаря.</p>
          </div>
        </section>

        <section className="mb-14 text-[13px] text-gray-500 leading-relaxed border-t border-gray-100 pt-8">
          <p className="mb-2">Комплексне обстеження організму (чекап) у Харкові доступне в мережі медичних центрів «ОН Клінік Харків» за трьома адресами: вул. Ярослава Мудрого, 30а (район Пушкінської), пр. Героїв Харкова, 257 (район Палацу Спорту) та вул. Молочна, 48 (район Левади). Всі філії розташовані поблизу станцій метро.</p>
          <p className="mb-2">Вартість комплексного обстеження в Харкові — від 7 722 грн (чоловічий профілактичний) до 15 386 грн (чоловічий після 40). Жіночі програми — від 11 724 грн. Спеціалізовані програми — від 10 263 грн.</p>
          <p>Сервіс check-up.in.ua організовує запис на комплексне обстеження в Харкові з 2019 року. Консультант зв'яжеться з вами протягом робочого дня.</p>
        </section>

        <FaqBlock items={FAQ_ITEMS} />

        <section className="text-center py-10 border-t border-gray-100">
          <h3 className="text-xl font-bold text-[#0b1a24] mb-2">Готові подбати про здоров'я?</h3>
          <p className="text-gray-500 text-sm mb-5">Пройдіть опитування — отримайте персональну програму з вартістю.</p>
          <a href="#quiz" className="inline-flex items-center px-8 py-4 rounded-[10px] bg-[#005485] text-white font-semibold text-[15px] hover:bg-[#004470] transition-colors">Підібрати програму</a>
        </section>

      </main>
    </>
  );
}
