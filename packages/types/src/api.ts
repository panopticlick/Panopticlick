/**
 * API Types
 * Request/Response types for all API endpoints
 */

import type { FingerprintPayload, NetworkIntelligence } from './fingerprint';
import type {
  ValuationReport,
  RTBSimulationResult,
  DefenseStatus,
  RTBBid,
  Persona,
  HardeningGuide,
  DefenseTier,
} from './valuation';

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
  success: boolean;
  sessionId: string;
  consentRecorded?: boolean;
  timestamp?: number;
  network?: NetworkIntelligence;
}

// POST /api/scan/collect
export interface ScanCollectRequest {
  sessionId: string;
  fingerprint: FingerprintPayload;
  consent?: boolean;
}

export interface ScanCollectResponse {
  success: boolean;
  analysisId?: string;
  report: ValuationReport;
  hashes?: {
    full?: string;
    hardware?: string;
    software?: string;
  };
}

// ============================================
// RTB SIMULATION ENDPOINTS
// ============================================

// POST /api/rtb/simulate
export interface RTBSimulateRequest {
  sessionId?: string;
  fingerprint: FingerprintPayload;
  options?: Record<string, unknown>;
  geo?: {
    country: string;
    city: string;
  };
}

export interface RTBSimulateResponse {
  success: boolean;
  auction: {
    bids: RTBBid[];
    winner: RTBBid | null;
    totalValue: number;
    averageCPM: number;
  };
  valuation?: {
    cpm: number;
    annualValue: number;
    explanation: string;
  };
  personas?: Persona[];
  entropy?: {
    totalBits: number;
    tier: string;
    multiplier?: number;
  };
  timestamp: number;
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
  sessionId?: string;
  loadedResources: string[];
  blockedResources: string[];
  testResults: Record<string, boolean>;
}

export interface DefenseBlockerResponse {
  success: boolean;
  blockerDetected: boolean;
  blockerName: string | null;
  effectivenessScore: number;
  categories: Record<string, { blocked: number; total: number }>;
  recommendations: string[];
}

// GET /api/defense/dns
export interface DefenseDNSResponse {
  success: boolean;
  resolver: {
    ip: string;
    provider: string;
    isEncrypted: boolean;
    isCloudflare?: boolean;
  };
  leakTest: {
    passed: boolean;
    leakedIPs: string[];
  };
}

// POST /api/defense/test
export interface DefenseTestRequest {
  fingerprint: FingerprintPayload;
  clientTests?: {
    adBlocker?: boolean;
    trackerBlocked?: boolean;
    vpnDetected?: boolean;
    torDetected?: boolean;
  };
}

export interface DefenseTestResponse {
  success: boolean;
  auditId?: string;
  status: DefenseStatus;
  hardeningGuide: HardeningGuide;
  score: number;
  tier: DefenseTier;
}

export interface DefenseRecommendationsResponse {
  success: boolean;
  tier: DefenseTier;
  score: number;
  recommendations: string[];
  weaknesses: string[];
}

// ============================================
// STATISTICS ENDPOINTS
// ============================================

export interface EntropyBucket {
  range: string;
  count: number;
  avgEntropy: number;
  percentage?: number;
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
  uniqueFingerprints: number;
  averageEntropy: number;
  entropyDistribution: Record<string, number> | EntropyBucket[];
  browserDistribution?: Record<string, number>;
  osDistribution?: Record<string, number>;
  updatedAt: string | number;
}

// ============================================
// PRIVACY ENDPOINTS
// ============================================

// POST /api/opt-out
export interface OptOutRequest {
  sessionIds?: string[];
  fingerprintHash?: string;
  email?: string;
}

export interface OptOutResponse {
  success: boolean;
  message: string;
  deletedCount?: {
    sessions: number;
    fingerprints: number;
  };
}

// GET /api/my-data
export interface MyDataResponse {
  success: boolean;
  data?: {
    sessions: unknown[];
    fingerprints: unknown[];
    exportedAt: string;
    note: string;
  };
}

export interface MyDataExportResponse {
  success: boolean;
  exportUrl: string;
  expiresAt: string;
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
