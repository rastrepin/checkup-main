import type { ProgramData } from '@/lib/programs/data';
import SystemsToggle from './SystemsToggle';
import ClinicOffers from './ClinicOffers';
import SimilarPrograms from './SimilarPrograms';
import StickyBar from './StickyBar';
import PrintButton from './PrintButton';

interface Props {
  program: ProgramData;
  basePath: 'female-checkup' | 'male-checkup';
}

export default function ProgramPage({ program, basePath }: Props) {


  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Головна', item: 'https://check-up.in.ua/' },
      { '@type': 'ListItem', position: 2, name: program.gender === 'female' ? 'Жіночий чекап' : 'Чоловічий чекап', item: `https://check-up.in.ua/ukr/${basePath}` },
      { '@type': 'ListItem', position: 3, name: program.titleShort, item: `https://check-up.in.ua/ukr/${basePath}/${program.slug}` },
    ],
  };

  const medicalSchema = {
    '@context': 'https://schema.org',
    '@type': 'MedicalProcedure',
    name: program.title,
    description: program.description,
  };

  const faqSchema = program.faq.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: program.faq.map((item: { q: string; a: string }) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  } : null;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(medicalSchema) }} />
      {faqSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />}
      <main className="max-w-3xl mx-auto px-4 pt-6 pb-24">

        {/* Breadcrumbs */}
        <nav className="text-xs text-gray-500 mb-4" aria-label="breadcrumb">
          <a href="/" className="hover:underline">Головна</a>
          {' → '}
          <a href={`/ukr/${basePath}`} className="hover:underline">
            {program.gender === 'female' ? 'Жіночий чекап' : 'Чоловічий чекап'}
          </a>
          {' → '}
          <span className="text-gray-800">{program.titleShort}</span>
        </nav>

        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-50 border border-teal-200 rounded-full text-xs font-medium text-teal-700 mb-4">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Стандарт check-up.in.ua
        </div>

        {/* H1 */}
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
          {program.title}
        </h1>
        <div className="h-0.5 w-16 bg-teal-400 mb-4" />

        {/* Description */}
        <p className="text-gray-600 leading-relaxed mb-6">{program.description}</p>

        {/* Meta pills */}
        <div className="flex flex-wrap gap-2 mb-8">
          <span className="bg-gray-100 rounded-full px-3 py-1 text-sm text-gray-700">
            {program.visits} {program.visits === 1 ? 'візит' : 'візити'}
          </span>
          <span className="bg-gray-100 rounded-full px-3 py-1 text-sm text-gray-700">
            {program.analysesCount} аналізів
          </span>
          {program.diagnosticsCount > 0 && (
            <span className="bg-gray-100 rounded-full px-3 py-1 text-sm text-gray-700">
              {program.diagnosticsCount} УЗД/діагн.
            </span>
          )}
          <span className="bg-gray-100 rounded-full px-3 py-1 text-sm text-gray-700">
            Візит 1: {program.visit1Duration}
          </span>
          {program.specialists.map((s, i) => (
            <span key={i} className="bg-teal-50 border border-teal-200 rounded-full px-3 py-1 text-sm text-teal-700">
              {s}
            </span>
          ))}
        </div>

        {/* Для кого */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Для кого ця програма</h2>
          <div className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
            {program.forWhom}
          </div>
        </section>

        {/* Plan */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">План візитів</h2>
          <div className="space-y-4">
            {program.visitPlan.map((step) => (
              <div key={step.num} className="flex gap-4">
                <div className="shrink-0 w-8 h-8 rounded-full bg-teal-400 flex items-center justify-center text-white font-bold text-sm">
                  {step.num}
                </div>
                <div>
                  <p className="font-medium text-gray-800 text-sm">{step.label}</p>
                  <p className="text-gray-600 text-sm leading-relaxed">{step.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Systems - full programs only */}
        {program.systems && program.systems.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Системи організму</h2>
            <SystemsToggle systems={program.systems} />
          </section>
        )}

        {/* Analyses */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Перелік досліджень ({program.analyses.length})
          </h2>
          <ul className="space-y-2 mb-4 list-none">
            {program.analyses.map((item, i) => (
              <li key={i} className="flex gap-3 text-sm text-gray-700">
                <span className="text-[#005485] font-bold text-xs shrink-0 w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                {item}
              </li>
            ))}
          </ul>
          <PrintButton />
        </section>

        {/* Preparation */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Підготовка</h2>
          <ul className="space-y-2">
            {program.preparation.map((item, i) => (
              <li key={i} className="flex gap-2 text-sm text-gray-700">
                <span className="text-teal-500 mt-0.5 shrink-0">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* What doctor may recommend - full programs */}
        {program.recommendedAfter && program.recommendedAfter.length > 0 && (
          <section className="mb-8 bg-gray-50 rounded-xl p-5">
            <h2 className="text-base font-semibold text-gray-900 mb-3">
              Що може рекомендувати лікар
            </h2>
            <ul className="space-y-1.5">
              {program.recommendedAfter.map((item, i) => (
                <li key={i} className="text-sm text-gray-600 flex gap-2">
                  <span className="text-gray-400 shrink-0">→</span>
                  {item}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Link to full program - for regular programs */}
        {program.type === 'regular' && program.fullProgramSlug && (
          <div className="mb-8 p-4 border border-amber-200 bg-amber-50 rounded-xl">
            <p className="text-sm text-amber-800">
              Не проходили повне обстеження або минуло більше 2 років?{' '}
              <a
                href={`/ukr/${basePath}/${program.fullProgramSlug}`}
                className="font-semibold underline hover:no-underline"
              >
                Перейти до повної програми →
              </a>
            </p>
          </div>
        )}

        {/* Clinic offers — from platform_program_offers */}
        <div id="clinic-section">
          <ClinicOffers
            programSlug={program.slug}
            gender={program.gender}
            ageGroup={program.ageRange}
          />
        </div>

        {/* Similar programs — from platform_programs */}
        <SimilarPrograms
          gender={program.gender}
          ageGroup={program.ageRange}
          currentSlug={program.slug}
        />

        {/* FAQ */}
        {program.faq.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Часті запитання
            </h2>
            <div className="space-y-3">
              {program.faq.map((item, i) => (
                <details key={i} className="group border border-gray-200 rounded-lg">
                  <summary className="flex items-center justify-between px-4 py-3 cursor-pointer text-sm font-medium text-gray-800 list-none">
                    {item.q}
                    <svg className="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform shrink-0 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <p className="px-4 pb-3 text-sm text-gray-600 leading-relaxed">{item.a}</p>
                </details>
              ))}
            </div>
          </section>
        )}

        {/* GEO block */}
        <section className="mb-8 text-sm text-gray-600 bg-gray-50 rounded-xl p-5">
          <p>
            Програма доступна в містах-партнерах check-up.in.ua.{' '}
            <a href="/ukr/kharkiv" className="text-[#005485] hover:underline">Харків</a>,{' '}
            <a href="/ukr/rivne" className="text-[#005485] hover:underline">Рівне</a> — оберіть місто вище, щоб побачити ціни.
          </p>
        </section>

        {/* Sources */}
        {program.sources && program.sources.length > 0 && (
          <section className="mb-8">
            <h2 className="text-sm font-semibold text-gray-500 mb-2">Джерела</h2>
            <ol className="space-y-1">
              {program.sources.map((src, i) => (
                <li key={i} className="text-xs text-gray-400">
                  [{i + 1}] {src}
                </li>
              ))}
            </ol>
            <p className="text-xs text-gray-400 mt-2">Автор: Ігор Растрепін, засновник check-up.in.ua</p>
          </section>
        )}

        {/* Disclaimer */}
        <div className="text-xs text-gray-400 border-t border-gray-100 pt-4">
          Інформація має ознайомчий характер і не є медичною консультацією. Лікар може рекомендувати додаткові дослідження з урахуванням індивідуальних особливостей.
        </div>

      </main>

      {/* Sticky bar */}
      <StickyBar
        analysesCount={program.analysesCount}
        diagnosticsCount={program.diagnosticsCount}
        programTitle={program.titleShort}
      />

    </>
  );
}
