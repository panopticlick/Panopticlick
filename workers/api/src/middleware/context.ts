/**
 * Request Context Middleware
 * Extracts IP, geo, and network information from Cloudflare headers
 */

import { Context, Next } from 'hono';
import type { RequestContext } from '../types';

/**
 * Per-isolate fallback salt, used only when IP_HASH_SALT is unset. Created
 * lazily because generating random values in the global scope is a startup
 * error on Workers.
 */
let isolateSalt: string | undefined;
let warnedMissingSalt = false;

function resolveSalt(env: { IP_HASH_SALT?: string } | undefined): string {
  if (env?.IP_HASH_SALT) return env.IP_HASH_SALT;

  if (!warnedMissingSalt) {
    warnedMissingSalt = true;
    console.warn(
      '[context] IP_HASH_SALT is not configured; falling back to a per-isolate random salt (hashes are unlinkable but unstable)'
    );
  }

  if (!isolateSalt) isolateSalt = crypto.randomUUID();
  return isolateSalt;
}

/**
 * Generate SHA-256 hash of IP address
 */
async function hashIP(ip: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(ip + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Detect if IP is likely a proxy/VPN/datacenter
 */
function detectNetworkType(cf: IncomingRequestCfProperties | CfProperties<unknown> | undefined): {
  isProxy: boolean;
  isVPN: boolean;
  isTor: boolean;
  isDatacenter: boolean;
} {
  if (!cf) {
    return { isProxy: false, isVPN: false, isTor: false, isDatacenter: false };
  }

  // Check Cloudflare's bot detection flags
  const asn = cf.asn?.toString() || '';
  const asOrg = ((cf as unknown as Record<string, unknown>).asOrganization as string || '').toLowerCase();

  // Known datacenter/hosting ASNs
  const datacenterKeywords = [
    'amazon',
    'google',
    'microsoft',
    'digitalocean',
    'linode',
    'vultr',
    'ovh',
    'hetzner',
    'cloudflare',
    'akamai',
  ];

  // Known VPN providers
  const vpnKeywords = [
    'nordvpn',
    'expressvpn',
    'mullvad',
    'protonvpn',
    'surfshark',
    'privateinternetaccess',
    'ipvanish',
  ];

  const isDatacenter = datacenterKeywords.some(kw => asOrg.includes(kw));
  const isVPN = vpnKeywords.some(kw => asOrg.includes(kw));

  // Tor exit nodes typically have specific AS patterns. The word boundary
  // keeps "Torino Telecom" / "Storage Networks" out; "exit" alone is far too
  // generic to be evidence of anything.
  const isTor = /\btor\b/.test(asOrg) || asOrg.includes('torproject');

  return {
    isProxy: isDatacenter || isVPN,
    isVPN,
    isTor,
    isDatacenter,
  };
}

/**
 * Context middleware - extracts request context
 */
export async function contextMiddleware(c: Context, next: Next) {
  const cf = c.req.raw.cf;

  // Get IP from headers (Cloudflare sets this)
  const ip = c.req.header('cf-connecting-ip') ||
    c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ||
    '0.0.0.0';

  // Hash the IP for privacy
  const ipHash = await hashIP(ip, resolveSalt(c.env as { IP_HASH_SALT?: string } | undefined));

  // Extract geo info from Cloudflare
  const country = (cf?.country as string) || 'Unknown';
  const city = (cf?.city as string) || 'Unknown';
  const asn = cf?.asn?.toString() || 'Unknown';
  const asnOrg = ((cf as unknown as Record<string, unknown>)?.asOrganization as string) || 'Unknown';

  // Detect network type
  const networkType = detectNetworkType(cf);

  // Build context
  const requestContext: RequestContext = {
    ip,
    ipHash,
    country,
    city,
    asn,
    asnOrg,
    ...networkType,
    userAgent: c.req.header('user-agent') || '',
  };

  // Store in context
  c.set('requestContext', requestContext);

  await next();
}

/**
 * Get request context from Hono context
 */
export function getRequestContext(c: Context): RequestContext {
  return c.get('requestContext') as RequestContext;
}
