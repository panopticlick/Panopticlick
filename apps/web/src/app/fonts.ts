import localFont from 'next/font/local';

export const serif = localFont({
  src: [
    { path: '../fonts/merriweather-400.woff2', weight: '400', style: 'normal' },
    { path: '../fonts/merriweather-700.woff2', weight: '700', style: 'normal' },
    { path: '../fonts/merriweather-900.woff2', weight: '900', style: 'normal' },
  ],
  display: 'swap',
  variable: '--font-serif',
});

export const sans = localFont({
  src: [
    { path: '../fonts/inter-400.woff2', weight: '400', style: 'normal' },
    { path: '../fonts/inter-700.woff2', weight: '700', style: 'normal' },
    { path: '../fonts/inter-900.woff2', weight: '900', style: 'normal' },
  ],
  display: 'swap',
  variable: '--font-sans',
});

export const mono = localFont({
  src: [
    { path: '../fonts/jetbrains-mono-400.woff2', weight: '400', style: 'normal' },
    { path: '../fonts/jetbrains-mono-700.woff2', weight: '700', style: 'normal' },
  ],
  display: 'swap',
  variable: '--font-mono',
});
