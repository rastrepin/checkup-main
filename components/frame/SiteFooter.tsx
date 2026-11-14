import Footer from '@/components/frame/Footer';
import { FOOTER_BOTTOM, FOOTER_DISCLAIMER, footerNav } from '@/lib/nav/footer';

// Футер сайту – docs/HEADER-SPEC.md v1.2, розділ 10. Обгортка над components/frame/Footer (components-map §29.8)
// з даними з lib/nav/footer.ts – так само, як шапка бере меню з lib/nav/header.ts.
// Серверний компонент, без клієнтського JS; ставиться в кожну сторінку з пропом city (не в layout, розділ 8).
// cta не передається: кнопка запису є на самій сторінці (10.1).
// stickyPad – сторінка має закріплену панель StickyMobileCta: на mobile під футером відступ, щоб панель його не закривала.

// viewBox логотипа 0 0 1039 189; висота 36 px, як у шапці (components/frame/Header.tsx, tone dark).
const LOGO = { src: '/brand/logo-checkup-site-dark.svg', width: 198, height: 36 };

export default function SiteFooter({ city, stickyPad = false }: { city: string | null; stickyPad?: boolean }) {
  const nav = footerNav(city);
  const footer = (
    <Footer
      logo={
        <a href={nav.logoHref} className="inline-block w-fit">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={LOGO.src} width={LOGO.width} height={LOGO.height} alt="check-up.in.ua" />
        </a>
      }
      columns={nav.columns}
      disclaimer={FOOTER_DISCLAIMER}
      bottom={FOOTER_BOTTOM}
    />
  );
  return stickyPad ? <div className="bg-footer-bg pb-24 md:pb-0">{footer}</div> : footer;
}
