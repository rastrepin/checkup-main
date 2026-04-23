// MethodCardsV4 — 6 карток методів лікування міоми (grid, не accordion)
// v4: нова структура — категорія, synonym, availableClinics, featured badge

interface Method {
  slug: string;
  title: string;
  synonym: string | null;
  category: 'Консервативний' | 'Малоінвазивний' | 'Хірургічний';
  categoryColor: string;
  recovery: string;
  fertility: string;
  priceLabel: string;
  description: string;
  availableClinics: string[];
  ctaType: 'case' | 'consultation' | 'disabled';
  ctaLink?: string;
  featured?: boolean;
}

const METHODS: Method[] = [
  {
    slug: 'observation',
    title: 'Активне спостереження',
    synonym: null,
    category: 'Консервативний',
    categoryColor: 'bg-green-100 text-green-700',
    recovery: '—',
    fertility: 'Збережена',
    priceLabel: 'Без витрат на лікування',
    description:
      'Якщо міома не дає симптомів, розмір стабільний, немає анемії — лікування не потрібне. Контрольне УЗД раз на рік, моніторинг гемоглобіну.',
    availableClinics: ['ON Clinic Харків', 'РОКЛ Рівне', 'Оксфорд Медікал Львів'],
    ctaType: 'disabled',
  },
  {
    slug: 'medical',
    title: 'Медикаментозне лікування',
    synonym: 'гормональна терапія',
    category: 'Консервативний',
    categoryColor: 'bg-green-100 text-green-700',
    recovery: 'Відразу',
    fertility: 'Знижена під час курсу',
    priceLabel: 'від 2 000 грн/міс',
    description:
      'ГнРГ-агоністи, комбіновані оральні контрацептиви, ВМС з прогестином. Контроль кровотеч і болю без операції. Курс до 6 місяців.',
    availableClinics: ['ON Clinic Харків', 'РОКЛ Рівне', 'Оксфорд Медікал Львів'],
    ctaType: 'consultation',
    ctaLink: '#lead-form',
  },
  {
    slug: 'histeroskopichna-miomektomia',
    title: 'Гістероскопічна міомектомія',
    synonym: 'гістероскопічне видалення субмукозного вузла',
    category: 'Малоінвазивний',
    categoryColor: 'bg-blue-100 text-blue-700',
    recovery: '2–4 дні',
    fertility: 'Збережена',
    priceLabel: 'від 13 395 грн',
    description:
      'Видалення вузлів з порожнини матки через гістероскоп — без розрізів. Підходить для субмукозних вузлів до 5 см. Виписка того ж дня або наступного.',
    availableClinics: ['ON Clinic Харків', 'РОКЛ Рівне', 'Оксфорд Медікал Львів'],
    ctaType: 'case',
    ctaLink: 'https://onclinic.check-up.in.ua/kharkiv/gisteroskopia-polipektomia',
  },
  {
    slug: 'laparoskopichna-miomektomia',
    title: 'Лапароскопічна міомектомія',
    synonym: 'видалення фіброматозного вузла лапароскопічним методом',
    category: 'Малоінвазивний',
    categoryColor: 'bg-blue-100 text-blue-700',
    recovery: '21 день',
    fertility: 'Збережена',
    priceLabel: 'від 26 690 грн',
    description:
      'Видалення вузлів через 3 мікророзрізи 0,5–1 см. Матка зберігається. Стандарт для інтрамуральних і субсерозних вузлів 3–12 см. Стаціонар 2–3 дні.',
    availableClinics: ['ON Clinic Харків', 'РОКЛ Рівне', 'Оксфорд Медікал Львів'],
    ctaType: 'case',
    ctaLink: 'https://onclinic.check-up.in.ua/kharkiv/mioma-laparoskopichna-miomektomiia',
    featured: true,
  },
  {
    slug: 'abdominal-miomektomia',
    title: 'Відкрита міомектомія',
    synonym: 'лапаротомія',
    category: 'Хірургічний',
    categoryColor: 'bg-orange-100 text-orange-700',
    recovery: '28 днів',
    fertility: 'Збережена',
    priceLabel: 'від 25 000 грн',
    description:
      'Видалення через розріз передньої черевної стінки. Показана для дуже великих вузлів (>12 см) або множинних міом. Стаціонар 4–5 днів.',
    availableClinics: ['ON Clinic Харків', 'Оксфорд Медікал Львів'],
    ctaType: 'consultation',
    ctaLink: '#lead-form',
  },
  {
    slug: 'histerectomia',
    title: 'Гістеректомія',
    synonym: 'видалення матки, екстирпація матки',
    category: 'Хірургічний',
    categoryColor: 'bg-gray-100 text-gray-600',
    recovery: '2–8 тижнів',
    fertility: 'Втрачена',
    priceLabel: 'від 40 000 грн',
    description:
      'Радикальне рішення — видалення матки. Показана коли інші методи неефективні і вагітність не планується. Варіанти: лапароскопічний, вагінальний, абдомінальний.',
    availableClinics: ['ON Clinic Харків', 'Оксфорд Медікал Львів'],
    ctaType: 'case',
    ctaLink: 'https://onclinic.check-up.in.ua/kharkiv/histerectomia',
  },
];

function MethodCard({ method }: { method: Method }) {
  return (
    <div
      className={`bg-white rounded-2xl p-6 border flex flex-col h-full transition-shadow hover:shadow-[0_4px_24px_rgba(11,30,47,0.10)]
        ${method.featured
          ? 'border-[#04D3D9]/40 ring-1 ring-[#04D3D9]/25'
          : 'border-[#e8e4dc]'
        }`}
    >
      {/* Featured badge */}
      {method.featured && (
        <div className="inline-block bg-[#04D3D9]/10 text-[#005485] text-xs font-semibold px-2.5 py-1 rounded-full mb-3 self-start">
          Найчастіше рекомендується
        </div>
      )}

      {/* Category */}
      <div className={`inline-flex text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mb-2 self-start ${method.categoryColor}`}>
        {method.category}
      </div>

      {/* Title */}
      <h3
        className="text-base font-bold text-[#0b1a24] mb-1 leading-snug"
        style={{ fontFamily: "'Fixel Display', system-ui, sans-serif" }}
      >
        {method.title}
      </h3>

      {/* Synonym */}
      {method.synonym && (
        <p className="text-xs text-gray-400 italic mb-3">{method.synonym}</p>
      )}

      {/* Description */}
      <p className="text-sm text-[#4a5a6b] leading-relaxed mb-4 flex-1">
        {method.description}
      </p>

      {/* Meta grid */}
      <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
        <div className="bg-gray-50 rounded-lg p-2.5">
          <div className="text-gray-400 mb-0.5">Відновлення</div>
          <div className="font-semibold text-[#0b1a24]">{method.recovery}</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-2.5">
          <div className="text-gray-400 mb-0.5">Фертильність</div>
          <div className="font-semibold text-[#0b1a24]">{method.fertility}</div>
        </div>
      </div>

      {/* Price */}
      <div
        className="text-lg font-semibold text-[#005485] mb-2"
        style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
      >
        {method.priceLabel}
      </div>

      {/* Available clinics */}
      <div className="text-xs text-gray-400 mb-4">
        Доступно: {method.availableClinics.join(', ')}
      </div>

      {/* CTA */}
      {method.ctaType === 'case' && method.ctaLink && (
        <a
          href={method.ctaLink}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#005485] hover:text-[#003a5e] transition mt-auto"
        >
          Детальніше про метод
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </a>
      )}
      {method.ctaType === 'consultation' && method.ctaLink && (
        <a
          href={method.ctaLink}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#005485] hover:text-[#003a5e] transition mt-auto"
        >
          Обговорити на консультації
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </a>
      )}
    </div>
  );
}

export default function MethodCardsV4() {
  return (
    <section className="py-12 md:py-16" aria-labelledby="methods-v4-heading">
      <div className="max-w-7xl mx-auto px-4 md:px-6" id="methods-inner">
        <h2
          id="methods-v4-heading"
          className="font-bold text-[22px] md:text-[28px] text-[#0b1a24] mb-4 tracking-tight"
          style={{ fontFamily: "'Fixel Display', system-ui, sans-serif" }}
        >
          Методи лікування — 6 підходів
        </h2>
        <p className="text-base text-[#4a5a6b] mb-10 max-w-[720px]">
          Метод обирається залежно від розміру, типу вузлів, симптомів та ваших планів на
          вагітність. Нижче — усі доступні в Україні варіанти, від консервативного
          спостереження до радикальної операції.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {METHODS.map((method) => (
            <MethodCard key={method.slug} method={method} />
          ))}
        </div>
      </div>
    </section>
  );
}
