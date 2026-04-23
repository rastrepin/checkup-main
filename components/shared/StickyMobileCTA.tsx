'use client';

import { useState, useEffect } from 'react';

interface StickyMobileCTAProps {
  /** Текст основної кнопки */
  ctaLabel?: string;
  /** Href або якір */
  href?: string;
  /** onClick — якщо треба відкрити форму */
  onClick?: () => void;
  /** Приховати після скролу вгору */
  hideOnScrollUp?: boolean;
}

export default function StickyMobileCTA({
  ctaLabel = 'Записатись на консультацію',
  href,
  onClick,
  hideOnScrollUp = false,
}: StickyMobileCTAProps) {
  const [visible, setVisible] = useState(false);
  const [lastY, setLastY] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      if (y > 300) {
        if (hideOnScrollUp) {
          setVisible(y > lastY); // show when scrolling down
        } else {
          setVisible(true);
        }
      } else {
        setVisible(false);
      }
      setLastY(y);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [lastY, hideOnScrollUp]);

  if (!visible) return null;

  const commonClass =
    'flex-1 py-3.5 bg-[#d60242] text-white text-[15px] font-semibold rounded-[10px] hover:bg-[#b5003a] transition-colors text-center';

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t-2 border-gray-200 px-4 py-3 flex gap-3 items-center"
      style={{ boxShadow: '0 -4px 16px rgba(0,0,0,0.08)' }}
    >
      {onClick ? (
        <button type="button" onClick={onClick} className={commonClass}>
          {ctaLabel}
        </button>
      ) : (
        <a href={href ?? '#lead-form'} className={commonClass}>
          {ctaLabel}
        </a>
      )}
    </div>
  );
}
