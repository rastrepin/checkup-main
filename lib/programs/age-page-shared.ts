import type { ReactNode } from 'react';

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

/**
 * Позиція блоку «Доповнення» – обстеження з переліку сторінки, якого може не бути в програмі.
 * Список задає сторінка, бо рекомендації залежать від віку.
 */
export interface AgeAddition {
  id: string;
  name: string;
  /** Ключові слова для зіставлення зі складом програми і з clinic_services. */
  keywords: string[];
  /** Текст картки, якщо клініка обстеження проводить (група «Можна додати до запису»). */
  explanation: ReactNode;
  /** Текст картки, якщо клініка не проводить (група «…не проводиться»). */
  why: ReactNode;
  /** Ознака «рекомендоване для віку сторінки всім». Лише такі позиції входять у {missingTests};
   *  обстеження, які в цьому віці роблять за факторів ризику, – false. */
  forAll: boolean;
  /** Назва в реченні {missingTests}; обов'язкова, якщо forAll = true. */
  missingName?: string;
  /** Назва в знахідному відмінку для речення «… можна також додати до запису», якщо відрізняється від missingName
   *  («мамографія» → «мамографію»). */
  missingNameAcc?: string;
}

/** Велика перша літера (початок речення). */
export function ucFirst(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Кінцівка речення про відсутні обстеження (задача 26.09.2026, п. 1): «додайте до запису» – лише для обстежень,
 * які клініка проводить. Ознака та сама, що розподіляє картки блоку 5 на групи (clinic_services).
 * - усі проводить: «{ask} або додайте до запису.»;
 * - частину: «{ask}. {назви тих, що проводить} можна також додати до запису.»;
 * - жодного: «{ask}.»
 * ask – «Запитайте про них лікаря на консультації» (множина) або форма однини; names – у знахідному відмінку.
 */
export function askDoctorOrAdd(ask: string, items: { nameAcc: string; available: boolean }[]): string {
  const avail = items.filter((i) => i.available).map((i) => i.nameAcc);
  if (avail.length === items.length) return `${ask} або додайте до запису.`;
  if (avail.length === 0) return `${ask}.`;
  return `${ask}. ${ucFirst(joinWithAnd(avail))} можна також додати до запису.`;
}

/** Речення {missingTests} (Hero, картка програми, GEO) з доповнень, яких немає в програмі; null – не виводиться.
 *  Конструкція Б – задача v2 (24.09.2026), розділ 16.1, діє на всіх сторінках. */
export function missingTestsSentence(
  missingAdditions: AgeAddition[],
  /** Ознака «клініка проводить» (група «Можна додати до запису» блоку 5). Усі сторінки передають її;
   *  без неї кожне обстеження вважається доступним. */
  isAvailable: (a: AgeAddition) => boolean = () => true,
): string | null {
  const items = missingAdditions.filter((a) => a.forAll && a.missingName);
  if (items.length === 0) return null;
  const tail = items.map((a) => ({ nameAcc: a.missingNameAcc ?? (a.missingName as string), available: isAvailable(a) }));
  const names = items.map((a) => a.missingName as string);
  if (names.length === 1) {
    return `До програми не входить ${names[0]}. ${askDoctorOrAdd('Запитайте про це обстеження лікаря на консультації', tail)}`;
  }
  return `До програми не входять ${joinWithAnd(names)}. ${askDoctorOrAdd('Запитайте про них лікаря на консультації', tail)}`;
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

/** Вступ блоку «Доповнення». */
export function additionsIntro(programName: string): string {
  return `Цих обстежень із переліку в програмі «${programName}» немає.`;
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

/** Задача v2, блок 5: абзац під картками групи «…не проводять» (кілька обстежень; задача 26.09.2026, п. 2). */
export const ADDITIONS_ASK_DOCTOR =
  'Запитайте про ці обстеження лікаря на консультації: він вирішить, чи потрібні вони вам, і призначить їх. Результат лікар врахує на другому візиті.';

/** Те саме, коли в групі одне обстеження. */
export const ADDITIONS_ASK_DOCTOR_ONE =
  'Запитайте про це обстеження лікаря на консультації: він вирішить, чи потрібне воно вам, і призначить його. Результат лікар врахує на другому візиті.';

/** Абзац під групою «…не проводять»: однина або множина за кількістю карток. */
export function additionsAskDoctor(count: number): string {
  return count === 1 ? ADDITIONS_ASK_DOCTOR_ONE : ADDITIONS_ASK_DOCTOR;
}

/** Латка тексту 2 (A4): причина групи «Запитати у лікаря» – перше речення абзацу під групою. */
export function additionsUnavailableReason(count: number, riskBased: boolean): string {
  if (riskBased) {
    return count === 1
      ? 'Це обстеження в цьому віці роблять за факторів ризику.'
      : 'Ці обстеження в цьому віці роблять за факторів ризику.';
  }
  return count === 1
    ? 'Клініка цього обстеження не проводить, тож до запису його не додати.'
    : 'Клініка цих обстежень не проводить, тож до запису їх не додати.';
}

/** Латка тексту 2 (A1): абзац під групою «Можна додати до запису». */
export const ADDITIONS_ADD_VIA_MANAGER = "Щоб додати обстеження до запису, скажіть про це менеджеру, коли він зв'яжеться з вами після заявки: він назве вартість.";

/** Задача v2, блок 5: заголовок групи недоступних у клініці обстежень. */
export function additionsUnavailableTitle(clinicName: string | null | undefined): string {
  void clinicName; // Сигнатуру збережено (латка етапу 1, п. 1.4): заголовок групи однаковий для будь-якої клініки.
  return 'Запитати у лікаря';
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

/** Розкриття (жіночі вікові сторінки; задача «три спільні блоки», 26.09.2026): підзаголовок у стилі підписів груп і абзац. */
export const DISCLOSURE_TITLE = 'Як ми заробляємо';
export const DISCLOSURE_TEXT =
  'Клініка-партнер платить нам, коли ви записуєтеся через сайт: за запис, пояснення і підготовку до візиту. Ціни на сайті такі самі, як у клініці. Медичний рецензент сторінки працює в клініці-партнері. Рекомендації на цій сторінці взято з клінічних настанов, тож вони не залежать від складу програм клінік.';

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
  /** clinics.phone (латка етапу 1, п. 2.7); порожній – фраза про телефон не виводиться. */
  phone?: string | null;
}): string {
  const { subject, cityIn = 'у Харкові', clinicName, branches, programName, missingText, phone } = params;
  const count = BRANCH_COUNT_WORDS[branches.length] ?? String(branches.length);
  const list = branches.map((b) => `${b.address_ua}${b.metro_ua ? ` (${b.metro_ua})` : ''}`).join('; ');
  let text = `${subject} ${cityIn} можна пройти в ${clinicName}: ${count} ${branchesWord(branches.length)}, ${list}${phone?.trim() ? `, телефон ${phone.trim()}` : ''}.`;
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
  programs: { name_ua: string; price_discount: number | null; price_date: string | null }[];
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
        provider: { '@type': 'MedicalClinic', name: clinic.name, ...(clinic.website ? { url: clinic.website } : {}) },
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
