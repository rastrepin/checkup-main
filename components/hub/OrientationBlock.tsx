'use client';

import { useState } from 'react';

const AGE_GROUPS = [
  {
    id: '20-35',
    label: '20–35 років',
    subtitle: 'Фертильність як пріоритет',
    content: (
      <>
        <p className="mb-3">
          Якщо ви плануєте вагітність — зараз або в найближчі роки — рішення по міомі
          приймається з оглядом саме на це. Важливо не тільки усунути симптоми, але й
          зберегти матку та її здатність виносити вагітність.
        </p>
        <p className="mb-3">
          Більшість міом у цьому віці невеликі й не потребують втручання. Операція доцільна
          переважно тоді, коли вузол розташований у порожнині матки (субмукозний) або поруч
          з трубою і це доведено впливає на фертильність чи провокує сильні кровотечі.
          Емболізація маткових артерій (ЕМА) у цей період не рекомендована — вона підвищує
          ризики під час майбутньої вагітності.
        </p>
        <div className="bg-[#e8f4fd] border border-[#005485]/20 rounded-[8px] p-3.5">
          <div className="text-[12px] font-semibold text-[#005485] mb-2 uppercase tracking-wide">
            Три питання до лікаря на цьому етапі
          </div>
          <ul className="space-y-1.5 text-[13px] text-[#0b1a24]">
            <li>— Як саме моя міома впливає на фертильність прямо зараз?</li>
            <li>— Якщо потрібна операція — як вона змінить можливість завагітніти?</li>
            <li>— Коли після лікування можна планувати вагітність?</li>
          </ul>
        </div>
      </>
    ),
  },
  {
    id: '35-45',
    label: '35–45 років',
    subtitle: 'Полегшити симптоми, зберегти якість життя',
    content: (
      <>
        <p className="mb-3">
          У цьому віці пріоритети частіше зміщуються: діти вже народжені (або планів на
          них немає), але попереду ще два десятиліття активного життя. Ключове питання —
          як позбутися симптомів, які заважають, не вдаючись до найрадикальнішого рішення.
        </p>
        <p className="mb-3">
          У цьому віці розширюється набір опцій. До міомектомії додаються ЕМА та
          ФУЗ-абляція, гормональна терапія стає повноцінним інструментом, ВМС з
          прогестероном часто контролює рясні кровотечі без операції. Гістеректомія
          розглядається, але як &quot;остаточне рішення&quot; — коли інші методи вже не підходять.
        </p>
        <div className="bg-[#e8f4fd] border border-[#005485]/20 rounded-[8px] p-3.5">
          <div className="text-[12px] font-semibold text-[#005485] mb-2 uppercase tracking-wide">
            Питання до лікаря
          </div>
          <ul className="space-y-1.5 text-[13px] text-[#0b1a24]">
            <li>— Які неінвазивні варіанти можуть зменшити мої симптоми?</li>
            <li>— Якщо потрібна операція — який метод дасть найшвидше відновлення?</li>
            <li>— Як довго безпечно приймати гормональну терапію?</li>
          </ul>
        </div>
      </>
    ),
  },
  {
    id: '45+',
    label: '45+ років',
    subtitle: 'Дочекатись менопаузи чи діяти зараз',
    content: (
      <>
        <p className="mb-3">
          Після менопаузи міоми переважно зменшуються самі — через спад естрогену. Тому
          одне з перших рішень у цьому віці: чи варто взагалі втручатись, якщо до
          природного регресу залишилось небагато років.
        </p>
        <p className="mb-3">
          Відповідь залежить від двох речей: наскільки виразні симптоми зараз і коли
          очікується менопауза. Якщо симптоми сильні, а до менопаузи ще 2+ роки —
          спостерігати буде надто довго. Якщо ж симптоми помірні та менопауза за пів
          року — часто достатньо потерпіти і моніторити. Окремо: будь-яке нове
          утворення або ріст міоми після менопаузи — завжди привід для додаткового
          обстеження.
        </p>
        <div className="bg-[#e8f4fd] border border-[#005485]/20 rounded-[8px] p-3.5">
          <div className="text-[12px] font-semibold text-[#005485] mb-2 uppercase tracking-wide">
            Питання до лікаря
          </div>
          <ul className="space-y-1.5 text-[13px] text-[#0b1a24]">
            <li>— Як швидко мої симптоми можуть полегшитись природньо?</li>
            <li>— Чи є у моєму випадку ознаки, які потребують додаткового обстеження?</li>
            <li>— Який метод дасть найшвидше відновлення з урахуванням мого віку?</li>
          </ul>
        </div>
      </>
    ),
  },
];

export default function OrientationBlock() {
  // Перша картка відкрита за замовчуванням
  const [openId, setOpenId] = useState<string>('20-35');

  const toggle = (id: string) => {
    setOpenId((prev) => (prev === id ? '' : id));
  };

  return (
    <section className="px-4 py-12 md:py-16 bg-white" aria-labelledby="orientation-heading">
      <div className="max-w-7xl mx-auto">
        <h2
          id="orientation-heading"
          className="font-display font-bold text-[22px] md:text-[26px] text-text-primary mb-4 md:mb-5 tracking-tight"
        >
          Ваш вік впливає на пріоритети
        </h2>
        <p className="text-[14px] text-gray-600 mb-5 leading-relaxed">
          Діагноз &quot;міома&quot; звучить однаково у 25 і у 48 років, але рішення за ним —
          абсолютно різні. Оберіть свою вікову групу, щоб побачити найсуттєвіші акценти.
        </p>

        {/* Mobile: accordion — Desktop md+: 3 cards in row, no accordion */}
        <div className="hidden md:grid md:grid-cols-3 md:gap-6">
          {AGE_GROUPS.map((group) => (
            <div
              key={group.id}
              className="bg-gray-50 border border-gray-200 rounded-[10px] p-5"
            >
              <div className="text-[16px] font-semibold text-[#0b1a24] mb-0.5">{group.label}</div>
              <div className="text-[12px] text-[#005485] font-medium mb-3">{group.subtitle}</div>
              <div className="text-[14px] text-[#0b1a24] leading-relaxed">
                {group.content}
              </div>
            </div>
          ))}
        </div>

        <div className="md:hidden space-y-2">
          {AGE_GROUPS.map((group) => {
            const isOpen = openId === group.id;
            return (
              <div
                key={group.id}
                className="bg-gray-50 border border-gray-200 rounded-[10px] overflow-hidden"
              >
                <button
                  onClick={() => toggle(group.id)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center gap-3 p-4 text-left cursor-pointer bg-transparent border-none hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-[15px] font-semibold text-[#0b1a24]">
                      {group.label}
                    </div>
                    <div className="text-[12px] text-gray-500 mt-0.5">{group.subtitle}</div>
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
                  <div className="px-4 pb-4 border-t border-gray-200">
                    <div className="pt-3 text-[14px] text-[#0b1a24] leading-relaxed">
                      {group.content}
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
