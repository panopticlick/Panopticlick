/**
 * Access log middleware
 *
 * Replaces hono/logger, which writes the raw path into logs — session ids
 * (`/v1/scan/status/ses_…`) and fingerprint hashes (`/v1/stats/compare/<hash>`)
 * are exactly the identifiers we promise not to retain.
 */

import type { Context, Next } from 'hono';

const SESSION_SEGMENT = /^ses_[a-z0-9]+$/i;
const HEX_SEGMENT = /^[a-f0-9]{16,64}$/i;

export function maskPath(path: string): string {
  return path
    .split('/')
    .map((segment) =>
      SESSION_SEGMENT.test(segment) || HEX_SEGMENT.test(segment) ? ':redacted' : segment
    )
    .join('/');
}

export async function accessLog(c: Context, next: Next) {
  const start = Date.now();
  await next();
  console.log(`${c.req.method} ${maskPath(c.req.path)} ${c.res.status} ${Date.now() - start}ms`);
}
