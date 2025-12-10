/**
 * Zod Validation Schemas for API Endpoints
 */

import { z } from 'zod';

/**
 * Scan Endpoints
 */

// POST /v1/scan/start
export const ScanStartSchema = z.object({
  turnstileToken: z.string().optional(),
});

// POST /v1/scan/collect
export const ScanCollectSchema = z.object({
  sessionId: z.string().min(1, 'Session ID is required'),
  fingerprint: z.object({
    hardware: z.object({
      canvas: z.object({
        hash: z.string(),
        blocked: z.boolean().optional(),
        spoofed: z.boolean().optional(),
      }).optional(),
      webgl: z.object({
        vendor: z.string().optional(),
        renderer: z.string().optional(),
        hash: z.string(),
        blocked: z.boolean().optional(),
      }).optional(),
      audio: z.object({
        hash: z.string(),
        sampleRate: z.number().optional(),
        blocked: z.boolean().optional(),
      }).optional(),
      screen: z.object({
        width: z.number(),
        height: z.number(),
        pixelRatio: z.number(),
        colorDepth: z.number(),
        orientation: z.string().optional(),
      }).optional(),
    }),
    software: z.object({
      userAgent: z.string(),
      platform: z.string(),
      language: z.string(),
      languages: z.array(z.string()).optional(),
      timezone: z.string(),
      timezoneOffset: z.number(),
      plugins: z.array(z.string()).optional(),
      fonts: z.array(z.string()).optional(),
    }),
    capabilities: z.object({
      cookieEnabled: z.boolean().optional(),
      doNotTrack: z.string().nullable().optional(),
      webgl: z.boolean().optional(),
      webrtc: z.boolean().optional(),
      canvas: z.boolean().optional(),
    }).optional(),
    network: z.object({
      ipHash: z.string().optional(),
      asn: z.number().optional(),
      country: z.string().optional(),
    }).optional(),
    meta: z.object({
      sessionId: z.string(),
      timestamp: z.number(),
      sdkVersion: z.string(),
    }),
  }),
  consent: z.boolean().optional(),
});

/**
 * RTB Endpoints
 */

// POST /v1/rtb/simulate
export const RTBSimulateSchema = z.object({
  sessionId: z.string().min(1).optional(),
  fingerprint: z.object({
    hardware: z.any(),
    software: z.any(),
    capabilities: z.any().optional(),
    network: z.any().optional(),
    meta: z.any(),
  }),
});

/**
 * Defense Endpoints
 */

// POST /v1/defense/blocker
export const DefenseBlockerSchema = z.object({
  sessionId: z.string().min(1).optional(),
  loadedResources: z.array(z.string()),
  blockedResources: z.array(z.string()),
  testResults: z.record(z.string(), z.boolean()),
});

// POST /v1/defense/test
export const DefenseTestSchema = z.object({
  sessionId: z.string().min(1).optional(),
  fingerprint: z.object({
    hardware: z.any(),
    software: z.any(),
    capabilities: z.any().optional(),
    network: z.any().optional(),
  }),
  blockerResults: z.any().optional(),
});

/**
 * Privacy Endpoints
 */

// POST /v1/privacy/opt-out
export const PrivacyOptOutSchema = z.object({
  sessionIds: z.array(z.string()).optional(),
  fingerprintHash: z.string().optional(),
  email: z.string().email().optional(),
  reason: z.string().optional(),
}).refine(
  (data) => data.sessionIds || data.fingerprintHash || data.email,
  { message: 'At least one of sessionIds, fingerprintHash, or email is required' }
);

// POST /v1/privacy/consent
export const PrivacyConsentSchema = z.object({
  sessionId: z.string().min(1, 'Session ID is required'),
  consent: z.boolean(),
});

// GET /v1/privacy/my-data (query params)
export const PrivacyMyDataSchema = z.object({
  ipHash: z.string().optional(),
});

// POST /v1/privacy/export/:sessionId (path param)
export const PrivacyExportSchema = z.object({
  sessionId: z.string().min(1, 'Session ID is required'),
});

/**
 * Validation Helper
 */
export function validateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  // Format Zod errors into a readable message
  const errorMessages = result.error.issues.map(
    (err: z.ZodIssue) => `${err.path.join('.')}: ${err.message}`
  );

  return {
    success: false,
    error: errorMessages.join(', '),
  };
}
