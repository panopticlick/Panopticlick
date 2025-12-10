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
    url: 'https://panopticlick.org/defense',
  },
  twitter: {
    title: 'Browser Privacy Protection Tools - Defense Armory',
    description:
      'Free tools and guides to protect your online privacy and defend against tracking.',
  },
};

export default function DefenseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
