/**
 * CORS Middleware
 */

import { Context, Next } from 'hono';

function getAllowedOrigins(env: { ALLOWED_ORIGINS?: string }) {
  if (env.ALLOWED_ORIGINS) {
    return env.ALLOWED_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean);
  }
  return [
    'https://panopticlick.org',
    'https://www.panopticlick.org',
    'http://localhost:3000',
    'http://localhost:8787',
  ];
}

export async function corsMiddleware(c: Context, next: Next) {
  const ALLOWED_ORIGINS = getAllowedOrigins(c.env as { ALLOWED_ORIGINS?: string });
  const origin = c.req.header('origin');

  // Check if origin is allowed
  // Use strict regex to prevent bypasses like "evil.panopticlick.org" or "evilpanopticlick.org"
  const isValidSubdomain = origin && /^https:\/\/[a-z0-9-]+\.panopticlick\.org$/.test(origin);
  const isAllowed = origin && (
    ALLOWED_ORIGINS.includes(origin) ||
    isValidSubdomain
  );

  // Handle preflight
  if (c.req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': isAllowed ? origin : ALLOWED_ORIGINS[0],
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Session-ID',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  // Continue to handler
  await next();

  // Add CORS headers to response
  if (isAllowed && origin) {
    c.res.headers.set('Access-Control-Allow-Origin', origin);
    c.res.headers.set('Access-Control-Allow-Credentials', 'true');
  }
}
