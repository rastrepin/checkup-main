'use client';

// Каркас: на mobile (< 1024px) показує перші 2 рядки тексту, решту – за кліком (макет зон 20.10).
// Увесь текст у DOM з першого рендеру (SEO, пошук на сторінці); з 1024px – завжди повністю.

import { useState, type ReactNode } from 'react';

export default function ClampMobile({ children, more = 'Читати далі' }: { children: ReactNode; more?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="clamp-mobile" data-open={open ? '' : undefined}>
      {children}
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="lg:hidden mt-1.5 text-[15px] font-semibold text-link underline decoration-1 underline-offset-[3px]"
        >
          {more}
        </button>
      )}
    </div>
  );
}
