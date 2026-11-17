// Каркас: GeoBlock – копія §12 GeoBlock для основного домену (components-map v7.5 §29.21; ui-kit v1.16.1 §6.14 п. 7, §6.9, §6.10).
// Статичний абзац 14px у серверному HTML, не згортається, без телефону і без посилань на сайт клініки.
// Текст і адреси – пропами, без прив'язки до конфігу міста (CityMdDoc / CheckupCity). Текст – із затвердженого .md.
// Server component: без 'use client', без акордеона і табів.

import type { ReactNode } from 'react';
import Section from '@/components/frame/Section';

export default function GeoBlock({
  tone = 'white',
  intro,
  paragraphs,
  addresses = [],
  id,
}: {
  tone?: 'white' | 'muted';
  /** Вступний рядок перед абзацами (необов'язковий). */
  intro?: ReactNode;
  /** Абзаци блоку: готовий текст, як у .md. */
  paragraphs: ReactNode[];
  /** Готові рядки адрес філій, кожен – окремий рядок. Немає – рядків адрес немає (напр. клініка без філії). */
  addresses?: string[];
  id?: string;
}) {
  const hasText = Boolean(intro) || paragraphs.length > 0 || addresses.length > 0;
  if (!hasText) return null;
  const lines: ReactNode[] = [...paragraphs, ...addresses];
  return (
    <Section tone={tone} width="read" id={id}>
      <div className="text-[14px] leading-relaxed text-text-secondary">
        {intro && <p>{intro}</p>}
        {lines.map((line, i) => (
          <p key={i} className={intro || i > 0 ? 'mt-1' : ''}>
            {line}
          </p>
        ))}
      </div>
    </Section>
  );
}
