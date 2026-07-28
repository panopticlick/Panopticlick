'use client';

import { Button } from '@/components/ui';
import { useScanContext } from './scan-provider';

const COLLECTED_SIGNALS = [
  'Canvas fingerprint',
  'WebGL rendering data',
  'Audio processing signature',
  'Installed fonts',
  'Screen characteristics',
  'Browser capabilities',
  'Timezone and locale',
  'Hardware specifications',
];

/**
 * Authorization gate for the in-page scan. Everything runs client-side unless
 * the visitor explicitly opts in to server-side storage.
 */
export function ConsentGate() {
  const { error, storeData, setStoreData, consentLocked, startScan } = useScanContext();

  return (
    <div className="space-y-6">
      {error && (
        <div
          role="alert"
          className="rounded-sm border border-alert-red/50 bg-alert-red/10 px-4 py-3 text-sm text-alert-red"
        >
          {error}
        </div>
      )}

      <p className="font-serif text-lg leading-relaxed">
        Nothing has been collected yet. Authorize the investigation and your browser
        will hand over the following in about two seconds:
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        {COLLECTED_SIGNALS.map((signal) => (
          <div key={signal} className="flex items-center gap-2">
            <span className="h-2 w-2 shrink-0 rounded-full bg-ink" aria-hidden="true" />
            <span className="font-mono text-sm">{signal}</span>
          </div>
        ))}
      </div>

      <div className="rounded-sm bg-paper-200 p-4">
        <h3 className="mb-2 font-serif font-bold">Privacy commitment</h3>
        <ul className="space-y-1 text-sm text-ink-200">
          <li>• No name, email, browsing history, or raw IP is stored by the scan</li>
          <li>• Data is processed on your device by default</li>
          <li>• You control whether a server copy is stored</li>
          <li>• The completed case can export or delete its authenticated server copy</li>
        </ul>
      </div>

      <label className="flex items-start gap-3 rounded-sm border border-paper-300 bg-paper-100 p-4">
        <input
          type="checkbox"
          className="mt-1"
          checked={storeData}
          disabled={consentLocked}
          onChange={(event) => setStoreData(event.target.checked)}
        />
        <span className="space-y-1">
          <span className="block font-serif font-bold">
            Share anonymized results to improve the population stats (optional)
          </span>
          <span className="block text-sm text-ink-200">
            When enabled we send a hashed IP and fingerprint to our API, which also
            returns the network intelligence half of your dossier. Leave it unchecked
            to keep everything 100% local on this device.
          </span>
          {consentLocked && (
            <span className="block text-xs text-ink-300">
              You declined data sharing in the site banner, so this scan stays
              local-only. Use &ldquo;Privacy choices&rdquo; in the footer to change that.
            </span>
          )}
        </span>
      </label>

      <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
        <Button variant="primary" size="lg" onClick={startScan}>
          Authorize the investigation
        </Button>
        <span className="font-mono text-xs text-ink-300">
          {storeData ? 'Mode: API-backed' : 'Mode: local simulator'}
        </span>
      </div>
    </div>
  );
}
