/**
 * API Client for Panopticlick
 *
 * Handles all communication with the backend API.
 * Supports both local development and production environments.
 */

import type {
  FingerprintPayload,
  NetworkIntelligence,
  RTBSimulateResponse,
  ScanStartResponse,
  ValuationReport,
} from '@panopticlick/types';
import { getConsent } from './consent';

// Types not exported from @panopticlick/types - defined locally
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

export interface AIChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AIChatContext {
  entropyBits?: number;
  averageCPM?: number;
  defenseScore?: number;
  personas?: string[];
  /** Legacy worker fields kept during the rolling deployment. */
  entropy?: number;
  uniqueness?: string;
  trackers?: number;
}

export interface AIChatResponse {
  success: boolean;
  message: {
    id?: string;
    role: 'assistant';
    content: string;
  };
  meta?: { fallback?: boolean };
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
 * Session ownership token issued by /v1/scan/start.
 *
 * Session-scoped endpoints (privacy export, consent, opt-out, scan status)
 * reject requests without it, so we keep the most recent token paired with the
 * session it belongs to and never send it for a different session.
 */
const SESSION_TOKEN_KEY = 'panopticlick:sessionToken';

interface SessionTokenRecord {
  sessionId: string;
  token: string;
}

let cachedSessionToken: SessionTokenRecord | null = null;

export function storeSessionToken(sessionId: string, token: string): void {
  cachedSessionToken = { sessionId, token };
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(SESSION_TOKEN_KEY, JSON.stringify(cachedSessionToken));
  } catch {
    // Storage unavailable — the in-memory copy still covers this page view
  }
}

export function getSessionToken(sessionId: string): string | null {
  if (cachedSessionToken?.sessionId === sessionId) return cachedSessionToken.token;
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem(SESSION_TOKEN_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<SessionTokenRecord>;
    if (parsed.sessionId === sessionId && typeof parsed.token === 'string') {
      cachedSessionToken = { sessionId, token: parsed.token };
      return parsed.token;
    }
  } catch {
    // Malformed entry — treat as no token
  }
  return null;
}

export function clearSessionToken(): void {
  cachedSessionToken = null;
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(SESSION_TOKEN_KEY);
  } catch {
    // Nothing to clean up
  }
}

function sessionHeaders(sessionId: string): Record<string, string> {
  const token = getSessionToken(sessionId);
  return token ? { 'X-Session-Token': token } : {};
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
      network: NetworkIntelligence | null;
    }> {
      // Default to the site-wide consent banner state: only 'granted' opts in
      // to server-side storage; 'denied'/'unset' stay local-only.
      const consent = options?.consent ?? getConsent() === 'granted';

      // Start session
      const start = await apiRequest<ScanStartResponse>('/v1/scan/start', {
        method: 'POST',
        body: JSON.stringify({ consent, turnstileToken: options?.turnstileToken }),
      });

      if (start.sessionToken) {
        storeSessionToken(start.sessionId, start.sessionToken);
      }

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
        network: start.network ?? null,
      };
    },
  },

  /**
   * RTB simulation endpoints
   */
  rtb: {
    /**
     * Run an RTB auction simulation.
     *
     * The declared type is the shared contract; callers still normalize the
     * payload through `lib/rtb-mapping` because the deployed API can be older
     * than the contract.
     */
    async simulate(fingerprint: FingerprintPayload): Promise<RTBSimulateResponse> {
      return apiRequest('/v1/rtb/simulate', {
        method: 'POST',
        body: JSON.stringify({ fingerprint }),
      });
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
  },

  /**
   * AI chat endpoints
   */
  ai: {
    /**
     * Multi-turn chat with the analysis assistant. The worker prepends its own
     * system prompt; we only ever send user/assistant turns.
     */
    async chat(
      messages: AIChatMessage[],
      fingerprintContext?: AIChatContext
    ): Promise<AIChatResponse> {
      // The worker caps history at 20 turns. The browser never sends a system
      // turn; policy remains owned by the worker.
      const recentMessages = messages.slice(-20);

      try {
        return await apiRequest<AIChatResponse>('/v1/ai/chat', {
          method: 'POST',
          body: JSON.stringify({
            messages: recentMessages,
            fingerprintContext,
          }),
        });
      } catch (error) {
        // During a rolling deployment, the previous worker only understands
        // `{ prompt }`. Retry validation failures once with the last user turn;
        // network/authorization/rate-limit errors must keep their real status.
        const legacyCompatible =
          error instanceof APIError && (error.status === 400 || error.status === 422);
        const latestUserMessage = [...recentMessages]
          .reverse()
          .find((message) => message.role === 'user');

        if (!legacyCompatible || !latestUserMessage) throw error;

        return apiRequest<AIChatResponse>('/v1/ai/chat', {
          method: 'POST',
          body: JSON.stringify({
            prompt: latestUserMessage.content,
            fingerprintContext,
          }),
        });
      }
    },
  },

  /**
   * Privacy endpoints
   */
  privacy: {
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
        headers: sessionHeaders(sessionId),
      });
    },
  },
};
