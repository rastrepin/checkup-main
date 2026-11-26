// Список програм вікової сторінки – age-page-zones v0.9.2 §2.4, §4.1, §6.1; ui-kit v1.17.1 §6.1 (НОРМАТИВ 22.11, пакет 1).
// Спільний для 8 шаблонів app/ukr/{female,male}-checkup/{вік}/city-page.tsx.
// Не більше 3 карток, порядок – з конфігурації міста; під картками «Порядок – не рейтинг.».
// Картка: назва → рядок клініки (одна філія – адреса з метро; кілька – «{N} філії в {cityLoc}») → лічильники →
// акордеон «Що входить» (у серверному HTML) → ціна і «Записатися». Інших акордеонів немає.
// Одна crimson-кнопка на екрані (ui-kit §6.1): одна програма – «Записатися» booking у картці; 2+ – у картках secondary.
// Шторки «Обрати програму» і плаваючого блоку немає: закріплена панель вікової сторінки – лише панель плану (MyPlanClient).
// Посилання на каталог хабу статі – проп catalogLink, за замовчуванням вимкнено (до рішення оркестратора).

import type { ReactNode } from 'react';
import { CatalogLink } from '@/components/city/BookingFlow';
import { mergeLabels } from '@/lib/format/labels';
import {
  AgeProgramCard,
  AGE_PROGRAMS_ZONE_LABELS,
  visitsMeta,
  type AgeProgramsZoneLabels,
  type AgeZoneCard,
} from '@/components/city/AgeProgramCard';
import type { Currency } from '@/lib/format/price';

// AgeProgramCard і підписи живуть у AgeProgramCard.tsx; тут – re-export, щоб шаблони сторінок не міняли імпорти.
export { AgeProgramCard, AGE_PROGRAMS_ZONE_LABELS, visitsMeta };
export type { AgeProgramsZoneLabels, AgeZoneCard };

/** Не більше стількох карток програм на вікову сторінку (§2.4). */
export const MAX_AGE_CARDS = 3;

/** Посилання на каталог хабу статі з фільтром за віком (§2.4). Сторінки передають його для пар «стать + місто», де є каталог (задача НОРМАТИВ 26.11). */
export interface AgeCatalogLink {
  href: string;
  /** Готовий текст з .md (catalog_more / catalog_all). */
  label: string;
  /** Вік фільтра для події catalog_link_click: сегмент адреси, напр. 40-50-rokiv. */
  filterAge: string;
  /** Кількість програм каталогу для цього віку (не показаних карток) – параметр події і {n} у тексті. */
  programsCount: number;
}

export default function AgeProgramsZone({
  cards,
  cityLoc,
  sourceCta,
  children,
  labels,
  currency = 'UAH',
  nature,
  catalogLink = null,
}: {
  cards: AgeZoneCard[];
  cityLoc: string;
  sourceCta: string;
  /** Під картками: примітка «лікар визначає» тощо – як у шаблоні. */
  children?: ReactNode;
  /** Підписи: передаються лише змінені ключі, решта – українські дефолти. */
  labels?: Partial<AgeProgramsZoneLabels>;
  /** Валюта цін у картках, дефолт 'UAH'. */
  currency?: Currency;
  /** Природа пропозиції клініки (6c_clinic_zone.nature) – рядок над картками; null – рядка немає. */
  nature?: string | null;
  /** Посилання на каталог хабу статі під картками. За замовчуванням null – не виводиться. */
  catalogLink?: AgeCatalogLink | null;
}) {
  const L = mergeLabels(AGE_PROGRAMS_ZONE_LABELS, labels);
  const shown = cards.slice(0, MAX_AGE_CARDS);
  const multi = shown.length > 1;
  return (
    <div className="max-w-[720px]">
      <div className="min-w-0 flex flex-col gap-4">
        {nature && shown.length > 0 && <p className="text-[15px] leading-relaxed text-text-secondary">{nature}</p>}
        {shown.map((card, i) => (
          <AgeProgramCard key={card.key} card={card} index={i} cityLoc={cityLoc} sourceCta={sourceCta} multi={multi} currency={currency} labels={L} />
        ))}
        {multi && <p className="text-[13px] leading-snug text-text-secondary">{L.orderNote}</p>}
        {catalogLink && shown.length > 0 && <CatalogLink href={catalogLink.href} label={catalogLink.label} filterAge={catalogLink.filterAge} programsCount={catalogLink.programsCount} />}
        {children}
      </div>
    </div>
  );
}
