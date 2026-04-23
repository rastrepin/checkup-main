import Link from 'next/link';

export interface MedicalFact {
  number: string;
  label: string;
  source?: string;
}

interface MedicalHeroProps {
  /** Breadcrumb last item */
  diagnosisLabel: string;
  /** Eyebrow pill text, e.g. "Гінекологія · Поширений діагноз" */
  eyebrow: string;
  /** H1 text. Use {em: 'слово'} for the italic navy word */
  h1: string;
  /** The word inside <em> in H1 */
  h1Em?: string;
  /** Lead paragraph */
  lead: string;
  /** Primary CTA href */
  primaryHref?: string;
  /** Secondary CTA href */
  secondaryHref?: string;
  /** Facts data for the card */
  facts: MedicalFact[];
  /** aria-labelledby id */
  headingId: string;
}

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

export default function MedicalHero({
  diagnosisLabel,
  eyebrow,
  h1,
  h1Em,
  lead,
  primaryHref = '#lead-form',
  secondaryHref = '#methods',
  facts,
  headingId,
}: MedicalHeroProps) {
  // Split h1 to inject <em> around h1Em if provided
  const renderH1 = () => {
    if (!h1Em) return h1;
    const idx = h1.indexOf(h1Em);
    if (idx === -1) return h1;
    return (
      <>
        {h1.slice(0, idx)}
        <em className="not-italic text-[#005485] font-semibold">{h1Em}</em>
        {h1.slice(idx + h1Em.length)}
      </>
    );
  };

  return (
    <section
      className="bg-gradient-to-br from-[#fcfaf6] to-white py-8 md:py-12 lg:py-14"
      aria-labelledby={headingId}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Breadcrumbs */}
        <nav aria-label="Навігація" className="text-[12px] text-gray-500 mb-6 md:mb-8">
          <Link href="/" className="hover:text-gray-900 transition-colors">check-up.in.ua</Link>
          <span className="mx-1.5 text-gray-400">/</span>
          <Link href="/cases" className="hover:text-gray-900 transition-colors">Діагнози</Link>
          <span className="mx-1.5 text-gray-400">/</span>
          <span className="text-gray-900">{diagnosisLabel}</span>
        </nav>

        {/* 2-col grid */}
        <div className="grid grid-cols-1 md:grid-cols-[1.3fr,1fr] gap-10 md:gap-16 items-start">

          {/* Left: content */}
          <div>
            {/* Eyebrow pill */}
            <div className="inline-flex items-center gap-2 bg-[#005485]/[0.08] text-[#005485] px-3.5 py-1.5 rounded-full text-sm font-medium mb-5">
              <span className="w-2 h-2 bg-[#04D3D9] rounded-full shrink-0" />
              {eyebrow}
            </div>

            {/* H1 — Source Serif 4 */}
            <h1
              id={headingId}
              className="text-[30px] md:text-[44px] leading-[1.18] font-semibold tracking-tight text-[#0b1a24] mb-4 max-w-[680px]"
              style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
            >
              {renderH1()}
            </h1>

            {/* Lead */}
            <p className="text-base md:text-[17px] text-[#4a5a6b] leading-relaxed max-w-xl mb-7">
              {lead}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
              <a
                href={primaryHref}
                className="inline-flex items-center justify-center gap-2.5 bg-[#005485] hover:bg-[#003a5e] text-white px-7 py-4 rounded-full font-semibold text-[15px] transition shadow-[0_8px_24px_rgba(0,84,133,0.18)]"
              >
                Записатись на консультацію
                <ArrowRight />
              </a>
              <a
                href={secondaryHref}
                className="inline-flex items-center justify-center gap-2 bg-transparent text-[#005485] px-6 py-3.5 rounded-full border-[1.5px] border-[#005485]/25 hover:border-[#005485] hover:bg-[#005485]/[0.04] font-semibold text-sm transition"
              >
                Побачити методи та ціни
              </a>
            </div>

            {/* Reassurance */}
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <ShieldCheck />
              Інформаційний матеріал — не замінює консультацію лікаря
            </div>
          </div>

          {/* Right: Facts Card */}
          <div>
            <div className="bg-white rounded-2xl p-6 md:p-7 shadow-[0_4px_24px_rgba(11,30,47,0.08)] border border-[#e8e4dc] max-w-[420px]">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-widest mb-5">
                Факти про діагноз
              </div>
              <div className="grid grid-cols-2 gap-x-5 gap-y-6">
                {facts.map((fact) => (
                  <div key={fact.label}>
                    <div
                      className="font-semibold text-[38px] md:text-[40px] leading-none text-[#005485] mb-1.5"
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
  );
}
