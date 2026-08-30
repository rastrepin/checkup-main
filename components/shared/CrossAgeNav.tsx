import Link from 'next/link';
import { AGE_STEP_PAGES, type AgeStepGender } from '@/lib/programs/age-pages';

interface CrossAgeNavProps {
  /** href поточної сторінки — рядок у переліку рендериться без посилання */
  currentHref: string;
  className?: string;
}

const GENDER_LABEL: Record<AgeStepGender, string> = {
  female: 'Жінки',
  male: 'Чоловіки',
};

// Блок 8а MD: статичний HTML, показує лише сторінки, що реально існують
// (реєстр — lib/programs/age-pages.ts). Посилання на невидану сторінку заборонене.
// Поточна сторінка позначена, але не є посиланням.
// ОНОВЛЕНО 29.08.2026 (завдання "Скорочення складу і розділення сторінки", п.2):
// заголовок полегшено (text-base замість text-lg, text-gray-700 замість -900) —
// компонент відкриває "додаткову частину" сторінки, менша типографічна вага
// сигналізує це без приховування контенту (він лишається повністю в DOM).
export default function CrossAgeNav({ currentHref, className = '' }: CrossAgeNavProps) {
  const genders: AgeStepGender[] = ['female', 'male'];
  const groups = genders
    .map((gender) => ({
      gender,
      pages: AGE_STEP_PAGES.filter((p) => p.gender === gender),
    }))
    .filter((group) => group.pages.length > 0);

  if (groups.length === 0) return null;

  return (
    <section className={`py-8 border-t border-gray-100 ${className}`} aria-label="Обстеження для інших вікових груп">
      <h2 className="text-base font-semibold text-gray-700 mb-4">Обстеження для інших вікових груп</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {groups.map((group) => (
          <div key={group.gender}>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">
              {GENDER_LABEL[group.gender]}
            </p>
            <ul className="space-y-1.5">
              {group.pages.map((page) => {
                const isCurrent = page.href === currentHref;
                return (
                  <li key={page.href}>
                    {isCurrent ? (
                      <span className="text-sm font-medium text-gray-900" aria-current="page">
                        {page.ageStepLabel}
                      </span>
                    ) : (
                      <Link href={page.href} className="text-sm text-[#005485] hover:underline">
                        {page.ageStepLabel}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
