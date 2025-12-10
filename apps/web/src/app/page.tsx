'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Document,
  DocumentHeader,
  Stamp,
  Button,
  StartScanButton,
  Redacted,
  EntropyMeter,
} from '@/components/ui';
import { cn } from '@/lib/utils';

// Note: metadata must be in a separate file for client components
// See: apps/web/src/app/layout.tsx for SEO configuration

export default function HomePage() {
  const [scanStarted, setScanStarted] = useState(false);

  return (
    <div className="bg-paper grid-bg">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 max-w-4xl">
        <Document variant="classified" watermark="CLASSIFIED">
          {/* Semantic H1 - Main page heading for SEO */}
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-center mb-8 tracking-tight">
            Panopticlick: Browser Fingerprint Test
          </h1>

          <DocumentHeader
            title="Subject: Your Browser"
            subtitle="An investigation into digital identity and advertising value"
            classification="confidential"
            caseNumber={`PNP-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`}
            date={new Date()}
          />

          {/* Main content */}
          <div className="space-y-8">
            {/* Introduction */}
            <div className="prose prose-lg max-w-none">
              <p className="font-serif text-xl leading-relaxed">
                Every time you visit a website, you leave behind a{' '}
                <span className="marker">digital fingerprint</span> —
                a unique combination of browser settings, hardware specifications,
                and software configurations that can be used to identify and track you.
              </p>
            </div>

            {/* Key stats preview */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Data Points Collected', value: <Redacted>47</Redacted> },
                { label: 'Advertising Value', value: <Redacted>$4.82 CPM</Redacted> },
                { label: 'Uniqueness', value: <Redacted>1 in 286,435</Redacted> },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  className="text-center p-4 border border-paper-300 rounded-sm"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                >
                  <div className="font-mono text-2xl font-bold">{stat.value}</div>
                  <div className="text-xs text-ink-200 uppercase tracking-wider mt-1">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* CTA Section */}
            <motion.div
              className="text-center py-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <p className="mb-6 text-ink-200">
                Click below to reveal your complete browser dossier
              </p>

              <StartScanButton
                onClick={() => {
                  setScanStarted(true);
                  // Would navigate to /scan in production
                  window.location.href = '/scan/';
                }}
                loading={scanStarted}
              />

              <p className="mt-4 text-xs text-ink-300">
                No data is stored without your explicit consent
              </p>
            </motion.div>
          </div>
        </Document>

        {/* Stamps */}
        <div className="flex justify-center gap-8 mt-8">
          <Stamp variant="classified">Fingerprint Analysis</Stamp>
          <Stamp variant="verified">RTB Simulation</Stamp>
        </div>
      </section>

      {/* What We Test Section */}
      <section className="bg-paper-100 py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="font-serif text-3xl font-bold text-center mb-12">
            What We Investigate
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                title: 'Canvas Fingerprint',
                description:
                  'How your browser renders graphics creates a unique signature',
                entropy: 15.2,
              },
              {
                title: 'WebGL Fingerprint',
                description:
                  'Your GPU and graphics capabilities reveal device identity',
                entropy: 12.4,
              },
              {
                title: 'Audio Fingerprint',
                description:
                  'Audio processing characteristics are surprisingly unique',
                entropy: 10.8,
              },
              {
                title: 'Font Fingerprint',
                description:
                  'Installed fonts create a distinctive profile of your system',
                entropy: 13.6,
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                className="document p-4"
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <h3 className="font-serif font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-ink-200 mb-4">{item.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-ink-300">Typical entropy:</span>
                  <span className="font-mono text-sm font-bold">{item.entropy} bits</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* RTB Preview Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <Document variant="dossier">
            <h2 className="font-serif text-2xl font-bold mb-6">
              Real-Time Bidding Simulation
            </h2>

            <p className="text-ink-200 mb-8">
              See exactly how advertisers value your browsing data in a simulated
              RTB auction. Watch as DSPs compete to show you personalized ads.
            </p>

            <div className="bg-ink text-paper p-6 rounded-sm font-mono text-sm">
              <div className="text-paper-300">// Simulated RTB Auction</div>
              <div className="mt-2">
                <span className="text-highlight">Premium Retail DSP:</span>{' '}
                <Redacted>$4.82 CPM</Redacted>
              </div>
              <div>
                <span className="text-highlight">Finance DSP:</span>{' '}
                <Redacted>$7.24 CPM</Redacted>
              </div>
              <div>
                <span className="text-highlight">Gaming DSP:</span>{' '}
                <Redacted>$2.15 CPM</Redacted>
              </div>
              <div className="mt-4 pt-4 border-t border-paper-300">
                <span className="text-alert-green">Winner:</span>{' '}
                <Redacted>Finance DSP</Redacted> -{' '}
                <span className="text-ink-300">Interest:</span>{' '}
                <Redacted>Investment opportunities</Redacted>
              </div>
            </div>
          </Document>
        </div>
      </section>

      {/* Educational Content Section - SEO optimized, 1000+ words */}
      <section className="py-16 bg-paper">
        <div className="container mx-auto px-4 max-w-4xl">
          <article className="prose prose-lg max-w-none">
            {/* Section 1: Why Browser Fingerprinting Matters */}
            <h2 className="font-serif text-3xl font-bold mb-6">
              Your Browser Is Ratting You Out. Every. Single. Time.
            </h2>

            <p className="text-xl leading-relaxed mb-6">
              Here's the thing most people don't get: clearing your cookies is like changing your
              shirt while keeping the same face. Browser fingerprinting doesn't care about your
              cookies. It looks at your browser's DNA — the unique combination of settings, fonts,
              screen size, and a hundred other things that make your browser uniquely... you.
            </p>

            <p className="mb-6">
              Think about it. Your browser tells websites what language you speak, what timezone
              you're in, what fonts you have installed, how your graphics card renders images,
              even how your audio system processes sound. Combine all of these data points, and
              you get a fingerprint that's often more stable and reliable than cookies.
            </p>

            <p className="mb-8">
              <strong>94% of browsers are uniquely identifiable.</strong> That's not a typo. That's
              basically everyone. According to research from INRIA (the French National Institute
              for Research in Digital Science and Technology), your browser configuration is so
              unique that it can identify you among millions of users — without ever storing a
              single cookie on your device.
            </p>

            {/* Statistics Table */}
            <div className="bg-paper-100 p-6 rounded-sm my-8 not-prose">
              <h3 className="font-mono text-lg font-bold mb-4">Browser Fingerprinting: The Numbers</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-ink/20">
                      <th className="text-left py-2 font-mono">Metric</th>
                      <th className="text-right py-2 font-mono">Value</th>
                      <th className="text-right py-2 font-mono">Source</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-ink/10">
                      <td className="py-2">Unique browsers identified</td>
                      <td className="text-right font-bold">94%</td>
                      <td className="text-right text-ink-300">INRIA AmIUnique</td>
                    </tr>
                    <tr className="border-b border-ink/10">
                      <td className="py-2">Websites using fingerprinting</td>
                      <td className="text-right font-bold">25%+</td>
                      <td className="text-right text-ink-300">Princeton WebTAP</td>
                    </tr>
                    <tr className="border-b border-ink/10">
                      <td className="py-2">Data points collected per visit</td>
                      <td className="text-right font-bold">50+</td>
                      <td className="text-right text-ink-300">EFF Panopticlick</td>
                    </tr>
                    <tr className="border-b border-ink/10">
                      <td className="py-2">Fingerprint stability (30 days)</td>
                      <td className="text-right font-bold">91%</td>
                      <td className="text-right text-ink-300">Brave Research</td>
                    </tr>
                    <tr>
                      <td className="py-2">Average tracking entropy</td>
                      <td className="text-right font-bold">33.6 bits</td>
                      <td className="text-right text-ink-300">AmIUnique 2024</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-ink-300 mt-4">
                Sources: INRIA AmIUnique Research (2024), Princeton WebTAP Project,
                Electronic Frontier Foundation Panopticlick Study, Brave Software Privacy Research
              </p>
            </div>

            {/* Section 2: The Money */}
            <h2 className="font-serif text-3xl font-bold mb-6 mt-12">
              The $595 Billion Surveillance Machine
            </h2>

            <p className="text-xl leading-relaxed mb-6">
              Let's talk money. The global programmatic advertising market hit $595 billion in 2024.
              That's not advertising overall — that's just the automated, data-driven part. The part
              that needs to know who you are, what you like, and what you're likely to buy.
            </p>

            <p className="mb-6">
              Every time you load a webpage, an auction happens. In milliseconds. Advertisers bid
              to show you their ad based on everything they know about you. Your age bracket. Your
              income estimate. Your shopping habits. Your health interests. Your political leanings.
              All of this information has a price tag.
            </p>

            <p className="mb-6">
              The average user's data profile is worth between $0.0005 and $0.02 per impression.
              Doesn't sound like much? You see thousands of ads per month. Multiply that across
              billions of users, and you start to understand why companies like Google and Meta
              are worth trillions.
            </p>

            {/* Money Stats */}
            <div className="bg-ink text-paper p-6 rounded-sm my-8 not-prose">
              <h3 className="font-mono text-lg font-bold mb-4 text-highlight">
                What Your Data Is Worth (2024 Market Rates)
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b border-paper/20 pb-2">
                  <span>General audience CPM</span>
                  <span className="font-mono font-bold">$0.50 - $2.00</span>
                </div>
                <div className="flex justify-between items-center border-b border-paper/20 pb-2">
                  <span>Retargeting CPM</span>
                  <span className="font-mono font-bold">$3.00 - $8.00</span>
                </div>
                <div className="flex justify-between items-center border-b border-paper/20 pb-2">
                  <span>Financial services CPM</span>
                  <span className="font-mono font-bold">$5.00 - $15.00</span>
                </div>
                <div className="flex justify-between items-center border-b border-paper/20 pb-2">
                  <span>Healthcare interest CPM</span>
                  <span className="font-mono font-bold">$4.00 - $12.00</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>In-market auto buyer CPM</span>
                  <span className="font-mono font-bold">$8.00 - $20.00</span>
                </div>
              </div>
              <p className="text-xs text-paper-400 mt-4">
                CPM = Cost Per Mille (cost per 1,000 impressions).
                Source: IAB Programmatic Advertising Report 2024, eMarketer
              </p>
            </div>

            {/* Section 3: How It Works */}
            <h2 className="font-serif text-3xl font-bold mb-6 mt-12">
              How Browser Fingerprinting Actually Works
            </h2>

            <p className="mb-6">
              I'll make this simple. When you visit a website, your browser automatically shares
              information to help the site work properly. Screen resolution? The site needs that
              to display correctly. Timezone? For showing the right times. Installed fonts? For
              rendering text properly.
            </p>

            <p className="mb-6">
              The problem is that all these "helpful" details combine into a unique signature.
              Here's what gets collected:
            </p>

            <ul className="mb-8 space-y-2">
              <li><strong>Canvas fingerprint:</strong> How your browser draws graphics. Each GPU and driver combo produces slightly different results.</li>
              <li><strong>WebGL fingerprint:</strong> Your graphics card's unique rendering patterns and capabilities.</li>
              <li><strong>Audio fingerprint:</strong> How your system processes audio signals. Yes, this is different for every device.</li>
              <li><strong>Font fingerprint:</strong> Which fonts you have installed. The average system has 200-500 fonts.</li>
              <li><strong>Navigator properties:</strong> Browser version, plugins, language, timezone, screen specs.</li>
              <li><strong>Hardware details:</strong> CPU cores, memory, touch support, battery status.</li>
            </ul>

            <p className="mb-8">
              Combine these, and you get an entropy score — a measure of how unique your browser is.
              The original EFF Panopticlick study found that the average browser has about 18 bits of
              identifying information. That's enough to identify you among 262,144 users. Modern
              fingerprinting techniques can collect 33+ bits — enough to identify you among 8.5
              billion possibilities.
            </p>

            {/* Section 4: Why You Should Care */}
            <h2 className="font-serif text-3xl font-bold mb-6 mt-12">
              Why Should You Actually Care?
            </h2>

            <p className="mb-6">
              "I have nothing to hide" — I hear this a lot. But this isn't about hiding. It's about
              control. It's about who gets to know what about you, and what they do with that knowledge.
            </p>

            <p className="mb-6">
              Here's what happens with your fingerprint data:
            </p>

            <ul className="mb-6 space-y-2">
              <li><strong>Price discrimination:</strong> Airlines, hotels, and stores show you different prices based on your profile.</li>
              <li><strong>Credit decisions:</strong> Your browsing behavior influences financial assessments.</li>
              <li><strong>Insurance rates:</strong> Health and lifestyle data affects what you pay.</li>
              <li><strong>Employment screening:</strong> Employers use data brokers to vet candidates.</li>
              <li><strong>Political manipulation:</strong> Your profile determines what news and messaging you see.</li>
            </ul>

            <p className="mb-8">
              In 2018, it was revealed that Cambridge Analytica used detailed user profiles to
              influence elections. That data came from tracking. Your data is being collected
              right now, building a profile that can be used for purposes you never agreed to.
            </p>

            {/* Section 5: What You Can Do */}
            <h2 className="font-serif text-3xl font-bold mb-6 mt-12">
              Fight Back: What You Can Do Right Now
            </h2>

            <p className="mb-6">
              The good news? You're not powerless. Understanding your fingerprint is the first step.
              Our test shows you exactly what data you're leaking and how unique you are.
            </p>

            <p className="mb-6">
              After you run our test, check out our <a href="/defense/" className="text-highlight hover:underline">Defense Armory</a> for
              practical steps you can take:
            </p>

            <ul className="mb-8 space-y-2">
              <li><strong>Browser choice matters:</strong> Brave and Firefox with privacy extensions significantly reduce fingerprinting.</li>
              <li><strong>Extensions help:</strong> uBlock Origin, Privacy Badger, and Canvas Blocker make a real difference.</li>
              <li><strong>Settings tweaks:</strong> Disable WebRTC, limit JavaScript where possible, use private browsing strategically.</li>
              <li><strong>Hardware virtualization:</strong> For serious privacy, consider browser profiles or virtual machines.</li>
            </ul>

            <p className="mb-8">
              The surveillance economy depends on your data being freely available. Every person
              who takes their privacy seriously makes the whole system less valuable. You can't
              stop all tracking, but you can make yourself much harder to identify and much less
              profitable to track.
            </p>

            {/* Final CTA */}
            <div className="bg-highlight/20 border-2 border-highlight p-8 rounded-sm my-8 text-center not-prose">
              <h3 className="font-serif text-2xl font-bold mb-4">
                Ready to See Your Digital Fingerprint?
              </h3>
              <p className="mb-6 text-ink-200">
                Our free browser fingerprint test reveals exactly what data you're exposing
                and calculates your advertising value. No data stored without consent.
              </p>
              <a
                href="/scan/"
                className="inline-block bg-ink text-paper px-8 py-4 font-mono font-bold rounded-sm hover:bg-ink/90 transition-colors"
              >
                Run the Free Test →
              </a>
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}
