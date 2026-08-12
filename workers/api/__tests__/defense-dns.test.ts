import { describe, expect, it } from 'vitest';
import { app } from '../src';
import { createMockEnv } from './helpers/mock-env';

describe('DNS defense endpoint', () => {
  it('reports an inconclusive result instead of claiming resolver visibility', async () => {
    const { env } = createMockEnv();
    const response = await app.request(
      '/v1/defense/dns',
      { headers: { Origin: 'https://panopticlick.org' } },
      env,
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      success: true,
      resolver: {
        ip: 'unavailable',
        provider: 'Unknown',
        isEncrypted: false,
      },
      leakTest: {
        passed: false,
        leakedIPs: [],
        status: 'inconclusive',
      },
    });
  });
});
