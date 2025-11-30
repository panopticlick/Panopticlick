/**
 * API Types
 * Request/Response types for all API endpoints
 */

import type { FingerprintPayload } from './fingerprint';
import type { ValuationReport, RTBSimulationResult, DefenseStatus, RTBBid, Persona } from './valuation';

// ============================================
// SCAN ENDPOINTS
// ============================================

// POST /api/scan/start
export interface ScanStartRequest {
  consent: boolean;
  referrer?: string;
  turnstileToken?: string;
}

export interface ScanStartResponse {
  sessionId: string;
  consentRecorded: boolean;
}

// POST /api/scan/collect
export interface ScanCollectRequest {
  sessionId: string;
  fingerprint: FingerprintPayload;
}

export interface ScanCollectResponse {
  success: boolean;
  analysisId: string;
  report: ValuationReport;
}

// ============================================
// RTB SIMULATION ENDPOINTS
// ============================================

// POST /api/rtb/simulate
export interface RTBSimulateRequest {
  sessionId: string;
  fingerprint: Partial<FingerprintPayload>;
  geo?: {
    country: string;
    city: string;
  };
}

export interface RTBSimulateResponse {
  success: boolean;
  simulationId: string;
  persona: Persona;
  bids: RTBBid[];
  winningBid: RTBBid;
  estimatedCPM: number;
  auctionDuration: number;
}

// ============================================
// SUPERCOOKIE ENDPOINTS
// ============================================

// POST /api/supercookie/generate
export interface SupercookieGenerateRequest {
  sessionId: string;
}

export interface SupercookieGenerateResponse {
  success: boolean;
  cookieId: string;
  setUrls: string[];
}

// POST /api/supercookie/verify
export interface SupercookieVerifyRequest {
  sessionId: string;
  recoveredBits: number[];
}

export interface SupercookieVerifyResponse {
  success: boolean;
  detected: boolean;
  recoveredId: string | null;
  originalId: string;
  match: boolean;
}

// ============================================
// DEFENSE TESTING ENDPOINTS
// ============================================

// POST /api/defense/blocker
export interface DefenseBlockerRequest {
  sessionId: string;
  results: {
    tracker: string;
    loaded: boolean;
  }[];
}

export interface DefenseBlockerResponse {
  score: number;
  blocked: number;
  total: number;
  recommendations: string[];
}

// GET /api/defense/dns
export interface DefenseDNSResponse {
  dnsProvider: string;
  isEncrypted: boolean;
  leakDetected: boolean;
  resolverIp: string;
}

// POST /api/defense/test
export interface DefenseTestRequest {
  sessionId: string;
  tests: ('adblock' | 'headers' | 'fingerprint' | 'network')[];
}

export interface DefenseTestResponse {
  success: boolean;
  auditId: string;
  results: DefenseStatus;
}

// ============================================
// STATISTICS ENDPOINTS
// ============================================

export interface EntropyBucket {
  min: number;
  max: number;
  count: number;
  percentage: number;
}

export interface BrowserStat {
  browser: string;
  count: number;
  percentage: number;
}

export interface CountryStat {
  country: string;
  countryCode: string;
  count: number;
  percentage: number;
}

// GET /api/stats/global
export interface GlobalStatsResponse {
  totalScans: number;
  avgEntropy: number;
  medianEntropy: number;
  avgCPM: number;
  avgAdblockScore: number;
  entropyDistribution: EntropyBucket[];
  topBrowsers: BrowserStat[];
  topCountries: CountryStat[];
  updatedAt: number;
}

// ============================================
// PRIVACY ENDPOINTS
// ============================================

// POST /api/opt-out
export interface OptOutRequest {
  confirm: boolean;
}

export interface OptOutResponse {
  success: boolean;
  message: string;
}

// GET /api/my-data
export interface MyDataResponse {
  sessions: unknown[];
  analyses: unknown[];
  exportedAt: string;
  note: string;
}

// ============================================
// ERROR RESPONSES
// ============================================

export type APIErrorCode =
  | 'CONSENT_REQUIRED'
  | 'INVALID_SESSION'
  | 'RATE_LIMITED'
  | 'INVALID_PAYLOAD'
  | 'COLLECTION_FAILED'
  | 'INVALID_TURNSTILE'
  | 'OPTED_OUT'
  | 'INTERNAL_ERROR';

export interface APIError {
  error: true;
  code: APIErrorCode;
  message: string;
  details?: Record<string, unknown>;
  retryAfter?: number;
}

// ============================================
// GENERIC API RESPONSE
// ============================================

export type APIResponse<T> = T | APIError;

export function isAPIError(response: unknown): response is APIError {
  return (
    typeof response === 'object' &&
    response !== null &&
    'error' in response &&
    (response as APIError).error === true
  );
}
