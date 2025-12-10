/**
 * AI Chat Route - Secure OpenRouter API Proxy
 *
 * Security: API key is stored in Cloudflare Worker environment variables,
 * never exposed to the client. Rate limiting applied per IP.
 */

import { Hono } from 'hono';
import { z } from 'zod';
import type { Env } from '../types';

const ai = new Hono<{ Bindings: Env }>();

// Request validation schema
const chatRequestSchema = z.object({
  prompt: z.string().min(1).max(1000),
  fingerprintContext: z.object({
    entropy: z.number().optional(),
    uniqueness: z.string().optional(),
    trackers: z.number().optional(),
  }).optional(),
});

// Rate limiting: 10 requests per minute per IP
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 10;

// In-memory rate limit store (will be reset on worker restart)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(ip);

  if (!record || now > record.resetAt) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return false;
  }

  record.count++;
  return true;
}

/**
 * POST /api/ai/chat
 * Proxy to OpenRouter API with security
 */
ai.post('/chat', async (c) => {
  try {
    // Get client IP for rate limiting
    const clientIP = c.req.header('cf-connecting-ip') || 'unknown';

    // Check rate limit
    if (!checkRateLimit(clientIP)) {
      return c.json(
        {
          success: false,
          error: 'Rate limit exceeded. Please try again in a minute.',
        },
        429
      );
    }

    // Validate request body
    const body = await c.req.json();
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

    const { prompt, fingerprintContext } = result.data;

    // Get OpenRouter API key from environment
    const apiKey = c.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      // Fallback response if API key not configured
      return c.json({
        success: true,
        message: {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: buildFallbackResponse(prompt, fingerprintContext),
        },
        meta: { fallback: true },
      });
    }

    // Call OpenRouter API
    const model = c.env.OPENROUTER_MODEL || 'google/gemini-2.0-flash-exp:free';
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
          {
            role: 'user',
            content: buildUserPrompt(prompt, fingerprintContext),
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    const content =
      data.choices?.[0]?.message?.content ||
      buildFallbackResponse(prompt, fingerprintContext);

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
    const body = await c.req.json();
    return c.json({
      success: true,
      message: {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: buildFallbackResponse(body.prompt, body.fingerprintContext),
      },
      meta: { fallback: true },
    });
  }
});

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
- If unsure, direct users to run another test or check our documentation`;
}

function buildUserPrompt(
  prompt: string,
  context?: { entropy?: number; uniqueness?: string; trackers?: number }
): string {
  let contextStr = '';

  if (context) {
    const parts = [];
    if (context.entropy) parts.push(`Entropy: ${context.entropy} bits`);
    if (context.uniqueness) parts.push(`Uniqueness: ${context.uniqueness}`);
    if (context.trackers) parts.push(`Trackers detected: ${context.trackers}`);

    if (parts.length > 0) {
      contextStr = `\n\n[User's fingerprint context: ${parts.join(', ')}]`;
    }
  }

  return `${prompt}${contextStr}`;
}

function buildFallbackResponse(
  prompt: string,
  context?: { entropy?: number; uniqueness?: string; trackers?: number }
): string {
  const normalized = prompt.toLowerCase();

  // Context-aware responses
  if (context?.entropy && context.entropy > 30) {
    return "Your browser has high entropy (over 30 bits), making you highly unique. This means you're easily trackable even without cookies. Consider using privacy-focused browsers like Brave or Firefox with fingerprint protection enabled.";
  }

  // Keyword-based responses
  if (normalized.includes('entropy')) {
    return 'Entropy measures how unique your browser fingerprint is. Higher entropy (measured in bits) means more uniqueness. 33+ bits means you\'re identifiable among billions of users. Lower your entropy by using common browser configurations and privacy extensions.';
  }

  if (normalized.includes('track') || normalized.includes('follow')) {
    return 'Trackers use your fingerprint to follow you across websites without cookies. Your unique browser configuration acts like a signature. Use adblockers, disable WebRTC, and limit JavaScript to reduce tracking.';
  }

  if (normalized.includes('protect') || normalized.includes('safe')) {
    return 'To protect yourself: 1) Use Brave or Firefox with privacy settings enabled, 2) Install uBlock Origin and Privacy Badger, 3) Disable WebRTC, 4) Use standard screen resolutions. Check our Defense Armory page for detailed guides.';
  }

  if (normalized.includes('canvas') || normalized.includes('webgl')) {
    return 'Canvas and WebGL fingerprinting exploit how your GPU renders graphics. Each device produces slightly different results. You can block these using Canvas Blocker extension or browser fingerprint protection features.';
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
