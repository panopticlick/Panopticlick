import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'WebRTC Leak Test - Check if Your VPN is Leaking Your IP',
  description:
    'Free WebRTC leak test to check if your real IP address is exposed through WebRTC. Even with a VPN, WebRTC can bypass your protection and reveal your true location.',
  keywords: [
    'WebRTC leak test',
    'IP leak test',
    'VPN leak check',
    'WebRTC IP detection',
    'privacy test',
    'browser security',
    'STUN server leak',
    'ICE candidate leak',
  ],
  openGraph: {
    title: 'WebRTC Leak Test - Is Your VPN Really Protecting You?',
    description:
      'Check if WebRTC is exposing your real IP address. Even with a VPN, WebRTC can reveal your true location.',
    type: 'website',
    url: 'https://panopticlick.org/tests/webrtc/',
    images: [
      {
        url: '/og-webrtc-test.png',
        width: 1200,
        height: 630,
        alt: 'WebRTC Leak Test - Panopticlick',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WebRTC Leak Test - Check Your VPN Protection',
    description:
      'Free tool to detect WebRTC IP leaks that can expose your identity even when using a VPN.',
    images: ['/og-webrtc-test.png'],
  },
  alternates: {
    canonical: 'https://panopticlick.org/tests/webrtc/',
  },
};

export default function WebRTCTestLayout({
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
            name: 'WebRTC Leak Test',
            applicationCategory: 'SecurityApplication',
            description:
              'Free WebRTC leak test to check if your real IP address is exposed through WebRTC',
            url: 'https://panopticlick.org/tests/webrtc/',
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
