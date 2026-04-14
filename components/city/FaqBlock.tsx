'use client';

import { useState } from 'react';

interface FaqItem {
  q: string;
  a: string;
}

interface FaqBlockProps {
  items: FaqItem[];
  /** On desktop (lg+), split items into two columns */
  twoColumn?: boolean;
  /** Optional heading override */
  heading?: string;
}

export default function FaqBlock({ items, twoColumn = false, heading = 'Часті запитання' }: FaqBlockProps) {
  const [open, setOpen] = useState<number | null>(0);

  if (twoColumn) {
    return (
      <div className="lg:grid lg:grid-cols-2 lg:gap-x-12" id="faq">
        {items.map((item, i) => (
          <div
            key={i}
            className="border-b border-gray-200 cursor-pointer"
            onClick={() => setOpen(open === i ? null : i)}
          >
            <button className="w-full flex items-center justify-between py-5 text-left text-[15px] font-semibold text-[#0b1a24] gap-4 bg-transparent border-none">
              <span>{item.q}</span>
              <span className="text-gray-300 shrink-0 text-[18px] font-light">
                {open === i ? '−' : '+'}
              </span>
            </button>
            {open === i && (
              <div className="pb-4 text-[14px] text-gray-500 leading-relaxed">
                {item.a}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <section className="mb-14" id="faq">
      <h2 className="text-2xl font-bold text-[#0b1a24] mb-6">{heading}</h2>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="border border-gray-200 rounded-[10px] overflow-hidden">
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between px-5 py-4 text-left text-sm font-semibold text-[#0b1a24] hover:bg-gray-50 transition-colors"
            >
              <span>{item.q}</span>
              <svg
                className={`w-4 h-4 text-gray-400 shrink-0 ml-3 transition-transform ${open === i ? "rotate-180" : ""}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {open === i && (
              <div className="px-5 pb-4 text-[14px] text-gray-700 leading-relaxed">
                {item.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
