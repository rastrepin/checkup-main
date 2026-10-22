// Каркас: CtaBanner «Перший крок – консультація» (docs/ux/ui-kit.md v1.1 §6.6, варіант (а)).
// Звичайна секція потоку: той самий фон по черзі, лівий край контейнера, py-14.
// Без кольорового фону і плями. H2 з курсивною частиною Source Serif – колір --text-primary,
// акцент формою, не кольором. Кнопка booking lg + reassurance-рядок під нею.
// Текст банера відповідає дії кнопки (ui-kit §7.1, правило 6). Тексти передає сторінка.

import type { ReactNode } from 'react';
import Eyebrow from './Eyebrow';
import Section from './Section';

export default function CtaBanner({
  eyebrow,
  h2,
  h2Italic,
  text,
  cta,
  caption,
  tone = 'white',
  id,
}: {
  eyebrow?: ReactNode;
  h2: ReactNode;
  h2Italic?: ReactNode;
  text?: ReactNode;
  cta: ReactNode;
  caption?: ReactNode;
  tone?: 'white' | 'muted';
  id?: string;
}) {
  return (
    <Section tone={tone} id={id} ariaLabelledby={id ? `${id}-h2` : undefined}>
      <div className="max-w-[720px]">
        {eyebrow && (
          <Eyebrow marker="dash" className="mb-6">
            {eyebrow}
          </Eyebrow>
        )}
        <h2 id={id ? `${id}-h2` : undefined} className="font-display font-bold text-[var(--text-primary)] text-[28px] lg:text-[38px] leading-[1.15]">
          {h2}
          {h2Italic && (
            <>
              {' '}
              <span className="italic font-medium" style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
                {h2Italic}
              </span>
            </>
          )}
        </h2>
        {text && <div className="mt-5 text-[17px] leading-[1.6] text-text-secondary">{text}</div>}
        <div className="mt-8">{cta}</div>
        {caption && <div className="mt-3 text-[13px] text-text-secondary">{caption}</div>}
      </div>
    </Section>
  );
}
