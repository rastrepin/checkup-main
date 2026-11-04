// «Мій план обстеження» на віковій сторінці – серверна обгортка (docs/ux/specs/2026-11-my-plan.md v0.3).
// Один виклик у шаблоні app/ukr/{female,male}-checkup/{вік}/city-page.tsx – для всіх міст.
// Дані – lib/plan/data.ts (DATABASE.md 2.1 §6.2). Немає жодного публічного рядка Базового плану – блоку немає (null).

import Eyebrow from '@/components/frame/Eyebrow';
import type { CheckupCity } from '@/lib/cities/checkup-cities';
import type { AgeSegment, PlanGender } from '@/lib/plan/age-groups';
import { fetchMyPlan } from '@/lib/plan/data';
import { PLAN_T } from '@/lib/plan/texts';
import MyPlanClient from './MyPlanClient';

export default async function MyPlan({ gender, seg, city }: { gender: PlanGender; seg: AgeSegment; city: CheckupCity }) {
  const data = await fetchMyPlan(gender, seg, city);
  if (!data) return null;
  return (
    <section id="plan" aria-labelledby="plan-h2" className="border-t border-section-border bg-white scroll-mt-16">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-6 lg:px-14 py-[var(--space-section)]">
        <div className="max-w-[720px]">
          <Eyebrow className="mb-[var(--space-eyebrow)]">{PLAN_T.eyebrow}</Eyebrow>
          <h2 id="plan-h2" className="font-display font-bold text-ink text-[28px] lg:text-[34px] leading-[1.15]">
            {PLAN_T.title}
          </h2>
          {PLAN_T.lead && <p className="mt-[var(--space-heading)] text-[17px] leading-[1.6] text-text-secondary">{PLAN_T.lead}</p>}
        </div>
        <MyPlanClient data={data} />
      </div>
    </section>
  );
}
