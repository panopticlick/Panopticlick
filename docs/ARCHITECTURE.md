# Panopticlick.org - System Architecture

> **Mission**: "Deconstruct Your Digital Shadow" - A Digital Self-Defense System exposing AdTech surveillance machinery.

## 1. Strategic Positioning

| Platform | Metaphor | Audience | Our Differentiation |
|----------|----------|----------|---------------------|
| Pixelscan.dev | Debugger | Developers | Technical deep-dive |
| BrowserLeaks.io | Laboratory | Researchers | Comprehensive testing |
| BrowserScan.org | Health Clinic | Privacy-conscious users | Risk scoring |
| **Panopticlick.org** | **Bureau of Investigation** | **Everyone** | **Expose the money trail** |

### Core Philosophy
- **Not just detection** - Show HOW you're tracked AND what it's worth
- **Narrative-driven** - Every test tells a story about surveillance capitalism
- **Actionable defense** - Validate that privacy tools actually work

---

## 2. Technology Stack

### Frontend
```
Framework:     Next.js 14+ (App Router)
Language:      TypeScript 5.x (strict mode)
Styling:       Tailwind CSS 4 + shadcn/ui (Radix primitives)
State:         Zustand (tracking session management)
Animations:    Framer Motion (RTB visualizations)
Charts:        Recharts (entropy visualizations)
Fonts:         Merriweather (serif headlines) + JetBrains Mono (data)
```

### Backend / Edge
```
Runtime:       Cloudflare Workers (Edge computing)
Framework:     Hono.js (lightweight, fast routing)
Database:      Cloudflare D1 (SQLite, edge-distributed)
Storage:       Cloudflare R2 (PDF reports)
Cache:         Cloudflare KV (session data, rate limiting)
DNS:           Cloudflare DNS (HSTS supercookie subdomains)
```

### External APIs
```
IP Intelligence:  ipinfo.io (batch endpoint)
Geolocation:      Cloudflare headers (cf-ipcountry, cf-ipcity)
Bot Detection:    Cloudflare Turnstile
```

### Development Tools
```
Package Manager:  pnpm (workspace support)
Build:            Turborepo (monorepo orchestration)
Testing:          Vitest (unit) + Playwright (E2E)
Linting:          ESLint + Prettier + TypeScript strict
CI/CD:            GitHub Actions → Cloudflare Pages
```

---

## 3. System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              USER'S BROWSER                                  │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                      Fingerprint Collectors                          │    │
│  │  [Canvas] [WebGL] [Audio] [Fonts] [Screen] [Timezone] [Behavior]    │    │
│  └──────────────────────────────┬──────────────────────────────────────┘    │
│                                 │                                            │
│  ┌──────────────────────────────┴──────────────────────────────────────┐    │
│  │                      RTB Simulator (Client)                          │    │
│  │  Visualizes data flow: User → SSP → DSP → Bid Response              │    │
│  └──────────────────────────────┬──────────────────────────────────────┘    │
└─────────────────────────────────┼───────────────────────────────────────────┘
                                  │ HTTPS POST
                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         CLOUDFLARE EDGE NETWORK                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                    Cloudflare Workers (Hono.js)                      │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐  │    │
│  │  │ /api/scan   │  │ /api/rtb    │  │ /api/hsts   │  │ /api/stats │  │    │
│  │  │   collect   │  │  simulate   │  │   probe     │  │   global   │  │    │
│  │  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └─────┬──────┘  │    │
│  │         │                │                │               │          │    │
│  │         ▼                ▼                ▼               ▼          │    │
│  │  ┌─────────────────────────────────────────────────────────────┐    │    │
│  │  │                    Valuation Engine                          │    │    │
│  │  │  • Entropy Calculator (bits of uniqueness)                   │    │    │
│  │  │  • CPM Estimator (ad market value simulation)                │    │    │
│  │  │  • Persona Classifier (segment inference)                    │    │    │
│  │  │  • Defense Auditor (blocker effectiveness)                   │    │    │
│  │  └──────────────────────────┬──────────────────────────────────┘    │    │
│  └─────────────────────────────┼───────────────────────────────────────┘    │
│                                │                                             │
│  ┌─────────────────────────────┼───────────────────────────────────────┐    │
│  │                  DATA LAYER │                                        │    │
│  │  ┌─────────────┐  ┌────────┴────────┐  ┌─────────────┐              │    │
│  │  │ Cloudflare  │  │  Cloudflare D1  │  │ Cloudflare  │              │    │
│  │  │     KV      │  │    (SQLite)     │  │     R2      │              │    │
│  │  │ ─────────── │  │ ─────────────── │  │ ─────────── │              │    │
│  │  │ Rate limits │  │ surveillance_   │  │ PDF reports │              │    │
│  │  │ Session IDs │  │ logs            │  │ Audit logs  │              │    │
│  │  │ HSTS tokens │  │ global_stats    │  │             │              │    │
│  │  └─────────────┘  └─────────────────┘  └─────────────┘              │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Monorepo Structure

```
panopticlick.org/
├── apps/
│   └── web/                          # Next.js frontend
│       ├── app/                      # App Router pages
│       │   ├── (home)/               # Landing page group
│       │   ├── simulation/           # RTB, Supercookie, CNAME pages
│       │   ├── anatomy/              # Fingerprint, Behavior, Network pages
│       │   ├── defense/              # Blocker test, DNS check, Hardening
│       │   └── manifesto/            # Privacy rights, Methodology
│       ├── components/
│       │   ├── ui/                   # shadcn/ui components
│       │   ├── redacted/             # Redaction effect components
│       │   ├── rtb/                  # RTB simulator components
│       │   └── entropy/              # Entropy gauge, fingerprint cards
│       ├── lib/
│       │   ├── collectors/           # Client-side fingerprint collectors
│       │   ├── hooks/                # React hooks (useFingerprint, useRTB)
│       │   └── stores/               # Zustand stores
│       └── public/
│           └── fonts/                # Merriweather, JetBrains Mono
│
├── packages/
│   ├── fingerprint-sdk/              # Standalone fingerprint collector
│   │   ├── src/
│   │   │   ├── collectors/           # Individual collectors
│   │   │   ├── hash.ts               # Hashing utilities
│   │   │   └── index.ts              # Main SDK export
│   │   └── package.json
│   │
│   ├── valuation-engine/             # CPM/Entropy calculation logic
│   │   ├── src/
│   │   │   ├── entropy.ts            # Entropy calculation
│   │   │   ├── cpm.ts                # Market value estimation
│   │   │   └── persona.ts            # User segment classification
│   │   └── package.json
│   │
│   └── types/                        # Shared TypeScript types
│       └── src/
│           ├── fingerprint.ts
│           ├── valuation.ts
│           └── api.ts
│
├── workers/
│   └── api/                          # Cloudflare Worker (Hono.js)
│       ├── src/
│       │   ├── routes/
│       │   │   ├── scan.ts           # Fingerprint collection endpoint
│       │   │   ├── rtb.ts            # RTB simulation endpoint
│       │   │   ├── hsts.ts           # HSTS supercookie probe
│       │   │   └── stats.ts          # Global statistics
│       │   ├── services/
│       │   │   ├── valuation.ts      # Valuation calculations
│       │   │   └── ip-intel.ts       # IP intelligence fetching
│       │   └── index.ts              # Hono app entry
│       └── wrangler.toml
│
├── docs/                             # Project documentation
│   ├── ARCHITECTURE.md               # This file
│   ├── IMPLEMENTATION.md             # Phase-by-phase plan
│   ├── DATA-SCHEMA.md                # Database & API schemas
│   ├── UI-DESIGN.md                  # Design system
│   └── FEATURES.md                   # Feature specifications
│
├── turbo.json                        # Turborepo config
├── pnpm-workspace.yaml               # pnpm workspace config
└── package.json                      # Root package.json
```

---

## 5. Data Flow Architecture

### A. Fingerprint Collection Flow

```
1. User lands on panopticlick.org
                │
                ▼
2. Consent banner (GDPR) - User opts in
                │
                ▼
3. Client-side collectors run in parallel:
   ┌────────────────────────────────────────┐
   │  Promise.allSettled([                  │
   │    collectCanvas(),                    │
   │    collectWebGL(),                     │
   │    collectAudio(),                     │
   │    collectFonts(),                     │
   │    collectScreen(),                    │
   │    collectTimezone(),                  │
   │    collectBehavior(),                  │
   │  ])                                    │
   └───────────────────┬────────────────────┘
                       │
                       ▼
4. Hash generation (SHA-256):
   - Hardware Hash (Canvas + WebGL + Audio + Screen)
   - Software Hash (UA + Fonts + Timezone + Language)
   - Full Hash (Hardware + Software + Network)
                       │
                       ▼
5. POST to /api/scan/collect
   - Fingerprint payload
   - Cloudflare headers injected (IP, ASN, Country)
                       │
                       ▼
6. Worker processes:
   - Calculate entropy (bits of uniqueness)
   - Estimate CPM value
   - Classify persona segment
   - Check defense status
   - Store anonymized record in D1
                       │
                       ▼
7. Return ValuationReport to client
```

### B. RTB Simulation Flow

```
1. Client sends fingerprint summary to /api/rtb/simulate
                │
                ▼
2. Worker builds OpenRTB-style bid request:
   {
     "id": "pano_xxx",
     "imp": [{ "bidfloor": 0.001 }],
     "device": { /* from fingerprint */ },
     "user": { /* inferred segments */ }
   }
                │
                ▼
3. Simulate responses from mock DSPs:
   - "Google Ads" → Interest: Tech → Bid: $0.005
   - "Criteo" → Interest: Retargeting → Bid: $0.004
   - "The Trade Desk" → Interest: Luxury → Bid: $0.008
                │
                ▼
4. Return auction log stream to client
                │
                ▼
5. Client animates bid cards appearing in real-time
```

### C. HSTS Supercookie Flow

```
Phase 1: ID Assignment (First Visit)
──────────────────────────────────────
1. User visits panopticlick.org
2. Worker generates unique ID: "pano_abc123"
3. Encode ID into subdomain bits:
   - ID bit 0 = 1 → set0.hsts.panopticlick.org (HSTS enabled)
   - ID bit 1 = 0 → set1.hsts.panopticlick.org (no HSTS)
   - ... (repeat for 32 bits)
4. Load invisible images from each subdomain
5. Browser caches HSTS state per subdomain

Phase 2: ID Retrieval (Return Visit / Incognito)
──────────────────────────────────────────────────
1. User returns (even in incognito mode)
2. Client attempts to load subdomains via HTTP:
   - read0.hsts.panopticlick.org
   - read1.hsts.panopticlick.org
   - ...
3. Browser auto-upgrades to HTTPS for remembered subdomains
4. By checking which were upgraded, reconstruct the ID
5. Display: "We still know you're pano_abc123"
```

---

## 6. Security Architecture

### Data Protection
| Principle | Implementation |
|-----------|----------------|
| IP Anonymization | Store hashed IP only, never raw |
| Data Minimization | Only collect necessary signals |
| Retention Limit | Auto-delete after 30 days |
| Opt-out | `/opt-out` endpoint for data deletion |

### Request Security
| Layer | Protection |
|-------|------------|
| DDoS | Cloudflare WAF + Rate Limiting |
| Bot Detection | Turnstile challenge on collection |
| CORS | Strict origin allowlist |
| CSP | Restrictive Content-Security-Policy |
| HTTPS | HSTS with 1-year max-age |

### Privacy-First Design
```typescript
// Example: Never store raw fingerprints
const record = {
  id: generateUUID(),
  ip_hash: sha256(request.headers.get('cf-connecting-ip')),
  entropy_total: calculateEntropy(fingerprint),
  // Raw fingerprint is NEVER stored
  unique_factor: getMostUniqueSignal(fingerprint),
  created_at: Date.now(),
};
```

---

## 7. Performance Targets

| Metric | Target | Strategy |
|--------|--------|----------|
| Time to First Byte | < 100ms | Edge deployment (Workers) |
| Collection Time | < 2s | Parallel collectors |
| API Response | < 200ms | D1 query optimization |
| Lighthouse Score | > 90 | Static optimization, font subsetting |
| Bundle Size | < 100KB gzipped | Tree-shaking, dynamic imports |

---

## 8. Deployment Architecture

```
GitHub Repository
       │
       │ push to main
       ▼
┌──────────────────┐
│  GitHub Actions  │
│  ──────────────  │
│  • pnpm install  │
│  • turbo build   │
│  • vitest run    │
│  • playwright    │
└────────┬─────────┘
         │
         │ deploy
         ▼
┌──────────────────────────────────────────────┐
│           Cloudflare Infrastructure          │
│  ┌──────────────┐     ┌──────────────────┐  │
│  │ Cloudflare   │     │ Cloudflare       │  │
│  │ Pages        │     │ Workers          │  │
│  │ ──────────── │     │ ────────────────│  │
│  │ Next.js SSG  │ ←── │ API routes       │  │
│  │ Static assets│     │ Edge functions   │  │
│  └──────────────┘     └──────────────────┘  │
│         │                     │              │
│         └──────────┬──────────┘              │
│                    ▼                         │
│  ┌─────────────────────────────────────┐    │
│  │  D1 (SQLite)  │  KV  │  R2 (Blobs)  │    │
│  └─────────────────────────────────────┘    │
└──────────────────────────────────────────────┘
```

---

## 9. Key Architectural Decisions

### Decision 1: Why Cloudflare over Vercel?
- **HSTS Supercookie**: Requires custom subdomain DNS control
- **Edge Performance**: D1 is co-located with Workers
- **Cost**: Workers is more cost-effective for high-traffic

### Decision 2: Why Hono.js over raw Workers?
- **Type Safety**: Full TypeScript support with request/response types
- **Middleware**: Easy composition of auth, logging, CORS
- **Developer Experience**: Familiar Express-like syntax

### Decision 3: Why Zustand over Redux?
- **Simplicity**: Minimal boilerplate for tracking session state
- **Performance**: No provider wrapper, direct store access
- **Size**: ~1KB vs ~7KB for Redux Toolkit

### Decision 4: Why D1 over KV for main storage?
- **SQL Queries**: Complex aggregations for global stats
- **Relational**: Join capability for future features
- **Consistency**: ACID transactions for data integrity

---

## 10. Future Scalability

### Phase 1 (MVP)
- Single D1 database
- Basic KV caching
- Manual deployments

### Phase 2 (Growth)
- D1 read replicas
- Durable Objects for real-time RTB
- Automated CI/CD

### Phase 3 (Scale)
- Multi-region D1
- R2 for historical data archival
- Analytics Engine for aggregations
