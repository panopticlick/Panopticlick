import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Browser Fingerprint Scanner - Test Your Digital Identity',
  description:
    'Run a free browser fingerprint scan to discover your digital identity. See what data websites collect about you, calculate your advertising value, and get privacy recommendations.',
  keywords: [
    'browser fingerprint scanner',
    'fingerprint test',
    'browser privacy scan',
    'digital identity test',
    'online tracking test',
    'browser uniqueness check',
    'privacy assessment',
    'advertising value calculator',
  ],
  openGraph: {
    title: 'Browser Fingerprint Scanner - Test Your Digital Identity',
    description:
      'Run a free browser fingerprint scan to discover your digital identity and advertising value.',
    url: 'https://panopticlick.org/scan',
  },
  twitter: {
    title: 'Browser Fingerprint Scanner - Test Your Digital Identity',
    description:
      'Run a free browser fingerprint scan to discover your digital identity and advertising value.',
  },
};

export default function ScanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
