import type { Metadata, Viewport } from 'next';
import { Merriweather, JetBrains_Mono, Inter } from 'next/font/google';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import './globals.css';

// Fonts
const merriweather = Merriweather({
  subsets: ['latin'],
  weight: ['300', '400', '700', '900'],
  variable: '--font-serif',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

// Metadata
export const metadata: Metadata = {
  title: {
    template: '%s | Panopticlick',
    default: 'Panopticlick - Is Your Browser Safe from Tracking?',
  },
  description:
    'Discover how unique your browser fingerprint is and how much advertisers value your data. Learn to protect your privacy online.',
  keywords: [
    'browser fingerprint',
    'privacy test',
    'tracking protection',
    'EFF Panopticlick',
    'ad blocker test',
    'digital privacy',
    'browser uniqueness',
  ],
  authors: [{ name: 'Panopticlick' }],
  creator: 'Panopticlick',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://panopticlick.org',
    siteName: 'Panopticlick',
    title: 'Panopticlick - Is Your Browser Safe from Tracking?',
    description:
      'Discover how unique your browser fingerprint is and how much advertisers value your data.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Panopticlick - Browser Privacy Test',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Panopticlick - Is Your Browser Safe from Tracking?',
    description:
      'Discover how unique your browser fingerprint is and how much advertisers value your data.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#18181b',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${merriweather.variable} ${jetbrainsMono.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-paper antialiased flex flex-col">
        {/* Skip to content link */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-ink focus:text-paper focus:rounded"
        >
          Skip to main content
        </a>

        {/* Global Header */}
        <Header />

        {/* Main content */}
        <main id="main-content" className="flex-1">
          {children}
        </main>

        {/* Global Footer */}
        <Footer />

        {/* Structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'Panopticlick',
              applicationCategory: 'SecurityApplication',
              description:
                'Browser fingerprinting test and privacy analysis tool',
              url: 'https://panopticlick.org',
              operatingSystem: 'Any',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD',
              },
            }),
          }}
        />
      </body>
    </html>
  );
}
