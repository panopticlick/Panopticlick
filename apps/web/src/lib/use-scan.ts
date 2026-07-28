'use client';

/**
 * Scan state machine shared by every section of the single-page experience.
 *
 * Owns the whole lifecycle: consent, real collection progress, local valuation,
 * optional server sync, localStorage restore, and the two export paths. UI
 * components read it through `ScanProvider` and never talk to the SDK directly.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  FingerprintPayload,
  NetworkIntelligence,
  ValuationReport,
} from '@panopticlick/types';
import { api } from './api-client';
import {
  consentAllowsStorage,
  getConsent,
  subscribeConsent,
  type ConsentState,
} from './consent';
import { buildDossier, type DossierEntry } from './dossier';

export type ScanPhase = 'idle' | 'scanning' | 'analyzing' | 'complete';

/** Where the currently displayed report came from */
export type ApiStatus = 'idle' | 'pending' | 'synced' | 'local-only' | 'failed';

/** A live scan this session vs. a case file reopened from localStorage */
export type ScanSource = 'live' | 'restored';

export interface EvidenceLine {
  id: number;
  label: string;
  percent: number;
}

export interface ScanController {
  phase: ScanPhase;
  progress: number;
  currentStep: string;
  evidence: EvidenceLine[];
  report: ValuationReport | null;
  dossier: DossierEntry[];
  network: NetworkIntelligence | null;
  sessionId: string | null;
  apiStatus: ApiStatus;
  error: string | null;
  /** User opted in to server-side storage for this scan */
  storeData: boolean;
  /** Site-wide banner said "no" — server sync is unavailable */
  consentLocked: boolean;
  source: ScanSource | null;
  /** Timestamp of a restored case file, for the "reopened" notice */
  restoredAt: number | null;
  hasResult: boolean;
  exporting: boolean;
  exportUrl: string | null;
  setStoreData: (value: boolean) => void;
  startScan: () => void;
  reset: () => void;
  downloadReport: () => void;
  exportFromServer: () => void;
}

const STORAGE_KEY = 'panopticlick:lastScan';
const STORAGE_VERSION = 2;

interface StoredScan {
  version: number;
  savedAt: number;
  sessionId: string | null;
  apiStatus: ApiStatus;
  report: ValuationReport;
  dossier: DossierEntry[];
  network: NetworkIntelligence | null;
}

function readStoredScan(): StoredScan | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredScan>;
    if (parsed.version !== STORAGE_VERSION || !parsed.report) return null;
    return {
      version: STORAGE_VERSION,
      savedAt: parsed.savedAt ?? Date.now(),
      sessionId: parsed.sessionId ?? null,
      apiStatus: parsed.apiStatus ?? 'local-only',
      report: parsed.report,
      dossier: parsed.dossier ?? [],
      network: parsed.network ?? null,
    };
  } catch {
    return null;
  }
}

function writeStoredScan(entry: Omit<StoredScan, 'version' | 'savedAt'>): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...entry, version: STORAGE_VERSION, savedAt: Date.now() })
    );
  } catch {
    // Private mode or quota exceeded — the scan still works, it just won't restore
  }
}

function triggerDownload(blobUrl: string, filename: string): void {
  const anchor = document.createElement('a');
  anchor.href = blobUrl;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
}

export function useScan(): ScanController {
  const [phase, setPhase] = useState<ScanPhase>('idle');
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [evidence, setEvidence] = useState<EvidenceLine[]>([]);
  const [report, setReport] = useState<ValuationReport | null>(null);
  const [dossier, setDossier] = useState<DossierEntry[]>([]);
  const [network, setNetwork] = useState<NetworkIntelligence | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<ApiStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [storeData, setStoreData] = useState(false);
  const [consentLocked, setConsentLocked] = useState(false);
  const [source, setSource] = useState<ScanSource | null>(null);
  const [restoredAt, setRestoredAt] = useState<number | null>(null);
  const [exporting, setExporting] = useState(false);
  const [exportUrl, setExportUrl] = useState<string | null>(null);

  const running = useRef(false);
  const evidenceId = useRef(0);

  // Mirror the site-wide consent banner: granted pre-checks the opt-in,
  // denied pins this scan to local-only.
  useEffect(() => {
    const apply = (state: ConsentState) => {
      setConsentLocked(state === 'denied');
      // Both denied and not-yet-decided are local-only. Resetting privacy
      // choices must never leave a previous opt-in latched on.
      setStoreData(consentAllowsStorage(state));
    };
    apply(getConsent());
    return subscribeConsent(apply);
  }, []);

  // Reopen the last case file so returning visitors skip the rescan. Runs after
  // mount on purpose: reading localStorage during render would desync the
  // statically exported HTML.
  useEffect(() => {
    const stored = readStoredScan();
    if (!stored) return;

    setReport(stored.report);
    setDossier(stored.dossier);
    setNetwork(stored.network);
    setSessionId(stored.sessionId);
    setApiStatus(stored.apiStatus);
    setRestoredAt(stored.savedAt);
    setSource('restored');
    setPhase('complete');
    setProgress(100);
  }, []);

  const startScan = useCallback(() => {
    if (running.current) return;
    running.current = true;

    setPhase('scanning');
    setProgress(0);
    setEvidence([]);
    setError(null);
    setApiStatus('idle');
    setSource('live');
    setRestoredAt(null);
    setExportUrl(null);
    evidenceId.current = 0;

    const run = async () => {
      try {
        // Dynamic imports keep the collectors and the valuation engine out of
        // the first-load bundle.
        const sdk = await import('@panopticlick/fingerprint-sdk');
        const { generateValuationReport } = await import('@panopticlick/valuation-engine');

        const fingerprint: FingerprintPayload = await sdk.collectFingerprint({
          debug: process.env.NODE_ENV === 'development',
          consentGiven: storeData,
          onProgress: (step, percent) => {
            setProgress(percent);
            setCurrentStep(step);
            setEvidence((prev) => {
              evidenceId.current += 1;
              return [...prev, { id: evidenceId.current, label: step, percent }];
            });
          },
        });

        setPhase('analyzing');

        // Local valuation first so the page is never blocked on the network.
        const localReport = generateValuationReport(fingerprint);
        const localDossier = buildDossier(fingerprint, null);

        setReport(localReport);
        setDossier(localDossier);
        setSessionId(fingerprint.meta.sessionId);
        writeStoredScan({
          sessionId: fingerprint.meta.sessionId,
          apiStatus: 'local-only',
          report: localReport,
          dossier: localDossier,
          network: null,
        });

        if (!storeData) {
          setApiStatus('local-only');
          setPhase('complete');
          return;
        }

        setApiStatus('pending');
        try {
          const response = await api.scan.submit(fingerprint, { consent: true });
          const syncedDossier = buildDossier(fingerprint, response.network);

          setReport(response.report);
          setDossier(syncedDossier);
          setNetwork(response.network);
          setSessionId(response.sessionId);
          setApiStatus('synced');
          writeStoredScan({
            sessionId: response.sessionId,
            apiStatus: 'synced',
            report: response.report,
            dossier: syncedDossier,
            network: response.network,
          });
        } catch (syncError) {
          console.error('[scan] API sync failed', syncError);
          setApiStatus('failed');
          setError('API unreachable — showing the locally computed report.');
        }

        setPhase('complete');
      } catch (scanError) {
        console.error('[scan] collection failed', scanError);
        setError('Collection failed. Please try again.');
        setCurrentStep('');
        setPhase('idle');
      } finally {
        running.current = false;
      }
    };

    void run();
  }, [storeData]);

  const reset = useCallback(() => {
    setPhase('idle');
    setProgress(0);
    setCurrentStep('');
    setEvidence([]);
    setReport(null);
    setDossier([]);
    setNetwork(null);
    setSessionId(null);
    setApiStatus('idle');
    setError(null);
    setSource(null);
    setRestoredAt(null);
    setExportUrl(null);
  }, []);

  const downloadReport = useCallback(() => {
    if (!report) return;

    const payload = {
      generatedAt: new Date().toISOString(),
      sessionId,
      storage: apiStatus,
      report: {
        meta: report.meta,
        entropy: report.entropy,
        valuation: report.valuation,
        defenses: report.defenses,
      },
      evidence: dossier.map(({ label, value, source: entrySource }) => ({
        label,
        value,
        source: entrySource,
      })),
      network,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    triggerDownload(url, `panopticlick-report-${report.meta.reportId}.json`);
    URL.revokeObjectURL(url);
  }, [report, sessionId, apiStatus, dossier, network]);

  const exportFromServer = useCallback(() => {
    if (!sessionId || apiStatus !== 'synced' || exporting) return;

    setExporting(true);
    setError(null);

    void api.privacy
      .exportData(sessionId)
      .then((res) => {
        setExportUrl(res.exportUrl);
        triggerDownload(res.exportUrl, `panopticlick-export-${sessionId}.json`);
      })
      .catch((exportError) => {
        console.error('[scan] server export failed', exportError);
        setError('Server export failed. Please try again later.');
      })
      .finally(() => setExporting(false));
  }, [sessionId, apiStatus, exporting]);

  return {
    phase,
    progress,
    currentStep,
    evidence,
    report,
    dossier,
    network,
    sessionId,
    apiStatus,
    error,
    storeData,
    consentLocked,
    source,
    restoredAt,
    hasResult: phase === 'complete' && report !== null,
    exporting,
    exportUrl,
    setStoreData,
    startScan,
    reset,
    downloadReport,
    exportFromServer,
  };
}
