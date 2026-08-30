import { BookCta } from '@/components/city/BookingFlow';
import AccordionSection from '@/components/shared/AccordionSection';
import CompositionSummaryText from '@/components/program-page/CompositionSummaryText';

// components-map-FIXED.md §3, mode="program" (платформа check-up.in.ua, checkup-main).
// Еталон з'являється з першою живою сторінкою (це вона) — Program-варіант PriceSidebar.
//
// Доповнення понад контракт §3 (§3 не описує тригер CTA — рішення Cowork 29.08.2026,
// "ВІДПОВІДЬ COWORK — механізм CTA", п.1): programSlug/sourceCta для BookCta,
// реюз open-booking-flow + вже задеплойеного /api/leads, окремий BookingFlow-modal
// не створюється — рендериться один раз на сторінці.
//
// ОНОВЛЕНО 29.08.2026 (завдання "UX-переробка", п.4): compositionText — новий
// проп. Сайдбар відповідає на 4 питання без переходів: скільки коштує (ціна),
// що входить (лічильники завжди + розкривний стислий опис), де пройти (branches).
// Четверте питання, скільки візитів, СВІДОМО не показується — це відповідь блоку 7.
//
// ОНОВЛЕНО 29.08.2026 (завдання "Скорочення складу і розділення сторінки", п.1):
// розкривний блок більше НЕ показує повний перелік показників — лише стислий
// опис (CompositionSummaryText, той самий текст, що в блоці 4/7). Повний перелік
// — тільки на сторінці програми на піддомені (посилання нижче).

export interface ProgramSidebarBranch {
  name: string;
  address: string;
}

export interface ProgramSidebarCount {
  label: string;
  count: number;
}

export interface ProgramSidebarAdditionalService {
  label: string;
  available: boolean;
}

export interface ProgramSidebarCompositionText {
  consultationsSummary: string;
  instrumentalSummary: string;
  labSummary: string;
}

export interface ProgramSidebarProps {
  mode: 'program';
  price: number;
  priceDate: string;
  /** Готовий текст застереження — сторінка обчислює свіжість ДО рендеру, компонент лише показує (§3). */
  priceDateNotice?: string;
  official_name: string;
  branches: ProgramSidebarBranch[];
  counts: ProgramSidebarCount[];
  subdomainHref: string;
  additionalServices: ProgramSidebarAdditionalService[];
  /** Розкривний стислий опис складу, згорнутий за замовчуванням (п.4, 29.08.2026;
   *  звужено до стислого опису — "Скорочення складу", п.1, 29.08.2026). */
  compositionText?: ProgramSidebarCompositionText;
  /** Доповнення понад §3 — для BookCta (open-booking-flow), див. коментар вище файлу. */
  programSlug: string;
  sourceCta: string;
}

function fmt(n: number) {
  return n.toLocaleString('uk-UA');
}

export default function ProgramSidebar({
  price,
  priceDate,
  priceDateNotice,
  official_name,
  branches,
  counts,
  subdomainHref,
  additionalServices,
  compositionText,
  programSlug,
  sourceCta,
}: ProgramSidebarProps) {
  const dateLabel = new Date(priceDate).toLocaleDateString('uk-UA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const countsLabel = counts.map((c) => `${c.count} ${c.label}`).join(' · ');

  return (
    <div className="bg-white border border-gray-200 rounded-[10px] p-5">
      <h3 className="text-base font-bold text-text-primary mb-1 leading-snug">{official_name}</h3>

      {/* Скільки коштує — видима одразу, без accordion (НЕ PriceMobileAccordion-патерн, §3) */}
      <div className="text-2xl font-bold text-text-primary mb-0.5">{fmt(price)} грн</div>
      <p className="text-xs text-text-secondary mb-1">Ціна на {dateLabel}</p>
      {priceDateNotice && (
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-2 py-1.5 mb-2">
          {priceDateNotice}
        </p>
      )}

      {/* Що входить — лічильники завжди видимі; повний перелік розкривається кліком.
          ОНОВЛЕНО (п.3, "UX-виправлення, ітерація 2", 29.08.2026): розкриття складу —
          дія на сторінці, оформлена як кнопка-рядок (bg-pill, без вигляду посилання),
          на відміну від переходу на сторінку програми нижче (справжній <a>, підкреслення,
          іконка переходу). Раніше обидва елементи виглядали як звичайний текстовий лінк —
          плутались. */}
      {countsLabel && (
        compositionText && (compositionText.consultationsSummary || compositionText.instrumentalSummary || compositionText.labSummary) ? (
          <AccordionSection
            summary={
              <span className="inline-flex items-center bg-gray-100 rounded-md px-2.5 py-1.5 -ml-0.5">
                Що входить · {countsLabel}
              </span>
            }
            className="mb-4"
          >
            <CompositionSummaryText
              consultationsSummary={compositionText.consultationsSummary}
              instrumentalSummary={compositionText.instrumentalSummary}
              labSummary={compositionText.labSummary}
              compact
            />
          </AccordionSection>
        ) : (
          <p className="text-[13px] text-text-secondary mb-4">{countsLabel}</p>
        )
      )}

      <BookCta
        programSlug={programSlug}
        sourceCta={sourceCta}
        label="Записатися"
        variant="crimson"
        className="mb-2.5"
      />

      <a
        href={subdomainHref}
        className="flex items-center justify-center gap-1.5 text-center text-[13px] text-navy underline decoration-navy/40 underline-offset-2 hover:decoration-navy mb-4"
      >
        Повний склад програми, лікарі та підготовка – на сторінці програми
        <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H9M17 7V15" />
        </svg>
      </a>

      {additionalServices.length > 0 && (
        <div className="border-t border-gray-100 pt-3 mb-3">
          <p className="text-xs font-semibold text-text-secondary mb-2">Додатково в клініці</p>
          <ul className="space-y-1.5">
            {additionalServices.map((item) => (
              <li key={item.label} className="flex items-start gap-2 text-[13px]">
                <span className={item.available ? 'text-emerald-600' : 'text-gray-300'} aria-hidden="true">
                  {item.available ? '✓' : '—'}
                </span>
                <span className={item.available ? 'text-gray-700' : 'text-gray-400'}>
                  {item.label}
                  {!item.available && <span className="text-gray-400"> — уточнюйте в клініці</span>}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Де пройти */}
      {branches.length > 0 && (
        <div className="border-t border-gray-100 pt-3">
          <p className="text-xs font-semibold text-text-secondary mb-2">Локації</p>
          <ul className="space-y-1 text-[13px] text-gray-600">
            {branches.map((b) => (
              <li key={b.address}>{b.name} · {b.address}</li>
            ))}
          </ul>
          <p className="text-[11px] text-gray-400 mt-1.5">Філію узгоджує оператор під час підтвердження запису.</p>
        </div>
      )}
    </div>
  );
}
