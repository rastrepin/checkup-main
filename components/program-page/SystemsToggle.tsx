'use client';

import { useState } from 'react';
import type { BodySystem } from '@/lib/programs/data';

export default function SystemsToggle({ systems }: { systems: BodySystem[] }) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      {systems.map((sys, i) => (
        <div key={i} className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="p-4">
            <h3 className="font-semibold text-gray-900 mb-1">{sys.name}</h3>
            {sys.why && (
              <p className="text-sm text-gray-600 leading-relaxed mb-2">{sys.why}</p>
            )}
            {sys.relatedLink && (
              <a
                href={sys.relatedLink.href}
                className="text-xs text-teal-600 hover:underline"
              >
                → {sys.relatedLink.label}
              </a>
            )}
          </div>
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between px-4 py-2 bg-gray-50 hover:bg-gray-100 text-sm text-gray-700 border-t border-gray-200 transition-colors"
          >
            <span>
              Що входить&nbsp;·&nbsp;{sys.items.length} досліджень
            </span>
            <svg
              className={`w-4 h-4 text-gray-400 transition-transform ${open === i ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {open === i && (
            <ul className="px-4 py-3 space-y-1 bg-white border-t border-gray-100">
              {sys.items.map((item, j) => (
                <li key={j} className="text-sm text-gray-700 flex gap-2">
                  <span className="text-teal-500 mt-0.5 shrink-0">·</span>
                  {item}
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}
