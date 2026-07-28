/**
 * CORS policy: no header echo for disallowed origins, no credentials, and no
 * localhost in a production allowlist.
 */

import { Hono } from 'hono';
import { describe, expect, it } from 'vitest';
import { corsMiddleware } from '../src/middleware/cors';

function appWithEnv() {
  const app = new Hono();
  app.use('*', corsMiddleware);
  app.get('/probe', (c) => c.json({ ok: true }));
  return app;
}

const PROD_ENV = { ENVIRONMENT: 'production', ALLOWED_ORIGINS: 'https://panopticlick.org' };

describe('corsMiddleware', () => {
  it('echoes an allowed origin and never allows credentials', async () => {
    const res = await appWithEnv().request(
      '/probe',
      { headers: { Origin: 'https://panopticlick.org' } },
      PROD_ENV
    );

    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('https://panopticlick.org');
    expect(res.headers.get('Access-Control-Allow-Credentials')).toBeNull();
    expect(res.headers.get('Vary')).toBe('Origin');
  });

  it('sends no Access-Control headers for a disallowed origin', async () => {
    const res = await appWithEnv().request(
      '/probe',
      { headers: { Origin: 'https://evil.example' } },
      PROD_ENV
    );

    expect(res.status).toBe(200);
    expect(res.headers.get('Access-Control-Allow-Origin')).toBeNull();
    expect(res.headers.get('Vary')).toBe('Origin');
  });

  it('answers a disallowed preflight with 204 and no allowlist leak', async () => {
    const res = await appWithEnv().request(
      '/probe',
      { method: 'OPTIONS', headers: { Origin: 'https://evil.example' } },
      PROD_ENV
    );

    expect(res.status).toBe(204);
    expect(res.headers.get('Access-Control-Allow-Origin')).toBeNull();
    expect(res.headers.get('Access-Control-Allow-Methods')).toBeNull();
    expect(res.headers.get('Access-Control-Allow-Headers')).toBeNull();
  });

  it('advertises X-Session-Token on an allowed preflight', async () => {
    const res = await appWithEnv().request(
      '/probe',
      { method: 'OPTIONS', headers: { Origin: 'https://panopticlick.org' } },
      PROD_ENV
    );

    expect(res.status).toBe(204);
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('https://panopticlick.org');
    expect(res.headers.get('Access-Control-Allow-Headers')).toContain('X-Session-Token');
    expect(res.headers.get('Access-Control-Allow-Credentials')).toBeNull();
  });

  it('accepts panopticlick.org subdomains but not lookalikes', async () => {
    const app = appWithEnv();

    const subdomain = await app.request(
      '/probe',
      { headers: { Origin: 'https://staging.panopticlick.org' } },
      PROD_ENV
    );
    const lookalike = await app.request(
      '/probe',
      { headers: { Origin: 'https://evilpanopticlick.org' } },
      PROD_ENV
    );

    expect(subdomain.headers.get('Access-Control-Allow-Origin')).toBe(
      'https://staging.panopticlick.org'
    );
    expect(lookalike.headers.get('Access-Control-Allow-Origin')).toBeNull();
  });

  it('keeps localhost out of the fallback allowlist in production', async () => {
    const app = appWithEnv();

    const inProduction = await app.request(
      '/probe',
      { headers: { Origin: 'http://localhost:3000' } },
      { ENVIRONMENT: 'production' }
    );
    const inDevelopment = await app.request(
      '/probe',
      { headers: { Origin: 'http://localhost:3000' } },
      { ENVIRONMENT: 'development' }
    );

    expect(inProduction.headers.get('Access-Control-Allow-Origin')).toBeNull();
    expect(inDevelopment.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:3000');
  });
});
