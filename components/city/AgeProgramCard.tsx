// Картка програми на сторінках чекапів основного домену – один компонент, два варіанти (НОРМАТИВ 26.11, gender-hub v0.1 §4):
//   age – картка вікової сторінки (age-page-zones v0.9.2 §4.1): назва → рядок клініки → лічильники → «Що входить» →
//         ціна, дата ціни, «Записатися». Без змін відносно пакета 1.
//   catalog – картка каталогу хабу статі (gender-hub §4.1): H3 = назва програми, рядок клініки текстом, вік, склад цифрами,
//         ціна (+ закреслена ціна і «−N%» лише при знижці), далі `footer` («Програма і запис →»). Кнопки запису в картці немає.
// Вихід із AgeProgramsZone.tsx (раніше внутрішня функція, не експортувалася).

import type { ReactNode } from 'react';
import Accordion from '@/components/frame/Accordion';
import { countText } from '@/components/frame/ProgramCard';
import { BookCta } from '@/components/city/BookingFlow';
import type { OfferBranch, OfferClinic, OfferProgram } from '@/lib/programs/clinic-offer';
import type { ProgramComposition } from '@/lib/programs/composition';
import { visitsText } from '@/lib/programs/age-page-shared';
import { priceDiscount } from '@/lib/programs/price';
import { formatPrice, type Currency } from '@/lib/format/price';
import { fillLabel, type PluralForms } from '@/lib/format/labels';

export interface AgeZoneCard {
  key: string;
  program: OfferProgram;
  clinic: OfferClinic;
  branches: OfferBranch[];
  composition: ProgramComposition;
  /** Рядок програми перед лічильниками (вік програми, кількість візитів) – як у шаблоні сторінки. */
  meta?: string[];
  /** Рядок під лічильниками (напр. «Для жінок від 45 років, підходить після 50»). */
  note?: string | null;
  /** «Ціна може змінитися…» – priceDateNotice з дати ціни. */
  notice?: string;
  /** Готова назва програми для показу (мова сторінки). Немає – program.name_ua (ui-kit v1.16.1 §6.14 п. 2). */
  programName?: string;
}

/** Словник підписів зони (ui-kit v1.16.1 §6.14 п. 1; components-map v7.5 §30.10). Дефолти – українські. */
export interface AgeProgramsZoneLabels {
  /** Форми слова «філія» [one, few, many]. */
  branchesCount: PluralForms;
  /** Рядок клініки з кількома філіями; {count} – «2 філії», {cityLoc} – «Харкові». Текст зі специфікації: «{N} філії в {city_loc}». */
  branchesLine: string;
  /** Під картками. Текст зі специфікації. */
  orderNote: string;
}

export const AGE_PROGRAMS_ZONE_LABELS: AgeProgramsZoneLabels = {
  branchesCount: ['філія', 'філії', 'філій'],
  branchesLine: '{count} в {cityLoc}',
  orderNote: 'Порядок – не рейтинг.',
};

/** Адреса і метро філії для показу: готові рядки сторінки, інакше address_ua / metro_ua. */
function branchText(b: OfferBranch): string {
  const metro = b.metro !== undefined ? b.metro : b.metro_ua;
  return `${b.address ?? b.address_ua}${metro ? `, ${metro}` : ''}`;
}

function fmtDate(iso: string) {
  const [y, m, d] = iso.slice(0, 10).split('-');
  return `${d}.${m}.${y}`;
}

const TEXT = 'text-text-secondary leading-relaxed';

/** Лічильники складу з бази: «3 консультації · 3 обстеження · 6 аналізів». */
function countsMeta(c: ProgramComposition): string[] {
  return [
    ...(c.counts.consultations > 0 ? [countText(c.counts.consultations, ['консультація', 'консультації', 'консультацій'])] : []),
    ...(c.counts.diagnostics > 0 ? [countText(c.counts.diagnostics, ['обстеження', 'обстеження', 'обстежень'])] : []),
    ...(c.counts.analyses > 0 ? [countText(c.counts.analyses, ['аналіз', 'аналізи', 'аналізів'])] : []),
  ];
}

/** Рядок програми з кількістю візитів – так, як його будували шаблони (перша літера велика). */
export function visitsMeta(composition: ProgramComposition | null, prefix: (string | null | undefined)[] = []): string[] {
  const v = composition && composition.visitCount > 0 ? visitsText(composition.visitCount) : null;
  return [...prefix, v]
    .filter((t): t is string => Boolean(t))
    .map((t, i) => (i === 0 ? t.charAt(0).toUpperCase() + t.slice(1) : t));
}

function ClinicRow({ clinic, branches, cityLoc, labels }: { clinic: OfferClinic; branches: OfferBranch[]; cityLoc: string; labels: AgeProgramsZoneLabels }) {
  const one = branches.length === 1 ? branches[0] : null;
  return (
    <div className="mt-3 border-l-2 border-[var(--border)] pl-3">
      <p className="text-[15px] font-semibold text-ink leading-snug">{clinic.name}</p>
      {one && (
        <p className="mt-0.5 text-[14px] text-text-secondary leading-snug">{branchText(one)}</p>
      )}
      {branches.length > 1 && (
        <p className="mt-0.5 text-[14px] text-text-secondary leading-snug">
          {fillLabel(labels.branchesLine, { count: countText(branches.length, labels.branchesCount), cityLoc })}
        </p>
      )}
    </div>
  );
}

/** «Що входить» – єдиний акордеон картки і рамки, нативний <details>: склад у серверному HTML (age-page-zones v0.9.2 §4.1). */
export function ProgramIncludes({ composition }: { composition: ProgramComposition }) {
  const items = composition.items;
  const lab = items.filter((i) => i.serviceType === 'lab').map((i) => i.name);
  const instrumental = items.filter((i) => i.serviceType === 'instrumental').map((i) => i.name);
  return (
    <Accordion as="h4" summary="Що входить">
      <div className={`space-y-4 text-[15px] ${TEXT} pb-2`}>
        {composition.consultationsSummary && (
          composition.visitsKnown ? (
            <div>
              <p className="font-semibold text-ink mb-1">Консультації</p>
              <p>
                Перший візит: {composition.consultationsSummary}.
                {composition.visit2ConsultationsSummary && ` Другий візит: ${composition.visit2ConsultationsSummary}.`}
              </p>
            </div>
          ) : (
            /* Склад зі stored composition: візит позиції невідомий – рядок без «Перший візит» і «Другий візит». */
            <p>
              <span className="font-semibold text-ink">Консультації:</span> {composition.consultationsSummary}.
            </p>
          )
        )}
        {lab.length > 0 && (
          <div>
            <p className="font-semibold text-ink mb-1">Аналізи</p>
            <ul className="list-disc pl-5 space-y-1">
              {lab.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          </div>
        )}
        {instrumental.length > 0 && (
          <div>
            <p className="font-semibold text-ink mb-1">Обстеження</p>
            <ul className="list-disc pl-5 space-y-1">
              {instrumental.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Accordion>
  );
}

/** Картка каталогу (gender-hub v0.1 §4): нейтральна, білий фон, рамка --border 1px, радіус 12, відступ 16 / 20.
 *  Назва програми – H3; назва клініки – рядок тексту (не заголовок, не посилання). Бейджів, рейтингів і кнопки запису немає. */
function CatalogCardView({
  card,
  cityLoc,
  currency,
  labels,
  data,
}: {
  card: AgeZoneCard;
  cityLoc: string;
  currency: Currency;
  labels: AgeProgramsZoneLabels;
  data: CatalogCardData;
}) {
  const { program, branches, composition } = card;
  const one = branches.length === 1 ? branches[0] : null;
  const place = one
    ? ((one.metro !== undefined ? one.metro : one.metro_ua) || (one.address ?? one.address_ua))
    : branches.length > 1
      ? countText(branches.length, labels.branchesCount)
      : null;
  const counts = countsMeta(composition);
  return (
    <article id={data.id} aria-labelledby={`${data.id}-h`} className="flex flex-col h-full bg-white border border-[var(--border)] rounded-[var(--radius-lg)] p-4 sm:p-5">
      <h3 id={`${data.id}-h`} className="text-[18px] font-bold text-ink leading-snug [text-wrap:balance]">
        {card.programName ?? program.name_ua}
      </h3>
      <p className="mt-1.5 text-[14px] text-text-primary leading-snug">
        {data.clinicShortName}
        {place ? ` · ${place}` : ''}
      </p>
      {data.ageLine && <p className="mt-1 text-[14px] text-text-secondary leading-snug">{data.ageLine}</p>}
      {counts.length > 0 && <p className="mt-1 text-[14px] text-text-secondary leading-snug">{counts.join(' · ')}</p>}
      {data.payable !== null && (
        <p className="mt-3 flex flex-wrap items-baseline gap-x-2">
          <span data-price={data.payable} className="text-[20px] font-bold text-ink leading-tight" style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
            {formatPrice(data.payable, currency)}
          </span>
          {data.discount && (
            <>
              <span className="text-[14px] text-text-secondary line-through">{formatPrice(data.discount.regular, currency)}</span>
              <span className="text-[13px] font-semibold text-ink bg-bg-subtle rounded-[var(--radius-sm)] px-1.5 py-0.5">−{data.discount.pct}%</span>
            </>
          )}
        </p>
      )}
      <div className="mt-auto pt-3">{data.footer}</div>
    </article>
  );
}

/** Дані варіанта catalog (gender-hub §4.1). */
export interface CatalogCardData {
  /** Коротка назва клініки з конфігурації міста. */
  clinicShortName: string;
  /** Рядок віку: «30–40 років», «Після 40 років», «Для будь-якого віку»; null – рядка немає. */
  ageLine: string | null;
  /** Ціна до сплати; null – рядка ціни немає. */
  payable: number | null;
  /** Закреслена ціна клініки і «−N%» – лише при знижці. */
  discount: { regular: number; pct: number } | null;
  /** Під ціною: «Програма і запис →» (клієнтська кнопка каталогу). Кнопки запису в картці немає. */
  footer: ReactNode;
  /** id картки (для aria і прокрутки). */
  id: string;
}

export function AgeProgramCard({
  card,
  index,
  cityLoc,
  sourceCta,
  multi,
  currency,
  labels,
  variant = 'age',
  catalog,
}: {
  card: AgeZoneCard;
  index: number;
  cityLoc: string;
  sourceCta: string;
  multi: boolean;
  currency: Currency;
  labels: AgeProgramsZoneLabels;
  variant?: 'age' | 'catalog';
  /** Обов'язковий для variant="catalog". */
  catalog?: CatalogCardData;
}) {
  if (variant === 'catalog' && catalog) {
    return <CatalogCardView card={card} cityLoc={cityLoc} currency={currency} labels={labels} data={catalog} />;
  }
  const { program, clinic, branches, composition, notice } = card;
  const id = index === 0 ? 'sklad-prohramy' : `sklad-prohramy-${index}`;
  const meta = [...(card.meta ?? []), ...countsMeta(composition)];
  const disc = priceDiscount(program.price_regular, program.price_discount);
  return (
    <article
      id={id}
      aria-labelledby={`${id}-h`}
      className="scroll-mt-20 bg-white border border-[var(--border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] p-[var(--space-card)]"
    >
      <h3 id={`${id}-h`} className="text-[21px] font-bold text-ink leading-tight [text-wrap:balance]">
        {card.programName ?? program.name_ua}
      </h3>
      <ClinicRow clinic={clinic} branches={branches} cityLoc={cityLoc} labels={labels} />
      {meta.length > 0 && (
        <ul className="mt-3 flex flex-wrap text-[14px] text-text-secondary">
          {meta.map((m, i) => (
            <li key={m}>
              {m}
              {i < meta.length - 1 && <span aria-hidden="true" className="mx-2">·</span>}
            </li>
          ))}
        </ul>
      )}
      {card.note && <p className="mt-1 text-[14px] text-text-secondary">{card.note}</p>}

      <div className="mt-4">
        <ProgramIncludes composition={composition} />
      </div>

      {/* Ціна і одна дія (рішення 13.11). id – панель плану ховається, поки кнопку видно (одна програма). */}
      <div id={index === 0 ? 'program-buy' : `program-buy-${index}`} className="mt-5 pt-5 border-t border-section-border grid gap-3.5">
        <div>
          <p className="flex flex-wrap items-baseline gap-x-2">
            <span data-price={program.price_discount} className="text-[30px] font-bold text-[var(--brand-primary)] leading-tight" style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
              {formatPrice(program.price_discount, currency)}
            </span>
            {disc && (
              <>
                <span className="text-[14px] text-text-secondary line-through">{formatPrice(disc.regular, currency)}</span>
                <span className="text-[14px] text-text-secondary">−{disc.pct}%</span>
              </>
            )}
          </p>
          {program.price_date && <p className="text-[13px] text-text-secondary mt-1">Ціна клініки станом на {fmtDate(program.price_date)}</p>}
          {notice && <p className="text-[13px] text-text-secondary mt-1">{notice}</p>}
        </div>
        <BookCta
          programSlug={program.slug}
          sourceCta={`${sourceCta}_card`}
          label="Записатися"
          variant={multi ? 'secondary' : 'primary' /* booking: crimson, одна програма */}
        />
      </div>
    </article>
  );
}

