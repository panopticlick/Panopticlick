/**
 * Access log redaction: session ids and fingerprint hashes must never reach logs.
 */

import { describe, expect, it } from 'vitest';
import { maskPath } from '../src/middleware/access-log';

describe('maskPath', () => {
  it('redacts session ids', () => {
    expect(maskPath('/v1/scan/status/ses_m1x2y3z4a5b6c7d8')).toBe('/v1/scan/status/:redacted');
    expect(maskPath('/v1/privacy/export/ses_abc123')).toBe('/v1/privacy/export/:redacted');
  });

  it('redacts fingerprint hashes', () => {
    const hash = 'a'.repeat(64);
    expect(maskPath(`/v1/stats/compare/${hash}`)).toBe('/v1/stats/compare/:redacted');
    expect(maskPath('/v1/stats/compare/0123456789abcdef')).toBe('/v1/stats/compare/:redacted');
  });

  it('leaves ordinary route segments alone', () => {
    expect(maskPath('/v1/scan/start')).toBe('/v1/scan/start');
    expect(maskPath('/v1/defense/bait/analytics')).toBe('/v1/defense/bait/analytics');
    expect(maskPath('/')).toBe('/');
  });

  it('does not redact short hex-looking words', () => {
    // 15 chars: below the 16-char hash threshold, so real words survive
    expect(maskPath('/v1/defense/deadbeefcafedec')).toBe('/v1/defense/deadbeefcafedec');
  });
});
