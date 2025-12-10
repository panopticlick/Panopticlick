'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Document,
  DocumentHeader,
  DocumentSection,
  Stamp,
  Button,
  ScoreMeter,
} from '@/components/ui';
import type { BlockerAnalysis, BlockerTestResult } from '@panopticlick/fingerprint-sdk';

type TestPhase = 'ready' | 'testing' | 'complete';

export default function BlockerTestPage() {
  const [phase, setPhase] = useState<TestPhase>('ready');
  const [result, setResult] = useState<BlockerAnalysis | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentTest, setCurrentTest] = useState('');
  const [error, setError] = useState<string | null>(null);

  const runTest = useCallback(async () => {
    setPhase('testing');
    setError(null);
    setProgress(0);

    try {
      const sdk = await import('@panopticlick/fingerprint-sdk');

      // Get bait resources for progress tracking
      const resources = sdk.getBaitResources();
      const totalTests = resources.length;

      // Custom test with progress updates
      const results: BlockerTestResult[] = [];

      for (let i = 0; i < totalTests; i++) {
        const resource = resources[i];
        setCurrentTest(`Testing ${resource.name}...`);
        setProgress(Math.round(((i + 1) / totalTests) * 100));

        // Small delay to show progress
        await new Promise((r) => setTimeout(r, 100));
      }

      // Run actual test
      const analysis = await sdk.runBlockerTests('', 2000);
      setResult(analysis);
      setPhase('complete');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      setPhase('complete');
    }
  }, []);

  return (
    <div className="min-h-screen bg-paper grid-bg">
      <div className="confidential-bar">Ad Blocker Analysis</div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <nav className="mb-6 text-sm">
          <Link href="/tests/" className="text-ink-300 hover:text-ink">
            ← Back to Tests
          </Link>
        </nav>

        <AnimatePresence mode="wait">
          {phase === 'ready' && (
            <motion.div
              key="ready"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ReadyPhase onStart={runTest} />
            </motion.div>
          )}

          {phase === 'testing' && (
            <motion.div
              key="testing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <TestingPhase progress={progress} currentTest={currentTest} />
            </motion.div>
          )}

          {phase === 'complete' && (
            <motion.div
              key="complete"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <ResultsPhase
                result={result}
                error={error}
                onRetest={runTest}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ReadyPhase({ onStart }: { onStart: () => void }) {
  return (
    <Document variant="classified" watermark="BLOCKER TEST">
      <DocumentHeader
        title="Ad Blocker Effectiveness Test"
        subtitle="How well does your ad blocker protect you?"
        classification="confidential"
        date={new Date()}
      />

      <div className="space-y-6">
        <div className="prose prose-lg max-w-none">
          <p className="font-serif text-xl leading-relaxed">
            Not all ad blockers are created equal. Some block ads but allow
            <span className="marker"> tracking scripts</span>. Others block trackers
            but miss <span className="marker">fingerprinting</span> attempts.
            This test measures your actual protection level.
          </p>
        </div>

        <DocumentSection title="What We Test">
          <div className="grid md:grid-cols-2 gap-4">
            {[
              {
                category: 'Analytics',
                examples: 'Google Analytics, Facebook Pixel, Hotjar',
                severity: 'medium',
              },
              {
                category: 'Advertising',
                examples: 'DoubleClick, AdSense, Criteo',
                severity: 'medium',
              },
              {
                category: 'Social',
                examples: 'Facebook SDK, Twitter Widget, LinkedIn Insight',
                severity: 'high',
              },
              {
                category: 'Fingerprinting',
                examples: 'FingerprintJS, Canvas fingerprint scripts',
                severity: 'critical',
              },
              {
                category: 'Malware',
                examples: 'Crypto miners, known malicious scripts',
                severity: 'critical',
              },
            ].map((item) => (
              <div key={item.category} className="bg-paper-100 p-4 rounded-sm">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-mono text-sm font-bold">{item.category}</h4>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      item.severity === 'critical'
                        ? 'bg-alert-red/10 text-alert-red'
                        : item.severity === 'high'
                        ? 'bg-alert-orange/10 text-alert-orange'
                        : 'bg-highlight/20 text-ink'
                    }`}
                  >
                    {item.severity}
                  </span>
                </div>
                <p className="text-xs text-ink-300">{item.examples}</p>
              </div>
            ))}
          </div>
        </DocumentSection>

        <DocumentSection title="How It Works">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-ink text-paper flex items-center justify-center font-mono text-sm">
                1
              </div>
              <div>
                <h4 className="font-bold">Bait Resources</h4>
                <p className="text-sm text-ink-200">
                  We attempt to load scripts with names and paths that match real
                  tracking scripts. These are served from our domain.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-ink text-paper flex items-center justify-center font-mono text-sm">
                2
              </div>
              <div>
                <h4 className="font-bold">Detection</h4>
                <p className="text-sm text-ink-200">
                  We measure which resources load successfully and which are blocked.
                  This reveals what your blocker filters.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-ink text-paper flex items-center justify-center font-mono text-sm">
                3
              </div>
              <div>
                <h4 className="font-bold">Analysis</h4>
                <p className="text-sm text-ink-200">
                  We identify your blocker if possible and provide category-by-category
                  protection scores.
                </p>
              </div>
            </div>
          </div>
        </DocumentSection>

        <div className="bg-paper-100 p-4 rounded-sm">
          <div className="flex items-start gap-3">
            <span className="text-2xl">ℹ️</span>
            <div>
              <h4 className="font-bold mb-1">Note</h4>
              <p className="text-sm text-ink-200">
                This test uses "bait" resources that mimic real trackers. No actual
                tracking occurs. The resources are served from our own domain for
                testing purposes only.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-center pt-4">
          <Button variant="primary" size="lg" onClick={onStart}>
            Start Blocker Test
          </Button>
        </div>
      </div>
    </Document>
  );
}

function TestingPhase({
  progress,
  currentTest,
}: {
  progress: number;
  currentTest: string;
}) {
  return (
    <Document variant="dossier">
      <div className="text-center py-12">
        <Stamp variant="classified" animated>
          Testing
        </Stamp>

        <h2 className="font-serif text-2xl font-bold mt-8 mb-4">
          Testing Your Defenses...
        </h2>

        <div className="max-w-md mx-auto">
          <div className="relative h-6 bg-paper-200 rounded-sm overflow-hidden mb-4">
            <motion.div
              className="absolute inset-y-0 left-0 bg-ink"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
            <div className="absolute inset-0 flex items-center justify-center font-mono text-sm">
              {progress}%
            </div>
          </div>

          <div className="font-mono text-sm text-ink-200 h-6">
            {currentTest}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-5 gap-2 max-w-md mx-auto">
          {['analytics', 'advertising', 'social', 'fingerprinting', 'malware'].map(
            (category, i) => (
              <motion.div
                key={category}
                className="p-2 bg-paper-100 rounded-sm text-center"
                initial={{ opacity: 0.3 }}
                animate={{ opacity: progress > (i + 1) * 20 ? 1 : 0.3 }}
              >
                <div className="text-xs font-mono uppercase truncate">
                  {category.slice(0, 4)}
                </div>
              </motion.div>
            )
          )}
        </div>
      </div>
    </Document>
  );
}

function ResultsPhase({
  result,
  error,
  onRetest,
}: {
  result: BlockerAnalysis | null;
  error: string | null;
  onRetest: () => void;
}) {
  if (error || !result) {
    return (
      <Document variant="dossier">
        <div className="text-center py-8">
          <Stamp variant="verified">Error</Stamp>
          <h2 className="font-serif text-2xl font-bold mt-6 mb-4">
            Test Failed
          </h2>
          <p className="text-ink-200 mb-6">
            {error || 'Unable to complete blocker test'}
          </p>
          <Button variant="primary" onClick={onRetest}>
            Try Again
          </Button>
        </div>
      </Document>
    );
  }

  const getEffectivenessLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Moderate';
    if (score >= 25) return 'Basic';
    return 'None';
  };

  const getEffectivenessColor = (score: number) => {
    if (score >= 90) return 'text-alert-green';
    if (score >= 70) return 'text-alert-green';
    if (score >= 50) return 'text-alert-orange';
    return 'text-alert-red';
  };

  return (
    <div className="space-y-6">
      <Document
        variant="classified"
        watermark={result.detected ? 'PROTECTED' : 'UNPROTECTED'}
      >
        <DocumentHeader
          title="Blocker Test Results"
          subtitle={
            result.detected
              ? `${result.name || 'Ad blocker'} detected`
              : 'No ad blocker detected'
          }
          classification={result.effectiveness >= 50 ? 'confidential' : 'secret'}
          date={new Date()}
        />

        {/* Overall Score */}
        <motion.div
          className="text-center py-8"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
        >
          <div className="inline-block">
            <div
              className={`font-mono text-7xl font-bold ${getEffectivenessColor(
                result.effectiveness
              )}`}
            >
              {result.effectiveness}%
            </div>
            <div className="font-serif text-xl mt-2">
              {getEffectivenessLabel(result.effectiveness)} Protection
            </div>
            {result.name && (
              <div className="text-ink-300 mt-1">
                Detected: {result.name}
                {result.version && ` v${result.version}`}
              </div>
            )}
          </div>
        </motion.div>

        {/* Category Breakdown */}
        <DocumentSection title="Protection by Category">
          <div className="grid gap-4">
            {Object.entries(result.categoryScores).map(([category, score], i) => (
              <motion.div
                key={category}
                className="bg-paper-100 p-4 rounded-sm"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="font-mono text-sm uppercase">{category}</span>
                    <span className="text-xs text-ink-300 ml-2">
                      {score.blocked}/{score.total} blocked
                    </span>
                  </div>
                  <span
                    className={`font-mono font-bold ${getEffectivenessColor(
                      score.score
                    )}`}
                  >
                    {score.score}%
                  </span>
                </div>
                <div className="h-2 bg-paper-200 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full ${
                      score.score >= 70
                        ? 'bg-alert-green'
                        : score.score >= 50
                        ? 'bg-alert-orange'
                        : 'bg-alert-red'
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${score.score}%` }}
                    transition={{ delay: 0.5 + i * 0.1, duration: 0.5 }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </DocumentSection>

        {/* Detailed Results */}
        <DocumentSection title="Detailed Test Results">
          <div className="bg-ink text-paper p-4 rounded-sm font-mono text-sm max-h-64 overflow-y-auto">
            <div className="text-paper-300 mb-2">// Test Results</div>
            {result.results.map((test, i) => (
              <div
                key={i}
                className="flex justify-between items-center py-1 border-b border-paper-300/10 last:border-0"
              >
                <span className="text-paper-400">{test.resource.name}</span>
                <span
                  className={
                    test.blocked ? 'text-alert-green' : 'text-alert-red'
                  }
                >
                  {test.blocked ? 'BLOCKED' : 'LOADED'}
                </span>
              </div>
            ))}
          </div>
        </DocumentSection>

        {/* Recommendations */}
        {result.recommendations.length > 0 && (
          <DocumentSection title="Recommendations">
            <div className="space-y-3">
              {result.recommendations.map((rec, i) => (
                <motion.div
                  key={i}
                  className="flex items-start gap-3 p-3 bg-paper-100 rounded-sm"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className="w-6 h-6 rounded-full bg-highlight flex items-center justify-center font-mono text-sm font-bold shrink-0">
                    {i + 1}
                  </div>
                  <p className="text-sm">{rec}</p>
                </motion.div>
              ))}
            </div>
          </DocumentSection>
        )}

        {/* Best Practices */}
        <DocumentSection title="Recommended Blockers">
          <div className="grid md:grid-cols-2 gap-4">
            {[
              {
                name: 'uBlock Origin',
                description: 'Comprehensive open-source blocker',
                effectiveness: 'Excellent',
              },
              {
                name: 'Brave Browser',
                description: 'Built-in tracker and ad blocking',
                effectiveness: 'Very Good',
              },
              {
                name: 'Firefox + ETP',
                description: 'Enhanced Tracking Protection',
                effectiveness: 'Good',
              },
              {
                name: 'Privacy Badger',
                description: 'Learns to block invisible trackers',
                effectiveness: 'Good',
              },
            ].map((blocker) => (
              <div key={blocker.name} className="bg-paper-100 p-4 rounded-sm">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold">{blocker.name}</span>
                  <span className="text-xs text-alert-green">
                    {blocker.effectiveness}
                  </span>
                </div>
                <p className="text-xs text-ink-300">{blocker.description}</p>
              </div>
            ))}
          </div>
        </DocumentSection>
      </Document>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4">
        <Button variant="outline" onClick={onRetest}>
          Test Again
        </Button>
        <Link href="/tests/">
          <Button variant="primary">Run More Tests</Button>
        </Link>
      </div>

      {/* Stamps */}
      <div className="flex justify-center gap-6">
        <Stamp variant={result.effectiveness >= 50 ? 'protected' : 'exposed'}>
          {getEffectivenessLabel(result.effectiveness)}
        </Stamp>
        <Stamp variant="verified">Analyzed</Stamp>
      </div>
    </div>
  );
}
