import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Document,
  DocumentHeader,
  DocumentSection,
  Stamp,
} from '@/components/ui';
import { JsonLd, breadcrumbJsonLd } from '@/components/seo/json-ld';

export const metadata: Metadata = {
  title: 'About Panopticlick - Browser Fingerprinting Research',
  description:
    'Learn about Panopticlick, an independent browser fingerprinting research project inspired by EFF\'s original work. We help users understand how they can be tracked online and protect their privacy.',
  openGraph: {
    title: 'About Panopticlick',
    description:
      'Independent browser fingerprinting research and privacy education project.',
    type: 'website',
    url: 'https://panopticlick.org/about/',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Panopticlick - Browser Privacy Test',
      },
    ],
  },
  alternates: {
    canonical: 'https://panopticlick.org/about/',
  },
};

// Fixed content date shown on the document header; bump when content changes
const CONTENT_DATE = new Date('2026-07-26');

export default function AboutPage() {
  return (
    <div className="bg-paper grid-bg">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'About', path: '/about/' },
        ])}
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'Panopticlick',
          url: 'https://panopticlick.org',
          description:
            'Independent browser fingerprinting research and privacy education project. Not affiliated with the Electronic Frontier Foundation.',
          email: 'hideme@panopticlick.org',
          sameAs: ['https://github.com/Panopticlick/Panopticlick'],
        }}
      />
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Document variant="classified" watermark="DOSSIER">
          <DocumentHeader
            title="About Panopticlick"
            subtitle="Browser fingerprinting research and privacy education"
            classification="unclassified"
            date={CONTENT_DATE}
          />

          <article className="prose prose-lg max-w-none">
            <DocumentSection title="Our Mission">
              <p>
                <strong>Panopticlick</strong> is a browser fingerprinting research project
                designed to educate users about how they can be tracked online. Inspired by
                the Electronic Frontier Foundation's original Panopticlick project, we've
                modernized and expanded the tools to reflect today's tracking landscape.
              </p>
              <p>
                Our goal is simple: <em>show you exactly what advertisers and trackers
                see when you visit a website.</em> By understanding your digital fingerprint,
                you can take steps to protect your privacy.
              </p>
              <p>
                <strong>Panopticlick.org is an independent project. We are not affiliated
                with, endorsed by, or connected to the Electronic Frontier Foundation
                (EFF).</strong> The name honors EFF's pioneering 2010 research; their own
                successor tool lives on as Cover Your Tracks.
              </p>
            </DocumentSection>

            <DocumentSection title="What is Browser Fingerprinting?">
              <p>
                Browser fingerprinting is a technique that collects information about your
                browser configuration, operating system, and hardware to create a unique
                identifier. Unlike cookies, fingerprints don't require storing anything
                on your device—they're generated from information your browser willingly
                provides to every website you visit.
              </p>
              <p>
                Common fingerprinting vectors include:
              </p>
              <ul>
                <li><strong>Canvas fingerprinting</strong> — How your browser renders graphics</li>
                <li><strong>WebGL fingerprinting</strong> — Your GPU and graphics capabilities</li>
                <li><strong>Audio fingerprinting</strong> — How your browser processes audio</li>
                <li><strong>Font enumeration</strong> — Which fonts are installed on your system</li>
                <li><strong>Navigator data</strong> — Browser version, plugins, and capabilities</li>
              </ul>
            </DocumentSection>

            <DocumentSection title="How We're Different">
              <div className="grid md:grid-cols-2 gap-6 not-prose">
                <div className="bg-paper-100 p-4 rounded-sm">
                  <h4 className="font-mono text-sm font-bold mb-2 uppercase">
                    💰 Market Valuation
                  </h4>
                  <p className="text-sm text-ink-200">
                    We show you your "advertising value" through simulated RTB auctions.
                    See exactly how much advertisers would pay for your data.
                  </p>
                </div>
                <div className="bg-paper-100 p-4 rounded-sm">
                  <h4 className="font-mono text-sm font-bold mb-2 uppercase">
                    🛡️ Defense Testing
                  </h4>
                  <p className="text-sm text-ink-200">
                    Beyond fingerprinting, we test your ad blocker effectiveness,
                    WebRTC leaks, DNS leaks, and more.
                  </p>
                </div>
                <div className="bg-paper-100 p-4 rounded-sm">
                  <h4 className="font-mono text-sm font-bold mb-2 uppercase">
                    📊 Statistical Context
                  </h4>
                  <p className="text-sm text-ink-200">
                    We show how unique you are compared to other browsers,
                    with entropy calculations for each fingerprinting vector.
                  </p>
                </div>
                <div className="bg-paper-100 p-4 rounded-sm">
                  <h4 className="font-mono text-sm font-bold mb-2 uppercase">
                    🔍 Educational Focus
                  </h4>
                  <p className="text-sm text-ink-200">
                    Every test includes detailed explanations and actionable
                    recommendations to improve your privacy.
                  </p>
                </div>
              </div>
            </DocumentSection>

            <DocumentSection title="Privacy Commitment">
              <p>
                We practice what we preach:
              </p>
              <ul>
                <li>
                  <strong>No tracking</strong> — We don't use analytics, advertising trackers,
                  or third-party scripts on our site.
                </li>
                <li>
                  <strong>Client-side by default</strong> — All fingerprint analysis happens
                  in your browser. No data is sent to our servers unless you explicitly choose
                  to share it.
                </li>
                <li>
                  <strong>Data ownership</strong> — If you do share data, you can view, export,
                  or delete it at any time through our GDPR/CCPA compliant privacy controls.
                </li>
                <li>
                  <strong>Open source</strong> — Our methodology is transparent. You can review
                  our code and see exactly how we calculate uniqueness.
                </li>
              </ul>
            </DocumentSection>

            <DocumentSection title="The Technology">
              <p>
                Panopticlick is built with modern, privacy-respecting technology:
              </p>
              <div className="not-prose">
                <div className="bg-ink text-paper p-4 rounded-sm font-mono text-sm">
                  <div className="text-paper-300 mb-2">// Tech Stack</div>
                  <div><span className="text-highlight">Frontend:</span> Next.js 16 (App Router)</div>
                  <div><span className="text-highlight">API:</span> Cloudflare Workers (Hono.js)</div>
                  <div><span className="text-highlight">Database:</span> Cloudflare D1 + KV</div>
                  <div><span className="text-highlight">Fingerprinting:</span> Custom SDK</div>
                  <div><span className="text-highlight">Valuation:</span> Custom Engine</div>
                </div>
              </div>
            </DocumentSection>

            <DocumentSection title="Credits & Inspiration">
              <p>
                This project is inspired by and pays tribute to:
              </p>
              <ul>
                <li>
                  <strong>EFF's Panopticlick</strong> — The original browser fingerprinting
                  research project (2010-2020)
                </li>
                <li>
                  <strong>Cover Your Tracks</strong> — EFF's successor to Panopticlick
                </li>
                <li>
                  <strong>CreepJS</strong> — Advanced fingerprinting detection library
                </li>
                <li>
                  <strong>Am I Unique?</strong> — INRIA's fingerprinting research project
                </li>
              </ul>
              <p>
                We thank the privacy research community for their ongoing work to
                understand and combat online tracking.
              </p>
              <p>
                To be explicit: this site is a successor in spirit only. It is an
                independent project, not affiliated with the EFF, and none of the
                organizations above endorse it.
              </p>
            </DocumentSection>

            <DocumentSection title="Contact">
              <p>
                Have questions, feedback, or want to contribute? We'd love to hear from you.
              </p>
              <div className="not-prose flex gap-4">
                <Link
                  href="https://github.com/Panopticlick/Panopticlick"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-ink text-paper rounded-sm hover:bg-ink-200 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub
                </Link>
                <Link
                  href="mailto:hideme@panopticlick.org"
                  className="inline-flex items-center gap-2 px-4 py-2 border border-ink rounded-sm hover:bg-paper-100 transition-colors"
                >
                  Email Us
                </Link>
              </div>
            </DocumentSection>
          </article>
        </Document>

        <div className="flex justify-center gap-6 mt-8">
          <Stamp variant="verified">Open Source</Stamp>
          <Stamp variant="protected">Privacy First</Stamp>
        </div>
      </div>
    </div>
  );
}
