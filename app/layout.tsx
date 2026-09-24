import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'check-up.in.ua — комплексне обстеження організму', template: '%s | check-up.in.ua' },
  description: 'Підбір програм комплексного обстеження організму. Харків та інші міста України.',
  metadataBase: new URL('https://check-up.in.ua'),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uk" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
