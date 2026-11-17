// Список програм вікової сторінки – age-page-zones v0.7.1 §4.1, §6.1; ui-kit v1.14 §6.1, §6.11 (НОРМАТИВ 14.11, Б.2–Б.5).
// Спільний для 8 шаблонів app/ukr/{female,male}-checkup/{вік}/city-page.tsx.
// Одна картка на програму: назва → рядок клініки (одна філія – адреса з метро; кілька – «N філії в …» і
// акордеон «Адреси філій»; графіка немає – age-page-zones v0.7.2 §4.1, §4.1а, рішення Ігоря 15.11) → лічильники → акордеони («Що входить» у серверному HTML, «Як це проходить», «Підготовка»)
// → ціна і «Записатися». Окремої картки клініки (ProgramLocation) немає. Склад відкритим текстом не дублюється.
// Одна crimson-кнопка на екрані (ui-kit §6.1): одна програма – «Записатися» booking у картці; 2+ – у картках secondary,
// crimson лише «Обрати програму» (закріплена панель mobile, плаваючий блок desktop праворуч).
// Картки – в одну колонку до 720px; desktop 2+ – праворуч блок 360px (sticky) з «Обрати програму» → діалог списку.

import type { ReactNode } from 'react';
import Accordion from '@/components/frame/Accordion';
import { countText } from '@/components/frame/ProgramCard';
import { BookCta } from '@/components/city/BookingFlow';
import { OpenPickerButton, type PickerProgram } from '@/components/city/ProgramPicker';
import type { OfferBranch, OfferClinic, OfferProgram } from '@/lib/programs/clinic-offer';
import type { ProgramComposition } from '@/lib/programs/composition';
import { branchesWord, FIRST_VISIT_TEXT, preparationItems, SECOND_VISIT_TEXT_V2, visitsText } from '@/lib/programs/age-page-shared';
import { priceDiscount } from '@/lib/programs/price';
import { formatPrice, type Currency } from '@/lib/format/price';
import { fillLabel, mergeLabels, type PluralForms } from '@/lib/format/labels';

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

/** Словник плаваючого блоку desktop (ui-kit v1.16.1 §6.14 п. 1; components-map v7.5 §30.10). Дефолти – українські. */
export interface AgeProgramsZoneLabels {
  /** Форми слова «програма» [one, few, many]; рядок: «{n} {форма} в {cityLoc}». */
  programsCount: PluralForms;
  /** {price} – ціна з валютою. */
  fromPrice: string;
  pickProgram: string;
}

export const AGE_PROGRAMS_ZONE_LABELS: AgeProgramsZoneLabels = {
  programsCount: ['програма', 'програми', 'програм'],
  fromPrice: 'від {price}',
  pickProgram: 'Обрати програму',
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

function ClinicRow({ clinic, branches, cityLoc }: { clinic: OfferClinic; branches: OfferBranch[]; cityLoc: string }) {
  const one = branches.length === 1 ? branches[0] : null;
  return (
    <div className="mt-3 border-l-2 border-[var(--border)] pl-3">
      <p className="text-[15px] font-semibold text-ink leading-snug">{clinic.name}</p>
      {one && (
        <p className="mt-0.5 text-[14px] text-text-secondary leading-snug">{branchText(one)}</p>
      )}
      {branches.length > 1 && (
        <p className="mt-0.5 text-[14px] text-text-secondary leading-snug">
          {branches.length} {branchesWord(branches.length)} в {cityLoc}
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
}: {
  card: AgeZoneCard;
  index: number;
  cityLoc: string;
  sourceCta: string;
  multi: boolean;
  currency: Currency;
}) {
  const { program, clinic, branches, composition, notice } = card;
  const id = index === 0 ? 'sklad-prohramy' : `sklad-prohramy-${index}`;
  const items = composition.items;
  const lab = items.filter((i) => i.serviceType === 'lab').map((i) => i.name);
  const instrumental = items.filter((i) => i.serviceType === 'instrumental').map((i) => i.name);
  const preparation = preparationItems(items);
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
      <ClinicRow clinic={clinic} branches={branches} cityLoc={cityLoc} />
      {branches.length > 1 && (
        <Accordion size="sm" summary="Адреси філій" className="mt-3">
          <ul className="space-y-2 text-[14px]">
            {branches.map((b) => (
              <li key={b.id} className="text-ink">
                {branchText(b)}
              </li>
            ))}
          </ul>
        </Accordion>
      )}
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
        {/* «Що входить» – повний склад групами, нативний <details>: склад у серверному HTML (age-page-zones v0.7.1 §4.1). */}
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
        {composition.visitCount > 0 && (
          <Accordion as="h4" id={index === 0 ? 'yak-tse-prokhodyt' : `yak-tse-prokhodyt-${index}`} summary="Як це проходить">
            <p className={TEXT}>Програма проходить за {visitsText(composition.visitCount)}.</p>
            <div className="mt-4 flex flex-col gap-4">
              <div className="flex gap-3">
                <span className="w-8 h-8 shrink-0 rounded-full bg-[var(--teal-soft)] text-link font-bold flex items-center justify-center" aria-hidden="true">1</span>
                <div>
                  <p className="font-bold text-ink mt-1">Перший візит</p>
                  <p className={`${TEXT} mt-1`}>{FIRST_VISIT_TEXT}</p>
                </div>
              </div>
              {composition.visit2Items.length > 0 && (
                <div className="flex gap-3">
                  <span className="w-8 h-8 shrink-0 rounded-full bg-[var(--teal-soft)] text-link font-bold flex items-center justify-center" aria-hidden="true">2</span>
                  <div>
                    <p className="font-bold text-ink mt-1">Другий візит</p>
                    <p className={`${TEXT} mt-1`}>{SECOND_VISIT_TEXT_V2}</p>
                  </div>
                </div>
              )}
            </div>
            <p className={`${TEXT} mt-4`}>
              Якщо ви приїжджаєте з іншого міста або з-за кордону, скажіть про це під час запису і вкажіть бажану дату.
            </p>
          </Accordion>
        )}
        {preparation.length > 0 && (
          <Accordion as="h4" summary="Підготовка">
            <ul className={`list-disc pl-5 space-y-1 ${TEXT}`}>
              {preparation.map((n, i) => (
                <li key={n}>
                  {n}
                  {i < preparation.length - 1 ? ';' : '.'}
                </li>
              ))}
            </ul>
          </Accordion>
        )}
      </div>

      {/* Ціна і одна дія (рішення 13.11). id – закріплена панель ховається, поки кнопку видно (одна програма). */}
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
          variant={multi ? 'secondary' : 'primary'}
        />
      </div>
    </article>
  );
}

/** Мінімальна ціна до сплати серед карток – та сама величина, що в meta і TwoWays (minPrice шаблону). */
function minOf(cards: AgeZoneCard[]): number | null {
  const p = cards.map((c) => c.program.price_discount).filter((n) => typeof n === 'number' && n > 0);
  return p.length > 0 ? Math.min(...p) : null;
}

/** Рядки списку програм (§6.1) у порядку карток. */
export function pickerPrograms(cards: AgeZoneCard[]): PickerProgram[] {
  return cards.map((c) => ({ slug: c.program.slug, name: c.programName ?? c.program.name_ua, clinic: c.clinic.name, price: c.program.price_discount }));
}

export default function AgeProgramsZone({
  cards,
  cityLoc,
  sourceCta,
  minPrice,
  children,
  labels,
  currency = 'UAH',
}: {
  cards: AgeZoneCard[];
  cityLoc: string;
  sourceCta: string;
  /** {min} – minPrice шаблону (той самий розрахунок, що в meta). Немає – мінімум з карток. */
  minPrice?: number | null;
  /** Під картками: примітка «лікар визначає» тощо – як у шаблоні. */
  children?: ReactNode;
  /** Підписи плаваючого блоку: передаються лише змінені ключі, решта – українські дефолти. */
  labels?: Partial<AgeProgramsZoneLabels>;
  /** Валюта цін у картках і блоці, дефолт 'UAH'. */
  currency?: Currency;
}) {
  const L = mergeLabels(AGE_PROGRAMS_ZONE_LABELS, labels);
  const multi = cards.length > 1;
  const min = minPrice ?? minOf(cards);
  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,720px)_360px] lg:justify-between lg:gap-x-12 lg:items-start">
      <div className="min-w-0 flex flex-col gap-4">
        {cards.map((card, i) => (
          <AgeProgramCard key={card.key} card={card} index={i} cityLoc={cityLoc} sourceCta={sourceCta} multi={multi} currency={currency} />
        ))}
        {children}
      </div>
      {multi && (
        <aside className="hidden lg:block lg:sticky lg:top-24 bg-white border border-[var(--border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] p-[var(--space-card)]">
          <p className="text-[17px] font-bold text-ink">
            {countText(cards.length, L.programsCount)} в {cityLoc}
          </p>
          {min !== null && (
            <p className="mt-1 text-[20px] font-bold text-ink" style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
              {fillLabel(L.fromPrice, { price: formatPrice(min, currency) })}
            </p>
          )}
          <div className="mt-4">
            <OpenPickerButton label={L.pickProgram} count={cards.length} />
          </div>
        </aside>
      )}
    </div>
  );
}
