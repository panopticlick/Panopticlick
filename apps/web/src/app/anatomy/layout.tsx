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
    url: 'https://panopticlick.org/anatomy',
  },
  twitter: {
    title: 'How Online Tracking Works - Anatomy of Browser Surveillance',
    description:
      'Learn exactly how websites track you online. Deep dive into browser fingerprinting and the AdTech industry.',
  },
};

export default function AnatomyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
