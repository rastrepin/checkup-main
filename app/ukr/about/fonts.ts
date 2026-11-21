import localFont from 'next/font/local';

// Шрифти тіла сторінки /ukr/about – лише локально (next/font/local), кирилиця і латиниця в одному файлі.
// Лише написання з прототипу. Файли: public/fonts/about/.
export const unbounded = localFont({
  src: [
    { path: '../../../public/fonts/about/Unbounded-700.woff2', weight: '700', style: 'normal' },
    { path: '../../../public/fonts/about/Unbounded-800.woff2', weight: '800', style: 'normal' },
  ],
  variable: '--font-unbounded',
  display: 'swap',
  fallback: ['Arial Black', 'sans-serif'],
});

export const onest = localFont({
  src: [
    { path: '../../../public/fonts/about/Onest-400.woff2', weight: '400', style: 'normal' },
    { path: '../../../public/fonts/about/Onest-500.woff2', weight: '500', style: 'normal' },
    { path: '../../../public/fonts/about/Onest-600.woff2', weight: '600', style: 'normal' },
  ],
  variable: '--font-onest',
  display: 'swap',
  fallback: ['system-ui', 'sans-serif'],
});

export const jetbrainsMono = localFont({
  src: [
    { path: '../../../public/fonts/about/JetBrainsMono-400.woff2', weight: '400', style: 'normal' },
    { path: '../../../public/fonts/about/JetBrainsMono-500.woff2', weight: '500', style: 'normal' },
    { path: '../../../public/fonts/about/JetBrainsMono-700.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-jetbrains-mono',
  display: 'swap',
  fallback: ['ui-monospace', 'monospace'],
});
