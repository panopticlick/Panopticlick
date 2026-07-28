/**
 * Session ownership tokens
 *
 * Stateless proof that the caller is the client that started a scan session.
 * The token is an HMAC-SHA256 of the session id under SESSION_TOKEN_SECRET, so
 * no schema or KV state is needed: whoever received the token at /scan/start is
 * the only party able to read, export or delete that session's data.
 */

import type { Context } from 'hono';

const encoder = new TextEncoder();

async function importKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
}

async function hmacHex(secret: string, message: string): Promise<string> {
  const key = await importKey(secret);
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(message));
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Mint a token for a session id.
 */
export async function mintSessionToken(sessionId: string, secret: string): Promise<string> {
  return hmacHex(secret, sessionId);
}

/**
 * Verify a token against a session id. Comparison is constant time: both sides
 * are re-HMAC'd under a random per-call key so a mismatch leaks no prefix info.
 */
export async function verifySessionToken(
  sessionId: string,
  token: string | undefined | null,
  secret: string
): Promise<boolean> {
  if (!token) return false;

  const expected = await hmacHex(secret, sessionId);
  const blindKey = crypto.randomUUID();
  const [a, b] = await Promise.all([
    hmacHex(blindKey, expected),
    hmacHex(blindKey, token),
  ]);
  return a === b;
}

/**
 * Read the caller-supplied token: `X-Session-Token` header, or a `token` field
 * in an already-parsed request body.
 */
export function readSessionToken(c: Context, bodyToken?: string | null): string | undefined {
  return c.req.header('x-session-token') || bodyToken || undefined;
}

export type SessionAuthFailure =
  | { ok: false; reason: 'missing' }
  | { ok: false; reason: 'invalid' }
  | { ok: false; reason: 'unconfigured' };

export type SessionAuthResult = { ok: true } | SessionAuthFailure;

let warnedMissingSecret = false;

/**
 * Authorize a request against a session id. Fails closed: without a configured
 * secret nothing can be proven, so protected endpoints refuse.
 */
export async function authorizeSession(
  c: Context,
  sessionId: string,
  bodyToken?: string | null
): Promise<SessionAuthResult> {
  const secret = (c.env as { SESSION_TOKEN_SECRET?: string }).SESSION_TOKEN_SECRET;
  if (!secret) {
    if (!warnedMissingSecret) {
      warnedMissingSecret = true;
      console.warn('[session-token] SESSION_TOKEN_SECRET is not configured; session-scoped endpoints refuse all requests');
    }
    return { ok: false, reason: 'unconfigured' };
  }

  const token = readSessionToken(c, bodyToken);
  if (!token) return { ok: false, reason: 'missing' };

  return (await verifySessionToken(sessionId, token, secret))
    ? { ok: true }
    : { ok: false, reason: 'invalid' };
}

const AUTH_MESSAGES: Record<SessionAuthFailure['reason'], string> = {
  // Distinct wording so an operator reading a 401 can tell a client mistake
  // from a missing SESSION_TOKEN_SECRET on the worker.
  missing: 'This endpoint requires the X-Session-Token issued by /v1/scan/start',
  invalid: 'The supplied session token does not match this session',
  unconfigured: 'Session ownership cannot be verified on this deployment',
};

/**
 * Response body for a failed session authorization (always HTTP 401).
 */
export function sessionAuthError(failure: SessionAuthFailure) {
  return {
    success: false as const,
    error: {
      code: 'UNAUTHORIZED' as const,
      reason: failure.reason,
      message: AUTH_MESSAGES[failure.reason],
    },
  };
}
