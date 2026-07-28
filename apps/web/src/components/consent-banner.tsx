'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  getConsent,
  setConsent,
  resetConsent,
  subscribeConsent,
  type ConsentState,
} from '@/lib/consent';

/**
 * Bottom consent bar in the newsprint style.
 * Fixed overlay (zero layout shift); rendered only while consent is 'unset'.
 */
export function ConsentBanner() {
  // null until mounted so the static export and first client render match
  const [state, setState] = useState<ConsentState | null>(null);

  useEffect(() => {
    setState(getConsent());
    return subscribeConsent(setState);
  }, []);

  if (state !== 'unset') return null;

  return (
    <div
      role="region"
      aria-label="Privacy consent"
      className="fixed inset-x-0 bottom-0 z-50 border-t-2 border-ink bg-paper shadow-document"
    >
      <div className="container mx-auto flex max-w-4xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-snug">
          <span className="font-mono text-xs uppercase tracking-wider text-ink-300">
            Notice —{' '}
          </span>
          We only store anonymized scan results if you allow it. Everything else
          stays on your device.{' '}
          <Link href="/privacy/" className="marker-link text-sm">
            Privacy policy
          </Link>
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            onClick={() => setConsent('denied')}
            className="border border-ink px-4 py-1.5 font-mono text-xs uppercase tracking-wider transition-colors hover:bg-paper-200"
          >
            Decline
          </button>
          <button
            onClick={() => setConsent('granted')}
            className="border border-ink bg-ink px-4 py-1.5 font-mono text-xs uppercase tracking-wider text-paper transition-colors hover:bg-ink-50"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Footer entry that reopens the consent banner.
 */
export function PrivacyChoicesButton() {
  return (
    <button
      onClick={resetConsent}
      className="underline underline-offset-2 transition-colors hover:text-paper"
    >
      Privacy choices
    </button>
  );
}
