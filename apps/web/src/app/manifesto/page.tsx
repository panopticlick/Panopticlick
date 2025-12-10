'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Document,
  DocumentHeader,
  DocumentSection,
  Stamp,
} from '@/components/ui';

interface ManifestoSection {
  title: string;
  description: string;
  href: string;
  icon: string;
}

const manifestoSections: ManifestoSection[] = [
  {
    title: 'Digital Privacy Rights',
    description:
      'A declaration of the fundamental rights every internet user deserves. Privacy is not a feature—it\'s a human right in the digital age.',
    href: '/manifesto/privacy-rights',
    icon: '📜',
  },
  {
    title: 'How It Works',
    description:
      'The technical methodology behind our fingerprinting tests. Transparent, peer-reviewed, and open source.',
    href: '/methodology',
    icon: '🔬',
  },
];

export default function ManifestoIndexPage() {
  return (
    <div className="bg-paper grid-bg">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Semantic H1 for SEO */}
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-center mb-8 tracking-tight">
          Digital Privacy Manifesto
        </h1>

        <Document variant="classified" watermark="MANIFESTO">
          <DocumentHeader
            title="Deconstruct Your Digital Shadow"
            subtitle="A declaration of digital privacy rights"
            classification="unclassified"
            date={new Date()}
          />

          <div className="prose prose-lg max-w-none mb-8">
            <p className="font-serif text-2xl leading-relaxed">
              We believe the internet was meant to be a tool for human liberation—not
              a surveillance apparatus that commodifies every click, scroll, and thought.
            </p>

            <blockquote className="border-l-4 border-highlight pl-4 italic text-xl my-8">
              "Arguing that you don't care about the right to privacy because you have
              nothing to hide is no different than saying you don't care about free
              speech because you have nothing to say."
              <cite className="block text-sm mt-2 font-normal">— Edward Snowden</cite>
            </blockquote>
          </div>

          <DocumentSection title="Core Beliefs">
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-paper-100 p-6 rounded-sm border-l-4 border-highlight"
              >
                <h3 className="font-serif font-bold text-xl mb-3">
                  1. Privacy is a Right, Not a Privilege
                </h3>
                <p className="text-ink-200">
                  In the physical world, we don't accept strangers following us through
                  stores, recording our conversations, and selling dossiers on our habits.
                  The digital world should be no different. Privacy is the foundation of
                  autonomy and freedom.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-paper-100 p-6 rounded-sm border-l-4 border-highlight"
              >
                <h3 className="font-serif font-bold text-xl mb-3">
                  2. Surveillance Capitalism is the Problem
                </h3>
                <p className="text-ink-200">
                  The business model of "free" services funded by advertising has created
                  a perverse incentive: companies profit from knowing everything about you.
                  Your attention, behavior, and identity are harvested, packaged, and sold
                  to the highest bidder. This is not innovation—it's exploitation.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-paper-100 p-6 rounded-sm border-l-4 border-highlight"
              >
                <h3 className="font-serif font-bold text-xl mb-3">
                  3. Knowledge is Power
                </h3>
                <p className="text-ink-200">
                  Most people don't understand how they're being tracked. That asymmetry
                  benefits trackers. By exposing surveillance mechanisms in plain language,
                  we shift power back to users. You can't fight what you can't see.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-paper-100 p-6 rounded-sm border-l-4 border-highlight"
              >
                <h3 className="font-serif font-bold text-xl mb-3">
                  4. Tools, Not Just Talk
                </h3>
                <p className="text-ink-200">
                  We don't just complain about tracking—we give you tools to understand and
                  combat it. Test your browser, learn the techniques, implement defenses.
                  Action beats awareness.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-paper-100 p-6 rounded-sm border-l-4 border-highlight"
              >
                <h3 className="font-serif font-bold text-xl mb-3">
                  5. Open Source or It Didn't Happen
                </h3>
                <p className="text-ink-200">
                  Our code is public. Our methodology is documented. Anyone can verify
                  what we do. Trust should be earned through transparency, not demanded
                  through terms of service.
                </p>
              </motion.div>
            </div>
          </DocumentSection>

          <DocumentSection title="Our Mission">
            <div className="bg-ink text-paper p-8 rounded-sm">
              <p className="font-serif text-xl leading-relaxed mb-6">
                <span className="text-highlight font-bold">Panopticlick</span> exists to:
              </p>
              <ol className="space-y-4 font-mono">
                <li className="flex gap-4">
                  <span className="text-highlight font-bold">01.</span>
                  <span>Expose how browser fingerprinting and online tracking works</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-highlight font-bold">02.</span>
                  <span>Show users their "advertising value" in dollar terms</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-highlight font-bold">03.</span>
                  <span>Provide tools to test privacy protections</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-highlight font-bold">04.</span>
                  <span>Educate without fear-mongering</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-highlight font-bold">05.</span>
                  <span>Empower users to make informed privacy decisions</span>
                </li>
              </ol>
            </div>
          </DocumentSection>

          <DocumentSection title="Read More">
            <div className="grid gap-4">
              {manifestoSections.map((section, index) => (
                <motion.div
                  key={section.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link href={section.href} className="block group">
                    <div className="document p-5 hover:shadow-lg transition-all border-l-4 border-transparent hover:border-highlight">
                      <div className="flex items-start gap-4">
                        <div className="text-3xl">{section.icon}</div>
                        <div className="flex-1">
                          <h3 className="font-serif font-bold text-lg group-hover:text-ink-200 transition-colors">
                            {section.title}
                          </h3>
                          <p className="text-sm text-ink-200 mt-1">
                            {section.description}
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

          <DocumentSection title="Join Us">
            <p className="text-ink-200 mb-6">
              This is a community effort. Whether you're a developer, researcher, writer,
              or just someone who cares about privacy—there's a place for you.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="https://github.com/7and1/Panopticlick"
                className="inline-flex items-center gap-2 px-6 py-3 bg-ink text-paper rounded-sm hover:bg-ink-200 transition-colors font-mono"
                target="_blank"
                rel="noopener noreferrer"
              >
                Contribute on GitHub
              </Link>
              <Link
                href="/about/"
                className="inline-flex items-center gap-2 px-6 py-3 border border-ink rounded-sm hover:bg-paper-100 transition-colors font-mono"
              >
                Learn About Us
              </Link>
            </div>
          </DocumentSection>
        </Document>

        <div className="flex justify-center gap-6 mt-8">
          <Stamp variant="verified">Manifesto</Stamp>
          <Stamp variant="protected">Privacy First</Stamp>
        </div>
      </div>
    </div>
  );
}
