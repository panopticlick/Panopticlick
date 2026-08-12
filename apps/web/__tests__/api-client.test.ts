import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  APIError,
  api,
  clearSessionToken,
  storeSessionToken,
} from '../src/lib/api-client';

afterEach(() => {
  clearSessionToken();
  vi.unstubAllGlobals();
});

describe('APIError', () => {
  it('normalizes the Worker nested error envelope and Retry-After header', async () => {
    const response = new Response(
      JSON.stringify({
        error: {
          code: 'RATE_LIMITED',
          message: 'AI request limit exceeded',
        },
      }),
      {
        status: 429,
        statusText: 'Too Many Requests',
        headers: {
          'content-type': 'application/json',
          'retry-after': '60',
        },
      },
    );

    const error = APIError.fromResponse(
      response,
      await response.clone().json(),
    );

    expect(error.message).toBe('AI request limit exceeded');
    expect(error.code).toBe('RATE_LIMITED');
    expect(error.status).toBe(429);
    expect(error.retryAfterSeconds).toBe(60);
  });
});

describe('AI rolling-deploy compatibility', () => {
  it('retries a legacy validation response with the last user prompt', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            error: {
              code: 'VALIDATION_ERROR',
              message: 'messages unsupported',
            },
          }),
          {
            status: 422,
            headers: { 'content-type': 'application/json' },
          },
        ),
      )
      .mockResolvedValueOnce(
        Response.json({
          success: true,
          message: { role: 'assistant', content: 'Legacy worker answer' },
        }),
      );
    vi.stubGlobal('fetch', fetchMock);

    const response = await api.ai.chat([
      { role: 'user', content: 'first question' },
      { role: 'assistant', content: 'first answer' },
      { role: 'user', content: 'latest question' },
    ]);

    expect(response.message.content).toBe('Legacy worker answer');
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(
      JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body)),
    ).toMatchObject({
      messages: expect.any(Array),
    });
    expect(
      JSON.parse(String(fetchMock.mock.calls[1]?.[1]?.body)),
    ).toMatchObject({
      prompt: 'latest question',
    });
  });
});

describe('privacy ownership requests', () => {
  it('sends the current session id and ownership token for deletion', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      Response.json({
        success: true,
        deletedCount: { sessions: 1, fingerprints: 0 },
        permanentOptOut: false,
        message: 'deleted',
      }),
    );
    vi.stubGlobal('fetch', fetchMock);
    storeSessionToken('ses_owned', 'token_owned');

    await api.privacy.deleteSession('ses_owned');

    const options = fetchMock.mock.calls[0]?.[1];
    expect(options?.headers).toMatchObject({
      'X-Session-Token': 'token_owned',
    });
    expect(JSON.parse(String(options?.body))).toEqual({
      sessions: [{ id: 'ses_owned', token: 'token_owned' }],
      reason: 'Deleted from the case summary',
    });
  });
});

describe('DNS result compatibility', () => {
  it('does not trust a legacy worker that omitted an observability status', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      Response.json({
        success: true,
        resolver: { ip: 'hidden', provider: 'Cloudflare', isEncrypted: true },
        leakTest: { passed: true, leakedIPs: [] },
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    await expect(api.defense.dnsLeakTest()).resolves.toMatchObject({
      status: 'inconclusive',
      leaking: false,
      isEncrypted: false,
      provider: null,
      resolvers: [],
    });
  });
});
