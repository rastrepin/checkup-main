'use client';

import { useState } from 'react';

const FAQ_ITEMS = [
  {
    id: 'faq-1',
    q: 'Чи може міома перейти в рак?',
    a: 'Звичайна міома — доброякісне утворення і не перероджується на рак. Окремий тип — лейоміосаркома — дуже рідкісний (менше 1 на 1000 випадків) і розвивається самостійно, а не з існуючої міоми [Mayo Clinic]. Підозра на лейоміосаркому виникає у випадках швидкого росту, нетипової картини на УЗД, ситуації в постменопаузі.',
  },
  {
    id: 'faq-2',
    q: 'Чи можна планувати вагітність при міомі?',
    a: 'Більшість жінок з міомою можуть завагітніти природнім шляхом. Втручання перед вагітністю доцільне переважно у двох ситуаціях: субмукозні вузли, що деформують порожнину матки, та доведене безпліддя, пов\'язане саме з міомою [Mayo Clinic, ACOG].',
  },
  {
    id: 'faq-3',
    q: 'Скільки часу треба чекати вагітність після міомектомії?',
    a: 'За стандартами МОЗ України — не раніше ніж через 6 місяців після операції. Це час, потрібний для формування міцного рубця на матці. Якщо розріз під час операції заходив у порожнину матки, лікар може рекомендувати довший період і плановий кесарів розтин на 37-38 тижні вагітності [МОЗ Наказ №147, Mayo Clinic].',
  },
  {
    id: 'faq-4',
    q: 'Як змінюється міома після менопаузи?',
    a: 'Зазвичай міоми зменшуються після менопаузи — через спад рівня естрогену. Але будь-яке зростання міоми після менопаузи — показання до додаткового обстеження для виключення онкологічного процесу [Mayo Clinic].',
  },
  {
    id: 'faq-5',
    q: 'Чи потрібна друга думка перед операцією?',
    a: 'Друга думка — нормальна практика при будь-якій плановій операції. Вона допомагає перевірити правильність вибору методу та клініки, і лікар не повинен сприймати це як сумнів у його компетентності. Хороший лікар часто сам пропонує звернутись за другою думкою, якщо випадок складний або нетиповий.',
  },
  {
    id: 'faq-6',
    q: 'Скільки триває реабілітація після лапароскопічної міомектомії?',
    a: 'Повернення до звичайної активності — через 21 день [StatPearls]. Повернення до роботи — на 20 днів раніше, ніж після відкритої операції. Статеве життя та спорт — через 2-4 тижні, але точний термін визначає лікар на контрольному огляді.',
  },
  {
    id: 'faq-7',
    q: 'Що таке FIGO-класифікація, яку написав у висновку лікар?',
    a: 'FIGO — міжнародна класифікація міом за розташуванням, від 0 до 8. Типи 0-1 — субмукозні (у порожнині матки), 2-5 — з різним ступенем проникнення у стінку, 6-8 — субсерозні. Цей код універсальний: лікар у Києві й лікар у Берліні зрозуміють вашу ситуацію однаково.',
  },
  {
    id: 'faq-8',
    q: 'Чи допоможе ЕМА, якщо я планую ще одну дитину?',
    a: 'Емболізація не рекомендована як перша лінія для жінок, що планують вагітність. Дослідження показують підвищення ризику викидня у 2.8 раза і післяпологової кровотечі у 6.4 раза після ЕМА [StatPearls]. Для таких пацієнток міомектомія залишається пріоритетним методом.',
  },
];

export default function FAQAccordion() {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <section className="px-4 py-8 md:py-10 bg-gray-50" aria-labelledby="faq-heading">
      <div className="max-w-3xl mx-auto">
        <h2 id="faq-heading" className="font-display font-bold text-[22px] md:text-[26px] text-text-primary mb-4 md:mb-5 tracking-tight">
          Питання та відповіді
        </h2>

        <div className="space-y-2">
          {FAQ_ITEMS.map((item) => {
            const isOpen = openId === item.id;
            return (
              <div
                key={item.id}
                className="bg-white border border-gray-200 rounded-[10px] overflow-hidden"
                itemScope
                itemProp="mainEntity"
                itemType="https://schema.org/Question"
              >
                <button
                  onClick={() => setOpenId(isOpen ? null : item.id)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center gap-3 p-4 text-left cursor-pointer bg-transparent border-none hover:bg-gray-50 transition-colors"
                  itemProp="name"
                >
                  <div className="flex-1 text-[15px] font-semibold text-[#0b1a24]">{item.q}</div>
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
                  <div
                    className="px-4 pb-4 border-t border-gray-100"
                    itemScope
                    itemProp="acceptedAnswer"
                    itemType="https://schema.org/Answer"
                  >
                    <p
                      className="pt-3 text-[14px] text-[#0b1a24] leading-relaxed"
                      itemProp="text"
                    >
                      {item.a}
                    </p>
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
