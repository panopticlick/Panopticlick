/**
 * AI Chat Route - Secure OpenRouter API Proxy
 *
 * Security: API key is stored in Cloudflare Worker environment variables,
 * never exposed to the client. Rate limiting is enforced by the AI_RATE_LIMITER
 * binding wired in src/index.ts (the in-memory Map this route used to keep was
 * per-isolate, so it limited almost nothing).
 */

import { Hono } from 'hono';
import { z } from 'zod';
import type { Env } from '../types';

const ai = new Hono<{ Bindings: Env }>();

const fingerprintContextSchema = z.object({
  // Current single-page experience fields
  entropyBits: z.number().min(0).max(256).optional(),
  averageCPM: z.number().min(0).max(10_000).optional(),
  defenseScore: z.number().min(0).max(100).optional(),
  personas: z
    .array(
      z.union([
        z.string().min(1).max(100),
        z.object({ name: z.string().min(1).max(100) }),
      ])
    )
    .max(8)
    .optional(),
  // Legacy floating-chat fields remain accepted during the rollout.
  entropy: z.number().optional(),
  uniqueness: z.string().optional(),
  trackers: z.number().optional(),
});

type FingerprintContext = z.infer<typeof fingerprintContextSchema>;

const chatMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1).max(2000),
});

type ChatMessage = z.infer<typeof chatMessageSchema>;

// `messages` carries a multi-turn conversation; `prompt` is the single-turn
// form the current frontend sends and stays supported.
const chatRequestSchema = z
  .object({
    prompt: z.string().min(1).max(1000).optional(),
    messages: z.array(chatMessageSchema).min(1).max(20).optional(),
    fingerprintContext: fingerprintContextSchema.optional(),
  })
  .refine((data) => Boolean(data.messages?.length || data.prompt), {
    message: 'Either messages or prompt is required',
  });

const DEFAULT_MODEL = 'openrouter/free';

/**
 * POST /api/ai/chat
 * Proxy to OpenRouter API with security
 */
ai.post('/chat', async (c) => {
  // Parsed once, up front: the error path below reuses this instead of reading
  // the (already consumed) request body a second time.
  const body = await c.req.json().catch(() => null);

  if (body === null || typeof body !== 'object') {
    return c.json({ success: false, error: 'Request body must be a JSON object' }, 400);
  }

  const result = chatRequestSchema.safeParse(body);

  if (!result.success) {
    return c.json(
      {
        success: false,
        error: 'Invalid request format',
        details: result.error.flatten(),
      },
      400
    );
  }

  const { prompt, messages, fingerprintContext } = result.data;
  const conversation: ChatMessage[] = messages ?? [
    { role: 'user', content: prompt as string },
  ];
  const lastUserMessage =
    [...conversation].reverse().find((m) => m.role === 'user')?.content ??
    conversation[conversation.length - 1].content;

  try {
    // Get OpenRouter API key from environment
    const apiKey = c.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      // Fallback response if API key not configured
      return c.json({
        success: true,
        message: {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: buildFallbackResponse(lastUserMessage, fingerprintContext),
        },
        meta: { fallback: true },
      });
    }

    // Call OpenRouter API
    const model = c.env.OPENROUTER_MODEL || DEFAULT_MODEL;
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://panopticlick.org',
        'X-Title': 'Panopticlick Fingerprint Analysis',
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: buildSystemPrompt(),
          },
          ...withFingerprintContext(conversation, fingerprintContext),
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content =
      data.choices?.[0]?.message?.content ||
      buildFallbackResponse(lastUserMessage, fingerprintContext);

    return c.json({
      success: true,
      message: {
        id: crypto.randomUUID(),
        role: 'assistant',
        content,
      },
    });
  } catch (error) {
    console.error('[AI Chat Error]', error);

    // Return fallback response on error
    return c.json({
      success: true,
      message: {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: buildFallbackResponse(lastUserMessage, fingerprintContext),
      },
      meta: { fallback: true },
    });
  }
});

/**
 * Attach the fingerprint context to the final user turn only — repeating it on
 * every turn wastes tokens and confuses the model.
 */
function withFingerprintContext(
  conversation: ChatMessage[],
  context?: FingerprintContext
): ChatMessage[] {
  if (!context) return conversation;

  let lastUserIndex = -1;
  for (let i = conversation.length - 1; i >= 0; i--) {
    if (conversation[i].role === 'user') {
      lastUserIndex = i;
      break;
    }
  }

  if (lastUserIndex === -1) return conversation;

  return conversation.map((message, index) =>
    index === lastUserIndex
      ? { ...message, content: buildUserPrompt(message.content, context) }
      : message
  );
}

function buildSystemPrompt(): string {
  return `You are a browser fingerprinting expert assistant for Panopticlick.org, helping users understand their digital privacy and fingerprint analysis.

**Your Role:**
- Explain browser fingerprinting concepts in clear, accessible language
- Help users understand their uniqueness score and entropy
- Provide actionable privacy recommendations
- Explain how AdTech surveillance works
- Be concise and informative (max 3-4 sentences per response)

**Tone:**
- Professional but approachable
- Slightly investigative (like a privacy journalist)
- Empowering, not fear-mongering
- Use analogies to explain technical concepts

**Guidelines:**
- Keep responses under 100 words when possible
- Focus on practical advice
- Don't make up data or statistics
- Treat CPM, annual value, personas, and auction results as teaching-model outputs. Never imply that Panopticlick observed a live bid, a real advertiser decision, or money paid for this user.
- If unsure, direct users to run another test or check our documentation`;
}

function buildUserPrompt(
  prompt: string,
  context?: FingerprintContext
): string {
  let contextStr = '';

  if (context) {
    const parts = [];
    const entropy = context.entropyBits ?? context.entropy;
    if (entropy !== undefined) parts.push(`Entropy: ${entropy} bits`);
    if (context.averageCPM !== undefined) {
      parts.push(`Average modeled CPM: $${context.averageCPM.toFixed(2)}`);
    }
    if (context.defenseScore !== undefined) {
      parts.push(`Defense score: ${context.defenseScore}/100`);
    }
    if (context.personas?.length) {
      const names = context.personas.map((persona) =>
        typeof persona === 'string' ? persona : persona.name
      );
      parts.push(`Modeled audience personas: ${names.join(', ')}`);
    }
    if (context.uniqueness) parts.push(`Uniqueness: ${context.uniqueness}`);
    if (context.trackers !== undefined) {
      parts.push(`Trackers detected: ${context.trackers}`);
    }

    if (parts.length > 0) {
      contextStr = `\n\n[User's fingerprint context: ${parts.join(', ')}]`;
    }
  }

  return `${prompt}${contextStr}`;
}

function buildFallbackResponse(
  prompt: string,
  context?: FingerprintContext
): string {
  const normalized = prompt.toLowerCase();
  const entropy = context?.entropyBits ?? context?.entropy;

  // Keyword-based responses
  if (
    normalized.includes('protect') ||
    normalized.includes('safe') ||
    normalized.includes('defense')
  ) {
    const score =
      context?.defenseScore !== undefined
        ? ` Your current defense score is ${context.defenseScore}/100.`
        : '';
    return `Start with uBlock Origin, then enable your browser's built-in fingerprint protection.${score} Re-run the scan after each change so you can see which signals actually improved instead of stacking extensions blindly.`;
  }

  if (
    normalized.includes('worth') ||
    normalized.includes('value') ||
    normalized.includes('cpm')
  ) {
    const modeledCPM =
      context?.averageCPM !== undefined
        ? ` This case models an average CPM of $${context.averageCPM.toFixed(2)}.`
        : '';
    return `The price shown is a teaching-model CPM—the estimated advertiser spend per 1,000 impressions—not money paid to you.${modeledCPM} Treat it as a scenario whose assumptions are documented on the methodology page, not a live-market quote.`;
  }

  if (normalized.includes('entropy')) {
    return 'Entropy measures how unique your browser fingerprint is. Higher entropy (measured in bits) means more uniqueness. 33+ bits means you\'re identifiable among billions of users. Lower your entropy by using common browser configurations and privacy extensions.';
  }

  if (normalized.includes('unique') || normalized.includes('fingerprint')) {
    if (entropy !== undefined && entropy > 30) {
      return `This case measures ${entropy.toFixed(1)} bits of entropy, which is a highly distinctive fingerprint in the model. It is an estimate built from signal priors—not a claim that we observed every browser—so use it to compare defenses after changing one setting at a time.`;
    }
    return 'A fingerprint becomes distinctive when ordinary signals—display, GPU, timezone, fonts, and browser capabilities—combine into an unusual profile. The score is most useful as a before-and-after measurement when you test a privacy defense.';
  }

  if (normalized.includes('track') || normalized.includes('follow')) {
    return 'Trackers use your fingerprint to follow you across websites without cookies. Your unique browser configuration acts like a signature. Use adblockers, disable WebRTC, and limit JavaScript to reduce tracking.';
  }

  if (normalized.includes('canvas') || normalized.includes('webgl')) {
    return 'Canvas and WebGL fingerprinting exploit how your GPU renders graphics. Each device produces slightly different results. You can block these using Canvas Blocker extension or browser fingerprint protection features.';
  }

  if (entropy !== undefined && entropy > 30) {
    return `This case has high modeled entropy (${entropy.toFixed(1)} bits), so its combination of browser signals is unusually distinctive. Ask about a specific signal or defense and I can turn that part of the report into a concrete next step.`;
  }

  if (normalized.includes('value') || normalized.includes('worth') || normalized.includes('cpm')) {
    return 'Your advertising value (CPM) depends on your profile richness. High-value audiences (finance, healthcare, auto buyers) can be worth $10-$20 CPM. General audiences are $0.50-$2 CPM. Advertisers bid on your profile in millisecond auctions.';
  }

  if (normalized.includes('unique') || normalized.includes('identify')) {
    return '94% of browsers are uniquely identifiable through fingerprinting. Your combination of fonts, screen size, GPU, timezone, and other attributes creates a unique signature. The more "normal" your configuration, the less unique you are.';
  }

  // Default response
  return "I'm here to help you understand your browser fingerprint and privacy! Ask me about entropy, tracking methods, protection strategies, or what your data is worth to advertisers. Run a scan to get your personalized analysis.";
}

export { ai };
