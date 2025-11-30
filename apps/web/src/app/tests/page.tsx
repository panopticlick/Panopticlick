'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Document,
  DocumentHeader,
  DocumentSection,
  Stamp,
} from '@/components/ui';

interface TestCard {
  title: string;
  description: string;
  href: string;
  icon: string;
  status: 'active' | 'beta' | 'coming-soon';
  severity: 'high' | 'medium' | 'low';
}

const tests: TestCard[] = [
  {
    title: 'WebRTC Leak Test',
    description:
      'Detect if WebRTC is exposing your real IP address, even when using a VPN. WebRTC can bypass proxy settings and reveal your true location.',
    href: '/tests/webrtc/',
    icon: '📡',
    status: 'active',
    severity: 'high',
  },
  {
    title: 'DNS Leak Test',
    description:
      'Check if your DNS queries are being leaked outside your VPN tunnel. DNS leaks can reveal your browsing history to your ISP.',
    href: '/tests/dns/',
    icon: '🔍',
    status: 'active',
    severity: 'high',
  },
  {
    title: 'Ad Blocker Test',
    description:
      'Measure how effectively your ad blocker prevents tracking scripts. We test against real-world trackers and ad networks.',
    href: '/tests/blocker/',
    icon: '🛡️',
    status: 'active',
    severity: 'medium',
  },
  {
    title: 'HSTS Supercookie Demo',
    description:
      'Learn how HSTS (HTTP Strict Transport Security) can be abused to create persistent tracking cookies that survive clearing browser data.',
    href: '/tests/hsts/',
    icon: '🍪',
    status: 'active',
    severity: 'high',
  },
];

export default function TestsIndexPage() {
  return (
    <div className="min-h-screen bg-paper grid-bg">
      <div className="confidential-bar">Privacy Test Laboratory</div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Document variant="classified" watermark="INVESTIGATIONS">
          <DocumentHeader
            title="Privacy Test Suite"
            subtitle="Comprehensive browser security analysis tools"
            classification="confidential"
            date={new Date()}
          />

          <div className="prose prose-lg max-w-none mb-8">
            <p className="font-serif text-xl leading-relaxed">
              Your browser can leak sensitive information in ways you might not expect.
              Our test suite checks for common privacy vulnerabilities that can
              expose your identity online.
            </p>
          </div>

          <DocumentSection title="Available Tests">
            <div className="grid gap-4">
              {tests.map((test, index) => (
                <motion.div
                  key={test.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link href={test.href} className="block group">
                    <div className="document p-4 hover:shadow-lg transition-shadow">
                      <div className="flex items-start gap-4">
                        <div className="text-3xl">{test.icon}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-serif font-bold text-lg group-hover:text-ink-200 transition-colors">
                              {test.title}
                            </h3>
                            {test.status === 'beta' && (
                              <span className="text-xs px-2 py-0.5 bg-highlight text-ink rounded-full">
                                Beta
                              </span>
                            )}
                            {test.status === 'coming-soon' && (
                              <span className="text-xs px-2 py-0.5 bg-paper-300 text-ink-300 rounded-full">
                                Coming Soon
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-ink-200 mb-2">
                            {test.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs">
                            <span
                              className={`px-2 py-0.5 rounded-full ${
                                test.severity === 'high'
                                  ? 'bg-alert-red/10 text-alert-red'
                                  : test.severity === 'medium'
                                  ? 'bg-alert-orange/10 text-alert-orange'
                                  : 'bg-alert-green/10 text-alert-green'
                              }`}
                            >
                              {test.severity.toUpperCase()} Priority
                            </span>
                            <span className="text-ink-300">
                              Run test →
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </DocumentSection>

          <DocumentSection title="Why These Tests Matter">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-paper-100 p-4 rounded-sm">
                <h4 className="font-mono text-sm font-bold mb-2 uppercase tracking-wider">
                  VPN Users
                </h4>
                <p className="text-sm text-ink-200">
                  Even with a VPN, WebRTC and DNS leaks can expose your real IP address
                  and browsing habits. These tests verify your VPN is working correctly.
                </p>
              </div>
              <div className="bg-paper-100 p-4 rounded-sm">
                <h4 className="font-mono text-sm font-bold mb-2 uppercase tracking-wider">
                  Privacy Advocates
                </h4>
                <p className="text-sm text-ink-200">
                  Ad blockers vary widely in effectiveness. Our blocker test uses real
                  tracker signatures to measure how well you're protected.
                </p>
              </div>
              <div className="bg-paper-100 p-4 rounded-sm">
                <h4 className="font-mono text-sm font-bold mb-2 uppercase tracking-wider">
                  Security Researchers
                </h4>
                <p className="text-sm text-ink-200">
                  HSTS Supercookies demonstrate advanced tracking techniques. Learn how
                  security features can be weaponized against users.
                </p>
              </div>
              <div className="bg-paper-100 p-4 rounded-sm">
                <h4 className="font-mono text-sm font-bold mb-2 uppercase tracking-wider">
                  Everyone
                </h4>
                <p className="text-sm text-ink-200">
                  Understanding how you're tracked is the first step to protecting
                  yourself. Knowledge is power in the fight for digital privacy.
                </p>
              </div>
            </div>
          </DocumentSection>
        </Document>

        <div className="flex justify-center gap-6 mt-8">
          <Stamp variant="classified">Privacy Lab</Stamp>
          <Stamp variant="verified">Open Source</Stamp>
        </div>
      </div>
    </div>
  );
}
