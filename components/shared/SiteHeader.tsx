import { headerNav, type HeaderCity, type HeaderItem, type HeaderSection } from '@/lib/nav/header';

// Шапка сайту – docs/HEADER-SPEC.md v1.0 (задача B1).
// Серверний компонент: усе меню є в статичному HTML. Бургер і підменю – нативні <details>/<summary>, без JS.
// Скрипт унизу потрібен лише для того, щоб закривати підменю на desktop клавішею Escape і кліком поза ним.
// Mobile: рядок 56 px, не закріплений; меню – панель на весь екран поверх сторінки. Desktop (з 1024 px): рядок 64 px.
// Посилання – звичайні <a>: більшість адрес меню віддає Tilda, тому перехід має бути повним завантаженням сторінки.
// Розмітка меню на mobile і desktop різна (панель і рядок), тому список пунктів виводиться двічі з одного конфігу;
// одночасно видно і доступно лише один із них.

const LOGO_SRC = '/brand/logo-checkup.svg';
// Файл логотипа: viewBox 0 0 467 189. Розміри нижче зберігають ці пропорції.
const LOGO_WIDTH = 84;
const LOGO_HEIGHT = 34;

const CHEVRON_PATH = 'M19 9l-7 7-7-7';
const NO_MARKER = 'list-none [&::-webkit-details-marker]:hidden';
const FOCUS = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#005485]';

const CLOSE_SUBMENU_SCRIPT = `(function(){if(window.__siteHeaderSub)return;window.__siteHeaderSub=true;var q='details[data-header-sub][open]';document.addEventListener('keydown',function(e){if(e.key!=='Escape')return;document.querySelectorAll(q).forEach(function(d){var inside=d.contains(document.activeElement);d.removeAttribute('open');if(inside){var s=d.querySelector('summary');if(s)s.focus();}});});document.addEventListener('click',function(e){document.querySelectorAll(q).forEach(function(d){if(!d.contains(e.target))d.removeAttribute('open');});});})();`;

function Chevron({ className }: { className: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d={CHEVRON_PATH} />
    </svg>
  );
}

function isActive(item: HeaderItem, section: HeaderSection | undefined) {
  return Boolean(section && item.section === section);
}

/** Desktop: пункти в один рядок; підменю – випадний список, відкривається натисканням. */
function DesktopItems({ items, section }: { items: HeaderItem[]; section?: HeaderSection }) {
  return (
    <ul className="hidden lg:flex items-center gap-7 h-full">
      {items.map((item) => {
        const active = isActive(item, section);
        if (item.children) {
          return (
            <li key={item.label} className="h-full flex items-center">
              <details data-header-sub className="group relative">
                <summary
                  className={`${NO_MARKER} ${FOCUS} flex items-center gap-1.5 cursor-pointer select-none py-1 text-[15px] font-medium text-[#005485] border-b-2 border-transparent hover:border-[#04D3D9]`}
                >
                  {item.label}
                  <Chevron className="w-4 h-4 shrink-0 transition-transform duration-200 group-open:rotate-180" />
                </summary>
                <ul className="absolute left-0 top-full mt-3 min-w-[260px] py-2 bg-white border border-[#e5e7eb] rounded-[10px] shadow-card z-50">
                  {item.children.map((c) => (
                    <li key={c.href}>
                      <a href={c.href} className={`${FOCUS} block px-4 py-2.5 text-[15px] text-[#005485] hover:bg-[#f4f6f8]`}>
                        {c.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </details>
            </li>
          );
        }
        return (
          <li key={item.label} className="h-full flex items-center">
            <a
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={`${FOCUS} py-1 text-[15px] font-medium text-[#005485] border-b-2 hover:border-[#04D3D9] ${active ? 'border-[#04D3D9]' : 'border-transparent'}`}
            >
              {item.label}
            </a>
          </li>
        );
      })}
    </ul>
  );
}

/** Mobile: пункти списком у панелі; підменю розкривається як accordion на сторінках (шеврон, межі). */
function MobileItems({ items, section }: { items: HeaderItem[]; section?: HeaderSection }) {
  return (
    <ul className="border-t border-[#e5e7eb]">
      {items.map((item) => {
        const active = isActive(item, section);
        if (item.children) {
          return (
            <li key={item.label} className="border-b border-[#e5e7eb]">
              <details className="group">
                <summary
                  className={`${NO_MARKER} ${FOCUS} flex items-center justify-between gap-3 min-h-[52px] px-5 sm:px-6 cursor-pointer select-none text-[16px] font-medium text-[#005485]`}
                >
                  <span>{item.label}</span>
                  <Chevron className="w-4 h-4 shrink-0 transition-transform duration-200 group-open:rotate-180" />
                </summary>
                <ul className="pb-2">
                  {item.children.map((c) => (
                    <li key={c.href}>
                      <a href={c.href} className={`${FOCUS} flex items-center min-h-[48px] pl-9 pr-5 sm:pl-10 sm:pr-6 text-[15px] text-[#005485]`}>
                        {c.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </details>
            </li>
          );
        }
        return (
          <li key={item.label} className="border-b border-[#e5e7eb]">
            <a
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={`${FOCUS} flex items-center min-h-[52px] px-5 sm:px-6 text-[16px] font-medium text-[#005485]`}
            >
              <span className={`border-b-2 ${active ? 'border-[#04D3D9]' : 'border-transparent'}`}>{item.label}</span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}

export default function SiteHeader({ city, section }: { city: HeaderCity | null; section?: HeaderSection }) {
  const nav = headerNav(city);

  return (
    <header className="relative z-50 h-14 lg:h-16 bg-white border-b border-[#e5e7eb]">
      <div className="max-w-[1200px] h-full mx-auto px-5 sm:px-6 lg:px-14 flex items-center justify-between lg:justify-start lg:gap-10">
        <a href={nav.logoHref} className={`${FOCUS} shrink-0 flex items-center`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={LOGO_SRC} width={LOGO_WIDTH} height={LOGO_HEIGHT} alt="check-up.in.ua" />
        </a>

        <nav aria-label="Основне меню" className="h-full flex items-center">
          <DesktopItems items={nav.items} section={section} />

          {/* Mobile: кнопка меню і панель на весь екран поверх сторінки. Панель іде одразу під рядком шапки
              і не закріплена, тому працює без JS і без блокування прокрутки. */}
          <details className="group/menu lg:hidden">
            <summary
              className={`${NO_MARKER} ${FOCUS} -mr-2.5 w-11 h-11 flex items-center justify-center cursor-pointer select-none text-[#005485]`}
            >
              <span className="sr-only group-open/menu:hidden">Меню</span>
              <span className="sr-only hidden group-open/menu:inline">Закрити</span>
              <svg className="w-6 h-6 group-open/menu:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
              <svg className="w-6 h-6 hidden group-open/menu:block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </summary>
            <div className="absolute left-0 right-0 top-full min-h-[calc(100dvh-3.5rem)] bg-white">
              <MobileItems items={nav.items} section={section} />
            </div>
          </details>
        </nav>
      </div>
      <script dangerouslySetInnerHTML={{ __html: CLOSE_SUBMENU_SCRIPT }} />
    </header>
  );
}
