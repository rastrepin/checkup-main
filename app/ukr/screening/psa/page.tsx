import type { Metadata } from 'next';
import Link from 'next/link';

// Контент: content/screening/psa.md дослівно (v0, SPRINT-KHARKIV-v0, сторінка 9)
// Структура і верстка – як app/ukr/screening/pap-test/page.tsx (ті самі секції).
// Сторінка національна: без міста, без цін, без форм, без партнера, без Supabase.
// Рецензента національної сторінки не визначено – блок рецензента і reviewedBy НЕ рендеряться.
// Джерела – тільки ті, що названі в screening-evidence-matrix.md, розділ 2.9.

const PAGE_URL = 'https://check-up.in.ua/ukr/screening/psa';
const BORDER = '1px solid #e8edf3';
const BG_GRAY = '#f8fafc';
const BG_WHITE = '#ffffff';
const UPDATED_ISO = '2026-09-23';
const UPDATED_LABEL = '23.09.2026';

// Рецензент: null, доки не визначено рецензента національних сторінок.
const REVIEWER: { name: string; jobTitle: string } | null = null;

const TITLE = 'Аналіз PSA: що показує і коли потрібен | check-up.in.ua';
const H1 = 'Аналіз PSA: що показує і коли потрібен';
const DESCRIPTION =
  'Аналіз PSA – скринінг раку передміхурової залози. Що показує і чого не показує, що кажуть USPSTF і Mayo Clinic і чому рішення про аналіз ухвалюють разом з лікарем.';

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  robots: { index: true, follow: true },
  alternates: { canonical: PAGE_URL },
  openGraph: { title: TITLE, description: DESCRIPTION, url: PAGE_URL, type: 'website' },
};

/* Джерела: [n] у тексті → пункт n */
const SOURCES = [
  'МОЗ України. Наказ №1368 від 05.08.2024: порядки скринінгу і ранньої діагностики раку молочної залози, раку шийки матки і колоректального раку.',
  'USPSTF. Prostate Cancer: Screening.',
  'Mayo Clinic Family Health Book, 5th Edition.',
  'Duodecim, guidelines.moz.gov.ua. Настанова ebm00247 (рак передміхурової залози).',
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

export default function ScreeningPsaPage() {
  const jsonLd: object[] = [
    {
      '@context': 'https://schema.org',
      '@type': 'MedicalWebPage',
      name: H1,
      url: PAGE_URL,
      about: { '@type': 'MedicalTest', name: 'Аналіз PSA (скринінг раку передміхурової залози)' },
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
        { '@type': 'ListItem', position: 2, name: 'Аналіз PSA', item: PAGE_URL },
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
              <span className="text-gray-700">Аналіз PSA</span>
            </nav>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#005485] mb-6">Довідник обстежень</p>
            <h1
              className="font-bold leading-tight mb-6"
              style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 'clamp(32px, 5.5vw, 64px)' }}
            >
              {H1}
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
        <H2>Що показує аналіз PSA</H2>
        <p className={P}>
          PSA – простат-специфічний антиген. Аналіз PSA використовують для скринінгу раку передміхурової залози:
          перевірки чоловіків без скарг<S n={[2, 3]} />.
        </p>
        <p className={P}>
          Аналіз PSA часто сприймають як обов&apos;язкову частину чоловічого чекапу. Це не так: міжнародні
          рекомендації пропонують його як рішення, яке чоловік ухвалює разом з лікарем, після розмови про користь і
          шкоду<S n={[2]} />.
        </p>
        <p className={P}>
          В Україні державного скринінгу раку передміхурової залози немає. Наказ МОЗ №1368 описує скринінг трьох
          видів раку: молочної залози, шийки матки і колоректального<S n={[1]} />. Уніфікованого клінічного протоколу
          МОЗ з профілактики раку передміхурової залози теж немає; українське джерело – адаптована настанова
          Duodecim<S n={[4]} />.
        </p>
      </Section>

      {/* what_not_shows */}
      <Section bg={BG_GRAY} eyebrow="Межі методу">
        <H2>Чого аналіз PSA не показує</H2>
        <p className={P}>
          Головна проблема скринінгу PSA – рак передміхурової залози часто розвивається повільно, тому аналіз
          знаходить і такі форми, які не спричинили б проблем. Через це частина чоловіків проходить операцію або
          опромінення, які їм не були потрібні<S n={[3]} />.
        </p>
        <p className={P}>
          Доказова межа: за даними довідника Mayo Clinic, жодне дослідження не показало, що аналіз PSA знижує ризик
          смерті від раку передміхурової залози<S n={[3]} />.
        </p>
      </Section>

      {/* when_justified */}
      <Section bg={BG_WHITE} eyebrow="Вік і рішення">
        <H2>Коли аналіз PSA обґрунтований</H2>
        <p className={P}>
          Відповідь залежить від віку і від того, як ви самі зважуєте користь і шкоду. Автоматично, без розмови з
          лікарем, аналіз PSA не призначають.
        </p>
        <p className={P}>
          USPSTF пропонує чоловікам 55–69 років аналіз PSA як спільне рішення пацієнта і лікаря<S n={[2]} />.
        </p>
        <p className={P}>
          Mayo Clinic окремо описує загальний консенсус і власну позицію<S n={[3]} />. Урологи Mayo Clinic
          підтримують щорічний аналіз PSA з 50 років, визнаючи недосконалість тесту<S n={[3]} />. Після 75 років, за
          Mayo Clinic, достатньо щорічного пальцевого огляду<S n={[3]} />.
        </p>
        <p className={P}>
          Тобто джерела розходяться у віці початку: 50 років у позиції урологів Mayo Clinic, 55 років у USPSTF. З
          якого віку і чи взагалі робити аналіз вам, обговоріть з лікарем.
        </p>
        <p className={P}>
          Перед рішенням обговоріть з лікарем, що ви робитимете з результатом. Якщо жоден результат нічого не
          змінить у ваших діях, це підстава обговорити, чи потрібен аналіз зараз.
        </p>
        <p className={P}>
          Скринінг не замінює огляду зі скаргами. Якщо є скарги, це вже не скринінг, і обстеження визначає лікар.
        </p>
      </Section>

      {/* affects_result */}
      <Section bg={BG_GRAY} eyebrow="Точність аналізу">
        <H2>Що впливає на результат</H2>
        <p className={P}>
          Джерела, на які спирається ця сторінка, чинників, що впливають на рівень PSA, не описують. Запитайте про них
          лікаря, який призначає аналіз.
        </p>
      </Section>

      {/* preparation */}
      <Section bg={BG_WHITE} eyebrow="Перед візитом">
        <H2>Як підготуватися</H2>
        <p className={P}>
          Окремої підготовки до аналізу джерела цієї сторінки не описують. Головна підготовка – розмова з лікарем
          до аналізу: навіщо він вам, що буде при підвищеному результаті і які можливі наслідки подальших кроків.
        </p>
        <p className={P}>
          Якщо аналіз уже робили, скажіть лікарю дату і результат попереднього.
        </p>
      </Section>

      {/* how_we_know */}
      <Section bg={BG_GRAY} eyebrow="Методологія">
        <H2>Як ми це знаємо</H2>
        <p className={P}>
          Текст побудований на джерелах у такому порядку: спочатку документи МОЗ України, потім міжнародні
          рекомендації і настанови. Формулювання наші, цитат немає. Число з джерела наводиться з номером джерела, а
          якщо перевіреного числа немає, ми не наводимо приблизного. Розбіжності між джерелами названі в тексті, не
          приховані.
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
