import { describe, expect, it } from 'vitest';
import { app } from '../src';
import { mintSessionToken } from '../src/services/session-token';
import { createMockD1, createMockEnv } from './helpers/mock-env';

const SECRET = 'test-session-token-secret';
const SESSION_ID = 'ses_owned';

async function ownedHeaders() {
  return {
    Origin: 'https://panopticlick.org',
    'CF-Connecting-IP': '203.0.113.10',
    'X-Session-Token': await mintSessionToken(SESSION_ID, SECRET),
  };
}

describe('session-scoped routes', () => {
  it('protects scan status and returns only the owned session status', async () => {
    const db = createMockD1([
      [
        /SELECT id, created_at, consent_given FROM sessions WHERE id = \?/,
        {
          first: {
            id: SESSION_ID,
            created_at: '2026-07-28T00:00:00Z',
            consent_given: 1,
          },
        },
      ],
    ]);
    const { env } = createMockEnv({ db, SESSION_TOKEN_SECRET: SECRET });

    const unauthorized = await app.request(
      `/v1/scan/status/${SESSION_ID}`,
      { headers: { Origin: 'https://panopticlick.org' } },
      env
    );
    const authorized = await app.request(
      `/v1/scan/status/${SESSION_ID}`,
      { headers: await ownedHeaders() },
      env
    );

    expect(unauthorized.status).toBe(401);
    expect(authorized.status).toBe(200);
    await expect(authorized.json()).resolves.toMatchObject({
      exists: true,
      consentGiven: 1,
    });
  });

  it('exports an owned session and rejects the same request without its token', async () => {
    const db = createMockD1([
      [
        /SELECT id, fingerprint_hash, entropy_bits, country, created_at FROM sessions WHERE id = \?/,
        {
          first: {
            id: SESSION_ID,
            fingerprint_hash: 'hash-owned',
            entropy_bits: 24,
            country: 'US',
            created_at: '2026-07-28T00:00:00Z',
          },
        },
      ],
      [/SELECT \* FROM fingerprints WHERE hash = \?/, { first: { hash: 'hash-owned' } }],
    ]);
    const { env } = createMockEnv({ db, SESSION_TOKEN_SECRET: SECRET });

    const unauthorized = await app.request(
      `/v1/privacy/export/${SESSION_ID}`,
      { method: 'POST', headers: { Origin: 'https://panopticlick.org' } },
      env
    );
    const authorized = await app.request(
      `/v1/privacy/export/${SESSION_ID}`,
      { method: 'POST', headers: await ownedHeaders() },
      env
    );

    expect(unauthorized.status).toBe(401);
    expect(authorized.status).toBe(200);
    const body = (await authorized.json()) as { exportUrl: string };
    expect(body.exportUrl).toMatch(/^data:application\/json,/);
  });

  it('withdraws consent only after ownership proof and deletes the session', async () => {
    const db = createMockD1([
      [/UPDATE sessions SET consent_given = \? WHERE id = \?/, { changes: 1 }],
      [/DELETE FROM sessions WHERE id = \? AND consent_given = 0/, { changes: 1 }],
    ]);
    const { env } = createMockEnv({ db, SESSION_TOKEN_SECRET: SECRET });

    const response = await app.request(
      '/v1/privacy/consent',
      {
        method: 'POST',
        headers: {
          ...(await ownedHeaders()),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId: SESSION_ID, consent: false }),
      },
      env
    );

    expect(response.status).toBe(200);
    expect(db.sqlLog()).toEqual([
      'UPDATE sessions SET consent_given = ? WHERE id = ?',
      'DELETE FROM sessions WHERE id = ? AND consent_given = 0',
    ]);
  });
});
