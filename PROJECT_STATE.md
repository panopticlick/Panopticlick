# Panopticlick.org project state

Updated: 2026-07-28T04:03:19Z

## Production

- Project: `panopticlick.org`
- Cloudflare account alias: `Affiliateberry`
- Cloudflare Pages project: `panopticlick`
- Cloudflare Worker: `panopticlick-api`
- Active Worker version: `f3aabfe1-f8e7-441b-a56f-3e70270b95e4`
- Canonical production surface: `https://panopticlick.org/`
- Pages deployment receipt: `https://b79b81e3.panopticlick-8ys.pages.dev/`
- API endpoint: `https://api.panopticlick.org/`
- Custom domains: `panopticlick.org`, `www.panopticlick.org`

## Proven behavior

- The homepage is a statically exported, single-page investigation with one H1,
  server-rendered editorial evidence, local-only scanning by default, and
  progressive dossier, auction, valuation, defense, and AI sections.
- Explicit storage consent enables API-backed collection. The production flow
  returns a session-scoped HMAC token, stores the token with its session, and
  rejects the same status request without the token.
- Fingerprint uploads accept the current SDK's object-shaped plugin records,
  nullable font probe, and full passthrough signal surface without weakening
  required top-level validation.
- Privacy export, consent, data lookup, and opt-out are session-token scoped.
  Opt-out no longer deletes every session behind one IP, and D1 enforces one
  durable opt-out decision per fingerprint.
- The Worker uses separate global and AI rate-limit bindings, production-only
  CORS origins, a secret IP hash salt, aggregate-only analytics payloads, and a
  daily retention schedule.
- The blocker test uses 17 same-origin bait scripts plus an independent control
  probe. A failed control run is inconclusive instead of a false full score.
- AI chat supports multi-turn messages and uses OpenRouter's current free
  router. Its system prompt labels CPM, personas, and auction results as
  teaching-model outputs rather than observed bids.

## Validation receipt

- OpenClaw `pnpm typecheck && pnpm test && pnpm build`: pass.
- Typecheck: 8/8 workspace tasks.
- Tests: 16 files passed; 213 tests passed and 1 skipped.
- Next.js 16 static export: pass; 25 static routes generated.
- Production mobile browser QA at 390×844: pass for consent, local-only scan,
  dossier unlock, valuation consistency, defense, blocker test, CSP, console,
  uncaught errors, and horizontal overflow.
- Production API-backed browser QA: pass; scan start/collect/stats were 200,
  16 dossier exhibits included 4 network-side records, authorized status was
  200, and the same request without a token was 401.
- Production AI browser QA: pass; multi-turn requests were 200 and the current
  model returned a non-fallback answer that correctly described CPM as modeled,
  not a live advertiser bid.
- Production HTTP checks: apex 200 with one H1, self-canonical, CSP, and OG;
  `/scan` returns a 301 to `/`; OG and blocker-control assets return 200.
- Browser evidence:
  `/Users/butterfly/.codex/state/openclaw-test/oc-panopticlick.org-54eac05d/20260728T035253Z-result.json`
- Full validation artifact:
  `/Users/openclaw/artifacts/oc-panopticlick.org-54eac05d/exec/20260728T040056Z`

## Known limitations

- Cloudflare zone-level AI bot protection still returns 403 to OAI-SearchBot,
  GPTBot, ClaudeBot, and PerplexityBot while Googlebot receives 200. The current
  project token can read but cannot change that account setting.
- Cloudflare Managed Robots content still prepends training-bot `Disallow: /`
  directives ahead of the site-generated robots policy.
- Turnstile remains deliberately disabled until the frontend includes a widget;
  the two Worker rate-limit bindings are the current abuse controls.
- Analytics Engine remains unbound until the account enables it. All analytics
  calls degrade safely when the binding is absent.
- Internationalization and a real wildcard-domain HSTS supercookie experiment
  remain out of scope for this release.
