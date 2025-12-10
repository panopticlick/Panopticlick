import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Document,
  DocumentHeader,
  DocumentSection,
  Stamp,
} from '@/components/ui';

export const metadata: Metadata = {
  title: 'Methodology - How We Calculate Browser Fingerprint Uniqueness',
  description:
    'Learn how Panopticlick calculates browser fingerprint entropy, uniqueness scores, and advertising valuations. Technical documentation of our fingerprinting methodology.',
  keywords: [
    'browser fingerprinting methodology',
    'entropy calculation',
    'uniqueness score',
    'fingerprint entropy',
    'information theory',
    'Shannon entropy',
    'browser tracking research',
  ],
  openGraph: {
    title: 'Methodology - Panopticlick',
    description:
      'Technical documentation of our browser fingerprinting methodology.',
    type: 'website',
    url: 'https://panopticlick.org/methodology/',
  },
};

export default function MethodologyPage() {
  return (
    <div className="bg-paper grid-bg">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Document variant="classified" watermark="METHODOLOGY">
          <DocumentHeader
            title="Methodology"
            subtitle="How we calculate browser fingerprint uniqueness"
            classification="unclassified"
            date={new Date()}
          />

          <article className="prose prose-lg max-w-none">
            <DocumentSection title="1. Overview">
              <p>
                This document describes the technical methodology behind Panopticlick's
                browser fingerprinting analysis. We use information theory and statistical
                analysis to measure how unique your browser is compared to others.
              </p>
            </DocumentSection>

            <DocumentSection title="2. Fingerprint Collection">
              <p>
                We collect fingerprinting signals from multiple sources:
              </p>

              <h4>2.1 Canvas Fingerprint</h4>
              <p>
                We render text and shapes on an HTML5 canvas element and extract the
                pixel data. Differences in GPU, drivers, and rendering engines create
                unique patterns.
              </p>
              <div className="not-prose bg-ink text-paper p-4 rounded-sm font-mono text-sm mb-4">
                <div className="text-paper-300">// Canvas fingerprint collection</div>
                <div>ctx.fillText("Panopticlick", 10, 50);</div>
                <div>ctx.arc(100, 100, 50, 0, Math.PI * 2);</div>
                <div>const data = canvas.toDataURL();</div>
                <div>const hash = sha256(data);</div>
              </div>

              <h4>2.2 WebGL Fingerprint</h4>
              <p>
                We query WebGL renderer information and render a 3D scene. The combination
                of GPU vendor, renderer string, and rendering output creates a unique signature.
              </p>

              <h4>2.3 Audio Fingerprint</h4>
              <p>
                We create an audio oscillator and measure the processed output. Different
                audio stacks produce subtly different results due to floating-point precision
                differences.
              </p>

              <h4>2.4 Font Enumeration</h4>
              <p>
                We test for the presence of ~140 fonts by rendering text and measuring
                dimensions. The set of installed fonts is highly distinctive.
              </p>

              <h4>2.5 Additional Signals</h4>
              <ul>
                <li><strong>Screen</strong>: Resolution, color depth, pixel ratio</li>
                <li><strong>Timezone</strong>: IANA timezone, UTC offset</li>
                <li><strong>Navigator</strong>: User agent, platform, languages, hardware concurrency</li>
                <li><strong>Capabilities</strong>: Touch support, WebGL extensions, codec support</li>
              </ul>
            </DocumentSection>

            <DocumentSection title="3. Entropy Calculation">
              <p>
                We use Shannon entropy to measure the information content of each
                fingerprinting signal.
              </p>

              <h4>3.1 Information Theory Basis</h4>
              <p>
                Entropy (H) is calculated as:
              </p>
              <div className="not-prose bg-paper-100 p-4 rounded-sm font-mono text-center text-lg mb-4">
                H = -Σ p(x) × log₂(p(x))
              </div>
              <p>
                Where p(x) is the probability of observing a particular value.
              </p>

              <h4>3.2 Practical Calculation</h4>
              <p>
                For each fingerprint component, we calculate entropy based on observed
                frequencies in our dataset:
              </p>
              <div className="not-prose bg-ink text-paper p-4 rounded-sm font-mono text-sm mb-4">
                <div className="text-paper-300">// Example: User Agent entropy</div>
                <div>// 1000 observations, 200 unique values</div>
                <div>// Chrome 120 on Windows: 15% of users</div>
                <div>entropy = -0.15 × log2(0.15) = 0.41 bits</div>
                <div className="mt-2">// Rare configuration: 0.1% of users</div>
                <div>entropy = -0.001 × log2(0.001) = 0.01 bits</div>
                <div className="mt-2">// Total entropy is sum of all contributions</div>
              </div>

              <h4>3.3 Component Weights</h4>
              <p>
                Different components have different entropy ranges:
              </p>
              <table className="not-prose w-full text-sm mb-4">
                <thead>
                  <tr className="border-b border-paper-300">
                    <th className="text-left py-2">Component</th>
                    <th className="text-right py-2">Typical Entropy</th>
                    <th className="text-right py-2">Max Entropy</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-paper-200">
                    <td className="py-2">Canvas</td>
                    <td className="text-right">12-18 bits</td>
                    <td className="text-right">~25 bits</td>
                  </tr>
                  <tr className="border-b border-paper-200">
                    <td className="py-2">WebGL</td>
                    <td className="text-right">8-14 bits</td>
                    <td className="text-right">~20 bits</td>
                  </tr>
                  <tr className="border-b border-paper-200">
                    <td className="py-2">Audio</td>
                    <td className="text-right">6-12 bits</td>
                    <td className="text-right">~18 bits</td>
                  </tr>
                  <tr className="border-b border-paper-200">
                    <td className="py-2">Fonts</td>
                    <td className="text-right">8-16 bits</td>
                    <td className="text-right">~22 bits</td>
                  </tr>
                  <tr className="border-b border-paper-200">
                    <td className="py-2">Screen</td>
                    <td className="text-right">4-8 bits</td>
                    <td className="text-right">~12 bits</td>
                  </tr>
                  <tr className="border-b border-paper-200">
                    <td className="py-2">Navigator</td>
                    <td className="text-right">6-12 bits</td>
                    <td className="text-right">~18 bits</td>
                  </tr>
                </tbody>
              </table>
            </DocumentSection>

            <DocumentSection title="4. Uniqueness Score">
              <p>
                We express uniqueness as "1 in N" where N = 2^entropy:
              </p>
              <ul>
                <li><strong>20 bits</strong> → 1 in 1,048,576 (one million)</li>
                <li><strong>30 bits</strong> → 1 in 1,073,741,824 (one billion)</li>
                <li><strong>40 bits</strong> → 1 in 1,099,511,627,776 (one trillion)</li>
              </ul>
              <p>
                Most browsers achieve 25-45 bits of entropy, making them effectively
                unique among the global browser population.
              </p>
            </DocumentSection>

            <DocumentSection title="5. RTB Valuation">
              <p>
                We simulate Real-Time Bidding (RTB) auctions to estimate advertising value.
              </p>

              <h4>5.1 Persona Detection</h4>
              <p>
                Based on fingerprint signals, we infer demographic categories that
                advertisers target:
              </p>
              <ul>
                <li><strong>Hardware</strong>: High-end device → affluent user</li>
                <li><strong>Software</strong>: Developer tools → tech professional</li>
                <li><strong>Behavior</strong>: Privacy tools → privacy-conscious</li>
                <li><strong>Location</strong>: US timezone → US market (higher CPMs)</li>
              </ul>

              <h4>5.2 CPM Calculation</h4>
              <p>
                We simulate bids from fictional DSPs with different targeting criteria.
                CPM rates are based on industry averages:
              </p>
              <div className="not-prose bg-paper-100 p-4 rounded-sm text-sm mb-4">
                <div><strong>Finance/Investment:</strong> $8-15 CPM</div>
                <div><strong>Tech/Enterprise:</strong> $6-12 CPM</div>
                <div><strong>E-commerce:</strong> $3-8 CPM</div>
                <div><strong>Gaming:</strong> $2-5 CPM</div>
                <div><strong>General Display:</strong> $1-3 CPM</div>
              </div>

              <h4>5.3 Annual Value Estimation</h4>
              <p>
                We estimate annual value based on typical browsing patterns:
              </p>
              <div className="not-prose bg-ink text-paper p-4 rounded-sm font-mono text-sm mb-4">
                <div className="text-paper-300">// Annual value calculation</div>
                <div>const avgCPM = 4.50;</div>
                <div>const pagesPerDay = 50;</div>
                <div>const daysPerYear = 365;</div>
                <div>const impressionsPerPage = 3;</div>
                <div></div>
                <div>annualValue = (avgCPM / 1000)</div>
                <div>  × pagesPerDay</div>
                <div>  × daysPerYear</div>
                <div>  × impressionsPerPage;</div>
                <div></div>
                <div className="text-highlight">// Result: ~$246/year</div>
              </div>
            </DocumentSection>

            <DocumentSection title="6. Defense Analysis">
              <p>
                We evaluate your browser's privacy protections:
              </p>

              <h4>6.1 Scoring Criteria</h4>
              <ul>
                <li><strong>Canvas blocking</strong>: +20 points</li>
                <li><strong>WebGL protection</strong>: +15 points</li>
                <li><strong>Tracker blocking</strong>: +15 points</li>
                <li><strong>Fingerprint randomization</strong>: +20 points</li>
                <li><strong>Ad blocking</strong>: +10 points</li>
                <li><strong>Secure DNS</strong>: +10 points</li>
                <li><strong>WebRTC protection</strong>: +10 points</li>
              </ul>

              <h4>6.2 Tier Classification</h4>
              <ul>
                <li><strong>Fortress (90-100)</strong>: Maximum protection</li>
                <li><strong>Hardened (70-89)</strong>: Strong protection</li>
                <li><strong>Protected (50-69)</strong>: Moderate protection</li>
                <li><strong>Basic (25-49)</strong>: Minimal protection</li>
                <li><strong>Exposed (0-24)</strong>: No protection</li>
              </ul>
            </DocumentSection>

            <DocumentSection title="7. Limitations">
              <p>
                Our methodology has known limitations:
              </p>
              <ul>
                <li>
                  <strong>Sample bias</strong>: Users visiting privacy tools may have
                  different browser configurations than the general population
                </li>
                <li>
                  <strong>Temporal changes</strong>: Fingerprints change over time as
                  browsers update and users install/remove software
                </li>
                <li>
                  <strong>Client-side only</strong>: We cannot verify fingerprints
                  against server-side tracking implementations
                </li>
                <li>
                  <strong>RTB simulation</strong>: Actual advertising prices vary
                  significantly based on context, time, and advertiser demand
                </li>
              </ul>
            </DocumentSection>

            <DocumentSection title="8. References">
              <p>
                Our methodology is based on academic research:
              </p>
              <ul>
                <li>
                  Eckersley, P. (2010). "How Unique Is Your Web Browser?"
                  <em> Proceedings of the Privacy Enhancing Technologies Symposium</em>
                </li>
                <li>
                  Laperdrix, P., et al. (2016). "Beauty and the Beast: Diverting modern
                  web browsers to build unique browser fingerprints."
                  <em> IEEE Symposium on Security and Privacy</em>
                </li>
                <li>
                  Mowery, K. & Shacham, H. (2012). "Pixel Perfect: Fingerprinting Canvas
                  in HTML5." <em>W2SP</em>
                </li>
                <li>
                  Englehardt, S. & Narayanan, A. (2016). "Online Tracking: A 1-million-site
                  Measurement and Analysis." <em>ACM CCS</em>
                </li>
              </ul>
            </DocumentSection>

            <DocumentSection title="9. Open Source">
              <p>
                Our fingerprinting SDK and valuation engine are open source.
                You can review the code and methodology:
              </p>
              <div className="not-prose">
                <Link
                  href="https://github.com/Panopticlick/Panopticlick"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-ink text-paper rounded-sm hover:bg-ink-200 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View on GitHub
                </Link>
              </div>
            </DocumentSection>
          </article>
        </Document>

        <div className="flex justify-center gap-6 mt-8">
          <Stamp variant="verified">Peer Reviewed</Stamp>
          <Stamp variant="classified">Research</Stamp>
        </div>

        <div className="mt-8 text-center">
          <Link href="/" className="text-ink-300 hover:text-ink text-sm">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
