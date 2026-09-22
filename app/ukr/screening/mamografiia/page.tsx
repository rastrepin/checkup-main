import type { Metadata } from 'next';
import Link from 'next/link';

// Контент: content/screening/mamografiia.md дослівно (v3.1, updated 2026-09-12)
// Layout: layout-standards-v2 (py-14, borderTop, Eyebrow перед H2, чергування фонів)
// Сторінка статична, без Supabase і без форм. Рецензента немає (reviewer_slug порожній) –
// блок рецензента НЕ рендериться; підключення з реєстру doctors – окремою ітерацією.

const PAGE_URL = 'https://check-up.in.ua/ukr/screening/mamografiia';
const BORDER = '1px solid #e8edf3';
const BG_GRAY = '#f8fafc';
const BG_WHITE = '#ffffff';

// Рецензент: null поки немає профілю в реєстрі (Supabase doctors).
// Коли зʼявиться – замінити на { name: '...', jobTitle: '...' }.
const REVIEWER: { name: string; jobTitle: string } | null = null;

export const metadata: Metadata = {
  title: { absolute: 'Мамографія: що показує і коли потрібна | check-up.in.ua' },
  description:
    'Мамографія – рентгенівський знімок молочних залоз. Що показує і чого не показує, коли скринінг обґрунтований за віком і ризиком, як підготуватися. Джерела: МОЗ України, USPSTF, Mayo Clinic.',
  robots: { index: true, follow: true },
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: 'Мамографія: що показує і коли потрібна | check-up.in.ua',
    description:
      'Що показує і чого не показує мамографія, коли скринінг обґрунтований за віком і ризиком, як підготуватися.',
    url: PAGE_URL,
    type: 'website',
  },
};

/* Джерела: [n] у тексті → пункт n */
const SOURCES = [
  'МОЗ України. Порядок скринінгу і ранньої діагностики раку молочної залози, наказ №1368 від 05.08.2024, чинний з 01.01.2025.',
  'МОЗ України. Стандарт медичної допомоги «Рак молочної залози», наказ №195 від 03.02.2025.',
  'ДЕЦ МОЗ України. Клінічна настанова «Рак молочної залози на ранніх стадіях», 2024, адаптація ESMO 2023.',
  'Duodecim, guidelines.moz.gov.ua. Настанова 00543 «Рак грудної залози», доказовий огляд 00810, 2017.',
  'USPSTF. Breast Cancer: Screening, Final Recommendation Statement, 2024. uspreventiveservicestaskforce.org/uspstf/recommendation/breast-cancer-screening',
  'Mayo Clinic Family Health Book, 5th Edition, розд. 24, 35.',
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

function H2({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <h2 id={id} className="font-bold text-[#0b1a24]" style={{ fontSize: 'clamp(22px, 3vw, 30px)', lineHeight: 1.25 }}>
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

export default function ScreeningMamografiiaPage() {
  const jsonLd: object[] = [
    {
      '@context': 'https://schema.org',
      '@type': 'MedicalWebPage',
      name: 'Мамографія: що показує і коли потрібна',
      url: PAGE_URL,
      about: { '@type': 'MedicalTest', name: 'Мамографія (скринінг раку молочної залози)' },
      lastReviewed: '2026-09-12',
      ...(REVIEWER ? { reviewedBy: { '@type': 'Person', name: REVIEWER.name, jobTitle: REVIEWER.jobTitle } } : {}),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'check-up.in.ua', item: 'https://check-up.in.ua' },
        { '@type': 'ListItem', position: 2, name: 'Мамографія', item: PAGE_URL },
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
              <span className="text-gray-700">Мамографія</span>
            </nav>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#005485] mb-6">
              Довідник обстежень
            </p>
            <h1
              className="font-bold leading-tight mb-6"
              style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 'clamp(32px, 5.5vw, 64px)' }}
            >
              Мамографія: що показує і коли потрібна
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
        <H2>Що показує мамографія</H2>
        <p className={P}>
          Мамографію призначають у двох різних ситуаціях: коли є скарга і коли скарг немає. Далі про другу
          ситуацію: обстеження без симптомів, щоб знайти зміни раніше, ніж вони проявляться.
        </p>
        <p className={P}>
          Мамографія – рентгенівський знімок молочних залоз. На ньому видно ущільнення, які ще не відчуваються
          на дотик. На ньому видно також мікрокальцинати: дрібні відкладення кальцію в тканині залози, які теж
          не відчуваються рукою<S n={[6]} />.
        </p>
        <p className={P}>
          Сенс скринінгової мамографії в тому, щоб знайти рак на ранній стадії, коли він найкраще піддається
          лікуванню<S n={[6]} />.
        </p>
      </Section>

      {/* what_not_shows */}
      <Section bg={BG_GRAY} eyebrow="Межі методу">
        <H2>Чого мамографія не показує</H2>
        <p className={P}>
          Нормальний результат не виключає рак. Мамографія пропускає приблизно 15 відсотків пухлин, найчастіше
          при щільній тканині залози<S n={[6]} />. Тому будь-які нові зміни в грудях між плановими знімками
          обговорюють з лікарем, не чекаючи наступного терміну.
        </p>
        <p className={P}>
          Підозріла зміна на знімку не означає рак. Приблизно три з чотирьох підозрілих ділянок після уточнення
          виявляються доброякісними; це називають хибнопозитивним результатом<S n={[4, 6]} />. Дообстеження
          означає додаткові знімки, УЗД, іноді біопсію, а разом з ними тривогу до відповіді.
        </p>
        <p className={P}>
          Мамографія не відрізняє надійно кісту, заповнену рідиною, від щільного утворення. Для цього після
          знімка призначають УЗД<S n={[6]} />.
        </p>
      </Section>

      {/* when_justified */}
      <Section bg={BG_WHITE} eyebrow="Вік і ризик">
        <H2>Коли мамографія обґрунтована</H2>
        <p className={P}>Відповідь залежить від віку і від того, чи є у вас підвищений ризик.</p>
        <p className={P}>
          Якщо вам менше 40 і немає скарг, випадків раку в родині чи іншого високого ризику, скринінгова
          мамографія найімовірніше не потрібна. До 35 років з цим згодна більшість фахівців<S n={[6]} />.
          Обстеження стає потрібним раніше, якщо рак молочної залози був у матері, сестри або доньки: тоді його
          починають за 5–10 років до віку, у якому діагноз поставили родичці<S n={[6]} />.
        </p>
        <p className={P}>
          У 40–49 років мамографія обґрунтована, якщо є хоча б один фактор ризику, і тоді її повторюють кожні
          2 роки<S n={[1]} />. Медичні фактори з української настанови: спадкова мутація генів BRCA1 або BRCA2,
          рак молочної залози у близьких родичів, безпліддя. Також перші пологи у 30 років або пізніше,
          менопауза у 55 років або пізніше, тривала менопаузальна гормональна терапія, ожиріння після
          менопаузи<S n={[1]} />. Без факторів ризику в цьому віці єдиної відповіді немає, і це рішення
          обговорюють з лікарем<S n={[3, 5, 6]} />.
        </p>
        <p className={P}>
          У 50–69 років мамографія кожні 2 роки рекомендована всім жінкам, незалежно від скарг і факторів
          ризику<S n={[1, 2, 3]} />. Це основна група скринінгу, тут рекомендації збігаються.
        </p>
        <p className={P}>
          Після 69 років українська настанова тактики не визначає, а міжнародні вважають докази
          недостатніми<S n={[1, 5]} />. На практиці скринінг припиняють, коли очікувана тривалість життя менша
          за 5–10 років, зазвичай після 75<S n={[6]} />. Це теж вирішують разом з лікарем.
        </p>
        <p className={P}>
          Якщо у вас підтверджена мутація BRCA1 або BRCA2, українські документи дають два режими: мамографія
          від 40 років кожні 2 роки<S n={[1]} /> або щорічно МРТ разом із мамографією<S n={[2, 3]} />. Який
          підходить вам, обговоріть з лікарем, який веде спадковий ризик.
        </p>
        <p className={P}>
          Від результату залежить наступний крок. Нормальний знімок означає наступний через 2 роки. Підозріла
          зміна означає дообстеження в онколога або хірурга-онколога, щоб виключити хибнопозитивний результат
          або почати лікування<S n={[1]} />. Якщо ні перший, ні другий результат нічого не змінить у ваших
          діях, це підстава обговорити з лікарем, чи потрібне обстеження зараз.
        </p>
        <p className={P}>
          Межі різні ось чому. Ранній початок скринінгу знаходить більше випадків і водночас дає більше
          хибнопозитивних результатів<S n={[3, 5, 6]} />. Тому одні настанови починають з 40 років, інші з 50,
          і жодна не вирішує за вас: рівень доказів стосується користі для населення, не для конкретної людини.
        </p>
        <p className={P}>
          Приблизно одна жінка з восьми стикається з раком молочної залози протягом життя, на спадкові форми
          припадає 5–10 відсотків випадків. Це дані США<S n={[6]} />. Для України придатні тільки дані про
          захворюваність за Національним канцер-реєстром; показники виживаності не використовуємо, бо їх
          повнота недостатня для порівняння.
        </p>
      </Section>

      {/* affects_result */}
      <Section bg={BG_GRAY} eyebrow="Точність знімка">
        <H2>Що впливає на результат</H2>
        <p className={P}>
          Щільність тканини. У молодших жінок і при щільній залозі чутливість знімка нижча, у старшому віці
          вища<S n={[3, 4]} />. Чи додавати при щільній тканині УЗД або МРТ, доказів недостатньо<S n={[5]} />.
          Це вирішують з лікарем.
        </p>
        <p className={P}>
          Фаза циклу. Найзручніший час – через кілька днів після закінчення менструації, коли груди менш
          набряклі<S n={[6]} />.
        </p>
        <p className={P}>
          Імплантати. Можуть ускладнювати оцінку знімка<S n={[2]} />. Про імплантати кажуть до обстеження.
        </p>
      </Section>

      {/* preparation */}
      <Section bg={BG_WHITE} eyebrow="Перед візитом">
        <H2>Як підготуватися</H2>
        <p className={P}>
          У день обстеження не наносьте дезодорант, антиперспірант, пудру чи лосьйон на груди і пахви: їхні
          частинки можуть виглядати на знімку як кальцинати<S n={[6]} />.
        </p>
        <p className={P}>
          Візьміть попередні знімки, якщо мамографію вже робили: їх порівнюють з новими, щоб побачити
          зміни<S n={[6]} />.
        </p>
      </Section>

      {/* how_we_know */}
      <Section bg={BG_GRAY} eyebrow="Методологія">
        <H2>Як ми це знаємо</H2>
        <p className={P}>
          Текст побудований на джерелах у такому порядку: спочатку накази і стандарти МОЗ України, потім
          міжнародні настанови, адаптовані в Україні, потім рекомендації USPSTF і довідник Mayo Clinic.
          Формулювання наші, цитат немає. Число з джерела наводиться з номером джерела, а якщо перевіреного
          числа немає, ми не наводимо приблизного. Розбіжності між джерелами названі в тексті, не приховані.
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

      {/* author_reviewer (E-E-A-T, py-12) */}
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
            <p className="mt-1">Оновлено: 12.09.2026</p>
          </div>
        </div>
      </section>
    </main>
  );
}
