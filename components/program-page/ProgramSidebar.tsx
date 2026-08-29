import { BookCta } from '@/components/city/BookingFlow';

// components-map-FIXED.md §3, mode="program" (платформа check-up.in.ua, checkup-main).
// Еталон з'являється з першою живою сторінкою (це вона) — Program-варіант PriceSidebar.
//
// Доповнення понад контракт §3 (§3 не описує тригер CTA — рішення Cowork 29.08.2026,
// "ВІДПОВІДЬ COWORK — механізм CTA", п.1): programSlug/sourceCta для BookCta,
// реюз open-booking-flow + вже задеплойеного /api/leads, окремий BookingFlow-modal
// не створюється — рендериться один раз на сторінці.

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
  programSlug,
  sourceCta,
}: ProgramSidebarProps) {
  const dateLabel = new Date(priceDate).toLocaleDateString('uk-UA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="bg-white border border-gray-200 rounded-[10px] p-5">
      <h3 className="text-base font-bold text-[#0b1a24] mb-1 leading-snug">{official_name}</h3>

      {/* Ціна видима одразу — без accordion/розкриття (НЕ PriceMobileAccordion-патерн, §3) */}
      <div className="text-2xl font-bold text-[#0b1a24] mb-0.5">{fmt(price)} грн</div>
      <p className="text-xs text-gray-500 mb-1">Ціна на {dateLabel}</p>
      {priceDateNotice && (
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-2 py-1.5 mb-2">
          {priceDateNotice}
        </p>
      )}

      {counts.length > 0 && (
        <p className="text-[13px] text-gray-500 mb-4">
          {counts.map((c) => `${c.count} ${c.label}`).join(' · ')}
        </p>
      )}

      <BookCta programSlug={programSlug} sourceCta={sourceCta} label="Записатися" className="mb-2.5" />

      <a
        href={subdomainHref}
        className="block text-center text-[13px] text-[#005485] mb-4 hover:underline"
      >
        Що входить у програму →
      </a>

      {additionalServices.length > 0 && (
        <div className="border-t border-gray-100 pt-3 mb-3">
          <p className="text-xs font-semibold text-gray-500 mb-2">Додатково в клініці</p>
          <ul className="space-y-1.5">
            {additionalServices.map((item) => (
              <li key={item.label} className="flex items-start gap-2 text-[13px]">
                <span className={item.available ? 'text-emerald-600' : 'text-gray-300'} aria-hidden="true">
                  {item.available ? '✓' : '—'}
                </span>
                <span className={item.available ? 'text-gray-700' : 'text-gray-400'}>
                  {item.label}
                  {/* null/false-стан — принцип AdditionalCosts: лейбл завжди видимий,
                      статус-текст замінює відсутнє значення, не порожній рядок (§3) */}
                  {!item.available && <span className="text-gray-400"> — уточнюйте в клініці</span>}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {branches.length > 0 && (
        <div className="border-t border-gray-100 pt-3">
          <p className="text-xs font-semibold text-gray-500 mb-2">Локації</p>
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
