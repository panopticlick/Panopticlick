'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Document,
  DocumentHeader,
  DocumentSection,
  Stamp,
  Button,
  EntropyMeter,
} from '@/components/ui';
import { formatCPM, entropyToOneIn } from '@/lib/utils';
import { api } from '@/lib/api-client';
import type { FingerprintPayload, ValuationReport } from '@panopticlick/types';

// Note: metadata is in layout.tsx or metadata.ts for client components

type ScanPhase = 'consent' | 'scanning' | 'analyzing' | 'complete';
type ApiStatus = 'idle' | 'pending' | 'synced' | 'local-only' | 'failed';

export default function ScanPage() {
  const [phase, setPhase] = useState<ScanPhase>('consent');
  const [fingerprint, setFingerprint] = useState<FingerprintPayload | null>(null);
  const [report, setReport] = useState<ValuationReport | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [exportUrl, setExportUrl] = useState<string | null>(null);
  const [storeData, setStoreData] = useState(false);
  const [apiStatus, setApiStatus] = useState<ApiStatus>('idle');

  const runScan = useCallback(async () => {
    setPhase('scanning');
    setProgress(0);
    setError(null);
    setApiStatus('idle');

    try {
      // Dynamic imports to keep bundle light
      const sdk = await import('@panopticlick/fingerprint-sdk');
      const { generateValuationReport } = await import('@panopticlick/valuation-engine');

      const steps = [
        { name: 'Collecting canvas fingerprint...', progress: 10 },
        { name: 'Analyzing WebGL capabilities...', progress: 25 },
        { name: 'Processing audio context...', progress: 40 },
        { name: 'Enumerating fonts...', progress: 55 },
        { name: 'Gathering navigator data...', progress: 70 },
        { name: 'Detecting capabilities...', progress: 85 },
        { name: 'Finalizing collection...', progress: 95 },
      ];

      for (const step of steps) {
        setCurrentStep(step.name);
        setProgress(step.progress);
        await new Promise((r) => setTimeout(r, 300 + Math.random() * 200));
      }

      // Collect fingerprint
      const fp = await sdk.collectFingerprint({
        debug: process.env.NODE_ENV === 'development',
        consentGiven: storeData,
      });

      setFingerprint(fp);
      setProgress(100);
      setCurrentStep('Collection complete!');
      setPhase('analyzing');

      // Generate a local valuation immediately so the UI is never blocked on the API
      const localReport = generateValuationReport(fp);
      setReport(localReport);
      setSessionId(fp.meta.sessionId);

      try {
        localStorage.setItem(
          'panopticlick:lastScan',
          JSON.stringify({ sessionId: fp.meta.sessionId, report: localReport })
        );
      } catch {
        // ignore storage failures
      }

      // Optional server sync for comparison stats + persistence
      if (storeData) {
        setApiStatus('pending');
        try {
          const response = await api.scan.submit(fp, {
            consent: true,
          });

          setReport(response.report);
          setSessionId(response.sessionId);
          setApiStatus('synced');

          try {
            localStorage.setItem(
              'panopticlick:lastScan',
              JSON.stringify({ sessionId: response.sessionId, report: response.report })
            );
          } catch {
            // ignore storage failures
          }
        } catch (err) {
          console.error('API sync failed:', err);
          setApiStatus('failed');
          setError('API unreachable, showing local-only report.');
        }
      } else {
        setApiStatus('local-only');
      }

      setPhase('complete');
    } catch (error) {
      console.error('Scan error:', error);
      setError('Scan failed. Please try again.');
      setCurrentStep('Error during scan. Please try again.');
      setPhase('consent');
    }
  }, [storeData]);

  const handleExport = useCallback(async () => {
    if (!sessionId || apiStatus !== 'synced') return;
    setExporting(true);
    setError(null);
    try {
      const res = await api.privacy.exportData(sessionId);
      setExportUrl(res.exportUrl);
      const a = document.createElement('a');
      a.href = res.exportUrl;
      a.download = `panopticlick-export-${sessionId}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error('Export error:', err);
      setError('Export failed, please try again later');
    } finally {
      setExporting(false);
    }
  }, [sessionId, apiStatus]);

  return (
    <div className="min-h-screen bg-paper grid-bg">
      {/* Header */}
      <div className="confidential-bar">Investigation in Progress</div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Semantic H1 for SEO */}
        <h1 className="sr-only">Browser Fingerprint Scanner</h1>

        <AnimatePresence mode="wait">
          {/* Consent Phase */}
          {phase === 'consent' && (
            <motion.div
              key="consent"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ConsentPhase
                onAccept={runScan}
                error={error}
                storeData={storeData}
                onToggleStore={setStoreData}
              />
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
              <ResultsPhase
                report={report}
                fingerprint={fingerprint}
                sessionId={sessionId}
                onExport={handleExport}
                exporting={exporting}
                exportUrl={exportUrl}
                apiStatus={apiStatus}
                optedIn={storeData}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function StorageBadge({ apiStatus, optedIn }: { apiStatus: ApiStatus; optedIn: boolean }) {
  let text = 'Local-only';
  let tone = 'bg-paper-200 text-ink-300 border border-paper-300';

  switch (apiStatus) {
    case 'synced':
      text = 'Stored on server for comparison';
      tone = 'bg-alert-green/10 text-alert-green border border-alert-green/30';
      break;
    case 'pending':
      text = 'Syncing to API...';
      tone = 'bg-highlight/20 text-ink border border-highlight/40';
      break;
    case 'failed':
      text = 'Local-only (API unreachable)';
      tone = 'bg-alert-orange/10 text-alert-orange border border-alert-orange/30';
      break;
    case 'local-only':
      text = optedIn ? 'Local-only' : 'Local-only (not uploaded)';
      break;
    default:
      break;
  }

  return (
    <span className={`px-2 py-1 rounded-sm font-mono text-xs ${tone}`}>
      {text}
    </span>
  );
}

// Consent Phase Component
function ConsentPhase({
  onAccept,
  error,
  storeData,
  onToggleStore,
}: {
  onAccept: () => void;
  error: string | null;
  storeData: boolean;
  onToggleStore: (value: boolean) => void;
}) {
  return (
    <Document variant="classified" watermark="CONSENT REQUIRED">
      <DocumentHeader
        title="Authorization Required"
        subtitle="Before we begin the investigation"
        classification="confidential"
      />

      <div className="space-y-6">
        {error && (
          <div className="rounded-sm border border-alert-red/50 bg-alert-red/10 px-4 py-3 text-sm text-alert-red">
            {error}
          </div>
        )}

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

        <label className="flex items-start gap-3 p-4 border border-paper-300 rounded-sm bg-paper-100">
          <input
            type="checkbox"
            className="mt-1"
            checked={storeData}
            onChange={(e) => onToggleStore(e.target.checked)}
          />
          <div className="space-y-1">
            <div className="font-serif font-bold">
              Share anonymized results to improve stats (optional)
            </div>
            <p className="text-sm text-ink-200">
              When enabled we send hashed IP + fingerprint to our API for population comparisons.
              Leave unchecked to keep everything 100% local on this device.
            </p>
          </div>
        </label>

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
  sessionId,
  onExport,
  exporting,
  exportUrl,
  apiStatus,
  optedIn,
}: {
  report: ValuationReport;
  fingerprint: FingerprintPayload;
  sessionId: string | null;
  onExport: () => void;
  exporting: boolean;
  exportUrl: string | null;
  apiStatus: ApiStatus;
  optedIn: boolean;
}) {
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
        sessionId: fingerprint.meta.sessionId,
        collectedAt: new Date(fingerprint.meta.timestamp).toISOString(),
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

        {(apiStatus === 'failed' || apiStatus === 'local-only') && (
          <div className={`mb-4 rounded-sm p-3 text-sm border ${
            apiStatus === 'failed'
              ? 'bg-alert-orange/10 border-alert-orange/30 text-alert-orange'
              : 'bg-paper-200 border-paper-300 text-ink-300'
          }`}>
            {apiStatus === 'failed'
              ? 'The API could not be reached. This report was generated locally; server export and comparison are disabled.'
              : 'You chose local-only mode. Nothing was uploaded; export is limited to the local report.'}
          </div>
        )}

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between border border-paper-300 rounded-sm p-4 bg-paper-100">
        <div className="text-sm text-ink-200">
          <div className="font-mono text-xs uppercase tracking-wider text-ink-300">Session ID</div>
          <div className="font-mono break-all">{sessionId || fingerprint.meta.sessionId}</div>
        </div>
        <div className="flex flex-col gap-2 md:items-end">
          <div className="flex flex-wrap gap-2">
            <Button variant="primary" onClick={downloadReport}>
              Download Client Report
            </Button>
            <Button
              variant="outline"
              disabled={apiStatus !== 'synced' || !sessionId || exporting}
              onClick={onExport}
            >
              {exporting ? 'Exporting...' : 'Export from Server'}
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 items-center text-xs text-ink-300">
            <span className="uppercase tracking-wider">Storage</span>
            <StorageBadge apiStatus={apiStatus} optedIn={optedIn} />
          </div>
          {apiStatus !== 'synced' && (
            <p className="text-[11px] text-ink-300">
              Server export becomes available once syncing succeeds.
            </p>
          )}
        </div>
      </div>

        {exportUrl && (
          <div className="text-xs text-ink-300 mt-2">
            Export generated. You can use this link again:
            <span className="underline break-all"> {exportUrl}</span>
          </div>
        )}

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

      {/* Educational Content Section */}
      <div className="mt-16 prose prose-lg max-w-none">
        <h2 className="font-serif text-3xl font-bold mb-6">
          What Is a Browser Fingerprint?
        </h2>

        <p className="text-xl leading-relaxed mb-6">
          Think of your browser fingerprint as your digital DNA. Just like your real fingerprint
          is unique to you, your browser fingerprint is a unique combination of all the tiny
          details about how your browser is configured.
        </p>

        <p className="mb-6">
          Here's the weird part: none of these details seem sensitive on their own. Your screen
          resolution? Who cares. Your timezone? Boring. Your installed fonts? Totally random.
          But combine 50+ of these "boring" details, and suddenly you're one in a million.
          Literally.
        </p>

        <div className="bg-paper-100 p-6 rounded-sm my-8 not-prose">
          <h3 className="font-mono text-lg font-bold mb-4">How Fingerprinting Beats Cookies</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="p-4 bg-paper rounded-sm border border-paper-300">
              <div className="font-bold mb-2">🍪 Cookies</div>
              <ul className="space-y-1 text-ink-200">
                <li>• Can be deleted by users</li>
                <li>• Blocked by private browsing</li>
                <li>• Visible in browser settings</li>
                <li>• Regulated by GDPR/CCPA</li>
              </ul>
            </div>
            <div className="p-4 bg-ink text-paper rounded-sm">
              <div className="font-bold mb-2 text-highlight">🖐️ Fingerprints</div>
              <ul className="space-y-1 text-paper-300">
                <li>• Cannot be deleted</li>
                <li>• Works in private mode</li>
                <li>• Invisible to users</li>
                <li>• Unregulated gray area</li>
              </ul>
            </div>
          </div>
        </div>

        <h2 className="font-serif text-3xl font-bold mb-6 mt-12">
          Understanding Your Scan Results
        </h2>

        <p className="mb-6">
          Let me break down what we just collected and what it means for your privacy:
        </p>

        <h3 className="font-serif text-xl font-bold mb-4">Entropy: Your Uniqueness Score</h3>
        <p className="mb-6">
          Entropy is measured in "bits of identifying information." Each bit doubles the number
          of people you can be distinguished from. With 10 bits, you're one of 1,024. With 20 bits,
          one of a million. The average browser today has 33+ bits of entropy — that's enough to
          uniquely identify you among every human on Earth.
        </p>

        <h3 className="font-serif text-xl font-bold mb-4">CPM: What You're Worth</h3>
        <p className="mb-6">
          CPM stands for "Cost Per Mille" — the price advertisers pay per 1,000 ad impressions.
          Your CPM depends on your demographics, interests, and behavior. A "high-value" user
          (think: wealthy, employed, ready to buy) might be worth $10-20 CPM. A random visitor
          might be worth $0.50. We simulate what advertisers would bid for you.
        </p>

        <h3 className="font-serif text-xl font-bold mb-4">Privacy Score: Your Protection Level</h3>
        <p className="mb-6">
          We check what defenses you have in place. Are you blocking trackers? Using a VPN?
          Running a privacy-focused browser? Each protection adds to your score. A score under
          40 means you're basically naked online. Over 70 means you're taking privacy seriously.
        </p>

        <h2 className="font-serif text-3xl font-bold mb-6 mt-12">
          What Websites Actually See
        </h2>

        <p className="mb-6">
          Every single data point we collected? Websites can see all of it. Without asking.
          Without warning. Without your consent. Here's a sample of what gets transmitted
          automatically when you load any webpage:
        </p>

        <div className="bg-ink text-paper p-6 rounded-sm font-mono text-sm my-8 not-prose">
          <div className="text-paper-300 mb-2">// Data transmitted on every page load</div>
          <div className="space-y-1">
            <div><span className="text-highlight">userAgent:</span> "Mozilla/5.0 (Macintosh; Intel...)"</div>
            <div><span className="text-highlight">screenResolution:</span> [2560, 1440]</div>
            <div><span className="text-highlight">colorDepth:</span> 24</div>
            <div><span className="text-highlight">timezone:</span> "America/New_York"</div>
            <div><span className="text-highlight">language:</span> "en-US"</div>
            <div><span className="text-highlight">platform:</span> "MacIntel"</div>
            <div><span className="text-highlight">cpuCores:</span> 8</div>
            <div><span className="text-highlight">deviceMemory:</span> 8</div>
            <div><span className="text-highlight">touchSupport:</span> false</div>
            <div><span className="text-highlight">webglVendor:</span> "Apple Inc."</div>
            <div><span className="text-highlight">webglRenderer:</span> "Apple M1 Pro"</div>
            <div className="text-paper-400">// ... and 40+ more attributes</div>
          </div>
        </div>

        <h2 className="font-serif text-3xl font-bold mb-6 mt-12">
          Next Steps: Protecting Yourself
        </h2>

        <p className="mb-6">
          The good news: you're not powerless. Now that you know what's being collected,
          you can take action. Here's what actually works:
        </p>

        <ul className="mb-8 space-y-2">
          <li><strong>Switch browsers:</strong> Firefox and Brave have built-in fingerprint protection. Safari on Mac does too.</li>
          <li><strong>Install extensions:</strong> uBlock Origin, Privacy Badger, and Canvas Blocker reduce your fingerprint surface.</li>
          <li><strong>Use Tor:</strong> The Tor Browser is specifically designed to make all users look identical.</li>
          <li><strong>Be strategic:</strong> Use different browsers for different activities. Compartmentalize your digital life.</li>
        </ul>

        <p className="mb-8">
          Check our <a href="/defense/" className="text-highlight hover:underline">Defense Armory</a> for
          detailed guides on reducing your digital footprint. Every step you take makes the
          surveillance economy a little less profitable.
        </p>
      </div>
    </div>
  );
}
