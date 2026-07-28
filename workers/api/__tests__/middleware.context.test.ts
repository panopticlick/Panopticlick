/**
 * Request context: IP hashing under a configured salt, and network-type
 * heuristics that used to fire on any AS org containing "tor".
 */

import { Hono } from 'hono';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { contextMiddleware, getRequestContext } from '../src/middleware/context';
import { withCf } from './helpers/mock-env';

function probeApp() {
  const app = new Hono();
  app.use('*', contextMiddleware);
  app.get('/probe', (c) => c.json(getRequestContext(c)));
  return app;
}

async function probe(env: Record<string, unknown>, cf?: Record<string, unknown>) {
  const request = new Request('https://api.panopticlick.org/probe', {
    headers: { 'cf-connecting-ip': '203.0.113.7' },
  });

  const res = await probeApp().request(cf ? withCf(request, cf) : request, undefined, env);
  return res.json() as Promise<{ ipHash: string; isTor: boolean; isVPN: boolean; isDatacenter: boolean }>;
}

beforeEach(() => {
  vi.spyOn(console, 'warn').mockImplementation(() => undefined);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('IP hashing', () => {
  it('is stable for a given salt and changes when the salt changes', async () => {
    const first = await probe({ IP_HASH_SALT: 'salt-one' });
    const again = await probe({ IP_HASH_SALT: 'salt-one' });
    const rotated = await probe({ IP_HASH_SALT: 'salt-two' });

    expect(first.ipHash).toMatch(/^[a-f0-9]{64}$/);
    expect(again.ipHash).toBe(first.ipHash);
    expect(rotated.ipHash).not.toBe(first.ipHash);
  });

  it('falls back to a per-isolate random salt and warns once', async () => {
    vi.resetModules();
    const { contextMiddleware: freshMiddleware, getRequestContext: freshGetter } = await import(
      '../src/middleware/context'
    );

    const app = new Hono();
    app.use('*', freshMiddleware);
    app.get('/probe', (c) => c.json(freshGetter(c)));

    const request = () =>
      app.request('/probe', { headers: { 'cf-connecting-ip': '203.0.113.7' } }, {});

    const first = (await (await request()).json()) as { ipHash: string };
    const second = (await (await request()).json()) as { ipHash: string };
    const salted = await probe({ IP_HASH_SALT: 'salt-one' });

    // Unlinkable but usable within the isolate, and never the old hardcoded salt
    expect(first.ipHash).toMatch(/^[a-f0-9]{64}$/);
    expect(second.ipHash).toBe(first.ipHash);
    expect(first.ipHash).not.toBe(salted.ipHash);
    expect(console.warn).toHaveBeenCalledTimes(1);
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('IP_HASH_SALT'));
  });
});

describe('Tor detection', () => {
  const env = { IP_HASH_SALT: 'salt-one' };

  it('does not fire on unrelated AS organizations', async () => {
    for (const asOrganization of ['Storage Networks Inc', 'Torino Telecom', 'Motorola Mobility']) {
      const ctx = await probe(env, { asOrganization, asn: 64500 });
      expect(ctx.isTor, asOrganization).toBe(false);
    }
  });

  it('fires on real Tor operators', async () => {
    for (const asOrganization of ['Tor Exit Node', 'The Tor Project', 'torproject.org relay']) {
      const ctx = await probe(env, { asOrganization, asn: 64500 });
      expect(ctx.isTor, asOrganization).toBe(true);
    }
  });

  it('still flags datacenter and VPN operators', async () => {
    const datacenter = await probe(env, { asOrganization: 'Hetzner Online GmbH', asn: 24940 });
    const vpn = await probe(env, { asOrganization: 'Mullvad VPN AB', asn: 39351 });

    expect(datacenter.isDatacenter).toBe(true);
    expect(vpn.isVPN).toBe(true);
  });
});
