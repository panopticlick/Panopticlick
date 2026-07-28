/**
 * CORS Middleware
 */

import { Context, Next } from 'hono';

interface CorsEnv {
  ALLOWED_ORIGINS?: string;
  ENVIRONMENT?: string;
}

function getAllowedOrigins(env: CorsEnv) {
  if (env.ALLOWED_ORIGINS) {
    return env.ALLOWED_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean);
  }

  const origins = ['https://panopticlick.org', 'https://www.panopticlick.org'];

  // Localhost is a development affordance only — never part of a production
  // allowlist, even if ALLOWED_ORIGINS is accidentally left unset.
  if (env.ENVIRONMENT !== 'production') {
    origins.push('http://localhost:3000', 'http://localhost:8787');
  }

  return origins;
}

export async function corsMiddleware(c: Context, next: Next) {
  const ALLOWED_ORIGINS = getAllowedOrigins(c.env as CorsEnv);
  const origin = c.req.header('origin');

  // Production is an explicit allowlist. Do not implicitly trust every future
  // subdomain: an abandoned preview/custom hostname could otherwise call the
  // paid AI proxy as a first-party origin.
  const isAllowed = Boolean(origin && ALLOWED_ORIGINS.includes(origin));

  // Handle preflight
  if (c.req.method === 'OPTIONS') {
    // A disallowed origin gets no Access-Control-* headers at all. Echoing the
    // first allowlist entry (the previous behaviour) told the caller nothing
    // useful and made the response look permissive to log readers.
    const headers: Record<string, string> = { Vary: 'Origin' };

    if (isAllowed && origin) {
      headers['Access-Control-Allow-Origin'] = origin;
      headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS';
      headers['Access-Control-Allow-Headers'] =
        'Content-Type, Authorization, X-Session-ID, X-Session-Token';
      headers['Access-Control-Max-Age'] = '86400';
    }

    return new Response(null, { status: 204, headers });
  }

  // Continue to handler
  await next();

  // Add CORS headers to response. No Allow-Credentials: the API is cookieless
  // and session ownership travels in the X-Session-Token header.
  c.res.headers.set('Vary', 'Origin');
  if (isAllowed && origin) {
    c.res.headers.set('Access-Control-Allow-Origin', origin);
  }
}
