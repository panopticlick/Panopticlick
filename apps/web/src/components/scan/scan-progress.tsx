'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Stamp } from '@/components/ui';
import { useScanContext } from './scan-provider';

/**
 * Live scanning surface. The bar and the evidence log are driven by the SDK's
 * `onProgress` callback, so every line corresponds to a collector that actually
 * finished — there is no timer animation standing in for work.
 */
export function ScanProgress() {
  const { phase, progress, currentStep, evidence } = useScanContext();
  const reducedMotion = useReducedMotion();
  const analyzing = phase === 'analyzing';

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="font-serif text-xl font-bold">
            {analyzing ? 'Analyzing the evidence' : 'Collecting evidence'}
          </h3>
          <p className="font-mono text-sm text-ink-200">
            {analyzing ? 'Computing entropy, valuation and defenses…' : currentStep}
            <span className="cursor" aria-hidden="true" />
          </p>
        </div>
        <Stamp variant="classified" animated={!reducedMotion}>
          {analyzing ? 'Analyzing' : 'Scanning'}
        </Stamp>
      </div>

      <div
        className="relative h-6 overflow-hidden rounded-sm bg-paper-200"
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Fingerprint collection progress"
      >
        <motion.div
          className="absolute inset-y-0 left-0 bg-ink"
          initial={false}
          animate={{ width: `${progress}%` }}
          transition={reducedMotion ? { duration: 0 } : { duration: 0.25, ease: 'easeOut' }}
        />
        <span className="absolute inset-0 flex items-center justify-center font-mono text-xs mix-blend-difference text-paper">
          {progress}%
        </span>
      </div>

      <div className="relative overflow-hidden rounded-sm bg-ink p-4 font-mono text-xs text-paper-100">
        {!reducedMotion && <div className="scan-overlay" aria-hidden="true" />}
        <div className="relative space-y-1" aria-live="polite">
          {evidence.length === 0 && <div className="text-paper-400">// waiting for the first collector…</div>}
          {evidence.map((line) => (
            <motion.div
              key={line.id}
              initial={reducedMotion ? false : { opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              className="flex justify-between gap-4"
            >
              <span>
                <span className="text-highlight">✓</span> {line.label}
              </span>
              <span className="text-paper-400">{line.percent}%</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
