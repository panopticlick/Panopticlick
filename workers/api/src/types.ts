/**
 * Cloudflare Worker Types
 */

export interface Env {
  // D1 Database
  DB: D1Database;

  // KV Namespace for caching
  CACHE: KVNamespace;

  // Analytics Engine
  ANALYTICS: AnalyticsEngineDataset;

  // Environment variables
  ENVIRONMENT: string;
  API_VERSION: string;
  ALLOWED_ORIGINS?: string; // comma separated
  TURNSTILE_SECRET?: string;

  // AI Chat (OpenRouter)
  OPENROUTER_API_KEY?: string;
  OPENROUTER_MODEL?: string;
}

/**
 * Session data stored in D1
 */
export interface SessionRecord {
  id: string;
  fingerprint_hash: string;
  hardware_hash: string;
  software_hash: string;
  entropy_bits: number;
  ip_hash: string;
  country: string;
  asn: string;
  is_proxy: boolean;
  is_vpn: boolean;
  created_at: string;
  consent_given: boolean;
}

/**
 * Fingerprint record for population stats
 */
export interface FingerprintRecord {
  hash: string;
  hardware_hash: string;
  software_hash: string;
  first_seen: string;
  last_seen: string;
  times_seen: number;
  entropy_bits: number;
}

/**
 * Global statistics cache
 */
export interface GlobalStats {
  total_scans: number;
  unique_fingerprints: number;
  average_entropy: number;
  entropy_distribution: Record<string, number>;
  browser_distribution: Record<string, number>;
  os_distribution: Record<string, number>;
  updated_at: string;
}

/**
 * Request context with parsed IP info
 */
export interface RequestContext {
  ip: string;
  ipHash: string;
  country: string;
  city: string;
  asn: string;
  asnOrg: string;
  isProxy: boolean;
  isVPN: boolean;
  isTor: boolean;
  isDatacenter: boolean;
  userAgent: string;
}
