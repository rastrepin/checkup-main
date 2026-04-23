export default function WhenToActBlock() {
  return (
    <section className="px-4 py-12 md:py-16 bg-gray-50 h-full" aria-labelledby="when-to-act-heading">
      <div className="max-w-2xl mx-auto md:max-w-none">
        <h2 id="when-to-act-heading" className="font-display font-bold text-[22px] md:text-[26px] text-text-primary mb-4 md:mb-5 tracking-tight">
          Коли чекати, а коли потрібне лікування
        </h2>

        <p className="text-[14px] text-gray-600 leading-relaxed mb-5">
          Активне спостереження — нормальна медична стратегія, не &quot;ігнорування&quot;. Різниця
          в тому, що ви регулярно контролюєте ситуацію і маєте план дій, якщо щось
          змінюється.
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Спостереження */}
          <div className="bg-green-50 border border-green-200 rounded-[10px] p-4">
            <div className="flex items-center gap-2 mb-3">
              <svg
                className="w-4 h-4 text-green-600 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <div className="text-[13px] font-bold text-green-700 uppercase tracking-wide">
                Спостереження зазвичай підходить, якщо:
              </div>
            </div>
            <ul className="space-y-1.5 text-[13px] text-green-900">
              {[
                'Міома не дає симптомів',
                'Розмір стабільний за двома і більше УЗД',
                'Ви плануєте вагітність і вузол не заважає зачаттю',
                'Вам за 45 і до менопаузи менше двох років',
                'За аналізами немає анемії',
              ].map((item) => (
                <li key={item} className="flex items-start gap-1.5">
                  <svg className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Лікування */}
          <div className="bg-orange-50 border border-orange-200 rounded-[10px] p-4">
            <div className="flex items-center gap-2 mb-3">
              <svg
                className="w-4 h-4 text-orange-600 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
              <div className="text-[13px] font-bold text-orange-700 uppercase tracking-wide">
                Активне лікування доцільне, якщо:
              </div>
            </div>
            <ul className="space-y-1.5 text-[13px] text-orange-900">
              {[
                'Рясні місячні призвели до анемії (гемоглобін < 110 г/л)',
                'Хронічний тазовий біль впливає на щоденне життя',
                'Вузол тисне на сечовий міхур чи пряму кишку',
                'Вузол швидко збільшується',
                'При безплідді виявлена субмукозна міома [Mayo Clinic, ACOG]',
              ].map((item) => (
                <li key={item} className="flex items-start gap-1.5">
                  <svg className="w-3.5 h-3.5 text-orange-500 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <blockquote className="mt-5 border-l-4 border-[#04D3D9] pl-4 text-[14px] text-gray-600 italic">
          Спостереження — це не &quot;почекати і подивитись&quot;. Це активний моніторинг з чіткими
          критеріями, коли переходити до лікування.
        </blockquote>
      </div>
    </section>
  );
}
