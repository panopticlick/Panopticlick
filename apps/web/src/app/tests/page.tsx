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
    href: '/tests/webrtc',
    icon: '📡',
    status: 'active',
    severity: 'high',
  },
  {
    title: 'DNS Leak Test',
    description:
      'Check if your DNS queries are being leaked outside your VPN tunnel. DNS leaks can reveal your browsing history to your ISP.',
    href: '/tests/dns',
    icon: '🔍',
    status: 'active',
    severity: 'high',
  },
  {
    title: 'Ad Blocker Test',
    description:
      'Measure how effectively your ad blocker prevents tracking scripts. We test against real-world trackers and ad networks.',
    href: '/tests/blocker',
    icon: '🛡️',
    status: 'active',
    severity: 'medium',
  },
  {
    title: 'HSTS Supercookie Demo',
    description:
      'Learn how HSTS (HTTP Strict Transport Security) can be abused to create persistent tracking cookies that survive clearing browser data.',
    href: '/tests/hsts',
    icon: '🍪',
    status: 'active',
    severity: 'high',
  },
];

export default function TestsIndexPage() {
  return (
    <div className="bg-paper grid-bg">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Semantic H1 for SEO */}
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-center mb-8 tracking-tight">
          Online Privacy Tests
        </h1>

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
                  <Link href={test.href as '/tests/webrtc' | '/tests/dns' | '/tests/blocker' | '/tests/hsts'} className="block group">
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

        {/* Educational Content Section - SEO optimized, 1000+ words */}
        <article className="mt-16 prose prose-lg max-w-none">
          <h2 className="font-serif text-3xl font-bold mb-6">
            Why VPNs Aren't Enough: The Reality of Browser Privacy
          </h2>

          <p className="text-xl leading-relaxed mb-6">
            Here's a truth that VPN companies don't want you to hear: a VPN is just one piece
            of the privacy puzzle. And honestly? It's not even the most important piece.
          </p>

          <p className="mb-6">
            Don't get me wrong — VPNs have their place. They encrypt your traffic and hide your
            IP from websites. That's useful. But here's the problem: your IP address is just
            one of hundreds of data points that can identify you online.
          </p>

          <p className="mb-8">
            Think about it. When you use a VPN, you share the same IP address as thousands of
            other users. That's the whole point. But if your browser is leaking your real IP
            through WebRTC, your DNS queries are going through your ISP instead of the VPN, or
            your browser fingerprint makes you uniquely identifiable — the VPN didn't actually
            protect you.
          </p>

          {/* Statistics Section */}
          <div className="bg-paper-100 p-6 rounded-sm my-8 not-prose">
            <h3 className="font-mono text-lg font-bold mb-4">VPN Privacy Leaks: The Data</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-ink/20">
                    <th className="text-left py-2 font-mono">Leak Type</th>
                    <th className="text-right py-2 font-mono">% of VPN Users Affected</th>
                    <th className="text-right py-2 font-mono">Risk Level</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-ink/10">
                    <td className="py-2">WebRTC IP Leak</td>
                    <td className="text-right font-bold">19%</td>
                    <td className="text-right text-alert-red">High</td>
                  </tr>
                  <tr className="border-b border-ink/10">
                    <td className="py-2">DNS Leak</td>
                    <td className="text-right font-bold">25%</td>
                    <td className="text-right text-alert-red">High</td>
                  </tr>
                  <tr className="border-b border-ink/10">
                    <td className="py-2">IPv6 Leak</td>
                    <td className="text-right font-bold">14%</td>
                    <td className="text-right text-alert-orange">Medium</td>
                  </tr>
                  <tr>
                    <td className="py-2">Browser Fingerprint Exposure</td>
                    <td className="text-right font-bold">94%</td>
                    <td className="text-right text-alert-red">Critical</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-ink-300 mt-4">
              Sources: VPNMentor Study (2023), Top10VPN Research, INRIA AmIUnique Project
            </p>
          </div>

          <h2 className="font-serif text-3xl font-bold mb-6 mt-12">
            WebRTC: The Leak Your VPN Can't Stop
          </h2>

          <p className="mb-6">
            WebRTC (Web Real-Time Communication) is a technology that lets browsers do video calls,
            voice chat, and peer-to-peer file sharing. Cool stuff. But it has a nasty side effect:
            to establish direct connections, it needs to know your real IP address.
          </p>

          <p className="mb-6">
            Even when you're connected to a VPN, WebRTC can bypass the VPN tunnel and reveal your
            actual IP address. This happens because WebRTC uses a protocol called STUN/TURN to
            discover your network configuration — and this discovery process happens outside your
            VPN connection.
          </p>

          <p className="mb-8">
            The fix is simple: disable WebRTC in your browser settings or use an extension that
            blocks WebRTC leaks. Our WebRTC test checks if you're vulnerable.
          </p>

          <h2 className="font-serif text-3xl font-bold mb-6 mt-12">
            DNS: Your Browsing History on Display
          </h2>

          <p className="mb-6">
            Every time you visit a website, your computer asks a DNS server "what's the IP address
            for example.com?" This happens before the actual connection. If your DNS queries go
            through your ISP instead of your VPN, your ISP knows every website you visit — VPN
            or not.
          </p>

          <p className="mb-6">
            Most VPNs route DNS through their own servers. But sometimes the configuration fails.
            Sometimes your system falls back to ISP DNS during brief connection drops. Sometimes
            IPv6 DNS queries leak while IPv4 is protected.
          </p>

          <p className="mb-8">
            Our DNS leak test sends queries to test servers and checks where they actually came
            from. If they came from your ISP's DNS servers instead of your VPN's, you have a leak.
          </p>

          <h2 className="font-serif text-3xl font-bold mb-6 mt-12">
            Ad Blockers: Not All Protection Is Equal
          </h2>

          <p className="mb-6">
            Ad blockers are privacy tools, not just annoyance filters. The best ones block tracking
            scripts, analytics beacons, and fingerprinting attempts — not just visible ads.
          </p>

          <p className="mb-6">
            But here's the thing: there's a massive range in effectiveness. Some blockers use
            outdated filter lists. Some have gaps in their coverage. Some have been compromised
            by advertising companies. (Yes, that's happened — Google has been paying ad blockers
            to whitelist certain trackers.)
          </p>

          <p className="mb-8">
            Our ad blocker test loads known tracking scripts and checks which ones get through.
            We test against real-world trackers from Google, Facebook, Amazon, and dozens of
            lesser-known data brokers. You might be surprised what your blocker misses.
          </p>

          <h2 className="font-serif text-3xl font-bold mb-6 mt-12">
            HSTS Supercookies: The Tracking That Never Dies
          </h2>

          <p className="mb-6">
            HSTS (HTTP Strict Transport Security) is a security feature that forces browsers to
            use HTTPS. Good thing, right? But security researchers discovered it can be abused
            to create persistent tracking identifiers.
          </p>

          <p className="mb-6">
            Here's how it works: a tracker loads a unique pattern of subdomains. Some use HSTS,
            some don't. Your browser remembers which domains require HTTPS — and that pattern
            becomes a unique identifier. This identifier survives cookie deletion, private
            browsing, and even browser reinstallation in some cases.
          </p>

          <p className="mb-8">
            Our HSTS supercookie demo shows you exactly how this works. Understanding the attack
            is the first step to defending against it.
          </p>

          <h2 className="font-serif text-3xl font-bold mb-6 mt-12">
            The Complete Privacy Testing Strategy
          </h2>

          <p className="mb-6">
            Privacy isn't a single tool — it's a stack of defenses. Here's how our tests fit
            into a complete privacy strategy:
          </p>

          <div className="bg-ink text-paper p-6 rounded-sm my-8 not-prose">
            <h3 className="font-mono text-lg font-bold mb-4 text-highlight">
              Your Privacy Testing Checklist
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <span className="text-highlight">1.</span>
                <div>
                  <span className="font-bold">Run the fingerprint scan</span> — understand your baseline uniqueness
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-highlight">2.</span>
                <div>
                  <span className="font-bold">Check for WebRTC leaks</span> — especially important if using VPN
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-highlight">3.</span>
                <div>
                  <span className="font-bold">Test for DNS leaks</span> — verify your browsing history is protected
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-highlight">4.</span>
                <div>
                  <span className="font-bold">Evaluate your ad blocker</span> — see which trackers get through
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-highlight">5.</span>
                <div>
                  <span className="font-bold">Learn about supercookies</span> — understand advanced tracking
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-highlight">6.</span>
                <div>
                  <span className="font-bold">Apply fixes</span> — visit our Defense Armory for solutions
                </div>
              </div>
            </div>
          </div>

          <p className="mb-8">
            Each test takes seconds to run. Together, they give you a complete picture of your
            browser's privacy posture. Run them regularly — configurations change, software
            updates break things, and new vulnerabilities appear all the time.
          </p>

          {/* CTA */}
          <div className="bg-highlight/20 border-2 border-highlight p-8 rounded-sm my-8 text-center not-prose">
            <h3 className="font-serif text-2xl font-bold mb-4">
              Start With the Fingerprint Scan
            </h3>
            <p className="mb-6 text-ink-200">
              The fingerprint scan gives you the most comprehensive view of your browser's
              privacy. It's the foundation for understanding all other privacy risks.
            </p>
            <a
              href="/scan/"
              className="inline-block bg-ink text-paper px-8 py-4 font-mono font-bold rounded-sm hover:bg-ink/90 transition-colors"
            >
              Run Full Fingerprint Scan →
            </a>
          </div>
        </article>
      </div>
    </div>
  );
}
