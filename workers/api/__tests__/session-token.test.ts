/**
 * Session ownership token behaviour.
 */

import { describe, expect, it } from 'vitest';
import {
  mintSessionToken,
  sessionAuthError,
  verifySessionToken,
} from '../src/services/session-token';

const SECRET = 'test-session-token-secret';
const SESSION = 'ses_abc123';

describe('session tokens', () => {
  it('mints a stable hex HMAC per session', async () => {
    const first = await mintSessionToken(SESSION, SECRET);
    const second = await mintSessionToken(SESSION, SECRET);

    expect(first).toMatch(/^[a-f0-9]{64}$/);
    expect(second).toBe(first);
  });

  it('binds the token to one session id', async () => {
    const token = await mintSessionToken(SESSION, SECRET);

    expect(await verifySessionToken(SESSION, token, SECRET)).toBe(true);
    expect(await verifySessionToken('ses_other', token, SECRET)).toBe(false);
  });

  it('rejects tampered, empty and foreign-secret tokens', async () => {
    const token = await mintSessionToken(SESSION, SECRET);
    const tampered = `${token.slice(0, -1)}${token.endsWith('a') ? 'b' : 'a'}`;

    expect(await verifySessionToken(SESSION, tampered, SECRET)).toBe(false);
    expect(await verifySessionToken(SESSION, '', SECRET)).toBe(false);
    expect(await verifySessionToken(SESSION, undefined, SECRET)).toBe(false);
    expect(await verifySessionToken(SESSION, token, 'another-secret')).toBe(false);
  });

  it('distinguishes an unconfigured deployment from a client mistake', () => {
    const unconfigured = sessionAuthError({ ok: false, reason: 'unconfigured' });
    const missing = sessionAuthError({ ok: false, reason: 'missing' });
    const invalid = sessionAuthError({ ok: false, reason: 'invalid' });

    expect(unconfigured.error.reason).toBe('unconfigured');
    expect(unconfigured.error.message).not.toBe(missing.error.message);
    expect(missing.error.message).not.toBe(invalid.error.message);
    expect(missing.error.message).toContain('X-Session-Token');
  });
});
