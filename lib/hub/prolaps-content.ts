// Хаб діагнозу «Пролапс тазових органів» (агрегатор, тип 1).
// Тексти – дослівно з content/hub/prolaps-tazovykh-orhaniv.md (v3).
// Файл без серверних залежностей: його імпортують і сторінка, і клієнтські компоненти.

export const HUB_PATH = '/ukr/prolaps-tazovykh-orhaniv';
export const HUB_URL = `https://check-up.in.ua${HUB_PATH}`;
export const OFFERS_ANCHOR = 'obrati-likaria';
export const HUB_SOURCE_CTA = 'aggregator_hub_prolaps';

export type MethodKey = 'laparoscopic' | 'colporrhaphy' | 'vaginal_fixation' | 'sling';

export interface HubMethod {
  key: MethodKey;
  /** Коротка назва у списку вибору у формі запису. */
  short: string;
}

export const METHODS: HubMethod[] = [
  { key: 'laparoscopic', short: 'Лапароскопічне лікування' },
  { key: 'colporrhaphy', short: 'Кольпорафія' },
  { key: 'vaginal_fixation', short: 'Вагінальна фіксація' },
  { key: 'sling', short: 'Слінгова операція' },
];

export const UNSURE_LABEL = 'Ще не знаю, потрібна консультація';

/**
 * Яка послуга якої клініки є пропозицією методу (рішення 9: пропозиції прив'язані до методу;
 * ОН Клінік Миколаїв – у лапароскопічному лікуванні). Лікарі, клініка, адреса і сайт – з реєстру.
 * linkLabel – назва сторінки операції на сайті лікаря або клініки.
 */
export interface OfferSource {
  method: MethodKey;
  clinicSlug: string;
  serviceSlug: string;
  linkLabel: string;
}

export const OFFER_SOURCES: OfferSource[] = [
  {
    method: 'laparoscopic',
    clinicSlug: 'bondaruk',
    serviceSlug: 'laparoskopichne-likuvannia-prolapsu',
    linkLabel: 'Лапароскопічне лікування опущення матки і піхви',
  },
  {
    method: 'laparoscopic',
    clinicSlug: 'onclinic-mykolaiv',
    serviceSlug: 'kolporafia',
    linkLabel: 'Хірургічне лікування опущення матки',
  },
  {
    method: 'colporrhaphy',
    clinicSlug: 'bondaruk',
    serviceSlug: 'kolporafiia',
    linkLabel: 'Кольпорафія, пластика стінок піхви',
  },
  {
    method: 'colporrhaphy',
    clinicSlug: 'onclinic-kharkiv',
    serviceSlug: 'kolporafia',
    linkLabel: 'Кольпорафія',
  },
  {
    method: 'vaginal_fixation',
    clinicSlug: 'bondaruk',
    serviceSlug: 'vahinalna-fiksatsiia-matky',
    linkLabel: 'Вагінальна фіксація матки і купола піхви',
  },
  {
    method: 'sling',
    clinicSlug: 'bondaruk',
    serviceSlug: 'slinhova-operatsiia',
    linkLabel: 'Слінгова операція при нетриманні сечі',
  },
];

export const HUB_CLINIC_SLUGS = [...new Set(OFFER_SOURCES.map((s) => s.clinicSlug))];

/** Порядок міст у фільтрі. */
export const CITY_ORDER = ['kyiv', 'kharkiv', 'mykolaiv'];
export const CITY_LABELS: Record<string, string> = {
  kyiv: 'Київ',
  kharkiv: 'Харків',
  mykolaiv: 'Миколаїв',
};

/**
 * Рядки картки, яких немає в реєстрі (content v3.1, 6.1–6.2).
 * experience – лише там, де реєстр порожній (рішення 11А: рік диплома; у реєстр не пишемо).
 * location – замість «місто, адреса» з реєстру; тоді назва клініки окремим рядком не виводиться.
 * photo, profileLink – лише для доктор-бренду (рішення 14А): фото doctors.photo_url, профіль – clinics.website.
 */
export interface DoctorCardContent {
  expertise?: string;
  experience?: string;
  location?: string;
  photo?: boolean;
  profileLink?: boolean;
}

export const DOCTOR_CONTENT: Record<string, DoctorCardContent> = {
  'bondaruk-volodymyr': {
    experience: 'У професії з 2001 року',
    location: 'Київ, КМЦРПМ, проспект Володимира Івасюка, 16',
    photo: true,
    profileLink: true,
  },
  'lapa-nataliia': { expertise: 'Малоінвазивна хірургія' },
  afanasiev: { expertise: 'Гінеколог-хірург' },
  striukov: { expertise: 'Гінеколог-хірург' },
};

export const BOOKING_NOTES: Record<string, string> = {
  bondaruk:
    'Попередній запис до лікаря можливий лише через заявку. Після заявки асистент лікаря зателефонує і узгодить день і час прийому. Без заявки лікар приймає в порядку живої черги за графіком.',
};
export const BOOKING_NOTE_DEFAULT =
  'Перший крок: консультація гінеколога. Після заявки адміністратор клініки зателефонує і підтвердить час прийому.';

/** GEO-блоки (v3, 6.3): статичний текст, по одному на місто. Перед релізом звіряти з реєстром. */
export const GEO_BLOCKS: { city: string; title: string; text: string }[] = [
  {
    city: 'kyiv',
    title: 'Лікування опущення матки і піхви в Києві',
    text: 'У Києві опущення матки і піхви лікує Володимир Петрович Бондарук, завідувач відділення ендоскопічної гінекології Київського міського центру репродуктивної та перинатальної медицини (КМЦРПМ), проспект Володимира Івасюка, 16. Володимир Петрович виконує лапароскопічне лікування, кольпорафію, вагінальну фіксацію матки і купола піхви та слінгову операцію при нетриманні сечі.',
  },
  {
    city: 'kharkiv',
    title: 'Лікування опущення матки і піхви в Харкові',
    text: 'У Харкові опущення матки і піхви лікують Ігор Володимирович Афанасьєв і Дмитро Владиславович Стрюков в ОН Клінік Харків Левада, вулиця Молочна, 48. Ігор Володимирович і Дмитро Владиславович виконують кольпорафію.',
  },
  {
    city: 'mykolaiv',
    title: 'Лікування опущення матки і піхви в Миколаєві',
    text: 'У Миколаєві опущення матки і піхви лікує Наталія Миколаївна Лапа в ОН Клінік Миколаїв Аркасівська, вулиця Аркасівська, 8. Наталія Миколаївна виконує лапароскопічне лікування опущення матки.',
  },
];

/** Пропозиція в області пропозицій: лікар у клініці з переліком методів. */
export interface HubOfferMethod {
  key: MethodKey;
  short: string;
  linkLabel: string;
  href: string;
}

export interface HubOffer {
  id: string;
  doctorSlug: string;
  /** ПІБ через formatDoctorName: «Ім'я По батькові Прізвище». */
  fullName: string;
  level: string | null;
  expertise: string | null;
  experience: string | null;
  clinicSlug: string;
  /** Назва клініки для форми запису. */
  clinicLabel: string;
  /** Назва клініки окремим рядком у картці; null, якщо місце задане контентом. */
  clinicName: string | null;
  location: string;
  photo: { src: string; alt: string } | null;
  profileLink: { label: string; href: string } | null;
  cityKey: string;
  cityLabel: string;
  bookingNote: string;
  methods: HubOfferMethod[];
}
