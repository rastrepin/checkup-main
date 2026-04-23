// TODO: reviewer comment is a hypothetical placeholder — replace with actual quote from Trоkhymovych R.M.

const SOURCES = [
  'Mayo Clinic Family Health Book (розділ Uterine Fibroids)',
  'ACOG Practice Bulletin #228 — Management of Symptomatic Uterine Leiomyomas',
  'МОЗ України, Наказ №147 (2023) — Стандарти медичної допомоги «Лейоміома матки»',
  'StatPearls — Uterine Fibroids (останнє оновлення 2024)',
  'IQWiG — Patient Decision Aid: Uterine Fibroids',
  'RCOG Green-top Guidelines #34 (Myomectomy), #59 (Best practice in outpatient hysteroscopy)',
];

interface EEATBlockProps {
  reviewerComment?: string;
}

export default function EEATBlock({ reviewerComment }: EEATBlockProps) {
  // TODO: replace hardcoded comment with actual quote when confirmed by reviewer
  const comment =
    reviewerComment ??
    'Рішення про операцію при міомі — ніколи не термінове, крім виняткових випадків гострого болю. Я завжди прошу пацієнтку взяти тиждень на роздуми, уточнити другу думку, якщо є сумніви. Операція, зроблена без розуміння пацієнткою — це наполовину зроблена робота.';

  return (
    <section className="px-4 py-8 bg-gray-50" aria-labelledby="eeat-heading">
      <div className="max-w-7xl mx-auto">
        <h2
          id="eeat-heading"
          className="text-[18px] font-bold text-[#0b1a24] mb-4"
        >
          Про матеріал
        </h2>

        {/* Desktop: 2 cols — left: author+reviewer+blockquote, right: methodology+sources */}
        <div className="md:grid md:grid-cols-2 md:gap-8 md:items-start">
        {/* Left column */}
        <div>
        {/* Автор + рецензент */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 mb-5">
          <div
            className="bg-white border border-gray-200 rounded-[10px] p-3.5"
            itemScope
            itemType="https://schema.org/Person"
          >
            <div className="text-[11px] text-gray-400 uppercase tracking-wide mb-1">Автор</div>
            <div
              className="text-[14px] font-bold text-[#0b1a24]"
              itemProp="name"
            >
              Ігор Растрепін
            </div>
            <div className="text-[12px] text-gray-500" itemProp="jobTitle">
              Медичний редактор check-up.in.ua
            </div>
          </div>

          <div
            className="bg-white border border-gray-200 rounded-[10px] p-3.5"
            itemScope
            itemType="https://schema.org/Physician"
          >
            <div className="text-[11px] text-gray-400 uppercase tracking-wide mb-1">Рецензент</div>
            <a
              href="https://rokl.check-up.in.ua/doctors/trokhymovych-ruslana?case=gisteroskopichne-vydalennya"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[14px] font-bold text-[#005485] hover:underline"
              itemProp="name"
            >
              Трохимович Руслана Миколаївна →
            </a>
            <div className="text-[12px] text-gray-500" itemProp="description">
              Акушер-гінеколог, вища категорія, 26 років досвіду
            </div>
          </div>
        </div>

        {/* Коментар рецензента */}
        <blockquote className="bg-white border-l-4 border-[#04D3D9] rounded-r-[10px] p-4 mb-5">
          <p className="text-[14px] text-[#0b1a24] leading-relaxed italic mb-2">
            &ldquo;{comment}&rdquo;
          </p>
          <footer className="text-[12px] text-gray-500">
            — Трохимович Р.М.
          </footer>
          <p className="text-[11px] text-gray-400 mt-1">
            * TODO: підтвердити цитату з рецензентом
          </p>
        </blockquote>

        {/* Дата оновлення */}
        <p className="text-[12px] text-gray-500 mb-4">
          Останнє оновлення:{' '}
          <time dateTime="2026-04-17">квітень 2026</time>
        </p>
        </div>{/* end left column */}

        {/* Right column */}
        <div>
        {/* Методологія */}
        <div className="mb-4">
          <div className="text-[12px] font-semibold text-gray-600 uppercase tracking-wide mb-2">
            Методологія
          </div>
          <p className="text-[13px] text-gray-600 leading-relaxed">
            Матеріал підготовлений на основі Mayo Clinic Family Health Book, ACOG Practice
            Bulletin #228, IQWiG Patient Decision Aid, МОЗ України Наказ №147 (2023), RCOG
            Green-top Guidelines #34 та #59, StatPearls. Принципи подачі — за стандартами
            shared decision-making (NHS, IQWiG).
          </p>
        </div>

        {/* Джерела */}
        <div>
          <div className="text-[12px] font-semibold text-gray-600 uppercase tracking-wide mb-2">
            Джерела
          </div>
          <ul className="space-y-1">
            {SOURCES.map((src) => (
              <li key={src} className="text-[12px] text-gray-600 flex items-start gap-1.5">
                <span className="text-[#04D3D9] shrink-0 mt-0.5">›</span>
                {src}
              </li>
            ))}
          </ul>
        </div>
        </div>{/* end right column */}

        </div>{/* end 2-col grid */}
      </div>
    </section>
  );
}
