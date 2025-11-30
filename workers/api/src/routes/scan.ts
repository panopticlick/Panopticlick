/**
 * Scan Routes
 * Handles fingerprint collection and analysis
 */

import { Hono } from 'hono';
import type { Env } from '../types';
import { getRequestContext } from '../middleware/context';
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
    const body = await c.req.json<ScanCollectRequest>();
    const { sessionId, fingerprint, consent } = body;

    if (!sessionId || !fingerprint) {
      return c.json({ success: false, error: 'Missing required fields' }, 400);
    }

    // Import valuation engine (dynamic import for Workers)
    const { generateValuationReport, generateHashes } = await import(
      '@panopticlick/valuation-engine'
    );

    // Generate hashes
    const hashes = await generateHashes(fingerprint);

    // Generate full report
    const report = generateValuationReport(fingerprint, {
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

export { scan };
