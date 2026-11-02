import Accordion from '@/components/frame/Accordion';
import { branchesWord, scheduleText, type HubClinic } from '@/lib/cities/hub-data';

// ClinicCard – нейтральна картка клініки-партнера на хабі міста і сторінках статі
// (docs/ux/specs/2026-11-city-hub.md §3.2–3.3, ui-kit §6.13, PLATFORM-LINE §5 «Двері до клініки»).
// Картка платформи: білий фон, рамка --border, радіус 12 (--radius-lg), відступ --space-card. Кольорів, логотипа
// і теми клініки немає.
// Склад: назва (H3) · тип закладу · dl · акордеон «Адреси філій» · «Сторінка клініки →».
// Одна філія: dl «Адреса / Графік / Ліцензія», акордеона немає – адреса видна одразу.
// Кілька філій: dl «Філії / Ліцензія» (кількість і метро), адреси – в акордеоні; графіків філій у картці немає
// (рішення Ігоря 02.11: графіки кожної філії в картці зайві).
// Відповідає docs/ux/specs/2026-11-city-hub.md v0.2 §3.2–3.3 (checkup-platform, PR #185).
// Порожнє поле – рядок не рендериться. Немає: телефону, кнопки запису, програм, цін, рейтингів, бейджів.
// Кілька клінік – однакові картки в порядку з конфігурації; сітку задає сторінка (1 колонка, з md – 2).

function metroList(c: HubClinic): string | null {
  const metro = [...new Set(c.branches.map((b) => b.metro_ua?.trim()).filter((m): m is string => Boolean(m)))];
  return metro.length ? metro.join(', ') : null;
}

/** name – назва в картці; без неї – clinics.name (хаб міста передає коротку назву, CITY-HUB-TEXTS v1.9 §3). */
export default function ClinicCard({ clinic, name }: { clinic: HubClinic; name?: string }) {
  const n = clinic.branches.length;
  const metro = metroList(clinic);
  const rows: [string, string][] = [];
  if (n === 1) {
    const b = clinic.branches[0];
    rows.push(['Адреса', `${b.address_ua}${b.metro_ua ? `, ${b.metro_ua}` : ''}`]);
    const schedule = scheduleText(b);
    if (schedule) rows.push(['Графік', schedule]);
  } else if (n > 1) {
    rows.push(['Філії', `${n} ${branchesWord(n)}${metro ? ` · ${metro}` : ''}`]);
  }
  if (clinic.license) rows.push(['Ліцензія', clinic.license]);

  return (
    <article className="flex flex-col bg-white border border-[var(--border)] rounded-[var(--radius-lg)] p-[var(--space-card)]">
      <h3 className="text-[20px] font-bold leading-[1.3] text-ink">{name ?? clinic.name}</h3>
      {clinic.facilityType && <p className="mt-1 text-[14px] text-text-secondary">{clinic.facilityType}</p>}
      {rows.length > 0 && (
        <dl className="mt-4 space-y-2 text-[14px]">
          {rows.map(([label, value]) => (
            <div key={label} className="grid grid-cols-[88px_1fr] gap-3">
              <dt className="text-text-secondary">{label}</dt>
              <dd className="text-ink">{value}</dd>
            </div>
          ))}
        </dl>
      )}
      {n > 1 && (
        <Accordion summary="Адреси філій" size="sm" className="mt-4">
          <ul className="space-y-2 text-[14px]">
            {clinic.branches.map((b) => (
              <li key={b.id}>
                {b.address_ua}
                {b.metro_ua ? `, ${b.metro_ua}` : ''}
              </li>
            ))}
          </ul>
        </Accordion>
      )}
      <p className="mt-auto pt-3">
        <a
          href={clinic.url}
          className="inline-flex items-center min-h-11 text-[15px] font-semibold text-link hover:underline underline-offset-[3px]"
        >
          Сторінка клініки →
        </a>
      </p>
    </article>
  );
}
