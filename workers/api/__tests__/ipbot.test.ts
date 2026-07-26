/**
 * IPBot service behavior tests.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Env } from '../src/types';
import { lookupIP } from '../src/services/ipbot';

const IP = '8.8.8.8';
const ORIGIN = 'https://api.ipbot.test';
const API_KEY = 'test-key-not-a-real-secret';

interface CacheHarness {
  env: Env;
  get: ReturnType<typeof vi.fn>;
  put: ReturnType<typeof vi.fn>;
}

function response(
  riskScore = 12,
  overrides: Record<string, unknown> = {},
  headers: Record<string, string> = {}
): Response {
  return new Response(
    JSON.stringify({
      ip: IP,
      stack: 'ipv4',
      location: {
        country: 'United States',
        country_code: 'US',
        region: 'California',
        city: 'Mountain View',
      },
      network: {
        asn: 'AS15169',
        org: 'Google LLC',
      },
      score: {
        ip_score: 88,
        risk_score: riskScore,
        band: riskScore >= 61 ? 'poor' : 'excellent',
        verdict: riskScore >= 61 ? 'challenge' : 'allow',
        recommended_action: riskScore >= 61 ? 'captcha_challenge' : 'allow',
      },
      classification: {
        usage_type: 'public_dns_resolver',
        is_datacenter: true,
        is_proxy: false,
        is_vpn: false,
        is_tor: false,
        confidence: 'high',
        threat_level: 'low',
      },
      ...overrides,
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    }
  );
}

function cacheHarness(cached: unknown = null): CacheHarness {
  const get = vi.fn().mockResolvedValue(cached);
  const put = vi.fn().mockResolvedValue(undefined);
  const env = {
    IPBOT_API_ORIGIN: ORIGIN,
    IPBOT_API_KEY: API_KEY,
    CACHE: { get, put },
  } as unknown as Env;

  return { env, get, put };
}

beforeEach(() => {
  vi.spyOn(console, 'log').mockImplementation(() => undefined);
  vi.spyOn(console, 'warn').mockImplementation(() => undefined);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('lookupIP', () => {
  it('sends the API key, records rate limits, and caches low-risk results for 24h', async () => {
    const cache = cacheHarness();
    const fetchMock = vi.fn().mockResolvedValue(
      response(12, {}, {
        'X-RateLimit-Limit': '600',
        'X-RateLimit-Remaining': '599',
        'X-RateLimit-Tier': 'pro',
      })
    );
    vi.stubGlobal('fetch', fetchMock);

    const result = await lookupIP(IP, cache.env);

    expect(result).toMatchObject({
      cached: false,
      data: {
        ip: IP,
        network: { asn: 'AS15169' },
        score: { risk_score: 12 },
      },
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe(`${ORIGIN}/v1/ip/${IP}`);
    expect(fetchMock.mock.calls[0][1]?.headers).toEqual({ 'X-API-Key': API_KEY });
    expect(console.log).toHaveBeenCalledWith(
      '[ipbot] rate-limit limit=600 remaining=599 tier=pro status=200'
    );

    expect(cache.put).toHaveBeenCalledTimes(1);
    const [cacheKey, serialized, options] = cache.put.mock.calls[0];
    expect(cacheKey).toMatch(/^ipbot:v1:[a-f0-9]{64}$/);
    expect(cacheKey).not.toContain(IP);
    expect(JSON.parse(serialized)).not.toHaveProperty('ip');
    expect(options).toEqual({ expirationTtl: 86_400 });
  });

  it('caches high-risk results for one hour', async () => {
    const cache = cacheHarness();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response(75)));

    await lookupIP(IP, cache.env);

    expect(cache.put.mock.calls[0][2]).toEqual({ expirationTtl: 3_600 });
  });

  it('uses the Workers Cache API when KV is not bound', async () => {
    const match = vi.fn().mockResolvedValue(undefined);
    const put = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('caches', { default: { match, put } });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response()));
    const env = {
      IPBOT_API_ORIGIN: ORIGIN,
      IPBOT_API_KEY: API_KEY,
    } as unknown as Env;

    const result = await lookupIP(IP, env);

    expect(result?.cached).toBe(false);
    expect(match).toHaveBeenCalledWith(
      expect.stringMatching(/^https:\/\/ipbot-cache\.panopticlick\.internal\/ipbot:v1:[a-f0-9]{64}$/)
    );
    expect(put).toHaveBeenCalledTimes(1);
    const [, cachedResponse] = put.mock.calls[0] as [string, Response];
    expect(cachedResponse.headers.get('Cache-Control')).toBe('max-age=86400');
    expect(await cachedResponse.json()).not.toHaveProperty('ip');
  });

  it('returns cached data without another API request', async () => {
    const cache = cacheHarness({
      network: { asn: 'AS15169', org: 'Google LLC' },
      score: { risk_score: 12 },
      classification: { is_proxy: false },
    });
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const result = await lookupIP(IP, cache.env);

    expect(result).toMatchObject({
      cached: true,
      data: { ip: IP, network: { asn: 'AS15169' } },
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('retries 429 responses and succeeds within the lookup budget', async () => {
    const cache = cacheHarness();
    const rateLimited = () => new Response(null, {
      status: 429,
      headers: {
        'Retry-After': '0.001',
        'X-RateLimit-Limit': '600',
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Tier': 'pro',
      },
    });
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(rateLimited())
      .mockResolvedValueOnce(rateLimited())
      .mockResolvedValueOnce(response());
    vi.stubGlobal('fetch', fetchMock);

    const result = await lookupIP(IP, cache.env);

    expect(result?.data.ip).toBe(IP);
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(console.warn).toHaveBeenCalledWith(
      '[ipbot] rate-limit limit=600 remaining=0 tier=pro status=429'
    );
  });

  it('treats cache failures as best-effort and keeps a successful lookup', async () => {
    const cache = cacheHarness();
    cache.get.mockRejectedValue(new Error('read unavailable'));
    cache.put.mockRejectedValue(new Error('write unavailable'));
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response()));

    const result = await lookupIP(IP, cache.env);

    expect(result).toMatchObject({ cached: false, data: { ip: IP } });
    expect(console.warn).toHaveBeenCalledWith('[ipbot] cache read error type=Error');
    expect(console.warn).toHaveBeenCalledWith('[ipbot] cache write error type=Error');
  });

  it('rejects malformed success payloads instead of caching them', async () => {
    const cache = cacheHarness();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response(12, {
      score: { risk_score: '12' },
    })));

    const result = await lookupIP(IP, cache.env);

    expect(result).toBeNull();
    expect(cache.put).not.toHaveBeenCalled();
    expect(console.warn).toHaveBeenCalledWith('[ipbot] lookup returned an invalid response');
  });

  it('does not call IPBot for private addresses or missing configuration', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const privateResult = await lookupIP('192.168.1.10', cacheHarness().env);
    const missingConfig = await lookupIP(IP, {
      ...cacheHarness().env,
      IPBOT_API_KEY: undefined,
    });

    expect(privateResult).toBeNull();
    expect(missingConfig).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  const liveTest = process.env.IPBOT_LIVE_TEST === '1' ? it : it.skip;
  liveTest('queries 8.8.8.8 with the configured Pro credential', async () => {
    const origin = process.env.IPBOT_API_ORIGIN;
    const apiKey = process.env.IPBOT_API_KEY;
    if (!origin || !apiKey) {
      throw new Error('IPBOT_API_ORIGIN and IPBOT_API_KEY are required for the live test');
    }

    const env = {
      IPBOT_API_ORIGIN: origin,
      IPBOT_API_KEY: apiKey,
    } as unknown as Env;

    const result = await lookupIP(IP, env);

    expect(result).toMatchObject({
      cached: false,
      data: {
        ip: IP,
        network: { asn: expect.any(String) },
        score: { risk_score: expect.any(Number) },
      },
    });
    expect(console.log).toHaveBeenCalledWith(
      expect.stringMatching(/^\[ipbot] rate-limit .* tier=(?!anonymous|null)[^ ]+ status=200$/)
    );
  });
});
