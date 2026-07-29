/**
 * Rate limiting middleware
 *
 * Backed by the Workers Rate Limiting bindings declared in wrangler.toml
 * (`ratelimits`) — no KV writes or Durable Objects.
 */

import type { Context, Next } from 'hono';
import type { Env, RateLimitBinding } from '../types';
import { getRequestContext } from './context';

type LimiterName = 'RATE_LIMITER' | 'AI_RATE_LIMITER';

const warnedMissingBinding = new Set<LimiterName>();

export function rateLimit(bindingName: LimiterName) {
  return async function rateLimitMiddleware(c: Context<{ Bindings: Env }>, next: Next) {
    const limiter = c.env[bindingName] as RateLimitBinding | undefined;

    if (!limiter) {
      if (!warnedMissingBinding.has(bindingName)) {
        warnedMissingBinding.add(bindingName);
        console.warn(`[ratelimit] ${bindingName} binding is not configured; requests are not limited`);
      }
      return next();
    }

    // Key on the hashed IP: the raw address never leaves the request context.
    const key = getRequestContext(c)?.ipHash || 'unknown';
    const { success } = await limiter.limit({ key });

    if (!success) {
      return c.json(
        {
          success: false,
          error: {
            code: 'RATE_LIMITED',
            message: 'Too many requests. Please try again in a minute.',
          },
        },
        429,
        { 'Retry-After': '60' }
      );
    }

    return next();
  };
}
