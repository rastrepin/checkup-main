import type { Metadata } from 'next';
import { Onest } from 'next/font/google';
import './globals.css';

const onest = Onest({
  variable: '--font-onest',
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'check-up.in.ua — комплексне обстеження організму',
    template: '%s | check-up.in.ua',
  },
  description: 'Підбір програм комплексного обстеження організму. Харків, Рівне та інші міста України.',
  metadataBase: new URL('https://check-up.in.ua'),
};

export default function RootLayout({ children }: