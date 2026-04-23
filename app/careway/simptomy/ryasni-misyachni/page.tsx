// v2
import type { Metadata } from 'next';
import Script from 'next/script';
import Link from 'next/link';

// Symptom components
import SymptomHero from '@/components/symptom/SymptomHero';
import RedFlagsBlock from '@/components/symptom/RedFlagsBlock';
import CausesBlock from '@/components/symptom/CausesBlock';
import ExaminationsBlock from '@/components/symptom/ExaminationsBlock';

// Shared components
import Disclaimer from '@/components/shared/Disclaimer';
import LeadForm from '@/components/shared/LeadForm';

// ─── Metadata ────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: 'Рясні місячні — причини, коли до лікаря, обстеження',
  description:
    'Коли рясні місячні — варіант норми, а коли сигнал про міому, аденоміоз, поліпи чи гормональний збій. Червоні прапорці, обстеження, що робити далі. Рецензовано акушером-гінекологом.',
  alternates: {
    canonical: 'https://check-up.in.ua/careway/simptomy/ryasni-misyachni',
  },
  openGraph: {
    title: 'Рясні місячні — причини, коли до лікаря, обстеження | check-up.in.ua',
    description: 'Коли рясні місячні — варіант норми, а коли сигнал. Причини, обстеження, план дій.',
    url: 'https://check-up.in.ua/careway/simptomy/ryasni-misyachni',
    locale: 'uk_UA',
    type: 'article',
  },
};

// ─── Schema.org JSON-LD ──────────────────────────────────────────────────────

const schemaJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'MedicalWebPage',
      '@id': 'https://check-up.in.ua/careway/simptomy/ryasni-misyachni#webpage',
      url: 'https://check-up.in.ua/careway/simptomy/ryasni-misyachni',
      name: 'Рясні місячні — причини, коли до лікаря, обстеження',
      dateModified: '2026-04-17',
      inLanguage: 'uk',
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
        name: 'Важкі менструальні кровотечі',
        alternateName: 'Рясні місячні',
      },
    },
    {
      '@type': 'FAQPage',
      '@id': 'https://check-up.in.ua/careway/simptomy/ryasni-misyachni#faq',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Чи можуть рясні місячні бути нормою?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Якщо обсяг крововтрати порушує повсякденне життя або є ознаки анемії — це не варіант норми, а симптом, який треба розбирати [Mayo Clinic, ACOG].',
          },
        },
        {
          '@type': 'Question',
          name: 'Чи можна лікувати рясні місячні без операції?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Дуже часто — так. Варіантів багато: оральні контрацептиви, ВМС з прогестероном, транексамова кислота, НПЗП, гормональна терапія. Вибір залежить від причини [Mayo Clinic].',
          },
        },
        {
          '@type': 'Question',
          name: 'Чи впливають рясні місячні на фертильність?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Самі по собі — не обов\'язково. Але причини, які за ними стоять (міома, аденоміоз, поліпи), можуть впливати на здатність завагітніти.',
          },
        },
      ],
    },
  ],
};

// ─── Page ────────────────────────────────────────────────────────────────────

export default function RyasniMisyachniPage() {
  return (
    <>
      <Script
        id="schema-symptom-ryasni"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaJsonLd) }}
      />

      <main>
        {/* 1. Hero */}
        <SymptomHero />

        {/* 2. Що вважається рясними */}
        <section className="px-4 py-8 bg-white" aria-labelledby="definition-heading">
          <div className="max-w-3xl mx-auto">
            <h2 id="definition-heading" className="text-[22px] font-bold text-[#0b1a24] mb-4">
              Що вважається &ldquo;рясними&rdquo; місячними
            </h2>
            <p className="text-[14px] text-gray-600 mb-4 leading-relaxed">
              Медична термінологія тут звучить як &quot;важкі менструальні кровотечі&quot; (heavy
              menstrual bleeding). Йдеться не про суб&apos;єктивне відчуття, а про досить
              конкретні ознаки, які використовують лікарі.
            </p>
            <div className="bg-gray-50 rounded-[10px] p-4">
              <div className="text-[12px] font-semibold text-[#005485] uppercase tracking-wide mb-3">
                Про рясні місячні говорять, якщо:
              </div>
              <ul className="space-y-2">
                {[
                  'Менструація триває довше 7 днів',
                  'Прокладки або тампони потрібно міняти щогодини або частіше кілька годин поспіль',
                  'Доводиться вставати вночі, щоб змінити засіб гігієни',
                  'Виходять згустки крові, більші за двохгривневу монету',
                  'Через менструацію ви обмежуєте плани — не йдете на роботу, відмовляєтеся від зустрічей',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-[13px] text-[#0b1a24]">
                    <span className="text-[#04D3D9] font-bold shrink-0 mt-0.5">›</span>
                    {item}
                  </li>
                ))}
              </ul>
              <p className="text-[12px] text-gray-500 mt-3">
                [Mayo Clinic, ACOG] — впізнавання двох-трьох ознак — сигнал обговорити
                симптом з лікарем у найближчий місяць.
              </p>
            </div>
            <blockquote className="mt-4 border-l-4 border-amber-400 pl-4 text-[13px] text-gray-700 italic">
              Рясні місячні, які тривають багато циклів, поступово виснажують запаси
              заліза. Залізодефіцитна анемія розвивається непомітно — з хронічною
              втомою, запамороченнями, задишкою, блідістю. Це стан, який сам потребує
              лікування і який легко недооцінити [Mayo Clinic].
            </blockquote>
          </div>
        </section>

        {/* 3. Червоні прапорці */}
        <RedFlagsBlock />

        {/* 4. Що це може бути */}
        <CausesBlock />

        {/* 5. Orientation Block по вікових групах */}
        <section className="px-4 py-8 bg-white" aria-labelledby="age-orientation-heading">
          <div className="max-w-7xl mx-auto">
            <h2 id="age-orientation-heading" className="text-[22px] font-bold text-[#0b1a24] mb-1">
              Ваш вік впливає на імовірну причину
            </h2>
            <p className="text-[14px] text-gray-600 mb-5">
              Те, що саме стоїть за рясними місячними, статистично залежить від віку.
              Це не правило без винятків — але орієнтир для самої себе та для лікаря.
            </p>

            {/* Desktop: 3 cards in a row */}
            <div className="space-y-3 md:grid md:grid-cols-3 md:gap-5 md:space-y-0">
              {[
                {
                  age: '20-35 років',
                  text: 'Найчастіше гормональні дисбаланси, СПКЯ, рідше — невеликі міоми. Якщо місячні рясні з підліткового віку — варто окремо обговорити з лікарем питання коагулопатій.',
                  exam: 'УЗД, аналізи крові на гормони, загальний аналіз крові з гемоглобіном.',
                },
                {
                  age: '35-45 років',
                  text: 'Структурні причини — міома, аденоміоз, поліпи — виходять на перший план. Гормональні збої теж можливі, але рідше.',
                  exam: 'УЗД органів малого тазу обов\'язково; за показаннями — гістероскопія; загальний аналіз крові з гемоглобіном.',
                },
                {
                  age: '45+ років (перименопауза)',
                  text: 'Цикл природно стає нерегулярним, але рясні місячні — не варіант норми. Важливо виключити гіперплазію ендометрія, поліпи і рак ендометрія.',
                  exam: 'УЗД з прицільною оцінкою товщини ендометрія; при показаннях — аспіраційна біопсія або гістероскопія.',
                  note: 'Після менопаузи будь-яка кровотеча — показання до негайного обстеження [Mayo Clinic].',
                },
              ].map(({ age, text, exam, note }) => (
                <div key={age} className="bg-gray-50 border border-gray-200 rounded-[10px] p-4">
                  <div className="text-[14px] font-bold text-[#0b1a24] mb-2">{age}</div>
                  <p className="text-[13px] text-gray-700 mb-2">{text}</p>
                  <div className="text-[12px] bg-[#e8f4fd] border border-[#005485]/20 rounded-[6px] px-3 py-2 text-[#005485]">
                    <strong>Мінімум обстеження:</strong> {exam}
                  </div>
                  {note && (
                    <p className="text-[12px] text-amber-700 mt-2 italic">{note}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 6. Обстеження */}
        <ExaminationsBlock />

        {/* 7. Що зробити зараз */}
        <section className="px-4 py-8 bg-gray-50" aria-labelledby="action-heading">
          <div className="max-w-3xl mx-auto">
            <h2 id="action-heading" className="text-[22px] font-bold text-[#0b1a24] mb-4">
              Що зробити зараз
            </h2>
            <div className="space-y-3">
              {[
                {
                  num: '1',
                  text: 'Запишіться до гінеколога планово, у межах найближчого місяця. Не на "коли з\'явиться вільний час".',
                },
                {
                  num: '2',
                  text: 'Паралельно почніть вести менструальний календар: дати, тривалість, обсяг, симптоми.',
                },
                {
                  num: '3',
                  text: 'Якщо підозрюєте анемію (постійна втома, задишка, блідість) — здайте загальний аналіз крові ще до прийому.',
                },
              ].map(({ num, text }) => (
                <div key={num} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-[#04D3D9] text-white font-bold text-[14px] flex items-center justify-center shrink-0">
                    {num}
                  </div>
                  <p className="text-[14px] text-[#0b1a24] leading-relaxed mt-0.5">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 8. FAQ */}
        <section
          className="px-4 py-8 bg-white"
          aria-labelledby="faq-symptom-heading"
        >
          <div className="max-w-3xl mx-auto">
            <h2 id="faq-symptom-heading" className="text-[22px] font-bold text-[#0b1a24] mb-5">
              Питання та відповіді
            </h2>
            <div
              className="space-y-3"
              itemScope
              itemType="https://schema.org/FAQPage"
            >
              {[
                {
                  id: 's-faq-1',
                  q: 'Чи можуть рясні місячні бути нормою?',
                  a: 'Індивідуальні особливості існують, але межа чітка. Якщо обсяг крововтрати порушує повсякденне життя або є ознаки анемії — це не варіант норми, а симптом, який треба розбирати [Mayo Clinic, ACOG].',
                },
                {
                  id: 's-faq-2',
                  q: 'Чи можна лікувати рясні місячні без операції?',
                  a: 'Дуже часто — так. Варіантів багато: оральні контрацептиви, ВМС з прогестероном, транексамова кислота, НПЗП, гормональна терапія. Вибір залежить від причини [Mayo Clinic]. Послідовність важлива: спочатку встановлюємо причину, потім підбираємо лікування.',
                },
                {
                  id: 's-faq-3',
                  q: 'Чи впливають рясні місячні на фертильність?',
                  a: 'Самі по собі — не обов\'язково. Але причини, які за ними стоять (міома, аденоміоз, поліпи, гормональні збої), можуть впливати. Тому якщо плануєте вагітність — обстеження обов\'язкове.',
                },
                {
                  id: 's-faq-4',
                  q: 'Через скільки часу після пологів рясні місячні — це нормально?',
                  a: 'Перші 3-6 місяців після пологів цикл часто нерегулярний. Якщо ж через пів року після припинення годування груддю місячні залишаються рясними — привід для звернення до гінеколога.',
                },
                {
                  id: 's-faq-5',
                  q: 'Чи треба готуватись до УЗД?',
                  a: 'Для трансвагінального УЗД — сечовий міхур має бути порожнім. Для трансабдомінального — навпаки, наповненим. Оптимальний час — 5-10 день циклу.',
                },
              ].map(({ id, q, a }) => (
                <details
                  key={id}
                  className="bg-gray-50 border border-gray-200 rounded-[10px] overflow-hidden"
                  itemScope
                  itemProp="mainEntity"
                  itemType="https://schema.org/Question"
                >
                  <summary
                    className="flex items-center gap-3 p-4 cursor-pointer list-none font-semibold text-[15px] text-[#0b1a24]"
                    itemProp="name"
                  >
                    {q}
                  </summary>
                  <div
                    className="px-4 pb-4 text-[14px] text-[#0b1a24] leading-relaxed border-t border-gray-100 pt-3"
                    itemScope
                    itemProp="acceptedAnswer"
                    itemType="https://schema.org/Answer"
                  >
                    <p itemProp="text">{a}</p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* 9. GEO (статичний HTML) */}
        <section className="px-4 py-8 bg-gray-50" aria-labelledby="geo-symptom-heading">
          <div className="max-w-3xl mx-auto">
            <h2 id="geo-symptom-heading" className="text-[20px] font-bold text-[#0b1a24] mb-4">
              Консультація гінеколога при рясних місячних — клініки в Україні
            </h2>
            <p className="text-[14px] text-[#0b1a24] leading-relaxed">
              Платформа check-up.in.ua об&apos;єднує акушерів-гінекологів у партнерських
              клініках України — Рівне, Харків, Дніпро, Львів, Одеса, Київ. Первинний
              прийом включає збір анамнезу, гінекологічний огляд та за показаннями — УЗД
              органів малого тазу. В клініках доступна повна діагностика причин рясних
              місячних: УЗД, гістероскопія, біопсія ендометрія, лабораторні дослідження.
              У разі виявлення міоми, поліпа або аденоміозу лікування може проводитись
              амбулаторно або в умовах стаціонару. Для жінок у містах без партнерської
              клініки доступна онлайн-консультація з гінекологом. Автор матеріалу —
              Ігор Растрепін, редактор контенту платформи. Рецензент — Трохимович Руслана
              Миколаївна, акушер-гінеколог вищої категорії з 26-річним досвідом.
            </p>
            <p className="text-[11px] text-gray-400 mt-2">
              * TODO: замінити гіпотетичні дані фактичними з Supabase
            </p>
          </div>
        </section>

        {/* 10. E-E-A-T + Disclaimer */}
        <section className="px-4 py-8 bg-white" aria-labelledby="eeat-symptom-heading">
          <div className="max-w-3xl mx-auto">
            <h2 id="eeat-symptom-heading" className="text-[18px] font-bold text-[#0b1a24] mb-4">
              Про матеріал
            </h2>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 mb-4">
              <div
                className="bg-gray-50 border border-gray-200 rounded-[10px] p-3.5"
                itemScope
                itemType="https://schema.org/Person"
              >
                <div className="text-[11px] text-gray-400 uppercase tracking-wide mb-1">Автор</div>
                <div className="text-[14px] font-bold text-[#0b1a24]" itemProp="name">
                  Ігор Растрепін
                </div>
                <div className="text-[12px] text-gray-500" itemProp="jobTitle">
                  Медичний редактор check-up.in.ua
                </div>
              </div>
              <div
                className="bg-gray-50 border border-gray-200 rounded-[10px] p-3.5"
                itemScope
                itemType="https://schema.org/Physician"
              >
                <div className="text-[11px] text-gray-400 uppercase tracking-wide mb-1">Рецензент</div>
                <div className="text-[14px] font-bold text-[#0b1a24]" itemProp="name">
                  Трохимович Руслана Миколаївна
                </div>
                <div className="text-[12px] text-gray-500" itemProp="description">
                  Акушер-гінеколог, вища категорія, 26 років досвіду
                </div>
              </div>
            </div>

            <blockquote className="bg-gray-50 border-l-4 border-[#04D3D9] rounded-r-[10px] p-4 mb-4">
              <p className="text-[14px] text-[#0b1a24] leading-relaxed italic mb-1">
                &ldquo;Найчастіше пацієнтки з рясними місячними приходять тоді, коли анемія
                вже значна. Не соромтеся приходити раніше — рання діагностика рятує від
                багатьох проблем, і більшість причин ми успішно лікуємо без операції.&rdquo;
              </p>
              <footer className="text-[12px] text-gray-500">— Трохимович Р.М.</footer>
              <p className="text-[11px] text-gray-400 mt-1">* TODO: підтвердити цитату з рецензентом</p>
            </blockquote>

            <p className="text-[12px] text-gray-500 mb-4">
              Останнє оновлення: <time dateTime="2026-04-17">квітень 2026</time>
            </p>

            <div className="mb-4">
              <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Джерела</div>
              {[
                'Mayo Clinic Family Health Book — Heavy Menstrual Bleeding',
                'ACOG FAQ — Heavy Menstrual Bleeding',
                'RCOG Green-top Guideline #59 — Best Practice in Outpatient Hysteroscopy',
                'МОЗ України, Наказ №147 (2023)',
              ].map((src) => (
                <div key={src} className="text-[12px] text-gray-600 flex items-start gap-1.5">
                  <span className="text-[#04D3D9] shrink-0">›</span>
                  {src}
                </div>
              ))}
            </div>

            <Disclaimer variant="full" />
          </div>
        </section>

        {/* Lead form */}
        <section
          id="lead-form"
          className="px-4 py-8 bg-gray-50 border-t border-gray-100"
          aria-label="Форма запису на консультацію"
        >
          <div className="max-w-[480px] mx-auto">
            <h2 className="text-[20px] font-bold text-[#0b1a24] mb-1">
              Записатись на консультацію гінеколога
            </h2>
            <p className="text-[13px] text-gray-500 mb-4">
              Залиште заявку — ми підберемо лікаря у вашому місті або організуємо
              онлайн-консультацію.
            </p>
            <LeadForm
              intent="understand_symptom"
              sourcePage="/careway/simptomy/ryasni-misyachni"
              ctaLabel="Записатись на консультацію"
            />
          </div>
        </section>

        {/* 11. Related Links */}
        <section
          className="px-4 py-8 bg-white border-t border-gray-100"
          aria-labelledby="related-symptom-heading"
        >
          <div className="max-w-3xl mx-auto">
            <h2 id="related-symptom-heading" className="text-[18px] font-bold text-[#0b1a24] mb-4">
              Пов&apos;язані матеріали
            </h2>
            <div className="space-y-2">
              {[
                { href: '/cases/mioma-matky', label: 'Міома матки — методи лікування, клініки, ціни', soon: false },
                { href: '#', label: 'Аденоміоз — план дій', soon: true },
                { href: '#', label: 'Поліпи ендометрія', soon: true },
                { href: '#', label: 'Ендометріоз — план дій', soon: true },
                { href: '/careway/dzherela', label: 'Наші джерела та медичні стандарти', soon: false },
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
      </main>
    </>
  );
}
