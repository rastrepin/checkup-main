// InstitutionList – перелік закладів програми (docs/ux/specs/2026-10-pmh-page-types.md §4.1, §5 п.3 у checkup-platform).
// Одна картка на заклад (юрособа), адреси списком. Партнер – назва бренду, під нею дрібно юрособа з реєстру.
// Позначка «Партнер платформи» – Pill з рамкою (роль 5), без accent. Онлайн-запис – кнопка booking (роль 3).
// До 12 закладів – усі відкрито; більше – партнери і перші 10, решта в <details> (у HTML, реєстр не приховується).
// Без оцінок і рейтингів.

import type { RegistryInstitution } from '@/lib/screening/t3';
import ScreeningBookCta from './ScreeningBooking';

const OPEN_LIMIT = 12;
const OPEN_REST = 10;

function Card({ inst }: { inst: RegistryInstitution }) {
  return (
    <li className="bg-white border border-[var(--border)] rounded-[var(--radius-lg)] p-[var(--space-card)] flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
      <div className="min-w-0">
        {inst.is_partner && (
          <span className="inline-block mb-2 text-[12px] font-semibold text-link border border-[var(--link)] rounded-[var(--radius-pill)] px-2.5 py-0.5">
            Партнер платформи
          </span>
        )}
        <h3 className="text-[17px] font-bold text-ink leading-snug">{inst.is_partner && inst.partner_brand ? inst.partner_brand : inst.name}</h3>
        {inst.is_partner && inst.registry_name && <p className="mt-0.5 text-[13px] text-gray-500">{inst.registry_name}</p>}
        <ul className="mt-2 space-y-1 text-[15px] text-text-secondary">
          {inst.addresses.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
      </div>
      {inst.online_booking && inst.clinic_slug && (
        <div className="shrink-0">
          <ScreeningBookCta clinicSlug={inst.clinic_slug} clinicName={inst.partner_brand ?? inst.name} />
        </div>
      )}
    </li>
  );
}

export default function InstitutionList({
  institutions,
  asOfLabel,
  sourceUrl,
  partnerNote,
  partial = false,
}: {
  institutions: RegistryInstitution[];
  asOfLabel: string | null;
  sourceUrl: string;
  partnerNote: string;
  partial?: boolean;
}) {
  if (institutions.length === 0) {
    return (
      <p className="mt-5 text-text-secondary leading-relaxed">
        Перелік закладів міста оновлюється. Повний перелік – на <a className="text-link underline" href={sourceUrl}>сайті МОЗ</a>.
      </p>
    );
  }
  const partners = institutions.filter((i) => i.is_partner);
  const rest = institutions.filter((i) => !i.is_partner);
  const long = institutions.length > OPEN_LIMIT;
  const open = long ? [...partners, ...rest.slice(0, OPEN_REST)] : institutions;
  const hidden = long ? rest.slice(OPEN_REST) : [];

  return (
    <div className="mt-6">
      <ul className="space-y-3">
        {open.map((i) => (
          <Card key={i.edrpou || i.name} inst={i} />
        ))}
      </ul>
      {hidden.length > 0 && (
        <details className="mt-3 group">
          <summary className="cursor-pointer list-none text-[15px] font-semibold text-link min-h-12 py-3 [&::-webkit-details-marker]:hidden">
            Показати всі заклади ({institutions.length})
          </summary>
          <ul className="space-y-3">
            {hidden.map((i) => (
              <Card key={i.edrpou || i.name} inst={i} />
            ))}
          </ul>
        </details>
      )}
      {partners.length > 0 && <p className="mt-5 text-[15px] leading-relaxed text-gray-500">{partnerNote}</p>}
      <p className="mt-3 text-[15px] leading-relaxed text-gray-500">
        {partial ? 'Тут поки лише заклади партнерів платформи. Усі заклади міста – на ' : 'Повний перелік – на '}
        <a className="text-link underline" href={sourceUrl}>сайті МОЗ</a>
        {asOfLabel ? `. Дані станом на ${asOfLabel}.` : '.'}
      </p>
    </div>
  );
}
