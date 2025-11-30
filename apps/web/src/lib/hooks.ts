/**
 * Custom React Hooks for Panopticlick
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { api, APIError } from './api-client';
import type {
  FingerprintPayload,
  ValuationReport,
  ComparisonStats,
} from '@panopticlick/types';

/**
 * Hook state type
 */
interface AsyncState<T> {
  data: T | null;
  error: APIError | Error | null;
  isLoading: boolean;
}

/**
 * Generic async hook creator
 */
function useAsync<T>(
  asyncFn: () => Promise<T>,
  deps: unknown[] = []
): AsyncState<T> & { refetch: () => Promise<void> } {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    error: null,
    isLoading: false,
  });

  const execute = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const data = await asyncFn();
      setState({ data, error: null, isLoading: false });
    } catch (error) {
      setState({
        data: null,
        error: error instanceof Error ? error : new Error(String(error)),
        isLoading: false,
      });
    }
  }, deps);

  useEffect(() => {
    execute();
  }, [execute]);

  return { ...state, refetch: execute };
}

/**
 * Hook for running a fingerprint scan
 */
export function useScan() {
  const [phase, setPhase] = useState<
    'idle' | 'collecting' | 'analyzing' | 'complete' | 'error'
  >('idle');
  const [fingerprint, setFingerprint] = useState<FingerprintPayload | null>(null);
  const [report, setReport] = useState<ValuationReport | null>(null);
  const [comparison, setComparison] = useState<ComparisonStats | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [progress, setProgress] = useState(0);

  const scan = useCallback(async (options?: { storeData?: boolean }) => {
    setPhase('collecting');
    setProgress(0);
    setError(null);

    try {
      // Dynamic import of fingerprint SDK
      const sdk = await import('@panopticlick/fingerprint-sdk');

      // Simulate progress while collecting
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 5, 80));
      }, 100);

      // Collect fingerprint
      const fp = await sdk.collectFingerprint({
        debug: process.env.NODE_ENV === 'development',
        consentGiven: true,
      });

      clearInterval(progressInterval);
      setProgress(85);
      setFingerprint(fp);
      setPhase('analyzing');

      // Generate local report
      const { generateValuationReport } = await import(
        '@panopticlick/valuation-engine'
      );
      const valuationReport = generateValuationReport(fp);
      setReport(valuationReport);
      setProgress(95);

      // Submit to API if requested
      if (options?.storeData) {
        const result = await api.scan.submit(fp, { storeData: true });
        setComparison(result.comparison);
      }

      setProgress(100);
      setPhase('complete');

      return { fingerprint: fp, report: valuationReport };
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      setPhase('error');
      throw err;
    }
  }, []);

  const reset = useCallback(() => {
    setPhase('idle');
    setFingerprint(null);
    setReport(null);
    setComparison(null);
    setError(null);
    setProgress(0);
  }, []);

  return {
    phase,
    fingerprint,
    report,
    comparison,
    error,
    progress,
    scan,
    reset,
  };
}

/**
 * Hook for WebRTC leak detection
 */
export function useWebRTCLeak() {
  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  const [result, setResult] = useState<Awaited<
    ReturnType<typeof import('@panopticlick/fingerprint-sdk').detectWebRTCLeak>
  > | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    import('@panopticlick/fingerprint-sdk').then((sdk) => {
      setIsSupported(sdk.isWebRTCSupported());
    });
  }, []);

  const runTest = useCallback(async (timeout = 5000) => {
    setIsLoading(true);
    setError(null);

    try {
      const sdk = await import('@panopticlick/fingerprint-sdk');
      const leakResult = await sdk.detectWebRTCLeak(timeout);
      setResult(leakResult);
      return leakResult;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { isSupported, result, isLoading, error, runTest };
}

/**
 * Hook for DNS leak detection
 */
export function useDNSLeak() {
  const [result, setResult] = useState<Awaited<
    ReturnType<typeof import('@panopticlick/fingerprint-sdk').detectDNSLeak>
  > | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const runTest = useCallback(async (apiEndpoint?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const sdk = await import('@panopticlick/fingerprint-sdk');
      const leakResult = await sdk.detectDNSLeak(apiEndpoint);
      setResult(leakResult);
      return leakResult;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { result, isLoading, error, runTest };
}

/**
 * Hook for ad blocker testing
 */
export function useBlockerTest() {
  const [result, setResult] = useState<Awaited<
    ReturnType<typeof import('@panopticlick/fingerprint-sdk').runBlockerTests>
  > | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [progress, setProgress] = useState(0);

  const runTest = useCallback(async (baseUrl = '', timeout = 3000) => {
    setIsLoading(true);
    setError(null);
    setProgress(0);

    try {
      const sdk = await import('@panopticlick/fingerprint-sdk');
      const resources = sdk.getBaitResources();

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 5, 90));
      }, 100);

      const analysis = await sdk.runBlockerTests(baseUrl, timeout);

      clearInterval(progressInterval);
      setProgress(100);
      setResult(analysis);
      return analysis;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const quickCheck = useCallback(async () => {
    const sdk = await import('@panopticlick/fingerprint-sdk');
    return sdk.quickBlockerDetect();
  }, []);

  return { result, isLoading, error, progress, runTest, quickCheck };
}

/**
 * Hook for HSTS supercookie demo
 */
export function useHSTSDemo() {
  const [checkResult, setCheckResult] = useState<Awaited<
    ReturnType<typeof import('@panopticlick/fingerprint-sdk').checkHSTSSupport>
  > | null>(null);
  const [visualization, setVisualization] = useState<Awaited<
    ReturnType<typeof import('@panopticlick/fingerprint-sdk').generateVisualization>
  > | null>(null);
  const [demoValue, setDemoValue] = useState<string | null>(null);
  const [comparison, setComparison] = useState<Awaited<
    ReturnType<typeof import('@panopticlick/fingerprint-sdk').getTrackingComparison>
  > | null>(null);

  useEffect(() => {
    import('@panopticlick/fingerprint-sdk').then((sdk) => {
      sdk.checkHSTSSupport().then(setCheckResult);
      setVisualization(sdk.generateVisualization());
      setComparison(sdk.getTrackingComparison());
    });
  }, []);

  const runDemo = useCallback(async (bits = 16) => {
    const sdk = await import('@panopticlick/fingerprint-sdk');
    const demoData = sdk.generateHSTSDemoData(bits);
    setDemoValue(demoData.binary);
    setVisualization(sdk.generateVisualization(demoData.binary));
    return demoData;
  }, []);

  return { checkResult, visualization, demoValue, comparison, runDemo };
}

/**
 * Hook for managing session storage
 */
export function useSession() {
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    // Try to load existing session from localStorage
    const stored = localStorage.getItem('panopticlick_session');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setSessionId(parsed.sessionId);
      } catch {
        // Invalid session, clear it
        localStorage.removeItem('panopticlick_session');
      }
    }
  }, []);

  const saveSession = useCallback((id: string) => {
    setSessionId(id);
    localStorage.setItem(
      'panopticlick_session',
      JSON.stringify({
        sessionId: id,
        createdAt: new Date().toISOString(),
      })
    );
  }, []);

  const clearSession = useCallback(() => {
    setSessionId(null);
    localStorage.removeItem('panopticlick_session');
  }, []);

  return { sessionId, saveSession, clearSession };
}

/**
 * Hook for debouncing values
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook for detecting reduced motion preference
 */
export function useReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const listener = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', listener);

    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  return reducedMotion;
}

/**
 * Hook for intersection observer
 */
export function useIntersection(
  ref: React.RefObject<Element>,
  options?: IntersectionObserverInit
): boolean {
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [ref, options]);

  return isIntersecting;
}

/**
 * Hook for media queries
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    mediaQuery.addEventListener('change', listener);

    return () => mediaQuery.removeEventListener('change', listener);
  }, [query]);

  return matches;
}

/**
 * Hook for copy to clipboard
 */
export function useCopyToClipboard(): [boolean, (text: string) => Promise<void>] {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const copy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  }, []);

  return [copied, copy];
}

/**
 * Hook for local storage with sync across tabs
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        localStorage.setItem(key, JSON.stringify(valueToStore));

        // Trigger storage event for other tabs
        window.dispatchEvent(new Event('storage'));
      } catch (error) {
        console.error('Error saving to localStorage:', error);
      }
    },
    [key, storedValue]
  );

  // Listen for changes from other tabs
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch {
          // Invalid JSON, ignore
        }
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [key]);

  return [storedValue, setValue];
}
