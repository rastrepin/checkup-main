// Список програм вікової сторінки – age-page-zones v0.9.2 §2.4, §4.1, §6.1; ui-kit v1.17.1 §6.1 (НОРМАТИВ 22.11, пакет 1).
// Спільний для 8 шаблонів app/ukr/{female,male}-checkup/{вік}/city-page.tsx.
// Не більше 3 карток, порядок – з конфігурації міста; під картками «Порядок – не рейтинг.».
// Картка: назва → рядок клініки (одна філія – адреса з метро; кілька – «{N} філії в {cityLoc}») → лічильники →
// акордеон «Що входить» (у серверному HTML) → ціна і «Записатися». Інших акордеонів немає.
// Одна crimson-кнопка на екрані (ui-kit §6.1): одна програма – «Записатися» booking у картці; 2+ – у картках secondary.
// Шторки «Обрати програму» і плаваючого блоку немає: закріплена панель вікової сторінки – лише панель плану (MyPlanClient).
// Посилання на каталог хабу статі – проп catalogLink, за замовчуванням вимкнено (до рішення оркестратора).

import type { ReactNode } from 'react';
import Accordion from '@/components/frame/Accordion';
import { countText } from '@/components/frame/ProgramCard';
import { BookCta, CatalogLink } from '@/components/city/BookingFlow';
import type { OfferBranch, OfferClinic, OfferProgram } from '@/lib/programs/clinic-offer';
import type { ProgramComposition } from '@/lib/programs/composition';
import { visitsText } from '@/lib/programs/age-page-shared';
import { priceDiscount } from '@/lib/programs/price';
import { formatPrice, type Currency } from '@/lib/format/price';
import { fillLabel, mergeLabels, type PluralForms } from '@/lib/format/labels';

/** Не більше стількох карток програм на вікову сторінку (§2.4). */
export const MAX_AGE_CARDS = 3;

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

/** Посилання на каталог хабу статі з фільтром за віком (§2.4). Поки не вмикається: сторінки його не передають. */
export interface AgeCatalogLink {
  href: string;
  /** Готовий текст з .md (catalog_more / catalog_all). */
  label: string;
  /** Вік фільтра для події catalog_link_click: сегмент адреси, напр. 40-50-rokiv. */
  filterAge: string;
}

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

function AgeProgramCard({
  card,
  index,
  cityLoc,
  sourceCta,
  multi,
  currency,
  labels,
}: {
  card: AgeZoneCard;
  index: number;
  cityLoc: string;
  sourceCta: string;
  multi: boolean;
  currency: Currency;
  labels: AgeProgramsZoneLabels;
}) {
  const { program, clinic, branches, composition, notice } = card;
  const id = index === 0 ? 'sklad-prohramy' : `sklad-prohramy-${index}`;
  const items = composition.items;
  const lab = items.filter((i) => i.serviceType === 'lab').map((i) => i.name);
  const instrumental = items.filter((i) => i.serviceType === 'instrumental').map((i) => i.name);
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
        {/* «Що входить» – єдиний акордеон картки, нативний <details>: склад у серверному HTML (age-page-zones v0.9.2 §4.1). */}
        <Accordion as="h4" summary="Що входить">
          <div className={`space-y-4 text-[15px] ${TEXT} pb-2`}>
            {composition.consultationsSummary && (
              <div>
                <p className="font-semibold text-ink mb-1">Консультації</p>
                <p>
                  Перший візит: {composition.consultationsSummary}.
                  {composition.visit2ConsultationsSummary && ` Другий візит: ${composition.visit2ConsultationsSummary}.`}
                </p>
              </div>
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
        {catalogLink && shown.length > 0 && <CatalogLink href={catalogLink.href} label={catalogLink.label} filterAge={catalogLink.filterAge} programsCount={shown.length} />}
        {children}
      </div>
    </div>
  );
}
