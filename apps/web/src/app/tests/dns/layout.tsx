import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'DNS Leak Test - Check if Your DNS Queries Are Exposed',
  description:
    'Free DNS leak test to verify your VPN is protecting your DNS queries. Detect if your ISP can see which websites you visit, even when using a VPN.',
  keywords: [
    'DNS leak test',
    'DNS privacy',
    'VPN DNS leak',
    'DNS resolver check',
    'secure DNS',
    'DoH test',
    'DNS over HTTPS',
    'privacy test',
    'ISP tracking',
  ],
  openGraph: {
    title: 'DNS Leak Test - Is Your ISP Tracking Your Browsing?',
    description:
      'Check if your DNS queries are leaking outside your VPN tunnel. DNS leaks can expose your browsing history to your ISP.',
    type: 'website',
    url: 'https://panopticlick.org/tests/dns/',
    images: [
      {
        url: '/og-dns-test.png',
        width: 1200,
        height: 630,
        alt: 'DNS Leak Test - Panopticlick',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DNS Leak Test - Check Your DNS Privacy',
    description:
      'Free tool to detect DNS leaks that can expose your browsing history to your ISP.',
    images: ['/og-dns-test.png'],
  },
  alternates: {
    canonical: 'https://panopticlick.org/tests/dns/',
  },
};

export default function DNSTestLayout({
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
            name: 'DNS Leak Test',
            applicationCategory: 'SecurityApplication',
            description:
              'Free DNS leak test to verify your VPN is protecting your DNS queries',
            url: 'https://panopticlick.org/tests/dns/',
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
          }),
        }}
      />
    </>
  );
}
