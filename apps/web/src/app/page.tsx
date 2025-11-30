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

export default function HomePage() {
  const [scanStarted, setScanStarted] = useState(false);

  return (
    <div className="bg-paper grid-bg">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 max-w-4xl">
        <Document variant="classified" watermark="CLASSIFIED">
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
    </div>
  );
}
