'use client';

import { useState, useEffect } from 'react';
import { QuizProvider, type Gender, type AgeGroup } from './QuizContext';
import QuizEngine from './QuizEngine';
import RoadmapResult from './RoadmapResult';
import BranchSelector from './BranchSelector';
import ContactForm from './ContactForm';
import BookingConfirmation from './BookingConfirmation';

interface QuizHeroWidgetProps {
  clinicSlug: string;
  city: string;
  sourcePage: string;
  locale?: 'ua' | 'ru';
  presetGender?: Gender;
  presetAge?: AgeGroup;
}

function QuizFlow({
  clinicSlug,
  city,
  sourcePage,
  locale,
}: {
  clinicSlug: string;
  city: string;
  sourcePage: string;
  locale: 'ua' | 'ru';
}) {
  return (
    <>
      <QuizEngine clinicSlug={clinicSlug} city={city} locale={locale} />
      <RoadmapResult city={city} />
      <BranchSelector />
      <ContactForm sourcePage={sourcePage} clinicSlug={clinicSlug} city={city} />
      <BookingConfirmation />
    </>
  );
}

export default function QuizHeroWidget({
  clinicSlug,
  city,
  sourcePage,
  locale = 'ua',
  presetGender,
  presetAge,
}: QuizHeroWidgetProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  // Listen for global open-quiz event
  // Mobile → open overlay; Desktop → scroll to inline quiz card
  useEffect(() => {
    const handler = () => {
      if (window.innerWidth < 1024) {
        setMobileOpen(true);
      } else {
        document.getElementById('quiz')?.scrollIntoView({ behavior: 'smooth' });
      }
    };
    window.addEventListener('open-quiz', handler);
    return () => window.removeEventListener('open-quiz', handler);
  }, []);

  // Lock body scroll when mobile overlay is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
      document.body.classList.add('quiz-open');
    } else {
      document.body.style.overflow = '';
      document.body.classList.remove('quiz-open');
    }
    return () => {
      document.body.style.overflow = '';
      document.body.classList.remove('quiz-open');
    };
  }, [mobileOpen]);

  return (
    <QuizProvider presetGender={presetGender} presetAge={presetAge}>
      {/* ── Desktop inline card (visible on lg+, hidden on mobile) ── */}
      <div className="hidden lg:block self-start bg-white rounded-2xl p-8 shadow-[0_12px_48px_rgba(0,0,0,0.25)]">
        <QuizFlow
          clinicSlug={clinicSlug}
          city={city}
          sourcePage={sourcePage}
          locale={locale}
        />
      </div>

      {/* ── Mobile CTA button (visible on mobile, hidden on lg+) ── */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="lg:hidden block w-full py-4 bg-[#005485] text-white text-center rounded-xl text-base font-bold hover:bg-[#003d66] transition-colors"
      >
        Підібрати програму
      </button>

      {/* ── Mobile overlay (full-screen, hidden on lg+) ── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-[100] flex flex-col lg:hidden"
          role="dialog"
          aria-modal="true"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />

          {/* Modal content */}
          <div className="relative flex-1 overflow-y-auto">
            <div className="max-w-[480px] mx-auto min-h-full bg-white pt-0 pb-24">
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-100 z-10 px-4 py-3 flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700">Підбір програми</span>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                  aria-label="Закрити"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              <div className="px-5 pt-5">
                <QuizFlow
                  clinicSlug={clinicSlug}
                  city={city}
                  sourcePage={sourcePage}
                  locale={locale}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </QuizProvider>
  );
}
