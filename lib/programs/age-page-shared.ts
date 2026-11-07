// Спільні блоки вікових сторінок міста (задача Cowork «Оновлення текстів сторінки 40–50», 24.09.2026,
// блоки з позначкою [СПІЛЬНИЙ]). Тексти і правила виводу – тут, один раз для всіх вікових сторінок;
// сторінки верстають блоки самі (рішення спринту: без нових спільних компонентів).
// Віковий зміст (назва розділу переліку, вік сторінки, підмет GEO) передається параметрами.

/** «A і B», «A, B і C». */
export function joinWithAnd(items: string[]): string {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} і ${items[items.length - 1]}`;
}

/** Мала перша літера в середині речення, крім абревіатур (ПАП-тест). */
export function lcFirst(s: string): string {
  if (s.length > 1 && s[1] === s[1].toUpperCase() && s[1] !== s[1].toLowerCase()) return s;
  return s.charAt(0).toLowerCase() + s.slice(1);
}

/** Нижня вікова межа з назви програми («… після 40» → 40); null – у назві віку немає. */
export function programMinAge(programName: string): number | null {
  const m = programName.match(/(\d{2})/);
  return m ? Number(m[1]) : null;
}

/** Речення про вік програми: лише якщо нижня межа програми менша за нижню межу віку сторінки. */
export function programAgeSentence(programName: string | null | undefined, pageMinAge: number, audience = 'жінок'): string | null {
  if (!programName) return null;
  const age = programMinAge(programName);
  if (age === null || age >= pageMinAge) return null;
  return `Програма розрахована на ${audience} від ${age} років, і її склад підходить також після ${pageMinAge}.`;
}

/** Коротка форма для рядка картки програми (задача v2, блок 1b): «Програма розрахована на жінок від 40 років».
 *  Правило те саме, що й у programAgeSentence: лише якщо нижня межа програми менша за нижню межу сторінки. */
export function programAgeShort(programName: string | null | undefined, pageMinAge: number, audience = 'жінок'): string | null {
  if (!programName) return null;
  const age = programMinAge(programName);
  if (age === null || age >= pageMinAge) return null;
  return `Для ${audience} від ${age} років, підходить після ${pageMinAge}`;
}

const VISIT_COUNT_WORDS: Record<number, string> = { 1: 'один', 2: 'два', 3: 'три', 4: 'чотири' };

/** «два візити», «один візит»: кількість словом (задача v2, блоки 1b і 7). */
export function visitsText(n: number): string {
  const word = VISIT_COUNT_WORDS[n] ?? String(n);
  const mod10 = n % 10;
  const mod100 = n % 100;
  const noun = mod10 === 1 && mod100 !== 11 ? 'візит' : mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14) ? 'візити' : 'візитів';
  return `${word} ${noun}`;
}

/** H2 блоку програми клініки. */
export function programHeading(programName: string | null | undefined, clinicName: string | null | undefined, cityIn = 'в Харкові'): string {
  return programName && clinicName ? `Програма «${programName}» в ${clinicName}` : `Програма клініки ${cityIn}`;
}

export const WHERE_TO_GO = 'Можна пройти в іншому закладі і принести результат на другий візит.';

/** H2 блоку «Інший шлях». */
export function otherPathHeading(programName: string | null | undefined): string {
  return programName ? `Якщо програма «${programName}» не підходить` : 'Якщо програма клініки не підходить';
}

/** Текст блоку «Інший шлях»; listHeading – H2 блоку «За клінічними настановами» цієї ж сторінки. */
export function otherPathText(listHeading: string): string {
  return `Перелік із розділу «${listHeading}» можна пройти в будь-якій клініці. З його результатами лікар робить висновок і, якщо потрібно, призначає додаткові обстеження.`;
}

/** «Як це проходить» → «Перший візит». */
export const FIRST_VISIT_TEXT = 'На першому візиті ви проходите консультації, обстеження й аналізи, що входять у програму.';

/** Рядок про другий візит у блоці програми; null – другого візиту в складі немає. */
export function secondVisitSentence(visit2Items: string[]): string | null {
  if (visit2Items.length === 0) return null;
  return `Другий візит: ${visit2Items.map(lcFirst).join(', ')}. Лікар разом з вами розбирає результати.`;
}

/** Підготовка: пункт виводиться, якщо в складі є відповідна позиція. Останній пункт – з крапкою, решта – з крапкою з комою (верстка сторінки). */
export function preparationItems(items: { name: string }[]): string[] {
  const names = items.map((i) => i.name.toLowerCase());
  const hasAny = (needle: string) => names.some((n) => n.includes(needle));
  const out: string[] = [];
  if (hasAny('глюкоза') || hasAny('ліпідограма')) {
    out.push('натще: 8–12 годин без їжі перед аналізом крові, пити можна чисту воду без газу');
  }
  if (hasAny('пап-тест') || hasAny('урогенітал')) {
    out.push('ПАП-тест і гінекологічні мазки не здають під час менструації: якщо цикл ще є, плануйте візит на перші дні після її завершення, у менопаузі підійде будь-який день');
  }
  if (hasAny('урогенітал') || hasAny('пап-тест')) {
    out.push('за 24–48 годин до візиту: без статевих контактів, спринцювань, вагінальних свічок, таблеток і кремів');
  }
  return out;
}

/** Спільні FAQ: «перелік не в цій клініці» і «чого немає в програмі». */
export function faqOtherClinic(): { q: string; a: string } {
  return {
    q: 'Чи можна пройти перелік не в цій клініці?',
    a: "Так. Перелік складено за клінічними настановами, тому його можна пройти в будь-якому закладі. Записуватися до клініки-партнера через цю сторінку не обов'язково.",
  };
}

export function faqMissingInProgram(programName: string | null | undefined): { q: string; a: string } {
  const inProgram = programName ? `програмі «${programName}»` : 'програмі клініки';
  const inProgramAcc = programName ? `програму «${programName}»` : 'програму клініки';
  return {
    q: `Що робити, якщо потрібного обстеження немає в ${inProgram}?`,
    a: `Його можна пройти окремо в іншому закладі і принести результат на другий візит: лікар врахує його разом з рештою показників. Що з переліку входить у ${inProgramAcc}, вказано в її описі.`,
  };
}

/** Задача v2 (сторінка після 50): FAQ «чого немає в програмі» – нова відповідь. Питання те саме.
 *  Задача 26.09.2026, п. 2: лікар вирішує, чи потрібне обстеження; де його пройти, не вказуємо. */
export function faqMissingInProgramV2(programName: string | null | undefined): { q: string; a: string } {
  return {
    q: faqMissingInProgram(programName).q,
    a: 'Запитайте про нього лікаря на консультації: він вирішить, чи потрібне воно вам, і призначить його. Результат лікар врахує на другому візиті.',
  };
}

/** Задача v2, блок 6: дисклеймер і рядок про будь-яку клініку. */
export const DOCTOR_DECIDES_TEXT =
  'Повний комплекс обстеження визначає лікар разом з вами на консультації.';
export const ANY_CLINIC_TEXT =
  'Перелік обстежень із цієї сторінки складено за клінічними настановами, тож його можна пройти в будь-якій клініці.';

/** Задача v2, блок 7: другий візит. Назва позиції з Supabase не підставляється, доки її не виправить DATA. */
export const SECOND_VISIT_TEXT_V2 = 'Прийом терапевта після всіх обстежень. Лікар разом з вами розбирає результати.';

/** E-E-A-T: текст редакції. */
export const EDITORIAL_TEXT =
  'Текст підготувала редакція check-up.in.ua. Ми не лікарі, тому медичний зміст перевіряє рецензент, вказаний нижче. Сервіси для пацієнтів робимо з 2014 року, чекапи з 2019 року.';

/** E-E-A-T: текст редакції (жіночі вікові сторінки; задача «три спільні блоки», 26.09.2026). Одразу після нього – рядок «Медичний рецензент». */
export const EDITORIAL_TEXT_V2 =
  'Ми не лікарі і не клініка. Рекомендації на цій сторінці зібрала редакція check-up.in.ua з клінічних настанов, джерела вказані нижче, а медичний зміст перевірила лікарка.';

/** Аудит Ужгорода S1 №4: місто без рецензента (city.reviewer = null) – той самий текст без речення про перевірку лікаркою. */
export const EDITORIAL_TEXT_V2_NO_REVIEWER =
  'Ми не лікарі і не клініка. Рекомендації на цій сторінці зібрала редакція check-up.in.ua з клінічних настанов, джерела вказані нижче.';

/** Аудит Ужгорода S1 (вікові сторінки): медичне застереження під лідом hero, ui-kit §5.3. Текст – як на жіночих вікових. */
export const HERO_DISCLAIMER = 'Інформаційний матеріал. Свій план обстеження обговоріть з лікарем.';

/** Розкриття (жіночі вікові сторінки; задача «три спільні блоки», 26.09.2026): підзаголовок у стилі підписів груп і абзац. */
export const DISCLOSURE_TITLE = 'Як ми заробляємо';
export const DISCLOSURE_TEXT =
  'Клініка-партнер платить нам, коли ви записуєтеся через сайт: за запис, пояснення і підготовку до візиту. Ціни на сайті такі самі, як у клініці. Медичний рецензент сторінки працює в клініці-партнері. Рекомендації на цій сторінці взято з клінічних настанов, тож вони не залежать від складу програм клінік.';

/** Аудит Ужгорода S1 №4: розкриття для міста без рецензента – без речення про рецензента. */
export const DISCLOSURE_TEXT_NO_REVIEWER = DISCLOSURE_TEXT.replace(' Медичний рецензент сторінки працює в клініці-партнері.', '');

/**
 * Латка етапу 1, №3 (п. 1): рецензент – один об'єкт для шести сторінок (чотири жіночі вікові, «Мамографія», «ПАП-тест»).
 * category, experience, reviewDate – після відповіді рецензентки, значення вносить Координатор (reviewDate – ДД.ММ.РРРР).
 * Поки reviewDate порожній, блок редакції і рецензента на сторінках скринінгу не виводиться.
 */
export const REVIEWER = {
  name: 'Удовиченко Олена Олександрівна',
  jobTitle: 'лікар акушер-гінеколог',
  org: 'ОН Клінік Харків',
  category: '',
  experience: '',
  reviewDate: '',
};

/** Латка 3, п. 1: рядок 1 блоку редакції і рецензента на сторінках скринінгу. */
export const SCREENING_EDITORIAL_TEXT =
  'Ми не лікарі і не клініка. Текст підготувала редакція check-up.in.ua з клінічних настанов, джерела вказані нижче, а медичний зміст перевірила лікарка.';

/** Латка 3, п. 1: рядок 3 – конфлікт інтересу рецензента. */
export const REVIEWER_PARTNER_NOTE = 'Медичний рецензент працює в клініці-партнері check-up.in.ua.';

/** Латка 3, п. 1: рядок 2 після «Медичний рецензент:». Порожні category і experience не виводяться разом із комою. */
export function reviewerDetails(r: typeof REVIEWER): string {
  const who = [r.name, r.jobTitle, r.category, r.experience ? `стаж ${r.experience}` : ''].filter(Boolean).join(', ');
  return `${who} · ${r.org} · перевірено ${r.reviewDate}.`;
}

/** Латка 3, п. 3: рядок дат. Порожній published – фрагмент «Опубліковано: … ·» не виводиться. Дати – ДД.ММ.РРРР. */
export function pageDatesText(publishedLabel: string, updatedLabel: string): string {
  return publishedLabel ? `Опубліковано: ${publishedLabel} · Оновлено: ${updatedLabel}` : `Оновлено: ${updatedLabel}`;
}

/** Кількість філій словом, узгоджена з «філія / філії / філій». */
const BRANCH_COUNT_WORDS: Record<number, string> = {
  1: 'одна', 2: 'дві', 3: 'три', 4: 'чотири', 5: "п'ять", 6: 'шість', 7: 'сім', 8: 'вісім', 9: "дев'ять", 10: 'десять',
};

/** «три філії»: кількість словом і узгоджене слово. */
export function branchesCountText(n: number): string {
  return `${BRANCH_COUNT_WORDS[n] ?? String(n)} ${branchesWord(n)}`;
}

/** Години роботи: коротке тире між годинами («8:00-18:00» → «8:00–18:00»). */
export function hoursDash(s: string): string {
  return s.replace(/(\d)\s*-\s*(\d)/g, '$1–$2');
}

export function branchesWord(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return 'філія';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'філії';
  return 'філій';
}

/** GEO-абзац. subject – «Чекап для жінок 40–50 років» тощо. */
export function geoText(params: {
  subject: string;
  cityIn?: string;
  clinicName: string;
  branches: { address_ua: string; metro_ua: string | null }[];
  programName?: string | null;
  missingText?: string | null;
}): string {
  const { subject, cityIn = 'у Харкові', clinicName, branches, programName, missingText } = params;
  const count = BRANCH_COUNT_WORDS[branches.length] ?? String(branches.length);
  const list = branches.map((b) => `${b.address_ua}${b.metro_ua ? ` (${b.metro_ua})` : ''}`).join('; ');
  let text = `${subject} ${cityIn} можна пройти в ${clinicName}: ${count} ${branchesWord(branches.length)}, ${list}.`;
  if (programName) text += ` Програма клініки: «${programName}».`;
  if (missingText) text += ` ${missingText}`;
  return text;
}

/**
 * Schema.org (SEO-STANDARD р.5, типи 5 і 5a; задача Cowork «Schema на вікових сторінках», 26.09.2026):
 * ItemList програм блоку 1b. Кожен елемент – програма (Service) з клінікою-постачальником (provider) і URL;
 * ціна з датою (Offer, validFrom = дата ціни) – лише всередині елемента програми. Offer на рівні сторінки не виводиться.
 * url програми – картка програми на цій сторінці (окремих сторінок програм на субдомені клініки поки немає).
 * Даних немає – повертає null, і ItemList на сторінці не виводиться.
 */
export function programsItemListLd(opts: {
  listName: string;
  programsUrl: string;
  city: string;
  clinic: { name: string; website: string | null } | null;
  /** clinic у програмі – її клініка, коли на сторінці кілька клінік; без нього – clinic списку. */
  programs: { name_ua: string; price_discount: number | null; price_date: string | null; clinic?: { name: string; website: string | null } }[];
}): object | null {
  const { listName, programsUrl, city, clinic, programs } = opts;
  if (!clinic || programs.length === 0) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: listName,
    numberOfItems: programs.length,
    itemListElement: programs.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Service',
        name: p.name_ua,
        url: programsUrl,
        areaServed: { '@type': 'City', name: city },
        provider: { '@type': 'MedicalClinic', name: (p.clinic ?? clinic).name, ...((p.clinic ?? clinic).website ? { url: (p.clinic ?? clinic).website } : {}) },
        ...(typeof p.price_discount === 'number' && p.price_discount > 0
          ? {
              offers: {
                '@type': 'Offer',
                price: p.price_discount,
                priceCurrency: 'UAH',
                ...(p.price_date ? { validFrom: p.price_date.slice(0, 10) } : {}),
                url: programsUrl,
              },
            }
          : {}),
      },
    })),
  };
}
