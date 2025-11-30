import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'HSTS Supercookie Demo - How Browsers Can Track You Forever',
  description:
    'Learn how HSTS (HTTP Strict Transport Security) can be abused to create "supercookies" that persist even after clearing browser data. Interactive demonstration of this advanced tracking technique.',
  keywords: [
    'HSTS supercookie',
    'evercookie',
    'browser tracking',
    'persistent cookie',
    'HSTS abuse',
    'supercookie demonstration',
    'browser fingerprinting',
    'privacy research',
    'tracking techniques',
  ],
  openGraph: {
    title: 'HSTS Supercookie Demo - Tracking That Survives Cookie Clearing',
    description:
      'Interactive demonstration of how HSTS can be weaponized for persistent browser tracking.',
    type: 'website',
    url: 'https://panopticlick.org/tests/hsts/',
    images: [
      {
        url: '/og-hsts-demo.png',
        width: 1200,
        height: 630,
        alt: 'HSTS Supercookie Demo - Panopticlick',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HSTS Supercookie Demo - The Tracking You Cannot Delete',
    description:
      'Learn how security features can be abused to track you across websites.',
    images: ['/og-hsts-demo.png'],
  },
  alternates: {
    canonical: 'https://panopticlick.org/tests/hsts/',
  },
};

export default function HSTSTestLayout({
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
            name: 'HSTS Supercookie Demo',
            applicationCategory: 'EducationalApplication',
            description:
              'Interactive demonstration of how HSTS can be abused to create persistent tracking cookies',
            url: 'https://panopticlick.org/tests/hsts/',
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
            educationalUse: 'Security Research',
            learningResourceType: 'Interactive Demo',
          }),
        }}
      />
    </>
  );
}
