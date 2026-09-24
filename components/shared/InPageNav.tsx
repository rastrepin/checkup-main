'use client';

import { useEffect, useState } from 'react';

// Блок 1a обох MD (5a-female-40-50/vid-50-kharkiv.md): внутрішнє меню сторінки.
// Не існувало в репо (перевірено GitHub tree search) — компонент новий.
// Якорі беруться зі списку в MD кожної сторінки (Блок 1a), НЕ з
// components-map-FIXED.md §16 — там якорі субдоменних сторінок клінік
// (about/symptoms/stages/method/steps/recovery/doctors/faq), інший набір.
// Рішення Cowork 29.08.2026, "ВІДПОВІДЬ COWORK — механізм CTA" п.4.
//
// ОНОВЛЕНО 29.08.2026 (завдання "UX-переробка", п.5): sticky при скролі +
// підсвітка активного пункту (IntersectionObserver, "Персистентність позиції"
// підтверджена Норматив). Без фіксованого хедера на цих сторінках (root layout
// не рендерить Header) — sticky top-0 достатньо, нема чого "clear"-ити.

export interface InPageNavItem {
  id: string;
  label: string;
}

// ОНОВЛЕНО 24.09.2026 (задача v2 сторінки після 50, блок 1a): пігулки з рамкою за макетом,
// до першої прокрутки активний перший пункт. Компонент досі не використовувався на інших сторінках.
export default function InPageNav({ items }: { items: InPageNavItem[] }) {
  const [activeId, setActiveId] = useState<string | null>(items[0]?.id ?? null);

  useEffect(() => {
    if (items.length === 0) return;
    const sections = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Серед секцій, що зараз перетинають "лінію активації" (верхня третина
        // екрана), активний — найнижчий за DOM-порядком (той, до якого дійшов скрол).
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          const topMost = visible.reduce((a, b) => (a.boundingClientRect.top < b.boundingClientRect.top ? a : b));
          setActiveId(topMost.target.id);
        }
      },
      { rootMargin: '-15% 0px -70% 0px', threshold: 0 }
    );

    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

  if (items.length === 0) return null;

  return (
    <nav
      aria-label="Зміст сторінки"
      className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-gray-200 text-sm"
    >
      <div className="max-w-[1200px] mx-auto flex gap-2 overflow-x-auto px-5 sm:px-6 lg:px-14 py-3 [scrollbar-width:none]">
      {items.map((item) => {
        const isActive = activeId === item.id;
        return (
          <a
            key={item.id}
            href={`#${item.id}`}
            aria-current={isActive ? 'true' : undefined}
            className={`shrink-0 px-3.5 py-2.5 rounded-full whitespace-nowrap transition-colors border-[1.5px] ${
              isActive ? 'bg-teal-soft text-navy font-semibold border-teal-soft' : 'border-[#e5e7eb] text-gray-700 hover:text-navy'
            }`}
          >
            {item.label}
          </a>
        );
      })}
      </div>
    </nav>
  );
}
