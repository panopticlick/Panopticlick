/**
 * API Validation Schema Tests
 */

import { describe, it, expect } from 'vitest';
import {
  ScanStartSchema,
  ScanCollectSchema,
  RTBSimulateSchema,
  DefenseBlockerSchema,
  DefenseTestSchema,
  PrivacyOptOutSchema,
  PrivacyConsentSchema,
  PrivacyMyDataSchema,
  PrivacyExportSchema,
  validateRequest,
} from '../src/schemas/validation';

describe('ScanStartSchema', () => {
  it('should accept empty object', () => {
    const result = ScanStartSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('should accept turnstileToken', () => {
    const result = ScanStartSchema.safeParse({
      turnstileToken: 'test-token-123',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.turnstileToken).toBe('test-token-123');
    }
  });

  it('should reject non-string turnstileToken', () => {
    const result = ScanStartSchema.safeParse({
      turnstileToken: 123,
    });
    expect(result.success).toBe(false);
  });
});

describe('ScanCollectSchema', () => {
  const validPayload = {
    sessionId: 'ses_test123',
    fingerprint: {
      hardware: {
        canvas: { hash: 'abc123' },
        screen: { width: 1920, height: 1080, pixelRatio: 2, colorDepth: 24 },
      },
      software: {
        userAgent: 'Mozilla/5.0',
        platform: 'MacIntel',
        language: 'en-US',
        timezone: 'America/New_York',
        timezoneOffset: -300,
      },
      meta: {
        sessionId: 'ses_test123',
        timestamp: Date.now(),
        sdkVersion: '1.0.0',
      },
    },
    consent: true,
  };

  it('should accept valid payload', () => {
    const result = ScanCollectSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it('should require sessionId', () => {
    const { sessionId, ...rest } = validPayload;
    const result = ScanCollectSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it('should reject empty sessionId', () => {
    const result = ScanCollectSchema.safeParse({
      ...validPayload,
      sessionId: '',
    });
    expect(result.success).toBe(false);
  });

  it('should require fingerprint object', () => {
    const { fingerprint, ...rest } = validPayload;
    const result = ScanCollectSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it('should require fingerprint.hardware', () => {
    const result = ScanCollectSchema.safeParse({
      ...validPayload,
      fingerprint: {
        ...validPayload.fingerprint,
        hardware: undefined,
      },
    });
    expect(result.success).toBe(false);
  });

  it('should require fingerprint.software', () => {
    const result = ScanCollectSchema.safeParse({
      ...validPayload,
      fingerprint: {
        ...validPayload.fingerprint,
        software: undefined,
      },
    });
    expect(result.success).toBe(false);
  });

  it('should require fingerprint.meta', () => {
    const result = ScanCollectSchema.safeParse({
      ...validPayload,
      fingerprint: {
        ...validPayload.fingerprint,
        meta: undefined,
      },
    });
    expect(result.success).toBe(false);
  });

  it('should accept optional consent', () => {
    const { consent, ...rest } = validPayload;
    const result = ScanCollectSchema.safeParse(rest);
    expect(result.success).toBe(true);
  });

  it('should validate consent as boolean', () => {
    const result = ScanCollectSchema.safeParse({
      ...validPayload,
      consent: 'yes',
    });
    expect(result.success).toBe(false);
  });
});

describe('RTBSimulateSchema', () => {
  const validPayload = {
    sessionId: 'ses_test123',
    fingerprint: {
      hardware: { screen: { width: 1920, height: 1080 } },
      software: { userAgent: 'Mozilla/5.0' },
      meta: { timestamp: Date.now() },
    },
  };

  it('should accept valid payload', () => {
    const result = RTBSimulateSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it('should accept optional sessionId', () => {
    const { sessionId, ...rest } = validPayload;
    const result = RTBSimulateSchema.safeParse(rest);
    expect(result.success).toBe(true);
  });

  it('should require fingerprint', () => {
    const { fingerprint, ...rest } = validPayload;
    const result = RTBSimulateSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it('should accept any hardware structure', () => {
    const result = RTBSimulateSchema.safeParse({
      ...validPayload,
      fingerprint: {
        ...validPayload.fingerprint,
        hardware: { custom: 'data' },
      },
    });
    expect(result.success).toBe(true);
  });

  it('should accept any software structure', () => {
    const result = RTBSimulateSchema.safeParse({
      ...validPayload,
      fingerprint: {
        ...validPayload.fingerprint,
        software: { custom: 'data' },
      },
    });
    expect(result.success).toBe(true);
  });
});

describe('DefenseBlockerSchema', () => {
  const validPayload = {
    loadedResources: ['script1.js', 'script2.js'],
    blockedResources: ['tracker.js'],
    testResults: { adBlocker: true, trackerBlocked: true },
  };

  it('should accept valid payload', () => {
    const result = DefenseBlockerSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it('should accept optional sessionId', () => {
    const result = DefenseBlockerSchema.safeParse({
      ...validPayload,
      sessionId: 'ses_test123',
    });
    expect(result.success).toBe(true);
  });

  it('should require loadedResources array', () => {
    const { loadedResources, ...rest } = validPayload;
    const result = DefenseBlockerSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it('should require blockedResources array', () => {
    const { blockedResources, ...rest } = validPayload;
    const result = DefenseBlockerSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it('should require testResults record', () => {
    const { testResults, ...rest } = validPayload;
    const result = DefenseBlockerSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it('should accept empty arrays', () => {
    const result = DefenseBlockerSchema.safeParse({
      loadedResources: [],
      blockedResources: [],
      testResults: {},
    });
    expect(result.success).toBe(true);
  });

  it('should validate testResults as boolean record', () => {
    const result = DefenseBlockerSchema.safeParse({
      ...validPayload,
      testResults: { adBlocker: 'yes' },
    });
    expect(result.success).toBe(false);
  });
});

describe('DefenseTestSchema', () => {
  const validPayload = {
    fingerprint: {
      hardware: { screen: { width: 1920 } },
      software: { userAgent: 'Mozilla/5.0' },
    },
  };

  it('should accept valid payload', () => {
    const result = DefenseTestSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it('should accept optional sessionId', () => {
    const result = DefenseTestSchema.safeParse({
      ...validPayload,
      sessionId: 'ses_test123',
    });
    expect(result.success).toBe(true);
  });

  it('should accept optional blockerResults', () => {
    const result = DefenseTestSchema.safeParse({
      ...validPayload,
      blockerResults: { adBlocker: true },
    });
    expect(result.success).toBe(true);
  });

  it('should require fingerprint', () => {
    const result = DefenseTestSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe('PrivacyOptOutSchema', () => {
  it('should accept sessionIds', () => {
    const result = PrivacyOptOutSchema.safeParse({
      sessionIds: ['ses_123', 'ses_456'],
    });
    expect(result.success).toBe(true);
  });

  it('should accept fingerprintHash', () => {
    const result = PrivacyOptOutSchema.safeParse({
      fingerprintHash: 'abc123def456',
    });
    expect(result.success).toBe(true);
  });

  it('should accept email', () => {
    const result = PrivacyOptOutSchema.safeParse({
      email: 'user@example.com',
    });
    expect(result.success).toBe(true);
  });

  it('should require at least one identifier', () => {
    const result = PrivacyOptOutSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('should require at least one identifier even with reason', () => {
    const result = PrivacyOptOutSchema.safeParse({
      reason: 'Privacy concerns',
    });
    expect(result.success).toBe(false);
  });

  it('should accept optional reason', () => {
    const result = PrivacyOptOutSchema.safeParse({
      sessionIds: ['ses_123'],
      reason: 'Privacy concerns',
    });
    expect(result.success).toBe(true);
  });

  it('should validate email format', () => {
    const result = PrivacyOptOutSchema.safeParse({
      email: 'not-an-email',
    });
    expect(result.success).toBe(false);
  });

  it('should accept multiple identifiers', () => {
    const result = PrivacyOptOutSchema.safeParse({
      sessionIds: ['ses_123'],
      fingerprintHash: 'abc123',
      email: 'user@example.com',
      reason: 'GDPR request',
    });
    expect(result.success).toBe(true);
  });
});

describe('PrivacyConsentSchema', () => {
  it('should accept valid payload', () => {
    const result = PrivacyConsentSchema.safeParse({
      sessionId: 'ses_test123',
      consent: true,
    });
    expect(result.success).toBe(true);
  });

  it('should require sessionId', () => {
    const result = PrivacyConsentSchema.safeParse({
      consent: true,
    });
    expect(result.success).toBe(false);
  });

  it('should reject empty sessionId', () => {
    const result = PrivacyConsentSchema.safeParse({
      sessionId: '',
      consent: true,
    });
    expect(result.success).toBe(false);
  });

  it('should require consent', () => {
    const result = PrivacyConsentSchema.safeParse({
      sessionId: 'ses_test123',
    });
    expect(result.success).toBe(false);
  });

  it('should accept consent false', () => {
    const result = PrivacyConsentSchema.safeParse({
      sessionId: 'ses_test123',
      consent: false,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.consent).toBe(false);
    }
  });

  it('should reject non-boolean consent', () => {
    const result = PrivacyConsentSchema.safeParse({
      sessionId: 'ses_test123',
      consent: 'yes',
    });
    expect(result.success).toBe(false);
  });
});

describe('PrivacyMyDataSchema', () => {
  it('should accept empty object', () => {
    const result = PrivacyMyDataSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('should accept optional ipHash', () => {
    const result = PrivacyMyDataSchema.safeParse({
      ipHash: 'abc123def456',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.ipHash).toBe('abc123def456');
    }
  });
});

describe('PrivacyExportSchema', () => {
  it('should accept valid sessionId', () => {
    const result = PrivacyExportSchema.safeParse({
      sessionId: 'ses_test123',
    });
    expect(result.success).toBe(true);
  });

  it('should require sessionId', () => {
    const result = PrivacyExportSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('should reject empty sessionId', () => {
    const result = PrivacyExportSchema.safeParse({
      sessionId: '',
    });
    expect(result.success).toBe(false);
  });
});

describe('validateRequest helper', () => {
  it('should return success true for valid data', () => {
    const result = validateRequest(ScanStartSchema, { turnstileToken: 'test' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.turnstileToken).toBe('test');
    }
  });

  it('should return success false for invalid data', () => {
    const result = validateRequest(PrivacyConsentSchema, { sessionId: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeDefined();
      expect(typeof result.error).toBe('string');
    }
  });

  it('should format error messages with path', () => {
    const result = validateRequest(ScanCollectSchema, {
      sessionId: '',
      fingerprint: {},
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('sessionId');
    }
  });

  it('should join multiple errors', () => {
    const result = validateRequest(PrivacyConsentSchema, {});
    expect(result.success).toBe(false);
    if (!result.success) {
      // Should contain errors for both missing fields
      expect(result.error.includes(',')).toBe(true);
    }
  });

  it('should work with complex nested schemas', () => {
    const result = validateRequest(ScanCollectSchema, {
      sessionId: 'ses_test123',
      fingerprint: {
        hardware: {
          canvas: { hash: 'abc' },
        },
        software: {
          userAgent: 'Mozilla/5.0',
          platform: 'MacIntel',
          language: 'en-US',
          timezone: 'America/New_York',
          timezoneOffset: -300,
        },
        meta: {
          sessionId: 'ses_test123',
          timestamp: Date.now(),
          sdkVersion: '1.0.0',
        },
      },
    });
    expect(result.success).toBe(true);
  });
});
