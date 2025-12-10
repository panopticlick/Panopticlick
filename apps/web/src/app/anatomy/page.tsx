'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Document,
  DocumentHeader,
  DocumentSection,
  Stamp,
} from '@/components/ui';

interface AnatomyCard {
  title: string;
  description: string;
  href: string;
  icon: string;
  techniques: string[];
  trackingPower: 'extreme' | 'high' | 'medium';
}

const anatomyTopics: AnatomyCard[] = [
  {
    title: 'Browser Fingerprinting',
    description:
      'Canvas, WebGL, and Audio fingerprinting turn your browser into a unique identifier. These techniques extract hardware signatures that are nearly impossible to fake.',
    href: '/anatomy/fingerprinting',
    icon: '🎨',
    techniques: ['Canvas', 'WebGL', 'AudioContext', 'Font Enumeration'],
    trackingPower: 'extreme',
  },
  {
    title: 'Supercookies',
    description:
      'Persistent tracking mechanisms that survive cookie deletion, private browsing, and even browser reinstallation. The cockroaches of the tracking world.',
    href: '/anatomy/supercookies',
    icon: '🍪',
    techniques: ['HSTS', 'Favicon Cache', 'ETag', 'localStorage'],
    trackingPower: 'extreme',
  },
  {
    title: 'Behavioral Tracking',
    description:
      'Your mouse movements, typing patterns, and scroll behavior create a behavioral signature as unique as your fingerprint. You ARE how you browse.',
    href: '/anatomy/behavior',
    icon: '🖱️',
    techniques: ['Mouse Dynamics', 'Keystroke Timing', 'Scroll Patterns', 'Touch Gestures'],
    trackingPower: 'high',
  },
];

export default function AnatomyIndexPage() {
  return (
    <div className="bg-paper grid-bg">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Semantic H1 for SEO */}
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-center mb-8 tracking-tight">
          How Online Tracking Works
        </h1>

        <Document variant="classified" watermark="CLASSIFIED">
          <DocumentHeader
            title="Anatomy of Tracking"
            subtitle="Dissecting the surveillance machinery piece by piece"
            classification="top-secret"
            date={new Date()}
          />

          <div className="prose prose-lg max-w-none mb-8">
            <p className="font-serif text-xl leading-relaxed">
              Every time you open a browser, you broadcast hundreds of data points about yourself.
              Advertisers, data brokers, and surveillance systems have built an entire industry
              around collecting these signals. Here's exactly how they do it.
            </p>
            <blockquote className="border-l-4 border-alert-red pl-4 italic text-ink-200 my-6">
              "The best way to defeat a system is to understand it completely."
              <cite className="block text-sm mt-2">— Security Researcher Axiom</cite>
            </blockquote>
          </div>

          <DocumentSection title="Tracking Techniques Exposed">
            <div className="grid gap-6">
              {anatomyTopics.map((topic, index) => (
                <motion.div
                  key={topic.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.15 }}
                >
                  <Link href={topic.href} className="block group">
                    <div className="document p-6 hover:shadow-xl transition-all border-l-4 border-transparent hover:border-alert-red">
                      <div className="flex items-start gap-4">
                        <div className="text-4xl">{topic.icon}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-serif font-bold text-xl group-hover:text-ink-200 transition-colors">
                              {topic.title}
                            </h3>
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full font-mono uppercase ${
                                topic.trackingPower === 'extreme'
                                  ? 'bg-alert-red/10 text-alert-red'
                                  : topic.trackingPower === 'high'
                                  ? 'bg-alert-orange/10 text-alert-orange'
                                  : 'bg-alert-green/10 text-alert-green'
                              }`}
                            >
                              {topic.trackingPower} Threat
                            </span>
                          </div>
                          <p className="text-ink-200 mb-4">
                            {topic.description}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {topic.techniques.map((tech) => (
                              <span
                                key={tech}
                                className="text-xs px-2 py-1 bg-paper-200 rounded-sm font-mono"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="text-ink-300 group-hover:text-ink transition-colors">
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

          <DocumentSection title="The Tracking Ecosystem">
            <div className="bg-ink text-paper p-6 rounded-sm font-mono text-sm">
              <pre className="whitespace-pre-wrap">
{`┌─────────────────────────────────────────────────────┐
│                  YOUR BROWSER                        │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌───────────┐  │
│  │ Canvas  │ │ WebGL   │ │ Audio   │ │ Behavior  │  │
│  └────┬────┘ └────┬────┘ └────┬────┘ └─────┬─────┘  │
│       │           │           │             │        │
│       └───────────┴───────────┴─────────────┘        │
│                       │                              │
│              [FINGERPRINT HASH]                      │
└───────────────────────┬─────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│               DATA COLLECTION LAYER                  │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │
│  │ 1st Party   │ │ 3rd Party   │ │ Supercookie │   │
│  │ Trackers    │ │ Scripts     │ │ Mechanisms  │   │
│  └─────────────┘ └─────────────┘ └─────────────┘   │
└───────────────────────┬─────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│                 DATA BROKER NETWORK                  │
│         $0.005 - $0.50 per profile per day          │
└─────────────────────────────────────────────────────┘`}
              </pre>
            </div>
          </DocumentSection>

          <DocumentSection title="Quick Stats">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-paper-100 p-4 rounded-sm text-center">
                <div className="text-3xl font-bold text-alert-red mb-1">99.7%</div>
                <div className="text-sm text-ink-200 font-mono">Browsers are Uniquely Identifiable</div>
              </div>
              <div className="bg-paper-100 p-4 rounded-sm text-center">
                <div className="text-3xl font-bold text-alert-orange mb-1">$200B+</div>
                <div className="text-sm text-ink-200 font-mono">Annual AdTech Market Size</div>
              </div>
              <div className="bg-paper-100 p-4 rounded-sm text-center">
                <div className="text-3xl font-bold text-highlight mb-1">80+</div>
                <div className="text-sm text-ink-200 font-mono">Fingerprinting Dimensions</div>
              </div>
            </div>
          </DocumentSection>
        </Document>

        <div className="flex justify-center gap-6 mt-8">
          <Stamp variant="classified">Intel Report</Stamp>
          <Stamp variant="denied">Handle with Care</Stamp>
        </div>

        {/* Educational Content Section */}
        <article className="mt-16 prose prose-lg max-w-none">
          <h2 className="font-serif text-3xl font-bold mb-6">
            The $595 Billion Industry Built on Your Data
          </h2>

          <p className="text-xl leading-relaxed mb-6">
            Let's put some numbers on this. The global programmatic advertising market hit
            $595 billion in 2024. That's the industry built on tracking you. The industry
            that needs to know who you are, where you go, what you buy, and what you think.
          </p>

          <p className="mb-6">
            Every major website participates. Google, Facebook, Amazon — obviously. But
            also news sites, shopping sites, game sites, weather apps, fitness trackers.
            If it's free, you're not the customer. You're the product.
          </p>

          <p className="mb-8">
            The tracking industry has evolved faster than regulation can keep up. While
            lawmakers debate cookie consent banners, the industry moved to fingerprinting.
            While privacy advocates push for transparency, data brokers operate in shadows.
          </p>

          {/* Data Industry Stats */}
          <div className="bg-paper-100 p-6 rounded-sm my-8 not-prose">
            <h3 className="font-mono text-lg font-bold mb-4">The Tracking Industry by Numbers</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-ink/20">
                    <th className="text-left py-2 font-mono">Metric</th>
                    <th className="text-right py-2 font-mono">Value</th>
                    <th className="text-right py-2 font-mono">Year</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-ink/10">
                    <td className="py-2">Global programmatic ad market</td>
                    <td className="text-right font-bold">$595B</td>
                    <td className="text-right text-ink-300">2024</td>
                  </tr>
                  <tr className="border-b border-ink/10">
                    <td className="py-2">Data broker industry size</td>
                    <td className="text-right font-bold">$319B</td>
                    <td className="text-right text-ink-300">2024</td>
                  </tr>
                  <tr className="border-b border-ink/10">
                    <td className="py-2">Average data points per user profile</td>
                    <td className="text-right font-bold">1,500+</td>
                    <td className="text-right text-ink-300">2023</td>
                  </tr>
                  <tr className="border-b border-ink/10">
                    <td className="py-2">Websites using fingerprinting</td>
                    <td className="text-right font-bold">25%+</td>
                    <td className="text-right text-ink-300">2024</td>
                  </tr>
                  <tr>
                    <td className="py-2">Third-party trackers on avg. website</td>
                    <td className="text-right font-bold">17</td>
                    <td className="text-right text-ink-300">2024</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-ink-300 mt-4">
              Sources: eMarketer, Statista, Princeton WebTAP, DuckDuckGo Privacy Research
            </p>
          </div>

          <h2 className="font-serif text-3xl font-bold mb-6 mt-12">
            How Tracking Has Evolved
          </h2>

          <p className="mb-6">
            The first web trackers were simple. A cookie with a unique ID, sent to an ad
            server on every page load. Easy to understand, easy to block. Delete your
            cookies, and the tracking stopped.
          </p>

          <p className="mb-6">
            Then came third-party cookies — cookies set by domains other than the one you're
            visiting. Suddenly, one tracker could follow you across millions of websites.
            But browsers started blocking these, and users installed ad blockers.
          </p>

          <p className="mb-8">
            The industry adapted. Fingerprinting emerged as the cookie alternative. Instead
            of storing an ID on your device, it calculates an ID from your device's
            characteristics. No storage, no consent required, no way to delete.
          </p>

          {/* Evolution Timeline */}
          <div className="bg-ink text-paper p-6 rounded-sm my-8 not-prose">
            <h3 className="font-mono text-lg font-bold mb-4 text-highlight">
              Evolution of Web Tracking
            </h3>
            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-4">
                <div className="text-paper-400 font-mono w-16">1994</div>
                <div>
                  <span className="font-bold text-highlight">Cookies invented</span> — Simple text files stored by browsers
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="text-paper-400 font-mono w-16">2007</div>
                <div>
                  <span className="font-bold text-highlight">Flash cookies</span> — Persistent tracking via Adobe Flash (now dead)
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="text-paper-400 font-mono w-16">2010</div>
                <div>
                  <span className="font-bold text-highlight">Canvas fingerprinting</span> — EFF publishes Panopticlick research
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="text-paper-400 font-mono w-16">2014</div>
                <div>
                  <span className="font-bold text-highlight">AudioContext fingerprinting</span> — New dimension discovered
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="text-paper-400 font-mono w-16">2018</div>
                <div>
                  <span className="font-bold text-highlight">GDPR enacted</span> — Cookie consent banners appear everywhere
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="text-paper-400 font-mono w-16">2020</div>
                <div>
                  <span className="font-bold text-highlight">Third-party cookie death</span> — Browsers start blocking by default
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="text-paper-400 font-mono w-16">2024</div>
                <div>
                  <span className="font-bold text-highlight">Fingerprinting dominates</span> — Cookie alternative goes mainstream
                </div>
              </div>
            </div>
          </div>

          <h2 className="font-serif text-3xl font-bold mb-6 mt-12">
            The Three Pillars of Modern Tracking
          </h2>

          <h3 className="font-serif text-xl font-bold mb-4">1. Browser Fingerprinting</h3>
          <p className="mb-6">
            Your browser is unique. The combination of your screen resolution, installed
            fonts, timezone, language, plugins, and hardware configuration creates a
            fingerprint that identifies you among billions of users. No cookies required.
            Works in private browsing. Can't be deleted.
          </p>

          <h3 className="font-serif text-xl font-bold mb-4">2. Supercookies</h3>
          <p className="mb-6">
            Supercookies exploit browser features to store persistent identifiers. HSTS
            supercookies abuse security features. Favicon caching creates unique patterns.
            ETag headers store identifiers server-side. These survive cookie deletion,
            private browsing, and sometimes even browser reinstallation.
          </p>

          <h3 className="font-serif text-xl font-bold mb-4">3. Behavioral Analysis</h3>
          <p className="mb-8">
            How you type, how you move your mouse, how you scroll — these create a
            behavioral signature as unique as a fingerprint. Machine learning can identify
            you from a few seconds of interaction. No personal data needed, just patterns.
          </p>

          <h2 className="font-serif text-3xl font-bold mb-6 mt-12">
            What Happens to Your Data
          </h2>

          <p className="mb-6">
            Tracking is just the first step. Your data enters a complex ecosystem of
            buyers and sellers:
          </p>

          <ul className="mb-8 space-y-2">
            <li><strong>Data brokers</strong> buy and sell user profiles. Companies like Acxiom, Oracle, and LiveRamp maintain profiles on billions of people.</li>
            <li><strong>DSPs (Demand-Side Platforms)</strong> help advertisers bid on users in real-time auctions.</li>
            <li><strong>DMPs (Data Management Platforms)</strong> combine data from multiple sources to create comprehensive profiles.</li>
            <li><strong>Credit bureaus</strong> integrate browsing data with financial information.</li>
            <li><strong>Insurance companies</strong> use data to assess risk and set premiums.</li>
            <li><strong>Political campaigns</strong> target voters based on their digital profiles.</li>
          </ul>

          <p className="mb-8">
            Your browsing history, combined with purchase data, location data, and social
            media activity, creates a profile that knows you better than you know yourself.
            And this profile is bought and sold thousands of times per day.
          </p>

          {/* CTA */}
          <div className="bg-highlight/20 border-2 border-highlight p-8 rounded-sm my-8 text-center not-prose">
            <h3 className="font-serif text-2xl font-bold mb-4">
              See Your Fingerprint
            </h3>
            <p className="mb-6 text-ink-200">
              Run our browser fingerprint scan to see exactly what data you're
              exposing and how unique your browser is.
            </p>
            <a
              href="/scan/"
              className="inline-block bg-ink text-paper px-8 py-4 font-mono font-bold rounded-sm hover:bg-ink/90 transition-colors"
            >
              Run the Fingerprint Scan →
            </a>
          </div>
        </article>
      </div>
    </div>
  );
}
