import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'How Online Tracking Works - Anatomy of Browser Surveillance',
  description:
    'Learn exactly how websites track you online. Deep dive into browser fingerprinting, supercookies, behavioral tracking, and the $595 billion AdTech industry.',
  keywords: [
    'how tracking works',
    'browser fingerprinting explained',
    'online surveillance',
    'supercookies',
    'behavioral tracking',
    'AdTech explained',
    'data collection methods',
    'privacy education',
  ],
  openGraph: {
    title: 'How Online Tracking Works - Anatomy of Browser Surveillance',
    description:
      'Learn exactly how websites track you online. Deep dive into browser fingerprinting and the AdTech industry.',
    url: 'https://panopticlick.org/anatomy/',
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
    title: 'How Online Tracking Works - Anatomy of Browser Surveillance',
    description:
      'Learn exactly how websites track you online. Deep dive into browser fingerprinting and the AdTech industry.',
  },
  // Hub canonical: safe here only because every child page overrides
  // alternates with its own canonical
  alternates: {
    canonical: 'https://panopticlick.org/anatomy/',
  },
};

export default function AnatomyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
