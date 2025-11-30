# CLAUDE.md - Panopticlick.org

> **Mission**: "Deconstruct Your Digital Shadow" - A Digital Self-Defense System exposing AdTech surveillance machinery.

## Project Overview

Panopticlick.org is the spiritual successor to the legendary EFF (Electronic Frontier Foundation) browser fingerprinting project. Unlike competitors that focus on detection, we expose the **money trail** behind tracking.

| Platform | Metaphor | Our Differentiation |
|----------|----------|---------------------|
| Pixelscan.dev | Debugger | Technical deep-dive |
| BrowserLeaks.io | Laboratory | Comprehensive testing |
| BrowserScan.org | Health Clinic | Risk scoring |
| **Panopticlick.org** | **Bureau of Investigation** | **Expose the money trail** |

## Technology Stack

```
Frontend:     Next.js 14+ (App Router) + TypeScript
Styling:      Tailwind CSS 4 + shadcn/ui
State:        Zustand
Animation:    Framer Motion
Backend:      Cloudflare Workers (Hono.js)
Database:     Cloudflare D1 (SQLite)
Storage:      Cloudflare KV + R2
```

## Project Structure

```
panopticlick.org/
├── apps/
│   └── web/                    # Next.js frontend
├── packages/
│   ├── fingerprint-sdk/        # Client-side collectors
│   ├── valuation-engine/       # RTB simulation & entropy
│   └── types/                  # Shared TypeScript types
├── workers/
│   └── api/                    # Cloudflare Worker (Hono.js)
└── docs/                       # Project documentation
    ├── ARCHITECTURE.md         # System architecture
    ├── IMPLEMENTATION.md       # Phase-by-phase plan
    ├── DATA-SCHEMA.md          # Database & API schemas
    ├── UI-DESIGN.md            # Design system
    └── FEATURES.md             # Feature specifications
```

## Design Aesthetic: "Investigative Journalism"

**Color Palette:**
- Paper: `#f4f4f5` (Zinc-100) - Newsprint background
- Ink: `#18181b` (Zinc-900) - Deep black text
- Redaction: `#000000` - Classified information
- Highlight: `#fde047` (Yellow-300) - Critical findings

**Typography:**
- Headlines: Merriweather (Serif) - Authority
- Data: JetBrains Mono - Technical precision
- Body: Inter (Sans) - Readability

## Killer Features

### 1. RTB Auction Simulator (P0)
Show users HOW their data is auctioned in real-time with dollar values.
- Simulates SSP → DSP data flow
- Shows bid amounts from mock advertisers
- Calculates estimated CPM value

### 2. Redacted Reveal UI (P0)
Sensitive data appears "classified" until hover.
- Creates visceral "privacy invasion" moment
- Black bars over IP, location, device info
- Hover to reveal actual values

### 3. HSTS Supercookie Drill (P1)
Demonstrate persistent tracking across sessions.
- Survives cookie clearing
- Works in incognito mode
- Educational demonstration

### 4. AdBlock Effectiveness Test (P1)
Test which trackers your adblocker catches.
- Bait scripts mimicking real trackers
- Score-based results
- Recommendations for improvement

## Development Commands

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build all packages
pnpm build

# Type checking
pnpm typecheck

# Linting
pnpm lint

# Run tests
pnpm test
```

## Key Files Reference

| File | Purpose |
|------|---------|
| `docs/ARCHITECTURE.md` | System architecture, tech stack, data flow |
| `docs/IMPLEMENTATION.md` | Phase-by-phase implementation plan |
| `docs/DATA-SCHEMA.md` | D1 schema, TypeScript types, API contracts |
| `docs/UI-DESIGN.md` | Design system, components, animations |
| `docs/FEATURES.md` | Killer features specification |

## Privacy-First Principles

1. **Never store raw IP** - Only SHA-256 hashes
2. **Never store raw fingerprints** - Only aggregate hashes
3. **Auto-delete after 30 days** - Data retention limit
4. **Opt-out mechanism** - `/opt-out` endpoint
5. **Consent required** - GDPR banner before collection

## Implementation Phases

| Phase | Focus | Key Deliverables |
|-------|-------|------------------|
| 0 | Foundation | Monorepo, CI/CD, Design System |
| 1 | Core Detection | Fingerprint collectors, entropy calc |
| 2 | The Mirror | Homepage, Redacted UI, Valuation |
| 3 | RTB Simulator | AdTech visualization |
| 4 | Supercookie Lab | HSTS persistence demo |
| 5 | Defense Armory | Blocker testing, hardening guides |
| 6 | Polish & Launch | SEO, performance, analytics |

## API Endpoints

```
POST /api/scan/start       # Start session, get sessionId
POST /api/scan/collect     # Submit fingerprint, get report
POST /api/rtb/simulate     # Run RTB auction simulation
POST /api/supercookie/set  # Set HSTS supercookie
POST /api/supercookie/read # Read HSTS supercookie
POST /api/defense/test     # Run adblocker test
GET  /api/stats/global     # Get global statistics
POST /api/opt-out          # Delete user data
```

## External Dependencies

- **ipinfo.io** - IP intelligence (batch endpoint)
- **Cloudflare** - Headers (cf-ipcountry, cf-ipcity)
- **Turnstile** - Bot detection

## Reference Projects

Located in `/Volumes/SSD/dev/new/ip-dataset/`:
- `amiunique.io` - Hash stability approach (80+ dimensions)
- `BrowserScan.org` - PDF export & risk scoring
- `Pixelscan.dev` - Debugger-style indicators
- `browserleaks` - Lab-based organization (23+ tests)
- `creepjs` - Advanced collectors (40+ techniques)
