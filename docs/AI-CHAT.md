# AI Chat Feature - Fingerprint Analysis Assistant

## Overview

The Panopticlick AI Chat feature provides users with an intelligent assistant to help them understand their browser fingerprint analysis, privacy protection strategies, and AdTech surveillance mechanisms.

## Features

### 🎯 Core Features

1. **15-Second Delayed Prompt**
   - After page load, a subtle prompt appears after 15 seconds
   - Non-intrusive notification bubble with Panopticlick eye icon
   - Encourages user engagement without being pushy

2. **Panopticlick Eye Icon**
   - Custom eye icon design that echoes the domain name and surveillance theme
   - Animated pulsing effect to draw attention
   - Consistent with "Bureau of Investigation" aesthetic

3. **Quick Start Questions**
   - Pre-configured questions about fingerprinting concepts
   - One-click to ask common questions:
     - "How unique is my fingerprint?"
     - "How can I protect my privacy?"
     - "What is entropy?"
     - "Am I being tracked?"
     - "How much is my data worth?"
     - "What is canvas fingerprinting?"

4. **Premium Design**
   - Glassmorphism effects with backdrop blur
   - Smooth animations powered by Framer Motion
   - Gradient backgrounds and hover effects
   - Investigative journalism aesthetic (newsprint colors)

5. **Security-First Architecture**
   - OpenRouter API key stored securely in Cloudflare Worker environment
   - Never exposed to client-side code
   - Rate limiting: 10 requests per minute per IP
   - Fallback responses when API is unavailable

## Architecture

### Frontend (Next.js)

**Component**: `apps/web/src/components/ai/fingerprint-chat.tsx`

- Client-side chat UI component
- Uses Framer Motion for animations
- Calls API proxy endpoint (never directly to OpenRouter)
- State management with React hooks
- Responsive design (mobile-first)

### Backend (Cloudflare Worker)

**Route**: `workers/api/src/routes/ai.ts`

- Secure proxy to OpenRouter API
- API key stored in environment variables
- Rate limiting per IP address
- Request validation with Zod schema
- Fallback responses for offline mode

**Endpoint**: `POST /v1/ai/chat`

**Request Format**:
```json
{
  "prompt": "How unique is my fingerprint?",
  "fingerprintContext": {
    "entropy": 33.2,
    "uniqueness": "1 in 286,435",
    "trackers": 12
  }
}
```

**Response Format**:
```json
{
  "success": true,
  "message": {
    "id": "uuid",
    "role": "assistant",
    "content": "Your browser has high entropy..."
  }
}
```

## Setup Instructions

### 1. Get OpenRouter API Key

1. Visit: https://openrouter.ai/keys
2. Sign up for a free account
3. Generate an API key (format: `sk-or-v1-...`)

### 2. Configure Environment Variables

#### Local Development

Create `.dev.vars` file in `workers/api/`:

```bash
cd workers/api
cp .dev.vars.example .dev.vars
```

Edit `.dev.vars`:
```bash
OPENROUTER_API_KEY=sk-or-v1-your-actual-key-here
OPENROUTER_MODEL=google/gemini-2.0-flash-exp:free
```

**⚠️ NEVER commit `.dev.vars` to git!**

#### Production Deployment

Set secrets using Wrangler CLI:

```bash
cd workers/api
npx wrangler secret put OPENROUTER_API_KEY
# Enter your API key when prompted
```

Or via Cloudflare Dashboard:
1. Go to Workers & Pages
2. Select `panopticlick-api`
3. Settings → Environment Variables
4. Add `OPENROUTER_API_KEY` as a secret

### 3. Install Dependencies

```bash
# Install nanoid for unique message IDs
pnpm add nanoid --filter @panopticlick/web

# Or install all dependencies
pnpm install
```

### 4. Run Development Server

```bash
# Terminal 1: Start Cloudflare Worker
cd workers/api
pnpm dev

# Terminal 2: Start Next.js app
cd apps/web
pnpm dev
```

Visit: http://localhost:3000

## Model Selection

### Recommended Free Models (2024-12-10)

| Model | Speed | Context | Best For |
|-------|-------|---------|----------|
| `google/gemini-2.0-flash-exp:free` | 3.22s | 1M tokens | **Default** - Fast, large context |
| `meta-llama/llama-3.3-70b-instruct:free` | 4.48s | 131K tokens | Complex reasoning |
| `qwen/qwen3-coder:free` | 3.57s | 262K tokens | Technical explanations |
| `tngtech/deepseek-r1t-chimera:free` | 4.30s | 164K tokens | Step-by-step reasoning |

To change the model, update `wrangler.toml`:

```toml
OPENROUTER_MODEL = "meta-llama/llama-3.3-70b-instruct:free"
```

Or set via environment variable:
```bash
npx wrangler secret put OPENROUTER_MODEL
```

## Customization

### Modify Quick Start Questions

Edit `apps/web/src/components/ai/fingerprint-chat.tsx`:

```typescript
const QUICK_START_QUESTIONS = [
  'Your custom question 1',
  'Your custom question 2',
  // ...
];
```

### Adjust Delayed Prompt Timing

```typescript
const PROMPT_DELAY_MS = 20000; // 20 seconds instead of 15
```

### Change Rate Limiting

Edit `workers/api/src/routes/ai.ts`:

```typescript
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 15; // 15 requests instead of 10
```

### Customize System Prompt

Edit `buildSystemPrompt()` function in `workers/api/src/routes/ai.ts`:

```typescript
function buildSystemPrompt(): string {
  return `You are a browser fingerprinting expert...`;
}
```

## UI Components

### Chat Button (Floating)

- Fixed position: bottom-right corner
- Eye icon with pulsing animation
- Yellow gradient background (#fde047)
- Hover effect: scales up to 1.1x
- Click to open chat window

### Chat Window

- Glassmorphism design (backdrop-blur)
- Responsive: adapts to mobile screens
- Header with eye icon and title
- Scrollable message area
- Quick start buttons (first 2 messages)
- Input field with send button

### Prompt Bubble

- Appears after 15 seconds
- Non-modal overlay
- Eye icon + message + CTA button
- Click to open chat immediately
- Smooth fade-in/out animations

## Fallback Responses

When OpenRouter API is unavailable, the system provides intelligent fallback responses based on keywords:

- **entropy** → Explanation of entropy and uniqueness
- **track** → How tracking works and protection methods
- **protect/safe** → Privacy protection strategies
- **canvas/webgl** → Canvas and WebGL fingerprinting explained
- **value/worth/cpm** → Advertising value explanation
- **unique/identify** → Browser uniqueness statistics

Fallback responses use the same tone and style as AI-generated responses.

## Security Best Practices

### ✅ DO

- Store API key in Cloudflare Worker secrets
- Use environment variables for configuration
- Implement rate limiting
- Validate all user input with Zod
- Add request/response logging
- Monitor usage via OpenRouter dashboard

### ❌ DON'T

- Commit API keys to git
- Expose API keys in client-side code
- Skip input validation
- Allow unlimited requests
- Hard-code model names in frontend

## Cost Management

### Free Tier Limits

- **OpenRouter Free Models**: No API cost (rate limited by provider)
- **Cloudflare Workers**: 100,000 requests/day free
- **Cloudflare KV**: 100,000 reads/day free

### Monitoring Usage

1. **OpenRouter Dashboard**: https://openrouter.ai/activity
   - Track request count
   - View response times
   - Monitor errors

2. **Cloudflare Analytics**:
   - Workers → `panopticlick-api` → Metrics
   - Monitor requests per endpoint
   - Check error rates

### Rate Limiting Strategy

Current implementation:
- **IP-based**: 10 requests per minute per IP
- **In-memory store**: Resets on worker restart
- **Upgrade path**: Use Cloudflare Durable Objects for persistent rate limiting

## Troubleshooting

### Chat Button Not Appearing

1. Check browser console for errors
2. Verify `FingerprintChat` is imported in `layout.tsx`
3. Check z-index conflicts with other components

### API Errors (429 Rate Limited)

1. Check OpenRouter dashboard for usage
2. Wait 1 minute and retry
3. Consider switching to a different free model
4. Upgrade to paid tier if needed

### Fallback Responses Only

1. Verify `.dev.vars` file exists and has correct API key
2. Check Cloudflare Worker logs:
   ```bash
   cd workers/api
   npx wrangler tail
   ```
3. Test API key directly:
   ```bash
   curl https://openrouter.ai/api/v1/models \
     -H "Authorization: Bearer $OPENROUTER_API_KEY"
   ```

### CORS Errors

1. Verify API endpoint in chat component matches worker URL
2. Check `ALLOWED_ORIGINS` in `wrangler.toml`
3. Ensure CORS middleware is active in worker

## Future Enhancements

### Planned Features

- [ ] Chat history persistence (localStorage)
- [ ] Export chat transcript as PDF
- [ ] Voice input support
- [ ] Multilingual support (i18n)
- [ ] Context-aware responses (pass actual fingerprint data)
- [ ] Suggested follow-up questions
- [ ] Typing indicators
- [ ] Message reactions

### Advanced Integrations

- [ ] Integrate with scan results page
- [ ] Show inline data visualizations
- [ ] Link to relevant documentation sections
- [ ] Provide actionable privacy recommendations
- [ ] Compare user's fingerprint to population averages

## References

- **OpenRouter Docs**: https://openrouter.ai/docs
- **Free Models List**: See `/Volumes/SSD/AI/OpenRouter/OPENROUTER_FREE_MODELS_API.md`
- **Cloudflare Workers**: https://developers.cloudflare.com/workers
- **Framer Motion**: https://www.framer.com/motion/
- **Reference Implementation**: `/Volumes/SSD/dev/project/timezone/whatismytimezone`

## Support

For issues or questions:
1. Check this documentation
2. Review Cloudflare Worker logs
3. Check OpenRouter dashboard
4. Open GitHub issue with error details

---

**Last Updated**: 2024-12-10
**Version**: 1.0.0
**Author**: Panopticlick Team
