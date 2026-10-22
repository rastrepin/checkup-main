// Каркас основного домену – копії компонентів checkup-platform з тим самим контрактом props і ролей
// (docs/ux/audits/2026-10-architecture.md §5; docs/ux/ui-kit.md v1.1 §6). Кольори – лише ролі з app/globals.css.
// Зміна компонента – парні PR в обох репо з посиланням один на одного.
export { default as Button, ButtonLink, buttonClass } from './Button';
export { default as Eyebrow } from './Eyebrow';
export { default as Section } from './Section';
export { default as Header } from './Header';
export { default as Hero } from './Hero';
export { default as CtaBanner } from './CtaBanner';
export { default as Footer, footerCtaClass } from './Footer';
// StickyMobileCta: спільний – components/program-page/StickyMobileCta.tsx (кнопка – роль 3).
