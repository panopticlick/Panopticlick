/**
 * Data retention
 *
 * Enforces the retention windows the privacy policy promises
 * (GET /v1/privacy/policy): sessions 30 days, aggregated fingerprints 90 days,
 * HSTS demo state 7 days. Child rows (fingerprint_analyses, signal_entropy,
 * rtb_simulations, rtb_bids, defense_audits, blocked_trackers, bait_results)
 * are removed by ON DELETE CASCADE.
 *
 * Invoked from the `scheduled` handler in src/index.ts.
 */

export const RETENTION_STATEMENTS: Array<{ table: string; sql: string }> = [
  {
    table: 'sessions',
    sql: "DELETE FROM sessions WHERE created_at < datetime('now', '-30 days')",
  },
  {
    table: 'fingerprints',
    sql: "DELETE FROM fingerprints WHERE last_seen < datetime('now', '-90 days')",
  },
  {
    table: 'hsts_cookies',
    sql: "DELETE FROM hsts_cookies WHERE created_at < datetime('now', '-7 days')",
  },
];

export async function runRetention(db: D1Database): Promise<Record<string, number>> {
  const deleted: Record<string, number> = {};

  for (const { table, sql } of RETENTION_STATEMENTS) {
    // Each table is independent: a failure on one must not leave the others
    // un-pruned until the next cron tick.
    try {
      const result = await db.prepare(sql).run();
      deleted[table] = result.meta?.changes ?? 0;
    } catch (error) {
      deleted[table] = -1;
      console.error(`[retention] ${table} cleanup failed:`, error);
    }
  }

  return deleted;
}
