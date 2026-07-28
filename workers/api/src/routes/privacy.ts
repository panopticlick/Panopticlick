/**
 * Privacy Routes
 * GDPR/CCPA compliance endpoints
 */

import { Hono } from 'hono';
import type { Env } from '../types';
import { getRequestContext } from '../middleware/context';
import {
  authorizeSession,
  sessionAuthError,
  verifySessionToken,
} from '../services/session-token';
import {
  PrivacyOptOutSchema,
  PrivacyConsentSchema,
  PrivacyMyDataSchema,
  validateRequest,
} from '../schemas/validation';
import type {
  OptOutRequest,
  OptOutResponse,
  MyDataResponse,
  MyDataExportResponse,
} from '@panopticlick/types';

const privacy = new Hono<{ Bindings: Env }>();

/** `permanentOptOut` is additive; not yet in the shared types contract. */
type OptOutResponseWithFlag = OptOutResponse & { permanentOptOut: boolean };

/**
 * Aggregate-only variant of MyDataResponse, returned when the caller cannot
 * name the fingerprint they are asking about.
 */
interface MyDataAggregateResponse {
  success: true;
  data: {
    sessionCount: number;
    fingerprintCount: number;
    exportedAt: string;
    note: string;
  };
}

/**
 * POST /privacy/opt-out
 * Request data deletion. Every session must be presented with the token minted
 * for it at /v1/scan/start — a bare session id is not proof of ownership.
 */
privacy.post('/opt-out', async (c) => {
  try {
    const body = await c.req.json().catch(() => null);
    if (!body) {
      return c.json({ success: false, error: 'Request body must be JSON' }, 400);
    }

    const validation = validateRequest(PrivacyOptOutSchema, body);

    if (!validation.success) {
      return c.json({ success: false, error: validation.error }, 400);
    }

    const { sessions, fingerprintHash, email, reason } = validation.data;

    const secret = c.env.SESSION_TOKEN_SECRET;
    if (!secret) {
      return c.json(sessionAuthError({ ok: false, reason: 'unconfigured' }), 401);
    }

    const ctx = getRequestContext(c);
    const deletedCount = { sessions: 0, fingerprints: 0 };

    // Verify ownership of every submitted session before reading or deleting
    // anything. Partial acceptance would make the request contract misleading
    // and could produce a partial deletion when one token is mistyped.
    const verified: string[] = [];
    for (const session of sessions) {
      if (!(await verifySessionToken(session.id, session.token, secret))) {
        return c.json(sessionAuthError({ ok: false, reason: 'invalid' }), 401);
      }
      verified.push(session.id);
    }

    // Fingerprint hashes proven to belong to the caller. Needed before the
    // delete, because the session row is what links id to hash. This is a
    // separate read pass so a fingerprint mismatch cannot delete sessions
    // before returning 403.
    const ownedHashes = new Set<string>();

    for (const sessionId of verified) {
      const row = await c.env.DB.prepare(
        'SELECT fingerprint_hash FROM sessions WHERE id = ?'
      )
        .bind(sessionId)
        .first<{ fingerprint_hash: string | null }>();

      if (row?.fingerprint_hash) ownedHashes.add(row.fingerprint_hash);
    }

    // A fingerprint hash is handed to the client in every /collect response, so
    // on its own it proves nothing: accept it only when one of the verified
    // sessions actually carries it.
    if (fingerprintHash && !ownedHashes.has(fingerprintHash)) {
      return c.json(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message:
              'fingerprintHash does not belong to any of the verified sessions in this request',
          },
        },
        403
      );
    }

    for (const sessionId of verified) {
      const result = await c.env.DB.prepare('DELETE FROM sessions WHERE id = ?')
        .bind(sessionId)
        .run();

      deletedCount.sessions += result.meta.changes ?? 0;
    }

    if (fingerprintHash) {
      // The fingerprint aggregate may be shared by multiple identical browser
      // configurations. A session token authorizes deletion of the submitted
      // sessions, not every other session with the same configuration hash.
      const remaining = await c.env.DB.prepare(
        'SELECT COUNT(*) AS count FROM sessions WHERE fingerprint_hash = ?'
      )
        .bind(fingerprintHash)
        .first<{ count: number }>();

      if ((remaining?.count ?? 0) === 0) {
        const fpResult = await c.env.DB.prepare(
          'DELETE FROM fingerprints WHERE hash = ?'
        )
          .bind(fingerprintHash)
          .run();

        deletedCount.fingerprints += fpResult.meta.changes ?? 0;
      }
    }

    // Note: there is deliberately no `DELETE ... WHERE ip_hash = ?` here.
    // Behind CGNAT one ip_hash covers thousands of unrelated people, so the
    // old unconditional IP-wide delete let any caller wipe their neighbours.

    // Log opt-out request (without PII)
    c.env.ANALYTICS?.writeDataPoint({
      blobs: ['opt_out', ctx.country],
      doubles: [deletedCount.sessions, deletedCount.fingerprints],
      indexes: ['privacy_optout'],
    });

    // Record a permanent opt-out only for an explicitly named (and owned)
    // fingerprint: that hash is what /scan/collect checks before persisting.
    // Doing it implicitly for every session would let a common configuration
    // hash be suppressed for unrelated visitors who share it.
    let permanentOptOut = false;

    if (fingerprintHash || email) {
      const existing = fingerprintHash
        ? await c.env.DB.prepare('SELECT id FROM opt_outs WHERE fingerprint_hash = ?')
            .bind(fingerprintHash)
            .first()
        : null;

      if (!existing) {
        await c.env.DB.prepare(
          `INSERT INTO opt_outs (id, ip_hash, fingerprint_hash, email, reason, opted_out_at)
           VALUES (?, ?, ?, ?, ?, datetime('now'))`
        )
          .bind(
            crypto.randomUUID(),
            ctx.ipHash,
            fingerprintHash || null,
            email || null,
            reason || null
          )
          .run();
      }

      permanentOptOut = Boolean(fingerprintHash);
    }

    const response: OptOutResponseWithFlag = {
      success: true,
      deletedCount,
      permanentOptOut,
      message: permanentOptOut
        ? 'Your data has been deleted and this fingerprint is now permanently excluded from collection.'
        : 'The sessions you proved ownership of have been deleted. Send your fingerprintHash to also block future collection.',
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
 * Request data export (GDPR Article 20).
 *
 * Without ownership proof this endpoint returns aggregate counts only. A
 * detailed response requires a session id + its fingerprint hash and the
 * X-Session-Token minted for that session.
 */
privacy.get('/my-data', async (c) => {
  const ctx = getRequestContext(c);

  try {
    const validation = validateRequest(PrivacyMyDataSchema, {
      sessionId: c.req.query('sessionId') || undefined,
      fingerprintHash: c.req.query('fingerprintHash') || undefined,
    });

    if (!validation.success) {
      return c.json({ success: false, error: validation.error }, 400);
    }

    const { sessionId, fingerprintHash } = validation.data;

    if (!sessionId || !fingerprintHash) {
      const counts = await c.env.DB.prepare(
        `SELECT
          COUNT(*) AS session_count,
          COUNT(DISTINCT fingerprint_hash) AS fingerprint_count
         FROM sessions
         WHERE ip_hash = ?`
      )
        .bind(ctx.ipHash)
        .first<{ session_count: number; fingerprint_count: number }>();

      const aggregate: MyDataAggregateResponse = {
        success: true,
        data: {
          sessionCount: counts?.session_count ?? 0,
          fingerprintCount: counts?.fingerprint_count ?? 0,
          exportedAt: new Date().toISOString(),
          note:
            'Counts for your current IP address only. Records are shared by everyone behind the same network address. A detailed export requires sessionId and fingerprintHash together, plus the X-Session-Token issued for that session.',
        },
      };

      return c.json(aggregate);
    }

    const auth = await authorizeSession(c, sessionId);
    if (!auth.ok) {
      return c.json(sessionAuthError(auth), 401);
    }

    const session = await c.env.DB.prepare(
      `SELECT
        id,
        fingerprint_hash,
        entropy_bits,
        country,
        created_at,
        consent_given
      FROM sessions
      WHERE id = ? AND fingerprint_hash = ?`
    )
      .bind(sessionId, fingerprintHash)
      .first<Record<string, unknown>>();

    const fingerprints: Record<string, unknown>[] = [];

    if (session) {
      const fpResults = await c.env.DB.prepare(
        `SELECT
          hash,
          entropy_bits,
          first_seen,
          last_seen,
          times_seen
        FROM fingerprints
        WHERE hash = ?`
      )
        .bind(fingerprintHash)
        .all();

      if (fpResults.results) {
        fingerprints.push(...fpResults.results);
      }
    }

    const response: MyDataResponse = {
      success: true,
      data: {
        sessions: session ? [session] : [],
        fingerprints,
        exportedAt: new Date().toISOString(),
        note:
          'This export contains the data recorded for the session you proved ownership of. ' +
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
    version: '2.0',
    lastUpdated: '2026-07-28',
    summary: {
      dataCollected: [
        'Browser fingerprint (with consent)',
        'IP address (hashed, not stored raw)',
        'Country and ASN (from IP geolocation)',
        'Entropy and valuation metrics',
      ],
      dataNotCollected: [
        'Names or account profiles in the scan flow',
        'Raw IP addresses in D1 scan records',
        'Tracking cookies',
        'Browsing history',
      ],
      retention: {
        sessions: '30 days',
        fingerprints: '90 days (aggregated)',
        temporaryDemonstrationData: '7 days',
      },
      rights: [
        'Access a session with its ownership token',
        'Delete a session with its ownership token',
        'Withdraw optional server storage from the completed case summary',
      ],
    },
    fullPolicyUrl: 'https://panopticlick.org/privacy',
    contactEmail: 'privacy@panopticlick.org',
  });
});

/**
 * POST /privacy/export/:sessionId
 * Return a data-URI JSON export for the session
 */
privacy.post('/export/:sessionId', async (c) => {
  try {
    const sessionId = c.req.param('sessionId');

    // Ownership required: the export contains the session's fingerprint record.
    const auth = await authorizeSession(c, sessionId);
    if (!auth.ok) {
      return c.json(sessionAuthError(auth), 401);
    }

    const session = await c.env.DB.prepare(
      `SELECT id, fingerprint_hash, entropy_bits, country, created_at
       FROM sessions WHERE id = ?`
    )
      .bind(sessionId)
      .first();

    if (!session) {
      return c.json({ success: false, error: 'SESSION_NOT_FOUND' }, 404);
    }

    const fingerprint = await c.env.DB.prepare(
      `SELECT * FROM fingerprints WHERE hash = ?`
    )
      .bind(session.fingerprint_hash)
      .first();

    const payload = {
      session,
      fingerprint,
      exportedAt: new Date().toISOString(),
    };

    const json = JSON.stringify(payload, null, 2);
    const dataUri = `data:application/json,${encodeURIComponent(json)}`;

    const response: MyDataExportResponse = {
      success: true,
      exportUrl: dataUri,
      expiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
    };

    return c.json(response);
  } catch (error) {
    console.error('Privacy export error:', error);
    return c.json({ success: false, error: 'EXPORT_FAILED' }, 500);
  }
});

/**
 * POST /privacy/consent
 * Record consent preference
 */
privacy.post('/consent', async (c) => {
  const body = await c.req.json().catch(() => null);
  if (!body) {
    return c.json({ success: false, error: 'Request body must be JSON' }, 400);
  }

  const validation = validateRequest(PrivacyConsentSchema, body);

  if (!validation.success) {
    return c.json({ success: false, error: validation.error }, 400);
  }

  const { sessionId, consent, token } = validation.data;

  // Consent withdrawal deletes the session, so it needs the same proof as
  // /opt-out. Accepts X-Session-Token or a `token` field in the body.
  const auth = await authorizeSession(c, sessionId, token);
  if (!auth.ok) {
    return c.json(sessionAuthError(auth), 401);
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
