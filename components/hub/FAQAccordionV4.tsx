'use client';

import { useState } from 'react';

// ─── 5 питань v4 — скорочено з 8 ─────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    id: 'faq-1',
    q: 'Чи завжди потрібна операція при міомі?',
    a: 'Ні. Якщо міома не дає симптомів, її розмір стабільний і немає анемії — лікар запропонує спостереження: УЗД раз на рік та контроль гемоглобіну. Операцію рекомендують коли вузол спричиняє кровотечі, біль, тисне на сусідні органи або заважає завагітніти.',
  },
  {
    id: 'faq-2',
    q: 'Чи можна завагітніти після видалення міоми?',
    a: 'Обидва зберігаючі методи (гістероскопічна та лапароскопічна міомектомія) залишають матку. Після лапароскопічної міомектомії вагітність планують через 6–12 місяців — час на формування рубця. Більшість жінок успішно виношують дитину.',
  },
  {
    id: 'faq-3',
    q: 'Чим відрізняється гістероскопія від лапароскопії?',
    a: 'Залежить від того, де саме росте вузол. Вузли в порожнині матки видаляють гістероскопічно — без розрізів, виписка в той самий день. Вузли в стінці або зовні матки — лапароскопічно через 3 проколи, стаціонар 2–3 дні.',
  },
  {
    id: 'faq-4',
    q: 'Чи може міома перейти у рак?',
    a: 'Міома — доброякісна пухлина і не перероджується. Лейоміосаркома (злоякісна пухлина м\'язової тканини матки) — окреме, дуже рідкісне захворювання.',
  },
  {
    id: 'faq-5',
    q: 'Що робити, якщо у моєму місті немає партнерської клініки?',
    a: 'Пропонуємо онлайн-консультацію з акушером-гінекологом. Лікар оцінить ваш випадок за УЗД і висновком, допоможе скласти план дій і, якщо операція потрібна, порекомендує клініку у найближчому місті.',
  },
];

export default function FAQAccordionV4() {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <section className="py-12 md:py-16 bg-gray-50" aria-labelledby="faq-v4-heading">
      <div className="max-w-3xl mx-auto px-4 md:px-6">
        <h2
          id="faq-v4-heading"
          className="font-bold text-[22px] md:text-[28px] text-[#0b1a24] mb-8 tracking-tight"
          style={{ fontFamily: "'Fixel Display', system-ui, sans-serif" }}
        >
          Питання та відповіді
        </h2>

        <div
          className="space-y-2"
          itemScope
          itemType="https://schema.org/FAQPage"
        >
          {FAQ_ITEMS.map((item) => {
            const isOpen = openId === item.id;
            return (
              <div
                key={item.id}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden"
                itemScope
                itemProp="mainEntity"
                itemType="https://schema.org/Question"
              >
                <button
                  onClick={() => setOpenId(isOpen ? null : item.id)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center gap-3 p-4 md:p-5 text-left cursor-pointer bg-transparent border-none hover:bg-gray-50 transition-colors"
                >
                  <span
                    className="flex-1 text-[15px] font-semibold text-[#0b1a24]"
                    itemProp="name"
                  >
                    {item.q}
                  </span>
                  <svg
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
                    className="px-4 md:px-5 pb-4 md:pb-5 border-t border-gray-100"
                    itemScope
                    itemProp="acceptedAnswer"
                    itemType="https://schema.org/Answer"
                  >
                    <p
                      className="pt-4 text-[14px] text-[#4a5a6b] leading-relaxed"
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
