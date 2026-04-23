'use client';

import { useState, type ReactNode } from 'react';

interface AccordionItem {
  id: string;
  title: string;
  subtitle?: string;
  content: ReactNode;
}

interface AccordionProps {
  items: AccordionItem[];
  defaultOpenId?: string | null;
  /** Якщо true — тільки один item відкритий одночасно */
  single?: boolean;
  className?: string;
}

export default function Accordion({
  items,
  defaultOpenId = null,
  single = false,
  className = '',
}: AccordionProps) {
  const [openIds, setOpenIds] = useState<Set<string>>(
    defaultOpenId ? new Set([defaultOpenId]) : new Set()
  );

  const toggle = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (single) next.clear();
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {items.map((item) => {
        const isOpen = openIds.has(item.id);
        return (
          <div
            key={item.id}
            className="bg-white rounded-[10px] border border-gray-200 overflow-hidden"
          >
            <button
              onClick={() => toggle(item.id)}
              aria-expanded={isOpen}
              className="w-full flex items-center gap-3 p-4 text-left bg-transparent border-none cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="text-[15px] font-semibold text-[#0b1a24] leading-snug">
                  {item.title}
                </div>
                {item.subtitle && (
                  <div className="text-xs text-gray-500 mt-0.5">{item.subtitle}</div>
                )}
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isOpen && (
              <div className="px-4 pb-4 border-t border-gray-100">
                <div className="pt-3 text-[14px] text-[#0b1a24] leading-relaxed">
                  {item.content}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
