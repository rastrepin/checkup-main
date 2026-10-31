// Медичні рецензенти FAQ хабу міста і сторінок статі (хвиля 1). Однакові для всіх міст хвилі.
// Джерело: CITY-HUB-TEXTS v1.6 §6 (хаб міста), §9.1 (жіночий хаб), §9.2 (чоловічий хаб); SEO-MIGRATION v2.4, блокер 6:
// дата перегляду 31.10.2026, письмові згоди 01.11.2026.
// Рядок під FAQ: «Медичні відповіді {verb}: {name}, {specialty}, {org}, {ДД.ММ.РРРР}»; ім'я – посилання на профіль.
// reviewedBy у JSON-LD – лише цей лікар (Physician), лише коли є дата перегляду (reviewedAt).
// Автор сторінки (author) – Ігор Растрепін, окремо (CITY-HUB-TEXTS §5).

export interface HubReviewer {
  name: string;
  /** Дієслово рядка: «переглянула» / «переглянув» – як у CITY-HUB-TEXTS. */
  verb: string;
  specialty: string;
  org: string;
  /** Дата перегляду, ISO. Порожня – рядка і reviewedBy немає. */
  reviewedAt: string;
  /** Профіль лікаря; null – ім'я без посилання, у JSON-LD без url. */
  url: string | null;
  /** schema.org MedicalSpecialty для reviewedBy. */
  schemaSpecialty: string;
}

const BALAN: HubReviewer = {
  name: 'Балан Анна Вікторівна',
  verb: 'переглянула',
  specialty: 'лікар акушер-гінеколог',
  org: 'КНП «КМЦРПМ»',
  reviewedAt: '2026-10-31',
  url: 'https://check-up.in.ua/ukr/kmcrpm/likari/tproduct/909252505-304397117982-balan-anna-vktorvna',
  schemaSpecialty: 'Gynecologic',
};

const BONDARENKO: HubReviewer = {
  name: 'Бондаренко Денис Олегович',
  verb: 'переглянув',
  specialty: 'лікар-уролог, хірург',
  org: 'ОН Клінік Дніпро',
  reviewedAt: '2026-10-31',
  url: 'https://onclinic.check-up.in.ua/dnipro/doctors/bondarenko-denis',
  schemaSpecialty: 'Urologic',
};

export const HUB_REVIEWERS: Record<'city' | 'female' | 'male', HubReviewer> = {
  city: BALAN,
  female: BALAN,
  male: BONDARENKO,
};

export const HUB_AUTHOR = { name: 'Ігор Растрепін' } as const;

export const ORGANIZATION_ID = 'https://check-up.in.ua/#organization';

/** 2026-10-31 → 31.10.2026 */
export function dateLabel(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${d}.${m}.${y}`;
}
