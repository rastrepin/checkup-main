// Написи блоку «Мій план» – дослівно з docs/ux/specs/2026-11-my-plan.md v0.5 (checkup-platform dev, PR #194).
// Склад плану, назви, умови, обґрунтування, тексти шкоди і фактори ризику – лише з бази (DATABASE.md 2.1 §6.2).
// Написи, яких у специфікації немає дослівно, позначено «немає в spec» – їх перелік у описі PR.

/** Відмінювання: 1 обстеження / 2–4 обстеження / 5+ обстежень (11–14 – як 5+). */
function plural(n: number, [one, few, many]: [string, string, string]): string {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
  return many;
}

export const PLAN_T = {
  eyebrow: 'Від платформи',
  title: 'Мій план обстеження',
  /** немає в spec: лід під H2 (§1 називає блок, тексту не дає). Порожній рядок – лід не виводиться. */
  lead: '',
  always: 'Завжди',
  inConsultation: 'У консультації',
  drop: 'Не потрібно',
  dropped: 'Не потрібно',
  restore: 'Повернути',
  /** my-plan v0.7 §1 (2а): рядок над карткою плану; N – рядки Базового плану без прибраних плюс додані. */
  planCount: (n: number) => `У плані ${n} ${plural(n, ['обстеження', 'обстеження', 'обстежень'])} · консультація входить`,
  addedTitle: 'Додано вами',
  addedExtra: 'Додаткове дослідження',
  addedRisk: 'За фактором ризику',
  removeAdded: 'Прибрати',
  notInClinicShort: 'Немає в клініці',
  riskLink: 'Я в групі ризику →',

  clinicLegend: 'Щоб побачити вартість, оберіть клініку',
  clinicPriceFrom: (date: string) => `Прайс від ${date}`,
  clinicOrderNote: 'Порядок клінік – не рейтинг.',
  totalIn: (clinic: string) => `Разом у ${clinic}`,
  priceNote: (date: string) => `Ціни з прайсу клініки від ${date}, без знижок.`,
  notInSum: (names: string) => `Не входить у суму – немає в цій клініці: ${names}.`,
  /** {city_loc} spec – з прийменником: «в Ужгороді» (CheckupCity.inCity). */
  noPricesCity: (inCity: string) =>
    `Цін клінік ${inCity} на ці дослідження поки немає. Збережіть план і візьміть його на консультацію.`,
  book: 'Записатися за цим планом',
  save: 'Зберегти план',
  /** немає в spec дослівно: стан після копіювання посилання (age-page-zones §3.4: «Посилання скопійовано»). */
  copied: 'Посилання скопійовано',
  // Панель плану mobile (§8б v0.5)
  panelPick: 'Оберіть клініку, щоб побачити суму',
  panelPickBtn: 'Обрати',
  panelBook: 'Записатися',
  disclaimer: 'Це ваш вибір до консультації, не призначення. Повний комплекс визначає лікар.',

  extraTitle: 'Додати дослідження',
  extraLead: "Дослідження, відкриті для вашого віку. Додане з'явиться в плані, сума перерахується.",
  extraNone: (cityLoc: string) => `Додаткових досліджень з цінами для вашого віку в ${cityLoc} поки немає.`,
  showMore: (n: number) => `Показати ще ${n}`,

  riskTitle: 'Якщо ви в групі ризику',
  riskLead:
    'Оберіть, що стосується вас. Покажемо дослідження, які настанови радять у такому разі. Ваш вибір бачите лише ви: ми його не зберігаємо.',
  riskBack: '← Повернутися до плану',
  riskNone: (group: string) =>
    `Для ${group} окремих досліджень за факторами ризику настанови не радять. Обговоріть свою історію з лікарем на консультації.`,

  // Картка дослідження (§4)
  badgeGuideline: (source: string | null) => (source ? `Настанова · ${source}` : 'Настанова'),
  badgeNorm: 'Знати свою норму',
  badgeDoctor: 'Рекомендація лікаря',
  flip: 'Що варто знати ↻',
  backEyebrow: 'Що варто знати',
  flipBack: '← До картки',
  add: 'Додати',
  addedBtn: 'Додано ✓',
  priceAfterPick: 'Ціна – після вибору клініки',
  notIn: (clinic: string) => `Немає в ${clinic}`,
} as const;

/** «жінок 30–40 років» – група в тексті ризик-флоу без факторів. */
export function groupText(gender: 'female' | 'male', ageLabel: string): string {
  return `${gender === 'female' ? 'жінок' : 'чоловіків'} ${ageLabel}`;
}

export function fmtUah(n: number): string {
  return `${n.toLocaleString('uk-UA')} грн`;
}

export function fmtDate(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split('-');
  return `${d}.${m}.${y}`;
}
