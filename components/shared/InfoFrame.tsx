import type { ReactNode } from 'react';

interface InfoFrameProps {
  children: ReactNode;
  /** Текст CTA-посилання. Якщо linkHref не задано — рендериться як видимий текст без href
   *  (маркер [УТОЧНИТИ: ...] лишається в контенті як є, поки посилання не з'явиться). */
  linkLabel?: string;
  linkHref?: string;
  className?: string;
}

// Блок 5а MD (сторінка 40-50): інформаційна рамка з бордюром, візуально відокремлена
// від основного контенту. Generic-компонент — контент передається як children,
// сам InfoFrame не знає нічого про конкретну програму чи текст.
export default function InfoFrame({ children, linkLabel, linkHref, className = '' }: InfoFrameProps) {
  return (
    <div
      className={`border-2 border-[#04D3D9] bg-[#e8f9fa] rounded-xl p-5 ${className}`}
      role="note"
    >
      <div className="text-[14px] text-gray-700 leading-relaxed space-y-2">{children}</div>
      {linkLabel && (
        linkHref ? (
          <a href={linkHref} className="inline-block mt-3 text-sm font-semibold text-[#005485] hover:underline">
            {linkLabel} →
          </a>
        ) : (
          <span className="inline-block mt-3 text-sm font-semibold text-gray-400">
            {linkLabel} → [УТОЧНИТИ: посилання]
          </span>
        )
      )}
    </div>
  );
}
