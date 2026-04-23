// TODO: replace with Supabase when tables are ready (private prices)

const PRIVATE_PRICES = [
  { method: 'Гістероскопічна міомектомія', priceFrom: 'від 15 000 грн' },
  { method: 'Лапароскопічна міомектомія', priceFrom: 'від 35 000 грн' },
  { method: 'Відкрита міомектомія', priceFrom: 'від 30 000 грн' },
  { method: 'Емболізація (ЕМА)', priceFrom: 'від 45 000 грн' },
  { method: 'Гістеректомія', priceFrom: 'від 40 000 грн' },
];

const INCLUDED = [
  'Сама операція',
  'Анестезія',
  'Стаціонар (1–3 доби)',
  "Перев'язки та виписка",
  'Контрольний огляд через місяць',
];

const NOT_INCLUDED = [
  'Передопераційне обстеження (1 500–2 500 грн)',
  'Медикаменти для домашнього прийому',
  'Додаткова гістопатологія',
];

export default function PricingBlock() {
  return (
    <section className="px-4 py-12 md:py-16 bg-white" aria-labelledby="pricing-heading">
      <div className="max-w-7xl mx-auto">
        <h2
          id="pricing-heading"
          className="font-display font-bold text-[22px] md:text-[26px] text-text-primary mb-4 md:mb-5 tracking-tight"
        >
          Вартість лікування
        </h2>

        <p className="text-[14px] text-gray-600 leading-relaxed mb-6">
          Ціни у приватних клініках залежать від методу, клініки, типу анестезії та обсягу
          операції. Нижче — орієнтовні ціни квітня 2026 року для основних методів.
        </p>

        {/* Pricing table — full width */}
        <div className="overflow-x-auto -mx-4 px-4 mb-6">
          <table className="w-full text-[13px] border-collapse min-w-[320px]">
            <thead>
              <tr className="bg-[#005485] text-white">
                <th className="text-left px-3 py-2.5 font-semibold rounded-tl-[8px]">Метод</th>
                <th className="text-left px-3 py-2.5 font-semibold rounded-tr-[8px]">Ціна від</th>
              </tr>
            </thead>
            <tbody>
              {PRIVATE_PRICES.map((p, i) => (
                <tr key={p.method} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-3 py-2.5 text-[#0b1a24]">{p.method}</td>
                  <td className="px-3 py-2.5 text-[#005485] font-semibold">{p.priceFrom}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-[11px] text-gray-400 mt-1.5 px-1">
            * Гіпотетичні ціни — TODO: замінити фактичними з Supabase
          </p>
        </div>

        {/* Included / Not included — 2 symmetric columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-green-50 border border-green-200 rounded-[10px] p-4">
            <div className="text-[12px] font-bold text-green-700 mb-2 uppercase tracking-wide">
              Зазвичай входить
            </div>
            <ul className="space-y-1.5 text-[12px] text-green-900">
              {INCLUDED.map((item) => (
                <li key={item} className="flex items-start gap-1.5">
                  <span className="text-green-500 mt-0.5 shrink-0">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-[10px] p-4">
            <div className="text-[12px] font-bold text-red-700 mb-2 uppercase tracking-wide">
              Зазвичай НЕ входить
            </div>
            <ul className="space-y-1.5 text-[12px] text-red-900">
              {NOT_INCLUDED.map((item) => (
                <li key={item} className="flex items-start gap-1.5">
                  <span className="text-red-400 mt-0.5 shrink-0">×</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
