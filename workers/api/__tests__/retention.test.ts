import { describe, expect, it } from 'vitest';
import { createMockD1 } from './helpers/mock-env';
import { RETENTION_STATEMENTS, runRetention } from '../src/services/retention';
import { scheduled } from '../src';
import type { Env } from '../src/types';

describe('runRetention', () => {
  it('enforces the published 30/90/7 day windows', async () => {
    const db = createMockD1([
      [/DELETE FROM sessions/, { changes: 3 }],
      [/DELETE FROM fingerprints/, { changes: 2 }],
      [/DELETE FROM hsts_cookies/, { changes: 1 }],
    ]);

    const deleted = await runRetention(db as unknown as D1Database);

    expect(deleted).toEqual({
      sessions: 3,
      fingerprints: 2,
      hsts_cookies: 1,
    });
    expect(RETENTION_STATEMENTS.map(({ sql }) => sql)).toEqual([
      "DELETE FROM sessions WHERE created_at < datetime('now', '-30 days')",
      "DELETE FROM fingerprints WHERE last_seen < datetime('now', '-90 days')",
      "DELETE FROM hsts_cookies WHERE created_at < datetime('now', '-7 days')",
    ]);
  });

  it('wires the Worker scheduled entry point to the same retention job', async () => {
    const db = createMockD1();

    await scheduled(
      {} as ScheduledController,
      { DB: db as unknown as D1Database } as Env,
      {} as ExecutionContext
    );

    expect(db.sqlLog()).toEqual(RETENTION_STATEMENTS.map(({ sql }) => sql));
  });
});
