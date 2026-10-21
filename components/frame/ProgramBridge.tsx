// Каркас: смуга-посилання на програму клініки (макет зон 20.10).
// Легкий блок для тих, хто шукає програму: мітка, назва, два рядки опису, кнопка в зону програми.
// Стиль зони програми: сірий фон, синя лінія зверху. Ціни і порівняння з рекомендаціями тут немає.
// Місце – між розділами (ui-kit §6.11): на вікових сторінках одразу після меню розділів, на всю ширину.

export default function ProgramBridge({
  label,
  title,
  teaser,
  href,
  cta,
  className = '',
}: {
  label: string;
  title: string;
  teaser?: string;
  href: string;
  cta: string;
  className?: string;
}) {
  return (
    <section aria-label={label} className={`zone-program-mark relative bg-[var(--zone-program-bg)] ${className}`}>
      <div className="max-w-[1200px] mx-auto px-5 sm:px-6 lg:px-14 py-6 lg:py-7 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-10">
        <div className="min-w-0 lg:max-w-[720px]">
          <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-link">{label}</p>
          <p className="mt-1.5 text-[17px] font-bold text-ink">{title}</p>
          {teaser && <p className="mt-1 text-[15px] leading-[1.55] text-text-secondary line-clamp-2">{teaser}</p>}
        </div>
        <a
          href={href}
          className="shrink-0 inline-flex items-center gap-2 min-h-11 px-[22px] rounded-[var(--radius-lg)] border-[1.5px] border-link text-link font-display font-bold text-[15px] hover:bg-brand-primary-soft transition-colors"
        >
          {cta}
        </a>
      </div>
    </section>
  );
}
