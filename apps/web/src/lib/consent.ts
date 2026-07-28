/**
 * Site-wide consent state for storing anonymized scan data.
 *
 * Three states, persisted in localStorage:
 * - 'granted': user accepted server-side storage of anonymized results
 * - 'denied':  user declined — everything stays local-only
 * - 'unset':   no choice made yet (banner is shown)
 */

export type ConsentState = 'granted' | 'denied' | 'unset';

const STORAGE_KEY = 'panopticlick:consent';

type ConsentListener = (state: ConsentState) => void;

const listeners = new Set<ConsentListener>();

export function getConsent(): ConsentState {
  if (typeof window === 'undefined') return 'unset';
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value === 'granted' || value === 'denied' ? value : 'unset';
  } catch {
    return 'unset';
  }
}

export function setConsent(state: ConsentState): void {
  if (typeof window === 'undefined') return;
  try {
    if (state === 'unset') {
      window.localStorage.removeItem(STORAGE_KEY);
    } else {
      window.localStorage.setItem(STORAGE_KEY, state);
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
