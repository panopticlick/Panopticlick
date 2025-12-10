import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Document,
  DocumentHeader,
  DocumentSection,
  Stamp,
  Redacted,
} from '@/components/ui';

export const metadata: Metadata = {
  title: 'Browser Fingerprinting Explained - Canvas, WebGL & Audio | Panopticlick',
  description:
    'Deep dive into browser fingerprinting techniques: Canvas fingerprinting, WebGL fingerprinting, AudioContext fingerprinting, and font enumeration. Learn how advertisers identify you without cookies.',
  openGraph: {
    title: 'Browser Fingerprinting: The Complete Technical Guide',
    description:
      'Canvas, WebGL, Audio fingerprinting explained. How 99.7% of browsers become uniquely identifiable.',
    type: 'article',
  },
};

export default function FingerprintingPage() {
  return (
    <div className="bg-paper grid-bg">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Document variant="classified" watermark="FINGERPRINTS">
          <DocumentHeader
            title="Browser Fingerprinting"
            subtitle="How your browser becomes a unique identifier"
            classification="top-secret"
            date={new Date()}
          />

          <nav className="mb-8 p-4 bg-paper-100 rounded-sm">
            <span className="text-xs font-mono text-ink-300 uppercase tracking-wider">
              Navigate:{' '}
            </span>
            <Link href="/anatomy/" className="text-sm hover:underline">
              Anatomy Index
            </Link>
            <span className="text-ink-300 mx-2">→</span>
            <span className="text-sm font-bold">Fingerprinting</span>
          </nav>

          <article className="prose prose-lg max-w-none">
            <DocumentSection title="What is Browser Fingerprinting?">
              <p>
                Imagine walking into a store. You don't show ID, you don't sign in—but the
                store recognizes you anyway. How? Your height, gait, clothing style, and
                the way you browse shelves create a unique "pattern." That's browser
                fingerprinting in the digital world.
              </p>
              <p>
                <strong>Browser fingerprinting</strong> collects dozens of attributes from your browser—screen
                resolution, installed fonts, GPU model, timezone—and combines them into a hash.
                This hash is statistically unique: <Redacted>99.7% of browsers</Redacted> can be
                individually identified.
              </p>
              <div className="not-prose bg-alert-red/10 border-l-4 border-alert-red p-4 my-6">
                <p className="font-mono text-sm">
                  <strong>CRITICAL:</strong> Unlike cookies, fingerprints can't be "deleted."
                  They're generated from information your browser must provide to render web pages.
                </p>
              </div>
            </DocumentSection>

            <DocumentSection title="Canvas Fingerprinting">
              <p>
                Canvas fingerprinting exploits the HTML5 <code>&lt;canvas&gt;</code> element.
                When your browser draws text or shapes, tiny differences in your GPU, drivers,
                and font rendering create a unique image—even if you can't see the difference.
              </p>

              <h4 className="font-mono text-sm uppercase tracking-wider mt-6 mb-3">How It Works</h4>
              <ol>
                <li>A hidden canvas element draws specific text and shapes</li>
                <li>The rendered pixels are extracted as data</li>
                <li>Subtle rendering differences create a unique hash</li>
                <li>This hash identifies you across sites</li>
              </ol>

              <div className="not-prose">
                <div className="bg-ink text-paper p-4 rounded-sm font-mono text-sm my-6">
                  <div className="text-highlight mb-2">// Canvas fingerprint extraction</div>
                  <pre>{`const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
ctx.textBaseline = 'alphabetic';
ctx.font = "14px 'Arial'";
ctx.fillText('Browser fingerprint test 🎨', 2, 15);
const dataURL = canvas.toDataURL();
// Hash: a7f3b2c1d4e5f6... (unique per device)`}</pre>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 not-prose my-6">
                <div className="bg-paper-100 p-4 rounded-sm">
                  <h5 className="font-mono text-xs uppercase tracking-wider mb-2 text-alert-red">
                    Entropy Contribution
                  </h5>
                  <div className="text-2xl font-bold">~10 bits</div>
                  <p className="text-sm text-ink-200">
                    Distinguishes 1 in ~1,000 browsers
                  </p>
                </div>
                <div className="bg-paper-100 p-4 rounded-sm">
                  <h5 className="font-mono text-xs uppercase tracking-wider mb-2 text-alert-orange">
                    Stability
                  </h5>
                  <div className="text-2xl font-bold">Very High</div>
                  <p className="text-sm text-ink-200">
                    Persists across sessions & updates
                  </p>
                </div>
              </div>
            </DocumentSection>

            <DocumentSection title="WebGL Fingerprinting">
              <p>
                WebGL fingerprinting goes deeper—it queries your <strong>GPU hardware</strong> directly.
                Your graphics card vendor, renderer string, supported extensions, and shader
                precision all contribute to a highly stable fingerprint.
              </p>

              <h4 className="font-mono text-sm uppercase tracking-wider mt-6 mb-3">Data Points Collected</h4>
              <div className="not-prose grid md:grid-cols-2 gap-4 my-6">
                <div className="bg-ink text-paper p-4 rounded-sm font-mono text-xs">
                  <div className="text-highlight mb-2">// WebGL Renderer</div>
                  <div className="text-paper-300">ANGLE (Apple, ANGLE Metal Renderer:</div>
                  <div>Apple M1 Pro)</div>
                </div>
                <div className="bg-ink text-paper p-4 rounded-sm font-mono text-xs">
                  <div className="text-highlight mb-2">// WebGL Vendor</div>
                  <div>Google Inc. (Apple)</div>
                </div>
              </div>

              <ul>
                <li><strong>Vendor & Renderer:</strong> GPU manufacturer and model</li>
                <li><strong>Max Texture Size:</strong> Hardware capability limits</li>
                <li><strong>Shader Precision:</strong> Floating-point accuracy</li>
                <li><strong>Extensions:</strong> Supported WebGL features</li>
                <li><strong>Parameters:</strong> 50+ queryable values</li>
              </ul>

              <div className="not-prose bg-paper-100 p-4 rounded-sm my-6">
                <p className="text-sm">
                  <strong>Fun fact:</strong> Even with the same GPU model, driver versions create
                  micro-variations. Two identical MacBooks might have different WebGL fingerprints.
                </p>
              </div>
            </DocumentSection>

            <DocumentSection title="Audio Fingerprinting">
              <p>
                The Web Audio API was designed for music apps—but its subtle processing
                differences create another fingerprint vector. Your browser's audio stack
                has a unique "sound."
              </p>

              <h4 className="font-mono text-sm uppercase tracking-wider mt-6 mb-3">The Technique</h4>
              <ol>
                <li>Create an <code>AudioContext</code> with an oscillator</li>
                <li>Apply compression and filtering effects</li>
                <li>Capture the output waveform data</li>
                <li>Hash the floating-point values</li>
              </ol>

              <p>
                Different CPUs, audio drivers, and browser implementations produce
                microscopically different output values. These differences are consistent
                and trackable.
              </p>

              <div className="not-prose">
                <div className="bg-ink text-paper p-4 rounded-sm font-mono text-sm my-6">
                  <div className="text-highlight mb-2">// Audio fingerprint sample values</div>
                  <pre>{`Oscillator: 0.00024127289627166092
Compressor: 0.00023456789012345678
Analyser:   [124, 124, 123, 124, 125, ...]
Hash:       35.73833801150322`}</pre>
                </div>
              </div>
            </DocumentSection>

            <DocumentSection title="Font Enumeration">
              <p>
                Your installed fonts are another unique identifier. While CSS can only
                "test" if a font exists (no direct listing), clever techniques using
                JavaScript can enumerate most of your installed fonts.
              </p>

              <h4 className="font-mono text-sm uppercase tracking-wider mt-6 mb-3">Detection Method</h4>
              <ol>
                <li>Measure text width using a fallback font (e.g., monospace)</li>
                <li>Apply a test font from a list of ~500 common fonts</li>
                <li>If width changes, the font exists on your system</li>
                <li>Build a list of installed fonts</li>
              </ol>

              <div className="not-prose grid grid-cols-3 gap-2 my-6 text-xs">
                {['Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Verdana', 'Comic Sans MS',
                  'Impact', 'Courier New', 'Palatino', 'Garamond', 'Bookman', 'Tahoma'].map((font) => (
                  <div key={font} className="bg-paper-200 px-2 py-1 rounded-sm font-mono truncate">
                    {font}
                  </div>
                ))}
              </div>

              <p>
                <strong>Entropy:</strong> Users with unusual font collections (designers, developers)
                are especially identifiable. Installing a few unique fonts can make your
                browser stand out.
              </p>
            </DocumentSection>

            <DocumentSection title="Combining Fingerprints: The Math">
              <p>
                Each fingerprinting technique contributes "bits of entropy." Combined,
                they create overwhelming uniqueness:
              </p>

              <div className="not-prose overflow-x-auto my-6">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-ink">
                      <th className="text-left py-2 font-mono">Technique</th>
                      <th className="text-left py-2 font-mono">Entropy (bits)</th>
                      <th className="text-left py-2 font-mono">Uniqueness</th>
                    </tr>
                  </thead>
                  <tbody className="font-mono">
                    <tr className="border-b border-paper-300">
                      <td className="py-2">Canvas</td>
                      <td className="py-2">~10 bits</td>
                      <td className="py-2">1 in 1,024</td>
                    </tr>
                    <tr className="border-b border-paper-300">
                      <td className="py-2">WebGL</td>
                      <td className="py-2">~8 bits</td>
                      <td className="py-2">1 in 256</td>
                    </tr>
                    <tr className="border-b border-paper-300">
                      <td className="py-2">Audio</td>
                      <td className="py-2">~6 bits</td>
                      <td className="py-2">1 in 64</td>
                    </tr>
                    <tr className="border-b border-paper-300">
                      <td className="py-2">Fonts</td>
                      <td className="py-2">~7 bits</td>
                      <td className="py-2">1 in 128</td>
                    </tr>
                    <tr className="border-b border-paper-300">
                      <td className="py-2">Screen</td>
                      <td className="py-2">~5 bits</td>
                      <td className="py-2">1 in 32</td>
                    </tr>
                    <tr className="border-b border-paper-300">
                      <td className="py-2">Navigator</td>
                      <td className="py-2">~8 bits</td>
                      <td className="py-2">1 in 256</td>
                    </tr>
                    <tr className="bg-alert-red/10 font-bold">
                      <td className="py-2">Combined</td>
                      <td className="py-2">~44 bits</td>
                      <td className="py-2">1 in 17.6 trillion</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p>
                With only ~5 billion internet users, <Redacted>44 bits of entropy</Redacted> is
                more than enough to uniquely identify virtually everyone.
              </p>
            </DocumentSection>

            <DocumentSection title="Defense Strategies">
              <div className="not-prose grid md:grid-cols-2 gap-4 my-6">
                <div className="bg-alert-green/10 p-4 rounded-sm border-l-4 border-alert-green">
                  <h5 className="font-mono text-sm font-bold mb-2">Tor Browser</h5>
                  <p className="text-sm text-ink-200">
                    Standardizes fingerprint values across all users. Best protection available.
                  </p>
                </div>
                <div className="bg-alert-green/10 p-4 rounded-sm border-l-4 border-alert-green">
                  <h5 className="font-mono text-sm font-bold mb-2">Firefox Resist Fingerprinting</h5>
                  <p className="text-sm text-ink-200">
                    Built-in protection that normalizes many fingerprint vectors.
                  </p>
                </div>
                <div className="bg-alert-orange/10 p-4 rounded-sm border-l-4 border-alert-orange">
                  <h5 className="font-mono text-sm font-bold mb-2">Canvas Blocker Extensions</h5>
                  <p className="text-sm text-ink-200">
                    Add noise to canvas data. Helps but may break some sites.
                  </p>
                </div>
                <div className="bg-alert-red/10 p-4 rounded-sm border-l-4 border-alert-red">
                  <h5 className="font-mono text-sm font-bold mb-2">Disable JavaScript</h5>
                  <p className="text-sm text-ink-200">
                    Nuclear option. Breaks most websites but eliminates JS fingerprinting.
                  </p>
                </div>
              </div>
            </DocumentSection>
          </article>

          <div className="mt-8 pt-8 border-t border-paper-300">
            <div className="flex justify-between items-center">
              <Link
                href="/anatomy/"
                className="inline-flex items-center gap-2 text-sm font-mono hover:underline"
              >
                ← Back to Anatomy Index
              </Link>
              <Link
                href="/anatomy/supercookies/"
                className="inline-flex items-center gap-2 text-sm font-mono hover:underline"
              >
                Next: Supercookies →
              </Link>
            </div>
          </div>
        </Document>

        <div className="flex justify-center gap-6 mt-8">
          <Stamp variant="classified">Technical Brief</Stamp>
          <Stamp variant="verified">Peer Reviewed</Stamp>
        </div>
      </div>
    </div>
  );
}
