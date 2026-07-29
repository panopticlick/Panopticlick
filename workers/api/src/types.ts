/**
 * Cloudflare Worker Types
 */

/**
 * Workers Rate Limiting binding. Keep the narrow slice used by middleware so
 * the application does not depend on generated platform types in unit tests.
 */
export interface RateLimitBinding {
  limit(options: { key: string }): Promise<{ success: boolean }>;
}

export interface Env {
  // D1 Database
  DB: D1Database;

  // KV Namespace for caching
  CACHE: KVNamespace;

  // Analytics Engine
  // Optional: absent when the binding is not configured; all call sites must use `?.`
  ANALYTICS?: AnalyticsEngineDataset;

  // Rate limiting: global (/v1/*) and AI-specific (/v1/ai/*).
  // Optional: absent in local dev and tests, where requests are allowed through.
  RATE_LIMITER?: RateLimitBinding;
  AI_RATE_LIMITER?: RateLimitBinding;

  // Environment variables
  ENVIRONMENT: string;
  API_VERSION: string;
  ALLOWED_ORIGINS?: string; // comma separated
  TURNSTILE_SECRET?: string;

  // Salt for IP hashing (secret). Missing salt degrades to a per-isolate random
  // salt so hashes stay unlinkable instead of rainbow-tableable.
  IP_HASH_SALT?: string;

  // HMAC key for stateless session ownership tokens (secret)
  SESSION_TOKEN_SECRET?: string;

  // AI Chat (OpenRouter)
  OPENROUTER_API_KEY?: string;
  OPENROUTER_MODEL?: string;

  // IPBot IP intelligence (key is a Wrangler secret, never in wrangler.toml)
  IPBOT_API_ORIGIN?: string;
  IPBOT_API_KEY?: string;
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
