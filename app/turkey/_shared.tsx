// Спільне для сторінок /turkey* (TURKEY-MIGRATION.md v0.6, розділ 3). Лише наявні компоненти, тексти – з docs/turkey/.
// Підписи інтерфейсу і currency/policyHref – з docs/turkey/ui-ru.json; решта – українські дефолти компонентів.

import Link from 'next/link';
import type { ReactNode } from 'react';
import UI from '@/docs/turkey/ui-ru.json';
import type { BookingFlowLabels } from '@/components/city/BookingFlow';
import type { Currency } from '@/lib/format/price';

export const TURKEY_SITE = 'https://check-up.in.ua';

/** Мова сторінки – російська (Ігор, 16.11.2026): html lang лишається з root layout, мову сторінки ставить обгортка. */
export const TURKEY_LANG = 'ru';

export const TURKEY_CURRENCY = UI.props.currency as Currency;
export const TURKEY_POLICY_HREF = UI.props.policyHref;
export const TURKEY_BOOKING_LABELS = UI.BookingFlow as unknown as Partial<BookingFlowLabels>;
export const TURKEY_BOOK_CTA_LABEL = UI.BookCta_label;
export const TURKEY_FROM_PRICE = UI.AgeProgramsZone_floating.fromPrice;
export const TURKEY_CARD_LABELS = UI.program_card;

/** Місто в заявці (поле leads.city) – slug міста клінік у таблиці clinics. */
export const TURKEY_CITY = 'istanbul';

export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb">
      {items.map((it, i) => (
        <span key={it.label}>
          {i > 0 && <span className="mx-1.5">/</span>}
          {it.href ? (
            <Link href={it.href} className="hover:underline">
              {it.label}
            </Link>
          ) : (
            <span aria-current="page">{it.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

export function JsonLd({ data }: { data: unknown }): ReactNode {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
