// v3 — Medical Hero redesign
import type { Metadata } from 'next';
import Script from 'next/script';

// Hub components
import MedicalHero from '@/components/hub/MedicalHero';
import OrientationBlock from '@/components/hub/OrientationBlock';
import PatientPath from '@/components/hub/PatientPath';
import SymptomsBlock from '@/components/hub/SymptomsBlock';
import WhenToActBlock from '@/components/hub/WhenToActBlock';
import MethodsComparisonTable from '@/components/hub/MethodsComparisonTable';
import MethodCards from '@/components/hub/MethodCards';
import QuizMioma from '@/components/hub/QuizMioma';
import PricingBlock from '@/components/hub/PricingBlock';
import ClinicCitySelector from '@/components/hub/ClinicCitySelector';
import DoctorsByMethod from '@/components/hub/DoctorsByMethod';
import FAQAccordion from '@/components/hub/FAQAccordion';
import GeoBlock from '@/components/hub/GeoBlock';
import EEATBlock from '@/components/hub/EEATBlock';
import CarewayRelatedLinks from '@/components/hub/CarewayRelatedLinks';
import Disclaimer from '@/components/shared/Disclaimer';
import StickyMobileCTA from '@/components/shared/StickyMobileCTA';
import LeadForm from '@/components/shared/LeadForm';

// ─── Metadata ────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: 'Міома матки — методи лікування, клініки та ціни в Україні',
  description:
    'Міома матки: коли спостереження, коли лікування. Порівняння методів — від медикаментів до гістеректомії. Клініки в Рівному, Харкові та інших містах, ціни від 15 000 грн. Рецензовано акушером-гінекологом.',
  alternates: {
    canonical: 'https://check-up.in.ua/cases/mioma-matky',
  },
  openGraph: {
    title: 'Міома матки — методи лікування, клініки та ціни в Україні | check-up.in.ua',
    description:
      'Порівняння 6 методів лікування міоми, ціни, клініки у містах України. Рецензовано акушером-гінекологом.',
    url: 'https://check-up.in.ua/cases/mioma-matky',
    locale: 'uk_UA',
    type: 'article',
  },
  robots: {
    index: true,
    follow: true,
  },
};

// ─── Schema.org JSON-LD ──────────────────────────────────────────────────────

const schemaJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'MedicalWebPage',
      '@id': 'https://check-up.in.ua/cases/mioma-matky#webpage',
      url: 'https://check-up.in.ua/cases/mioma-matky',
      name: 'Міома матки — методи лікування, клініки та ціни в Україні',
      description:
        'Повна інформація про міому матки: типи, симптоми, методи лікування, ціни, клініки та лікарі в Україні.',
      dateModified: '2026-04-17',
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
        alternateName: 'Лейоміома матки',
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
          name: 'Чи може міома перейти в рак?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Звичайна міома — доброякісне утворення і не перероджується на рак. Лейоміосаркома — дуже рідкісний тип (менше 1 на 1000 випадків) і розвивається самостійно [Mayo Clinic].',
          },
        },
        {
          '@type': 'Question',
          name: 'Скільки часу треба чекати вагітність після міомектомії?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'За стандартами МОЗ України — не раніше ніж через 6 місяців після операції [МОЗ Наказ №147, Mayo Clinic].',
          },
        },
        {
          '@type': 'Question',
          name: 'Як змінюється міома після менопаузи?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Зазвичай міоми зменшуються після менопаузи через спад естрогену. Будь-яке зростання після менопаузи — показання до додаткового обстеження [Mayo Clinic].',
          },
        },
      ],
    },
  ],
};

// ─── Facts ───────────────────────────────────────────────────────────────────

const FACTS = [
  { number: '7 з 10', label: 'жінок хоча б раз у житті виявляють міому', source: 'Mayo Clinic' },
  { number: '6', label: 'варіантів підходу — не всі потребують операції' },
  { number: '12', label: 'клінік у 7 містах України' },
  { number: '28', label: 'лікарів з профільним досвідом' },
];

// ─── Page ────────────────────────────────────────────────────────────────────

export default function MiomaMatkyPage() {
  return (
    <>
      <Script
        id="schema-mioma-hub"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaJsonLd) }}
      />

      <main className="space-y-0">
        {/* 1. Hero */}
        <MedicalHero
          diagnosisLabel="Міома матки"
          eyebrow="Гінекологія · Поширений діагноз"
          h1="Міома матки — методи лікування, клініки та ціни в Україні"
          h1Em="ціни"
          lead="Розбираємось крок за кроком: коли достатньо спостерігати, коли потрібне лікування, як обрати метод та лікаря. На основі Mayo Clinic та рецензії акушера-гінеколога."
          primaryHref="#lead-form"
          secondaryHref="#methods"
          facts={FACTS}
          headingId="hub-h1"
        />

        {/* 2. Orientation Block */}
        <div className="pt-16 md:pt-24 lg:pt-32">
          <OrientationBlock />
        </div>

        {/* 3. Patient Path */}
        <div className="pt-16 md:pt-24 lg:pt-32">
          <PatientPath />
        </div>

        {/* 4+5. Symptoms + When to act — 2 cols on desktop */}
        <div className="pt-16 md:pt-24 lg:pt-32">
          <div className="md:grid md:grid-cols-2 md:max-w-7xl md:mx-auto">
            <SymptomsBlock />
            <WhenToActBlock />
          </div>
        </div>

        {/* 6. Methods */}
        <section id="methods" className="px-4 py-0 pt-16 md:pt-24 lg:pt-32 bg-white" aria-labelledby="methods-heading">
          <div className="max-w-7xl mx-auto">
            <h2
              id="methods-heading"
              className="text-[22px] md:text-3xl font-bold text-[#0b1a24] mb-4 md:mb-5"
              style={{ fontFamily: "'Fixel Display', system-ui, sans-serif" }}
            >
              Методи лікування
            </h2>
            <p className="text-[14px] md:text-lg text-[#4a5a6b] mb-8 md:mb-10 leading-relaxed">
              В Україні доступні шість основних підходів. Вони відрізняються
              інвазивністю, терміном відновлення, впливом на фертильність та ціною.
            </p>
            <MethodsComparisonTable />
            <MethodCards />
          </div>
        </section>

        {/* 7. Quiz */}
        <div className="pt-16 md:pt-24 lg:pt-32">
          <QuizMioma />
        </div>

        {/* 8. Pricing */}
        <div className="pt-16 md:pt-24 lg:pt-32">
          <PricingBlock />
        </div>

        {/* 9. Clinics */}
        <div className="pt-16 md:pt-24 lg:pt-32">
          <ClinicCitySelector />
        </div>

        {/* 10. Doctors */}
        <div className="pt-16 md:pt-24 lg:pt-32">
          <DoctorsByMethod />
        </div>

        {/* 11. FAQ */}
        <div className="pt-16 md:pt-24 lg:pt-32">
          <FAQAccordion />
        </div>

        {/* 12. GEO */}
        <div className="pt-16 md:pt-24 lg:pt-32">
          <GeoBlock />
        </div>

        {/* 13. E-E-A-T + Disclaimer */}
        <div className="pt-16 md:pt-24 lg:pt-32">
          <EEATBlock />
        </div>

        {/* Disclaimer */}
        <div className="px-4 pb-8 bg-gray-50">
          <div className="max-w-2xl mx-auto">
            <Disclaimer />
          </div>
        </div>

        {/* 14. Lead form */}
        <section
          id="lead-form"
          className="px-4 py-16 md:py-24 bg-white border-t border-gray-100"
          aria-label="Форма запису на консультацію"
        >
          <div className="max-w-[480px] mx-auto">
            <h2
              className="text-[20px] md:text-2xl font-bold text-[#0b1a24] mb-4 md:mb-5"
              style={{ fontFamily: "'Fixel Display', system-ui, sans-serif" }}
            >
              Записатись на консультацію
            </h2>
            <p className="text-[13px] text-[#4a5a6b] mb-8 md:mb-10">
              Залиште заявку — ми підберемо лікаря у вашому місті та зв&apos;яжемось для
              узгодження деталей.
            </p>
            <LeadForm
              intent="online_consultation"
              sourcePage="/cases/mioma-matky"
              ctaLabel="Записатись на онлайн-консультацію"
            />
          </div>
        </section>

        {/* Careway Related Links */}
        <CarewayRelatedLinks />

        {/* Sticky CTA (mobile only) */}
        <StickyMobileCTA href="#lead-form" ctaLabel="Записатись на консультацію" />
      </main>
    </>
  );
}
