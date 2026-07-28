import { afterEach, describe, expect, it, vi } from 'vitest';
import { ai } from '../src/routes/ai';
import { createMockEnv } from './helpers/mock-env';

describe('POST /chat', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('forwards multi-turn messages with the current fingerprint context', async () => {
    let upstreamBody: {
      messages?: Array<{ role: string; content: string }>;
    } = {};

    vi.spyOn(globalThis, 'fetch').mockImplementation(async (_input, init) => {
      upstreamBody = JSON.parse(String(init?.body));
      return new Response(
        JSON.stringify({ choices: [{ message: { content: 'Evidence reviewed.' } }] }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    });

    const { env } = createMockEnv({ OPENROUTER_API_KEY: 'test-key' });
    const response = await ai.request(
      '/chat',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'user', content: 'What does this report mean?' },
            { role: 'assistant', content: 'Which part should we inspect?' },
            { role: 'user', content: 'The advertising profile.' },
          ],
          fingerprintContext: {
            entropyBits: 33.5,
            averageCPM: 7.25,
            defenseScore: 42,
            personas: [{ name: 'Finance Reader' }, 'Frequent Traveler'],
          },
        }),
      },
      env
    );

    expect(response.status).toBe(200);
    expect(upstreamBody.messages).toHaveLength(4);
    expect(upstreamBody.messages?.[0]?.content).toContain(
      'Never imply that Panopticlick observed a live bid'
    );
    const finalUserTurn = upstreamBody.messages?.at(-1)?.content ?? '';
    expect(finalUserTurn).toContain('Entropy: 33.5 bits');
    expect(finalUserTurn).toContain('Average modeled CPM: $7.25');
    expect(finalUserTurn).toContain('Defense score: 42/100');
    expect(finalUserTurn).toContain('Finance Reader, Frequent Traveler');
  });

  it('keeps accepting the legacy prompt shape', async () => {
    const { env } = createMockEnv({ OPENROUTER_API_KEY: undefined });
    const response = await ai.request(
      '/chat',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: 'Explain entropy' }),
      },
      env
    );

    expect(response.status).toBe(200);
    const body = await response.json<{ success: boolean }>();
    expect(body.success).toBe(true);
  });

  it('keeps fallback replies question-specific for a high-entropy case', async () => {
    const { env } = createMockEnv({ OPENROUTER_API_KEY: undefined });
    const response = await ai.request(
      '/chat',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'user', content: 'How unique is my fingerprint?' },
            {
              role: 'assistant',
              content: 'Your fingerprint is unusually distinctive.',
            },
            { role: 'user', content: 'What is the first defense I should try?' },
          ],
          fingerprintContext: {
            entropyBits: 71.3,
            defenseScore: 15,
          },
        }),
      },
      env
    );

    expect(response.status).toBe(200);
    const body = await response.json<{
      message: { content: string };
      meta?: { fallback?: boolean };
    }>();
    expect(body.meta?.fallback).toBe(true);
    expect(body.message.content).toContain('uBlock Origin');
    expect(body.message.content).toContain('15/100');
    expect(body.message.content).not.toContain('high entropy (over 30 bits)');
  });
});
