/**
 * Stats Routes
 * Global statistics and population data
 */

import { Hono } from 'hono';
import type { Env, GlobalStats } from '../types';
import type { GlobalStatsResponse, EntropyBucket } from '@panopticlick/types';

const stats = new Hono<{ Bindings: Env }>();

/**
 * GET /stats/global
 * Get global fingerprint statistics
 */
stats.get('/global', async (c) => {
  // Try to get cached stats
  const cached = await c.env.CACHE.get('global_stats', 'json') as GlobalStats | null;

  if (cached && Date.now() - new Date(cached.updated_at).getTime() < 3600000) {
    return c.json(formatGlobalStats(cached));
  }

  // Calculate fresh stats
  const freshStats = await calculateGlobalStats(c.env.DB);

  // Cache for 1 hour
  await c.env.CACHE.put('global_stats', JSON.stringify(freshStats), {
    expirationTtl: 3600,
  });

  return c.json(formatGlobalStats(freshStats));
});

/**
 * GET /stats/entropy
 * Get entropy distribution
 */
stats.get('/entropy', async (c) => {
  const cached = await c.env.CACHE.get('entropy_distribution', 'json') as EntropyBucket[] | null;

  if (cached) {
    return c.json({ buckets: cached });
  }

  // Calculate entropy distribution
  const result = await c.env.DB.prepare(
    `SELECT
      CASE
        WHEN entropy_bits < 20 THEN '0-20'
        WHEN entropy_bits < 30 THEN '20-30'
        WHEN entropy_bits < 40 THEN '30-40'
        WHEN entropy_bits < 50 THEN '40-50'
        ELSE '50+'
      END as bucket,
      COUNT(*) as count,
      AVG(entropy_bits) as avg_entropy
    FROM sessions
    WHERE created_at > datetime('now', '-30 days')
    GROUP BY bucket
    ORDER BY bucket`
  ).all();

  const buckets: EntropyBucket[] = (result.results || []).map((row) => ({
    range: row.bucket as string,
    count: row.count as number,
    avgEntropy: row.avg_entropy as number,
  }));

  // Cache for 6 hours
  await c.env.CACHE.put('entropy_distribution', JSON.stringify(buckets), {
    expirationTtl: 21600,
  });

  return c.json({ buckets });
});

/**
 * GET /stats/browsers
 * Get browser distribution
 */
stats.get('/browsers', async (c) => {
  // This would ideally come from stored fingerprint data
  // For now, return estimated distribution
  const browsers = [
    { name: 'Chrome', percentage: 0.65, count: 650000 },
    { name: 'Safari', percentage: 0.18, count: 180000 },
    { name: 'Firefox', percentage: 0.03, count: 30000 },
    { name: 'Edge', percentage: 0.05, count: 50000 },
    { name: 'Opera', percentage: 0.02, count: 20000 },
    { name: 'Other', percentage: 0.07, count: 70000 },
  ];

  return c.json({ browsers });
});

/**
 * GET /stats/countries
 * Get country distribution
 */
stats.get('/countries', async (c) => {
  const cached = await c.env.CACHE.get('country_stats', 'json');

  if (cached) {
    return c.json(cached);
  }

  const result = await c.env.DB.prepare(
    `SELECT country, COUNT(*) as count
    FROM sessions
    WHERE created_at > datetime('now', '-30 days')
    GROUP BY country
    ORDER BY count DESC
    LIMIT 20`
  ).all();

  const total = (result.results || []).reduce(
    (sum, row) => sum + (row.count as number),
    0
  );

  const countries = (result.results || []).map((row) => ({
    code: row.country as string,
    count: row.count as number,
    percentage: total > 0 ? (row.count as number) / total : 0,
  }));

  const response = { countries, total };

  // Cache for 6 hours
  await c.env.CACHE.put('country_stats', JSON.stringify(response), {
    expirationTtl: 21600,
  });

  return c.json(response);
});

/**
 * GET /stats/compare/:hash
 * Compare a fingerprint hash against population
 */
stats.get('/compare/:hash', async (c) => {
  const hash = c.req.param('hash');

  // Find the fingerprint
  const fp = await c.env.DB.prepare(
    `SELECT * FROM fingerprints WHERE hash = ?`
  )
    .bind(hash)
    .first();

  if (!fp) {
    return c.json({
      found: false,
      message: 'Fingerprint not in database',
    });
  }

  // Get total fingerprints
  const totalResult = await c.env.DB.prepare(
    `SELECT COUNT(*) as total FROM fingerprints`
  ).first();

  const total = (totalResult?.total as number) || 1;

  // Calculate rarity
  const timesSeen = (fp.times_seen as number) || 1;
  const rarity = 1 / (timesSeen / total);

  // Get fingerprints with similar entropy
  const entropy = fp.entropy_bits as number;
  const similarResult = await c.env.DB.prepare(
    `SELECT COUNT(*) as similar
    FROM fingerprints
    WHERE entropy_bits BETWEEN ? AND ?`
  )
    .bind(entropy - 5, entropy + 5)
    .first();

  const similarCount = (similarResult?.similar as number) || 0;

  return c.json({
    found: true,
    hash,
    entropy: fp.entropy_bits,
    timesSeen,
    firstSeen: fp.first_seen,
    lastSeen: fp.last_seen,
    rarity: {
      score: rarity,
      percentile: Math.round((1 - 1 / rarity) * 100),
      similarFingerprints: similarCount,
    },
    total,
  });
});

// Helper functions

async function calculateGlobalStats(db: D1Database): Promise<GlobalStats> {
  // Get basic counts
  const counts = await db
    .prepare(
      `SELECT
      COUNT(*) as total_scans,
      COUNT(DISTINCT fingerprint_hash) as unique_fingerprints,
      AVG(entropy_bits) as average_entropy
    FROM sessions
    WHERE created_at > datetime('now', '-30 days')`
    )
    .first();

  // Get entropy distribution
  const entropyDist = await db
    .prepare(
      `SELECT
      CASE
        WHEN entropy_bits < 20 THEN 'low'
        WHEN entropy_bits < 35 THEN 'medium'
        WHEN entropy_bits < 50 THEN 'high'
        ELSE 'very_high'
      END as tier,
      COUNT(*) as count
    FROM sessions
    WHERE created_at > datetime('now', '-30 days')
    GROUP BY tier`
    )
    .all();

  const entropyDistribution: Record<string, number> = {};
  for (const row of entropyDist.results || []) {
    entropyDistribution[row.tier as string] = row.count as number;
  }

  return {
    total_scans: (counts?.total_scans as number) || 0,
    unique_fingerprints: (counts?.unique_fingerprints as number) || 0,
    average_entropy: (counts?.average_entropy as number) || 30,
    entropy_distribution: entropyDistribution,
    browser_distribution: {}, // Would need to parse UAs
    os_distribution: {}, // Would need to parse UAs
    updated_at: new Date().toISOString(),
  };
}

function formatGlobalStats(stats: GlobalStats): GlobalStatsResponse {
  return {
    totalScans: stats.total_scans,
    uniqueFingerprints: stats.unique_fingerprints,
    averageEntropy: Math.round(stats.average_entropy * 10) / 10,
    entropyDistribution: stats.entropy_distribution,
    browserDistribution: stats.browser_distribution,
    osDistribution: stats.os_distribution,
    updatedAt: stats.updated_at,
  };
}

export { stats };
