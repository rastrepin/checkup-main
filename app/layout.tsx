import type { Metadata } from 'next';
import { Onest, Cormorant_Garamond } from 'next/font/google';
import './globals.css';

const onest = Onest({
  variable: '--font-onest',
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const cormorant = Cormorant_Garamond({
  variable: '--font-cormorant',
  subsets: ['latin', 'cyrillic'],
  weight: ['400'],
  style: ['italic'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: { default: 'check-up.in.ua — комплексне обстеження організму', template: '%s | check-up.in.ua' },
  description: 'Підбір програм комплексного обстеження організму. Харків та інші міста України.',
  metadataBase: new URL('https://check-up.in.ua'),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uk" className={`${onest.variable} ${cormorant.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
