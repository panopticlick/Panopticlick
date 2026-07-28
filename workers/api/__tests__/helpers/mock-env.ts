/**
 * Route-level test harness: a recording D1 fake plus a minimal Env.
 *
 * Statements are matched by regex against the SQL text, so a test only has to
 * describe the queries it cares about; everything else returns "no rows".
 */

import type { Env } from '../../src/types';

export interface D1Call {
  sql: string;
  params: unknown[];
}

export interface D1Outcome {
  first?: unknown;
  all?: unknown[];
  changes?: number;
}

export type D1Route = [RegExp, D1Outcome | ((params: unknown[]) => D1Outcome)];

export interface MockD1 {
  calls: D1Call[];
  /** Normalized SQL of every statement that was executed. */
  sqlLog(): string[];
  prepare(sql: string): unknown;
}

export function createMockD1(routes: D1Route[] = []): MockD1 {
  const calls: D1Call[] = [];

  return {
    calls,
    sqlLog: () => calls.map((call) => call.sql),
    prepare(sql: string) {
      const normalized = sql.replace(/\s+/g, ' ').trim();
      let params: unknown[] = [];

      const outcome = (): D1Outcome => {
        for (const [pattern, result] of routes) {
          if (pattern.test(normalized)) {
            return typeof result === 'function' ? result(params) : result;
          }
        }
        return {};
      };

      const record = () => {
        calls.push({ sql: normalized, params: [...params] });
      };

      const statement = {
        bind(...args: unknown[]) {
          params = args;
          return statement;
        },
        async first<T = unknown>(): Promise<T | null> {
          record();
          return (outcome().first ?? null) as T | null;
        },
        async all<T = unknown>() {
          record();
          return {
            results: (outcome().all ?? []) as T[],
            success: true,
            meta: { changes: 0 },
          };
        },
        async run() {
          record();
          return {
            success: true,
            meta: { changes: outcome().changes ?? 0 },
          };
        },
      };

      return statement;
    },
  };
}

export interface MockEnvOptions extends Partial<Omit<Env, 'DB'>> {
  db?: MockD1;
}

export function createMockEnv(options: MockEnvOptions = {}): { env: Env; db: MockD1 } {
  const { db = createMockD1(), ...envOverrides } = options;

  const env = {
    DB: db as unknown as Env['DB'],
    CACHE: {
      get: async () => null,
      put: async () => undefined,
    } as unknown as Env['CACHE'],
    ENVIRONMENT: 'test',
    API_VERSION: 'v1',
    ALLOWED_ORIGINS: 'https://panopticlick.org',
    IP_HASH_SALT: 'test-ip-hash-salt',
    SESSION_TOKEN_SECRET: 'test-session-token-secret',
    ...envOverrides,
  } as Env;

  return { env, db };
}

/** Attach Cloudflare request properties that `c.req.raw.cf` reads. */
export function withCf<T extends Request>(request: T, cf: Record<string, unknown>): T {
  Object.defineProperty(request, 'cf', { value: cf, configurable: true });
  return request;
}
