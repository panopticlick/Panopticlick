/**
 * Privacy Routes
 * GDPR/CCPA compliance endpoints
 */

import { Hono } from 'hono';
import type { Env } from '../types';
import { getRequestContext } from '../middleware/context';
import type {
  OptOutRequest,
  OptOutResponse,
  MyDataResponse,
} from '@panopticlick/types';

const privacy = new Hono<{ Bindings: Env }>();

/**
 * POST /privacy/opt-out
 * Request data deletion
 */
privacy.post('/opt-out', async (c) => {
  try {
    const body = await c.req.json<OptOutRequest>();
    const { sessionIds, fingerprintHash, email } = body;

    const ctx = getRequestContext(c);
    const deletedCount = { sessions: 0, fingerprints: 0 };

    // Delete by session IDs
    if (sessionIds && sessionIds.length > 0) {
      for (const sessionId of sessionIds) {
        const result = await c.env.DB.prepare(
          'DELETE FROM sessions WHERE id = ?'
        )
          .bind(sessionId)
          .run();

        if (result.meta.changes) {
          deletedCount.sessions += result.meta.changes;
        }
      }
    }

    // Delete by fingerprint hash
    if (fingerprintHash) {
      // Delete sessions with this fingerprint
      const sessionResult = await c.env.DB.prepare(
        'DELETE FROM sessions WHERE fingerprint_hash = ?'
      )
        .bind(fingerprintHash)
        .run();

      if (sessionResult.meta.changes) {
        deletedCount.sessions += sessionResult.meta.changes;
      }

      // Delete fingerprint record
      const fpResult = await c.env.DB.prepare(
        'DELETE FROM fingerprints WHERE hash = ?'
      )
        .bind(fingerprintHash)
        .run();

      if (fpResult.meta.changes) {
        deletedCount.fingerprints += fpResult.meta.changes;
      }
    }

    // Delete by IP hash (current request)
    const ipResult = await c.env.DB.prepare(
      'DELETE FROM sessions WHERE ip_hash = ?'
    )
      .bind(ctx.ipHash)
      .run();

    if (ipResult.meta.changes) {
      deletedCount.sessions += ipResult.meta.changes;
    }

    // Log opt-out request (without PII)
    c.env.ANALYTICS.writeDataPoint({
      blobs: ['opt_out', ctx.country],
      doubles: [deletedCount.sessions, deletedCount.fingerprints],
      indexes: ['privacy_optout'],
    });

    const response: OptOutResponse = {
      success: true,
      deletedCount,
      message:
        'Your data has been deleted. Any future scans will not be linked to previous sessions.',
    };

    return c.json(response);
  } catch (error) {
    console.error('Opt-out error:', error);
    return c.json(
      { success: false, error: 'Failed to process opt-out request' },
      500
    );
  }
});

/**
 * GET /privacy/my-data
 * Request data export (GDPR Article 20)
 */
privacy.get('/my-data', async (c) => {
  const ctx = getRequestContext(c);

  try {
    // Get all sessions for this IP
    const sessions = await c.env.DB.prepare(
      `SELECT
        id,
        fingerprint_hash,
        entropy_bits,
        country,
        created_at,
        consent_given
      FROM sessions
      WHERE ip_hash = ?
      ORDER BY created_at DESC
      LIMIT 100`
    )
      .bind(ctx.ipHash)
      .all();

    // Get related fingerprints
    const fingerprints: Record<string, unknown>[] = [];

    if (sessions.results && sessions.results.length > 0) {
      const hashes = [...new Set(sessions.results.map((s) => s.fingerprint_hash))];

      for (const hash of hashes) {
        const fp = await c.env.DB.prepare(
          `SELECT
            hash,
            entropy_bits,
            first_seen,
            last_seen,
            times_seen
          FROM fingerprints
          WHERE hash = ?`
        )
          .bind(hash)
          .first();

        if (fp) {
          fingerprints.push(fp);
        }
      }
    }

    const response: MyDataResponse = {
      success: true,
      data: {
        sessions: sessions.results || [],
        fingerprints,
        exportedAt: new Date().toISOString(),
        note:
          'This export contains all data associated with your current IP address. ' +
          'IP addresses are hashed and cannot be reversed.',
      },
    };

    return c.json(response);
  } catch (error) {
    console.error('Data export error:', error);
    return c.json(
      { success: false, error: 'Failed to export data' },
      500
    );
  }
});

/**
 * GET /privacy/policy
 * Return privacy policy summary
 */
privacy.get('/policy', async (c) => {
  return c.json({
    version: '1.0',
    lastUpdated: '2024-01-01',
    summary: {
      dataCollected: [
        'Browser fingerprint (with consent)',
        'IP address (hashed, not stored raw)',
        'Country and ASN (from IP geolocation)',
        'Entropy and valuation metrics',
      ],
      dataNotCollected: [
        'Personal identification information',
        'Cookies (except for session management)',
        'Browsing history',
        'Form submissions',
      ],
      retention: {
        sessions: '30 days',
        fingerprints: '90 days (aggregated)',
        analytics: 'Indefinitely (anonymized)',
      },
      rights: [
        'Access your data (GET /privacy/my-data)',
        'Delete your data (POST /privacy/opt-out)',
        'Withdraw consent at any time',
      ],
    },
    fullPolicyUrl: 'https://panopticlick.org/privacy',
    contactEmail: 'privacy@panopticlick.org',
  });
});

/**
 * POST /privacy/consent
 * Record consent preference
 */
privacy.post('/consent', async (c) => {
  const body = await c.req.json<{ sessionId: string; consent: boolean }>();
  const { sessionId, consent } = body;

  if (!sessionId) {
    return c.json({ success: false, error: 'Session ID required' }, 400);
  }

  await c.env.DB.prepare(
    'UPDATE sessions SET consent_given = ? WHERE id = ?'
  )
    .bind(consent ? 1 : 0, sessionId)
    .run();

  // If consent withdrawn, schedule data for deletion
  if (!consent) {
    // In a production system, you might queue this for background processing
    // For now, we'll delete immediately
    await c.env.DB.prepare(
      'DELETE FROM sessions WHERE id = ? AND consent_given = 0'
    )
      .bind(sessionId)
      .run();
  }

  return c.json({
    success: true,
    consent,
    message: consent
      ? 'Thank you for your consent. Your data helps improve privacy research.'
      : 'Consent withdrawn. Your session data has been deleted.',
  });
});

export { privacy };
