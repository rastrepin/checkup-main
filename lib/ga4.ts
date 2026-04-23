/**
 * GA4 events для check-up.in.ua
 * Використовувати в client components: import { trackEvent } from '@/lib/ga4'
 */

declare global {
  // eslint-disable-next-line no-var
  var gtag: (cmd: string, event: string, params?: Record<string, unknown>) => void;
}

function track(event: string, params?: Record<string, unknown>) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', event, params);
  }
}

// Quiz
export const ga4 = {
  quizStart: (city: string, page: string) =>
    track('quiz_start', { city, page }),

  quizStep: (step: string, value: string) =>
    track('quiz_step', { step, value }),

  quizRoadmapView: (program: string, city: string) =>
    track('quiz_roadmap_view', { program, city }),

  quizBranchSelect: (branch: string, city: string) =>
    track('quiz_branch_select', { branch, city }),

  // Leads
  formStart: (city: string) =>
    track('form_start', { city }),

  formSubmit: (city: string, program: string) =>
    track('form_submit', { city, program }),

  leadCreated: (city: string, value: number) =>
    track('lead_created', { city, value }),
};
