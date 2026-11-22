// «Мій план обстеження» на віковій сторінці – серверна обгортка (docs/ux/specs/2026-11-my-plan.md v0.5).
// Один виклик у шаблоні app/ukr/{female,male}-checkup/{вік}/city-page.tsx – для всіх міст.
// Дані – lib/plan/data.ts (DATABASE.md 2.1 §6.2). Немає жодного публічного рядка Базового плану – блоку немає (null).
// Тексти (§1) – ключ 4p_plan у .md сторінки (content/kharkiv/{стать}-{вік}.md): eyebrow, h2, lead, why, save_note, disclaimer;
// ключа немає, він порожній або лишився плейсхолдер без значення – тексту немає (lib/content/age-page-texts.ts).
// id="plan-zone" – від H2 до кінця ризик-флоу: поки він на екрані, панель сторінки схована; панель плану – у MyPlanClient (§8б).
// H2 і лід передаються в MyPlanClient: на desktop вони стоять у лівій колонці сітки блоку (§1.1).
// Фон секції – --bg-muted на всю ширину, межа з секцією перед нею – --section-border (my-plan v0.7 §1, рішення Ігоря 06.11).

import Eyebrow from '@/components/frame/Eyebrow';
import type { CheckupCity } from '@/lib/cities/checkup-cities';
import { planTexts } from '@/lib/content/age-page-texts';
import type { AgeSegment, PlanGender } from '@/lib/plan/age-groups';
import { fetchMyPlan } from '@/lib/plan/data';
import { PLAN_T } from '@/lib/plan/texts';
import MyPlanClient from './MyPlanClient';

export default async function MyPlan({ gender, seg, city }: { gender: PlanGender; seg: AgeSegment; city: CheckupCity }) {
  const data = await fetchMyPlan(gender, seg, city);
  if (!data) return null;
  // Тексти – ключ 4p_plan у .md (age-page-zones v0.9.2 §12.2, my-plan v0.8.1 §1): ключа немає – тексту немає.
  const t = planTexts(city, gender, seg);
  return (
    <section id="plan" aria-labelledby={t.h2 ? 'plan-h2' : undefined} aria-label={t.h2 ? undefined : PLAN_T.title} className="border-t border-section-border bg-bg-muted scroll-mt-16">
      <div className="max-w-[1200px] lg:max-w-[1176px] mx-auto px-5 sm:px-6 lg:px-7 py-[var(--space-section)]">
        {t.eyebrow && <Eyebrow className="mb-[var(--space-eyebrow)]">{t.eyebrow}</Eyebrow>}
        <div id="plan-zone">
          <MyPlanClient
            data={data}
            texts={{ saveNote: t.saveNote, disclaimer: t.disclaimer }}
            header={
              <div className="max-w-[720px]">
                {t.h2 && (
                  <h2 id="plan-h2" className="font-display font-bold text-ink text-[28px] lg:text-[34px] leading-[1.15]">
                    {t.h2}
                  </h2>
                )}
                {t.lead && <p className="mt-[var(--space-heading)] text-[17px] leading-[1.6] text-text-secondary">{t.lead}</p>}
                {t.why.length > 0 && (
                  <ul className="mt-4 list-disc pl-5 space-y-1.5 text-[15px] leading-[1.6] text-text-secondary">
                    {t.why.map((w) => (
                      <li key={w}>{w}</li>
                    ))}
                  </ul>
                )}
              </div>
            }
          />
        </div>
      </div>
    </section>
  );
}
