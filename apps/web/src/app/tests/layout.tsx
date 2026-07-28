import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Online Privacy Tests - WebRTC, DNS Leak & Ad Blocker Tests',
  description:
    'Free privacy testing tools to check your browser security. Test for WebRTC IP leaks, DNS leaks, ad blocker effectiveness, and HSTS supercookie vulnerabilities.',
  keywords: [
    'privacy tests',
    'WebRTC leak test',
    'DNS leak test',
    'ad blocker test',
    'HSTS supercookie',
    'VPN leak test',
    'browser security test',
    'online privacy check',
  ],
  openGraph: {
    title: 'Online Privacy Tests - WebRTC, DNS Leak & Ad Blocker Tests',
    description:
      'Free privacy testing tools to check your browser security and VPN effectiveness.',
    url: 'https://panopticlick.org/tests/',
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
    title: 'Online Privacy Tests - WebRTC, DNS Leak & Ad Blocker Tests',
    description:
      'Free privacy testing tools to check your browser security and VPN effectiveness.',
  },
  // Hub canonical: safe here only because every child route overrides
  // alternates with its own canonical (tests/*/layout.tsx)
  alternates: {
    canonical: 'https://panopticlick.org/tests/',
  },
};

export default function TestsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
