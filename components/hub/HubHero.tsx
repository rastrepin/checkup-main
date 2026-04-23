import Link from 'next/link';

// TODO: replace with Supabase when tables are ready
const STATS = {
  clinics_count: 12,
  cities_count: 7,
  doctors_count: 28,
};

export default function HubHero() {
  return (
    <section
      className="bg-[#05121e] text-white px-4 pt-10 pb-8"
      aria-labelledby="hub-h1"
    >
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <nav aria-label="Навігація" className="text-[12px] text-gray-400 mb-5">
          <Link href="/" className="hover:text-white transition-colors">
            check-up.in.ua
          </Link>
          <span className="mx-1.5 text-gray-600">/</span>
          <Link href="/cases" className="hover:text-white transition-colors">
            Діагнози
          </Link>
          <span className="mx-1.5 text-gray-600">/</span>
          <span className="text-gray-300">Міома матки</span>
        </nav>

        {/* Desktop: 2 columns — text 60% left, stats+CTA 40% right */}
        <div className="md:flex md:gap-10 md:items-start">
          {/* Left column: text */}
          <div className="md:w-[60%]">
            <h1
              id="hub-h1"
              className="text-[28px] md:text-[36px] leading-[1.25] font-bold text-white mb-2"
              style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
            >
              Міома матки — методи лікування, клініки та ціни в Україні
            </h1>

            <span className="h1-teal-line" aria-hidden="true" />

            <p className="mt-4 text-[15px] text-gray-300 leading-relaxed">
              Розбираємось крок за кроком: коли достатньо спостерігати, коли потрібне лікування,
              як обрати метод та лікаря. Матеріал підготовлений на основі Mayo Clinic Family Health
              Book, стандартів МОЗ України та рецензії практикуючого акушера-гінеколога.
            </p>
          </div>

          {/* Right column: stats + CTA */}
          <div className="md:w-[40%]">
            {/* Статистика — 4 картки */}
            <div className="grid grid-cols-2 gap-3 mt-6 md:mt-0">
              <div className="bg-white/10 rounded-[10px] p-3.5">
                <div className="text-[22px] font-bold text-[#04D3D9]">7 з 10</div>
                <div className="text-[12px] text-gray-300 mt-0.5 leading-snug">
                  жінок хоча б раз у житті виявляють міому матки <span className="text-gray-500">[Mayo Clinic]</span>
                </div>
              </div>
              <div className="bg-white/10 rounded-[10px] p-3.5">
                <div className="text-[22px] font-bold text-[#04D3D9]">6</div>
                <div className="text-[12px] text-gray-300 mt-0.5 leading-snug">
                  варіантів підходу — від спостереження до операції
                </div>
              </div>
              {/* TODO: replace with Supabase when tables are ready */}
              <div className="bg-white/10 rounded-[10px] p-3.5">
                <div className="text-[22px] font-bold text-[#04D3D9]">{STATS.clinics_count}</div>
                <div className="text-[12px] text-gray-300 mt-0.5 leading-snug">
                  клінік у {STATS.cities_count} містах України — операції з міоми та гінекологія
                </div>
              </div>
              <div className="bg-white/10 rounded-[10px] p-3.5">
                <div className="text-[22px] font-bold text-[#04D3D9]">{STATS.doctors_count}</div>
                <div className="text-[12px] text-gray-300 mt-0.5 leading-snug">
                  лікарів з профільним досвідом у гінекологічній хірургії
                </div>
              </div>
            </div>

            {/* CTA — 3 кнопки з сегментацією */}
            <div className="flex flex-col gap-2.5 mt-6">
              <a
                href="#patient-path"
                className="block w-full py-3.5 text-center bg-[#d60242] text-white text-[15px] font-semibold rounded-[10px] hover:bg-[#b5003a] transition-colors"
              >
                Я щойно дізналась про діагноз
              </a>
              <a
                href="#methods"
                className="block w-full py-3.5 text-center bg-white/10 text-white text-[15px] font-semibold rounded-[10px] hover:bg-white/20 transition-colors border border-white/20"
              >
                Я обираю метод та клініку
              </a>
              <a
                href="#lead-form"
                className="block w-full py-3.5 text-center bg-transparent text-[#04D3D9] text-[15px] font-semibold rounded-[10px] border border-[#04D3D9] hover:bg-[#04D3D9]/10 transition-colors"
              >
                Мені потрібна онлайн-консультація
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
