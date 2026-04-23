export default function SymptomHero() {
  return (
    <section
      className="bg-[#05121e] text-white px-4 pt-10 pb-8"
      aria-labelledby="symptom-h1"
    >
      <div className="max-w-3xl mx-auto">
        {/* Breadcrumb */}
        <nav aria-label="Навігація" className="text-[12px] text-gray-400 mb-5">
          <a href="/" className="hover:text-white transition-colors">check-up.in.ua</a>
          <span className="mx-1.5 text-gray-600">/</span>
          <a href="/careway" className="hover:text-white transition-colors">Careway</a>
          <span className="mx-1.5 text-gray-600">/</span>
          <a href="/careway/simptomy" className="hover:text-white transition-colors">Симптоми</a>
          <span className="mx-1.5 text-gray-600">/</span>
          <span className="text-gray-300">Рясні місячні</span>
        </nav>

        <h1
          id="symptom-h1"
          className="text-[28px] leading-[1.25] font-bold text-white mb-2"
          style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
        >
          Рясні місячні — що це може бути і коли звернутись до лікаря
        </h1>

        <span className="h1-teal-line" aria-hidden="true" />

        <p className="mt-4 text-[15px] text-gray-300 leading-relaxed">
          Зрозуміти, чи ваші місячні — варіант норми, чи сигнал про захворювання, яке
          потребує уваги. З чого почати діагностику і коли не відкладати звернення до
          лікаря.
        </p>

        <p className="mt-3 text-[13px] text-gray-400 leading-relaxed border-l-2 border-gray-600 pl-3">
          Рясні місячні — не діагноз, а симптом. За ним може стояти кілька дуже різних
          ситуацій: від гормонального збою до міоми чи поліпа в матці. Ця сторінка
          допоможе зорієнтуватись — впізнати ознаки, що варто звернутись до лікаря, і
          зрозуміти, які обстеження мають сенс. Вона не замінює консультацію і не ставить
          діагноз: це роблять тільки лікарі після огляду.
        </p>

        {/* CTA — 2 кнопки */}
        <div className="flex flex-col gap-2.5 mt-6">
          <a
            href="#lead-form"
            className="block w-full py-3.5 text-center bg-[#d60242] text-white text-[15px] font-semibold rounded-[10px] hover:bg-[#b5003a] transition-colors"
          >
            Записатись на консультацію гінеколога
          </a>
          <a
            href="#clinics"
            className="block w-full py-3.5 text-center bg-white/10 text-white text-[15px] font-semibold rounded-[10px] hover:bg-white/20 transition-colors border border-white/20"
          >
            Побачити клініки у моєму місті
          </a>
        </div>
      </div>
    </section>
  );
}
