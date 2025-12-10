import type { Metadata, Viewport } from 'next';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { FingerprintChat } from '@/components/ai';
import './globals.css';

// Use system fonts for reliability - no network dependency
// CSS variables are set in globals.css for customization

// Metadata
export const metadata: Metadata = {
  metadataBase: new URL('https://panopticlick.org'),
  title: {
    template: '%s | Panopticlick',
    default: 'Panopticlick: Free Browser Fingerprint Test & Online Privacy Scanner',
  },
  description:
    'Test your browser fingerprint for free. See how 94% of browsers are uniquely identifiable. Discover your advertising value in the $595 billion programmatic ad market.',
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
    >
      <head>
        <link rel="preconnect" href="https://api.panopticlick.org" crossOrigin="" />
        <script
          type="application/ld+json"
          // FAQ rich results focused on fingerprint test & privacy
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: [
                {
                  '@type': 'Question',
                  name: 'Is my browser uniquely identifiable?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Yes, most modern browsers expose enough attributes (canvas, WebGL, fonts, timezone, hardware) to be uniquely identified without cookies. Panopticlick measures that uniqueness as entropy.',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'Do you store my fingerprint?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Data is only stored if you give consent. You can delete it anytime via the privacy export/delete controls, and IPs are hashed.',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'What happens during the scan?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'We collect hardware, software, and capability signals (canvas, WebGL, audio, fonts, screen, UA) then compute hashes, entropy, and an advertising value simulation.',
                  },
                },
              ],
            }),
          }}
        />
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

        {/* AI Chat - Floating bottom right */}
        <FingerprintChat />

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
