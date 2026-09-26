'use client';

import { useState, type ReactNode } from 'react';

// Блок 5 обох MD (5a-female-40-50/vid-50-kharkiv.md). Контракт наданий Cowork
// напряму в чаті 29.08.2026 (відсутній у components-map-FIXED.md):
//
// available[]: id, name, priceVariants[{label,price}], priceType 'exact'|'from',
//   priceNote?, priceDate, explanation
// unavailable[]: name, why, whereToGo — без ціни, без чекбокса, без CTA
// Секція unavailable ОБОВ'ЯЗКОВА, не опційна (з SPRINT-KHARKIV-v0: при порожньому
// unavailable[] секція не рендериться, щоб не було заголовка без переліку). Неактивні чекбокси заборонені —
// недоступна позиція йде лише в unavailable. Доступність по клініці, не по філії.
// null-стан за принципом AdditionalCosts: лейбл завжди видимий, статус-текст
// замінює відсутнє значення, не порожній рядок. Витримує порожню available[]
// (сторінка 40-50).
//
// Механізм CTA (рішення Cowork 29.08.2026, "ВІДПОВІДЬ COWORK — механізм CTA" п.2):
// "BookingFlowProvider" з контракту — умовна назва, не існуючий компонент.
// Стан чекбоксів живе ЛОКАЛЬНО тут; при кліку CTA поточний вибір передається
// в подію open-booking-flow через selectedAdditionalServices (resolved names,
// не id — резолв відбувається тут же, немає сенсу тягнути весь каталог
// clinic_services у BookingFlow лише для форматування Telegram-рядка).
// Власна кнопка «Записатися з обраним» замість передачі стану в сайдбар —
// технічно простіше, дозволено п.2 відповіді Cowork.

export interface AdditionalServicePriceVariant {
  label: string;
  price: number;
}

export interface AvailableAdditionalService {
  id: string;
  name: string;
  /** Обов'язкові в режимі з цінами (showPrices = true, за замовчуванням).
   *  У режимі без цін (SPRINT-KHARKIV-v0) можуть бути відсутні. */
  priceVariants?: AdditionalServicePriceVariant[];
  priceType?: 'exact' | 'from';
  priceNote?: string;
  priceDate?: string;
  /** Текст або розмітка (посилання на джерело [n]), як і why. */
  explanation: ReactNode;
}

export interface UnavailableAdditionalService {
  name: string;
  /** Текст або розмітка: сторінка може передати посилання на джерело ([n]) у тому ж вигляді, що й в основному тексті. */
  why: ReactNode;
  /** Порожній рядок – рядок не рендериться (задача v2, сторінка після 50). */
  whereToGo: string;
}

export interface AdditionalServicesProps {
  available: AvailableAdditionalService[];
  unavailable: UnavailableAdditionalService[];
  programSlug: string;
  sourceCta: string;
  /** Назва клініки з даних (clinics.name) для заголовка секції unavailable.
   *  Раніше назва була вшита в код (SPRINT-KHARKIV-v0: «з даних, не з коду»).
   *  Без clinicName заголовок нейтральний: «у цій клініці». */
  clinicName?: string;
  /** false – режим без цін: чекбокси і пояснення, без суми і приміток до ціни.
   *  За замовчуванням true – поведінка як раніше. */
  showPrices?: boolean;
  /** 'info' (задача v2, 24.09.2026): картки без чекбоксів і без кнопки «Записатися» –
   *  доповнення додаються на етапі форми запису. За замовчуванням 'select' – поведінка як раніше. */
  mode?: 'select' | 'info';
  /** Заголовок групи недоступних обстежень; без нього – як раніше. */
  unavailableTitle?: string;
}

function fmt(n: number) {
  return n.toLocaleString('uk-UA');
}

export default function AdditionalServices({
  available,
  unavailable,
  programSlug,
  sourceCta,
  clinicName,
  showPrices = true,
  mode = 'select',
  unavailableTitle,
}: AdditionalServicesProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBook = () => {
    const names = available.filter((item) => selected.has(item.id)).map((item) => item.name);
    window.dispatchEvent(
      new CustomEvent('open-booking-flow', {
        detail: {
          programSlug,
          sourceCta,
          selectedAdditionalServices: names.length > 0 ? names : undefined,
        },
      })
    );
  };

  if (mode === 'info') {
    const card = 'border-[1.5px] border-[#e5e7eb] rounded-[12px] p-4 bg-white';
    return (
      <div>
        {available.length > 0 && (
          <div className="mb-6">
            <p className="text-[13px] font-bold uppercase tracking-[0.08em] text-gray-500 mb-3">Можна додати до запису</p>
            <div className="space-y-3">
              {available.map((item) => (
                <div key={item.id} className={card}>
                  <p className="text-[17px] font-bold text-[#0b1a24]">{item.name}</p>
                  <p className="text-gray-700 leading-relaxed mt-1.5">{item.explanation}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        {unavailable.length > 0 && (
          <div>
            <p className="text-[13px] font-bold uppercase tracking-[0.08em] text-gray-500 mb-3">
              {unavailableTitle ?? `Що варто пройти, але ${clinicName ? `в ${clinicName}` : 'у цій клініці'} не проводиться`}
            </p>
            <div className="space-y-3">
              {unavailable.map((item) => (
                <div key={item.name} className={card}>
                  <p className="text-[17px] font-bold text-[#0b1a24]">{item.name}</p>
                  <p className="text-gray-700 leading-relaxed mt-1.5">{item.why}</p>
                  {item.whereToGo && <p className="text-gray-600 mt-1.5">{item.whereToGo}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      {available.length > 0 && (
        <div className="mb-6">
          <p className="text-sm font-semibold text-gray-500 mb-3">Можна додати до запису</p>
          <div className="space-y-3">
            {available.map((item) => {
              const variants = item.priceVariants ?? [];
              const total = variants.reduce((sum, v) => sum + v.price, 0);
              const mainVariant = variants[0];
              return (
                <label
                  key={item.id}
                  className="flex items-start gap-3 border border-gray-200 rounded-[10px] px-4 py-3 cursor-pointer hover:border-navy"
                >
                  <input
                    type="checkbox"
                    checked={selected.has(item.id)}
                    onChange={() => toggle(item.id)}
                    className="mt-1"
                  />
                  <span className="flex-1">
                    <span className="flex items-baseline justify-between gap-3">
                      <span className="text-sm font-semibold text-[#0b1a24]">{item.name}</span>
                      {showPrices && (
                        <span className="text-sm font-bold text-[#0b1a24] whitespace-nowrap">
                          {item.priceType === 'from' ? 'від ' : ''}
                          {fmt(mainVariant?.price ?? total)} грн
                        </span>
                      )}
                    </span>
                    <span className="block text-[13px] text-gray-500 mt-1">{item.explanation}</span>
                    {showPrices && item.priceNote && (
                      <span className="block text-[12px] text-gray-400 mt-1">{item.priceNote}</span>
                    )}
                  </span>
                </label>
              );
            })}
          </div>
          <button
            type="button"
            onClick={handleBook}
            className="mt-4 w-full sm:w-auto px-6 py-3 rounded-[10px] bg-navy text-white font-semibold text-sm hover:bg-navy-dark transition-colors"
          >
            {selected.size > 0 ? `Записатися з обраним (${selected.size})` : 'Записатися'}
          </button>
        </div>
      )}

      {/* Секція unavailable — обов'язкова, без чекбоксів/цін/CTA.
          Стиль: gray-100 + border-warm — "довідкові й опорні блоки" (UX-переробка 29.08.2026, п.2/п.6) */}
      {unavailable.length > 0 && (
      <div>
        <p className="text-sm font-semibold text-gray-500 mb-3">
          {unavailableTitle ?? `Що варто пройти, але ${clinicName ? `в ${clinicName}` : 'у цій клініці'} не проводиться`}
        </p>
        <div className="space-y-3">
          {unavailable.map((item) => (
            <div key={item.name} className="border border-border-warm rounded-[10px] px-4 py-3 bg-gray-100">
              <p className="text-sm font-semibold text-[#0b1a24]">{item.name}</p>
              <p className="text-[13px] text-gray-500 mt-1">{item.why}</p>
              {item.whereToGo && <p className="text-[13px] text-gray-600 mt-1.5">{item.whereToGo}</p>}
            </div>
          ))}
        </div>
      </div>
      )}
    </div>
  );
}
