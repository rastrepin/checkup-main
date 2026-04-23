/**
 * MIOMA MATKY HUB v4 — ЕТАЛОННА СТОРІНКА
 *
 * Архітектурне рішення: Hub і Careway розділені.
 * Видалено: OrientationBlock, PatientPath, WhenToActBlock, PricingBlock, QuizMioma (окремий блок).
 * Додано: InlineQuiz у Hero, ClinicsByCity, MethodCardsV4, IP geolocation.
 * 9 блоків замість 13+.
 *
 * Для заміни page.tsx: перевірити build → перейменувати page.tsx → page-v3-archive.tsx,
 * перейменувати page-v4.tsx → page.tsx.
 */

import type { Metadata } from 'next';
import Script from 'next/script';
import { cookies } from 'next/headers';
import Link from 'next/link';

// Hub components — v4
import InlineQuiz from '@/components/hub/InlineQuiz';
import MethodCardsV4 from '@/components/hub/MethodCardsV4';
import ClinicsByCity from '@/components/hub/ClinicsByCity';
import DoctorsBlock from '@/components/hub/DoctorsBlock';
import FAQAccordionV4 from '@/components/hub/FAQAccordionV4';
import GeoBlockV4 from '@/components/hub/GeoBlockV4';

// Shared
import EEATBlock from '@/components/hub/EEATBlock';
import Disclaimer from '@/components/shared/Disclaimer';
import StickyMobileCTA from '@/components/shared/StickyMobileCTA';
import LeadForm from '@/components/shared/LeadForm';

// ─── Metadata ────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: 'Міома матки — методи лікування та ціни в Україні',
  description:
    'Міома матки (фіброміома, лейоміома): порівняння 6 методів лікування, клініки у Харкові, Рівному та Львові, ціни від 13 395 грн. Рецензовано акушером-гінекологом.',
  alternates: {
    canonical: 'https://check-up.in.ua/cases/mioma-matky',
  },
  openGraph: {
    title: 'Міома матки — методи лікування та ціни в Україні | check-up.in.ua',
    description:
      'Порівняння 6 методів лікування міоми: від спостереження до гістеректомії. Клініки у 3 містах, ціни, верифіковані хірурги.',
    url: 'https://check-up.in.ua/cases/mioma-matky',
    locale: 'uk_UA',
    type: 'article',
  },
  robots: { index: true, follow: true },
};

// ─── Schema.org JSON-LD ──────────────────────────────────────────────────────

const schemaJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'MedicalWebPage',
      '@id': 'https://check-up.in.ua/cases/mioma-matky#webpage',
      url: 'https://check-up.in.ua/cases/mioma-matky',
      name: 'Міома матки — методи лікування та ціни в Україні',
      description:
        'Повна інформація про міому матки: типи, симптоми, 6 методів лікування, ціни, клініки та лікарі в Україні.',
      dateModified: '2026-04-23',
      inLanguage: 'uk',
      publisher: {
        '@type': 'Organization',
        name: 'check-up.in.ua',
        url: 'https://check-up.in.ua',
      },
      author: {
        '@type': 'Person',
        name: 'Ігор Растрепін',
        jobTitle: 'Медичний редактор check-up.in.ua',
      },
      reviewedBy: {
        '@type': 'Physician',
        name: 'Трохимович Руслана Миколаївна',
        description: 'Акушер-гінеколог, вища категорія, 26 років досвіду',
      },
      about: {
        '@type': 'MedicalCondition',
        name: 'Міома матки',
        alternateName: ['Лейоміома матки', 'Фіброміома матки'],
        code: {
          '@type': 'MedicalCode',
          code: 'D25',
          codingSystem: 'ICD-10',
        },
        relevantSpecialty: 'Obstetrics',
      },
      medicalAudience: {
        '@type': 'MedicalAudience',
        audienceType: 'Patient',
      },
    },
    {
      '@type': 'FAQPage',
      '@id': 'https://check-up.in.ua/cases/mioma-matky#faq',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Чи завжди потрібна операція при міомі?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Ні. Якщо міома не дає симптомів, її розмір стабільний і немає анемії — лікар запропонує спостереження. Операцію рекомендують коли вузол спричиняє кровотечі, біль або заважає завагітніти.',
          },
        },
        {
          '@type': 'Question',
          name: 'Чи можна завагітніти після видалення міоми?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Гістероскопічна та лапароскопічна міомектомія зберігають матку. Після лапароскопії вагітність планують через 6–12 місяців. Більшість жінок успішно виношують дитину.',
          },
        },
        {
          '@type': 'Question',
          name: 'Чим відрізняється гістероскопія від лапароскопії?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Вузли в порожнині матки видаляють гістероскопічно — без розрізів, виписка того ж дня. Вузли в стінці або зовні — лапароскопічно через 3 проколи, стаціонар 2–3 дні.',
          },
        },
        {
          '@type': 'Question',
          name: 'Чи може міома перейти у рак?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Міома доброякісна і не перероджується. Лейоміосаркома — окреме, дуже рідкісне захворювання.',
          },
        },
        {
          '@type': 'Question',
          name: 'Що робити, якщо у моєму місті немає партнерської клініки?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Доступна онлайн-консультація з акушером-гінекологом. Лікар оцінить ситуацію та порекомендує клініку у найближчому місті.',
          },
        },
      ],
    },
  ],
};

// ─── Facts card data ──────────────────────────────────────────────────────────

const FACTS = [
  {
    number: '7 з 10',
    label: 'жінок хоча б раз у житті виявляють міому',
    source: 'Mayo Clinic',
  },
  {
    number: '6',
    label: 'варіантів лікування — від спостереження до операції',
  },
  {
    number: '3',
    label: 'міста-партнери: Харків, Рівне, Львів',
  },
  {
    number: 'Онлайн',
    label: 'консультація доступна для інших міст',
  },
];

// ─── Icons ────────────────────────────────────────────────────────────────────

const ArrowRight = () => (
  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
  </svg>
);

const ShieldCheck = () => (
  <svg className="w-4 h-4 text-[#04D3D9] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

// ─── Page (Server Component) ──────────────────────────────────────────────────

export default async function MiomaMatkyPageV4() {
  // Читаємо cookie predefined_city — встановлюється Vercel Edge middleware
  const cookieStore = await cookies();
  const predefinedCity = cookieStore.get('predefined_city')?.value ?? null;

  return (
    <>
      <Script
        id="schema-mioma-hub-v4"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaJsonLd) }}
      />

      <main className="space-y-0">

        {/* ── 1. HERO з інлайн-квізом ─────────────────────────────────────── */}
        <section
          className="bg-gradient-to-br from-[#fcfaf6] to-white py-8 md:py-12 lg:py-14"
          aria-labelledby="hub-h1"
        >
          <div className="max-w-7xl mx-auto px-4 md:px-6">

            {/* Breadcrumbs */}
            <nav aria-label="Навігація" className="text-xs text-gray-500 mb-6 md:mb-8">
              <Link href="/" className="hover:text-gray-900 transition-colors">check-up.in.ua</Link>
              <span className="mx-1.5 text-gray-400">/</span>
              <Link href="/cases" className="hover:text-gray-900 transition-colors">Діагнози</Link>
              <span className="mx-1.5 text-gray-400">/</span>
              <span className="text-gray-900">Міома матки</span>
            </nav>

            {/* 2-col grid */}
            <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr] gap-10 md:gap-16 items-start">

              {/* Left */}
              <div>
                {/* Eyebrow */}
                <div className="inline-flex items-center gap-2 bg-[#005485]/[0.08] text-[#005485] px-3.5 py-1.5 rounded-full text-sm font-medium mb-5">
                  <span className="w-2 h-2 bg-[#04D3D9] rounded-full shrink-0" />
                  Оперативна гінекологія · Поширений діагноз
                </div>

                {/* H1 */}
                <h1
                  id="hub-h1"
                  className="text-[30px] md:text-[44px] leading-[1.18] font-semibold tracking-tight text-[#0b1a24] mb-3 max-w-[680px]"
                  style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
                >
                  Міома матки — методи лікування та{' '}
                  <em className="not-italic text-[#005485] font-semibold">ціни</em>{' '}
                  в Україні
                </h1>

                {/* Synonyms row — КРИТИЧНО за стандартом синонімів */}
                <p className="text-sm text-[#4a5a6b] italic mb-4 max-w-[620px]">
                  Також: фіброміома матки, лейоміома, фіброма матки, міоматозний вузол
                </p>

                {/* Lead */}
                <p className="text-base md:text-[17px] text-[#4a5a6b] leading-relaxed max-w-[620px] mb-6">
                  У виписках лікарів і прейскурантах клінік можна зустріти інші
                  назви — фіброміома, лейоміома, фіброматозний вузол — це одне й те
                  саме захворювання. Міома впливає на якість життя, але доброякісна і
                  не перетворюється на рак. Правильний метод залежить від типу вузла та
                  ваших планів щодо вагітності.
                </p>

                {/* InlineQuiz */}
                <InlineQuiz predefinedCity={predefinedCity} />

                {/* Reassurance */}
                <div className="flex items-center gap-2 text-sm text-gray-400 mt-4">
                  <ShieldCheck />
                  Інформаційний матеріал — не замінює консультацію лікаря
                </div>
              </div>

              {/* Right: Facts Card */}
              <div>
                <div className="bg-white rounded-2xl p-6 md:p-7 shadow-[0_4px_24px_rgba(11,30,47,0.08)] border border-[#e8e4dc] max-w-[420px]">
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-5">
                    Факти про діагноз
                  </div>
                  <div className="grid grid-cols-2 gap-x-5 gap-y-6">
                    {FACTS.map((fact) => (
                      <div key={fact.label}>
                        <div
                          className="font-semibold text-[36px] md:text-[40px] leading-none text-[#005485] mb-1.5"
                          style={{ fontFamily: "'Source Serif 4', Georgia, serif", letterSpacing: '-0.02em' }}
                        >
                          {fact.number}
                        </div>
                        <div className="text-xs text-[#4a5a6b] leading-snug">
                          {fact.label}
                        </div>
                        {fact.source && (
                          <span className="inline-block mt-1 text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                            {fact.source}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ── 2. ПРО ДІАГНОЗ ──────────────────────────────────────────────── */}
        <section className="py-12 md:py-16">
          <div className="max-w-4xl mx-auto px-4 md:px-6">
            <h2
              className="font-bold text-[22px] md:text-[28px] text-[#0b1a24] mb-5 tracking-tight"
              style={{ fontFamily: "'Fixel Display', system-ui, sans-serif" }}
            >
              Доброякісна пухлина — але вона впливає на якість життя
            </h2>
            <div className="space-y-4 text-base md:text-[17px] text-[#4a5a6b] leading-relaxed">
              <p>
                Міома матки — доброякісна пухлина з м'язової тканини стінки матки.
                Зустрічається у 70–80% жінок до 50 років, але виражені симптоми, що
                потребують лікування, — лише у 20–30%.
              </p>
              <p>
                Від розташування вузла залежить метод лікування: вузли в порожнині
                матки видаляють гістероскопічно (без розрізів), вузли в стінці або
                зовні — лапароскопічно (через мікророзрізи 0,5–1 см).
              </p>
              <p className="text-[#0b1a24] font-medium">
                Міома — це не рак. Вона не перетворюється на рак. Лейоміосаркома —
                окреме, дуже рідкісне захворювання.
              </p>
            </div>
          </div>
        </section>

        {/* ── 3. СИМПТОМИ ─────────────────────────────────────────────────── */}
        <section className="py-12 md:py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 md:px-6">
            <h2
              className="font-bold text-[22px] md:text-[28px] text-[#0b1a24] mb-4 tracking-tight"
              style={{ fontFamily: "'Fixel Display', system-ui, sans-serif" }}
            >
              Коли варто перевіритись
            </h2>
            <p className="text-base text-[#4a5a6b] mb-8">
              Більшість жінок з міомою не мають симптомів — її часто знаходять
              випадково на УЗД. Але якщо ви помічаєте щось з переліченого — це привід
              пройти обстеження.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Symptom cards */}
              {[
                {
                  title: 'Рясні або тривалі місячні',
                  badge: 'Основний симптом',
                  badgeColor: 'bg-red-50 text-red-700',
                  text: 'Місячні тривають більше 7 днів або значно рясніші ніж зазвичай — з\'являються згустки, доводиться прокидатись вночі. З часом призводить до анемії.',
                },
                {
                  title: 'Тяжкість або біль внизу живота',
                  badge: null,
                  badgeColor: '',
                  text: 'Відчуття тиску або тягнучий біль в тазу — не тільки під час місячних. Великий вузол тисне на сусідні тканини.',
                },
                {
                  title: 'Проблеми із зачаттям або виношуванням',
                  badge: 'Фактор безпліддя',
                  badgeColor: 'bg-amber-50 text-amber-700',
                  text: 'Міома може заважати ембріону прикріпитись до стінки матки, спричиняти викидні — залежно від розміру та розташування.',
                },
                {
                  title: 'Часті позиви до сечовипускання',
                  badge: null,
                  badgeColor: '',
                  text: 'Якщо вузол росте в бік сечового міхура, створюється постійне відчуття неповного спорожнення.',
                },
              ].map((s) => (
                <div
                  key={s.title}
                  className="bg-white rounded-2xl p-5 border border-[#e8e4dc]"
                >
                  {s.badge && (
                    <span className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full mb-2 ${s.badgeColor}`}>
                      {s.badge}
                    </span>
                  )}
                  <h3
                    className="text-[15px] font-semibold text-[#0b1a24] mb-2"
                    style={{ fontFamily: "'Fixel Display', system-ui, sans-serif" }}
                  >
                    {s.title}
                  </h3>
                  <p className="text-sm text-[#4a5a6b] leading-relaxed">{s.text}</p>
                </div>
              ))}
            </div>

            {/* Red flag */}
            <div className="p-5 bg-red-50 border-l-4 border-red-500 rounded-r-xl">
              <p className="font-semibold text-red-900 mb-1 text-sm">Термінова ситуація</p>
              <p className="text-sm text-red-800 leading-relaxed">
                Раптовий гострий біль внизу живота може означати перекрут ніжки
                вузла — стан, що потребує невідкладної медичної допомоги, а не
                планової консультації.
              </p>
            </div>
          </div>
        </section>

        {/* ── 4. МЕТОДИ ЛІКУВАННЯ ─────────────────────────────────────────── */}
        <div id="methods">
          <MethodCardsV4 />
        </div>

        {/* ── 5. КЛІНІКИ ПО МІСТАХ ────────────────────────────────────────── */}
        <section id="clinics" className="py-12 md:py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <h2
              className="font-bold text-[22px] md:text-[28px] text-[#0b1a24] mb-4 tracking-tight"
              style={{ fontFamily: "'Fixel Display', system-ui, sans-serif" }}
            >
              Клініки-партнери по містах
            </h2>
            <p className="text-base text-[#4a5a6b] mb-8 max-w-[640px]">
              Оберіть своє місто, щоб побачити партнерську клініку з лікарями,
              які виконують операції з міоми.
            </p>

            <ClinicsByCity
              diagnosis="mioma-matky"
              predefinedCity={predefinedCity}
            />
          </div>
        </section>

        {/* ── 6. ЛІКАРІ ───────────────────────────────────────────────────── */}
        <DoctorsBlock />

        {/* ── 7. FAQ ──────────────────────────────────────────────────────── */}
        <FAQAccordionV4 />

        {/* ── 8. GEO-блок (SEO) ───────────────────────────────────────────── */}
        <GeoBlockV4 />

        {/* ── 9. About / E-E-A-T ──────────────────────────────────────────── */}
        <EEATBlock />

        {/* Disclaimer */}
        <div className="px-4 pb-8 bg-gray-50">
          <div className="max-w-2xl mx-auto">
            <Disclaimer />
          </div>
        </div>

        {/* ── Lead form ───────────────────────────────────────────────────── */}
        <section
          id="lead-form"
          className="px-4 py-16 md:py-24 bg-white border-t border-gray-100"
          aria-label="Форма запису на консультацію"
        >
          <div className="max-w-[480px] mx-auto">
            <h2
              className="text-[20px] md:text-2xl font-bold text-[#0b1a24] mb-4"
              style={{ fontFamily: "'Fixel Display', system-ui, sans-serif" }}
            >
              Записатись на консультацію
            </h2>
            <p className="text-sm text-[#4a5a6b] mb-8">
              Залиште заявку — ми підберемо лікаря у вашому місті та
              зв&apos;яжемось для узгодження деталей.
            </p>
            <LeadForm
              intent="online_consultation"
              sourcePage="/cases/mioma-matky"
              ctaLabel="Записатись на консультацію"
            />
          </div>
        </section>

        {/* Sticky CTA (mobile only) */}
        <StickyMobileCTA href="#lead-form" ctaLabel="Записатись на консультацію" />

      </main>
    </>
  );
}
