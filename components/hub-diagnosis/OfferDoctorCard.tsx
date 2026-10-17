// OfferDoctorCard – картка лікаря в області пропозицій хабу агрегатора (рішення PO 17.10, 14А).
// Усі поля – з реєстру через lib/hub/prolaps-offers.ts; ПІБ і регалії – через lib/format/doctor.ts.
// Необов'язкові поля не рендеряться, якщо їх немає (null-патерн):
//   photo – лише коли передане (доктор-бренд); clinicName – назва клініки окремим рядком;
//   profileLink – посилання на профіль лікаря; methodLinks – сторінки операцій лікаря чи клініки.
// Кнопка без імені лікаря; дію задає батьківський компонент (форма запису).

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

function LinkLine({ link }: { link: OfferLink }) {
  return (
    <a href={link.href} className={`${FOCUS} text-[14px] text-[#005485] underline hover:no-underline`}>
      Детальніше на сторінці «{link.label}»
    </a>
  );
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
    <div className="bg-white border border-[#e8edf3] rounded-[14px] p-6 flex flex-col h-full">
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
          <h3 className="text-[20px] font-bold text-[#0b1a24] leading-snug">{fullName}</h3>
          {regalia && <p className="text-[15px] text-gray-700 mt-2">{regalia}</p>}
          {expertise && <p className="text-[15px] text-gray-700 mt-1">{expertise}</p>}
          {experienceLine && <p className="text-[15px] text-gray-700 mt-1">{experienceLine}</p>}
        </div>
      </div>

      {clinicName && <p className="text-[15px] text-[#0b1a24] font-semibold mt-4">{clinicName}</p>}
      <p className={`text-[14px] text-gray-600 ${clinicName ? 'mt-1' : 'mt-4'}`}>{location}</p>

      {(profileLink || methodLinks.length > 0) && (
        <ul className="mt-4 space-y-2 list-none">
          {profileLink && (
            <li>
              <LinkLine link={profileLink} />
            </li>
          )}
          {methodLinks.map((l) => (
            <li key={l.href}>
              <LinkLine link={l} />
            </li>
          ))}
        </ul>
      )}

      <p className="text-[13px] text-gray-500 leading-relaxed mt-4">{bookingNote}</p>
      <div className="mt-auto pt-5">
        <button
          type="button"
          onClick={onBook}
          className={`${FOCUS} w-full sm:w-auto min-h-[48px] px-6 py-3 rounded-[10px] bg-[#005485] text-white text-[16px] font-semibold hover:bg-[#003a5e] transition-colors`}
        >
          {ctaLabel}
        </button>
      </div>
    </div>
  );
}
