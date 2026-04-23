'use client';

import { QuizProvider, type Gender, type AgeGroup } from './QuizContext';
import QuizEngine from './QuizEngine';
import RoadmapResult from './RoadmapResult';
import BranchSelector from './BranchSelector';
import ContactForm from './ContactForm';
import BookingConfirmation from './BookingConfirmation';
import StickyPriceBar from './StickyPriceBar';
import type { ClinicBranch } from '@/lib/types';

interface QuizWrapperProps {
  clinicSlug: string;
  city: string;
  locale?: 'ua' | 'ru';
  sourcePage: string;
  presetGender?: Gender;
  presetAge?: AgeGroup;
  branches?: ClinicBranch[];
}

export default function QuizWrapper({
  clinicSlug,
  city,
  locale = 'ua',
  sourcePage,
  presetGender,
  presetAge,
  branches = [],
}: QuizWrapperProps) {
  return (
    <QuizProvider presetGender={presetGender} presetAge={presetAge} branches={branches}>
      <div className="max-w-[480px] mx-auto bg-[#f9fafb] rounded-[10px] p-5 pb-20">
        <QuizEngine clinicSlug={clinicSlug} city={city} locale={locale} />
        <RoadmapResult />
        <BranchSelector />
        <ContactForm sourcePage={sourcePage} clinicSlug={clinicSlug} city={city} />
        <BookingConfirmation />
      </div>
      <StickyPriceBar />
    </QuizProvider>
  );
}
