// Каркас: заголовок зони сторінки (макет зон 20.10). Межа зони на всю ширину: синя лінія і фон зони.
// Перед зоною програми клініки. Тексти передає сторінка.

import Eyebrow from './Eyebrow';

export default function ZoneHeader({
  id,
  eyebrow,
  title,
  sub,
}: {
  id: string;
  eyebrow: string;
  title: string;
  sub?: string;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-h2`} className="zone-program-mark scroll-mt-16 relative bg-[var(--zone-program-bg)]">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-6 lg:px-14 pt-[var(--space-section)] pb-2">
        <Eyebrow className="mb-[var(--space-eyebrow)]">{eyebrow}</Eyebrow>
        <h2 id={`${id}-h2`} className="font-display font-bold text-ink text-[28px] lg:text-[38px] leading-[1.15]">
          {title}
        </h2>
        {sub && <p className="mt-4 max-w-[640px] text-[17px] leading-[1.6] text-text-secondary">{sub}</p>}
      </div>
    </section>
  );
}
