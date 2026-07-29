# Panopticlick.org project state

Updated: 2026-07-29T10:59:16Z

## Production

- Project: `panopticlick.org`
- Cloudflare account alias: `Affiliateberry`
- Cloudflare Pages project: `panopticlick`
- Cloudflare Worker: `panopticlick-api`
- Deployed source commit: `c4bd4342f7b838c04d9b05762a970c3015496cbd`
- GitHub Actions deploy: `30445041049` — success
- Active Worker version: `35ee37f7-70f8-4b55-a5a2-47b707bd0307`
- Canonical production surface: `https://panopticlick.org/`
- Pages deployment receipt: `https://ddc63685.panopticlick-8ys.pages.dev/`
- API endpoint: `https://api.panopticlick.org/`
- Custom domains: `panopticlick.org` is live; `www.panopticlick.org` currently
  returns Cloudflare `522` and needs account-level Pages/DNS repair.

## Proven behavior

- The homepage is a statically exported, single-page investigation with one H1,
  server-rendered editorial evidence, local-only scanning by default, and
  progressive dossier, auction, valuation, defense, and AI sections.
- Explicit storage consent enables API-backed collection. The API returns a
  session-scoped, stateless HMAC ownership credential. The client stores that
  credential; the server does not store the token, and status requests without
  it are rejected.
- Fingerprint uploads accept the current SDK's object-shaped plugin records,
  nullable font probe, and full passthrough signal surface without weakening
  required top-level validation.
- Privacy export, consent, data lookup, and opt-out are session-token scoped.
  Opt-out no longer deletes every session behind one IP, and D1 enforces one
  durable opt-out decision per fingerprint.
- The Worker declares separate global and AI Workers Rate Limiting bindings,
  production-only CORS origins, a secret IP hash salt, aggregate-only analytics
  payloads, and a daily retention schedule.
- The blocker test uses 17 same-origin bait scripts plus an independent control
  probe. A failed control run is inconclusive instead of a false full score,
  and the production UI allows five seconds for a cold edge control request.
- AI chat supports multi-turn messages and uses OpenRouter's current free
  router. Its system prompt labels CPM, personas, and auction results as
  teaching-model outputs rather than observed bids.
- Evidence Cabinet long-form notes use an explicit 46rem editorial measure,
  16px/28px mobile body rhythm, distinct section spacing, and a stacked
  label/value presentation for the fingerprint exhibits table below 640px.

## Validation receipts

- Final OpenClaw command:
  `pnpm typecheck && pnpm test && pnpm build && QA_PORT=43210 node scripts/run-preview-qa.cjs`
- Typecheck: 8/8 workspace tasks.
- Tests: 21 files passed; 225 tests passed and 1 skipped.
- Next.js 16 static export: pass; 25 static routes generated.
- Preview browser acceptance: pass at 390×844 and 1440×1000, including
  local-only scan, restore/reset, CTA first-viewport placement, AI dialog focus
  trap/Escape/focus return, blocker control and simulated blocking, CSP,
  console, page errors, and horizontal overflow.
- Preview receipt:
  `/Users/butterfly/.codex/state/openclaw-test/oc-panopticlick.org-54eac05d/20260729T104614Z-result.json`
- Preview artifact:
  `/Users/openclaw/artifacts/oc-panopticlick.org-54eac05d/exec/20260729T104614Z`
- Production browser acceptance: pass at 390×844 and 1440×1000 with
  `consoleErrors=[]`, `pageErrors=[]`, no CSP violations, and both blocker
  outcomes verified.
- Production browser receipt:
  `/Users/butterfly/.codex/state/openclaw-test/oc-panopticlick.org-54eac05d/20260729T105313Z-result.json`
- Production browser artifact:
  `/Users/openclaw/artifacts/oc-panopticlick.org-54eac05d/exec/20260729T105313Z`
- Production API: root 200 with `environment=production`; scan start 200 with a
  token present; status with token 200; status without token 401; malformed
  JSON 400 without a stack; illegal Origin receives no ACAO.
- Production SEO/edge: apex, robots, llms.txt, sitemap, OG image, canonical and
  JSON-LD pass. Googlebot and OAI-SearchBot fetch the root and robots with 200.
- Final Lighthouse sample:
  - mobile: Performance 71, Accessibility 96, Best Practices 100, SEO 92;
  - desktop: Performance 92, Accessibility 96, Best Practices 100, SEO 92.
  Accessibility remains above the 95 target. Mobile Performance remains below
  the 90 target, and Lighthouse reports the Cloudflare-injected Managed Robots
  directive as an unknown directive.
- Evidence Cabinet screenshots:
  `/tmp/panopticlick-evidence-ui-20260729-local/` (four 390×900 and
  1440×1000 JPEGs; payload preflight and visual inspection passed).

## External blockers and residual risk

- `www.panopticlick.org` returns `522`. The Pages custom-domain mapping and the
  zone's `www` DNS record require an operator with Cloudflare Pages/DNS write
  permission in the correct account.
- Live crawler behavior is mixed: OAI-SearchBot and GPTBot return 200 on `/`;
  ClaudeBot and PerplexityBot return 403 on `/` while robots.txt returns 200.
  Cloudflare Managed Robots also prepends `Disallow: /` for GPTBot and
  ClaudeBot before the site's later Allow rules. Fixing this requires the
  correct Cloudflare account/profile and zone settings write permission.
- The AI rate-limit binding is present in the deployed Worker, but a fresh
  15-request validation-only burst returned 400 for every request; the 11th was
  not 429. Workers Rate Limiting is local, permissive, and eventually
  consistent, so an exact ordinal is not guaranteed, but zero 429 responses
  remains an unresolved production smoke failure requiring authenticated
  runtime/account inspection or a deterministic application-level limiter.
- Cloudflare automatic Web Analytics injection is blocked with
  `Cache-Control: no-transform` to preserve the consent promise and CSP. That
  also disables edge HTML compression; with the current account inaccessible,
  mobile Lighthouse Performance remains below the 90 target. An authorized
  operator should disable automatic Web Analytics, then remove `no-transform`,
  redeploy, and rerun Lighthouse.
- Analytics Engine remains unbound and optional; analytics calls degrade safely
  when the binding is absent.
- Turnstile, internationalization, and a real wildcard-domain HSTS supercookie
  experiment remain deliberately out of scope for this release.
