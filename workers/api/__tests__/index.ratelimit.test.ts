import { describe, expect, it, vi } from 'vitest';
import { app } from '../src';
import { createMockEnv } from './helpers/mock-env';

describe('AI route rate limiting', () => {
  it('runs the AI limiter before request-body validation', async () => {
    const globalLimit = vi.fn().mockResolvedValue({ success: true });
    const aiLimit = vi.fn().mockResolvedValue({ success: false });
    const { env } = createMockEnv({
      RATE_LIMITER: { limit: globalLimit },
      AI_RATE_LIMITER: { limit: aiLimit },
    });

    const response = await app.request(
      '/v1/ai/chat',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Origin: 'https://panopticlick.org',
        },
        body: '{}',
      },
      env
    );

    expect(response.status).toBe(429);
    expect(response.headers.get('Retry-After')).toBe('60');
    expect(globalLimit).toHaveBeenCalledOnce();
    expect(aiLimit).toHaveBeenCalledOnce();
  });
});
