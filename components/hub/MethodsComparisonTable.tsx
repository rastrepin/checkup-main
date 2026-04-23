// TODO: replace prices and clinic counts with Supabase when tables are ready

const METHODS = [
  {
    name: 'Медикаментозне лікування',
    invasiveness: 'Неінвазивне',
    recovery: '—',
    fertility: 'Збережена',
    priceFrom: 'від 2 000 грн/міс',
    where: 'Повсюдно',
  },
  {
    name: 'Гістероскопічна міомектомія',
    invasiveness: 'Мінімальна (через шийку)',
    recovery: '2-4 дні',
    fertility: 'Збережена',
    priceFrom: 'від 15 000 грн',
    where: '8 клінік',
  },
  {
    name: 'Лапароскопічна міомектомія',
    invasiveness: 'Мала (3-4 проколи)',
    recovery: '21 день',
    fertility: 'Збережена',
    priceFrom: 'від 35 000 грн',
    where: '10 клінік',
  },
  {
    name: 'Відкрита міомектомія',
    invasiveness: 'Середня (розріз)',
    recovery: '28 днів',
    fertility: 'Збережена',
    priceFrom: 'від 30 000 грн',
    where: '12 клінік',
  },
  {
    name: 'Емболізація (ЕМА)',
    invasiveness: 'Мінімальна (через катетер)',
    recovery: '~1 тиждень',
    fertility: 'Знижена',
    priceFrom: 'від 45 000 грн',
    where: '4 клініки',
  },
  {
    name: 'Гістеректомія',
    invasiveness: 'Різна',
    recovery: '2-8 тижнів',
    fertility: 'Втрачена',
    priceFrom: 'від 40 000 грн',
    where: 'Повсюдно',
  },
];

export default function MethodsComparisonTable() {
  return (
    <div className="mt-6 overflow-x-auto md:overflow-x-visible -mx-4 px-4 md:mx-0 md:px-0">
      <table className="w-full min-w-[560px] md:min-w-0 text-[13px] border-collapse">
        <thead>
          <tr className="bg-[#005485] text-white">
            <th className="text-left px-3 py-2.5 font-semibold rounded-tl-[8px]">Метод</th>
            <th className="text-left px-3 py-2.5 font-semibold">Відновлення</th>
            <th className="text-left px-3 py-2.5 font-semibold">Фертильність</th>
            <th className="text-left px-3 py-2.5 font-semibold rounded-tr-[8px]">Ціна від</th>
          </tr>
        </thead>
        <tbody>
          {METHODS.map((m, i) => (
            <tr
              key={m.name}
              className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
            >
              <td className="px-3 py-2.5 font-medium text-[#0b1a24]">{m.name}</td>
              <td className="px-3 py-2.5 text-gray-600">{m.recovery}</td>
              <td className="px-3 py-2.5">
                <span
                  className={`inline-block text-[11px] px-2 py-0.5 rounded-full font-medium ${
                    m.fertility === 'Збережена'
                      ? 'bg-green-100 text-green-700'
                      : m.fertility === 'Знижена'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {m.fertility}
                </span>
              </td>
              <td className="px-3 py-2.5 text-[#005485] font-semibold">{m.priceFrom}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-[11px] text-gray-400 mt-2 px-1">
        * Гіпотетичні ціни — TODO: замінити фактичними даними з Supabase
      </p>
    </div>
  );
}
