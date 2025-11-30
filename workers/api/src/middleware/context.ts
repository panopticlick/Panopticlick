/**
 * Request Context Middleware
 * Extracts IP, geo, and network information from Cloudflare headers
 */

import { Context, Next } from 'hono';
import type { RequestContext } from '../types';

/**
 * Generate SHA-256 hash of IP address
 */
async function hashIP(ip: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(ip + 'panopticlick-salt');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Detect if IP is likely a proxy/VPN/datacenter
 */
function detectNetworkType(cf: IncomingRequestCfProperties | undefined): {
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

  // Tor exit nodes typically have specific AS patterns
  const isTor = asOrg.includes('tor') || asOrg.includes('exit');

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
  const ipHash = await hashIP(ip);

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
