/**
 * Panopticlick API Worker
 * Main entry point for the Cloudflare Worker API
 */

import { Hono } from 'hono';
import { timing } from 'hono/timing';
import { secureHeaders } from 'hono/secure-headers';

import type { Env } from './types';
import { corsMiddleware, contextMiddleware, rateLimit, accessLog } from './middleware';
import { scan, rtb, defense, stats, privacy, ai } from './routes';
import { runRetention } from './services/retention';

// Create main app
const app = new Hono<{ Bindings: Env }>();

// Global middleware
app.use('*', timing());
app.use('*', accessLog);
app.use('*', secureHeaders());
app.use('*', corsMiddleware);
app.use('*', contextMiddleware);

// Rate limiting must run after contextMiddleware: the limiter keys on the
// hashed IP, which only exists once the context is built.
app.use('/v1/*', rateLimit('RATE_LIMITER'));
app.use('/v1/ai/*', rateLimit('AI_RATE_LIMITER'));

// Health check
app.get('/', (c) => {
  return c.json({
    name: 'Panopticlick API',
    version: c.env.API_VERSION,
    environment: c.env.ENVIRONMENT,
    status: 'healthy',
    timestamp: Date.now(),
  });
});

app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: Date.now() });
});

// Mount route handlers
app.route('/v1/scan', scan);
app.route('/v1/rtb', rtb);
app.route('/v1/defense', defense);
app.route('/v1/stats', stats);
app.route('/v1/privacy', privacy);
app.route('/v1/ai', ai);

// Legacy routes (redirect to v1)
app.all('/scan/*', (c) => {
  const path = c.req.path.replace('/scan', '/v1/scan');
  return c.redirect(path, 301);
});

// 404 handler
app.notFound((c) => {
  return c.json(
    {
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'The requested endpoint does not exist',
        path: c.req.path,
      },
    },
    404
  );
});

// Error handler
app.onError((err, c) => {
  console.error('API Error:', err);

  // Don't expose internal errors in production
  const isProduction = c.env.ENVIRONMENT === 'production';
  const message = isProduction
    ? 'An internal error occurred'
    : err.message;

  return c.json(
    {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message,
        ...(isProduction ? {} : { stack: err.stack }),
      },
    },
    500
  );
});

/**
 * Cron handler — retention enforcement.
 * Scheduled by [env.production.triggers] in wrangler.toml.
 */
export async function scheduled(
  _controller: ScheduledController,
  env: Env,
  _ctx: ExecutionContext
): Promise<void> {
  const deleted = await runRetention(env.DB);
  console.log(`[retention] deleted ${JSON.stringify(deleted)}`);
}

// Export for Cloudflare Workers
export default {
  fetch: app.fetch,
  scheduled,
};

// Also export for testing
export { app };
