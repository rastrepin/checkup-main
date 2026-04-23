export default function ExaminationsBlock() {
  return (
    <section className="px-4 py-8 bg-white" aria-labelledby="examinations-heading">
      <div className="max-w-3xl mx-auto">
        <h2 id="examinations-heading" className="text-[22px] font-bold text-[#0b1a24] mb-4">
          Які обстеження мають сенс
        </h2>

        <p className="text-[14px] text-gray-600 mb-4 leading-relaxed">
          Коли записуєтесь до гінеколога з рясними місячними, корисно уявляти, які
          обстеження вас імовірно чекають. Це допомагає менше хвилюватись і підготувати
          потрібне заздалегідь.
        </p>

        {/* Базовий набір */}
        <div className="mb-4">
          <h3 className="text-[15px] font-bold text-[#005485] mb-3 uppercase tracking-wide text-[12px]">
            Базовий набір
          </h3>
          <div className="space-y-2.5">
            {[
              {
                name: 'УЗД органів малого тазу',
                desc: 'Бажано на 5-10 день циклу. Виявляє міоми, поліпи, ознаки аденоміозу, кісти.',
              },
              {
                name: 'Загальний аналіз крові з гемоглобіном',
                desc: 'Показує, чи не розвинулась анемія.',
              },
              {
                name: 'Феритин',
                desc: 'Більш тонкий показник запасів заліза — знижується раніше за гемоглобін.',
              },
              {
                name: 'Гінекологічний огляд + PAP-тест',
                desc: 'Плановий огляд і скринінг шийки матки.',
              },
            ].map((item) => (
              <div
                key={item.name}
                className="flex items-start gap-3 bg-gray-50 rounded-[8px] p-3"
              >
                <svg
                  className="w-4 h-4 text-[#04D3D9] shrink-0 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
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

        {/* Додаткові */}
        <div className="mb-5">
          <h3 className="text-[12px] font-bold text-[#005485] mb-3 uppercase tracking-wide">
            Додаткові (при показаннях)
          </h3>
          <div className="space-y-2">
            {[
              'Аналізи на гормони (ФСГ, ЛГ, естрадіол, прогестерон, ТТГ, Т4) — при підозрі на ендокринні причини',
              'Коагулограма — якщо є ознаки порушення згортання',
              'МРТ малого тазу — при складній картині або підозрі на аденоміоз',
              'Гістероскопія — діагностична або операційна (видалення поліпа/вузла)',
            ].map((item) => (
              <div key={item} className="flex items-start gap-2 text-[13px] text-gray-700">
                <span className="text-gray-400 shrink-0 mt-0.5">›</span>
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Що взяти */}
        <div className="bg-blue-50 border border-blue-200 rounded-[10px] p-4">
          <h3 className="text-[13px] font-bold text-blue-700 mb-2">
            Що взяти на прийом до лікаря
          </h3>
          <ul className="space-y-1.5 text-[13px] text-blue-900">
            {[
              'Менструальний календар за останні 3-6 місяців (дати, оцінка обсягу, біль)',
              'Попередні УЗД, якщо робили',
              'Список препаратів, які приймаєте регулярно',
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
  );
}
