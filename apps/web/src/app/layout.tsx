import type { Metadata, Viewport } from 'next';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { ChatLauncher } from '@/components/ai';
import { ConsentBanner } from '@/components/consent-banner';
import { JsonLd, siteJsonLd } from '@/components/seo/json-ld';
import { serif, sans, mono } from './fonts';
import './globals.css';

// Metadata
export const metadata: Metadata = {
  metadataBase: new URL('https://panopticlick.org'),
  title: {
    template: '%s | Panopticlick',
    default: 'Panopticlick: Free Browser Fingerprint Test & Online Privacy Scanner',
  },
  description:
    'Run a free browser fingerprint test, inspect exposed signals, check WebRTC, DNS, and tracker blocking, and learn practical privacy defenses.',
  keywords: [
    'browser fingerprint test',
    'browser fingerprinting',
    'online privacy test',
    'digital fingerprint',
    'tracking protection test',
    'EFF Panopticlick',
    'ad blocker test',
    'browser uniqueness test',
    'privacy scanner',
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
  manifest: '/site.webmanifest',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
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
      suppressHydrationWarning
      className={`${serif.variable} ${sans.variable} ${mono.variable}`}
    >
      <head>
        <link rel="preconnect" href="https://api.panopticlick.org" crossOrigin="" />
      </head>
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

        {/* Consent banner (fixed overlay, shown until a choice is made) */}
        <ConsentBanner />

        {/* AI Chat - Floating bottom right */}
        <ChatLauncher />

        {/* Stable site identity; routes add their own tool/article schemas. */}
        <JsonLd data={siteJsonLd()} />
      </body>
    </html>
  );
}
