'use client';

import { useState } from 'react';

const STEPS = [
  {
    id: 'step-1',
    num: 1,
    title: 'Зрозуміти свій діагноз',
    summary: 'Що означає "міома" — тип, розмір, класифікація FIGO',
    content: (
      <>
        <p className="mb-3">
          Перше, що варто зробити після слів &quot;у вас міома&quot; — запитати подробиці. &quot;Міома&quot; —
          загальна назва для кількох дуже різних ситуацій, і від конкретики залежить усе
          наступне.
        </p>
        <p className="mb-3">
          Міома буває трьох типів:{' '}
          <strong>субмукозна</strong> (росте в порожнину матки),{' '}
          <strong>інтрамуральна</strong> (у стінці),{' '}
          <strong>субсерозна</strong> (на зовнішній поверхні). Від типу безпосередньо
          залежить і метод лікування, і його результативність. Важливий також розмір —
          у сантиметрах, а не словами &quot;невеликий&quot; чи &quot;великий&quot;. І кількість вузлів: один
          вузол 4 см і три вузли по 4 см — різні клінічні ситуації.
        </p>
        <p className="mb-3">
          У висновку УЗД шукайте також класифікацію FIGO (цифра від 0 до 8) — це
          міжнародний стандарт, який описує саме розташування вузла, і лікарі всього
          світу розуміють його однаково.
        </p>
        <div
          className="bg-amber-50 border border-amber-200 rounded-[8px] p-3.5 text-[13px] text-amber-900"
          role="note"
        >
          Міома — доброякісне новоутворення. Вона{' '}
          <strong>не є раком</strong> і <strong>не перероджується в рак</strong>. Це
          ключовий факт, який часто губиться в тривозі після діагнозу.{' '}
          <span className="text-amber-700">[Mayo Clinic]</span>
        </div>
      </>
    ),
  },
  {
    id: 'step-2',
    num: 2,
    title: 'Вирішити — лікування зараз чи спостереження',
    summary: '5 питань, які допоможуть зорієнтуватись',
    content: (
      <>
        <p className="mb-3">
          Лікування при міомі — не обов&apos;язково операція, і не завжди треба &quot;прямо
          зараз&quot;. У багатьох випадках найкращим рішенням є активне спостереження —
          тобто регулярне УЗД і моніторинг гемоглобіну, без втручання в саму міому.
        </p>
        <p className="mb-2 font-semibold text-[14px]">
          П&apos;ять питань для орієнтиру (адаптовано з IQWiG):
        </p>
        <ol className="space-y-2 text-[13px] text-[#0b1a24] mb-3">
          <li className="flex gap-2">
            <span className="text-[#04D3D9] font-bold shrink-0">1.</span>
            <span>
              Чи є у вас симптоми, що заважають повсякденному життю (рясні місячні з
              анемією, хронічний біль, тиск на сечовий міхур)?
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-[#04D3D9] font-bold shrink-0">2.</span>
            <span>Чи плануєте ви вагітність у найближчі 1-2 роки?</span>
          </li>
          <li className="flex gap-2">
            <span className="text-[#04D3D9] font-bold shrink-0">3.</span>
            <span>Чи пробували ви медикаментозне лікування без результату?</span>
          </li>
          <li className="flex gap-2">
            <span className="text-[#04D3D9] font-bold shrink-0">4.</span>
            <span>Чи зростає вузол за даними повторних УЗД?</span>
          </li>
          <li className="flex gap-2">
            <span className="text-[#04D3D9] font-bold shrink-0">5.</span>
            <span>Чи близько ви до менопаузи (45+ років)?</span>
          </li>
        </ol>
        <p className="text-[13px] text-gray-600">
          Якщо відповіли &quot;ні&quot; на більшість — активне спостереження, швидше за все,
          оптимальне. Якщо &quot;так&quot; переважає — час розглядати методи лікування.
        </p>
      </>
    ),
  },
  {
    id: 'step-3',
    num: 3,
    title: 'Обрати метод та клініку',
    summary: 'Переходимо до блоку Методи та квізу',
    content: (
      <>
        <p className="mb-3">
          Визначте який метод вам підходить. Квіз з 5 питань допоможе зорієнтуватись,
          який з шести варіантів відповідає вашій ситуації — тип вузла, вік, плани на
          вагітність, інтенсивність симптомів.
        </p>
        <a
          href="#methods"
          className="inline-flex items-center gap-2 text-[14px] font-semibold text-[#005485] hover:text-[#004070] transition-colors"
        >
          Перейти до блоку Методи лікування
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </a>
      </>
    ),
  },
  {
    id: 'step-4',
    num: 4,
    title: 'Підготуватись, пройти, відновитись',
    summary: 'Три окремі теми в розділі Careway',
    content: (
      <>
        <p className="mb-3">Три окремі теми, кожна з детальним матеріалом у розділі Careway:</p>
        <ul className="space-y-2">
          {[
            {
              href: '/careway/rishennya/yak-obraty-likaria',
              label: 'Як обрати лікаря для гінекологічної операції',
              soon: true,
            },
            {
              href: '/careway/rishennya/pidhotovka-do-operatsiii',
              label: 'Підготовка до планової гінекологічної операції',
              soon: true,
            },
            {
              href: '/careway/rishennya/vidnovlennya-pislia-operatsiii',
              label: 'Відновлення після гінекологічної операції',
              soon: true,
            },
          ].map(({ href, label, soon }) => (
            <li key={href} className="flex items-start gap-2 text-[13px]">
              <svg
                className="w-4 h-4 text-[#04D3D9] shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
              {soon ? (
                <span className="text-gray-400 cursor-not-allowed" aria-disabled="true">
                  {label}{' '}
                  <span className="text-[11px] text-gray-300 ml-1">[скоро]</span>
                </span>
              ) : (
                <a href={href} className="text-[#005485] hover:underline">
                  {label}
                </a>
              )}
            </li>
          ))}
        </ul>
      </>
    ),
  },
];

export default function PatientPath() {
  // Всі 4 кроки закриті за замовчуванням
  const [openId, setOpenId] = useState<string | null>(null);

  const toggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section
      id="patient-path"
      className="px-4 py-12 md:py-16 bg-gray-50"
      aria-labelledby="patient-path-heading"
    >
      <div className="max-w-4xl mx-auto">
        <h2
          id="patient-path-heading"
          className="font-display font-bold text-[22px] md:text-[26px] text-text-primary mb-4 md:mb-5 tracking-tight"
        >
          Маршрут після діагнозу
        </h2>
        <p className="text-[14px] text-gray-600 mb-5 leading-relaxed">
          Діагноз &quot;міома&quot; — не катастрофа, а відправна точка. Від нього до ясного рішення
          — кілька обдуманих кроків. Не поспішайте: планові рішення тут робляться
          тижнями, а не годинами.
        </p>

        <div className="space-y-2">
          {STEPS.map((step) => {
            const isOpen = openId === step.id;
            return (
              <div
                key={step.id}
                className="bg-white border border-gray-200 rounded-[10px] overflow-hidden"
              >
                <button
                  onClick={() => toggle(step.id)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center gap-3 p-4 text-left cursor-pointer bg-transparent border-none hover:bg-gray-50 transition-colors"
                >
                  <div className="step-num shrink-0 text-white font-bold text-[14px] flex items-center justify-center">
                    {step.num}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[15px] font-semibold text-[#0b1a24]">
                      {step.title}
                    </div>
                    <div className="text-[12px] text-gray-500 mt-0.5">{step.summary}</div>
                  </div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 border-t border-gray-100">
                    <div className="pt-3 text-[14px] text-[#0b1a24] leading-relaxed">
                      {step.content}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
