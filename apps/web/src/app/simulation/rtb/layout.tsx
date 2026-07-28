import type { Metadata } from 'next';
import { JsonLd, breadcrumbJsonLd } from '@/components/seo/json-ld';

export const metadata: Metadata = {
  title: 'RTB Auction Simulator - Watch Your Data Get Auctioned',
  description:
    'Free real-time bidding (RTB) simulator. Run a live ad auction on your own browser fingerprint: see simulated DSP bids, CPM prices, and what your data is worth to advertisers.',
  keywords: [
    'RTB simulator',
    'real-time bidding simulator',
    'ad auction simulator',
    'what is my data worth',
    'programmatic advertising demo',
    'DSP bidding',
    'CPM calculator',
    'ad tech simulation',
  ],
  openGraph: {
    title: 'RTB Auction Simulator - Watch Your Data Get Auctioned',
    description:
      'Run a live ad auction on your own browser fingerprint. See which advertisers bid, at what CPM, and what your data is worth.',
    type: 'website',
    url: 'https://panopticlick.org/simulation/rtb/',
    images: [
      {
        url: '/og-rtb-simulator.png',
        width: 1200,
        height: 630,
        alt: 'RTB Auction Simulator - Panopticlick',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RTB Auction Simulator - What Is Your Data Worth?',
    description:
      'Watch a simulated real-time bidding auction run on your own browser fingerprint, with DSP bids and CPM values.',
    images: ['/og-rtb-simulator.png'],
  },
  alternates: {
    canonical: 'https://panopticlick.org/simulation/rtb/',
  },
};

export default function RTBSimulatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: 'RTB Auction Simulator',
          applicationCategory: 'SecurityApplication',
          description:
            'Simulated real-time bidding auction that shows how advertisers bid on a browser fingerprint and estimates its advertising value',
          url: 'https://panopticlick.org/simulation/rtb/',
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
        }}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Simulation Lab', path: '/simulation/' },
          { name: 'RTB Auction Simulator', path: '/simulation/rtb/' },
        ])}
      />
    </>
  );
}
