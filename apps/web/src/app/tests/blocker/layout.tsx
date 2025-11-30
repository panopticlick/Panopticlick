import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ad Blocker Test - How Effective is Your Ad Blocker?',
  description:
    'Test your ad blocker effectiveness against real-world trackers. We check Google Analytics, Facebook Pixel, fingerprinting scripts, and more to measure your protection level.',
  keywords: [
    'ad blocker test',
    'ad block test',
    'tracker blocker test',
    'uBlock Origin test',
    'AdBlock Plus test',
    'privacy protection test',
    'tracking protection',
    'anti-fingerprinting',
    'blocker effectiveness',
  ],
  openGraph: {
    title: 'Ad Blocker Test - Measure Your Tracking Protection',
    description:
      'Test how well your ad blocker protects you from trackers, analytics, and fingerprinting scripts.',
    type: 'website',
    url: 'https://panopticlick.org/tests/blocker/',
    images: [
      {
        url: '/og-blocker-test.png',
        width: 1200,
        height: 630,
        alt: 'Ad Blocker Test - Panopticlick',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ad Blocker Test - Is Your Blocker Working?',
    description:
      'Free tool to test ad blocker effectiveness against real-world tracking scripts.',
    images: ['/og-blocker-test.png'],
  },
  alternates: {
    canonical: 'https://panopticlick.org/tests/blocker/',
  },
};

export default function BlockerTestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: 'Ad Blocker Test',
            applicationCategory: 'SecurityApplication',
            description:
              'Test your ad blocker effectiveness against real-world trackers and fingerprinting scripts',
            url: 'https://panopticlick.org/tests/blocker/',
            operatingSystem: 'Any',
            browserRequirements: 'Requires JavaScript',
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'USD',
            },
            creator: {
              '@type': 'Organization',
              name: 'Panopticlick',
              url: 'https://panopticlick.org',
            },
          }),
        }}
      />
    </>
  );
}
