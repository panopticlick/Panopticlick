import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AdTech Simulation Lab - See How You Are Tracked',
  description:
    'Interactive simulations showing how the $595 billion programmatic advertising industry works. Watch RTB auctions, cookie syncing, and CNAME cloaking in real-time.',
  keywords: [
    'RTB simulator',
    'real-time bidding',
    'AdTech simulation',
    'programmatic advertising',
    'cookie syncing',
    'CNAME cloaking',
    'ad auction',
    'digital advertising',
  ],
  openGraph: {
    title: 'AdTech Simulation Lab - See How You Are Tracked',
    description:
      'Interactive simulations showing how the $595 billion programmatic advertising industry tracks and monetizes you.',
    url: 'https://panopticlick.org/simulation',
  },
  twitter: {
    title: 'AdTech Simulation Lab - See How You Are Tracked',
    description:
      'Interactive simulations showing how the $595 billion programmatic advertising industry tracks and monetizes you.',
  },
};

export default function SimulationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
