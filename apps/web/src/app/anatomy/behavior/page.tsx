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
  title: 'Behavioral Tracking - Mouse, Keyboard & Scroll Fingerprinting | Panopticlick',
  description:
    'Discover how your mouse movements, typing patterns, and scroll behavior create a unique behavioral fingerprint. Learn how websites track you through how you interact, not just what you click.',
  openGraph: {
    title: 'Behavioral Tracking: You ARE How You Browse',
    description:
      'Mouse dynamics, keystroke timing, scroll patterns - your behavior is as unique as your fingerprint.',
    type: 'article',
  },
};

export default function BehaviorTrackingPage() {
  return (
    <div className="bg-paper grid-bg">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Document variant="classified" watermark="BEHAVIORAL">
          <DocumentHeader
            title="Behavioral Tracking"
            subtitle="Your actions reveal your identity"
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
            <span className="text-sm font-bold">Behavioral Tracking</span>
          </nav>

          <article className="prose prose-lg max-w-none">
            <DocumentSection title="You ARE How You Browse">
              <p>
                Think about your handwriting. Even with the same pen and paper, no two
                people write identically. The same is true for how you interact with
                a computer.
              </p>
              <p>
                <strong>Behavioral biometrics</strong> analyze patterns in how you:
              </p>
              <ul>
                <li>Move your mouse (speed, curves, hesitations)</li>
                <li>Type on your keyboard (rhythm, pressure, errors)</li>
                <li>Scroll through pages (speed, pauses, direction changes)</li>
                <li>Interact with touchscreens (pressure, angle, gestures)</li>
              </ul>
              <p>
                These patterns are <Redacted>as unique as fingerprints</Redacted>—and they
                work even when you're trying to hide your identity.
              </p>

              <div className="not-prose bg-alert-red/10 border-l-4 border-alert-red p-4 my-6">
                <p className="font-mono text-sm">
                  <strong>INSIGHT:</strong> Behavioral tracking is used by banks for fraud
                  detection, by governments for identification, and by advertisers for
                  cross-device tracking. Same technology, very different implications.
                </p>
              </div>
            </DocumentSection>

            <DocumentSection title="Mouse Dynamics">
              <p>
                Your mouse movements tell a story. The speed at which you move, the
                curves you make, how you approach clickable targets—all unique to you.
              </p>

              <h4 className="font-mono text-sm uppercase tracking-wider mt-6 mb-3">Data Points Collected</h4>
              <div className="not-prose grid md:grid-cols-2 gap-4 my-6">
                <div className="bg-paper-100 p-4 rounded-sm">
                  <h5 className="font-mono text-xs uppercase tracking-wider mb-2">Movement</h5>
                  <ul className="text-sm text-ink-200 space-y-1">
                    <li>• Average/max velocity</li>
                    <li>• Acceleration patterns</li>
                    <li>• Curvature of paths</li>
                    <li>• Direction changes</li>
                  </ul>
                </div>
                <div className="bg-paper-100 p-4 rounded-sm">
                  <h5 className="font-mono text-xs uppercase tracking-wider mb-2">Clicks</h5>
                  <ul className="text-sm text-ink-200 space-y-1">
                    <li>• Double-click speed</li>
                    <li>• Click duration (hold time)</li>
                    <li>• Distance from target center</li>
                    <li>• Hover time before click</li>
                  </ul>
                </div>
              </div>

              <div className="not-prose">
                <div className="bg-ink text-paper p-4 rounded-sm font-mono text-sm my-6">
                  <div className="text-highlight mb-2">// Sample mouse event stream</div>
                  <pre>{`{
  "events": [
    {"t": 0, "x": 100, "y": 200, "type": "move"},
    {"t": 16, "x": 145, "y": 198, "type": "move"},
    {"t": 32, "x": 210, "y": 195, "type": "move"},
    {"t": 48, "x": 285, "y": 192, "type": "move"},
    {"t": 64, "x": 350, "y": 190, "type": "click"}
  ],
  "metrics": {
    "avgVelocity": 15.6,
    "pathCurvature": 0.02,
    "targetApproachAngle": 2.3,
    "clickAccuracy": 0.95
  }
}`}</pre>
                </div>
              </div>

              <p>
                <strong>Research shows:</strong> Mouse dynamics can identify users with
                <Redacted>95-99% accuracy</Redacted> after just a few minutes of interaction.
                This works even when users try to disguise their behavior.
              </p>
            </DocumentSection>

            <DocumentSection title="Keystroke Dynamics">
              <p>
                The rhythm of your typing is uniquely yours. How long you hold each key,
                the timing between keystrokes, which keys you often mistype—all create
                a typing "fingerprint."
              </p>

              <h4 className="font-mono text-sm uppercase tracking-wider mt-6 mb-3">Timing Metrics</h4>
              <div className="not-prose">
                <div className="bg-ink text-paper p-4 rounded-sm font-mono text-sm my-6">
                  <div className="text-highlight mb-2">// Keystroke timing analysis</div>
                  <pre>{`Typing: "password"

Key    | Press Time | Release Time | Hold  | Flight
-------|------------|--------------|-------|--------
'p'    | 0ms        | 80ms         | 80ms  | -
'a'    | 120ms      | 190ms        | 70ms  | 40ms
's'    | 240ms      | 320ms        | 80ms  | 50ms
's'    | 380ms      | 450ms        | 70ms  | 60ms
'w'    | 510ms      | 600ms        | 90ms  | 60ms
'o'    | 680ms      | 750ms        | 70ms  | 80ms
'r'    | 820ms      | 900ms        | 80ms  | 70ms
'd'    | 960ms      | 1040ms       | 80ms  | 60ms

Signature: [80,40,70,50,80,60,70,60,90,80,70,70,80,60]`}</pre>
                </div>
              </div>

              <div className="not-prose grid md:grid-cols-3 gap-4 my-6">
                <div className="bg-paper-100 p-4 rounded-sm text-center">
                  <div className="text-2xl font-bold text-alert-red mb-1">Hold Time</div>
                  <p className="text-sm text-ink-200">How long key is pressed</p>
                </div>
                <div className="bg-paper-100 p-4 rounded-sm text-center">
                  <div className="text-2xl font-bold text-alert-orange mb-1">Flight Time</div>
                  <p className="text-sm text-ink-200">Gap between keystrokes</p>
                </div>
                <div className="bg-paper-100 p-4 rounded-sm text-center">
                  <div className="text-2xl font-bold text-highlight mb-1">Digraph</div>
                  <p className="text-sm text-ink-200">Time for key pairs</p>
                </div>
              </div>

              <p>
                <strong>Applications:</strong>
              </p>
              <ul>
                <li><strong>Continuous authentication:</strong> Banks verify it's really you typing, not a bot</li>
                <li><strong>Fraud detection:</strong> Account takeover attempts often fail keystroke checks</li>
                <li><strong>Online exams:</strong> Proctoring software detects if someone else is typing</li>
                <li><strong>Advertising:</strong> Cross-device identity linking</li>
              </ul>
            </DocumentSection>

            <DocumentSection title="Scroll & Touch Patterns">
              <p>
                How you scroll through a page—fast or slow, smooth or jerky, the length
                of your swipes—creates another behavioral signature.
              </p>

              <h4 className="font-mono text-sm uppercase tracking-wider mt-6 mb-3">Scroll Metrics</h4>
              <ul>
                <li><strong>Scroll velocity:</strong> How fast you move through content</li>
                <li><strong>Reading patterns:</strong> Where you pause, what you skip</li>
                <li><strong>Direction reversals:</strong> How often you scroll back up</li>
                <li><strong>Scroll depth:</strong> How far down you typically go</li>
              </ul>

              <h4 className="font-mono text-sm uppercase tracking-wider mt-6 mb-3">Touch-Specific (Mobile)</h4>
              <div className="not-prose grid md:grid-cols-2 gap-4 my-6">
                <div className="bg-paper-100 p-4 rounded-sm">
                  <h5 className="font-mono text-xs uppercase tracking-wider mb-2">Physical</h5>
                  <ul className="text-sm text-ink-200 space-y-1">
                    <li>• Touch pressure</li>
                    <li>• Contact area size</li>
                    <li>• Finger angle</li>
                    <li>• Multi-touch patterns</li>
                  </ul>
                </div>
                <div className="bg-paper-100 p-4 rounded-sm">
                  <h5 className="font-mono text-xs uppercase tracking-wider mb-2">Gestural</h5>
                  <ul className="text-sm text-ink-200 space-y-1">
                    <li>• Swipe velocity curves</li>
                    <li>• Pinch-zoom behavior</li>
                    <li>• Tap duration</li>
                    <li>• Gesture completion time</li>
                  </ul>
                </div>
              </div>

              <p>
                <strong>Cross-device tracking:</strong> Your behavioral patterns are
                consistent across devices. Touch patterns on your phone match your
                trackpad patterns on your laptop, enabling advertisers to link your
                devices <Redacted>without cookies or login</Redacted>.
              </p>
            </DocumentSection>

            <DocumentSection title="Real-World Implementations">
              <div className="not-prose space-y-4 my-6">
                <div className="border-l-4 border-ink pl-4">
                  <h5 className="font-mono text-sm font-bold mb-1">BioCatch</h5>
                  <p className="text-sm text-ink-200">
                    Used by major banks. Collects 2000+ behavioral parameters. Claims
                    99% accuracy in fraud detection. Tracks how you hold your phone.
                  </p>
                </div>
                <div className="border-l-4 border-ink pl-4">
                  <h5 className="font-mono text-sm font-bold mb-1">TypingDNA</h5>
                  <p className="text-sm text-ink-200">
                    Keystroke dynamics authentication. Used for online exams and 2FA.
                    Can verify identity from typing just 30 characters.
                  </p>
                </div>
                <div className="border-l-4 border-ink pl-4">
                  <h5 className="font-mono text-sm font-bold mb-1">Fullstory / Hotjar</h5>
                  <p className="text-sm text-ink-200">
                    "Session replay" tools that record all user interactions. Marketed
                    for UX research, but capture complete behavioral profiles.
                  </p>
                </div>
                <div className="border-l-4 border-ink pl-4">
                  <h5 className="font-mono text-sm font-bold mb-1">Google reCAPTCHA v3</h5>
                  <p className="text-sm text-ink-200">
                    That "I'm not a robot" checkbox? It analyzes mouse movements and
                    timing to determine if you're human. Creates a behavioral profile
                    in the process.
                  </p>
                </div>
              </div>

              <div className="not-prose bg-paper-200 p-4 rounded-sm my-6">
                <h4 className="font-mono text-sm font-bold mb-2">The Privacy Paradox</h4>
                <p className="text-sm text-ink-200">
                  Behavioral biometrics are simultaneously a powerful security tool
                  (stopping fraud, preventing account takeover) and a privacy nightmare
                  (enabling surveillance, persistent tracking). The same technology
                  that protects your bank account can track you across the web.
                </p>
              </div>
            </DocumentSection>

            <DocumentSection title="Defense Strategies">
              <p>
                Unlike canvas fingerprinting, behavioral tracking is extremely hard to
                defeat—your behavior is your behavior. But there are strategies:
              </p>

              <div className="not-prose space-y-4 my-6">
                <div className="bg-alert-green/10 p-4 rounded-sm border-l-4 border-alert-green">
                  <h5 className="font-mono text-sm font-bold mb-2">Privacy-Focused Browsers</h5>
                  <p className="text-sm text-ink-200">
                    Brave and Firefox block known behavioral tracking scripts by default.
                    Won't stop first-party collection but reduces third-party surveillance.
                  </p>
                </div>
                <div className="bg-alert-green/10 p-4 rounded-sm border-l-4 border-alert-green">
                  <h5 className="font-mono text-sm font-bold mb-2">Script Blockers</h5>
                  <p className="text-sm text-ink-200">
                    uBlock Origin, NoScript can block session replay scripts (Fullstory,
                    Hotjar). Check for known tracking domains.
                  </p>
                </div>
                <div className="bg-alert-orange/10 p-4 rounded-sm border-l-4 border-alert-orange">
                  <h5 className="font-mono text-sm font-bold mb-2">Varying Your Behavior (Hard)</h5>
                  <p className="text-sm text-ink-200">
                    Theoretically possible to vary your typing/mouse patterns, but very
                    difficult to do consistently. Research shows intentional variation
                    often creates a new, still-unique pattern.
                  </p>
                </div>
                <div className="bg-alert-orange/10 p-4 rounded-sm border-l-4 border-alert-orange">
                  <h5 className="font-mono text-sm font-bold mb-2">Input Randomizers</h5>
                  <p className="text-sm text-ink-200">
                    Browser extensions that add random noise to mouse events and keystroke
                    timing. Experimental and may break websites.
                  </p>
                </div>
              </div>

              <div className="not-prose bg-ink text-paper p-4 rounded-sm my-6">
                <p className="font-mono text-sm">
                  <strong className="text-highlight">REALITY CHECK:</strong> There is no
                  complete defense against behavioral tracking. Your best strategy is
                  minimizing JavaScript execution (Tor Browser), using privacy-focused
                  tools, and being aware that sophisticated actors can still identify you.
                </p>
              </div>
            </DocumentSection>

            <DocumentSection title="The Bigger Picture">
              <p>
                Behavioral biometrics represent a fundamental shift in tracking. We've
                moved from tracking <em>what</em> you do (pages visited, items clicked)
                to tracking <em>who you are</em> at a biometric level.
              </p>
              <p>
                This has profound implications:
              </p>
              <ul>
                <li>
                  <strong>Anonymity erosion:</strong> Even on Tor, your behavior can
                  deanonymize you over time
                </li>
                <li>
                  <strong>Pseudonym linking:</strong> Different accounts, same typing pattern
                </li>
                <li>
                  <strong>Cross-context tracking:</strong> Work computer behavior matches
                  personal device behavior
                </li>
              </ul>
              <p>
                The surveillance economy has evolved beyond cookies. Understanding
                behavioral tracking is essential to making informed privacy decisions.
              </p>
            </DocumentSection>
          </article>

          <div className="mt-8 pt-8 border-t border-paper-300">
            <div className="flex justify-between items-center">
              <Link
                href="/anatomy/supercookies/"
                className="inline-flex items-center gap-2 text-sm font-mono hover:underline"
              >
                ← Previous: Supercookies
              </Link>
              <Link
                href="/anatomy/"
                className="inline-flex items-center gap-2 text-sm font-mono hover:underline"
              >
                Back to Anatomy Index →
              </Link>
            </div>
          </div>
        </Document>

        <div className="flex justify-center gap-6 mt-8">
          <Stamp variant="classified">Technical Brief</Stamp>
          <Stamp variant="protected">Biometric Data</Stamp>
        </div>
      </div>
    </div>
  );
}
