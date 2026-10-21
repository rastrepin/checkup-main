// OfferDoctorCard – картка лікаря в області пропозицій хабу агрегатора (рішення PO 17.10, 14А).
// Усі поля – з реєстру через lib/hub/prolaps-offers.ts; ПІБ і регалії – через lib/format/doctor.ts.
// Необов'язкові поля не рендеряться, якщо їх немає (null-патерн):
//   photo – лише коли передане (доктор-бренд); clinicName – назва клініки окремим рядком;
//   profileLink – посилання на профіль лікаря; methodLinks – сторінки операцій лікаря чи клініки.
// Кнопка без імені лікаря; дію задає батьківський компонент (форма запису).
// v2 (рішення Ігоря 21.10, 4Б 5А): кнопка запису – crimson (ui-kit §8, роль 3–4); ім'я лікаря – посилання на профіль;
// сторінки операцій – один рядок «Операції:» замість окремого посилання на кожну. components-map §30.6.

import { buttonClass } from '@/components/frame/Button';

const FOCUS = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#005485]';

export interface OfferLink {
  label: string;
  href: string;
}

export interface OfferDoctorCardProps {
  fullName: string;
  regalia: string | null;
  expertise?: string | null;
  experienceLine: string | null;
  clinicName?: string | null;
  location: string;
  photo?: { src: string; alt: string } | null;
  bookingNote: string;
  profileLink?: OfferLink | null;
  methodLinks: OfferLink[];
  ctaLabel?: string;
  onBook: () => void;
}


export default function OfferDoctorCard({
  fullName,
  regalia,
  expertise,
  experienceLine,
  clinicName,
  location,
  photo,
  bookingNote,
  profileLink,
  methodLinks,
  ctaLabel = 'Записатися на консультацію',
  onBook,
}: OfferDoctorCardProps) {
  return (
    <div className="bg-white border-[1.5px] border-[var(--border)] rounded-[var(--radius-lg)] p-[var(--space-card)] flex flex-col h-full">
      <div className="flex gap-4 items-start">
        {photo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photo.src}
            alt={photo.alt}
            width={88}
            height={110}
            loading="lazy"
            className="w-[88px] h-[110px] rounded-[10px] object-cover object-top bg-[#f4f6f8] shrink-0"
          />
        )}
        <div className="min-w-0">
          <h3 className="text-[20px] font-bold text-ink leading-snug">
            {profileLink ? (
              <a href={profileLink.href} className={`${FOCUS} hover:underline decoration-1 underline-offset-[3px]`}>
                {fullName}
              </a>
            ) : (
              fullName
            )}
          </h3>
          {regalia && <p className="text-[15px] text-gray-700 mt-2">{regalia}</p>}
          {expertise && <p className="text-[15px] text-gray-700 mt-1">{expertise}</p>}
          {experienceLine && <p className="text-[15px] text-gray-700 mt-1">{experienceLine}</p>}
        </div>
      </div>

      {clinicName && <p className="text-[15px] text-[#0b1a24] font-semibold mt-4">{clinicName}</p>}
      <p className={`text-[14px] text-gray-600 ${clinicName ? 'mt-1' : 'mt-4'}`}>{location}</p>

      {methodLinks.length > 0 && (
        <p className="mt-4 text-[14px] leading-relaxed text-text-secondary">
          <span className="font-semibold text-ink">Операції:</span>{' '}
          {methodLinks.map((l, i) => (
            <span key={l.href}>
              <a href={l.href} className={`${FOCUS} text-link underline decoration-1 underline-offset-[3px] hover:decoration-2`}>
                {l.label}
              </a>
              {i < methodLinks.length - 1 && <span aria-hidden="true"> · </span>}
            </span>
          ))}
        </p>
      )}

      <p className="text-[13px] text-gray-500 leading-relaxed mt-4">{bookingNote}</p>
      <div className="mt-auto pt-5">
        <button
          type="button"
          onClick={onBook}
          className={`${buttonClass({ variant: 'booking', size: 'lg' })} w-full sm:w-auto`}
        >
          {ctaLabel}
        </button>
      </div>
    </div>
  );
}
