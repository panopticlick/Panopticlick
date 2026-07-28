import { describe, expect, it } from 'vitest';
import { app } from '../src';
import { mintSessionToken } from '../src/services/session-token';
import { createMockD1, createMockEnv } from './helpers/mock-env';

const SECRET = 'test-session-token-secret';

describe('GET /v1/privacy/my-data', () => {
  it('returns aggregate counts when no session is named', async () => {
    const db = createMockD1([
      [/SELECT COUNT\(\*\) AS session_count/, {
        first: { session_count: 2, fingerprint_count: 1 },
      }],
    ]);
    const { env } = createMockEnv({ db });

    const response = await app.request(
      '/v1/privacy/my-data',
      {
        headers: {
          Origin: 'https://panopticlick.org',
          'CF-Connecting-IP': '203.0.113.10',
        },
      },
      env
    );

    expect(response.status).toBe(200);
    const body = await response.json<{
      data: { sessionCount: number; fingerprintCount: number };
    }>();
    expect(body.data).toMatchObject({ sessionCount: 2, fingerprintCount: 1 });
  });

  it('requires the session token for a detailed response', async () => {
    const db = createMockD1();
    const { env } = createMockEnv({ db, SESSION_TOKEN_SECRET: SECRET });

    const response = await app.request(
      '/v1/privacy/my-data?sessionId=ses_owned&fingerprintHash=owned-hash',
      {
        headers: {
          Origin: 'https://panopticlick.org',
          'CF-Connecting-IP': '203.0.113.10',
        },
      },
      env
    );

    expect(response.status).toBe(401);
    expect(db.calls).toHaveLength(0);
  });

  it('returns only the session whose ownership was proven', async () => {
    const sessionId = 'ses_owned';
    const token = await mintSessionToken(sessionId, SECRET);
    const session = {
      id: sessionId,
      fingerprint_hash: 'shared-hash',
      entropy_bits: 24,
      country: 'US',
      created_at: '2026-07-28T00:00:00Z',
      consent_given: 1,
    };
    const db = createMockD1([
      [/FROM sessions WHERE id = \? AND fingerprint_hash = \?/, { first: session }],
      [/FROM fingerprints WHERE hash = \?/, {
        all: [{ hash: 'shared-hash', entropy_bits: 24 }],
      }],
    ]);
    const { env } = createMockEnv({ db, SESSION_TOKEN_SECRET: SECRET });

    const response = await app.request(
      `/v1/privacy/my-data?sessionId=${sessionId}&fingerprintHash=shared-hash`,
      {
        headers: {
          Origin: 'https://panopticlick.org',
          'CF-Connecting-IP': '203.0.113.10',
          'X-Session-Token': token,
        },
      },
      env
    );

    expect(response.status).toBe(200);
    const body = await response.json<{
      data: { sessions: Array<{ id: string }>; fingerprints: unknown[] };
    }>();
    expect(body.data.sessions).toEqual([session]);
    expect(body.data.fingerprints).toHaveLength(1);
    expect(db.sqlLog().some((sql) => sql.includes('WHERE ip_hash ='))).toBe(false);
  });
});
