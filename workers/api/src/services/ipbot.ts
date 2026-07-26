/**
 * IPBot IP Intelligence Service
 * Real IP intelligence (geo, ASN, proxy/VPN/Tor detection, risk scoring)
 * via the IPBot API (GET {IPBOT_API_ORIGIN}/v1/ip/{ip}).
 *
 * - Requires IPBOT_API_ORIGIN + IPBOT_API_KEY (secret) in the environment;
 *   returns null when not configured so callers fall back to CF heuristics.
 * - Caches per-IP results 24h (1h for high-risk IPs) in KV when bound,
 *   otherwise the Workers Cache API. Cache keys use a secret-keyed HMAC,
 *   and cached payloads omit the raw IP.
 * - Retries on 429 with backoff and logs X-RateLimit-* headers.
 */

import type { Env } from '../types';

const DEFAULT_TTL_SECONDS = 24 * 60 * 60; // same IP cached 24h
const HIGH_RISK_TTL_SECONDS = 60 * 60; // high-risk results re-checked hourly
const HIGH_RISK_THRESHOLD = 61; // IPBot "High" risk band is 61-100
const MAX_429_RETRIES = 2;
const LOOKUP_TIMEOUT_MS = 3_000;

/**
 * Data-minimized subset of the IPBot v1 response used by this project.
 */
export interface IPBotIntel {
  ip: string;
  stack?: string;
  location?: {
    country?: string;
    country_code?: string;
    region?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
    timezone?: string;
  };
  network?: {
    asn?: string;
    org?: string;
    category?: string;
    operator?: string;
  };
  score?: {
    ip_score?: number;
    risk_score?: number;
    band?: string;
    verdict?: string;
    recommended_action?: string;
  };
  classification?: {
    usage_type?: string;
    is_datacenter?: boolean;
    is_proxy?: boolean;
    is_vpn?: boolean;
    is_tor?: boolean;
    is_cloud?: boolean;
    is_residential_proxy?: boolean;
    is_known_abuser?: boolean;
    is_known_crawler?: boolean;
    cloud_provider?: string;
    proxy_type?: string;
    threat_level?: string;
    confidence?: string;
  };
  decision?: {
    profile?: string;
    role?: string;
    action?: string;
    risk_level?: string;
    confidence?: string;
  } | null;
}

export interface IPBotLookupResult {
  data: IPBotIntel;
  cached: boolean;
}

type IPBotCacheEntry = Omit<IPBotIntel, 'ip'>;

/**
 * Look up IP intelligence for a public IP.
 * Returns null when IPBot is not configured, the IP is not lookupable,
 * or the lookup fails — callers should fall back to CF header heuristics.
 */
export async function lookupIP(ip: string, env: Env): Promise<IPBotLookupResult | null> {
  const origin = env.IPBOT_API_ORIGIN;
  const apiKey = env.IPBOT_API_KEY;

  if (!origin || !apiKey || !isLookupableIP(ip)) {
    return null;
  }

  let cacheKey: string;
  try {
    cacheKey = await ipCacheKey(ip, apiKey);
  } catch (err) {
    logOperationalError('cache key', err);
    return null;
  }

  const cached = await safeCacheGet(env, cacheKey);
  if (cached) {
    const cachedData = { ...cached, ip };
    if (isIPBotIntel(cachedData, ip)) {
      return { data: cachedData, cached: true };
    }
    console.warn('[ipbot] ignored an invalid cache entry');
  }

  try {
    const url = `${origin.replace(/\/+$/, '')}/v1/ip/${encodeURIComponent(ip)}`;
    const deadline = Date.now() + LOOKUP_TIMEOUT_MS;
    const res = await fetchWith429Backoff(url, { 'X-API-Key': apiKey }, deadline);

    if (!res.ok) {
      console.warn(`[ipbot] lookup failed status=${res.status}`);
      return null;
    }

    const payload: unknown = await res.json();
    if (!isIPBotIntel(payload, ip)) {
      console.warn('[ipbot] lookup returned an invalid response');
      return null;
    }

    const data = projectIntel(payload);
    const riskScore = data.score?.risk_score ?? 0;
    const ttl = riskScore >= HIGH_RISK_THRESHOLD ? HIGH_RISK_TTL_SECONDS : DEFAULT_TTL_SECONDS;
    await safeCachePut(env, cacheKey, cacheEntry(data), ttl);

    return { data, cached: false };
  } catch (err) {
    logOperationalError('lookup', err);
    return null;
  }
}

/**
 * Only public unicast IPs are worth an API call.
 */
function isLookupableIP(ip: string): boolean {
  if (!ip || ip === '0.0.0.0' || ip === '::1' || ip === 'Unknown') return false;
  // RFC1918 / loopback / link-local IPv4
  if (/^(10\.|127\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|169\.254\.)/.test(ip)) return false;
  // ULA / link-local IPv6
  if (/^(fc|fd|fe80)/i.test(ip)) return false;
  return true;
}

async function fetchWith429Backoff(
  url: string,
  headers: Record<string, string>,
  deadline: number
): Promise<Response> {
  let attempt = 0;

  for (;;) {
    const remainingMs = deadline - Date.now();
    if (remainingMs <= 0) {
      throw new DOMException('IPBot lookup timed out', 'TimeoutError');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), remainingMs);
    let res: Response;

    try {
      res = await fetch(url, { headers, signal: controller.signal });
    } finally {
      clearTimeout(timeoutId);
    }

    logRateLimit(res);

    if (res.status !== 429 || attempt >= MAX_429_RETRIES) {
      return res;
    }

    const retryAfter = Number(res.headers.get('Retry-After'));
    const delayMs =
      Number.isFinite(retryAfter) && retryAfter > 0
        ? Math.min(retryAfter * 1000, 5000)
        : 500 * 2 ** attempt;

    if (Date.now() + delayMs >= deadline) {
      return res;
    }

    await new Promise((resolve) => setTimeout(resolve, delayMs));
    attempt++;
  }
}

/**
 * Observe IPBot rate-limit headers; warn when the quota is nearly exhausted.
 */
function logRateLimit(res: Response): void {
  const limit = res.headers.get('X-RateLimit-Limit');
  const remaining = res.headers.get('X-RateLimit-Remaining');
  const tier = res.headers.get('X-RateLimit-Tier');

  if (limit === null && remaining === null && tier === null) return;

  const message = `[ipbot] rate-limit limit=${limit} remaining=${remaining} tier=${tier} status=${res.status}`;
  const nearLimit =
    remaining !== null && limit !== null && Number(remaining) <= Math.ceil(Number(limit) * 0.1);

  if (res.status === 429 || nearLimit) {
    console.warn(message);
  } else {
    console.log(message);
  }
}

/**
 * Cache key derived from an API-key-backed HMAC. Raw IPs never appear in
 * KV keys or Cache API URLs, and the IPv4 space cannot be enumerated without
 * the server-side key.
 */
async function ipCacheKey(ip: string, apiKey: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(apiKey),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(ip));
  const hash = Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return `ipbot:v1:${hash}`;
}

function cacheApiUrl(cacheKey: string): string {
  return `https://ipbot-cache.panopticlick.internal/${cacheKey}`;
}

async function safeCacheGet(env: Env, cacheKey: string): Promise<IPBotCacheEntry | null> {
  try {
    return await cacheGet(env, cacheKey);
  } catch (err) {
    logOperationalError('cache read', err);
    return null;
  }
}

async function cacheGet(env: Env, cacheKey: string): Promise<IPBotCacheEntry | null> {
  const kv = env.CACHE as KVNamespace | undefined;
  if (kv) {
    return kv.get<IPBotCacheEntry>(cacheKey, 'json');
  }

  if (typeof caches !== 'undefined') {
    const match = await caches.default.match(cacheApiUrl(cacheKey));
    if (match) {
      return match.json<IPBotCacheEntry>();
    }
  }

  return null;
}

async function safeCachePut(
  env: Env,
  cacheKey: string,
  data: IPBotCacheEntry,
  ttlSeconds: number
): Promise<void> {
  try {
    await cachePut(env, cacheKey, data, ttlSeconds);
  } catch (err) {
    logOperationalError('cache write', err);
  }
}

async function cachePut(
  env: Env,
  cacheKey: string,
  data: IPBotCacheEntry,
  ttlSeconds: number
): Promise<void> {
  const kv = env.CACHE as KVNamespace | undefined;
  if (kv) {
    await kv.put(cacheKey, JSON.stringify(data), { expirationTtl: ttlSeconds });
    return;
  }

  if (typeof caches !== 'undefined') {
    await caches.default.put(
      cacheApiUrl(cacheKey),
      new Response(JSON.stringify(data), {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': `max-age=${ttlSeconds}`,
        },
      })
    );
  }
}

function cacheEntry(data: IPBotIntel): IPBotCacheEntry {
  const { ip: _ip, ...entry } = data;
  return entry;
}

function projectIntel(data: IPBotIntel): IPBotIntel {
  return {
    ip: data.ip,
    stack: data.stack,
    location: data.location,
    network: data.network,
    score: data.score,
    classification: data.classification,
    decision: data.decision,
  };
}

function isIPBotIntel(value: unknown, expectedIP: string): value is IPBotIntel {
  if (!isRecord(value) || value.ip !== expectedIP) return false;
  if (!isRecord(value.score)) return false;

  const riskScore = value.score.risk_score;
  if (
    typeof riskScore !== 'number' ||
    !Number.isFinite(riskScore) ||
    riskScore < 0 ||
    riskScore > 100
  ) {
    return false;
  }

  if (value.location !== undefined && !hasOptionalStringFields(value.location, [
    'country',
    'country_code',
    'region',
    'city',
  ])) {
    return false;
  }

  if (value.network !== undefined && !hasOptionalStringFields(value.network, [
    'asn',
    'org',
    'category',
    'operator',
  ])) {
    return false;
  }

  if (value.classification !== undefined) {
    if (!isRecord(value.classification)) return false;
    const classification = value.classification;
    const booleanFields = [
      'is_datacenter',
      'is_proxy',
      'is_vpn',
      'is_tor',
      'is_cloud',
      'is_residential_proxy',
      'is_known_abuser',
      'is_known_crawler',
    ];
    if (booleanFields.some((field) => {
      const fieldValue = classification[field];
      return fieldValue !== undefined && typeof fieldValue !== 'boolean';
    })) {
      return false;
    }
  }

  return true;
}

function hasOptionalStringFields(value: unknown, fields: string[]): boolean {
  if (!isRecord(value)) return false;
  return fields.every((field) => value[field] === undefined || typeof value[field] === 'string');
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function logOperationalError(operation: string, err: unknown): void {
  const errorType = err instanceof Error ? err.name : typeof err;
  console.warn(`[ipbot] ${operation} error type=${errorType}`);
}
