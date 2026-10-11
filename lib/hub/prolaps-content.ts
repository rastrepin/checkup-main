// Хаб діагнозу «Пролапс тазових органів» (агрегатор, тип 1).
// Тексти – дослівно з content/hub/prolaps-tazovykh-orhaniv.md (v2).
// Файл без серверних залежностей: його імпортують і сторінка, і клієнтські компоненти.

export const HUB_PATH = '/ukr/prolaps-tazovykh-orhaniv';
export const HUB_URL = `https://check-up.in.ua${HUB_PATH}`;
export const OFFERS_ANCHOR = 'likari';
export const HUB_SOURCE_CTA = 'agg_hub_offer_card';
/** Подія «обрано метод у картці операції» – область пропозицій вмикає фільтр. */
export const METHOD_EVENT = 'hub:method';

export type MethodKey = 'laparoscopic' | 'colporrhaphy' | 'vaginal_fixation' | 'sling';

export interface HubMethod {
  key: MethodKey;
  /** Назва у фільтрі і в списку вибору у формі. */
  short: string;
  /** Назва картки операції (розділ 6.3). */
  title: string;
  context?: string;
  teaser: string;
}

export const METHODS: HubMethod[] = [
  {
    key: 'laparoscopic',
    short: 'Лапароскопічне лікування',
    title: 'Лапароскопічна сакрокольпопексія і сакрогістеропексія',
    teaser:
      'Через проколи на животі матку або верхівку піхви закріплюють сіткою до міцних зв\'язок таза. Матку можна зберегти.',
  },
  {
    key: 'colporrhaphy',
    short: 'Кольпорафія',
    title: 'Кольпорафія',
    teaser: 'Через піхву зміцнюють опущену передню або задню стінку власними тканинами жінки.',
  },
  {
    key: 'vaginal_fixation',
    short: 'Вагінальна фіксація',
    title: 'Вагінальна фіксація матки і купола піхви',
    teaser:
      'Через піхву матку або верхівку піхви підшивають до зв\'язок таза власними тканинами жінки.',
  },
  {
    key: 'sling',
    short: 'Слінгова операція',
    title: 'Слінгова операція',
    context: 'Якщо разом з опущенням підтікає сеча при кашлі чи навантаженні',
    teaser:
      'Під сечівник встановлюють тонку синтетичну стрічку, яка підтримує його під час навантаження. За потреби це роблять під час операції з приводу опущення.',
  },
];

export const METHOD_BUTTON_LABEL = 'Лікарі, які виконують цю операцію';
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
    linkLabel: 'Лапароскопічне лікування опущення та випадіння матки і піхви',
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
    linkLabel: 'Кольпорафія: передня і задня пластика стінок піхви',
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
    linkLabel: 'Вагінальна фіксація матки і купола піхви при опущенні',
  },
  {
    method: 'sling',
    clinicSlug: 'bondaruk',
    serviceSlug: 'slinhova-operatsiia',
    linkLabel: 'Слінгова операція при стресовому нетриманні сечі',
  },
];

export const HUB_CLINIC_SLUGS = [...new Set(OFFER_SOURCES.map((s) => s.clinicSlug))];

/** Порядок міст у фільтрі і в GEO-блоці. */
export const CITY_ORDER = ['kyiv', 'kharkiv', 'mykolaiv'];
export const CITY_LABELS: Record<string, string> = {
  kyiv: 'Київ',
  kharkiv: 'Харків',
  mykolaiv: 'Миколаїв',
};

/**
 * Рядки картки, яких немає в реєстрі. experience задається лише там, де реєстр порожній
 * (рішення 11А: рік диплома; у реєстр не пишемо – див. журнал спрощень).
 */
export const DOCTOR_CONTENT: Record<string, { expertise: string; experience?: string }> = {
  'bondaruk-volodymyr': {
    expertise:
      'Завідувач відділення ендоскопічної гінекології. Лапароскопічні й вагінальні операції при опущенні матки і піхви',
    experience: 'У професії з 2001 року',
  },
  'lapa-nataliia': { expertise: 'Малоінвазивна хірургія' },
  afanasiev: { expertise: 'Гінеколог-хірург' },
  striukov: { expertise: 'Гінеколог-хірург' },
};

export const BOOKING_NOTES: Record<string, string> = {
  bondaruk:
    'Прийом у порядку живої черги. Після заявки асистент лікаря зателефонує і узгодить день візиту.',
};
export const BOOKING_NOTE_DEFAULT =
  'Перший крок: консультація гінеколога. Після заявки адміністратор клініки зателефонує і підтвердить час прийому.';

/**
 * GEO-блок: {doctors} і {clinic}, {address} підставляються з реєстру.
 * У реченні про Київ назва закладу стоїть у родовому відмінку, тому вона в тексті.
 */
export const GEO_TITLE = 'Де оперують пролапс тазових органів: Київ, Харків, Миколаїв';
export const GEO_TEMPLATES: Record<string, string> = {
  kyiv:
    'У Києві лапароскопічні операції, кольпорафію, вагінальну фіксацію матки і слінгові операції виконує {doctors}, завідувач відділення ендоскопічної гінекології Київського міського центру репродуктивної та перинатальної медицини: проспект Володимира Івасюка, 16, Оболонь.',
  kharkiv: 'У Харкові кольпорафію виконують {doctors} в {clinic}: {address}.',
  mykolaiv: 'У Миколаєві лапароскопічне лікування опущення матки виконує {doctors} в {clinic}: {address}.',
};

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
  fullName: string;
  level: string | null;
  expertise: string | null;
  experience: string | null;
  clinicSlug: string;
  clinicLabel: string;
  cityKey: string;
  cityLabel: string;
  /** Адреса без міста, як у реєстрі. */
  street: string;
  bookingNote: string;
  methods: HubOfferMethod[];
}
