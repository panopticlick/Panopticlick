/**
 * Scan Routes
 * Handles fingerprint collection and analysis
 */

import { Hono } from 'hono';
import type { Env } from '../types';
import { getRequestContext } from '../middleware/context';
import { ScanStartSchema, ScanCollectSchema, validateRequest } from '../schemas/validation';
import type {
  FingerprintPayload,
  ScanStartResponse,
  ScanCollectRequest,
  ScanCollectResponse,
  NetworkIntelligence,
} from '@panopticlick/types';

const scan = new Hono<{ Bindings: Env }>();

/**
 * POST /scan/start
 * Initialize a new scan session
 */
scan.post('/start', async (c) => {
  const ctx = getRequestContext(c);

  // Optional Turnstile verification when secret is configured
  const secret = c.env.TURNSTILE_SECRET;
  if (secret) {
    try {
      const body = await c.req.json();
      const validation = validateRequest(ScanStartSchema, body);

      if (!validation.success) {
        return c.json({ success: false, error: validation.error }, 400);
      }

      const { turnstileToken } = validation.data;
      if (!turnstileToken) {
        return c.json({ success: false, error: 'TURNSTILE_REQUIRED' }, 400);
      }

      const verify = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          secret,
          response: turnstileToken,
          remoteip: ctx.ip,
        }),
      }).then((r) => r.json<{ success: boolean }>());

      if (!verify.success) {
        return c.json({ success: false, error: 'TURNSTILE_FAILED' }, 403);
      }
    } catch (err) {
      console.error('Turnstile verify failed', err);
      return c.json({ success: false, error: 'TURNSTILE_ERROR' }, 500);
    }
  }

  // Generate session ID
  const sessionId = generateSessionId();

  // Build network intelligence from request context
  const network: NetworkIntelligence = {
    ipHash: ctx.ipHash,
    asn: ctx.asn,
    asnOrg: ctx.asnOrg,
    country: ctx.country,
    countryCode: ctx.country,
    region: '',
    city: ctx.city,
    isProxy: ctx.isProxy,
    isVPN: ctx.isVPN,
    isTor: ctx.isTor,
    isDatacenter: ctx.isDatacenter,
    riskScore: calculateRiskScore(ctx),
  };

  const response: ScanStartResponse = {
    success: true,
    sessionId,
    network,
    timestamp: Date.now(),
  };

  // Log to analytics
  c.env.ANALYTICS.writeDataPoint({
    blobs: [sessionId, ctx.country, ctx.asn],
    doubles: [1], // scan_started
    indexes: ['scan_start'],
  });

  return c.json(response);
});

/**
 * POST /scan/collect
 * Receive fingerprint data and generate report
 */
scan.post('/collect', async (c) => {
  const ctx = getRequestContext(c);

  try {
    const body = await c.req.json();
    const validation = validateRequest(ScanCollectSchema, body);

    if (!validation.success) {
      return c.json({ success: false, error: validation.error }, 400);
    }

    const { sessionId, fingerprint, consent } = validation.data;

    // Import valuation engine (dynamic import for Workers)
    const { generateValuationReport } = await import(
      '@panopticlick/valuation-engine'
    );
    const { generateHashes } = await import(
      '@panopticlick/fingerprint-sdk'
    );

    // Generate hashes
    const hashes = await generateHashes(fingerprint as unknown as FingerprintPayload);

    // Generate full report
    const report = generateValuationReport(fingerprint as unknown as FingerprintPayload, {
      vpnDetected: ctx.isVPN,
      torDetected: ctx.isTor,
    });

    // Store session if consent given
    if (consent) {
      await storeSession(c.env.DB, {
        sessionId,
        fingerprintHash: hashes.fullHash,
        hardwareHash: hashes.hardwareHash,
        softwareHash: hashes.softwareHash,
        entropyBits: report.entropy.totalBits,
        ipHash: ctx.ipHash,
        country: ctx.country,
        asn: ctx.asn,
        isProxy: ctx.isProxy,
        isVPN: ctx.isVPN,
      });

      // Update fingerprint stats
      await updateFingerprintStats(c.env.DB, {
        hash: hashes.fullHash,
        hardwareHash: hashes.hardwareHash,
        softwareHash: hashes.softwareHash,
        entropyBits: report.entropy.totalBits,
      });

      // Store detailed fingerprint analysis (new table)
      const analysisId = crypto.randomUUID();
      const entropyComponents = (report.entropy as any).components || [];
      await c.env.DB.prepare(`
        INSERT INTO fingerprint_analyses
        (id, session_id, fingerprint_hash, total_entropy, tier, signals_collected)
        VALUES (?, ?, ?, ?, ?, ?)
      `)
        .bind(
          analysisId,
          sessionId,
          hashes.fullHash,
          report.entropy.totalBits,
          report.entropy.tier,
          entropyComponents.length
        )
        .run();

      // Store signal-level entropy breakdown (new table)
      if (entropyComponents.length > 0) {
        for (const component of entropyComponents) {
          await c.env.DB.prepare(`
            INSERT INTO signal_entropy
            (analysis_id, signal_name, entropy_bits, rarity)
            VALUES (?, ?, ?, ?)
          `)
            .bind(analysisId, component.name, component.bits, component.rarity || 'common')
            .run();
        }
      }

      // Update signal frequencies for dynamic entropy (new table)
      await updateSignalFrequencies(c.env.DB, fingerprint as unknown as FingerprintPayload);
    }

    // Log to analytics
    c.env.ANALYTICS.writeDataPoint({
      blobs: [sessionId, ctx.country, report.entropy.tier],
      doubles: [report.entropy.totalBits, report.valuation.averageCPM],
      indexes: ['scan_complete'],
    });

    const response: ScanCollectResponse = {
      success: true,
      report,
      hashes: {
        full: hashes.fullHash,
        hardware: hashes.hardwareHash,
        software: hashes.softwareHash,
      },
    };

    return c.json(response);
  } catch (error) {
    console.error('Collect error:', error);
    return c.json(
      { success: false, error: 'Failed to process fingerprint' },
      500
    );
  }
});

/**
 * GET /scan/status/:sessionId
 * Check scan session status
 */
scan.get('/status/:sessionId', async (c) => {
  const sessionId = c.req.param('sessionId');

  // Check if session exists in DB
  const result = await c.env.DB.prepare(
    'SELECT id, created_at, consent_given FROM sessions WHERE id = ?'
  )
    .bind(sessionId)
    .first();

  if (!result) {
    return c.json({ exists: false });
  }

  return c.json({
    exists: true,
    createdAt: result.created_at,
    consentGiven: result.consent_given,
  });
});

// Helper functions

function generateSessionId(): string {
  const timestamp = Date.now().toString(36);
  const randomBytes = new Uint8Array(8);
  crypto.getRandomValues(randomBytes);
  const random = Array.from(randomBytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return `ses_${timestamp}${random}`;
}

function calculateRiskScore(ctx: ReturnType<typeof getRequestContext>): number {
  let score = 0;

  if (ctx.isProxy) score += 30;
  if (ctx.isVPN) score += 20;
  if (ctx.isTor) score += 40;
  if (ctx.isDatacenter) score += 25;

  return Math.min(score, 100);
}

async function storeSession(
  db: D1Database,
  data: {
    sessionId: string;
    fingerprintHash: string;
    hardwareHash: string;
    softwareHash: string;
    entropyBits: number;
    ipHash: string;
    country: string;
    asn: string;
    isProxy: boolean;
    isVPN: boolean;
  }
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO sessions (
        id, fingerprint_hash, hardware_hash, software_hash,
        entropy_bits, ip_hash, country, asn, is_proxy, is_vpn,
        created_at, consent_given
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), 1)`
    )
    .bind(
      data.sessionId,
      data.fingerprintHash,
      data.hardwareHash,
      data.softwareHash,
      data.entropyBits,
      data.ipHash,
      data.country,
      data.asn,
      data.isProxy ? 1 : 0,
      data.isVPN ? 1 : 0
    )
    .run();
}

async function updateFingerprintStats(
  db: D1Database,
  data: {
    hash: string;
    hardwareHash: string;
    softwareHash: string;
    entropyBits: number;
  }
): Promise<void> {
  // Upsert fingerprint record
  await db
    .prepare(
      `INSERT INTO fingerprints (
        hash, hardware_hash, software_hash, entropy_bits,
        first_seen, last_seen, times_seen
      ) VALUES (?, ?, ?, ?, datetime('now'), datetime('now'), 1)
      ON CONFLICT(hash) DO UPDATE SET
        last_seen = datetime('now'),
        times_seen = times_seen + 1`
    )
    .bind(
      data.hash,
      data.hardwareHash,
      data.softwareHash,
      data.entropyBits
    )
    .run();
}

/**
 * Update signal frequencies for dynamic entropy calculation
 */
async function updateSignalFrequencies(
  db: D1Database,
  fingerprint: FingerprintPayload
): Promise<void> {
  const signals: Array<{ name: string; value: string }> = [];

  // Extract key signals
  if (fingerprint.hardware?.canvas?.hash) {
    signals.push({ name: 'canvas', value: fingerprint.hardware.canvas.hash });
  }
  if (fingerprint.hardware?.webgl?.hash) {
    signals.push({ name: 'webgl', value: fingerprint.hardware.webgl.hash });
  }
  if (fingerprint.hardware?.audio?.hash) {
    signals.push({ name: 'audio', value: fingerprint.hardware.audio.hash });
  }
  if (fingerprint.hardware?.screen) {
    const screen = fingerprint.hardware.screen;
    signals.push({
      name: 'screen',
      value: `${screen.width}x${screen.height}@${screen.pixelRatio}`,
    });
  }
  if (fingerprint.software?.platform) {
    signals.push({ name: 'platform', value: fingerprint.software.platform });
  }
  if (fingerprint.software?.timezone) {
    signals.push({ name: 'timezone', value: fingerprint.software.timezone });
  }

  // Upsert each signal frequency
  for (const signal of signals) {
    // Hash the value for consistent storage
    const encoder = new TextEncoder();
    const data = encoder.encode(signal.value);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const valueHash = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 16);

    await db
      .prepare(
        `INSERT INTO signal_frequencies (signal_name, signal_value_hash, frequency, last_seen)
         VALUES (?, ?, 1, datetime('now'))
         ON CONFLICT(signal_name, signal_value_hash) DO UPDATE SET
           frequency = frequency + 1,
           last_seen = datetime('now')`
      )
      .bind(signal.name, valueHash)
      .run();
  }
}

export { scan };
