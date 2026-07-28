'use client';

import { type MouseEvent, useEffect, useId, useState } from 'react';
import Link from 'next/link';
import {
  getConsent,
  setConsent,
  resetConsent,
  subscribeConsent,
  type ConsentState,
} from '@/lib/consent';
import { cn } from '@/lib/utils';

const CONSENT_BANNER_ID = 'site-consent-banner';

/**
 * Bottom consent bar in the newsprint style.
 * Fixed overlay (zero layout shift); rendered only while consent is 'unset'.
 */
export function ConsentBanner() {
  // null until mounted so the static export and first client render match
  const [state, setState] = useState<ConsentState | null>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    setState(getConsent());
    return subscribeConsent(setState);
  }, []);

  if (state !== 'unset') return null;

  return (
    <aside
      id={CONSENT_BANNER_ID}
      tabIndex={-1}
      role="region"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      className="fixed inset-x-0 bottom-0 z-50 border-t-2 border-ink bg-paper shadow-document"
    >
      <div className="container mx-auto max-w-4xl px-4 py-3">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-ink-300">
              Privacy choices
            </p>
            <h2 id={titleId} className="mt-1 font-serif text-lg font-bold text-ink">
              No data is stored without consent.
            </h2>
            <p id={descriptionId} className="mt-1 text-sm leading-relaxed text-ink-200">
              The default is <span className="font-mono text-xs uppercase">local-only</span>.
              Choose <strong>Store my results</strong> to let Panopticlick keep only
              anonymized scan evidence and aggregate statistics for your report. You can
              change this later from the footer.{' '}
              <Link href="/privacy/" className="marker-link text-sm">
                Privacy policy
              </Link>
            </p>
          </div>

          <div className="flex shrink-0 flex-col gap-2 sm:items-end">
            <div className="flex flex-wrap gap-2" role="group" aria-label="Privacy consent choices">
              <button
                type="button"
                onClick={() => setConsent('denied')}
                className={cn(
                  'border border-ink bg-paper-100 px-4 py-2 font-mono text-xs uppercase tracking-[0.2em]',
                  'transition-colors hover:bg-paper-200'
                )}
              >
                Local-only
              </button>
              <button
                type="button"
                onClick={() => setConsent('granted')}
                className={cn(
                  'border border-ink bg-ink px-4 py-2 font-mono text-xs uppercase tracking-[0.2em] text-paper',
                  'transition-colors hover:bg-ink-50'
                )}
              >
                Store my results
              </button>
            </div>
            <p className="font-mono text-[11px] uppercase tracking-wider text-ink-300">
              Unset and denied both keep scans local-only.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

/**
 * Footer entry that reopens the consent banner.
 */
export function PrivacyChoicesButton() {
  const reopenConsentBanner = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    resetConsent();

    if (typeof window === 'undefined') return;

    const focusBanner = (attemptsLeft: number) => {
      const banner = document.getElementById(CONSENT_BANNER_ID);
      if (banner instanceof HTMLElement) {
        banner.focus();
        return;
      }

      if (attemptsLeft > 0) {
        window.requestAnimationFrame(() => focusBanner(attemptsLeft - 1));
      }
    };

    window.requestAnimationFrame(() => focusBanner(3));
  };

  return (
    <button
      type="button"
      onClick={reopenConsentBanner}
      aria-controls={CONSENT_BANNER_ID}
      className="underline underline-offset-2 transition-colors hover:text-paper"
    >
      Privacy choices
    </button>
  );
}
