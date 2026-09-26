import type { Metadata } from 'next';
import Link from 'next/link';

// Контент: content/screening/pap-test.md дослівно (v0, SPRINT-KHARKIV-v0, сторінка 2)
// Структура і верстка – за app/ukr/screening/mamografiia/page.tsx (еталон скринінгової сторінки).
// Сторінка національна: без міста, без цін, без форм, без партнера, без Supabase.
// Рецензента національної сторінки ще не визначено – блок рецензента НЕ рендериться.

const PAGE_URL = 'https://check-up.in.ua/ukr/screening/pap-test';
const BORDER = '1px solid #e8edf3';
const BG_GRAY = '#f8fafc';
const BG_WHITE = '#ffffff';
const UPDATED_ISO = '2026-09-23';
const UPDATED_LABEL = '23.09.2026';

// Рецензент: null, доки не визначено рецензента національних сторінок.
const REVIEWER: { name: string; jobTitle: string } | null = null;

const TITLE = 'ПАП-тест: що показує і коли потрібен | check-up.in.ua';
const DESCRIPTION =
  'ПАП-тест – мазок з шийки матки для скринінгу раку. Що показує і чого не показує, з якого віку і як часто за стандартом МОЗ України, коли скринінг припиняють.';

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  robots: { index: true, follow: true },
  alternates: { canonical: PAGE_URL },
  openGraph: { title: TITLE, description: DESCRIPTION, url: PAGE_URL, type: 'website' },
};

/* Джерела: [n] у тексті → пункт n */
const SOURCES = [
  'МОЗ України. Стандарт медичної допомоги «Скринінг раку шийки матки. Ведення пацієнток з аномальними результатами скринінгу та передраковими станами шийки матки», наказ №1057 від 18.06.2024.',
  'МОЗ України. Порядок скринінгу і ранньої діагностики раку шийки матки, наказ №1368 від 05.08.2024.',
  'Duodecim, guidelines.moz.gov.ua. Настанова 00533 «Пап-тест (шийки матки) та біопсія ендометрію», оновлення 09.08.2017.',
];

function S({ n }: { n: number[] }) {
  return (
    <sup className="text-[#005485] whitespace-nowrap">
      {' '}
      [
      {n.map((i, idx) => (
        <span key={i}>
          {idx > 0 && ', '}
          <a href={`#source-${i}`} className="hover:underline">
            {i}
          </a>
        </span>
      ))}
      ]
    </sup>
  );
}

function Eyebrow({ children }: { children: string }) {
  return <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#005485] mb-6">{children}</p>;
}

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-bold text-[#0b1a24]" style={{ fontSize: 'clamp(22px, 3vw, 30px)', lineHeight: 1.25 }}>
      {children}
    </h2>
  );
}

function Section({ bg, eyebrow, children }: { bg: string; eyebrow: string; children: React.ReactNode }) {
  return (
    <section style={{ backgroundColor: bg, borderTop: BORDER }}>
      <div className="max-w-[1200px] mx-auto px-6 lg:px-14 py-14">
        <div className="max-w-3xl">
          <Eyebrow>{eyebrow}</Eyebrow>
          {children}
        </div>
      </div>
    </section>
  );
}

const P = 'text-gray-700 leading-relaxed mt-4';

export default function ScreeningPapTestPage() {
  const jsonLd: object[] = [
    {
      '@context': 'https://schema.org',
      '@type': 'MedicalWebPage',
      name: 'ПАП-тест: що показує і коли потрібен',
      url: PAGE_URL,
      about: { '@type': 'MedicalTest', name: 'ПАП-тест (скринінг раку шийки матки)' },
      dateModified: UPDATED_ISO,
      ...(REVIEWER
        ? { lastReviewed: UPDATED_ISO, reviewedBy: { '@type': 'Person', name: REVIEWER.name, jobTitle: REVIEWER.jobTitle } }
        : {}),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'check-up.in.ua', item: 'https://check-up.in.ua' },
        { '@type': 'ListItem', position: 2, name: 'ПАП-тест', item: PAGE_URL },
      ],
    },
  ];

  return (
    <main className="text-[#0b1a24]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero + disclaimer_short */}
      <section style={{ backgroundColor: BG_GRAY }}>
        <div className="max-w-[1200px] mx-auto px-6 lg:px-14 py-14">
          <div className="max-w-3xl">
            <nav aria-label="Breadcrumb" className="text-xs text-gray-500 mb-8">
              <Link href="/" className="hover:underline">check-up.in.ua</Link>
              <span className="mx-1.5">/</span>
              <span className="text-gray-700">ПАП-тест</span>
            </nav>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#005485] mb-6">Довідник обстежень</p>
            <h1
              className="font-bold leading-tight mb-6"
              style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 'clamp(32px, 5.5vw, 64px)' }}
            >
              ПАП-тест: що показує і коли потрібен
            </h1>
            <p className="text-sm text-gray-600 bg-white border border-[#e8edf3] rounded-[10px] px-5 py-4">
              Це довідка, не консультація. Чи потрібне вам обстеження, вирішуйте разом із лікарем, який вас
              спостерігає.
            </p>
          </div>
        </div>
      </section>

      {/* what_shows */}
      <Section bg={BG_WHITE} eyebrow="Суть обстеження">
        <H2>Що показує ПАП-тест</H2>
        <p className={P}>
          ПАП-тест зазвичай роблять під час гінекологічного огляду, тому його часто сприймають як частину огляду,
          а не як окреме обстеження. Далі про скринінг: тест без скарг, щоб знайти зміни шийки матки раніше, ніж
          вони стануть раком.
        </p>
        <p className={P}>
          ПАП-тест – мазок з шийки матки, який дивляться під мікроскопом. Лікар щіткою збирає клітини з поверхні
          шийки і з її каналу<S n={[1]} />. У лабораторії їх фарбують за методом Папаніколау, звідси назва тесту, а
          результат описують за міжнародною класифікацією Bethesda<S n={[1]} />. У документах МОЗ цей тест
          називають цитологічним дослідженням шийки матки.
        </p>
        <p className={P}>
          Сенс тесту – знайти рак шийки матки і передракові зміни на ранній стадії<S n={[3]} />.
        </p>
        <p className={P}>
          Поруч з ПАП-тестом існує тест на вірус папіломи людини (ВПЛ). Рак шийки матки пов&apos;язаний з кількома
          типами цього вірусу, а інфікування відбувається переважно статевим шляхом<S n={[1]} />. Український
          стандарт допускає два способи скринінгу: мазок на клітини або тест на ВПЛ<S n={[1]} />.
        </p>
      </Section>

      {/* what_not_shows */}
      <Section bg={BG_GRAY} eyebrow="Межі методу">
        <H2>Чого ПАП-тест не показує</H2>
        <p className={P}>
          Нормальний результат не гарантує, що змін немає. Для плоскоклітинного раку шийки матки чутливість
          ПАП-тесту 85–95 відсотків<S n={[3]} />: частину змін один мазок пропускає. Тому скринінг розрахований на
          повторення з інтервалом, а не на один тест<S n={[1]} />.
        </p>
        <p className={P}>
          Для раку тіла матки чутливість нижча, 50–60 відсотків<S n={[3]} />. Рак яєчників ПАП-тест не
          виявляє<S n={[3]} />.
        </p>
        <p className={P}>
          Аномальний результат не означає рак. Він означає, що потрібне уточнення: тест на ВПЛ і, за потреби,
          кольпоскопія – огляд шийки матки під збільшенням, під час якого можуть взяти біопсію<S n={[1]} />.
        </p>
      </Section>

      {/* when_justified */}
      <Section bg={BG_WHITE} eyebrow="Вік і графік">
        <H2>Коли ПАП-тест обґрунтований</H2>
        <p className={P}>Відповідь залежить від віку, від результатів попередніх тестів і від стану імунітету.</p>
        <p className={P}>
          Багато хто вважає, що мазок потрібен з моменту початку статевого життя. Український стандарт вік початку
          скринінгу з цим не пов&apos;язує<S n={[1]} />. Причина в тому, що ВПЛ дуже поширений у молодих жінок, але
          приблизно в 90 відсотків випадків організм позбувається його сам протягом двох років<S n={[1]} />. Тому у
          21–24 роки скринінг роблять тільки мазком на клітини, без первинного тесту на ВПЛ<S n={[1]} />.
        </p>
        <p className={P}>
          З якого віку починати, документи кажуть по-різному. Стандарт МОЗ допускає мазок на клітини з 21
          року<S n={[1]} />. Порядок скринінгу МОЗ називає популяційний вік 25–65 років, а з 21 року – для груп
          ризику<S n={[2]} />. Настанова Duodecim вважає скринінговий ПАП-тест до 25 років невиправданим, а до 20
          років недостовірним<S n={[3]} />. Коли починати саме вам, обговоріть з гінекологом.
        </p>
        <p className={P}>
          Як часто повторювати, залежить від способу. Мазок на клітини – раз на 3 роки до 65 років<S n={[1]} />. Тест
          на ВПЛ – раз на 10 років, з 35 до 65 років<S n={[1]} />. Стандарт допускає також поєднання обох тестів у
          25–65 років раз на 5 років<S n={[1]} />.
        </p>
        <p className={P}>
          Щеплення від ВПЛ скринінг не скасовує: його роблять незалежно від вакцинації<S n={[1]} />.
        </p>
        <p className={P}>
          Якщо у вас ВІЛ або інший стан, що пригнічує імунітет, графік інший. Після першого нормального мазка
          наступний роблять через 12 місяців, після трьох нормальних щорічних результатів – раз на 3 роки, і скринінг
          з віком не припиняють<S n={[1]} />.
        </p>
        <p className={P}>
          Після 65 років скринінг припиняють, якщо попередні результати були нормальними: два негативні тести на ВПЛ
          або три нормальні мазки за останні 10 років, і за останні 25 років не було помірних або тяжких передракових
          змін<S n={[1]} />. Якщо попередніх результатів ви не знаєте, скринінг після 65 продовжують, доки ці умови не
          виконаються<S n={[1]} />. Скринінг також припиняють у будь-якому віці, якщо очікувана тривалість життя
          обмежена<S n={[1]} />.
        </p>
        <p className={P}>
          Від результату залежить наступний крок. Нормальний мазок означає наступний тест за графіком. Аномальний мазок
          означає уточнення тестом на ВПЛ<S n={[1]} />. Позитивний тест на ВПЛ означає мазок на клітини як сортувальний
          тест, а за аномального результату – кольпоскопію<S n={[1]} />. Якщо жоден результат нічого не змінить у ваших
          діях, це підстава обговорити з лікарем, чи потрібен тест зараз.
        </p>
        <p className={P}>
          Скринінг не замінює огляду зі скаргами. Якщо є ознаки захворювання шийки матки, це вже не скринінг, і
          обстеження визначає лікар<S n={[1]} />.
        </p>
      </Section>

      {/* affects_result */}
      <Section bg={BG_GRAY} eyebrow="Точність мазка">
        <H2>Що впливає на результат</H2>
        <p className={P}>
          Кількість клітин. Якщо клітин у мазку замало, результат вважають незадовільним<S n={[1, 3]} />. Мазок
          повторюють не пізніше ніж через чотири місяці, а перед тим, за показаннями, лікують виділення або
          інфекцію<S n={[1]} />.
        </p>
        <p className={P}>
          Кров, запалення, інфекція. Можуть заважати оцінці мазка<S n={[3]} />.
        </p>
        <p className={P}>
          Змащувальні засоби. Під час огляду для змащення використовують лише фізіологічний розчин, бо інші засоби
          впливають на оцінку результату<S n={[3]} />.
        </p>
      </Section>

      {/* preparation */}
      <Section bg={BG_WHITE} eyebrow="Перед візитом">
        <H2>Як підготуватися</H2>
        <p className={P}>
          Документи, на які спирається ця сторінка, окремої підготовки для жінки не описують<S n={[1, 3]} />.
        </p>
        <p className={P}>
          Якщо тест уже робили, скажіть лікарю дату і результат попереднього. Від них залежить, чи потрібен тест
          зараз і коли скринінг можна припинити<S n={[1]} />.
        </p>
      </Section>

      {/* how_we_know */}
      <Section bg={BG_GRAY} eyebrow="Методологія">
        <H2>Як ми це знаємо</H2>
        <p className={P}>
          Текст побудований на джерелах у такому порядку: спочатку стандарт і порядок МОЗ України, потім міжнародна
          настанова, адаптована в Україні. Формулювання наші, цитат немає. Число з джерела наводиться з номером
          джерела, а якщо перевіреного числа немає, ми не наводимо приблизного. Розбіжності між джерелами названі в
          тексті, не приховані.
          {REVIEWER
            ? ' Медичну частину перевіряє лікар-рецензент, зазначений нижче; редакція лікарями не є.'
            : ' Редакція лікарями не є.'}
        </p>
      </Section>

      {/* sources */}
      <Section bg={BG_WHITE} eyebrow="Першоджерела">
        <H2>Джерела</H2>
        <ol className="mt-4 space-y-3 list-none">
          {SOURCES.map((s, i) => (
            <li key={i} id={`source-${i + 1}`} className="flex gap-3 text-sm text-gray-600 leading-relaxed scroll-mt-24">
              <span className="font-semibold text-[#0b1a24] shrink-0">{i + 1}.</span>
              <span>{s}</span>
            </li>
          ))}
        </ol>
      </Section>

      {/* author_reviewer */}
      <section style={{ backgroundColor: BG_GRAY, borderTop: BORDER }}>
        <div className="max-w-[1200px] mx-auto px-6 lg:px-14 py-12">
          <div className="max-w-3xl text-xs text-gray-500 leading-relaxed">
            <p>
              Текст підготувала редакція check-up.in.ua; ми не лікарі.
              {REVIEWER && (
                <>
                  {' '}Медичну частину перевірив: <strong className="text-gray-700">{REVIEWER.name}</strong>,{' '}
                  {REVIEWER.jobTitle}.
                </>
              )}
            </p>
            <p className="mt-1">Оновлено: {UPDATED_LABEL}</p>
          </div>
        </div>
      </section>
    </main>
  );
}
