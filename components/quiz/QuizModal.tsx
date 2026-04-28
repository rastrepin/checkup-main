'use client';

import { useState, useEffect } from 'react';
import { QuizProvider, type Gender, type AgeGroup } from './QuizContext';
import QuizEngine from './QuizEngine';
import RoadmapResult from './RoadmapResult';
import BranchSelector from './BranchSelector';
import ContactForm from './ContactForm';
import BookingConfirmation from './BookingConfirmation';

interface QuizModalProps {
  clinicSlug: string;
  city: string;
  locale?: 'ua' | 'ru';
  sourcePage: string;
  presetGender?: Gender;
  presetAge?: AgeGroup;
}

// Small trigger button — fires the open-quiz event
export function QuizOpenBtn({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => window.dispatchEvent(new CustomEvent('open-quiz'))}
    >
      {children}
    </button>
  );
}

export default function QuizModal({
  clinicSlug,
  city,
  locale = 'ua',
  sourcePage,
  presetGender,
  presetAge,
}: QuizModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const openHandler = () => setIsOpen(true);
    window.addEventListener('open-quiz', openHandler);
    return () => window.removeEventListener('open-quiz', openHandler);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Hide sticky bars from page
      document.body.classList.add('quiz-open');
    } else {
      document.body.style.overflow = '';
      document.body.classList.remove('quiz-open');
    }
    return () => {
      document.body.style.overflow = '';
      document.body.classList.remove('quiz-open');
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      />

      {/* Modal content */}
      <div className="relative flex-1 overflow-y-auto">
        <div className="max-w-[480px] mx-auto min-h-full bg-white pt-0 pb-24">
          {/* Close button */}
          <div className="sticky top-0 bg-white border-b border-gray-100 z-10 px-4 py-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700">Підбір програми</span>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
              aria-label="Закрити"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          <div className="px-5 pt-5">
            <QuizProvider presetGender={presetGender} presetAge={presetAge}>
              <QuizEngine clinicSlug={clinicSlug} city={city} locale={locale} />
              <RoadmapResult city={city} />
              <BranchSelector />
              <ContactForm sourcePage={sourcePage} clinicSlug={clinicSlug} city={city} />
              <BookingConfirmation />
            </QuizProvider>
          </div>
        </div>
      </div>
    </div>
  );
}
