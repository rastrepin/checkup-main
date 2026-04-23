export default function RedFlagsBlock() {
  const flags = [
    'Кровотеча настільки інтенсивна, що прокладка чи тампон промокають повністю за 30-60 хвилин кілька разів підряд',
    'З\'явились запаморочення, слабкість, прискорене серцебиття на фоні кровотечі (ознаки значної крововтрати)',
    'Рясна кровотеча з\'явилась після менопаузи — через рік і більше після останньої менструації [Mayo Clinic]',
    'Рясна кровотеча з сильним болем у першому триместрі вагітності (підозра на викидень або позаматкову вагітність) [Mayo Clinic]',
  ];

  return (
    <section className="px-4 py-8 bg-white" aria-labelledby="red-flags-heading">
      <div className="max-w-3xl mx-auto">
        <h2 id="red-flags-heading" className="text-[22px] font-bold text-[#0b1a24] mb-4">
          Червоні прапорці — коли терміново
        </h2>

        <p className="text-[14px] text-gray-600 mb-4">
          Деякі ситуації не чекають планового запису.
        </p>

        <div
          className="bg-red-50 border border-red-200 rounded-[10px] p-4"
          role="alert"
          aria-label="Ситуації, що потребують негайного звернення до лікаря"
        >
          <div className="flex items-center gap-2 mb-3">
            <svg
              className="w-4 h-4 text-red-600 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <span className="text-[13px] font-bold text-red-700 uppercase tracking-wide">
              Негайно зверніться до лікаря або викличте швидку, якщо:
            </span>
          </div>

          <ul className="space-y-2.5">
            {flags.map((flag, i) => (
              <li key={i} className="flex items-start gap-2 text-[13px] text-red-900">
                <span className="text-red-500 font-bold mt-0.5 shrink-0">!</span>
                {flag}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
