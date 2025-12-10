'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Document,
  DocumentHeader,
  DocumentSection,
  Stamp,
} from '@/components/ui';

interface DefenseCard {
  title: string;
  description: string;
  href: string;
  icon: string;
  effectiveness: 'essential' | 'recommended' | 'advanced';
  category: string;
}

const defenseTools: DefenseCard[] = [
  {
    title: 'Ad Blocker Test',
    description:
      'Measure how effectively your ad blocker prevents tracking scripts. We test against real-world trackers and advertising networks to give you a protection score.',
    href: '/tests/blocker',
    icon: '🛡️',
    effectiveness: 'essential',
    category: 'Active Defense',
  },
  {
    title: 'DNS Leak Test',
    description:
      'Check if your DNS queries are being leaked outside your VPN tunnel. DNS leaks can reveal your browsing history to your ISP even with VPN protection.',
    href: '/tests/dns',
    icon: '🔍',
    effectiveness: 'essential',
    category: 'Network Security',
  },
  {
    title: 'WebRTC Leak Test',
    description:
      'Detect if WebRTC is exposing your real IP address, bypassing your VPN. This common vulnerability can compromise your anonymity.',
    href: '/tests/webrtc',
    icon: '📡',
    effectiveness: 'essential',
    category: 'Network Security',
  },
  {
    title: 'Browser Hardening Guide',
    description:
      'Step-by-step instructions to configure your browser for maximum privacy. From Firefox tweaks to Chrome alternatives.',
    href: '/defense/hardening',
    icon: '🔧',
    effectiveness: 'recommended',
    category: 'Configuration',
  },
];

const quickWins = [
  {
    action: 'Install uBlock Origin',
    impact: 'Blocks 90%+ of trackers',
    time: '2 minutes',
    link: 'https://ublockorigin.com/',
  },
  {
    action: 'Enable Firefox Strict Mode',
    impact: 'Built-in tracker protection',
    time: '30 seconds',
    link: null,
  },
  {
    action: 'Use HTTPS Everywhere',
    impact: 'Encrypts connections',
    time: '2 minutes',
    link: 'https://www.eff.org/https-everywhere',
  },
  {
    action: 'Switch to DuckDuckGo',
    impact: 'Private search engine',
    time: '1 minute',
    link: 'https://duckduckgo.com/',
  },
];

export default function DefenseIndexPage() {
  return (
    <div className="bg-paper grid-bg">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Semantic H1 for SEO */}
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-center mb-8 tracking-tight">
          Browser Privacy Protection Tools
        </h1>

        <Document variant="classified" watermark="ARMORY">
          <DocumentHeader
            title="Defense Armory"
            subtitle="Tools and guides to protect your digital privacy"
            classification="unclassified"
            date={new Date()}
          />

          <div className="prose prose-lg max-w-none mb-8">
            <p className="font-serif text-xl leading-relaxed">
              Knowledge is power, but action is protection. This section provides the tools,
              tests, and guides you need to defend yourself against online tracking. From
              quick wins to advanced configurations.
            </p>
            <blockquote className="border-l-4 border-alert-green pl-4 italic text-ink-200 my-6">
              "Privacy is not something that I'm merely entitled to, it's an absolute prerequisite."
              <cite className="block text-sm mt-2">— Marlon Brando</cite>
            </blockquote>
          </div>

          <DocumentSection title="Quick Wins (Start Here)">
            <p className="text-ink-200 mb-4">
              These four actions take less than 10 minutes combined and dramatically improve your privacy:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {quickWins.map((win, index) => (
                <motion.div
                  key={win.action}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-alert-green/10 border-l-4 border-alert-green p-4 rounded-sm"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-mono text-sm font-bold">{win.action}</h4>
                    <span className="text-xs bg-paper-200 px-2 py-0.5 rounded-full">
                      {win.time}
                    </span>
                  </div>
                  <p className="text-sm text-ink-200 mb-2">{win.impact}</p>
                  {win.link && (
                    <a
                      href={win.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-alert-green hover:underline"
                    >
                      Get it →
                    </a>
                  )}
                </motion.div>
              ))}
            </div>
          </DocumentSection>

          <DocumentSection title="Defense Tools & Tests">
            <div className="grid gap-4">
              {defenseTools.map((tool, index) => (
                <motion.div
                  key={tool.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link href={tool.href} className="block group">
                    <div className="document p-5 hover:shadow-lg transition-all border-l-4 border-transparent hover:border-alert-green">
                      <div className="flex items-start gap-4">
                        <div className="text-3xl">{tool.icon}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-serif font-bold text-lg group-hover:text-ink-200 transition-colors">
                              {tool.title}
                            </h3>
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full font-mono uppercase ${
                                tool.effectiveness === 'essential'
                                  ? 'bg-alert-green/10 text-alert-green'
                                  : tool.effectiveness === 'recommended'
                                  ? 'bg-alert-orange/10 text-alert-orange'
                                  : 'bg-paper-300 text-ink-300'
                              }`}
                            >
                              {tool.effectiveness}
                            </span>
                            <span className="text-xs text-ink-300 font-mono">
                              {tool.category}
                            </span>
                          </div>
                          <p className="text-sm text-ink-200">
                            {tool.description}
                          </p>
                        </div>
                        <div className="text-ink-300 group-hover:text-ink transition-colors">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </DocumentSection>

          <DocumentSection title="Defense Levels">
            <div className="space-y-6">
              <div className="bg-paper-100 p-6 rounded-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-alert-green rounded-full flex items-center justify-center text-paper font-bold">
                    1
                  </div>
                  <h4 className="font-serif font-bold text-lg">Basic Protection</h4>
                </div>
                <p className="text-ink-200 mb-4">
                  Minimal effort, significant improvement. Good for casual privacy.
                </p>
                <ul className="text-sm space-y-2">
                  <li className="flex items-center gap-2">
                    <span className="text-alert-green">✓</span>
                    Install uBlock Origin ad blocker
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-alert-green">✓</span>
                    Use a privacy-focused search engine
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-alert-green">✓</span>
                    Enable browser's built-in tracking protection
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-alert-green">✓</span>
                    Clear cookies regularly
                  </li>
                </ul>
              </div>

              <div className="bg-paper-100 p-6 rounded-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-alert-orange rounded-full flex items-center justify-center text-paper font-bold">
                    2
                  </div>
                  <h4 className="font-serif font-bold text-lg">Enhanced Protection</h4>
                </div>
                <p className="text-ink-200 mb-4">
                  Requires some configuration. Recommended for privacy-conscious users.
                </p>
                <ul className="text-sm space-y-2">
                  <li className="flex items-center gap-2">
                    <span className="text-alert-orange">✓</span>
                    Switch to Firefox with strict tracking protection
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-alert-orange">✓</span>
                    Use a VPN (reputable provider, no logs)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-alert-orange">✓</span>
                    Disable WebRTC in browser settings
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-alert-orange">✓</span>
                    Use encrypted DNS (DNS over HTTPS)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-alert-orange">✓</span>
                    Install Privacy Badger or similar
                  </li>
                </ul>
              </div>

              <div className="bg-paper-100 p-6 rounded-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-alert-red rounded-full flex items-center justify-center text-paper font-bold">
                    3
                  </div>
                  <h4 className="font-serif font-bold text-lg">Maximum Protection</h4>
                </div>
                <p className="text-ink-200 mb-4">
                  For journalists, activists, or high-threat models. May affect usability.
                </p>
                <ul className="text-sm space-y-2">
                  <li className="flex items-center gap-2">
                    <span className="text-alert-red">✓</span>
                    Use Tor Browser for sensitive activities
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-alert-red">✓</span>
                    Enable Firefox's resistFingerprinting
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-alert-red">✓</span>
                    Use separate browser profiles
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-alert-red">✓</span>
                    Deploy Pi-hole or NextDNS network-wide
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-alert-red">✓</span>
                    Disable JavaScript selectively
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-alert-red">✓</span>
                    Use Tails OS for maximum anonymity
                  </li>
                </ul>
              </div>
            </div>
          </DocumentSection>

          <DocumentSection title="Recommended Tools">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-paper-100 p-4 rounded-sm">
                <h4 className="font-mono text-sm font-bold mb-2 uppercase tracking-wider">Browsers</h4>
                <ul className="text-sm space-y-1">
                  <li>• Firefox (hardened)</li>
                  <li>• Tor Browser</li>
                  <li>• Brave</li>
                  <li>• LibreWolf</li>
                </ul>
              </div>
              <div className="bg-paper-100 p-4 rounded-sm">
                <h4 className="font-mono text-sm font-bold mb-2 uppercase tracking-wider">Extensions</h4>
                <ul className="text-sm space-y-1">
                  <li>• uBlock Origin</li>
                  <li>• Privacy Badger</li>
                  <li>• Decentraleyes</li>
                  <li>• Canvas Blocker</li>
                </ul>
              </div>
              <div className="bg-paper-100 p-4 rounded-sm">
                <h4 className="font-mono text-sm font-bold mb-2 uppercase tracking-wider">Network</h4>
                <ul className="text-sm space-y-1">
                  <li>• Mullvad VPN</li>
                  <li>• NextDNS</li>
                  <li>• Pi-hole</li>
                  <li>• AdGuard Home</li>
                </ul>
              </div>
            </div>
          </DocumentSection>
        </Document>

        <div className="flex justify-center gap-6 mt-8">
          <Stamp variant="verified">Defense Guide</Stamp>
          <Stamp variant="protected">Privacy First</Stamp>
        </div>
      </div>
    </div>
  );
}
