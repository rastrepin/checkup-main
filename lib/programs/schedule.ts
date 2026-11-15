// Графік філії одним рядком – age-page-zones v0.7.1 §4.1а. Дані – clinic_branches.schedule (mon_fri, sat, sun).
// Усі дні однакові – «Щодня 8:00–19:00»; сб = нд – «Пн–пт … · сб–нд …»; різні – «Пн–пт … · сб … · нд …».
// Порожнє значення дня – «нд – вихідний». Графіка немає – null (рядка немає). Тире в часі – коротке «–».

type Schedule = Record<string, string | null | undefined> | null | undefined;

const dash = (s: string) => s.trim().replace(/\s*[-–—]\s*/g, '–');
const val = (s: string | null | undefined) => (typeof s === 'string' && s.trim() ? dash(s) : null);
const day = (label: string, v: string | null) => (v ? `${label} ${v}` : `${label} – вихідний`);

export function formatSchedule(schedule: Schedule): string | null {
  if (!schedule) return null;
  const wk = val(schedule.mon_fri);
  const sat = val(schedule.sat);
  const sun = val(schedule.sun);
  if (!wk && !sat && !sun) return null;
  if (wk && wk === sat && wk === sun) return `Щодня ${wk}`;
  const head = wk ? `Пн–пт ${wk}` : 'Пн–пт – вихідний';
  if (sat === sun) return `${head} · ${day('сб–нд', sat)}`;
  return `${head} · ${day('сб', sat)} · ${day('нд', sun)}`;
}
