import { Hono } from 'hono';
import { describe, expect, it, vi } from 'vitest';
import { contextMiddleware } from '../src/middleware/context';
import { rateLimit } from '../src/middleware/ratelimit';
import type { Env } from '../src/types';

function limitedApp() {
  const app = new Hono<{ Bindings: Env }>();
  app.use('*', contextMiddleware);
  app.use('*', rateLimit('RATE_LIMITER'));
  app.get('/probe', (c) => c.json({ ok: true }));
  return app;
}

describe('rateLimit', () => {
  it('passes only the salted IP hash to the binding', async () => {
    const limit = vi.fn().mockResolvedValue({ success: true });
    const response = await limitedApp().request(
      '/probe',
      { headers: { 'CF-Connecting-IP': '203.0.113.8' } },
      {
        IP_HASH_SALT: 'test-salt',
        RATE_LIMITER: { limit },
      } as unknown as Env
    );

    expect(response.status).toBe(200);
    const key = limit.mock.calls[0]?.[0]?.key;
    expect(key).toMatch(/^[a-f0-9]{64}$/);
    expect(key).not.toContain('203.0.113.8');
  });

  it('returns the Worker error envelope and Retry-After when exhausted', async () => {
    const response = await limitedApp().request(
      '/probe',
      { headers: { 'CF-Connecting-IP': '203.0.113.8' } },
      {
        IP_HASH_SALT: 'test-salt',
        RATE_LIMITER: { limit: vi.fn().mockResolvedValue({ success: false }) },
      } as unknown as Env
    );

    expect(response.status).toBe(429);
    expect(response.headers.get('Retry-After')).toBe('60');
    await expect(response.json()).resolves.toMatchObject({
      success: false,
      error: {
        code: 'RATE_LIMITED',
      },
    });
  });
});
