'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Document,
  DocumentHeader,
  DocumentSection,
  Stamp,
  Button,
  Redacted,
  EntropyMeter,
  ScoreMeter,
  EvidenceTag,
} from '@/components/ui';
import { cn, formatCPM, formatNumber, entropyToOneIn } from '@/lib/utils';
import type { FingerprintPayload, ValuationReport } from '@panopticlick/types';

type ScanPhase = 'consent' | 'scanning' | 'analyzing' | 'complete';

export default function ScanPage() {
  const [phase, setPhase] = useState<ScanPhase>('consent');
  const [fingerprint, setFingerprint] = useState<FingerprintPayload | null>(null);
  const [report, setReport] = useState<ValuationReport | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');

  const runScan = useCallback(async () => {
    setPhase('scanning');
    setProgress(0);

    try {
      // Dynamic import of fingerprint SDK
      const sdk = await import('@panopticlick/fingerprint-sdk');

      const steps = [
        { name: 'Collecting canvas fingerprint...', progress: 10 },
        { name: 'Analyzing WebGL capabilities...', progress: 25 },
        { name: 'Processing audio context...', progress: 40 },
        { name: 'Enumerating fonts...', progress: 55 },
        { name: 'Gathering navigator data...', progress: 70 },
        { name: 'Detecting capabilities...', progress: 85 },
        { name: 'Finalizing collection...', progress: 95 },
      ];

      // Simulate step progression
      for (const step of steps) {
        setCurrentStep(step.name);
        setProgress(step.progress);
        await new Promise((r) => setTimeout(r, 300 + Math.random() * 200));
      }

      // Actually collect fingerprint
      const fp = await sdk.collectFingerprint({
        debug: process.env.NODE_ENV === 'development',
        consentGiven: true,
      });

      setFingerprint(fp);
      setProgress(100);
      setCurrentStep('Collection complete!');

      // Move to analysis
      await new Promise((r) => setTimeout(r, 500));
      setPhase('analyzing');

      // Generate report
      const { generateValuationReport } = await import('@panopticlick/valuation-engine');
      const valuationReport = generateValuationReport(fp);
      setReport(valuationReport);

      // Complete
      await new Promise((r) => setTimeout(r, 800));
      setPhase('complete');
    } catch (error) {
      console.error('Scan error:', error);
      setCurrentStep('Error during scan. Please try again.');
    }
  }, []);

  return (
    <div className="min-h-screen bg-paper grid-bg">
      {/* Header */}
      <div className="confidential-bar">Investigation in Progress</div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <AnimatePresence mode="wait">
          {/* Consent Phase */}
          {phase === 'consent' && (
            <motion.div
              key="consent"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ConsentPhase onAccept={runScan} />
            </motion.div>
          )}

          {/* Scanning Phase */}
          {phase === 'scanning' && (
            <motion.div
              key="scanning"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ScanningPhase progress={progress} currentStep={currentStep} />
            </motion.div>
          )}

          {/* Analyzing Phase */}
          {phase === 'analyzing' && (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <AnalyzingPhase />
            </motion.div>
          )}

          {/* Complete Phase */}
          {phase === 'complete' && report && fingerprint && (
            <motion.div
              key="complete"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <ResultsPhase report={report} fingerprint={fingerprint} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Consent Phase Component
function ConsentPhase({ onAccept }: { onAccept: () => void }) {
  return (
    <Document variant="classified" watermark="CONSENT REQUIRED">
      <DocumentHeader
        title="Authorization Required"
        subtitle="Before we begin the investigation"
        classification="confidential"
      />

      <div className="space-y-6">
        <div className="prose prose-lg max-w-none">
          <p>
            This investigation will collect the following information from your browser:
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {[
            'Canvas fingerprint',
            'WebGL rendering data',
            'Audio processing signature',
            'Installed fonts',
            'Screen characteristics',
            'Browser capabilities',
            'Timezone and locale',
            'Hardware specifications',
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-2 h-2 bg-ink rounded-full" />
              <span className="font-mono text-sm">{item}</span>
            </div>
          ))}
        </div>

        <div className="bg-paper-200 p-4 rounded-sm">
          <h3 className="font-serif font-bold mb-2">Privacy Commitment</h3>
          <ul className="space-y-1 text-sm text-ink-200">
            <li>• No personal information is collected</li>
            <li>• Data is processed client-side by default</li>
            <li>• You control whether data is stored</li>
            <li>• You can delete your data at any time</li>
          </ul>
        </div>

        <div className="flex justify-center gap-4 pt-4">
          <Button variant="outline" onClick={() => window.history.back()}>
            Decline
          </Button>
          <Button variant="primary" size="lg" onClick={onAccept}>
            I Authorize This Investigation
          </Button>
        </div>
      </div>
    </Document>
  );
}

// Scanning Phase Component
function ScanningPhase({
  progress,
  currentStep,
}: {
  progress: number;
  currentStep: string;
}) {
  return (
    <Document variant="dossier">
      <div className="text-center py-8">
        <Stamp variant="classified" animated>
          Scanning
        </Stamp>

        <h2 className="font-serif text-2xl font-bold mt-8 mb-4">
          Collecting Evidence...
        </h2>

        <div className="max-w-md mx-auto">
          {/* Progress bar */}
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

          {/* Current step */}
          <div className="font-mono text-sm text-ink-200 h-6">
            {currentStep}
            <span className="cursor animate-blink" />
          </div>
        </div>

        {/* Scan animation */}
        <div className="mt-8 relative h-32 overflow-hidden rounded-sm bg-paper-200">
          <div className="scan-overlay" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="font-mono text-6xl text-paper-300 opacity-30">
              {'</>'}
            </div>
          </div>
        </div>
      </div>
    </Document>
  );
}

// Analyzing Phase Component
function AnalyzingPhase() {
  return (
    <Document>
      <div className="text-center py-12">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="inline-block"
        >
          <svg
            className="w-16 h-16 text-ink-200"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </motion.div>

        <h2 className="font-serif text-2xl font-bold mt-6 mb-2">
          Analyzing Your Fingerprint
        </h2>
        <p className="text-ink-200">
          Calculating entropy and simulating RTB auction...
        </p>
      </div>
    </Document>
  );
}

// Results Phase Component
function ResultsPhase({
  report,
  fingerprint,
}: {
  report: ValuationReport;
  fingerprint: FingerprintPayload;
}) {
  const [revealedSections, setRevealedSections] = useState<Set<string>>(
    new Set()
  );

  const revealSection = (section: string) => {
    setRevealedSections((prev) => new Set([...prev, section]));
  };

  const downloadReport = useCallback(() => {
    const exportData = {
      generatedAt: new Date().toISOString(),
      report: {
        meta: report.meta,
        entropy: report.entropy,
        valuation: report.valuation,
        defenses: report.defenses,
      },
      fingerprint: {
        hash: fingerprint.meta.hash,
        collectedAt: fingerprint.meta.collectedAt,
        hardware: fingerprint.hardware,
        software: fingerprint.software,
        capabilities: fingerprint.capabilities,
      },
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `panopticlick-report-${report.meta.reportId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [report, fingerprint]);

  return (
    <div className="space-y-6">
      {/* Main Results Document */}
      <Document variant="classified" watermark="DOSSIER">
        <DocumentHeader
          title="Investigation Complete"
          subtitle="Your browser fingerprint analysis"
          classification="secret"
          caseNumber={report.meta.reportId}
          date={new Date(report.meta.generatedAt)}
        />

        {/* Key Findings */}
        <DocumentSection title="Key Findings">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Entropy */}
            <motion.div
              className="p-4 border border-paper-300 rounded-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="text-xs text-ink-300 uppercase tracking-wider mb-1">
                Fingerprint Entropy
              </div>
              <div className="font-mono text-3xl font-bold">
                {report.entropy.totalBits.toFixed(1)}
                <span className="text-lg text-ink-200"> bits</span>
              </div>
              <div className="text-sm text-ink-200 mt-1">
                {entropyToOneIn(report.entropy.totalBits)} browsers
              </div>
            </motion.div>

            {/* Value */}
            <motion.div
              className="p-4 border border-paper-300 rounded-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="text-xs text-ink-300 uppercase tracking-wider mb-1">
                Advertising Value
              </div>
              <div className="font-mono text-3xl font-bold text-alert-orange">
                {formatCPM(report.valuation.averageCPM)}
              </div>
              <div className="text-sm text-ink-200 mt-1">
                ~${report.valuation.annualValue.toFixed(2)}/year
              </div>
            </motion.div>

            {/* Privacy Score */}
            <motion.div
              className="p-4 border border-paper-300 rounded-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="text-xs text-ink-300 uppercase tracking-wider mb-1">
                Privacy Score
              </div>
              <div className="font-mono text-3xl font-bold">
                {report.defenses.score}
                <span className="text-lg text-ink-200">/100</span>
              </div>
              <div className="text-sm text-ink-200 mt-1 capitalize">
                {report.defenses.overallTier} protection
              </div>
            </motion.div>
          </div>
        </DocumentSection>

        {/* Entropy Breakdown */}
        <DocumentSection title="Entropy Analysis">
          <EntropyMeter bits={report.entropy.totalBits} />

          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Canvas', bits: report.entropy.breakdown.canvas.bits },
              { label: 'WebGL', bits: report.entropy.breakdown.webgl.bits },
              { label: 'Audio', bits: report.entropy.breakdown.audio.bits },
              { label: 'Fonts', bits: report.entropy.breakdown.fonts.bits },
              { label: 'Screen', bits: report.entropy.breakdown.screen.bits },
              { label: 'Platform', bits: report.entropy.breakdown.platform.bits },
              { label: 'Timezone', bits: report.entropy.breakdown.timezone.bits },
              { label: 'User Agent', bits: report.entropy.breakdown.userAgent.bits },
            ].map((item, i) => (
              <div key={i} className="text-center p-2 bg-paper-100 rounded-sm">
                <div className="font-mono text-lg font-bold">
                  {item.bits.toFixed(1)}
                </div>
                <div className="text-xs text-ink-300">{item.label}</div>
              </div>
            ))}
          </div>
        </DocumentSection>

        {/* RTB Simulation */}
        <DocumentSection title="RTB Auction Simulation">
          <div className="bg-ink text-paper p-6 rounded-sm font-mono text-sm">
            <div className="text-paper-300 mb-4">
              // Simulated Real-Time Bidding Auction
            </div>

            {report.valuation.bidders.slice(0, 5).map((bid, i) => (
              <motion.div
                key={i}
                className="flex justify-between items-center py-2 border-b border-paper-300/20"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
              >
                <span className="text-highlight">{bid.bidder}</span>
                <span>
                  <span className="text-paper-300">$</span>
                  {bid.amount.toFixed(2)}
                  <span className="text-paper-400 text-xs ml-2">
                    ({bid.interest})
                  </span>
                </span>
              </motion.div>
            ))}

            {report.valuation.bidders[0] && (
              <div className="mt-4 pt-4 border-t border-paper-300">
                <span className="text-alert-green">Winner: </span>
                <span className="font-bold">
                  {report.valuation.bidders[0].bidder}
                </span>
                <span className="text-paper-300"> @ </span>
                <span className="text-highlight">
                  ${report.valuation.bidders[0].amount.toFixed(2)} CPM
                </span>
              </div>
            )}
          </div>
        </DocumentSection>

        {/* Recommendations */}
        <DocumentSection title="Recommendations">
          <div className="space-y-4">
            {report.defenses.recommendations.map((rec, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3 bg-paper-100 rounded-sm"
              >
                <div className="w-6 h-6 rounded-full bg-highlight flex items-center justify-center font-mono text-sm font-bold">
                  {i + 1}
                </div>
                <div className="flex-1">
                  <p className="text-sm">{rec}</p>
                </div>
              </div>
            ))}
          </div>
        </DocumentSection>
      </Document>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4">
        <Button variant="outline" onClick={() => window.location.reload()}>
          Scan Again
        </Button>
        <Button variant="primary" onClick={downloadReport}>
          Download Report
        </Button>
      </div>

      {/* Stamps */}
      <div className="flex justify-center gap-6 mt-4">
        <Stamp variant="verified">Analyzed</Stamp>
        <Stamp variant={report.defenses.score >= 50 ? 'protected' : 'exposed'}>
          {report.defenses.overallTier}
        </Stamp>
      </div>
    </div>
  );
}
