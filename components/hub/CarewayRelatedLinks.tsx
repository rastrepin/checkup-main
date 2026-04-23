import Link from 'next/link';

const LINKS = [
  {
    href: '/careway/simptomy/ryasni-misyachni',
    label: 'Рясні місячні — що це може бути',
    badge: null,
    soon: false,
  },
  {
    href: '/careway/rishennya/yak-obraty-likaria',
    label: 'Як обрати лікаря для гінекологічної операції',
    badge: null,
    soon: true,
  },
  {
    href: '/careway/rishennya/pidhotovka-do-operatsiii',
    label: 'Підготовка до планової гінекологічної операції',
    badge: null,
    soon: true,
  },
  {
    href: '/careway/rishennya/vidnovlennya-pislia-operatsiii',
    label: 'Відновлення після гінекологічної операції',
    badge: null,
    soon: true,
  },
  {
    href: '/careway/vartist-nszu-chy-pryvat',
    label: 'НСЗУ чи приват: як вибрати шлях лікування',
    badge: null,
    soon: true,
  },
  {
    href: '/careway/slovnyk-terminiv',
    label: 'Словник термінів гінекологічного висновку',
    badge: null,
    soon: true,
  },
  {
    href: '/careway/dzherela',
    label: 'Наші джерела та медичні стандарти',
    badge: null,
    soon: false,
  },
];

export default function CarewayRelatedLinks() {
  return (
    <section
      className="px-4 py-8 bg-white border-t border-gray-100"
      aria-labelledby="related-heading"
    >
      <div className="max-w-2xl mx-auto">
        <h2 id="related-heading" className="text-[18px] font-bold text-[#0b1a24] mb-4">
          Пов&apos;язані матеріали
        </h2>

        <div className="space-y-2">
          {LINKS.map(({ href, label, soon }) => (
            <div key={href}>
              {soon ? (
                <span
                  className="flex items-center gap-2 text-[14px] text-gray-300 cursor-not-allowed"
                  aria-disabled="true"
                >
                  <svg
                    className="w-4 h-4 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                  {label}
                  <span className="text-[11px] ml-1">[скоро]</span>
                </span>
              ) : (
                <Link
                  href={href}
                  className="flex items-center gap-2 text-[14px] text-[#005485] font-medium hover:underline"
                >
                  <svg
                    className="w-4 h-4 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                  {label}
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
