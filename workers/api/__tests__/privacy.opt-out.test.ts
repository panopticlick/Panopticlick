/**
 * Opt-out ownership is all-or-nothing: failed proof or a foreign fingerprint
 * must not delete any session before the request is rejected.
 */

import { describe, expect, it } from 'vitest';
import { app } from '../src';
import { mintSessionToken } from '../src/services/session-token';
import { createMockD1, createMockEnv } from './helpers/mock-env';

const SECRET = 'test-session-token-secret';

describe('POST /v1/privacy/opt-out', () => {
  it('rejects a foreign fingerprint before deleting the owned session', async () => {
    const sessionId = 'ses_owned';
    const token = await mintSessionToken(sessionId, SECRET);
    const db = createMockD1([
      [/SELECT fingerprint_hash FROM sessions WHERE id = \?/, { first: { fingerprint_hash: 'owned-hash' } }],
    ]);
    const { env } = createMockEnv({ db, SESSION_TOKEN_SECRET: SECRET });

    const response = await app.request(
      '/v1/privacy/opt-out',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Origin: 'https://panopticlick.org',
          'CF-Connecting-IP': '203.0.113.10',
        },
        body: JSON.stringify({
          sessions: [{ id: sessionId, token }],
          fingerprintHash: 'foreign-hash',
        }),
      },
      env
    );

    expect(response.status).toBe(403);
    expect(db.sqlLog()).toContain('SELECT fingerprint_hash FROM sessions WHERE id = ?');
    expect(db.sqlLog().some((sql) => sql.startsWith('DELETE '))).toBe(false);
  });

  it('rejects the whole request when any submitted token is invalid', async () => {
    const firstId = 'ses_first';
    const firstToken = await mintSessionToken(firstId, SECRET);
    const db = createMockD1();
    const { env } = createMockEnv({ db, SESSION_TOKEN_SECRET: SECRET });

    const response = await app.request(
      '/v1/privacy/opt-out',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Origin: 'https://panopticlick.org',
          'CF-Connecting-IP': '203.0.113.10',
        },
        body: JSON.stringify({
          sessions: [
            { id: firstId, token: firstToken },
            { id: 'ses_second', token: 'not-a-valid-token' },
          ],
        }),
      },
      env
    );

    expect(response.status).toBe(401);
    expect(db.calls).toHaveLength(0);
  });

  it('does not delete other sessions that share the same fingerprint hash', async () => {
    const sessionId = 'ses_owned';
    const token = await mintSessionToken(sessionId, SECRET);
    const db = createMockD1([
      [/SELECT fingerprint_hash FROM sessions WHERE id = \?/, { first: { fingerprint_hash: 'shared-hash' } }],
      [/DELETE FROM sessions WHERE id = \?/, { changes: 1 }],
      [/SELECT COUNT\(\*\) AS count FROM sessions WHERE fingerprint_hash = \?/, { first: { count: 1 } }],
    ]);
    const { env } = createMockEnv({ db, SESSION_TOKEN_SECRET: SECRET });

    const response = await app.request(
      '/v1/privacy/opt-out',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Origin: 'https://panopticlick.org',
          'CF-Connecting-IP': '203.0.113.10',
        },
        body: JSON.stringify({
          sessions: [{ id: sessionId, token }],
          fingerprintHash: 'shared-hash',
        }),
      },
      env
    );

    expect(response.status).toBe(200);
    expect(
      db.calls.filter((call) => call.sql === 'DELETE FROM sessions WHERE id = ?')
    ).toHaveLength(1);
    expect(
      db.sqlLog().some((sql) => sql === 'DELETE FROM sessions WHERE fingerprint_hash = ?')
    ).toBe(false);
    expect(
      db.sqlLog().some((sql) => sql === 'DELETE FROM fingerprints WHERE hash = ?')
    ).toBe(false);
  });
});
