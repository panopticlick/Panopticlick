import { describe, expect, it, vi } from 'vitest';
import { app } from '../src';
import { createMockEnv } from './helpers/mock-env';

describe('global API error handling', () => {
  it('maps malformed JSON to a client error without a stack trace', async () => {
    const { env } = createMockEnv({ ENVIRONMENT: 'production' });
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    try {
      const response = await app.request(
        '/v1/scan/collect',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Origin: 'https://panopticlick.org',
          },
          body: '{',
        },
        env
      );
      const body = await response.json<{
        success: boolean;
        error: { code: string; message: string; stack?: string };
      }>();

      expect(response.status).toBe(400);
      expect(body).toEqual({
        success: false,
        error: {
          code: 'INVALID_JSON',
          message: 'Request body must contain valid JSON',
        },
      });
      expect(body.error.stack).toBeUndefined();
    } finally {
      consoleError.mockRestore();
    }
  });
});
