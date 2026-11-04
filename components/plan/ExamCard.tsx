'use client';

// Картка дослідження (docs/ux/specs/2026-11-my-plan.md v0.3 §4). Нейтральна картка платформи: білий фон, рамка --border,
// радіус 12, мінімальна висота 236px. Обидва боки – у серверному HTML; зворот прихований атрибутом hidden.
// Перегортання – лише кнопкою «Що варто знати ↻» (виняток ui-kit v1.9 §6.10): aria-expanded, aria-controls на зворот,
// фокус – на заголовок звороту, після повернення – на кнопку. Анімація 220 мс до 12° (.exam-flip-in у globals.css),
// prefers-reduced-motion – без анімації. Кнопки немає, якщо в базі немає тексту шкоди з датою рецензента.

import { useEffect, useRef } from 'react';
import { buttonClass } from '@/components/frame/Button';
import type { PlanExam } from '@/lib/plan/data';
import { PLAN_T } from '@/lib/plan/texts';

export default function ExamCard({
  exam,
  idPrefix,
  price,
  added,
  onToggle,
  flipped,
  onFlip,
}: {
  exam: PlanExam;
  /** Префікс id: одне дослідження може стояти і в «Додати дослідження», і в ризик-флоу. */
  idPrefix: string;
  /** Рядок ціни: сума, «Ціна – після вибору клініки», «Немає в {клініка}» або null. */
  price: { text: string; strong: boolean } | null;
  added: boolean;
  onToggle: () => void;
  flipped: boolean;
  onFlip: (open: boolean) => void;
}) {
  const backId = `${idPrefix}-${exam.slug}-back`;
  const flipBtn = useRef<HTMLButtonElement>(null);
  const backTitle = useRef<HTMLHeadingElement>(null);
  const wasFlipped = useRef(flipped);

  useEffect(() => {
    if (flipped && !wasFlipped.current) backTitle.current?.focus();
    if (!flipped && wasFlipped.current) flipBtn.current?.focus();
    wasFlipped.current = flipped;
  }, [flipped]);

  const badge =
    exam.rationaleType === 'guideline'
      ? PLAN_T.badgeGuideline(exam.sourceRef)
      : exam.rationaleType === 'know_your_norm'
        ? PLAN_T.badgeNorm
        : exam.rationaleType === 'doctor'
          ? PLAN_T.badgeDoctor
          : null;

  const addBtn = (
    <button
      type="button"
      aria-pressed={added}
      onClick={onToggle}
      className={`${buttonClass({ variant: 'secondary', size: 'md' })} shrink-0 ${added ? '!bg-link !text-white hover:!bg-brand-primary-hover' : ''}`}
    >
      {added ? PLAN_T.addedBtn : PLAN_T.add}
      <span className="sr-only">: {exam.name}</span>
    </button>
  );

  return (
    <article className="min-h-[236px] flex flex-col">
      <div
        hidden={flipped}
        className="flex-1 flex flex-col bg-white border border-[var(--border)] rounded-[var(--radius-lg)] p-[var(--space-card)]"
      >
        <div className="flex items-start justify-between gap-3">
          {badge ? (
            <span className="inline-flex px-2 py-1 rounded-[var(--radius-sm)] bg-bg-subtle text-ink text-[12px] font-semibold leading-snug">{badge}</span>
          ) : (
            <span />
          )}
          {exam.harm && (
            <button
              ref={flipBtn}
              type="button"
              aria-expanded={flipped}
              aria-controls={backId}
              onClick={() => onFlip(true)}
              className="relative shrink-0 inline-flex items-center min-h-9 px-3 rounded-[var(--radius-md)] border border-border-strong bg-white text-ink text-[13px] font-semibold hover:bg-bg-muted after:absolute after:-inset-y-1 after:inset-x-0 after:content-[''] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--link)]"
            >
              {PLAN_T.flip}
            </button>
          )}
        </div>
        <h4 className="mt-3 text-[17px] font-bold leading-snug text-ink">{exam.name}</h4>
        {exam.purpose && <p className="mt-1 text-[14px] leading-snug text-ink">{exam.purpose}</p>}
        {exam.rationale && <p className="mt-2 text-[13px] leading-relaxed text-text-secondary">{exam.rationale}</p>}
        <div className="mt-auto pt-4 flex items-center justify-between gap-3">
          {price ? (
            <span className={price.strong ? 'text-[17px] font-bold text-text-primary' : 'text-[14px] text-text-secondary'}>{price.text}</span>
          ) : (
            <span />
          )}
          {addBtn}
        </div>
      </div>

      {exam.harm && (
        <div
          id={backId}
          hidden={!flipped}
          className="exam-flip-in flex-1 flex flex-col bg-bg-muted border border-[var(--border)] rounded-[var(--radius-lg)] p-[var(--space-card)]"
        >
          <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-text-secondary">{PLAN_T.backEyebrow}</p>
          <h4 ref={backTitle} tabIndex={-1} className="mt-2 text-[17px] font-bold leading-snug text-ink outline-none">
            {exam.name}
          </h4>
          <p className="mt-2 text-[15px] leading-relaxed text-ink">{exam.harm}</p>
          <div className="mt-auto pt-4 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => onFlip(false)}
              className="inline-flex items-center min-h-11 text-[14px] font-semibold text-link underline decoration-1 underline-offset-[3px] hover:decoration-2"
            >
              {PLAN_T.flipBack}
            </button>
            {addBtn}
          </div>
        </div>
      )}
    </article>
  );
}
