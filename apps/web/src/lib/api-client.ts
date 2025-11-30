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
  ScanSession,
  ComparisonStats,
} from '@panopticlick/types';

// API Configuration
const API_CONFIG = {
  development: {
    baseUrl: 'http://localhost:8787',
    timeout: 30000,
  },
  production: {
    baseUrl: 'https://api.panopticlick.org',
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

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const response = await fetchWithTimeout(url, {
    ...options,
    headers,
  });

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
      options?: { storeData?: boolean; consent?: boolean }
    ): Promise<{
      success: boolean;
      sessionId: string;
      report: ValuationReport;
      comparison: ComparisonStats;
    }> {
      return apiRequest('/api/v1/scan', {
        method: 'POST',
        body: JSON.stringify({
          fingerprint,
          storeData: options?.storeData ?? false,
          consent: options?.consent ?? true,
        }),
      });
    },

    /**
     * Get a previous scan result
     */
    async get(sessionId: string): Promise<ScanSession | null> {
      try {
        return await apiRequest(`/api/v1/scan/${sessionId}`);
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
      return apiRequest(`/api/v1/scan/${sessionId}`, {
        method: 'DELETE',
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
      return apiRequest('/api/v1/rtb/simulate', {
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
      return apiRequest('/api/v1/rtb/market');
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
      return apiRequest('/api/v1/defense/dns');
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
      return apiRequest('/api/v1/defense/recommendations', {
        method: 'POST',
        body: JSON.stringify({ fingerprint }),
      });
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
      return apiRequest('/api/v1/stats');
    },

    /**
     * Compare a fingerprint to the population
     */
    async compare(fingerprint: FingerprintPayload): Promise<ComparisonStats> {
      return apiRequest('/api/v1/stats/compare', {
        method: 'POST',
        body: JSON.stringify({ fingerprint }),
      });
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
      return apiRequest('/api/v1/stats/entropy-distribution');
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
      return apiRequest(`/api/v1/privacy/data/${sessionId}`);
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
      return apiRequest(`/api/v1/privacy/data/${sessionId}`, {
        method: 'DELETE',
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
      return apiRequest(`/api/v1/privacy/export/${sessionId}`, {
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

