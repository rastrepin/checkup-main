import type { Metadata } from 'next';
import { type ReactNode } from 'react';
import Script from 'next/script';
import Link from 'next/link';

import DescribePainBlock from '@/components/symptom/DescribePainBlock';
import Disclaimer from '@/components/shared/Disclaimer';
import StickyMobileCTA from '@/components/shared/StickyMobileCTA';
import LeadForm from '@/components/shared/LeadForm';

// ─── Metadata ────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: 'Біль під час статевого акту — причини, коли до лікаря, обстеження | check-up.in.ua',
  description:
    'Коли біль під час статевого акту — гінекологічна проблема, а коли — варіант норми. Можливі причини: ендометріоз, інфекції, спайки, вагінізм. Що зробити та коли звернутись.',
  alternates: {
    canonical: 'https://check-up.in.ua/careway/simptomy/bil-pid-chas-statevoho-aktu',
  },
  openGraph: {
    title: 'Біль під час статевого акту — причини, коли до лікаря | check-up.in.ua',
    description:
      'Диспареунія: причини болю під час сексу, коли потрібен лікар, які обстеження. Рецензовано акушером-гінекологом.',
    url: 'https://check-up.in.ua/careway/simptomy/bil-pid-chas-statevoho-aktu',
    locale: 'uk_UA',
    type: 'article',
  },
  robots: {
    index: true,
    follow: true,
  },
};

// ─── Schema.org JSON-LD ──────────────────────────────────────────────────────

const schemaJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'MedicalWebPage',
      '@id': 'https://check-up.in.ua/careway/simptomy/bil-pid-chas-statevoho-aktu#webpage',
      url: 'https://check-up.in.ua/careway/simptomy/bil-pid-chas-statevoho-aktu',
      name: 'Біль під час статевого акту — причини, коли до лікаря, обстеження',
      description:
        'Диспареунія: можливі причини болю під час сексу, коли звертатись до лікаря, які обстеження призначають.',
      dateModified: '2026-04-17',
      inLanguage: 'uk',
      publisher: {
        '@type': 'Organization',
        name: 'check-up.in.ua',
        url: 'https://check-up.in.ua',
      },
      author: {
        '@type': 'Person',
        name: 'Ігор Растрепін',
        jobTitle: 'Медичний редактор check-up.in.ua',
      },
      reviewedBy: {
        '@type': 'Physician',
        name: 'Трохимович Руслана Миколаївна',
        description: 'Акушер-гінеколог, вища категорія, 26 років досвіду',
      },
      about: {
        '@type': 'MedicalCondition',
        name: 'Диспареунія',
        alternateName: 'Dyspareunia',
        relevantSpecialty: 'Obstetrics',
      },
      medicalAudience: {
        '@type': 'MedicalAudience',
        audienceType: 'Patient',
      },
    },
    {
      '@type': 'FAQPage',
      '@id': 'https://check-up.in.ua/careway/simptomy/bil-pid-chas-statevoho-aktu#faq',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Чи нормально, що я іноді відчуваю біль під час сексу?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Епізодичний легкий дискомфорт буває у багатьох жінок. Але регулярний або стійкий біль — не норма, незалежно від того, наскільки слабкий він субʼєктивно.',
          },
        },
        {
          '@type': 'Question',
          name: 'Чи може біль під час сексу зникнути сам?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Іноді так — якщо причина тимчасова. Але якщо біль повторюється кілька місяців, сам по собі він зазвичай не зникає. Краще зрозуміти причину.',
          },
        },
      ],
    },
  ],
};

// ─── Static data ─────────────────────────────────────────────────────────────

const CAUSES = [
  {
    id: 'endometrioz',
    title: 'Ендометріоз',
    painType: 'Глибокий біль',
    paintypeColor: 'bg-orange-100 text-orange-700',
    body: 'Одна з частих причин глибокого болю під час акту. Особливо коли уражений дугласовий простір, крижово-маткові зв\'язки або є ендометріоми яєчників. Біль зазвичай посилюється у певних позиціях (особливо при глибокому проникненні), часто прогресує з роками, поєднується з посиленим болем під час місячних.',
    note: 'Підозра виникає коли: диспареунія + болісні місячні + інколи проблеми із зачаттям. Підтверджують УЗД, МРТ, остаточно — лапароскопія з біопсією.',
    link: { href: '/cases/endometrioz', label: 'Ендометріоз — методи лікування, клініки, ціни' },
  },
  {
    id: 'infections',
    title: 'Інфекції та запальні процеси',
    painType: 'Поверхневий або глибокий',
    paintypeColor: 'bg-red-100 text-red-700',
    body: 'Часта причина поверхневого болю при вході в піхву. До цієї групи входять кандидоз (молочниця), бактеріальний вагіноз, ІПСШ (трихомоніаз, хламідіоз, гонорея, генітальний герпес). Часто супроводжуються виділеннями, свербежем, неприємним запахом, печінням.',
    note: 'Інфекції верхніх відділів — запалення придатків, ендометрит — можуть давати глибокий біль, часто з гарячкою. Лікування зазвичай швидке, медикаментозне.',
    link: null,
  },
  {
    id: 'dryness',
    title: 'Сухість піхви та гормональні зміни',
    painType: 'Поверхневий біль',
    paintypeColor: 'bg-amber-100 text-amber-700',
    body: 'Поверхневий біль, відчуття "тертя" або печіння — часта причина у двох групах: жінки в перименопаузі та постменопаузі (через зниження естрогену) і жінки, що годують груддю. У молодших жінок сухість буває через певні гормональні контрацептиви, стрес, недостатню сексуальну стимуляцію.',
    note: 'Лікування — від лубрикантів до місцевої гормональної терапії (естрогенові свічки). Часто проблема вирішується доволі легко.',
    link: null,
  },
  {
    id: 'adhesions',
    title: 'Спайки та післяопераційні зміни',
    painType: 'Глибокий біль',
    paintypeColor: 'bg-orange-100 text-orange-700',
    body: 'Глибокий біль після гінекологічних операцій, запальних процесів у малому тазі, або як наслідок тривалого ендометріозу. Спайки змінюють анатомію, обмежують рухомість органів, можуть тиснути на нервові закінчення.',
    note: 'Підтвердження — УЗД, лапароскопія. Лікування — лапароскопічний адгеолізис (роз\'єднання спайок).',
    link: null,
  },
  {
    id: 'mioma',
    title: 'Міома матки та інші структурні зміни',
    painType: 'Глибокий біль',
    paintypeColor: 'bg-orange-100 text-orange-700',
    body: 'Великі вузли, особливо на задній стінці матки або в шийці, можуть спричиняти глибокий біль під час сексу. Симптоми зазвичай поєднуються з рясними місячними, тиском внизу живота.',
    note: 'УЗД — перший крок діагностики.',
    link: { href: '/cases/mioma-matky', label: 'Міома матки — методи лікування, клініки, ціни' },
  },
  {
    id: 'vaginismus',
    title: 'Вагінізм та м\'язова напруга',
    painType: 'Поверхневий або вхід',
    paintypeColor: 'bg-purple-100 text-purple-700',
    body: 'Мимовільне спазмування м\'язів тазового дна, що робить проникнення болісним або неможливим. Може бути первинним (з початку статевого життя) або вторинним (виник після травматичного досвіду, операції, психологічної ситуації).',
    note: 'Лікування — комплексне: гінеколог + фізіотерапевт тазового дна + психотерапевт. Це не "у голові" — це реальна фізична проблема з системним підходом.',
    link: null,
  },
  {
    id: 'psycho',
    title: 'Психоемоційні фактори',
    painType: 'Різний',
    paintypeColor: 'bg-blue-100 text-blue-700',
    body: 'Іноді біль не має чіткої органічної причини, але все одно реальний. Стрес, проблеми у стосунках, попередній травматичний досвід, тривога — все це впливає на сексуальну функцію.',
    note: 'Якщо обстеження виключило фізичні причини, корисно звернутись до психолога або сексотерапевта. Це не "вигадки" — тіло реагує на накопичену напругу.',
    link: null,
  },
];

const FAQ_ITEMS = [
  {
    id: 'faq-normal',
    q: 'Чи нормально, що я іноді відчуваю біль під час сексу?',
    a: 'Епізодичний легкий дискомфорт буває у багатьох жінок (наприклад при сухості після стресу або у певних позиціях). Якщо це поодинокі випадки і вони не повторюються — це не привід для тривоги. Але регулярний або стійкий біль — не норма, незалежно від того, наскільки "слабкий" він суб\'єктивно.',
  },
  {
    id: 'faq-self-resolve',
    q: 'Чи може біль під час сексу зникнути сам?',
    a: 'Іноді так — якщо причина тимчасова (легка інфекція, що пройшла; короткий період сухості). Але якщо біль повторюється кілька місяців, "сам по собі" він зазвичай не зникає, а може посилитись. Краще не чекати, а зрозуміти причину.',
  },
  {
    id: 'faq-partner',
    q: 'Чи говорити про це з партнером?',
    a: 'Так — і чим раніше, тим краще. Не пояснений біль часто сприймається партнером як "він мене не приваблює" або "вона не хоче", що накопичує проблеми у стосунках. Чесна розмова про те, що це фізична проблема, яка потребує медичного звернення, знімає велику частину напруги.',
  },
  {
    id: 'faq-male-doctor',
    q: 'Чи можу я піти до лікаря-чоловіка з такою проблемою?',
    a: 'Так. Професійні лікарі, незалежно від статі, працюють з диспареунією щодня. Якщо вам комфортніше з лікарем-жінкою — це теж нормально, можете обрати. Головне — отримати допомогу, а не відкладати через комфорт.',
  },
  {
    id: 'faq-exam',
    q: 'Чи буде боляче під час самого огляду?',
    a: 'Гінеколог адаптує огляд під ваше відчуття. Якщо є вагінізм або сильний біль — використовують найменші інструменти, проводять огляд повільно, з вашою згодою на кожен крок. Скажіть лікарю про свій досвід болю до початку огляду — це допоможе обрати правильний підхід.',
  },
];

const SOURCES = [
  'Mayo Clinic Family Health Book — Painful Intercourse (Dyspareunia)',
  'ESHRE Guideline on the Management of Endometriosis (2022)',
  'ACOG FAQ — Dyspareunia',
  'International Society for the Study of Women\'s Sexual Health (ISSWSH)',
];

// ─── Page ────────────────────────────────────────────────────────────────────

export default function BilPidChasStatevohoAktuPage() {
  return (
    <>
      <Script
        id="schema-bil-pid-chas"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaJsonLd) }}
      />

      <main>
        {/* 1. HERO */}
        <section className="bg-[#05121e] text-white px-4 pt-10 pb-8" aria-labelledby="symptom-h1">
          <div className="max-w-3xl mx-auto">
            <nav aria-label="Навігація" className="text-[12px] text-gray-400 mb-5">
              <Link href="/" className="hover:text-white transition-colors">check-up.in.ua</Link>
              <span className="mx-1.5 text-gray-600">/</span>
              <Link href="/careway" className="hover:text-white transition-colors">Careway</Link>
              <span className="mx-1.5 text-gray-600">/</span>
              <Link href="/careway/simptomy" className="hover:text-white transition-colors">Симптоми</Link>
              <span className="mx-1.5 text-gray-600">/</span>
              <span className="text-gray-300">Біль під час статевого акту</span>
            </nav>

            <h1
              id="symptom-h1"
              className="text-[28px] leading-[1.25] font-bold text-white mb-2"
              style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
            >
              Біль під час статевого акту — що це може бути і коли звернутись до лікаря
            </h1>

            <span className="h1-teal-line" aria-hidden="true" />

            <p className="mt-4 text-[15px] text-gray-300 leading-relaxed">
              Зрозуміти, коли біль під час сексу — варіант норми, який вирішується самостійно,
              а коли — сигнал про захворювання, що потребує лікування. З чого почати діагностику.
            </p>

            <p className="mt-3 text-[13px] text-gray-400 leading-relaxed border-l-2 border-gray-600 pl-3">
              Біль під час статевого акту медицина називає диспареунією. Це не діагноз, а симптом,
              за яким можуть стояти різні причини — від тимчасової сухості до серйозних захворювань
              на кшталт ендометріозу. Багато жінок роками не звертаються з цією проблемою — через
              сором або переконання, що &ldquo;це нормально&rdquo;. Будь-який стійкий біль під час сексу —
              привід звернутись до лікаря і знайти причину.
            </p>

            <div className="flex flex-col gap-2.5 mt-6">
              <a
                href="#lead-form"
                className="block w-full py-3.5 text-center bg-[#d60242] text-white text-[15px] font-semibold rounded-[10px] hover:bg-[#b5003a] transition-colors"
              >
                Записатись на консультацію гінеколога
              </a>
              <a
                href="#clinics"
                className="block w-full py-3.5 text-center bg-white/10 text-white text-[15px] font-semibold rounded-[10px] hover:bg-white/20 transition-colors border border-white/20"
              >
                Побачити клініки у моєму місті
              </a>
            </div>
          </div>
        </section>

        {/* 2. DescribePainBlock */}
        <DescribePainBlock />

        {/* 3. RED FLAGS */}
        <section className="px-4 py-8 bg-gray-50" aria-labelledby="red-flags-heading">
          <div className="max-w-3xl mx-auto">
            <h2 id="red-flags-heading" className="text-[22px] font-bold text-[#0b1a24] mb-4">
              Червоні прапорці — коли терміново
            </h2>
            <p className="text-[14px] text-gray-600 mb-4 leading-relaxed">
              Деякі ситуації потребують не планового запису, а швидшого реагування.
            </p>

            <div className="bg-red-50 border border-red-200 rounded-[10px] p-4" role="alert">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-4 h-4 text-red-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="text-[13px] font-bold text-red-700 uppercase tracking-wide">
                  Зверніться у найближчі дні, якщо:
                </span>
              </div>
              <ul className="space-y-2">
                {[
                  'Біль вперше з\'явився раптово після фізичного або емоційного інциденту',
                  'Є значні кровомазання або кровотеча після акту, що не зупиняються самостійно',
                  'Гострий, незвично сильний біль, що не вщухає після завершення акту',
                  'Разом з болем — гарячка, виділення з різким запахом, болісне сечовипускання (підозра на запалення)',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-[13px] text-red-800">
                    <svg className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
              <p className="text-[12px] text-red-700 mt-3 font-medium">
                У постменопаузі: будь-які виділення з кров&apos;ю після сексу — показання до
                невідкладного обстеження для виключення онкологічного процесу [Mayo Clinic].
              </p>
            </div>
          </div>
        </section>

        {/* 4. CAUSES */}
        <section className="px-4 py-8 bg-white" aria-labelledby="causes-heading">
          <div className="max-w-3xl mx-auto">
            <h2 id="causes-heading" className="text-[22px] font-bold text-[#0b1a24] mb-1">
              Що це може бути
            </h2>
            <p className="text-[14px] text-gray-600 mb-5 leading-relaxed">
              Причин диспареунії багато. Далі — найпоширеніші, з підказкою, коли яка імовірніша.
            </p>

            <div className="space-y-3">
              {CAUSES.map((cause) => (
                <div key={cause.id} className="bg-white border border-gray-200 rounded-[10px] p-4">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <h3 className="text-[15px] font-bold text-[#0b1a24]">{cause.title}</h3>
                    <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${cause.paintypeColor}`}>
                      {cause.painType}
                    </span>
                  </div>
                  <p className="text-[13px] text-gray-700 leading-relaxed mb-2">{cause.body}</p>
                  <p className="text-[12px] text-gray-500 italic mb-2">{cause.note}</p>
                  {cause.link && (
                    <Link
                      href={cause.link.href}
                      className="text-[13px] font-semibold text-[#005485] hover:underline"
                    >
                      {cause.link.label} →
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 5. ORIENTATION BLOCK */}
        <section className="px-4 py-8 bg-gray-50" aria-labelledby="orientation-heading">
          <div className="max-w-7xl mx-auto">
            <h2 id="orientation-heading" className="text-[22px] font-bold text-[#0b1a24] mb-1">
              Ваш вік впливає на імовірну причину
            </h2>
            <p className="text-[14px] text-gray-600 mb-5 leading-relaxed">
              Те, що саме стоїть за диспареунією, статистично залежить від віку.
            </p>

            {/* Desktop: 3 cards */}
            <div className="hidden md:grid md:grid-cols-3 md:gap-6">
              {[
                {
                  label: '20–35 років',
                  body: 'У цьому віці серед причин найчастіше зустрічаються інфекції (особливо ІПСШ), вагінізм та м\'язова напруга, психоемоційні фактори. Ендометріоз теж починає проявлятися в цьому віці, але часто його роками не діагностують.',
                  exam: 'Мінімум обстеження: гінекологічний огляд, мазки на флору та ПЛР на ІПСШ, УЗД органів малого тазу.',
                },
                {
                  label: '35–45 років',
                  body: 'На перший план виходять структурні причини — ендометріоз (особливо при глибокому болі), міома, спайки після попередніх втручань. Інфекції теж зустрічаються, але рідше за органічні зміни.',
                  exam: 'Мінімум обстеження: УЗД з прицільним оглядом задньої стінки матки та ділянки яєчників, мазки, при підозрі на ендометріоз — МРТ.',
                },
                {
                  label: '45+ років',
                  body: 'Значну частину причин становлять гормональні зміни — сухість, атрофія слизової піхви через зниження естрогену. Структурні причини залишаються, але додаються гіперплазія ендометрія, поліпи.',
                  exam: 'Мінімум обстеження: УЗД з оцінкою товщини ендометрія, мазки, оцінка гормонального статусу.',
                },
              ].map((g) => (
                <div key={g.label} className="bg-white border border-gray-200 rounded-[10px] p-5">
                  <div className="text-[16px] font-semibold text-[#0b1a24] mb-3">{g.label}</div>
                  <p className="text-[14px] text-[#0b1a24] leading-relaxed mb-3">{g.body}</p>
                  <div className="bg-[#e8f4fd] border border-[#005485]/20 rounded-[8px] p-3">
                    <p className="text-[12px] text-[#0b1a24]">{g.exam}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile: accordion */}
            <div className="md:hidden space-y-2">
              {[
                { id: 'age-20', label: '20–35 років', body: 'У цьому віці серед причин найчастіше зустрічаються інфекції (особливо ІПСШ), вагінізм та м\'язова напруга, психоемоційні фактори. Ендометріоз теж починає проявлятися в цьому віці, але часто його роками не діагностують.', exam: 'Мінімум обстеження: гінекологічний огляд, мазки на флору та ПЛР на ІПСШ, УЗД органів малого тазу.' },
                { id: 'age-35', label: '35–45 років', body: 'На перший план виходять структурні причини — ендометріоз (особливо при глибокому болі), міома, спайки після попередніх втручань.', exam: 'Мінімум обстеження: УЗД з прицільним оглядом задньої стінки матки та ділянки яєчників, мазки, при підозрі — МРТ.' },
                { id: 'age-45', label: '45+ років', body: 'Значну частину причин становлять гормональні зміни — сухість, атрофія слизової через зниження естрогену. Структурні причини залишаються.', exam: 'Мінімум обстеження: УЗД з оцінкою товщини ендометрія, мазки, гормональний статус.' },
              ].map((g) => (
                <details key={g.id} className="bg-white border border-gray-200 rounded-[10px] overflow-hidden">
                  <summary className="flex items-center justify-between gap-3 p-4 cursor-pointer list-none">
                    <div className="text-[15px] font-semibold text-[#0b1a24]">{g.label}</div>
                    <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="px-4 pb-4 border-t border-gray-200">
                    <p className="pt-3 text-[14px] text-[#0b1a24] leading-relaxed mb-3">{g.body}</p>
                    <div className="bg-[#e8f4fd] border border-[#005485]/20 rounded-[8px] p-3">
                      <p className="text-[12px] text-[#0b1a24]">{g.exam}</p>
                    </div>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* 6. EXAMINATIONS */}
        <section className="px-4 py-8 bg-white" aria-labelledby="examinations-heading">
          <div className="max-w-3xl mx-auto">
            <h2 id="examinations-heading" className="text-[22px] font-bold text-[#0b1a24] mb-4">
              Які обстеження мають сенс
            </h2>

            <p className="text-[14px] text-gray-600 mb-4 leading-relaxed">
              Базовий набір обстежень при диспареунії будується з огляду на ваш опис болю та супутні
              симптоми. Перший прийом — це насамперед розмова. Лікар запитає про деталі болю,
              менструальний цикл, попередні захворювання та операції, контрацепцію, сексуальну
              історію. Не ховайте подробиць — конфіденційність гарантована, а лікарю потрібна
              повна картина.
            </p>

            <div className="mb-4">
              <h3 className="text-[12px] font-bold text-[#005485] mb-3 uppercase tracking-wide">
                Базовий набір
              </h3>
              <div className="space-y-2.5">
                {[
                  {
                    name: 'Гінекологічний огляд',
                    desc: 'Обов\'язковий. Лікар оцінює стан зовнішніх статевих органів, шийки матки, проводить бімануальне обстеження матки та придатків.',
                  },
                  {
                    name: 'Мазки',
                    desc: 'На флору, цитологію, ПЛР на основні ІПСШ. Відкидають або підтверджують інфекційну природу болю.',
                  },
                  {
                    name: 'УЗД органів малого тазу',
                    desc: 'Виявляє міоми, кісти, ознаки ендометріозу, поліпи. Часто проводиться того самого дня.',
                  },
                ].map((item) => (
                  <div key={item.name} className="flex items-start gap-3 bg-gray-50 rounded-[8px] p-3">
                    <svg className="w-4 h-4 text-[#04D3D9] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <div className="text-[13px] font-semibold text-[#0b1a24]">{item.name}</div>
                      <div className="text-[12px] text-gray-500">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-5">
              <h3 className="text-[12px] font-bold text-[#005485] mb-3 uppercase tracking-wide">
                За показаннями
              </h3>
              <div className="space-y-2">
                {[
                  'МРТ малого тазу — при підозрі на глибокий інфільтративний ендометріоз, аденоміоз, складну анатомію',
                  'Гістероскопія — при підозрі на патологію всередині матки (поліпи, гіперплазія)',
                  'Лапароскопія — остаточне підтвердження ендометріозу з одночасним лікуванням',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2 text-[13px] text-gray-700">
                    <span className="text-gray-400 shrink-0 mt-0.5">›</span>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-[10px] p-4">
              <h3 className="text-[13px] font-bold text-blue-700 mb-2">Що взяти на прийом</h3>
              <ul className="space-y-1.5 text-[13px] text-blue-900">
                {[
                  'Менструальний календар за останні 3-6 місяців (якщо ведете)',
                  'Список препаратів (включаючи контрацепцію)',
                  'Попередні УЗД і медичні документи',
                  'Ваші запитання — заздалегідь записані',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <svg className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* 7. WHAT TO DO NOW */}
        <section className="px-4 py-8 bg-gray-50" aria-labelledby="what-to-do-heading">
          <div className="max-w-3xl mx-auto">
            <h2 id="what-to-do-heading" className="text-[22px] font-bold text-[#0b1a24] mb-4">
              Що зробити зараз
            </h2>
            <div className="space-y-3 text-[14px] text-[#0b1a24] leading-relaxed">
              <p>
                Якщо ви впізнаєте описане і вже місяцями (а може й роками) живете з болем під час
                сексу — час зробити перший крок.
              </p>
              <p>
                Запишіться до гінеколога планово, не &ldquo;коли буде час&rdquo;. Гінекологи зустрічають з
                цією проблемою щодня — для них це нормальна медична ситуація, не привід для смущення.
              </p>
            </div>
            <div className="mt-4 bg-white border border-gray-200 rounded-[10px] p-4">
              <div className="text-[13px] font-semibold text-[#0b1a24] mb-3">До прийому корисно:</div>
              <ul className="space-y-2 text-[13px] text-gray-700">
                {[
                  'Задокументувати кілька останніх епізодів болю — коли, який характер, у якій позиції, чи був зв\'язок з циклом',
                  'Записати свої запитання — на прийомі багато з них вилетять з голови',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="text-[#04D3D9] font-bold shrink-0">→</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <p className="text-[13px] text-gray-500 mt-4 leading-relaxed">
              Якщо біль настільки сильний, що вже місяцями робить статеве життя неможливим — і
              ви відчуваєте напругу у стосунках — варто паралельно звернутись до психотерапевта чи
              сексолога. Довге терпіння болю накопичує психологічний шар, який сам собою не пройде,
              навіть якщо медична причина буде усунена.
            </p>
            <div className="mt-5">
              <a
                href="#lead-form"
                className="block w-full py-3.5 text-center bg-[#d60242] text-white text-[15px] font-semibold rounded-[10px] hover:bg-[#b5003a] transition-colors"
              >
                Записатись на консультацію гінеколога
              </a>
            </div>
          </div>
        </section>

        {/* 8. FAQ */}
        <section className="px-4 py-8 bg-white" aria-labelledby="faq-heading" itemScope itemType="https://schema.org/FAQPage">
          <div className="max-w-3xl mx-auto">
            <h2 id="faq-heading" className="text-[22px] font-bold text-[#0b1a24] mb-5">
              Питання та відповіді
            </h2>
            <div className="space-y-2">
              {FAQ_ITEMS.map((item) => (
                <details
                  key={item.id}
                  className="bg-white border border-gray-200 rounded-[10px] overflow-hidden"
                  itemScope
                  itemProp="mainEntity"
                  itemType="https://schema.org/Question"
                >
                  <summary className="flex items-center gap-3 p-4 cursor-pointer list-none" itemProp="name">
                    <div className="flex-1 text-[15px] font-semibold text-[#0b1a24]">{item.q}</div>
                    <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="px-4 pb-4 border-t border-gray-100" itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                    <p className="pt-3 text-[14px] text-[#0b1a24] leading-relaxed" itemProp="text">{item.a}</p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* 9. GEO */}
        <section id="clinics" className="px-4 py-8 bg-gray-50" aria-labelledby="geo-heading">
          <div className="max-w-3xl mx-auto">
            <h2 id="geo-heading" className="text-[20px] font-bold text-[#0b1a24] mb-4">
              Консультація гінеколога при болю під час статевого акту — клініки в Україні
            </h2>
            <p className="text-[14px] text-[#0b1a24] leading-relaxed">
              Платформа check-up.in.ua об'єднує акушерів-гінекологів у партнерських клініках України
              — Рівне, Харків та інші міста. Первинний прийом включає збір детального анамнезу,
              гінекологічний огляд та за показаннями — УЗД органів малого тазу, мазки, аналізи
              на ІПСШ. У клініках доступна повна діагностика причин диспареунії: УЗД, гістероскопія,
              при підозрі на ендометріоз — МРТ та лапароскопія. Для жінок у містах без партнерської
              клініки доступна онлайн-консультація з гінекологом. Автор матеріалу — Ігор Растрепін,
              редактор check-up.in.ua. Рецензент — Трохимович Руслана Миколаївна, акушер-гінеколог
              вищої категорії з 26-річним досвідом.
            </p>
            <p className="text-[11px] text-gray-400 mt-2">* TODO: замінити гіпотетичні дані фактичними з Supabase</p>
          </div>
        </section>

        {/* 10. E-E-A-T */}
        <section className="px-4 py-8 bg-white" aria-labelledby="eeat-heading">
          <div className="max-w-7xl mx-auto">
            <h2 id="eeat-heading" className="text-[18px] font-bold text-[#0b1a24] mb-4">Про матеріал</h2>
            <div className="md:grid md:grid-cols-2 md:gap-8 md:items-start">
              {/* Left */}
              <div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 mb-5">
                  <div className="bg-white border border-gray-200 rounded-[10px] p-3.5" itemScope itemType="https://schema.org/Person">
                    <div className="text-[11px] text-gray-400 uppercase tracking-wide mb-1">Автор</div>
                    <div className="text-[14px] font-bold text-[#0b1a24]" itemProp="name">Ігор Растрепін</div>
                    <div className="text-[12px] text-gray-500" itemProp="jobTitle">Медичний редактор check-up.in.ua</div>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-[10px] p-3.5" itemScope itemType="https://schema.org/Physician">
                    <div className="text-[11px] text-gray-400 uppercase tracking-wide mb-1">Рецензент</div>
                    <a
                      href="https://rokl.check-up.in.ua/doctors/trokhymovych-ruslana"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[14px] font-bold text-[#005485] hover:underline"
                      itemProp="name"
                    >
                      Трохимович Руслана Миколаївна →
                    </a>
                    <div className="text-[12px] text-gray-500" itemProp="description">Акушер-гінеколог, вища категорія, 26 років досвіду</div>
                  </div>
                </div>
                <blockquote className="bg-white border-l-4 border-[#04D3D9] rounded-r-[10px] p-4 mb-5">
                  <p className="text-[14px] text-[#0b1a24] leading-relaxed italic mb-2">
                    &ldquo;Багато жінок роками живуть з болем під час сексу, бо соромляться його обговорити.
                    На прийомі для нас це звичайна медична ситуація, не привід для смущення.
                    Чим раніше ви звернетесь — тим швидше знайдемо причину.&rdquo;
                  </p>
                  <footer className="text-[12px] text-gray-500">— Трохимович Р.М.</footer>
                  <p className="text-[11px] text-gray-400 mt-1">* TODO: підтвердити цитату з рецензентом</p>
                </blockquote>
                <p className="text-[12px] text-gray-500">
                  Останнє оновлення: <time dateTime="2026-04-17">квітень 2026</time>
                </p>
              </div>

              {/* Right */}
              <div>
                <div className="mb-4">
                  <div className="text-[12px] font-semibold text-gray-600 uppercase tracking-wide mb-2">Методологія</div>
                  <p className="text-[13px] text-gray-600 leading-relaxed">
                    Матеріал підготовлений на основі Mayo Clinic Family Health Book, ESHRE Guideline on
                    Endometriosis (2022), ACOG FAQ on Dyspareunia, ISSWSH. Принципи подачі — за
                    стандартами shared decision-making (NHS, IQWiG).
                  </p>
                </div>
                <div>
                  <div className="text-[12px] font-semibold text-gray-600 uppercase tracking-wide mb-2">Джерела</div>
                  <ul className="space-y-1">
                    {SOURCES.map((src) => (
                      <li key={src} className="text-[12px] text-gray-600 flex items-start gap-1.5">
                        <span className="text-[#04D3D9] shrink-0 mt-0.5">›</span>
                        {src}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Disclaimer */}
        <div className="px-4 pb-4 bg-white">
          <div className="max-w-3xl mx-auto">
            <Disclaimer />
          </div>
        </div>

        {/* Lead form */}
        <section id="lead-form" className="px-4 py-8 bg-gray-50 border-t border-gray-100" aria-label="Форма запису на консультацію">
          <div className="max-w-[480px] mx-auto">
            <h2 className="text-[20px] font-bold text-[#0b1a24] mb-1">Записатись на консультацію</h2>
            <p className="text-[13px] text-gray-500 mb-4">
              Залиште заявку — ми підберемо гінеколога у вашому місті та зв&apos;яжемось для узгодження.
            </p>
            <LeadForm
              intent="understand_symptom"
              sourcePage="/careway/simptomy/bil-pid-chas-statevoho-aktu"
              ctaLabel="Записатись на консультацію гінеколога"
            />
          </div>
        </section>

        {/* 11. Related links */}
        <section className="px-4 py-8 bg-white border-t border-gray-100" aria-labelledby="related-heading">
          <div className="max-w-3xl mx-auto">
            <h2 id="related-heading" className="text-[18px] font-bold text-[#0b1a24] mb-4">
              Пов&apos;язані матеріали
            </h2>
            <div className="space-y-2">
              {[
                { href: '/cases/endometrioz', label: 'Ендометріоз — методи лікування, клініки, ціни', soon: false },
                { href: '/cases/mioma-matky', label: 'Міома матки — методи лікування, клініки, ціни', soon: false },
                { href: '/careway/simptomy/ryasni-misyachni', label: 'Рясні місячні — що це може бути', soon: false },
                { href: '#', label: 'Проблеми із зачаттям — план дій', soon: true },
                { href: '/careway/dzherela', label: 'Наші джерела та медичні стандарти', soon: true },
              ].map(({ href, label, soon }) => (
                <div key={label}>
                  {soon ? (
                    <span className="flex items-center gap-2 text-[14px] text-gray-300" aria-disabled="true">
                      <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                      {label} <span className="text-[11px]">[скоро]</span>
                    </span>
                  ) : (
                    <Link href={href} className="flex items-center gap-2 text-[14px] text-[#005485] font-medium hover:underline">
                      <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                      {label}
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Sticky CTA (mobile only) */}
        <StickyMobileCTA href="#lead-form" ctaLabel="Записатись на консультацію" />
      </main>
    </>
  );
}
