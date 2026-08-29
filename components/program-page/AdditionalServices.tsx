'use client';

import { useState } from 'react';

// Блок 5 обох MD (5a-female-40-50/vid-50-kharkiv.md). Контракт наданий Cowork
// напряму в чаті 29.08.2026 (відсутній у components-map-FIXED.md):
//
// available[]: id, name, priceVariants[{label,price}], priceType 'exact'|'from',
//   priceNote?, priceDate, explanation
// unavailable[]: name, why, whereToGo — без ціни, без чекбокса, без CTA
// Секція unavailable ОБОВ'ЯЗКОВА, не опційна. Неактивні чекбокси заборонені —
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
  priceVariants: AdditionalServicePriceVariant[];
  priceType: 'exact' | 'from';
  priceNote?: string;
  priceDate: string;
  explanation: string;
}

export interface UnavailableAdditionalService {
  name: string;
  why: string;
  whereToGo: string;
}

export interface AdditionalServicesProps {
  available: AvailableAdditionalService[];
  unavailable: UnavailableAdditionalService[];
  programSlug: string;
  sourceCta: string;
}

function fmt(n: number) {
  return n.toLocaleString('uk-UA');
}

export default function AdditionalServices({ available, unavailable, programSlug, sourceCta }: AdditionalServicesProps) {
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

  return (
    <div>
      {available.length > 0 && (
        <div className="mb-6">
          <p className="text-sm font-semibold text-gray-500 mb-3">Можна додати до запису</p>
          <div className="space-y-3">
            {available.map((item) => {
              const total = item.priceVariants.reduce((sum, v) => sum + v.price, 0);
              const mainVariant = item.priceVariants[0];
              return (
                <label
                  key={item.id}
                  className="flex items-start gap-3 border border-gray-200 rounded-[10px] px-4 py-3 cursor-pointer hover:border-[#005485]"
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
                      <span className="text-sm font-bold text-[#0b1a24] whitespace-nowrap">
                        {item.priceType === 'from' ? 'від ' : ''}
                        {fmt(mainVariant?.price ?? total)} грн
                      </span>
                    </span>
                    <span className="block text-[13px] text-gray-500 mt-1">{item.explanation}</span>
                    {item.priceNote && (
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
            className="mt-4 w-full sm:w-auto px-6 py-3 rounded-[10px] bg-[#005485] text-white font-semibold text-sm hover:bg-[#004470] transition-colors"
          >
            {selected.size > 0 ? `Записатися з обраним (${selected.size})` : 'Записатися'}
          </button>
        </div>
      )}

      {/* Секція unavailable — обов'язкова, без чекбоксів/цін/CTA */}
      <div>
        <p className="text-sm font-semibold text-gray-500 mb-3">Що варто пройти, але в ОН Клінік не проводиться</p>
        <div className="space-y-3">
          {unavailable.map((item) => (
            <div key={item.name} className="border border-gray-100 rounded-[10px] px-4 py-3 bg-gray-50">
              <p className="text-sm font-semibold text-[#0b1a24]">{item.name}</p>
              <p className="text-[13px] text-gray-500 mt-1">{item.why}</p>
              <p className="text-[13px] text-gray-600 mt-1.5">{item.whereToGo}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
