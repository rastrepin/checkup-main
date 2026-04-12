'use client';

import { useEffect, useState } from 'react';

interface StickyBarProps {
  analysesCount: number;
  diagnosticsCount: number;
  programTitle: string;
}

export default function StickyBar({ analysesCount, diagnosticsCount, programTitle }: StickyBarProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const total = analysesCount + diagnosticsCount;

  const scrollToClinic = () => {
    const el = document.getElementById('clinic-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
      <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-gray-500 truncate">{programTitle}</p>
          <p className="text-sm font-medium text-gray-800">
            {total} досліджень
          </p>
        </div>
        <button
          onClick={scrollToClinic}
          className="shrink-0 bg-gray-900 text-white rounded-lg px-5 py-2.5 text-sm font-semibold hover:bg-gray-700 transition-colors"
        >
          Обрати клініку
        </button>
      </div>
    </div>
  );
}
