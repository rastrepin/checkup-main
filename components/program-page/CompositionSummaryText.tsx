// Стислий опис складу програми (завдання "Скорочення складу і розділення
// сторінки", 29.08.2026, Частина 1). Один спільний компонент для Блоку 4,
// Блоку 7 (візит 1) і сайдбара — щоб текст не розходився між місцями показу.
// Повний перелік показників на цій сторінці більше НІДЕ не рендериться;
// він лишається на сторінці програми на піддомені.

export interface CompositionSummaryTextProps {
  consultationsSummary: string;
  instrumentalSummary: string;
  labSummary: string;
  /** Менший розмір тексту й відступів — для сайдбара, де місця мало. */
  compact?: boolean;
}

export default function CompositionSummaryText({
  consultationsSummary,
  instrumentalSummary,
  labSummary,
  compact = false,
}: CompositionSummaryTextProps) {
  const labelClass = compact
    ? 'text-[11px] font-semibold text-text-secondary mb-0.5'
    : 'text-xs font-semibold text-text-secondary mb-1';
  const textClass = compact
    ? 'text-[13px] text-gray-700 leading-relaxed'
    : 'text-[14px] text-gray-700 leading-relaxed';
  const gapClass = compact ? 'space-y-2' : 'space-y-3';

  if (!consultationsSummary && !instrumentalSummary && !labSummary) return null;

  return (
    <div className={gapClass}>
      {consultationsSummary && (
        <div>
          <p className={labelClass}>Консультації</p>
          <p className={textClass}>{consultationsSummary}.</p>
        </div>
      )}
      {instrumentalSummary && (
        <div>
          <p className={labelClass}>Обстеження</p>
          <p className={textClass}>{instrumentalSummary}</p>
        </div>
      )}
      {labSummary && (
        <div>
          <p className={labelClass}>Аналізи</p>
          <p className={textClass}>{labSummary}</p>
        </div>
      )}
    </div>
  );
}
