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

/** Події блоку «Мій план» (docs/ux/specs/2026-11-my-plan.md §9). Без назв факторів ризику і причин (PLATFORM-LINE 7.1).
 *  Кожна – з variant і entry_point. Якщо GA на сторінці немає, подія нікуди не йде. */
export type PlanEventBase = { variant: number; entry_point: string };
export const planEvents = {
  clinicPick: (p: PlanEventBase & { clinic: string; position: number }) => track('plan_clinic_pick', p),
  itemDrop: (p: PlanEventBase & { slug: string }) => track('plan_item_drop', p),
  itemBack: (p: PlanEventBase & { slug: string }) => track('plan_item_back', p),
  examAdd: (p: PlanEventBase & { slug: string; source: 'extra' | 'risk' }) => track('plan_exam_add', p),
  examRemove: (p: PlanEventBase & { slug: string; source: 'extra' | 'risk' }) => track('plan_exam_remove', p),
  cardFlip: (p: PlanEventBase & { slug: string }) => track('exam_card_flip', p),
  riskFlowOpen: (p: PlanEventBase) => track('risk_flow_open', p),
  bookStart: (p: PlanEventBase & { items: number; clinic: string; price: number }) => track('plan_book_start', p),
};
