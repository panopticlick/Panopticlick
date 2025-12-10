'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Document,
  DocumentHeader,
  DocumentSection,
  Stamp,
} from '@/components/ui';

interface SimulationCard {
  title: string;
  description: string;
  href: string;
  icon: string;
  complexity: 'advanced' | 'intermediate' | 'basic';
  revenue: string;
}

const simulations: SimulationCard[] = [
  {
    title: 'RTB Auction Simulator',
    description:
      'Watch your data get auctioned in real-time. See which advertisers bid for your attention and how much your profile is worth in the programmatic advertising marketplace.',
    href: '/simulation/rtb',
    icon: '💰',
    complexity: 'advanced',
    revenue: '$147B annually',
  },
  {
    title: 'Cookie Syncing Demo',
    description:
      'Discover how trackers share your identity across networks. Cookie syncing lets thousands of companies build profiles on you by exchanging IDs in milliseconds.',
    href: '/simulation/cookie-sync',
    icon: '🔗',
    complexity: 'intermediate',
    revenue: 'Foundational',
  },
  {
    title: 'CNAME Cloaking Detection',
    description:
      'Third-party trackers disguise themselves as first-party scripts using DNS tricks. See if your browser is being fooled by these sophisticated evasion techniques.',
    href: '/simulation/cname',
    icon: '🎭',
    complexity: 'advanced',
    revenue: 'Evasion tech',
  },
];

export default function SimulationIndexPage() {
  return (
    <div className="bg-paper grid-bg">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Semantic H1 for SEO */}
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-center mb-8 tracking-tight">
          AdTech Simulation Lab
        </h1>

        <Document variant="classified" watermark="FOLLOW THE MONEY">
          <DocumentHeader
            title="Follow the Money"
            subtitle="See the surveillance economy in action"
            classification="confidential"
            date={new Date()}
          />

          <div className="prose prose-lg max-w-none mb-8">
            <p className="font-serif text-xl leading-relaxed">
              Every time you visit a website, an invisible auction happens in milliseconds.
              Advertisers bid for your attention based on everything they know about you.
              These simulations expose how that system works—and what it knows.
            </p>
            <div className="not-prose bg-highlight/20 border-l-4 border-highlight p-4 my-6">
              <p className="font-mono text-sm">
                <strong>THE MONEY TRAIL:</strong> The digital advertising industry generated
                <span className="font-bold text-alert-red"> $600+ billion</span> in 2023.
                Your data is the product. These simulations show you exactly how.
              </p>
            </div>
          </div>

          <DocumentSection title="Interactive Simulations">
            <div className="grid gap-6">
              {simulations.map((sim, index) => (
                <motion.div
                  key={sim.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.15 }}
                >
                  <Link href={sim.href} className="block group">
                    <div className="document p-6 hover:shadow-xl transition-all border-l-4 border-transparent hover:border-highlight">
                      <div className="flex items-start gap-4">
                        <div className="text-4xl">{sim.icon}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-serif font-bold text-xl group-hover:text-ink-200 transition-colors">
                              {sim.title}
                            </h3>
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full font-mono uppercase ${
                                sim.complexity === 'advanced'
                                  ? 'bg-alert-red/10 text-alert-red'
                                  : sim.complexity === 'intermediate'
                                  ? 'bg-alert-orange/10 text-alert-orange'
                                  : 'bg-alert-green/10 text-alert-green'
                              }`}
                            >
                              {sim.complexity}
                            </span>
                          </div>
                          <p className="text-ink-200 mb-4">
                            {sim.description}
                          </p>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="font-mono text-highlight">
                              {sim.revenue}
                            </span>
                            <span className="text-ink-300 group-hover:text-ink transition-colors">
                              Launch simulation →
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

          <DocumentSection title="How Programmatic Advertising Works">
            <div className="bg-ink text-paper p-6 rounded-sm font-mono text-sm">
              <pre className="whitespace-pre-wrap">
{`YOU VISIT A WEBPAGE
        │
        ▼ (< 100ms)
┌─────────────────────────────────────────────────────┐
│              SUPPLY-SIDE PLATFORM (SSP)             │
│   Publisher's tool to sell ad inventory             │
│   "I have an ad slot. Who wants it?"                │
└───────────────────────┬─────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        ▼               ▼               ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│   AD        │ │   AD        │ │   AD        │
│ EXCHANGE 1  │ │ EXCHANGE 2  │ │ EXCHANGE 3  │
│  (Google)   │ │  (OpenX)    │ │ (Rubicon)   │
└──────┬──────┘ └──────┬──────┘ └──────┬──────┘
       │               │               │
       └───────────────┼───────────────┘
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│    DSP 1    │ │    DSP 2    │ │    DSP 3    │
│  (Criteo)   │ │ (The Trade  │ │  (Amazon)   │
│             │ │    Desk)    │ │             │
│  Bid: $2.50 │ │  Bid: $1.80 │ │  Bid: $3.20 │
└─────────────┘ └─────────────┘ └─────────────┘
        │              │              │
        │    YOUR DATA PROFILE        │
        │    ┌─────────────────┐      │
        └────│ Age: 25-34      │──────┘
             │ Income: $75-100k │
             │ Intent: Shopping │
             │ Device: iPhone   │
             │ Location: NYC    │
             │ Interests: Tech  │
             └─────────────────┘

WINNER: Amazon DSP ($3.20)
AD LOADS ON PAGE: < 200ms total`}
              </pre>
            </div>
          </DocumentSection>

          <DocumentSection title="Key Players in the Ecosystem">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-paper-100 p-4 rounded-sm">
                <h4 className="font-mono text-sm font-bold mb-2 uppercase tracking-wider">
                  SSP (Supply-Side Platform)
                </h4>
                <p className="text-sm text-ink-200 mb-2">
                  Helps publishers sell ad space. Connects to multiple ad exchanges
                  to maximize revenue.
                </p>
                <div className="text-xs text-ink-300 font-mono">
                  Examples: Google Ad Manager, Magnite, PubMatic
                </div>
              </div>
              <div className="bg-paper-100 p-4 rounded-sm">
                <h4 className="font-mono text-sm font-bold mb-2 uppercase tracking-wider">
                  DSP (Demand-Side Platform)
                </h4>
                <p className="text-sm text-ink-200 mb-2">
                  Helps advertisers buy ad space. Uses targeting data to bid on
                  impressions in real-time.
                </p>
                <div className="text-xs text-ink-300 font-mono">
                  Examples: Google DV360, The Trade Desk, Amazon DSP
                </div>
              </div>
              <div className="bg-paper-100 p-4 rounded-sm">
                <h4 className="font-mono text-sm font-bold mb-2 uppercase tracking-wider">
                  DMP (Data Management Platform)
                </h4>
                <p className="text-sm text-ink-200 mb-2">
                  Collects, organizes, and sells audience data. Builds profiles from
                  browsing behavior across sites.
                </p>
                <div className="text-xs text-ink-300 font-mono">
                  Examples: Oracle BlueKai, Lotame, LiveRamp
                </div>
              </div>
              <div className="bg-paper-100 p-4 rounded-sm">
                <h4 className="font-mono text-sm font-bold mb-2 uppercase tracking-wider">
                  Data Broker
                </h4>
                <p className="text-sm text-ink-200 mb-2">
                  Aggregates and sells personal data from multiple sources—online
                  and offline. The shadow players.
                </p>
                <div className="text-xs text-ink-300 font-mono">
                  Examples: Acxiom, Experian, CoreLogic
                </div>
              </div>
            </div>
          </DocumentSection>

          <DocumentSection title="Market Statistics">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="bg-paper-100 p-4 rounded-sm text-center">
                <div className="text-3xl font-bold text-alert-red mb-1">$600B+</div>
                <div className="text-xs text-ink-200 font-mono">Digital Ad Spend 2023</div>
              </div>
              <div className="bg-paper-100 p-4 rounded-sm text-center">
                <div className="text-3xl font-bold text-alert-orange mb-1">100ms</div>
                <div className="text-xs text-ink-200 font-mono">Average Auction Time</div>
              </div>
              <div className="bg-paper-100 p-4 rounded-sm text-center">
                <div className="text-3xl font-bold text-highlight mb-1">500B+</div>
                <div className="text-xs text-ink-200 font-mono">Daily RTB Bid Requests</div>
              </div>
              <div className="bg-paper-100 p-4 rounded-sm text-center">
                <div className="text-3xl font-bold text-alert-green mb-1">$0.50</div>
                <div className="text-xs text-ink-200 font-mono">Avg CPM (Cost/1000)</div>
              </div>
            </div>
          </DocumentSection>
        </Document>

        <div className="flex justify-center gap-6 mt-8">
          <Stamp variant="classified">AdTech Intel</Stamp>
          <Stamp variant="denied">Follow the $$$</Stamp>
        </div>
      </div>
    </div>
  );
}
