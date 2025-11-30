'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Document,
  DocumentHeader,
  DocumentSection,
  Stamp,
  Button,
} from '@/components/ui';
import type {
  HSTSCheckResult,
  HSTSVisualization,
} from '@panopticlick/fingerprint-sdk';

type Phase = 'intro' | 'demo' | 'comparison';

export default function HSTSTestPage() {
  const [phase, setPhase] = useState<Phase>('intro');
  const [hstsCheck, setHstsCheck] = useState<HSTSCheckResult | null>(null);
  const [visualization, setVisualization] = useState<HSTSVisualization | null>(null);
  const [demoValue, setDemoValue] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Load HSTS check on mount
    import('@panopticlick/fingerprint-sdk').then((sdk) => {
      sdk.checkHSTSSupport().then(setHstsCheck);
      setVisualization(sdk.generateVisualization());
    });
  }, []);

  const runDemo = useCallback(async () => {
    setIsAnimating(true);
    const sdk = await import('@panopticlick/fingerprint-sdk');

    // Generate a random value and demonstrate HSTS supercookie
    const demoData = sdk.generateHSTSDemoData(16);
    setDemoValue(demoData.binary);

    // Simulate write process
    await new Promise((r) => setTimeout(r, 500));

    // Simulate read back
    const readBack = sdk.simulateHSTSRead(demoData.binary, 16);

    // Update visualization
    setVisualization(sdk.generateVisualization(demoData.binary));

    setIsAnimating(false);
    setPhase('demo');
  }, []);

  return (
    <div className="min-h-screen bg-paper grid-bg">
      <div className="confidential-bar">HSTS Supercookie Investigation</div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <nav className="mb-6 text-sm">
          <Link href="/tests/" className="text-ink-300 hover:text-ink">
            ← Back to Tests
          </Link>
        </nav>

        <AnimatePresence mode="wait">
          {phase === 'intro' && (
            <motion.div
              key="intro"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <IntroPhase
                hstsCheck={hstsCheck}
                onStartDemo={runDemo}
                isAnimating={isAnimating}
              />
            </motion.div>
          )}

          {phase === 'demo' && (
            <motion.div
              key="demo"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <DemoPhase
                demoValue={demoValue}
                visualization={visualization}
                onViewComparison={() => setPhase('comparison')}
                onReset={() => {
                  setDemoValue(null);
                  setPhase('intro');
                }}
              />
            </motion.div>
          )}

          {phase === 'comparison' && (
            <motion.div
              key="comparison"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ComparisonPhase onBack={() => setPhase('demo')} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function IntroPhase({
  hstsCheck,
  onStartDemo,
  isAnimating,
}: {
  hstsCheck: HSTSCheckResult | null;
  onStartDemo: () => void;
  isAnimating: boolean;
}) {
  return (
    <Document variant="classified" watermark="HSTS SUPERCOOKIE">
      <DocumentHeader
        title="HSTS Supercookie Demonstration"
        subtitle="How security features can be weaponized for tracking"
        classification="secret"
        date={new Date()}
      />

      <div className="space-y-6">
        <div className="prose prose-lg max-w-none">
          <p className="font-serif text-xl leading-relaxed">
            <span className="marker">HSTS</span> (HTTP Strict Transport Security) is a
            security feature that protects you from downgrade attacks. However, it can
            be abused to create <span className="font-bold">"supercookies"</span> that
            persist even after you clear your browser data.
          </p>
        </div>

        {/* HSTS Support Status */}
        {hstsCheck && (
          <div
            className={`p-4 rounded-sm ${
              hstsCheck.supported
                ? 'bg-alert-orange/10 border border-alert-orange/30'
                : 'bg-alert-green/10 border border-alert-green/30'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">
                {hstsCheck.supported ? '⚠️' : '✅'}
              </span>
              <div>
                <h4 className="font-bold">
                  {hstsCheck.supported
                    ? 'Your browser supports HSTS'
                    : 'HSTS not detected'}
                </h4>
                <p className="text-sm text-ink-200">
                  {hstsCheck.supported
                    ? 'This means HSTS supercookies could potentially be used to track you'
                    : 'HSTS supercookies cannot be used in your browser'}
                </p>
              </div>
            </div>
          </div>
        )}

        <DocumentSection title="How HSTS Supercookies Work">
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-ink text-paper flex items-center justify-center font-mono shrink-0">
                1
              </div>
              <div>
                <h4 className="font-bold">Binary Encoding</h4>
                <p className="text-sm text-ink-200">
                  A unique identifier is converted to binary (e.g., "42" → "101010").
                  Each bit represents one subdomain.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-ink text-paper flex items-center justify-center font-mono shrink-0">
                2
              </div>
              <div>
                <h4 className="font-bold">HSTS Flag Setting</h4>
                <p className="text-sm text-ink-200">
                  For each "1" bit, the tracker loads a subdomain over HTTPS with HSTS.
                  For "0" bits, it uses HTTP without HSTS.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-ink text-paper flex items-center justify-center font-mono shrink-0">
                3
              </div>
              <div>
                <h4 className="font-bold">Reading the Cookie</h4>
                <p className="text-sm text-ink-200">
                  On future visits, the tracker requests each subdomain via HTTP.
                  If HSTS redirects to HTTPS, that bit is "1". Otherwise, it's "0".
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-ink text-paper flex items-center justify-center font-mono shrink-0">
                4
              </div>
              <div>
                <h4 className="font-bold">Persistence</h4>
                <p className="text-sm text-ink-200">
                  HSTS policies are stored separately from cookies and browsing history.
                  They survive clearing cookies, private browsing, and browser restarts.
                </p>
              </div>
            </div>
          </div>
        </DocumentSection>

        <DocumentSection title="Why This Is Concerning">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-paper-100 p-4 rounded-sm">
              <h4 className="font-mono text-sm font-bold mb-2">
                🕵️ Invisible Tracking
              </h4>
              <p className="text-sm text-ink-200">
                Unlike cookies, HSTS supercookies leave no visible trace.
                Users have no way to know they're being tracked.
              </p>
            </div>
            <div className="bg-paper-100 p-4 rounded-sm">
              <h4 className="font-mono text-sm font-bold mb-2">
                🧹 Resistant to Clearing
              </h4>
              <p className="text-sm text-ink-200">
                "Clear browsing data" doesn't remove HSTS entries.
                The tracking ID persists indefinitely.
              </p>
            </div>
            <div className="bg-paper-100 p-4 rounded-sm">
              <h4 className="font-mono text-sm font-bold mb-2">
                🎭 Bypasses Private Mode
              </h4>
              <p className="text-sm text-ink-200">
                Some browsers share HSTS state with incognito mode,
                defeating privacy protections.
              </p>
            </div>
            <div className="bg-paper-100 p-4 rounded-sm">
              <h4 className="font-mono text-sm font-bold mb-2">
                🔗 Cross-Site Tracking
              </h4>
              <p className="text-sm text-ink-200">
                The same HSTS supercookie can be read across different
                websites, enabling comprehensive tracking.
              </p>
            </div>
          </div>
        </DocumentSection>

        <div className="bg-ink text-paper p-6 rounded-sm">
          <h4 className="font-mono text-sm text-paper-300 mb-4">
            // Example: 32-bit HSTS Supercookie
          </h4>
          <div className="font-mono text-sm space-y-2">
            <div>
              <span className="text-paper-400">User ID:</span>{' '}
              <span className="text-highlight">2,847,591,038</span>
            </div>
            <div>
              <span className="text-paper-400">Binary:</span>{' '}
              <span className="text-alert-green">10101001110100111000101011111110</span>
            </div>
            <div>
              <span className="text-paper-400">Subdomains:</span>{' '}
              <span className="text-paper-300">32 unique subdomains</span>
            </div>
            <div>
              <span className="text-paper-400">Persistence:</span>{' '}
              <span className="text-alert-orange">Up to 2 years (HSTS max-age)</span>
            </div>
          </div>
        </div>

        <div className="flex justify-center pt-4">
          <Button
            variant="primary"
            size="lg"
            onClick={onStartDemo}
            disabled={isAnimating}
          >
            {isAnimating ? 'Generating...' : 'See Interactive Demo'}
          </Button>
        </div>
      </div>
    </Document>
  );
}

function DemoPhase({
  demoValue,
  visualization,
  onViewComparison,
  onReset,
}: {
  demoValue: string | null;
  visualization: HSTSVisualization | null;
  onViewComparison: () => void;
  onReset: () => void;
}) {
  return (
    <div className="space-y-6">
      <Document variant="classified" watermark="DEMONSTRATION">
        <DocumentHeader
          title="HSTS Supercookie Demo"
          subtitle="This is how your browser could be fingerprinted"
          classification="secret"
          date={new Date()}
        />

        <DocumentSection title="Your Simulated Tracking ID">
          {demoValue && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="bg-ink text-paper p-6 rounded-sm font-mono">
                <div className="text-paper-300 mb-4">
                  // Simulated HSTS Supercookie Value
                </div>
                <div className="text-center py-4">
                  <div className="text-3xl tracking-widest text-highlight mb-2">
                    {demoValue.split('').map((bit, i) => (
                      <motion.span
                        key={i}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className={bit === '1' ? 'text-alert-green' : 'text-alert-red'}
                      >
                        {bit}
                      </motion.span>
                    ))}
                  </div>
                  <div className="text-paper-400 text-sm">
                    16-bit identifier = {parseInt(demoValue, 2)} unique users
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </DocumentSection>

        {visualization && (
          <DocumentSection title="Visual Representation">
            <div className="grid grid-cols-8 gap-2">
              {visualization.bits.map((bit, i) => (
                <motion.div
                  key={i}
                  className={`aspect-square rounded-sm flex items-center justify-center font-mono text-sm ${
                    bit.value
                      ? 'bg-alert-green text-paper'
                      : 'bg-paper-200 text-ink-300'
                  }`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <div className="text-center">
                    <div className="text-xs opacity-50">b{bit.position}</div>
                    <div className="font-bold">{bit.value ? '1' : '0'}</div>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="mt-4 flex justify-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-alert-green rounded-sm" />
                <span>HSTS Set (HTTPS)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-paper-200 rounded-sm" />
                <span>No HSTS (HTTP)</span>
              </div>
            </div>
          </DocumentSection>
        )}

        <DocumentSection title="Subdomain Mapping">
          <div className="bg-paper-100 p-4 rounded-sm max-h-48 overflow-y-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 font-mono text-xs">
              {visualization?.bits.map((bit, i) => (
                <div
                  key={i}
                  className={`p-2 rounded ${
                    bit.value ? 'bg-alert-green/20' : 'bg-paper-200'
                  }`}
                >
                  <span className="text-ink-300">bit{i}.</span>
                  <span>track.example</span>
                </div>
              ))}
            </div>
          </div>
        </DocumentSection>

        <DocumentSection title="What This Means">
          <div className="space-y-4">
            <p className="text-ink-200">
              If this were a real HSTS supercookie implementation:
            </p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-alert-red">•</span>
                <span>
                  You would be uniquely identified across{' '}
                  <strong>{Math.pow(2, demoValue?.length || 16).toLocaleString()}</strong>{' '}
                  possible combinations
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-alert-red">•</span>
                <span>
                  This ID would persist even after clearing cookies and browsing history
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-alert-red">•</span>
                <span>
                  The tracking could continue in incognito/private mode (in some browsers)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-alert-green">•</span>
                <span>
                  <strong>This demo is simulated</strong> – no actual HSTS supercookie was created
                </span>
              </li>
            </ul>
          </div>
        </DocumentSection>
      </Document>

      <div className="flex justify-center gap-4">
        <Button variant="outline" onClick={onReset}>
          Reset Demo
        </Button>
        <Button variant="primary" onClick={onViewComparison}>
          Compare Tracking Methods
        </Button>
      </div>

      <div className="flex justify-center gap-6">
        <Stamp variant="classified">Simulated</Stamp>
        <Stamp variant="verified">Educational</Stamp>
      </div>
    </div>
  );
}

function ComparisonPhase({ onBack }: { onBack: () => void }) {
  const [comparison, setComparison] = useState<
    Array<{
      method: string;
      persistence: string;
      survivesCookieClear: boolean;
      survivesPrivateMode: boolean;
      userVisible: boolean;
      difficulty: string;
    }>
  >([]);

  useEffect(() => {
    import('@panopticlick/fingerprint-sdk').then((sdk) => {
      setComparison(sdk.getTrackingComparison());
    });
  }, []);

  return (
    <div className="space-y-6">
      <Document variant="classified" watermark="COMPARISON">
        <DocumentHeader
          title="Tracking Method Comparison"
          subtitle="How HSTS supercookies compare to other tracking techniques"
          classification="secret"
          date={new Date()}
        />

        <DocumentSection title="Persistence and Detection">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-paper-300">
                  <th className="text-left py-2 font-mono">Method</th>
                  <th className="text-center py-2 font-mono">Persistence</th>
                  <th className="text-center py-2 font-mono">Survives Clear</th>
                  <th className="text-center py-2 font-mono">Private Mode</th>
                  <th className="text-center py-2 font-mono">User Visible</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((method, i) => (
                  <motion.tr
                    key={method.method}
                    className="border-b border-paper-200"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <td className="py-3 font-bold">{method.method}</td>
                    <td className="py-3 text-center text-xs text-ink-300">
                      {method.persistence}
                    </td>
                    <td className="py-3 text-center">
                      {method.survivesCookieClear ? (
                        <span className="text-alert-red">✗ Yes</span>
                      ) : (
                        <span className="text-alert-green">✓ No</span>
                      )}
                    </td>
                    <td className="py-3 text-center">
                      {method.survivesPrivateMode ? (
                        <span className="text-alert-red">✗ Yes</span>
                      ) : (
                        <span className="text-alert-green">✓ No</span>
                      )}
                    </td>
                    <td className="py-3 text-center">
                      {method.userVisible ? (
                        <span className="text-alert-green">✓ Yes</span>
                      ) : (
                        <span className="text-alert-red">✗ No</span>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </DocumentSection>

        <DocumentSection title="Protection Recommendations">
          <div className="space-y-4">
            <div className="bg-paper-100 p-4 rounded-sm">
              <h4 className="font-bold mb-2">Firefox Users</h4>
              <p className="text-sm text-ink-200">
                Firefox isolates HSTS by first-party domain, limiting cross-site tracking.
                Enable Enhanced Tracking Protection for additional security.
              </p>
            </div>
            <div className="bg-paper-100 p-4 rounded-sm">
              <h4 className="font-bold mb-2">Chrome Users</h4>
              <p className="text-sm text-ink-200">
                Chrome shares HSTS state globally. Consider using separate profiles
                or containers to limit tracking potential.
              </p>
            </div>
            <div className="bg-paper-100 p-4 rounded-sm">
              <h4 className="font-bold mb-2">Brave Users</h4>
              <p className="text-sm text-ink-200">
                Brave Browser has built-in protections against HSTS abuse and
                randomizes fingerprinting surfaces.
              </p>
            </div>
            <div className="bg-paper-100 p-4 rounded-sm">
              <h4 className="font-bold mb-2">Safari Users</h4>
              <p className="text-sm text-ink-200">
                Safari's Intelligent Tracking Prevention limits HSTS persistence
                for known trackers.
              </p>
            </div>
          </div>
        </DocumentSection>

        <DocumentSection title="Additional Resources">
          <div className="space-y-2 text-sm">
            <p>
              <strong>Research Paper:</strong> "Tracking users across the web via TLS Session Resumption"
            </p>
            <p>
              <strong>EFF Article:</strong> "Zombie Cookie Wars"
            </p>
            <p>
              <strong>Browser Bug Reports:</strong> Chromium #436451, Firefox #1692938
            </p>
          </div>
        </DocumentSection>
      </Document>

      <div className="flex justify-center gap-4">
        <Button variant="outline" onClick={onBack}>
          Back to Demo
        </Button>
        <Link href="/tests/">
          <Button variant="primary">Run More Tests</Button>
        </Link>
      </div>

      <div className="flex justify-center gap-6">
        <Stamp variant="verified">Educational</Stamp>
        <Stamp variant="classified">Research</Stamp>
      </div>
    </div>
  );
}
