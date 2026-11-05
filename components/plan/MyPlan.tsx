// «Мій план обстеження» на віковій сторінці – серверна обгортка (docs/ux/specs/2026-11-my-plan.md v0.5).
// Один виклик у шаблоні app/ukr/{female,male}-checkup/{вік}/city-page.tsx – для всіх міст.
// Дані – lib/plan/data.ts (DATABASE.md 2.1 §6.2). Немає жодного публічного рядка Базового плану – блоку немає (null).
// Лід (§1) – ключ 4p_plan.lead у .md сторінки (content/kharkiv/{стать}-{вік}.md – джерело текстів вікових шаблонів);
// ключа немає, він порожній або лишився плейсхолдер без значення – ліду немає.
// id="plan-zone" – від H2 до кінця ризик-флоу: поки він на екрані, панель сторінки схована; панель плану – у MyPlanClient (§8б).
// H2 і лід передаються в MyPlanClient: на desktop вони стоять у лівій колонці сітки блоку (§1.1).

import Eyebrow from '@/components/frame/Eyebrow';
import type { CheckupCity } from '@/lib/cities/checkup-cities';
import { fillPlaceholders, loadCityMdSections } from '@/lib/content/city-md';
import type { AgeSegment, PlanGender } from '@/lib/plan/age-groups';
import { fetchMyPlan } from '@/lib/plan/data';
import { PLAN_T } from '@/lib/plan/texts';
import MyPlanClient from './MyPlanClient';

/** Тека з .md вікових сторінок: шаблони однакові для всіх міст, тексти – з цих файлів. */
const AGE_MD_DIR = 'kharkiv';

function planLead(gender: PlanGender, seg: AgeSegment, city: CheckupCity): string | null {
  const vars = { city: city.name, city_loc: city.loc, city_slug: city.slug, in_city: city.inCity };
  const doc = loadCityMdSections(AGE_MD_DIR, `${gender}-${seg}`, vars);
  const raw = doc?.raw['4p_plan'];
  const m = raw?.match(/^lead:\s*"(.*)"\s*$/m);
  const text = m ? fillPlaceholders(m[1], vars).trim() : '';
  return text && !/\{[A-Za-z_0-9]+\}/.test(text) ? text : null;
}

export default async function MyPlan({ gender, seg, city }: { gender: PlanGender; seg: AgeSegment; city: CheckupCity }) {
  const data = await fetchMyPlan(gender, seg, city);
  if (!data) return null;
  const lead = planLead(gender, seg, city);
  return (
    <section id="plan" aria-labelledby="plan-h2" className="border-t border-section-border bg-white scroll-mt-16">
      <div className="max-w-[1200px] lg:max-w-[1176px] mx-auto px-5 sm:px-6 lg:px-7 py-[var(--space-section)]">
        <Eyebrow className="mb-[var(--space-eyebrow)]">{PLAN_T.eyebrow}</Eyebrow>
        <div id="plan-zone">
          <MyPlanClient
            data={data}
            header={
              <div className="max-w-[720px]">
                <h2 id="plan-h2" className="font-display font-bold text-ink text-[28px] lg:text-[34px] leading-[1.15]">
                  {PLAN_T.title}
                </h2>
                {lead && <p className="mt-[var(--space-heading)] text-[17px] leading-[1.6] text-text-secondary">{lead}</p>}
              </div>
            }
          />
        </div>
      </div>
    </section>
  );
}
