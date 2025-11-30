# Panopticlick.org - Implementation Plan

> Phase-by-phase execution blueprint for resurrecting the legendary EFF project.

---

## Phase Overview

| Phase | Name | Focus | Deliverables |
|-------|------|-------|--------------|
| 0 | Foundation | Monorepo, CI/CD, Design System | Deployable skeleton |
| 1 | Core Detection | Fingerprint collectors, entropy calc | Basic scan functionality |
| 2 | The Mirror | Homepage, Redacted UI, Valuation | User-facing experience |
| 3 | RTB Simulator | AdTech visualization | Killer feature #1 |
| 4 | Supercookie Lab | HSTS/Favicon persistence | Killer feature #2 |
| 5 | Defense Armory | Blocker testing, hardening guides | User empowerment |
| 6 | Polish & Launch | SEO, performance, analytics | Production ready |

---

## Phase 0: Foundation

### 0.1 Monorepo Setup

```bash
# Initialize project
mkdir panopticlick.org && cd panopticlick.org
pnpm init

# Create workspace structure
mkdir -p apps/web packages/{fingerprint-sdk,valuation-engine,types} workers/api docs

# Install Turborepo
pnpm add -D turbo
```

**Files to create:**

```yaml
# pnpm-workspace.yaml
packages:
  - 'apps/*'
  - 'packages/*'
  - 'workers/*'
```

```json
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {},
    "typecheck": {}
  }
}
```

### 0.2 Next.js App Setup

```bash
cd apps/web
pnpm create next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

**Configure for Cloudflare:**

```bash
pnpm add @opennextjs/cloudflare
```

```javascript
// next.config.js
const nextConfig = {
  output: 'export',  // Static export for Cloudflare Pages
  images: { unoptimized: true },
};
```

### 0.3 Worker Setup

```bash
cd workers/api
pnpm add hono
pnpm add -D wrangler @cloudflare/workers-types
```

```toml
# wrangler.toml
name = "panopticlick-api"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[[d1_databases]]
binding = "DB"
database_name = "panopticlick-db"
database_id = "YOUR_D1_ID"

[[kv_namespaces]]
binding = "KV"
id = "YOUR_KV_ID"
```

### 0.4 Design System Foundation

**Install dependencies:**

```bash
cd apps/web
pnpm add @radix-ui/react-slot class-variance-authority clsx tailwind-merge
pnpm add lucide-react framer-motion recharts
npx shadcn-ui@latest init
```

**Tailwind config:**

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // The Bureau palette
        paper: '#f4f4f5',      // Zinc-100 (newsprint)
        ink: '#18181b',        // Zinc-900 (deep black)
        redaction: '#000000',  // Pure black (classified)
        highlight: '#fde047',  // Yellow-300 (highlighter)
        evidence: '#3b82f6',   // Blue-500 (links/evidence)
      },
      fontFamily: {
        serif: ['Merriweather', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
      },
      animation: {
        'redact-reveal': 'redact-reveal 0.3s ease-out forwards',
        'bid-enter': 'bid-enter 0.5s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'redact-reveal': {
          '0%': { backgroundColor: '#000', color: '#000' },
          '100%': { backgroundColor: 'transparent', color: '#18181b' },
        },
        'bid-enter': {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
```

### 0.5 CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - run: pnpm install
      - run: pnpm turbo build
      - run: pnpm turbo lint
      - run: pnpm turbo typecheck

      - name: Deploy to Cloudflare Pages
        if: github.ref == 'refs/heads/main'
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CF_API_TOKEN }}
          accountId: ${{ secrets.CF_ACCOUNT_ID }}
          projectName: panopticlick
          directory: apps/web/out
```

### Phase 0 Deliverables Checklist

- [ ] Monorepo with Turborepo configured
- [ ] Next.js app with Cloudflare adapter
- [ ] Hono Worker skeleton
- [ ] Tailwind with Bureau color palette
- [ ] GitHub Actions CI/CD
- [ ] D1 database created
- [ ] KV namespace created

---

## Phase 1: Core Detection

### 1.1 Shared Types Package

```typescript
// packages/types/src/fingerprint.ts
export interface FingerprintPayload {
  meta: {
    sessionId: string;
    timestamp: number;
    collectDuration: number;
    version: string;
  };

  hardware: {
    canvas: CanvasFingerprint | null;
    webgl: WebGLFingerprint | null;
    audio: AudioFingerprint | null;
    screen: ScreenFingerprint;
    cpu: number;  // navigator.hardwareConcurrency
    memory: number | null;  // navigator.deviceMemory
  };

  software: {
    userAgent: string;
    platform: string;
    language: string;
    languages: string[];
    timezone: string;
    timezoneOffset: number;
    fonts: string[];
    plugins: string[];
    cookiesEnabled: boolean;
    doNotTrack: string | null;
  };

  capabilities: {
    localStorage: boolean;
    sessionStorage: boolean;
    indexedDB: boolean;
    webWorker: boolean;
    serviceWorker: boolean;
    webGL: boolean;
    webGL2: boolean;
    webRTC: boolean;
  };

  network: {
    connectionType: string | null;
    downlink: number | null;
    rtt: number | null;
  };
}

export interface CanvasFingerprint {
  hash: string;
  dataUrl?: string;  // Optional, for display
}

export interface WebGLFingerprint {
  hash: string;
  vendor: string;
  renderer: string;
  extensions: string[];
}

export interface AudioFingerprint {
  hash: string;
  sampleRate: number;
}

export interface ScreenFingerprint {
  width: number;
  height: number;
  availWidth: number;
  availHeight: number;
  colorDepth: number;
  pixelRatio: number;
}
```

### 1.2 Fingerprint SDK

```typescript
// packages/fingerprint-sdk/src/collectors/canvas.ts
export async function collectCanvas(): Promise<CanvasFingerprint | null> {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 50;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Draw deterministic pattern
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('Panopticlick <canvas> 1.0', 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText('Panopticlick <canvas> 1.0', 4, 17);

    // Add emoji for cross-platform variance
    ctx.fillText('🦊🐻', 150, 20);

    const dataUrl = canvas.toDataURL();
    const hash = await sha256(dataUrl);

    return { hash, dataUrl };
  } catch {
    return null;
  }
}

// packages/fingerprint-sdk/src/collectors/webgl.ts
export async function collectWebGL(): Promise<WebGLFingerprint | null> {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return null;

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    const vendor = debugInfo
      ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL)
      : 'unknown';
    const renderer = debugInfo
      ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
      : 'unknown';
    const extensions = gl.getSupportedExtensions() || [];

    const hash = await sha256(`${vendor}|${renderer}|${extensions.join(',')}`);

    return { hash, vendor, renderer, extensions };
  } catch {
    return null;
  }
}

// packages/fingerprint-sdk/src/collectors/audio.ts
export async function collectAudio(): Promise<AudioFingerprint | null> {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const analyser = audioContext.createAnalyser();
    const gainNode = audioContext.createGain();
    const scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1);

    gainNode.gain.value = 0; // Mute
    oscillator.type = 'triangle';
    oscillator.connect(analyser);
    analyser.connect(scriptProcessor);
    scriptProcessor.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start(0);

    return new Promise((resolve) => {
      scriptProcessor.onaudioprocess = async (event) => {
        const data = event.inputBuffer.getChannelData(0);
        const hash = await sha256(data.slice(0, 100).toString());

        oscillator.disconnect();
        scriptProcessor.disconnect();
        audioContext.close();

        resolve({
          hash,
          sampleRate: audioContext.sampleRate,
        });
      };
    });
  } catch {
    return null;
  }
}

// packages/fingerprint-sdk/src/hash.ts
export async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
```

### 1.3 Entropy Calculator

```typescript
// packages/valuation-engine/src/entropy.ts

interface EntropyResult {
  totalBits: number;
  uniqueIn: number;  // e.g., "1 in 3,500,000"
  breakdown: EntropyBreakdown[];
  mostUniqueSignal: string;
}

interface EntropyBreakdown {
  signal: string;
  bits: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'unique';
  description: string;
}

// Pre-computed entropy values based on global statistics
// These should be updated periodically from D1 aggregations
const ENTROPY_TABLE: Record<string, number> = {
  // Canvas hash: typically 15-20 bits of entropy
  'canvas': 18.5,
  // WebGL renderer: varies by GPU
  'webgl_renderer': 12.0,
  // Audio fingerprint: typically 5-10 bits
  'audio': 8.0,
  // Screen resolution: common values have low entropy
  'screen_1920x1080': 2.0,
  'screen_2560x1440': 4.0,
  'screen_other': 8.0,
  // Timezone
  'timezone_america_new_york': 1.5,
  'timezone_other': 5.0,
  // Language
  'language_en-US': 1.0,
  'language_other': 4.0,
  // Fonts: high entropy
  'fonts': 10.0,
};

export function calculateEntropy(fingerprint: FingerprintPayload): EntropyResult {
  const breakdown: EntropyBreakdown[] = [];
  let totalBits = 0;

  // Canvas entropy
  if (fingerprint.hardware.canvas) {
    const bits = ENTROPY_TABLE['canvas'];
    totalBits += bits;
    breakdown.push({
      signal: 'Canvas',
      bits,
      rarity: bits > 15 ? 'unique' : 'rare',
      description: `Your canvas rendering is distinctive`,
    });
  }

  // WebGL entropy
  if (fingerprint.hardware.webgl) {
    const bits = ENTROPY_TABLE['webgl_renderer'];
    totalBits += bits;
    breakdown.push({
      signal: 'WebGL',
      bits,
      rarity: bits > 10 ? 'rare' : 'uncommon',
      description: `GPU: ${fingerprint.hardware.webgl.renderer}`,
    });
  }

  // Screen entropy
  const screenKey = `screen_${fingerprint.hardware.screen.width}x${fingerprint.hardware.screen.height}`;
  const screenBits = ENTROPY_TABLE[screenKey] ?? ENTROPY_TABLE['screen_other'];
  totalBits += screenBits;
  breakdown.push({
    signal: 'Screen',
    bits: screenBits,
    rarity: screenBits > 5 ? 'uncommon' : 'common',
    description: `${fingerprint.hardware.screen.width}x${fingerprint.hardware.screen.height}`,
  });

  // ... Add more signals

  // Sort by bits descending
  breakdown.sort((a, b) => b.bits - a.bits);

  // Calculate "1 in N" uniqueness
  const uniqueIn = Math.pow(2, totalBits);

  return {
    totalBits,
    uniqueIn,
    breakdown,
    mostUniqueSignal: breakdown[0]?.signal ?? 'Unknown',
  };
}
```

### Phase 1 Deliverables Checklist

- [ ] Types package with all interfaces
- [ ] Fingerprint SDK with collectors:
  - [ ] Canvas
  - [ ] WebGL
  - [ ] Audio
  - [ ] Fonts
  - [ ] Screen
  - [ ] Timezone
  - [ ] Navigator properties
- [ ] SHA-256 hashing utility
- [ ] Entropy calculator with breakdown
- [ ] Unit tests for all collectors

---

## Phase 2: The Mirror (Homepage)

### 2.1 Redacted Text Component

```typescript
// apps/web/src/components/redacted/redacted-text.tsx
'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface RedactedTextProps {
  children: React.ReactNode;
  className?: string;
  revealDelay?: number;
}

export function RedactedText({
  children,
  className,
  revealDelay = 0
}: RedactedTextProps) {
  const [revealed, setRevealed] = useState(false);

  return (
    <span
      className={cn(
        'relative inline-block cursor-pointer transition-all duration-300',
        !revealed && 'bg-redaction text-redaction select-none',
        revealed && 'bg-transparent text-ink',
        className
      )}
      onMouseEnter={() => setTimeout(() => setRevealed(true), revealDelay)}
      onMouseLeave={() => setRevealed(false)}
      role="button"
      aria-label="Hover to reveal hidden information"
    >
      {children}
      {!revealed && (
        <span className="absolute inset-0 flex items-center justify-center text-xs text-highlight opacity-0 hover:opacity-100 transition-opacity">
          [HOVER]
        </span>
      )}
    </span>
  );
}
```

### 2.2 Valuation Card Component

```typescript
// apps/web/src/components/valuation/valuation-card.tsx
'use client';

import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, Users } from 'lucide-react';

interface ValuationCardProps {
  cpm: number;
  persona: string;
  trackabilityScore: number;
}

export function ValuationCard({ cpm, persona, trackabilityScore }: ValuationCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-2 border-ink bg-paper p-6 font-mono"
    >
      <h3 className="font-serif text-xl mb-4 flex items-center gap-2">
        <DollarSign className="h-5 w-5" />
        Your Market Value
      </h3>

      <div className="space-y-4">
        {/* CPM Value */}
        <div className="flex justify-between items-baseline">
          <span className="text-sm uppercase tracking-wide">Est. CPM</span>
          <span className="text-3xl font-bold text-evidence">
            ${cpm.toFixed(2)}
          </span>
        </div>

        {/* Persona */}
        <div className="flex justify-between items-center">
          <span className="text-sm uppercase tracking-wide">
            <Users className="inline h-4 w-4 mr-1" />
            Segment
          </span>
          <span className="bg-highlight px-2 py-1 text-ink text-sm">
            {persona}
          </span>
        </div>

        {/* Trackability */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm uppercase tracking-wide">
              <TrendingUp className="inline h-4 w-4 mr-1" />
              Trackability
            </span>
            <span className={cn(
              'font-bold',
              trackabilityScore > 80 ? 'text-red-600' :
              trackabilityScore > 50 ? 'text-amber-600' : 'text-green-600'
            )}>
              {trackabilityScore}%
            </span>
          </div>

          {/* Progress bar */}
          <div className="h-2 bg-zinc-200 rounded">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${trackabilityScore}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className={cn(
                'h-full rounded',
                trackabilityScore > 80 ? 'bg-red-500' :
                trackabilityScore > 50 ? 'bg-amber-500' : 'bg-green-500'
              )}
            />
          </div>
        </div>
      </div>

      <p className="mt-4 text-xs text-zinc-500 border-t border-zinc-200 pt-4">
        This estimate is based on RTB market data and your digital fingerprint entropy.
      </p>
    </motion.div>
  );
}
```

### 2.3 Homepage Layout

```typescript
// apps/web/src/app/page.tsx
import { RedactedText } from '@/components/redacted/redacted-text';
import { ValuationCard } from '@/components/valuation/valuation-card';
import { ScanButton } from '@/components/scan/scan-button';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-paper text-ink">
      {/* Hero */}
      <section className="container mx-auto px-4 py-20">
        <h1 className="font-serif text-5xl md:text-7xl leading-tight mb-6">
          Deconstruct Your
          <br />
          <span className="bg-highlight px-2">Digital Shadow</span>
        </h1>

        <p className="font-mono text-lg max-w-2xl mb-8">
          Right now, advertisers know you're browsing from{' '}
          <RedactedText>San Francisco, CA</RedactedText>
          {' '}using a{' '}
          <RedactedText>MacBook Pro with M2 chip</RedactedText>.
          {' '}Your identity has been auctioned{' '}
          <RedactedText>47 times</RedactedText>
          {' '}in the last 60 seconds.
        </p>

        <ScanButton />
      </section>

      {/* Real-time auction preview */}
      <section className="container mx-auto px-4 py-12 border-t-2 border-ink">
        <h2 className="font-serif text-3xl mb-8">
          The Auction Is Live
        </h2>
        {/* RTB Simulator preview will go here */}
      </section>
    </main>
  );
}
```

### Phase 2 Deliverables Checklist

- [ ] RedactedText component with hover reveal
- [ ] ValuationCard component
- [ ] EntropyGauge visualization
- [ ] Homepage layout
- [ ] ScanButton with loading state
- [ ] Results display panel
- [ ] Responsive design (mobile-first)

---

## Phase 3: RTB Simulator

### 3.1 RTB Animation Components

```typescript
// apps/web/src/components/rtb/rtb-simulator.tsx
'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BidCard } from './bid-card';
import { DataPacket } from './data-packet';

interface Bid {
  id: string;
  bidder: string;
  amount: number;
  interest: string;
  timestamp: number;
}

export function RTBSimulator({ fingerprint }: { fingerprint: FingerprintPayload }) {
  const [bids, setBids] = useState<Bid[]>([]);
  const [phase, setPhase] = useState<'collecting' | 'broadcasting' | 'bidding'>('collecting');

  useEffect(() => {
    // Simulate RTB flow
    const simulate = async () => {
      setPhase('collecting');
      await delay(1000);

      setPhase('broadcasting');
      await delay(1500);

      setPhase('bidding');

      // Simulate incoming bids
      const mockBids = [
        { bidder: 'Google Ads', amount: 0.005, interest: 'Tech' },
        { bidder: 'Criteo', amount: 0.004, interest: 'Retargeting' },
        { bidder: 'The Trade Desk', amount: 0.008, interest: 'Luxury' },
        { bidder: 'Amazon DSP', amount: 0.006, interest: 'Shopping' },
        { bidder: 'Meta Audience', amount: 0.007, interest: 'Social' },
      ];

      for (const bid of mockBids) {
        await delay(500 + Math.random() * 500);
        setBids(prev => [...prev, {
          id: crypto.randomUUID(),
          ...bid,
          timestamp: Date.now(),
        }]);
      }
    };

    simulate();
  }, [fingerprint]);

  return (
    <div className="relative min-h-[400px] border-2 border-ink bg-zinc-900 text-paper p-6 font-mono overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-highlight text-lg">
          REAL-TIME BIDDING SIMULATION
        </h3>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse-slow" />
          <span className="text-xs text-zinc-400">LIVE</span>
        </div>
      </div>

      {/* Flow visualization */}
      <div className="relative h-24 mb-6">
        {/* Your Data */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2">
          <div className="bg-evidence p-2 text-xs">
            YOUR DATA
          </div>
        </div>

        {/* SSP */}
        <div className="absolute left-1/3 top-1/2 -translate-y-1/2">
          <div className="bg-zinc-700 p-2 text-xs">
            SSP
          </div>
        </div>

        {/* DSPs */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2">
          <div className="bg-zinc-700 p-2 text-xs">
            {bids.length} DSPs
          </div>
        </div>

        {/* Animated packets */}
        <AnimatePresence>
          {phase === 'broadcasting' && (
            <DataPacket from="left" to="center" />
          )}
        </AnimatePresence>
      </div>

      {/* Bid stream */}
      <div className="space-y-2 max-h-48 overflow-y-auto">
        <AnimatePresence>
          {bids.map((bid) => (
            <BidCard key={bid.id} bid={bid} />
          ))}
        </AnimatePresence>
      </div>

      {/* Winning bid */}
      {bids.length > 0 && phase === 'bidding' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 p-4 bg-highlight text-ink"
        >
          <span className="font-bold">WINNING BID: </span>
          ${Math.max(...bids.map(b => b.amount)).toFixed(4)}
          by {bids.reduce((a, b) => a.amount > b.amount ? a : b).bidder}
        </motion.div>
      )}
    </div>
  );
}

// apps/web/src/components/rtb/bid-card.tsx
export function BidCard({ bid }: { bid: Bid }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0 }}
      className="flex justify-between items-center bg-zinc-800 p-3 text-sm"
    >
      <div className="flex items-center gap-3">
        <span className="text-highlight">{bid.bidder}</span>
        <span className="text-zinc-400">→</span>
        <span className="text-zinc-300">{bid.interest}</span>
      </div>
      <span className="text-green-400 font-bold">
        ${bid.amount.toFixed(4)}
      </span>
    </motion.div>
  );
}
```

### 3.2 Worker RTB Endpoint

```typescript
// workers/api/src/routes/rtb.ts
import { Hono } from 'hono';
import type { Env } from '../types';

const rtb = new Hono<{ Bindings: Env }>();

// Mock DSP database
const DSP_PROFILES = [
  { name: 'Google Ads', baseRate: 0.005, interests: ['Tech', 'Shopping', 'Travel'] },
  { name: 'Criteo', baseRate: 0.004, interests: ['Retargeting', 'Fashion', 'Home'] },
  { name: 'The Trade Desk', baseRate: 0.008, interests: ['Luxury', 'Auto', 'Finance'] },
  { name: 'Amazon DSP', baseRate: 0.006, interests: ['Shopping', 'Electronics', 'Books'] },
  { name: 'Meta Audience', baseRate: 0.007, interests: ['Social', 'Gaming', 'Entertainment'] },
];

rtb.post('/simulate', async (c) => {
  const body = await c.req.json();
  const { fingerprint, geo } = body;

  // Calculate persona based on fingerprint
  const persona = inferPersona(fingerprint);

  // Generate mock bids
  const bids = DSP_PROFILES.map(dsp => {
    // Adjust bid based on persona match
    const interestMatch = dsp.interests.some(i => persona.interests.includes(i));
    const bidMultiplier = interestMatch ? 1.2 : 0.8;

    return {
      bidder: dsp.name,
      amount: dsp.baseRate * bidMultiplier * (0.9 + Math.random() * 0.2),
      interest: dsp.interests[Math.floor(Math.random() * dsp.interests.length)],
      timestamp: Date.now(),
    };
  });

  // Sort by bid amount
  bids.sort((a, b) => b.amount - a.amount);

  return c.json({
    success: true,
    persona,
    bids,
    totalBidders: bids.length,
    winningBid: bids[0],
    estimatedCPM: bids[0].amount * 1000,
  });
});

function inferPersona(fingerprint: any) {
  // Simple heuristic persona inference
  const interests: string[] = [];

  if (fingerprint.hardware.webgl?.renderer.includes('Apple')) {
    interests.push('Tech', 'Luxury');
  }
  if (fingerprint.software.platform.includes('Mac')) {
    interests.push('Creative', 'Design');
  }
  if (fingerprint.software.timezone.includes('America')) {
    interests.push('Shopping', 'Entertainment');
  }

  return {
    segment: interests.length > 0 ? interests.join(' / ') : 'General',
    interests,
    value: interests.length * 2 + 3, // Base CPM in dollars
  };
}

export default rtb;
```

### Phase 3 Deliverables Checklist

- [ ] RTBSimulator component with animation
- [ ] BidCard component
- [ ] DataPacket animation
- [ ] /api/rtb/simulate endpoint
- [ ] Persona inference logic
- [ ] Bid calculation algorithm
- [ ] WebSocket for real-time updates (stretch)

---

## Phase 4: Supercookie Lab

### 4.1 HSTS Supercookie Implementation

```typescript
// apps/web/src/lib/supercookie/hsts.ts

const HSTS_DOMAIN = 'hsts.panopticlick.org';
const ID_BITS = 32;

export async function setHSTSCookie(id: string): Promise<void> {
  // Convert ID to binary representation
  const idNum = parseInt(id.substring(0, 8), 16);

  // Request each bit subdomain to set HSTS
  const promises = [];
  for (let i = 0; i < ID_BITS; i++) {
    const bit = (idNum >> i) & 1;
    if (bit === 1) {
      // Only set HSTS for "1" bits
      const subdomain = `set${i}.${HSTS_DOMAIN}`;
      promises.push(
        fetch(`https://${subdomain}/set`, { mode: 'no-cors' })
          .catch(() => {}) // Ignore errors
      );
    }
  }

  await Promise.all(promises);
}

export async function readHSTSCookie(): Promise<string | null> {
  let idNum = 0;

  // Try to read each bit by checking HTTP vs HTTPS behavior
  const checks = [];
  for (let i = 0; i < ID_BITS; i++) {
    const subdomain = `read${i}.${HSTS_DOMAIN}`;
    checks.push(checkHSTSBit(subdomain, i));
  }

  const results = await Promise.all(checks);

  // Reconstruct ID from bits
  for (const { bit, value } of results) {
    if (value) {
      idNum |= (1 << bit);
    }
  }

  if (idNum === 0) return null;
  return idNum.toString(16).padStart(8, '0');
}

async function checkHSTSBit(subdomain: string, bit: number): Promise<{ bit: number; value: boolean }> {
  // Create an image element to test HTTP -> HTTPS upgrade
  return new Promise((resolve) => {
    const img = new Image();
    const timeout = setTimeout(() => {
      resolve({ bit, value: false });
    }, 2000);

    img.onload = () => {
      clearTimeout(timeout);
      // If image loads via HTTPS, HSTS is set (bit = 1)
      resolve({ bit, value: true });
    };

    img.onerror = () => {
      clearTimeout(timeout);
      resolve({ bit, value: false });
    };

    // Try HTTP - browser will upgrade to HTTPS if HSTS is cached
    img.src = `http://${subdomain}/pixel.gif?t=${Date.now()}`;
  });
}
```

### 4.2 HSTS Worker Routes

```typescript
// workers/api/src/routes/hsts.ts
import { Hono } from 'hono';
import type { Env } from '../types';

const hsts = new Hono<{ Bindings: Env }>();

// Set HSTS for a specific bit
hsts.get('/set', async (c) => {
  const host = c.req.header('host') || '';

  // Verify it's a set subdomain
  if (!host.startsWith('set')) {
    return c.text('Invalid', 400);
  }

  // Return with HSTS header (1 year)
  return new Response('OK', {
    headers: {
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'Content-Type': 'text/plain',
    },
  });
});

// Read endpoint returns a tracking pixel
hsts.get('/pixel.gif', async (c) => {
  // 1x1 transparent GIF
  const pixel = new Uint8Array([
    0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00,
    0x01, 0x00, 0x80, 0x00, 0x00, 0xff, 0xff, 0xff,
    0x00, 0x00, 0x00, 0x21, 0xf9, 0x04, 0x01, 0x00,
    0x00, 0x00, 0x00, 0x2c, 0x00, 0x00, 0x00, 0x00,
    0x01, 0x00, 0x01, 0x00, 0x00, 0x02, 0x02, 0x44,
    0x01, 0x00, 0x3b,
  ]);

  return new Response(pixel, {
    headers: {
      'Content-Type': 'image/gif',
      'Cache-Control': 'no-cache, no-store',
    },
  });
});

export default hsts;
```

### Phase 4 Deliverables Checklist

- [ ] HSTS supercookie set/read functions
- [ ] Worker routes for HSTS subdomains
- [ ] Cloudflare DNS setup for `*.hsts.panopticlick.org`
- [ ] SupercookieLab UI component
- [ ] Incognito mode demonstration flow
- [ ] ETag tracking implementation (stretch)
- [ ] Favicon tracking implementation (stretch)

---

## Phase 5: Defense Armory

### 5.1 AdBlock Test Component

```typescript
// apps/web/src/components/defense/blocker-test.tsx
'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface BlockerResult {
  name: string;
  url: string;
  blocked: boolean;
}

const BAIT_SCRIPTS = [
  { name: 'Google Analytics', url: '/bait/analytics.js' },
  { name: 'Facebook Pixel', url: '/bait/fbevents.js' },
  { name: 'DoubleClick', url: '/bait/doubleclick.js' },
  { name: 'Criteo', url: '/bait/criteo.js' },
  { name: 'Amazon Ads', url: '/bait/amazon-adsystem.js' },
  { name: 'AdRoll', url: '/bait/adroll.js' },
  { name: 'Outbrain', url: '/bait/outbrain.js' },
  { name: 'Taboola', url: '/bait/taboola.js' },
];

export function BlockerTest() {
  const [results, setResults] = useState<BlockerResult[]>([]);
  const [testing, setTesting] = useState(true);

  useEffect(() => {
    const testBlockers = async () => {
      const testResults: BlockerResult[] = [];

      for (const bait of BAIT_SCRIPTS) {
        const blocked = await testScript(bait.url);
        testResults.push({
          name: bait.name,
          url: bait.url,
          blocked,
        });
      }

      setResults(testResults);
      setTesting(false);
    };

    testBlockers();
  }, []);

  const blockedCount = results.filter(r => r.blocked).length;
  const percentage = results.length > 0
    ? Math.round((blockedCount / results.length) * 100)
    : 0;

  return (
    <div className="border-2 border-ink p-6">
      <h3 className="font-serif text-2xl mb-4">
        Ad Blocker Efficiency Test
      </h3>

      {testing ? (
        <div className="animate-pulse">Testing your defenses...</div>
      ) : (
        <>
          {/* Score */}
          <div className="mb-6 p-4 bg-zinc-100">
            <div className="text-4xl font-mono font-bold">
              {percentage}%
            </div>
            <div className="text-sm text-zinc-600">
              {blockedCount} of {results.length} trackers blocked
            </div>
          </div>

          {/* Results grid */}
          <div className="grid grid-cols-2 gap-2">
            {results.map((result) => (
              <div
                key={result.name}
                className={cn(
                  'flex items-center gap-2 p-2 text-sm',
                  result.blocked ? 'bg-green-50' : 'bg-red-50'
                )}
              >
                {result.blocked ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <span>{result.name}</span>
              </div>
            ))}
          </div>

          {/* Recommendations */}
          {percentage < 100 && (
            <div className="mt-6 p-4 bg-highlight">
              <AlertCircle className="h-5 w-5 inline mr-2" />
              <span className="font-bold">Recommendation:</span>
              {' '}Install uBlock Origin or update your filter lists.
            </div>
          )}
        </>
      )}
    </div>
  );
}

async function testScript(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = url;
    script.async = true;

    // If script loads, it wasn't blocked
    script.onload = () => {
      script.remove();
      resolve(false);
    };

    // If error, it was blocked
    script.onerror = () => {
      script.remove();
      resolve(true);
    };

    // Timeout fallback
    setTimeout(() => {
      script.remove();
      resolve(true); // Assume blocked if timeout
    }, 3000);

    document.head.appendChild(script);
  });
}
```

### Phase 5 Deliverables Checklist

- [ ] BlockerTest component with bait scripts
- [ ] Bait script files (empty .js files with tracker-like names)
- [ ] DNSLeakTest component
- [ ] PrivacyHeadersCheck component
- [ ] Hardening guide pages (Firefox, Chrome, Safari)
- [ ] Defense score aggregation

---

## Phase 6: Polish & Launch

### 6.1 SEO & Meta

```typescript
// apps/web/src/app/layout.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Panopticlick | Deconstruct Your Digital Shadow',
  description: 'Is your browser safe against tracking? Run the EFF-inspired privacy analysis. See exactly what advertisers know about you and how much your data is worth.',
  keywords: ['browser fingerprint', 'privacy test', 'tracking', 'EFF', 'digital privacy'],
  authors: [{ name: 'Panopticlick Project' }],
  openGraph: {
    title: 'Panopticlick | Deconstruct Your Digital Shadow',
    description: 'Discover what advertisers know about you.',
    url: 'https://panopticlick.org',
    siteName: 'Panopticlick',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Panopticlick - Browser Privacy Analysis',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Panopticlick | Deconstruct Your Digital Shadow',
    description: 'Is your browser safe against tracking?',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};
```

### 6.2 Performance Optimization

```typescript
// apps/web/next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: { unoptimized: true },

  // Font optimization
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },

  // Headers for security
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
```

### 6.3 Analytics (Privacy-Respecting)

```typescript
// apps/web/src/lib/analytics.ts
// Use Cloudflare Web Analytics (no cookies, GDPR compliant)

export function trackEvent(event: string, properties?: Record<string, any>) {
  // Only track if user consented
  if (!hasConsent()) return;

  // Use Beacon API for non-blocking
  const payload = {
    event,
    properties,
    timestamp: Date.now(),
    sessionId: getSessionId(),
  };

  navigator.sendBeacon('/api/analytics', JSON.stringify(payload));
}
```

### Phase 6 Deliverables Checklist

- [ ] SEO metadata for all pages
- [ ] OpenGraph images
- [ ] Lighthouse audit (target >90)
- [ ] Bundle size audit (<100KB)
- [ ] Error boundary components
- [ ] 404 and error pages
- [ ] Privacy-respecting analytics
- [ ] GDPR consent banner
- [ ] Final security audit
- [ ] Load testing
- [ ] Production deployment

---

## Timeline Summary

| Phase | Duration | Dependencies |
|-------|----------|--------------|
| Phase 0 | Foundation | - |
| Phase 1 | Core Detection | Phase 0 |
| Phase 2 | The Mirror | Phase 0, 1 |
| Phase 3 | RTB Simulator | Phase 1 |
| Phase 4 | Supercookie Lab | Phase 0 |
| Phase 5 | Defense Armory | Phase 1 |
| Phase 6 | Polish & Launch | All phases |

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| HSTS blocked by browser updates | Graceful degradation, explain in UI |
| Low fingerprint entropy | Combine multiple signals, show ranges |
| AdBlock false positives | Multiple bait scripts, timeout handling |
| Performance on mobile | Progressive loading, lazy components |
| GDPR compliance | Explicit consent, data minimization, opt-out |
