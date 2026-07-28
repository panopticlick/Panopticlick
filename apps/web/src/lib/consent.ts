/**
 * Site-wide consent state for storing anonymized scan data.
 *
 * Three states, persisted in localStorage:
 * - 'granted': user accepted server-side storage of anonymized results
 * - 'denied':  user declined — everything stays local-only
 * - 'unset':   no choice made yet; scans still default to local-only
 */

export type ConsentState = 'granted' | 'denied' | 'unset';

export const CONSENT_STORAGE_KEY = 'panopticlick:consent';

type ConsentListener = (state: ConsentState) => void;

const listeners = new Set<ConsentListener>();

function parseConsent(value: string | null): ConsentState {
  return value === 'granted' || value === 'denied' ? value : 'unset';
}

export function getConsent(): ConsentState {
  if (typeof window === 'undefined') return 'unset';
  try {
    return parseConsent(window.localStorage.getItem(CONSENT_STORAGE_KEY));
  } catch {
    return 'unset';
  }
}

export function consentAllowsStorage(state: ConsentState): boolean {
  return state === 'granted';
}

export function consentRequiresLocalOnly(state: ConsentState): boolean {
  return state !== 'granted';
}

export function setConsent(state: ConsentState): void {
  if (typeof window === 'undefined') return;
  try {
    if (state === 'unset') {
      window.localStorage.removeItem(CONSENT_STORAGE_KEY);
    } else {
      window.localStorage.setItem(CONSENT_STORAGE_KEY, state);
    }
  } catch {
    // Storage unavailable (private mode, quota) — still notify so UI stays in sync
  }
  listeners.forEach((listener) => listener(state));
}

/** Reopen the consent banner (used by the footer "Privacy choices" entry). */
export function resetConsent(): void {
  setConsent('unset');
}

export function subscribeConsent(listener: ConsentListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
