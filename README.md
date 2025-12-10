# Panopticlick.org

> **Deconstruct Your Digital Shadow** - A Digital Self-Defense System

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-14+-black)
![Cloudflare](https://img.shields.io/badge/Cloudflare-Workers-orange)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4+-blue)
![pnpm](https://img.shields.io/badge/pnpm-9.0+-yellow)

## What is Panopticlick?

Panopticlick is the spiritual successor to the legendary [EFF Panopticlick project](https://coveryourtracks.eff.org/). We don't just detect browser fingerprints—we expose the **advertising surveillance machinery** and show you exactly what your data is worth on the open market.

### Key Features

| Feature | Description |
|---------|-------------|
| **RTB Simulator** | Watch your data get auctioned in real-time with actual dollar values |
| **Redacted Reveal** | Sensitive data appears classified until you hover—feel the privacy violation |
| **HSTS Supercookie Demo** | Learn how security features can be weaponized for persistent tracking |
| **WebRTC Leak Test** | Check if your VPN is really protecting your IP address |
| **DNS Leak Test** | Verify your DNS queries aren't exposing your browsing history |
| **Ad Blocker Test** | Measure your ad blocker's effectiveness against real-world trackers |
| **Defense Audit** | Get personalized recommendations to improve your privacy |

## Quick Start

```bash
# Clone the repository
git clone https://github.com/your-org/panopticlick.org.git
cd panopticlick.org

# Install dependencies
pnpm install

# Start all development servers
pnpm dev

# Or start specific apps
pnpm --filter @panopticlick/web dev     # Frontend: http://localhost:3000
pnpm --filter @panopticlick/api dev     # API: http://localhost:8787
```

## Project Structure

```
panopticlick.org/
├── apps/
│   └── web/                   # Next.js 14+ frontend (Cloudflare Pages)
│       ├── src/
│       │   ├── app/           # App Router pages
│       │   ├── components/    # React components
│       │   └── lib/           # Utilities, hooks, API client
│       └── public/            # Static assets
│
├── packages/
│   ├── fingerprint-sdk/       # Browser fingerprint collection
│   │   └── src/
│   │       ├── collectors/    # Canvas, WebGL, Audio, Fonts, etc.
│   │       ├── defense/       # Blocker test, WebRTC/DNS leak detection
│   │       └── supercookie/   # HSTS supercookie demonstration
│   │
│   ├── valuation-engine/      # Advertising value calculation
│   │   └── src/
│   │       ├── entropy.ts     # Shannon entropy calculation
│   │       ├── rtb.ts         # RTB auction simulation
│   │       ├── defense.ts     # Defense score analysis
│   │       └── report.ts      # Report generation
│   │
│   └── types/                 # Shared TypeScript definitions
│
├── workers/
│   └── api/                   # Cloudflare Worker backend (Hono.js)
│       └── src/
│           ├── routes/        # API endpoints
│           └── db/            # D1 database schema
│
└── docs/                      # Documentation
```

## Available Scripts

```bash
# Development
pnpm dev                    # Start all apps in development mode
pnpm dev:web                # Start frontend only
pnpm dev:api                # Start API only

# Building
pnpm build                  # Build all packages and apps
pnpm build:web              # Build frontend for production
pnpm build:api              # Build Worker for deployment

# Testing
pnpm test                   # Run all tests
pnpm typecheck              # Type checking across all packages
pnpm lint                   # ESLint across all packages

# Deployment
pnpm deploy:web             # Deploy to Cloudflare Pages
pnpm deploy:api             # Deploy Worker to Cloudflare
```

## Tech Stack

### Frontend
- **Next.js 14+** - React framework with App Router
- **TypeScript 5.4+** - Type safety
- **Tailwind CSS 3.4+** - Utility-first styling
- **Framer Motion** - Animations
- **shadcn/ui** - Accessible components

### Backend
- **Cloudflare Workers** - Edge computing
- **Hono.js** - Lightweight web framework
- **Cloudflare D1** - SQLite at the edge
- **Cloudflare KV** - Key-value storage

### Build Tools
- **pnpm 9+** - Fast package manager
- **Turborepo** - Monorepo build system
- **esbuild** - Fast bundling

## Privacy Commitment

We practice what we preach:

- ✅ **No tracking** - We don't use analytics or third-party scripts
- ✅ **Client-side by default** - All analysis happens in your browser
- ✅ **No cookies** - We don't use cookies or persistent identifiers
- ✅ **Opt-in only** - Data only stored with explicit consent
- ✅ **Data ownership** - View, export, or delete your data anytime
- ✅ **Open source** - Review our methodology

## Pages & Routes

| Route | Description |
|-------|-------------|
| `/` | Homepage with scan preview |
| `/scan/` | Full fingerprint scan with RTB simulation |
| `/tests/` | Privacy test suite index |
| `/tests/webrtc/` | WebRTC IP leak detection |
| `/tests/dns/` | DNS leak detection |
| `/tests/blocker/` | Ad blocker effectiveness test |
| `/tests/hsts/` | HSTS Supercookie demonstration |
| `/about/` | About the project |
| `/methodology/` | Technical methodology documentation |
| `/privacy/` | Privacy policy (GDPR/CCPA compliant) |

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/scan` | POST | Submit fingerprint scan |
| `/api/v1/scan/:id` | GET/DELETE | Retrieve or delete scan |
| `/api/v1/rtb/simulate` | POST | Run RTB auction simulation |
| `/api/v1/defense/dns` | GET | DNS leak test |
| `/api/v1/stats` | GET | Global fingerprint statistics |
| `/api/v1/privacy/data/:id` | GET/DELETE | GDPR data access/deletion |

## Deployment

### Cloudflare Pages (Frontend)

```bash
# Build for production
pnpm build:web

# Deploy (requires wrangler)
wrangler pages deploy apps/web/out --project-name=panopticlick
```

### Cloudflare Workers (API)

```bash
# Build and deploy
cd workers/api
wrangler deploy
```

### Environment Variables

```bash
# apps/web/.env.local
NEXT_PUBLIC_API_URL=https://api.panopticlick.org

# workers/api/.dev.vars
D1_DATABASE_ID=your-d1-database-id
KV_NAMESPACE_ID=your-kv-namespace-id
```

## Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines

- Run `pnpm typecheck` before committing
- Maintain test coverage for new features
- Follow the existing code style
- Update documentation for API changes

## Documentation

| Document | Description |
|----------|-------------|
| [ARCHITECTURE.md](./docs/ARCHITECTURE.md) | System architecture and data flow |
| [IMPLEMENTATION.md](./docs/IMPLEMENTATION.md) | Phase-by-phase implementation |
| [DATA-SCHEMA.md](./docs/DATA-SCHEMA.md) | Database schema and API contracts |
| [UI-DESIGN.md](./docs/UI-DESIGN.md) | Design system and components |
| [FEATURES.md](./docs/FEATURES.md) | Feature specifications |

## License

MIT License - See [LICENSE](./LICENSE) for details.

---

<p align="center">
  <strong>Built with privacy in mind</strong><br>
  <em>Because surveillance capitalism shouldn't be invisible.</em>
</p>

<p align="center">
  <a href="https://panopticlick.org">Website</a> •
  <a href="https://github.com/Panopticlick/Panopticlick">GitHub</a>
</p>
