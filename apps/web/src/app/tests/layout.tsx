import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Tests',
  description:
    'Run comprehensive privacy and security tests on your browser. Check for WebRTC leaks, DNS leaks, tracker blocking, and more.',
};

export default function TestsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
