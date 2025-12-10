/**
 * API Client for Panopticlick
 *
 * Handles all communication with the backend API.
 * Supports both local development and production environments.
 */

import { useState, useCallback } from 'react';
import type {
  FingerprintPayload,
  ValuationReport,
} from '@panopticlick/types';

// Types not exported from @panopticlick/types - defined locally
interface ScanSession {
  sessionId: string;
  createdAt: string;
  fingerprint: FingerprintPayload;
  report: ValuationReport;
}

interface ComparisonStats {
  uniqueness: number;
  percentile: number;
  similarCount: number;
  totalScans: number;
  componentComparisons: Record<string, {
    uniqueness: number;
    percentile: number;
    commonValue: boolean;
  }>;
}

// API Configuration
// Support both legacy and current env names for API base
const ENV_BASE = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL;

const API_CONFIG = {
  development: {
    baseUrl: ENV_BASE || 'http://localhost:8787',
    timeout: 30000,
  },
  production: {
    baseUrl: ENV_BASE || 'https://api.panopticlick.org',
    timeout: 30000,
  },
} as const;

// Determine environment
const ENV = process.env.NODE_ENV === 'production' ? 'production' : 'development';
const config = API_CONFIG[ENV];

/**
 * API Error class with typed error codes
 */
export class APIError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number,
    public details?: unknown
  ) {
    super(message);
    this.name = 'APIError';
  }

  static fromResponse(response: Response, data?: { error?: string; code?: string }) {
    return new APIError(
      data?.error || response.statusText || 'Unknown error',
      data?.code || 'UNKNOWN_ERROR',
      response.status,
      data
    );
  }
}

/**
 * Request options for API calls
 */
interface RequestOptions {
  timeout?: number;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

/**
 * Make a fetch request with timeout and error handling
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit & { timeout?: number } = {}
): Promise<Response> {
  const { timeout = config.timeout, ...fetchOptions } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: options.signal || controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Make an API request
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit & RequestOptions = {}
): Promise<T> {
  const url = `${config.baseUrl}${endpoint}`;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  let response: Response;

  try {
    response = await fetchWithTimeout(url, {
      ...options,
      headers,
    });
  } catch (error) {
    // Normalize network and timeout errors
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new APIError('Request timed out', 'TIMEOUT', 408, error);
    }

    throw new APIError(
      'Unable to reach Panopticlick API. Falling back to local mode.',
      'API_UNAVAILABLE',
      0,
      error
    );
  }

  // Handle non-JSON responses
  const contentType = response.headers.get('content-type');
  if (!contentType?.includes('application/json')) {
    if (!response.ok) {
      throw new APIError(
        'Server returned non-JSON response',
        'INVALID_RESPONSE',
        response.status
      );
    }
    return {} as T;
  }

  const data = await response.json();

  if (!response.ok) {
    throw APIError.fromResponse(response, data);
  }

  return data as T;
}

/**
 * API Client namespace
 */
export const api = {
  /**
   * Scan endpoints
   */
  scan: {
    /**
     * Submit a fingerprint scan
     */
    async submit(
      fingerprint: FingerprintPayload,
      options?: { storeData?: boolean; consent?: boolean; turnstileToken?: string }
    ): Promise<{
      success: boolean;
      sessionId: string;
      report: ValuationReport;
      comparison: ComparisonStats;
    }> {
      const consent = options?.consent ?? true;

      // Start session
      const start = await apiRequest<{
        success: boolean;
        sessionId: string;
      }>('/v1/scan/start', {
        method: 'POST',
        body: JSON.stringify({ consent, turnstileToken: options?.turnstileToken }),
      });

      // Collect fingerprint
      const collect = await apiRequest<{
        success: boolean;
        report: ValuationReport;
        hashes?: { full: string; hardware: string; software: string };
      }>('/v1/scan/collect', {
        method: 'POST',
        body: JSON.stringify({
          sessionId: start.sessionId,
          fingerprint,
          consent,
        }),
      });

      // Optional population comparison
      let comparison: ComparisonStats = {
        uniqueness: 0,
        percentile: 0,
        similarCount: 0,
        totalScans: 0,
        componentComparisons: {},
      };

      if (collect.hashes?.full) {
        try {
          const stats = await apiRequest<{
            found: boolean;
            rarity?: { score: number; percentile: number; similarFingerprints: number };
            total?: number;
          }>(`/v1/stats/compare/${collect.hashes.full}`);

          if (stats.found && stats.rarity) {
            comparison = {
              uniqueness: stats.rarity.score,
              percentile: stats.rarity.percentile,
              similarCount: stats.rarity.similarFingerprints,
              totalScans: stats.total ?? 0,
              componentComparisons: {},
            };
          }
        } catch (err) {
          console.warn('[api] stats comparison failed', err);
        }
      }

      return {
        success: collect.success,
        sessionId: start.sessionId,
        report: collect.report,
        comparison,
      };
    },

    /**
     * Get a previous scan result
     */
    async get(sessionId: string): Promise<ScanSession | null> {
      try {
        const status = await apiRequest<{ exists: boolean; createdAt?: string }>(
          `/v1/scan/status/${sessionId}`
        );

        if (!status.exists) return null;

        return {
          sessionId,
          createdAt: status.createdAt || new Date().toISOString(),
          fingerprint: {} as FingerprintPayload,
          report: {} as ValuationReport,
        };
      } catch (error) {
        if (error instanceof APIError && error.status === 404) {
          return null;
        }
        throw error;
      }
    },

    /**
     * Delete a scan session
     */
    async delete(sessionId: string): Promise<{ success: boolean }> {
      return apiRequest(`/v1/privacy/opt-out`, {
        method: 'POST',
        body: JSON.stringify({ sessionIds: [sessionId] }),
      });
    },
  },

  /**
   * RTB simulation endpoints
   */
  rtb: {
    /**
     * Run an RTB auction simulation
     */
    async simulate(fingerprint: FingerprintPayload): Promise<{
      success: boolean;
      auction: {
        winner: string;
        winningBid: number;
        bids: Array<{
          bidder: string;
          amount: number;
          interest: string;
        }>;
        timeline: Array<{
          timestamp: number;
          event: string;
          data: unknown;
        }>;
      };
    }> {
      return apiRequest('/v1/rtb/simulate', {
        method: 'POST',
        body: JSON.stringify({ fingerprint }),
      });
    },

    /**
     * Get RTB market data
     */
    async getMarketData(): Promise<{
      averageCPM: number;
      priceRanges: Record<string, { min: number; max: number; avg: number }>;
      topCategories: Array<{ name: string; cpm: number; volume: number }>;
    }> {
      const stats = await apiRequest<{
        cpmDistribution: Record<string, number>;
        topPersonas: Array<{ id: string; percentage: number }>;
      }>('/v1/rtb/stats');

      return {
        averageCPM: 4,
        priceRanges: {
          low: { min: 0.5, max: 2, avg: 1.2 },
          medium: { min: 2, max: 5, avg: 3.5 },
          high: { min: 5, max: 10, avg: 7 },
          premium: { min: 10, max: 20, avg: 14 },
        },
        topCategories: (stats.topPersonas || []).map((p) => ({
          name: p.id,
          cpm: 4,
          volume: Math.round((p.percentage || 0) * 100),
        })),
      };
    },
  },

  /**
   * Defense testing endpoints
   */
  defense: {
    /**
     * Run DNS leak test
     */
    async dnsLeakTest(): Promise<{
      leaking: boolean;
      resolvers: Array<{
        ip: string;
        hostname?: string;
        isp?: string;
        country?: string;
        isSecure: boolean;
      }>;
      provider: string | null;
      isEncrypted: boolean;
    }> {
      const res = await apiRequest<{
        success: boolean;
        resolver: { ip: string; provider: string; isEncrypted: boolean };
        leakTest: { passed: boolean; leakedIPs: string[] };
      }>('/v1/defense/dns');

      return {
        leaking: !res.leakTest.passed,
        resolvers: [
          {
            ip: res.resolver.ip,
            hostname: undefined,
            isp: res.resolver.provider,
            country: undefined,
            isSecure: res.resolver.isEncrypted,
          },
        ],
        provider: res.resolver.provider,
        isEncrypted: res.resolver.isEncrypted,
      };
    },

    /**
     * Get defense recommendations based on fingerprint
     */
    async getRecommendations(fingerprint: FingerprintPayload): Promise<{
      score: number;
      tier: 'exposed' | 'basic' | 'protected' | 'hardened' | 'fortress';
      recommendations: string[];
      weaknesses: Array<{
        area: string;
        severity: 'low' | 'medium' | 'high' | 'critical';
        description: string;
        fix: string;
      }>;
    }> {
      const res = await apiRequest<{
        success: boolean;
        status: { overallTier: string; score: number; weaknesses?: string[] };
        hardeningGuide: { steps: Array<{ title: string; description: string }> };
      }>('/v1/defense/test', {
        method: 'POST',
        body: JSON.stringify({ fingerprint }),
      });

      return {
        score: res.status.score,
        tier: res.status.overallTier as 'exposed' | 'basic' | 'protected' | 'hardened' | 'fortress',
        recommendations: res.hardeningGuide.steps.map((s) => s.title),
        weaknesses: (res.status.weaknesses || []).map((w) => ({
          area: w,
          severity: 'medium',
          description: w,
          fix: '',
        })),
      };
    },
  },

  /**
   * Statistics endpoints
   */
  stats: {
    /**
     * Get global fingerprint statistics
     */
    async getGlobal(): Promise<{
      totalScans: number;
      uniqueFingerprints: number;
      averageEntropy: number;
      componentStats: Record<
        string,
        {
          uniqueValues: number;
          averageBits: number;
          topValues: Array<{ value: string; count: number; percentage: number }>;
        }
      >;
    }> {
      const res = await apiRequest<{
        totalScans: number;
        uniqueFingerprints: number;
        averageEntropy: number;
        entropyDistribution: Record<string, number>;
      }>('/v1/stats/global');

      return {
        totalScans: res.totalScans,
        uniqueFingerprints: res.uniqueFingerprints,
        averageEntropy: res.averageEntropy,
        componentStats: {},
      };
    },

    /**
     * Compare a fingerprint to the population
     */
    async compare(fingerprint: FingerprintPayload): Promise<ComparisonStats> {
      const { generateHashes } = await import('@panopticlick/fingerprint-sdk');
      const hashes = await generateHashes(fingerprint);
      const res = await apiRequest<{
        found: boolean;
        rarity?: { score: number; percentile: number; similarFingerprints: number };
        total?: number;
      }>(`/v1/stats/compare/${hashes.fullHash}`);

      return {
        uniqueness: res.rarity?.score ?? 0,
        percentile: res.rarity?.percentile ?? 0,
        similarCount: res.rarity?.similarFingerprints ?? 0,
        totalScans: res.total ?? 0,
        componentComparisons: {},
      };
    },

    /**
     * Get entropy distribution data
     */
    async getEntropyDistribution(): Promise<{
      buckets: Array<{
        range: [number, number];
        count: number;
        percentage: number;
      }>;
      median: number;
      mean: number;
      stdDev: number;
    }> {
      const res = await apiRequest<{
        buckets: Array<{ range: string; count: number; avgEntropy: number }>;
      }>('/v1/stats/entropy');

      return {
        buckets: res.buckets.map((b) => ({
          range: [0, 0] as [number, number],
          count: b.count,
          percentage: 0,
        })),
        median: 0,
        mean: 0,
        stdDev: 0,
      };
    },
  },

  /**
   * Privacy endpoints
   */
  privacy: {
    /**
     * Get data associated with a session
     */
    async getData(sessionId: string): Promise<{
      found: boolean;
      data?: {
        sessionId: string;
        createdAt: string;
        fingerprint: FingerprintPayload;
      };
    }> {
      const res = await apiRequest<{ success: boolean; data?: unknown }>(
        '/v1/privacy/my-data'
      );

      return {
        found: res.success && !!res.data,
        data: res.data as any,
      };
    },

    /**
     * Delete all data associated with a session
     */
    async deleteData(sessionId: string): Promise<{
      success: boolean;
      deleted: {
        sessions: number;
        fingerprints: number;
      };
    }> {
      return apiRequest(`/v1/privacy/opt-out`, {
        method: 'POST',
        body: JSON.stringify({ sessionIds: [sessionId] }),
      });
    },

    /**
     * Export all data associated with a session (GDPR compliance)
     */
    async exportData(sessionId: string): Promise<{
      success: boolean;
      exportUrl: string;
      expiresAt: string;
    }> {
      return apiRequest(`/v1/privacy/export/${sessionId}`, {
        method: 'POST',
      });
    },
  },

  /**
   * Health check
   */
  async health(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    version: string;
    uptime: number;
    checks: Record<string, boolean>;
  }> {
    return apiRequest('/health');
  },
};

/**
 * Create a typed API hook for React
 */
export function createAPIHook<T, Args extends unknown[]>(
  fetcher: (...args: Args) => Promise<T>
) {
  return function useAPI(...args: Args) {
    const [data, setData] = useState<T | null>(null);
    const [error, setError] = useState<APIError | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const execute = useCallback(async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await fetcher(...args);
        setData(result);
        return result;
      } catch (err) {
        const apiError =
          err instanceof APIError
            ? err
            : new APIError('Unknown error', 'UNKNOWN', 500, err);
        setError(apiError);
        throw apiError;
      } finally {
        setIsLoading(false);
      }
    }, [args]);

    return { data, error, isLoading, execute };
  };
}
