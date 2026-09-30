import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';

// Fixel Text – основний шрифт тексту. next/font/local додає <link rel="preload">
// для всіх чотирьох накреслень. Запасні шрифти з підлаштованими метриками
// (Fixel Text Fallback – Arial / Liberation Sans, Fixel Text Fallback Roboto – Android)
// описано в globals.css: метрики пораховано на кириличному тексті сторінок,
// тому заміна шрифту після завантаження не зсуває макет (CLS).
const fixelText = localFont({
  src: [
    { path: '../public/fonts/FixelText-Regular.woff2', weight: '400', style: 'normal' },
    { path: '../public/fonts/FixelText-Medium.woff2', weight: '500', style: 'normal' },
    { path: '../public/fonts/FixelText-SemiBold.woff2', weight: '600', style: 'normal' },
    { path: '../public/fonts/FixelText-Bold.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-fixel-text',
  display: 'swap',
  preload: true,
  adjustFontFallback: false,
  fallback: ['Fixel Text Fallback', 'Fixel Text Fallback Roboto', 'system-ui', 'sans-serif'],
});

export const metadata: Metadata = {
  title: { default: 'check-up.in.ua — комплексне обстеження організму', template: '%s | check-up.in.ua' },
  description: 'Підбір програм комплексного обстеження організму. Харків та інші міста України.',
  metadataBase: new URL('https://check-up.in.ua'),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uk" className={`${fixelText.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
