import type { Metadata } from 'next';
import Header from '@/components/frame/Header';
import SiteFooter from '@/components/frame/SiteFooter';
import { GOOGLE_PROFILE, googleRatingText } from '@/lib/config/google-profile';
import { jetbrainsMono, onest, unbounded } from './fonts';
import AboutTabs from './AboutTabs';
import s from './about.module.css';

// Сторінка «Про сервіс» /ukr/about – замінює сторінку Tilda. Вигляд і текст – погоджений прототип (21.11.2026), дослівно.
// Форм, запису і заявок на сторінці немає. Обидві вкладки – у серверному HTML (неактивна з атрибутом hidden).

const SITE = 'https://check-up.in.ua';
const URL = `${SITE}/ukr/about`;
const TITLE = 'Про check-up.in.ua – хто веде проект і як він працює';
const DESCRIPTION =
  'Ігор Растрепін, засновник check-up.in.ua: записую людей на чекапи з 2019 року, у 14 містах України. Я не лікар, check-up.in.ua не клініка.';
const PHOTO = '/assets/about/ihor-rastrepin.jpg';
const UPDATED = '2026-11-19';

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  robots: { index: true, follow: true },
  alternates: { canonical: URL },
  openGraph: { title: TITLE, description: DESCRIPTION, url: URL, locale: 'uk_UA', type: 'website' },
};

const ORG_ID = `${SITE}/#organization`;
const PERSON_ID = `${URL}#ihor-rastrepin`;

const JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'AboutPage',
      '@id': `${URL}#webpage`,
      url: URL,
      name: TITLE,
      inLanguage: 'uk',
      dateModified: UPDATED,
      about: { '@id': ORG_ID },
      mainEntity: { '@id': ORG_ID },
    },
    {
      '@type': 'Organization',
      '@id': ORG_ID,
      name: 'check-up.in.ua',
      alternateName: 'Check-Up Центр',
      url: `${SITE}/ukr`,
      logo: `${SITE}/brand/logo-checkup.svg`,
      founder: { '@id': PERSON_ID },
      foundingDate: '2019',
      areaServed: 'UA',
      sameAs: [GOOGLE_PROFILE.url],
      contactPoint: [
        { '@type': 'ContactPoint', contactType: 'customer support', email: 'info@check-up.in.ua' },
        { '@type': 'ContactPoint', contactType: 'partnerships', email: 'ceo@check-up.in.ua' },
      ],
    },
    {
      '@type': 'Person',
      '@id': PERSON_ID,
      name: 'Ігор Растрепін',
      jobTitle: 'засновник check-up.in.ua',
      worksFor: { '@id': ORG_ID },
      image: `${SITE}${PHOTO}`,
      sameAs: ['https://www.facebook.com/irastrepin'],
    },
  ],
};

const Tick = () => (
  <svg aria-hidden="true" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--navy)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 12.5l5 5L20 6.5" />
  </svg>
);
const Cross = () => (
  <svg aria-hidden="true" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--about-muted)" strokeWidth="2.5" strokeLinecap="round">
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

const WHY = [
  'хочете тримати здоров\'я під контролем і перевірятися за планом',
  'вам виповнилося 40, і ви хочете знати, що перевіряти у вашому віці',
  'у родині хтось захворів, і ви задумалися про себе',
  'плануєте вагітність',
  'живете за кордоном і хочете пройти чекап під час приїзду в Україну',
  'хочете знати, які обстеження справді потрібні, а які ні',
];

const PARTNER_POINTS = [
  'Я беруся за проект, коли закладу потрібен якісний зміст, а не ще одна згадка в інтернеті.',
  'Я переношу в онлайн голос лікаря або керівника закладу. Типових медичних текстів не пишу.',
  'Довіру дає бачення, яке команда закладу втілює щодня. Красиві вигадки її не дають.',
  'Діалог з пацієнтом триває і поза кабінетом. Дистанційно він так само компетентний і відповідальний.',
  'Мій сервіс для закладів, які цінують сервіс і підкріплюють його на місці.',
];

const Patients = (
  <div className={s.patients}>
    <div className={s.two}>
      <div className={s.box}>
        <h3 className={s.boxLabel}>Сервіс для вас, якщо</h3>
        <ul className={s.ticks}>
          <li><Tick /><span>ви свідомо приймаєте рішення про своє здоров'я</span></li>
          <li><Tick /><span>хочете прийти до клініки підготовленими: знати, що перевіряєте і навіщо</span></li>
          <li><Tick /><span>не хочете щоразу наново шукати лікаря, якому можна довіритися</span></li>
        </ul>
      </div>
      <div className={s.box}>
        <h3 className={`${s.boxLabel} ${s.boxLabelMuted}`}>Сервіс не допоможе, якщо</h3>
        <ul className={s.ticks}>
          <li><Cross /><span>вам потрібне МРТ всього тіла «про всяк випадок»</span></li>
          <li><Cross /><span>вам потрібен висновок лікаря без обстежень</span></li>
        </ul>
      </div>
    </div>

    <div className={s.banner}>
      <p>План обстеження належить вам. З ним можна піти в будь-яку клініку.</p>
    </div>

    <div className={s.dos}>
      <div className={s.col}>
        <h3 className={s.colHead}>Що я роблю</h3>
        <div className={s.row}>Що перевіряти, беру з клінічних настанов МОЗ і США та від різних лікарів. Джерело стоїть під кожною рекомендацією.</div>
        <div className={s.row}>Чекап – це не лише програма аналізів. Це зручний графік, відповідний лікар і супровід від клініки. Тут я спираюся на досвід: свій, лікарів з мого кола і людей, які звертаються з 2019 року.</div>
        <div className={s.row}>Показую ціну таку саму, як у клініці.</div>
        <div className={s.row}>Передаю заявку напряму в клініку. Тому відповідь приходить швидше.</div>
        <div className={s.row}>Даю медичний зміст на перевірку лікарю. Його ім'я стоїть під сторінкою.</div>
      </div>
      <div className={s.col}>
        <h3 className={`${s.colHead} ${s.colHeadDark}`}>Чого я не роблю</h3>
        <div className={s.row}>Не призначаю обстежень і не лікую. Повний перелік визначає лікар на консультації.</div>
        <div className={s.row}>Не зберігаю результатів обстежень.</div>
        <div className={s.row}>Не передаю ваші дані нікому, крім клініки, яку ви обрали.</div>
        <div className={s.row}>Не лякаю, щоб продати обстеження.</div>
      </div>
    </div>

    <div className={s.how}>
      <div className={s.howLabel}>Як записатися</div>
      <div className={s.howText}>Записатися тут не складніше, ніж зробити переказ у зручному банку чи написати в месенджер.</div>
    </div>
  </div>
);

const Partners = (
  <div className={s.dark}>
    <div className={s.darkBlock}>
      <h3 className={s.h3}>З ким я працюю</h3>
      <div className={s.nums}>
        {PARTNER_POINTS.map((t, i) => (
          <div key={t} className={s.num}>
            <span className={s.numN}>{String(i + 1).padStart(2, '0')}</span>
            <span>{t}</span>
          </div>
        ))}
      </div>
    </div>

    <div className={s.darkBlock}>
      <h3 className={s.h3}>Як влаштована робота</h3>
      <div className={s.steps}>
        <div className={s.step}><div className={s.stepLabel}>Пацієнти</div><div>Я залучаю пацієнтів, яких ми разом хочемо втримати і підтримувати. Вони приходять підготовленими.</div></div>
        <div className={s.step}><div className={s.stepLabel}>Заявки</div><div>Заявка приходить автоматично, напряму у ваш канал. Пацієнт швидше отримує відповідь.</div></div>
        <div className={s.step}><div className={s.stepLabel}>Ціна</div><div>Ціну для пацієнта визначає ваш прайс. Я нічого до неї не додаю.</div></div>
      </div>
    </div>

    <div className={s.doctor}>
      <h3>Якщо ви самозайнятий лікар</h3>
      <div className={s.doctorBody}>
        <div>Ви отримуєте власний сайт. Заявки приходять напряму вам, у ваш месенджер.</div>
        <div>На сайті стоять усі місця, де ви приймаєте, навіть якщо це різні клініки.</div>
      </div>
    </div>

    <div className={s.write}>
      <div className={s.writeText}>Якщо прочитане вам близьке, напишіть мені.</div>
      <div className={s.writeAct}>
        <a href="mailto:ceo@check-up.in.ua" className={s.mailBtn}>Написати мені</a>
        <span className={s.mail}>ceo@check-up.in.ua</span>
      </div>
    </div>
  </div>
);

export default function AboutPage() {
  const { rating, reviews, url: googleUrl } = GOOGLE_PROFILE;
  return (
    <>
      <Header city={null} tone="light" section="about" />
      <main className={`${s.page} ${unbounded.variable} ${onest.variable} ${jetbrainsMono.variable}`}>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />

        <section className={s.hero}>
          <div className={s.heroMain}>
            <div className={s.eyebrow}>01 · Про check-up.in.ua</div>
            <h1 className={s.h1}>Я записую людей на чекапи.</h1>
            <p className={s.lead}>Це місце я створив для тих, хто не хоче розбиратися в системі й набивати шишки. Для тих, хто хоче просто пройти чекап.</p>
            <p className={s.p}>Система охорони здоров'я створювалася не для здорових людей і не для чекапів. Я допомагаю пройти чекап без невиправданих очікувань.</p>
            <p className={s.p}>Мене звати Ігор Растрепін, я не лікар. check-up.in.ua не клініка. Клініка показує, що в неї є. Тут ви починаєте з того, що потрібно вам.</p>
            <div className={s.stamps}>
              <div className={`${s.stamp} ${s.stamp1}`}>Не лікар</div>
              <div className={`${s.stamp} ${s.stamp2}`}>Не клініка</div>
            </div>
            <p className={s.tagline}>Платформа для свідомого звернення до лікаря</p>
          </div>

          <aside id="ihor-rastrepin" className={s.card}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={PHOTO} alt="Ігор Растрепін" width={640} height={640} className={s.photo} />
            <dl className={s.facts}>
              <div className={s.fact}><dt>Ім'я</dt><dd>Ігор Растрепін</dd></div>
              <div className={s.fact}><dt>Роль</dt><dd>засновник, веду проект сам</dd></div>
              <div className={s.fact}><dt>Працюю</dt><dd>з 2019 року, у 14 містах України</dd></div>
            </dl>
          </aside>
        </section>

        <section className={s.band}>
          <div className={`${s.wrap} ${s.why}`}>
            <div className={s.whyHead}>
              <div className={s.eyebrow}>02 · Чому люди приходять</div>
              <h2 className={s.h2}>Ви тут, тому що</h2>
            </div>
            <div className={s.whyBody}>
              <ul className={s.whyList}>
                {WHY.map((t) => <li key={t}>{t}</li>)}
              </ul>
              <p className={s.accent}>Я це розумію. Я роблю це з 2019 року.</p>
            </div>
          </div>
        </section>

        <section className={`${s.wrap} ${s.audience}`}>
          <div className={s.eyebrow}>03 · Для кого цей сервіс</div>
          <AboutTabs patients={Patients} partners={Partners} />
        </section>

        <section className={s.band}>
          <div className={`${s.wrap} ${s.history}`}>
            <div className={s.eyebrow}>04 · Історія</div>
            <h2 className={s.h2}>Як розвивався проект</h2>
            <p className={s.histLead}>До 2019 року я працював у діджитал і робив проекти для медичних та аптечних платформ.</p>
            <div className={s.stages}>
              <div className={s.stage}>
                <div className={s.stageTop}><div className={s.stageLabel}>Етап 1 · 2019–2020</div><div aria-hidden="true" className={s.stageNum}>1</div></div>
                <h3 className={s.h3s}>Програми клінік</h3>
                <p>Почав із сайту запису на чекапи для однієї приватної клініки. Другим партнером стала мережа ОН Клінік у Харкові. З нею сайт однієї клініки став платформою для клінік. На сайті були програми, які вже мали клініки.</p>
              </div>
              <div className={s.stage}>
                <div className={s.stageTop}><div className={s.stageLabel}>Етап 2 · 2021–2025</div><div aria-hidden="true" className={s.stageNum}>2</div></div>
                <h3 className={s.h3s}>Власні програми і супровід менеджера</h3>
                <p>Склав власні програми платформи і пояснював їх за стандартами USPSTF. Запис супроводжували менеджери з медичною освітою. Додалися Київ і нові міста, чекапи в Туреччині, запис до лікарів, допомога українцям у Польщі.</p>
              </div>
              <div className={`${s.stage} ${s.stageNow}`}>
                <div className={s.stageTop}><div className={s.stageLabel}>Етап 3 · 2026 · зараз</div><div aria-hidden="true" className={s.stageNum}>3</div></div>
                <h3 className={s.h3s}>«Мій план», напряму в клініку</h3>
                <p>Персональний «Мій план» замість фіксованих програм за віком. Заявка йде автоматично, напряму в клініку, без менеджера. Так відповідь приходить швидше.</p>
                <p>Клінік тепер менше. Я працюю лише з тими, де є відповідний рівень сервісу. Там, де клініка має власну підтримку, допомога менеджера сервісу вже не потрібна.</p>
                <p>Нова платформа. Додалася хірургія.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="rekvizyty" className={`${s.wrap} ${s.req}`}>
          <div className={s.reqGrid}>
            <div className={s.reqCol}>
              <h2 className={s.reqLabel}>05 · Хто платить сервісу</h2>
              <p className={s.reqSmall}>Ви не сплачуєте нічого додаткового. Винагороду мені платить клініка, бо цінує пацієнтів, які приходять підготовленими.</p>
            </div>
            <div className={s.reqCol}>
              <div className={s.reqLabel}>06 · Реквізити</div>
              <div className={s.reqLine}>ФОП Растрепін Ігор Анатолійович, з 12.10.2020</div>
              <div className={s.reqLine}>Пишіть на <a href="mailto:ceo@check-up.in.ua">ceo@check-up.in.ua</a></div>
              {rating != null && reviews != null && (
                <div className={s.reqLine}><a href={googleUrl}>{googleRatingText(rating)} у Google – {reviews} відгуків</a></div>
              )}
              <div className={`${s.reqLine} ${s.reqMuted}`}>Оновлено: 19.11.2026</div>
            </div>
          </div>
          <div className={s.sign}>
            <div className={s.signName}>Ігор Растрепін</div>
            <div className={s.signTag}>check-up.in.ua · не лікар · не клініка</div>
          </div>
        </section>
      </main>
      <SiteFooter city={null} />
    </>
  );
}
