import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Digital Privacy Manifesto - Privacy is a Human Right',
  description:
    'Our manifesto on digital privacy rights. Privacy is not a privilege—it is a fundamental human right in the digital age. Join the fight against surveillance capitalism.',
  keywords: [
    'digital privacy manifesto',
    'privacy rights',
    'surveillance capitalism',
    'online privacy',
    'data protection',
    'internet freedom',
    'privacy advocacy',
    'digital rights',
  ],
  openGraph: {
    title: 'Digital Privacy Manifesto - Privacy is a Human Right',
    description:
      'Our manifesto on digital privacy rights. Privacy is not a privilege—it is a fundamental human right.',
    url: 'https://panopticlick.org/manifesto/',
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
    title: 'Digital Privacy Manifesto - Privacy is a Human Right',
    description:
      'Our manifesto on digital privacy rights. Privacy is not a privilege—it is a fundamental human right.',
  },
  // Hub canonical: safe here only because every child page overrides
  // alternates with its own canonical
  alternates: {
    canonical: 'https://panopticlick.org/manifesto/',
  },
};

export default function ManifestoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
