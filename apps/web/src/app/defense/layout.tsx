import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Browser Privacy Protection Tools - Defense Armory',
  description:
    'Free tools and guides to protect your online privacy. Test your ad blocker, check for DNS leaks, and learn browser hardening techniques.',
  keywords: [
    'privacy protection tools',
    'browser privacy',
    'ad blocker test',
    'DNS leak test',
    'WebRTC leak test',
    'browser hardening',
    'privacy guide',
    'anti-tracking',
  ],
  openGraph: {
    title: 'Browser Privacy Protection Tools - Defense Armory',
    description:
      'Free tools and guides to protect your online privacy and defend against tracking.',
    url: 'https://panopticlick.org/defense/',
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
    title: 'Browser Privacy Protection Tools - Defense Armory',
    description:
      'Free tools and guides to protect your online privacy and defend against tracking.',
  },
  // Hub canonical: safe here only because every child page overrides
  // alternates with its own canonical
  alternates: {
    canonical: 'https://panopticlick.org/defense/',
  },
};

export default function DefenseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
