'use client';

import { useState } from 'react';

const METHODS = [
  {
    id: 'medications',
    title: 'Медикаментозне лікування',
    badge: 'Без операції',
    badgeColor: 'bg-green-100 text-green-700',
    content: (
      <>
        <p className="mb-3">
          Медикаменти не усувають міому, але можуть контролювати її симптоми — рясні
          кровотечі, біль, анемію. Це перша лінія для жінок з помірними симптомами, які
          хочуть уникнути операції або наближаються до менопаузи.
        </p>
        <p className="mb-3">
          Перелік інструментів досить широкий: оральні контрацептиви вирівнюють цикл і
          зменшують крововтрату, ВМС з прогестероном часто стає довгостроковим рішенням
          для рясних місячних, НПЗП типу ібупрофену контролюють біль. Окрема категорія
          — ГнРГ-агоністи: вони &quot;вимикають&quot; яєчники на короткий період (до 6 місяців),
          за який вузол зменшується на 36% за 3 місяці або на 45% за 6 місяців
          [StatPearls].
        </p>
        <p className="text-[13px] text-gray-600 italic">
          Головне обмеження: після припинення терапії симптоми часто повертаються разом
          із розмірами вузла.
        </p>
      </>
    ),
  },
  {
    id: 'hystero',
    title: 'Гістероскопічна міомектомія',
    badge: 'Без розрізів',
    badgeColor: 'bg-blue-100 text-blue-700',
    content: (
      <>
        <p className="mb-3">
          Найменш інвазивний хірургічний метод. Тонкий інструмент (гістероскоп) вводиться
          через шийку матки, вузол видаляється зсередини — без жодних розрізів зовні.
          Підходить <strong>виключно для субмукозних вузлів</strong>.
        </p>
        <div className="grid grid-cols-2 gap-2 mb-3">
          {[
            { label: 'Виписка', value: 'того ж дня' },
            { label: 'Повернення до активності', value: 'через 48 год' },
            { label: 'Повне видалення (тип 0)', value: '97% випадків' },
            { label: 'Покращення якості життя', value: '94% жінок' },
          ].map(({ label, value }) => (
            <div key={label} className="bg-gray-50 rounded-[8px] p-2.5">
              <div className="text-[11px] text-gray-500 mb-0.5">{label}</div>
              <div className="text-[13px] font-semibold text-[#005485]">{value}</div>
            </div>
          ))}
        </div>
      </>
    ),
  },
  {
    id: 'laparo',
    title: 'Лапароскопічна міомектомія',
    badge: 'Зберігає матку',
    badgeColor: 'bg-teal-100 text-teal-700',
    content: (
      <>
        <p className="mb-3">
          Стандартний метод для інтрамуральних і субсерозних вузлів у жінок, які планують
          вагітність [Mayo Clinic, ACOG]. 3-4 невеликі проколи, вузли видаляються, матка
          зшивається.
        </p>
        <p className="mb-3">
          Метод рекомендований переважно при невеликій кількості вузлів. Повернення до
          звичайної активності — через 21 день, до роботи — на 20 днів раніше, ніж після
          відкритої операції [StatPearls].
        </p>
        <p className="text-[13px] text-gray-700">
          <strong>Для тих, хто планує вагітність:</strong> ризик розриву матки під час
          пологів — близько 1% [StatPearls]. Вагітність планується не раніше ніж через
          6 місяців після операції [МОЗ Наказ №147].
        </p>
      </>
    ),
  },
  {
    id: 'open',
    title: 'Відкрита міомектомія (лапаротомія)',
    badge: 'Великі вузли',
    badgeColor: 'bg-orange-100 text-orange-700',
    content: (
      <>
        <p className="mb-3">
          Горизонтальний розріз унизу живота, подібний до кесаревого. Метод показаний
          при дуже великих вузлах (&gt;10-12 см), великій їх кількості, або коли
          лапароскопія технічно неможлива.
        </p>
        <p className="text-[13px] text-gray-700">
          Матка зберігається, фертильність зберігається. Відновлення — 28 днів
          [StatPearls], госпіталізація 4-7 днів.
        </p>
      </>
    ),
  },
  {
    id: 'ema',
    title: 'Емболізація маткових артерій (ЕМА)',
    badge: 'Без операції',
    badgeColor: 'bg-purple-100 text-purple-700',
    content: (
      <>
        <p className="mb-3">
          Через катетер у стегновій артерії в маткові артерії вводиться речовина, що
          перекриває кровопостачання вузла — без живлення міома поступово &quot;всихає&quot;
          [Mayo Clinic].
        </p>
        <div className="grid grid-cols-2 gap-2 mb-3">
          {[
            { label: 'Зменшення симптомів', value: '~90%' },
            { label: 'Відновлення', value: '~1 тиждень' },
            { label: 'Збереження ефекту (5 р)', value: '83%' },
            { label: 'Повторне втручання (5 р)', value: '19-38%' },
          ].map(({ label, value }) => (
            <div key={label} className="bg-gray-50 rounded-[8px] p-2.5">
              <div className="text-[11px] text-gray-500 mb-0.5">{label}</div>
              <div className="text-[13px] font-semibold text-[#005485]">{value}</div>
            </div>
          ))}
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-[8px] p-3 text-[12px] text-amber-900">
          <strong>Не для тих, хто планує вагітність:</strong> ЕМА підвищує ризик викидня
          у 2.8 раза і кровотечі у 6.4 раза [StatPearls].
        </div>
      </>
    ),
  },
  {
    id: 'hysterectomy',
    title: 'Гістеректомія',
    badge: 'Остаточне рішення',
    badgeColor: 'bg-gray-100 text-gray-600',
    content: (
      <>
        <p className="mb-3">
          Повне видалення матки. Розглядається для жінок, які не планують вагітність,
          при тяжких симптомах або коли інші методи не дали результату [Mayo Clinic].
        </p>
        <p className="mb-3">
          Три підходи: вагінальний (найшвидше відновлення), лапароскопічний/роботизований,
          абдомінальний (для великих пухлин).
        </p>
        <p className="text-[13px] text-gray-700">
          <strong>Наслідки:</strong> постійна стерильність, припинення менструацій.
          Реабілітація — 6-8 тижнів. Через 2 роки після операції відзначається значне
          покращення якості життя [Mayo Clinic].
        </p>
      </>
    ),
  },
];

export default function MethodCards() {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="mt-4 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-4 md:space-y-0 space-y-2">
      {METHODS.map((method) => {
        const isOpen = openId === method.id;
        return (
          <div
            key={method.id}
            className="bg-white border border-gray-200 rounded-[10px] overflow-hidden"
          >
            <button
              onClick={() => setOpenId(isOpen ? null : method.id)}
              aria-expanded={isOpen}
              className="w-full flex items-start gap-3 p-4 text-left cursor-pointer bg-transparent border-none hover:bg-gray-50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[15px] font-semibold text-[#0b1a24]">
                    {method.title}
                  </span>
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${method.badgeColor}`}
                  >
                    {method.badge}
                  </span>
                </div>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`w-4 h-4 text-gray-400 shrink-0 mt-1 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
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
                  {method.content}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
