'use client';

// Блок 1a обох MD (5a-female-40-50/vid-50-kharkiv.md): внутрішнє меню сторінки.
// Не існувало в репо (перевірено GitHub tree search) — компонент новий.
// Якорі беруться зі списку в MD кожної сторінки (Блок 1a), НЕ з
// components-map-FIXED.md §16 — там якорі субдоменних сторінок клінік
// (about/symptoms/stages/method/steps/recovery/doctors/faq), інший набір.
// Рішення Cowork 29.08.2026, "ВІДПОВІДЬ COWORK — механізм CTA" п.4.
//
// scroll-margin-top живе на СЕКЦІЯХ-цілях (id=...), не на лінках цього nav —
// компонент лише рендерить якорі, сторінка відповідає за scroll-mt-* на h2/section.

export interface InPageNavItem {
  id: string;
  label: string;
}

export default function InPageNav({ items }: { items: InPageNavItem[] }) {
  if (items.length === 0) return null;

  return (
    <nav
      aria-label="Зміст сторінки"
      className="flex gap-1 overflow-x-auto py-2 mb-4 border-b border-gray-100 text-sm"
    >
      {items.map((item) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          className="shrink-0 px-3 py-1.5 rounded-full text-gray-600 hover:bg-gray-100 hover:text-[#005485]"
        >
          {item.label}
        </a>
      ))}
    </nav>
  );
}
