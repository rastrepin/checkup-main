import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/frame/Header'
import Hero from '@/components/frame/Hero'
import { ButtonLink } from '@/components/frame/Button';
import AccordionSection from '@/components/shared/AccordionSection';
import OffersArea from '@/components/hub-diagnosis/OffersArea';
import { fetchProlapsOffers } from '@/lib/hub/prolaps-offers';
import { GEO_BLOCKS, HUB_URL, OFFERS_ANCHOR } from '@/lib/hub/prolaps-content';

// Хаб діагнозу платформи (тип 1): опущення матки і піхви (пролапс), реліз 1.
// Контент: content/hub/prolaps-tazovykh-orhaniv.md (v3.1) дослівно. Примітки «> …» з MD не рендеряться.
// Інформаційна частина – без імен лікарів і клінік, без цін. Лікарі, клініки і посилання на сторінки
// операцій – лише в області пропозицій (розділ 6), дані карток – з реєстру (Supabase).
// Індексується з 17.10.2026 (реліз після перевірки редактором на проді). Верстка – за app/ukr/screening/*.

export const revalidate = 3600;

const BORDER = '1px solid #e8edf3';
const BG_GRAY = '#f8fafc';
const BG_WHITE = '#ffffff';
const UPDATED_ISO = '2026-10-17';
// Дати оновити в день релізу (дата публікації і дата останньої зміни видимого тексту).
const PUBLISHED_LABEL = '17.10.2026';
const UPDATED_LABEL = '17.10.2026';

const TITLE = 'Опущення матки (пролапс): симптоми, лікування і лікарі | check-up.in.ua';
const H1_MAIN = 'Опущення матки і піхви';
const H1_EM = '(пролапс тазових органів)';
const H1 = `${H1_MAIN} ${H1_EM}`;
const DESCRIPTION =
  'Яку операцію обрати при опущенні матки: лапароскопічну чи через піхву? Від чого залежить вибір і до якого лікаря звернутися в Києві, Харкові, Миколаєві.';

// Рецензент (v3.1, розділ 9): лікар погодив 17.10. ПІБ і регалії – з реєстру через formatDoctorName і
// formatRegalia (картка пропозиції bondaruk-volodymyr). Немає даних у реєстрі – рядок не рендериться.
const REVIEWER_SLUG = 'bondaruk-volodymyr';
const REVIEWER_URL = 'https://bondaruk.check-up.in.ua/';
const REVIEWED_ISO = '2026-10-17';
const REVIEWER_DISCLOSURE = 'Рецензент сторінки є одним із лікарів, до яких можна записатися через неї.';

/** Регалії в середині рядка – з малої літери («…, лікар вищої категорії»). */
const lcFirst = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  robots: { index: true, follow: true },
  alternates: { canonical: HUB_URL },
  openGraph: { title: TITLE, description: DESCRIPTION, url: HUB_URL, type: 'website' },
  twitter: { card: 'summary', title: TITLE, description: DESCRIPTION },
};

/* Джерела. Номер n = маркер [n] у тексті. */
const SOURCE_LEAD = {
  text: "Міністерство охорони здоров'я України. Настанова 00552. Генітальний пролапс (адаптація настанови DUODECIM з коментарями експертів МОЗ). Оновлено 10.08.2017.",
  url: 'https://guidelines.moz.gov.ua/documents/3382',
};
const SOURCES: { text: string; url: string }[] = [
  {
    text: 'Hadizadeh-Talasaz Z, Khadivzadeh T, Mohajeri T, Sadeghi M. Worldwide Prevalence of Pelvic Organ Prolapse: A Systematic Review and Meta-Analysis. Iranian Journal of Public Health. 2024;53(3):524–538. DOI 10.18502/ijph.v53i3.15134',
    url: 'https://doi.org/10.18502/ijph.v53i3.15134',
  },
  {
    text: 'Bump RC, Mattiasson A, Bø K, Brubaker LP, DeLancey JOL, Klarskov P, Shull BL, Smith ARB. The standardization of terminology of female pelvic organ prolapse and pelvic floor dysfunction. American Journal of Obstetrics and Gynecology. 1996;175(1):10–17',
    url: 'https://doi.org/10.1016/S0002-9378(96)70243-0',
  },
  {
    text: 'National Institute for Health and Care Excellence (NICE). Urinary incontinence and pelvic organ prolapse in women: management. NICE guideline NG123. 2019',
    url: 'https://www.nice.org.uk/guidance/ng123',
  },
  {
    text: 'Fitri AN, Kurniawati EM, Wiyasihati SI, Wungu CDK. Risk factors of stress urinary incontinence in pelvic organ prolapse patients: a systematic review and meta-analysis. African Journal of Urology. 2023;29:53. DOI 10.1186/s12301-023-00383-1',
    url: 'https://doi.org/10.1186/s12301-023-00383-1',
  },
  {
    text: "U.S. Food and Drug Administration. FDA takes action to protect women's health, orders manufacturers of surgical mesh intended for transvaginal repair of pelvic organ prolapse to stop selling all devices. Press release, 16 April 2019",
    url: 'https://www.fda.gov/news-events/press-announcements/fda-takes-action-protect-womens-health-orders-manufacturers-surgical-mesh-intended-transvaginal',
  },
];
const SOURCES_MORE: { text: string; url: string }[] = [
  {
    text: 'Mayo Clinic. Uterine prolapse: Symptoms and causes',
    url: 'https://www.mayoclinic.org/diseases-conditions/uterine-prolapse/symptoms-causes/syc-20353458',
  },
  { text: 'NHS. Pelvic organ prolapse', url: 'https://www.nhs.uk/conditions/pelvic-organ-prolapse/' },
  {
    text: 'Tasmanian Health. Pelvic organ prolapse: outpatient referral criteria',
    url: 'https://outpatients.tas.gov.au/clinics/gynaecology/pelvic_organ_prolapse',
  },
];

/** Маркер джерела [n]: веде на пункт списку «Джерела». */
function S({ n }: { n: number }) {
  return (
    <a href={`#source-${n}`} data-source-ref className="text-[#005485] hover:underline whitespace-nowrap">
      [{n}]
    </a>
  );
}

// Список джерел згорнутий (<details>): маркер відкриває його перед переходом до пункту.
const OPEN_SOURCES_SCRIPT = `(function(){if(window.__hubSourcesRef)return;window.__hubSourcesRef=true;document.addEventListener('click',function(e){var a=e.target&&e.target.closest&&e.target.closest('a[data-source-ref]');if(!a)return;var t=document.querySelector(a.getAttribute('href'));var d=t&&t.closest('details');if(d)d.open=true;});})();`;

/* Часті питання (розділ 8). Текст відповіді – масив фрагментів: рядок або маркер джерела. */
type Part = string | { s: number };
const FAQ: { q: string; a: Part[] }[] = [
  {
    q: 'Що робити, якщо опустилася матка?',
    a: [
      "Запишіться на огляд до гінеколога. Лікар визначить стадію опущення і з'ясує, наскільки воно вам заважає. Якщо опущення не турбує, досить спостерігатися. Якщо симптоми є, зазвичай починають з вправ для м'язів тазового дна або песарія. Операцію обговорюють, якщо вони не допомогли або ви не хочете лікуватися без операції ",
      { s: 3 },
      ". Якщо не вдається помочитися або на випинанні з'явилася виразка, зверніться до лікаря терміново.",
    ],
  },
  {
    q: 'Чи можна не лікувати опущення матки?',
    a: [
      "Якщо опущення не турбує, лікувати його не обов'язково. Досить спостерігатися в гінеколога ",
      { s: 3 },
      '. Якщо симптоми є, огляд краще не відкладати. Лікування без операції, наприклад вправи для м\'язів тазового дна, радять насамперед при I–II стадії ',
      { s: 3 },
      ". Якщо не вдається помочитися або на випинанні з'явилася виразка, зверніться до лікаря терміново.",
    ],
  },
  {
    q: 'Чи може опущення повернутися після операції?',
    a: [
      'Так, опущення може повернутися після будь-якої операції, у тому самому місці або в іншому відділі. Ризик залежить від виду операції, стадії опущення і стану тканин. Перед операцією лікар має пояснити, які переваги і ризики має саме запропонований метод, зокрема ризик повторного опущення ',
      { s: 3 },
      '.',
    ],
  },
  {
    q: 'Чи безпечно ставити сітку при опущенні матки?',
    a: [
      "Відповідь залежить від того, як встановлюють сітку. У 2019 році FDA, американський регулятор, зобов'язало виробників припинити продаж сіток для корекції опущення через піхву ",
      { s: 5 },
      '. При лапароскопічній операції сітку встановлюють через проколи на животі. Британський інститут клінічних настанов NICE розглядає такі операції як один із варіантів лікування ',
      { s: 3 },
      '. Кольпорафію виконують без сітки. Перед операцією запитайте лікаря, чи буде сітка, як її встановлять і які можливі ускладнення.',
    ],
  },
  {
    q: 'Чи можлива вагітність після операції?',
    a: [
      'Плани на вагітність впливають на вибір лікування, тому скажіть про них лікарю до рішення про операцію ',
      { s: 3 },
      '. Чи можлива вагітність після конкретної операції і як тоді народжувати, лікар пояснює окремо для обраного методу.',
    ],
  },
  {
    q: 'Що взяти на консультацію до гінеколога?',
    a: [
      'Візьміть висновки попередніх оглядів і результати обстежень, якщо вони є, а також список ліків, які приймаєте. Якщо раніше були операції на органах таза, візьміть виписки. Заздалегідь запишіть, що вас турбує і коли відчуття сильніші.',
    ],
  },
];

const faqPlain = (a: Part[]) => a.map((p) => (typeof p === 'string' ? p : `[${p.s}]`)).join('');

function Eyebrow({ children }: { children: string }) {
  return <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#005485] mb-[var(--space-eyebrow)]">{children}</p>;
}

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-bold text-[#0b1a24]" style={{ fontSize: 'clamp(22px, 3vw, 30px)', lineHeight: 1.25 }}>
      {children}
    </h2>
  );
}

function H3({ children }: { children: React.ReactNode }) {
  return <h3 className="text-[19px] font-bold text-[#0b1a24] leading-snug mt-10">{children}</h3>;
}

function Section({
  bg,
  wide = false,
  id,
  children,
}: {
  bg: string;
  wide?: boolean;
  id?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-6" style={{ backgroundColor: bg, borderTop: BORDER }}>
      <div className="max-w-[1200px] mx-auto px-[var(--space-gutter)] py-[var(--space-section)]">
        <div className={wide ? '' : 'max-w-3xl'}>{children}</div>
      </div>
    </section>
  );
}

function Ul({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="mt-4 space-y-2 list-disc pl-6 text-gray-700 leading-relaxed marker:text-[#005485]">
      {items.map((it, i) => (
        <li key={i}>{it}</li>
      ))}
    </ul>
  );
}

const P = 'text-gray-700 leading-relaxed mt-4';

export default async function ProlapsHubPage() {
  const offers = await fetchProlapsOffers();
  const reviewer = offers.find((o) => o.doctorSlug === REVIEWER_SLUG) ?? null;

  const jsonLd: object[] = [
    {
      '@context': 'https://schema.org',
      '@type': 'MedicalWebPage',
      name: H1,
      url: HUB_URL,
      mainEntity: {
        '@type': 'MedicalCondition',
        name: 'Пролапс тазових органів',
        alternateName: ['Опущення матки', 'Опущення піхви', 'Генітальний пролапс'],
        code: { '@type': 'MedicalCode', codingSystem: 'ICD-10', codeValue: 'N81' },
      },
      dateModified: UPDATED_ISO,
      ...(reviewer
        ? { lastReviewed: REVIEWED_ISO, reviewedBy: { '@type': 'Physician', name: reviewer.fullName, url: REVIEWER_URL } }
        : {}),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: FAQ.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: faqPlain(f.a) },
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'check-up.in.ua', item: 'https://check-up.in.ua' },
        { '@type': 'ListItem', position: 2, name: 'Опущення матки і піхви', item: HUB_URL },
      ],
    },
  ];

  return (
    <>
      <Header city={null} tone="light" />
      <main className="text-[#0b1a24]">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <script dangerouslySetInnerHTML={{ __html: OPEN_SOURCES_SCRIPT }} />

        {/* 1. Hero */}
        <Hero
          tone="light"
          breadcrumbs={
            <nav aria-label="Breadcrumb">
                <Link href="/" className="hover:underline">
                  check-up.in.ua
                </Link>
                <span className="mx-1.5">/</span>
                <span aria-current="page">Опущення матки і піхви</span>
              </nav>
          }
          eyebrow="ГІНЕКОЛОГІЯ · ТАЗОВЕ ДНО"
          h1Size="clamp(30px, 4.6vw, 52px)"
          h1={<>{H1_MAIN} <em className="italic font-semibold text-[var(--hero-decor-light)]">{H1_EM}</em></>}
          lead={<p>
                Відчуття кульки чи тиску в піхві може бути ознакою опущення матки або стінок піхви. Лікарі називають
                цей стан пролапсом тазових органів. Він не загрожує життю і лікується, не завжди операцією. Почніть з
                огляду в гінеколога. Лікар визначить стадію опущення і разом з вами обере спосіб лікування.
              </p>}
          cta={
            <ButtonLink href={`#${OFFERS_ANCHOR}`} variant="booking" size="lg">
              Обрати лікаря
            </ButtonLink>
          }
        />

        {/* 2. Чи це опущення */}
        <Section bg={BG_WHITE}>
          <H2>Симптоми опущення матки і піхви</H2>
          <p className={P}>
            На ранній стадії опущення може зовсім не турбувати. Коли органи опускаються нижче, з&apos;являються такі
            ознаки:
          </p>
          <Ul
            items={[
              'відчуття кульки, тиску чи важкості в піхві;',
              'випинання біля входу в піхву, яке видно або можна намацати;',
              'підтікання сечі під час кашлю, чхання чи фізичного навантаження;',
              'відчуття, що сечовий міхур спорожнюється не до кінця;',
              'труднощі зі спорожненням кишківника;',
              'дискомфорт під час статевого життя.',
            ]}
          />
          <p className={P}>Увечері ці відчуття зазвичай сильніші, ніж зранку.</p>
          <p className={P}>
            Опущення трапляється приблизно в третини жінок <S n={1} />. Соромитися цих відчуттів не потрібно. Скажіть
            про них гінекологу прямо.
          </p>
          <p className={P}>
            Запишіться на огляд, якщо помітили хоча б одну з цих ознак. Чекати, поки стане гірше, не потрібно. Стадію
            опущення визначає лише огляд. Схожі відчуття бувають і при інших станах, тому висновок робить лікар.
          </p>
          <div className="mt-10 bg-[#fff4e5] border border-[#f5d9a8] rounded-[10px] px-5 py-5">
            <h3 className="text-[19px] font-bold text-[#0b1a24] leading-snug">Коли звернутися терміново</h3>
            <p className="text-gray-700 leading-relaxed mt-3">
              Зверніться до лікаря терміново, не чекаючи планового запису, якщо:
            </p>
            <Ul items={['не вдається помочитися;', "на випинанні з'явилася виразка (ранка)."]} />
          </div>
        </Section>

        {/* 3. Що буде на огляді */}
        <Section bg={BG_GRAY}>
          <H2>Огляд і діагностика</H2>
          <p className={P}>
            Лікар розпитає, що саме вас турбує і як це заважає в звичному житті. Також запитає про пологи, перенесені
            операції та хронічні хвороби. Відчуття зручно записати заздалегідь: які вони і коли сильніші.
          </p>
          <p className={P}>
            Огляд проводять на гінекологічному кріслі. Лікар попросить покашляти або напружитися. Так видно,
            наскільки опускаються органи. Іноді оглядають і стоячи. Також лікар перевіряє, як працюють м&apos;язи
            тазового дна.
          </p>
          <H3>Стадії (ступені) опущення</H3>
          <p className={P}>
            Стадію визначають за тим, наскільки низько опустилася матка чи стінка піхви. Орієнтиром є вхід у піхву{' '}
            <S n={2} />.
          </p>
          <Ul
            items={[
              '0: опущення немає;',
              'I: опущення є, але до входу в піхву лишається більше ніж 1 см;',
              'II: органи опустилися до входу в піхву, в межах 1 см вище чи нижче;',
              'III: органи виходять за вхід у піхву більше ніж на 1 см, але не повністю;',
              'IV: матка або піхва повністю виходять назовні.',
            ]}
          />
          <p className={P}>Стадія не визначає лікування сама по собі. Так само важить, наскільки опущення заважає вам.</p>
          <H3>Додаткові обстеження</H3>
          <p className={P}>
            Часто для діагнозу достатньо огляду <S n={3} />. За потреби лікар призначає:
          </p>
          <Ul
            items={[
              'аналіз сечі, якщо є скарги на сечовипускання;',
              'уродинамічне дослідження, якщо є підтікання сечі і розглядають операцію. Воно показує, як сечовий міхур наповнюється і спорожнюється.',
            ]}
          />
        </Section>

        {/* 4. Без операції чи операція */}
        <Section bg={BG_WHITE}>
          <H2>Методи лікування</H2>
          <p className={P}>
            Якщо опущення не турбує, лікувати його не обов&apos;язково. Досить спостерігатися в гінеколога <S n={3} />. Якщо з&apos;являться нові відчуття
            або наявні посиляться, скажіть про це гінекологу. Тоді ви разом обговорите лікування.
          </p>
          <H3>Консервативне лікування</H3>
          <p className={P}>Якщо симптоми є, лікування зазвичай починають без операції. Таке лікування називають консервативним. Лікар
            може запропонувати:</p>
          <Ul
            items={[
              <>
                вправи для м&apos;язів тазового дна щонайменше 16 тижнів, краще під наглядом фахівця <S n={3} />;
              </>,
              'песарій, тобто спеціальний виріб, найчастіше у формі кільця, який вводять у піхву, щоб підтримувати органи;',
              'зміну звичок, наприклад схуднути за надмірної ваги, менше піднімати важке, лікувати закрепи.',
            ]}
          />
          <p className={P}>Вправи радять насамперед при I–II стадії.</p>
          <H3>Коли потрібна операція</H3>
          <p className={P}>
            Операцію обговорюють, якщо опущення заважає жити і <S n={3} />:
          </p>
          <Ul
            items={[
              'вправи не допомогли;',
              'песарій не допоміг або створює суттєві незручності;',
              'ви не хочете лікуватися без операції.',
            ]}
          />
          <p className={P}>Яку операцію запропонують, залежить від того, що саме опустилося і що важливо для вас.</p>
        </Section>

        {/* 5. Яка операція підходить */}
        <Section bg={BG_GRAY}>
          <H2>Операції при опущенні матки і піхви</H2>
          <p className={P}>
            Спосіб операції лікар обирає разом з вами. Лікар зважає на таке <S n={3} />:
          </p>
          <Ul
            items={[
              'що саме опустилося (матка, передня чи задня стінка піхви, верхня частина піхви після видалення матки);',
              'чи хочете ви зберегти матку і чи плануєте вагітність;',
              'чи важливе для вас статеве життя;',
              'вік, загальний стан і супутні хвороби.',
            ]}
          />
          <H3>Лапароскопічне лікування опущення матки і піхви</H3>
          <p className={P}>
            Розглядають, якщо опустилася матка або верхня частина піхви. Через невеликі проколи на животі органи
            підтягують і закріплюють сітчастим імплантатом.
          </p>
          <H3>Кольпорафія, пластика стінок піхви</H3>
          <p className={P}>
            Розглядають, якщо разом зі стінкою піхви опустився сечовий міхур або пряма кишка. Стінку відновлюють через
            піхву, сітку не використовують.
          </p>
          <H3>Вагінальна фіксація матки і купола піхви</H3>
          <p className={P}>
            Ще один варіант при опущенні матки чи верхньої частини піхви. Органи закріплюють до зв&apos;язок таза через
            піхву, без проколів на животі.
          </p>
          <H3>Опущення і нетримання сечі</H3>
          <p className={P}>
            Підтікання сечі під час кашлю чи навантаження буває в третини–половини жінок з опущенням <S n={4} />. Тоді
            разом з операцією або окремо можуть розглянути слінгову операцію. Під час неї сечівник підтримують тонкою
            стрічкою. Слінгова операція лікує нетримання сечі, опущення вона не усуває.
          </p>
          <p className={P}>Яку саме операцію провести, вирішують на консультації в оперуючого гінеколога.</p>
        </Section>

        {/* 6. Обрати лікаря і місто + GEO-блоки */}
        <Section bg={BG_WHITE} wide id={OFFERS_ANCHOR}>
          <H2>Де лікують опущення матки і піхви</H2>
          <p className={`${P} max-w-3xl`}>
            Лікарі та клініки, які лікують опущення матки і піхви. Оберіть своє місто і запишіться на консультацію.
          </p>
          <OffersArea offers={offers} />

          <div className="max-w-3xl mt-12 space-y-8">
            {GEO_BLOCKS.map((g) => (
              <div key={g.city}>
                <h3 className="text-[19px] font-bold text-[#0b1a24] leading-snug">{g.title}</h3>
                <p className={P}>{g.text}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* 7. Що далі */}
        <Section bg={BG_GRAY}>
          <H2>Що далі</H2>
          <p className={P}>
            Підготовку до операції, строки відновлення і вартість лікар пояснить на консультації. Детальніше про кожну
            операцію написано на сторінках операцій у картках лікарів.
          </p>
        </Section>

        {/* 8. Часті питання: згорнуто, текст відповідей у серверному HTML */}
        <Section bg={BG_WHITE}>
          <H2>Часті запитання</H2>
          <ul className="mt-6 space-y-3 list-none">
            {FAQ.map((f) => (
              <li key={f.q} className="border border-[#e8edf3] rounded-[10px] px-5 py-3">
                <AccordionSection summary={f.q}>
                  <p className="text-[15px] text-gray-700 leading-relaxed pb-2">
                    {f.a.map((p, i) => (typeof p === 'string' ? p : <S key={i} n={p.s} />))}
                  </p>
                </AccordionSection>
              </li>
            ))}
          </ul>
        </Section>

        {/* 9. Автор, рецензент, джерела */}
        <section style={{ backgroundColor: BG_GRAY, borderTop: BORDER }}>
          <div className="max-w-[1200px] mx-auto px-[var(--space-gutter)] py-[var(--space-section)]">
            <div className="max-w-3xl text-[#374151] leading-relaxed space-y-3">
              <p className="text-[15px]">
                <span className="font-semibold text-[#0b1a24]">Автор:</span> Ігор Растрепін, засновник check-up.in.ua
              </p>
              {reviewer && (
                <>
                  <p className="text-[15px]">
                    <span className="font-semibold text-[#0b1a24]">Медичний рецензент:</span> {reviewer.fullName}
                    {reviewer.level ? `, ${lcFirst(reviewer.level)}` : ''}
                  </p>
                  <p className="text-sm text-gray-500">{REVIEWER_DISCLOSURE}</p>
                </>
              )}
              <p className="text-[13px] text-gray-500">
                Опубліковано: {PUBLISHED_LABEL} · Оновлено: {UPDATED_LABEL}
              </p>
              <p className="text-sm text-gray-500">
                check-up.in.ua є медичним маркетплейсом. Ми отримуємо комісію від клінік і лікарів-партнерів. Це не впливає
                на медичний зміст сторінки.
              </p>
              <p className="text-sm text-gray-500">
                Уніфікованого клінічного протоколу МОЗ України з лікування опущення матки і піхви (пролапсу тазових
                органів) немає. Сторінка спирається на настанову МОЗ 00552 «Генітальний пролапс» і міжнародні настанови
                та дослідження.
              </p>
              <p className="text-sm text-gray-500">
                Сторінка є інформаційним матеріалом і не замінює консультацію лікаря. Спосіб лікування визначають після
                огляду.
              </p>

              <AccordionSection summary="Джерела" className="pt-3">
                <div className="text-sm text-gray-600 leading-relaxed space-y-3">
                  <p>
                    <a href={SOURCE_LEAD.url} target="_blank" rel="noopener" className="text-[#005485] underline hover:no-underline">
                      {SOURCE_LEAD.text}
                    </a>
                  </p>
                  <ol className="space-y-3 list-none">
                    {SOURCES.map((s, i) => (
                      <li key={s.url} id={`source-${i + 1}`} className="flex gap-3 scroll-mt-24">
                        <span className="font-semibold text-[#0b1a24] shrink-0">{i + 1}.</span>
                        <a href={s.url} target="_blank" rel="noopener" className="text-[#005485] underline hover:no-underline">
                          {s.text}
                        </a>
                      </li>
                    ))}
                  </ol>
                  <p className="font-semibold text-[#0b1a24] pt-2">Також використано</p>
                  <ul className="space-y-2 list-none">
                    {SOURCES_MORE.map((s) => (
                      <li key={s.url}>
                        <a href={s.url} target="_blank" rel="noopener" className="text-[#005485] underline hover:no-underline">
                          {s.text}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </AccordionSection>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
