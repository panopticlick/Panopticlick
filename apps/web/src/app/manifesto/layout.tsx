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
    url: 'https://panopticlick.org/manifesto',
  },
  twitter: {
    title: 'Digital Privacy Manifesto - Privacy is a Human Right',
    description:
      'Our manifesto on digital privacy rights. Privacy is not a privilege—it is a fundamental human right.',
  },
};

export default function ManifestoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
