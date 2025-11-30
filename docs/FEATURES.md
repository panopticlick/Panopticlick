# Panopticlick.org - Feature Specifications

> Killer features that differentiate Panopticlick from every other fingerprinting tool.

---

## Feature Overview Matrix

| Feature | Uniqueness | Emotional Impact | Technical Complexity | Priority |
|---------|------------|------------------|---------------------|----------|
| RTB Auction Simulator | Only us | High (money = personal) | Medium | P0 |
| Redacted Reveal UI | Only us | Very High (visceral) | Low | P0 |
| HSTS Supercookie Drill | Rare | High (privacy shock) | High | P1 |
| AdBlock Effectiveness Test | Common | Medium | Low | P1 |
| Entropy Visualization | Common | Medium | Medium | P1 |
| CNAME Cloaking Detection | Rare | High | Medium | P2 |
| Behavioral Biometrics | Rare | Medium | High | P2 |
| Defense Hardening Guides | Common | Low | Low | P2 |

---

## Feature 1: RTB Auction Simulator (P0)

### 1.1 Overview

**The Big Idea**: Don't just tell users they're being tracked—show them HOW their data is being auctioned in real-time, with actual dollar values.

**User Story**:
> "As a privacy-conscious user, I want to see a simulation of how my data flows through the advertising ecosystem so that I understand the financial incentive behind tracking."

### 1.2 User Experience Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    RTB AUCTION SIMULATOR                         │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  STEP 1: DATA COLLECTION                          [LIVE]  │   │
│  │                                                           │   │
│  │  Your fingerprint is being packaged...                    │   │
│  │  ████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░ 35%              │   │
│  │                                                           │   │
│  │  Collected signals:                                       │   │
│  │  ✓ Canvas Hash    ✓ WebGL Renderer    ✓ Screen Size      │   │
│  │  ✓ Timezone       ✓ Language          ○ Audio (blocked)  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              │                                   │
│                              ▼                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  STEP 2: BID REQUEST BROADCAST                            │   │
│  │                                                           │   │
│  │  Your data package is being sent to ad exchanges...       │   │
│  │                                                           │   │
│  │     YOU ──────► [SSP] ──────► [Exchange] ──────► DSPs    │   │
│  │         ╭────────────────────────────────────────────╮   │   │
│  │         │  ▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░  Broadcasting...   │   │   │
│  │         ╰────────────────────────────────────────────╯   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              │                                   │
│                              ▼                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  STEP 3: AUCTION IN PROGRESS                     [47 DSPs]│   │
│  │                                                           │   │
│  │  ┌──────────────────────────────────────────────────┐    │   │
│  │  │ The Trade Desk │ Luxury Travel │ $0.0084 │ ⭐ WINNING │    │   │
│  │  ├──────────────────────────────────────────────────┤    │   │
│  │  │ Meta Audience  │ Tech Gadgets  │ $0.0072 │           │    │   │
│  │  ├──────────────────────────────────────────────────┤    │   │
│  │  │ Google Ads     │ Software      │ $0.0068 │           │    │   │
│  │  ├──────────────────────────────────────────────────┤    │   │
│  │  │ Amazon DSP     │ Shopping      │ $0.0061 │           │    │   │
│  │  ├──────────────────────────────────────────────────┤    │   │
│  │  │ Criteo         │ Retargeting   │ $0.0054 │           │    │   │
│  │  └──────────────────────────────────────────────────┘    │   │
│  │                                                           │   │
│  │  Total potential bidders: 47                              │   │
│  │  Auction completed in: 85ms                               │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              │                                   │
│                              ▼                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  STEP 4: YOUR MARKET VALUE                                │   │
│  │                                                           │   │
│  │     ┌─────────────────────────────────────────────┐      │   │
│  │     │                                             │      │   │
│  │     │          ESTIMATED CPM: $8.42               │      │   │
│  │     │                                             │      │   │
│  │     │   Based on your fingerprint, advertisers    │      │   │
│  │     │   are willing to pay $8.42 per 1,000        │      │   │
│  │     │   impressions to reach you.                 │      │   │
│  │     │                                             │      │   │
│  │     │   Inferred Persona:                         │      │   │
│  │     │   [Tech] [Developer] [High-Income]          │      │   │
│  │     │   [Apple User] [Travel Interested]          │      │   │
│  │     │                                             │      │   │
│  │     └─────────────────────────────────────────────┘      │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 1.3 Technical Implementation

```typescript
// lib/rtb/simulator.ts

interface RTBConfig {
  // Mock DSP profiles with bid ranges
  dsps: DSPProfile[];
  // Persona inference rules
  personaRules: PersonaRule[];
  // Geographic bid multipliers
  geoMultipliers: Record<string, number>;
}

interface DSPProfile {
  name: string;
  logo: string;
  baseRate: number;        // Base CPM bid
  interests: string[];     // What they're looking for
  variance: number;        // Bid randomness factor
}

interface PersonaRule {
  signal: string;          // e.g., "webgl.renderer"
  pattern: RegExp;         // e.g., /Apple/
  tags: string[];          // e.g., ["Premium", "Tech"]
  cpmMultiplier: number;   // e.g., 1.3
}

const DEFAULT_DSPS: DSPProfile[] = [
  {
    name: 'Google Ads',
    logo: '/logos/google.svg',
    baseRate: 0.005,
    interests: ['Tech', 'Shopping', 'Travel', 'Finance'],
    variance: 0.2,
  },
  {
    name: 'The Trade Desk',
    logo: '/logos/ttd.svg',
    baseRate: 0.008,
    interests: ['Luxury', 'Auto', 'B2B', 'Travel'],
    variance: 0.15,
  },
  {
    name: 'Meta Audience Network',
    logo: '/logos/meta.svg',
    baseRate: 0.007,
    interests: ['Social', 'Gaming', 'Entertainment', 'Retail'],
    variance: 0.25,
  },
  {
    name: 'Amazon DSP',
    logo: '/logos/amazon.svg',
    baseRate: 0.006,
    interests: ['Shopping', 'Electronics', 'Books', 'Home'],
    variance: 0.2,
  },
  {
    name: 'Criteo',
    logo: '/logos/criteo.svg',
    baseRate: 0.004,
    interests: ['Retargeting', 'Fashion', 'E-commerce'],
    variance: 0.3,
  },
  // ... more DSPs
];

const PERSONA_RULES: PersonaRule[] = [
  {
    signal: 'webgl.renderer',
    pattern: /Apple/i,
    tags: ['Premium', 'Tech', 'Apple Ecosystem'],
    cpmMultiplier: 1.4,
  },
  {
    signal: 'software.platform',
    pattern: /Mac/i,
    tags: ['Creative', 'Professional'],
    cpmMultiplier: 1.2,
  },
  {
    signal: 'hardware.screen.width',
    pattern: /^(2560|3840|5120)$/,
    tags: ['High-End', 'Professional'],
    cpmMultiplier: 1.3,
  },
  {
    signal: 'software.timezone',
    pattern: /America\/(New_York|Los_Angeles|Chicago)/,
    tags: ['US Market', 'High CPM Region'],
    cpmMultiplier: 1.5,
  },
  {
    signal: 'software.language',
    pattern: /^en-US$/,
    tags: ['English Primary'],
    cpmMultiplier: 1.1,
  },
];

export class RTBSimulator {
  private config: RTBConfig;

  constructor(config?: Partial<RTBConfig>) {
    this.config = {
      dsps: config?.dsps ?? DEFAULT_DSPS,
      personaRules: config?.personaRules ?? PERSONA_RULES,
      geoMultipliers: config?.geoMultipliers ?? {
        US: 1.5, GB: 1.3, DE: 1.2, CA: 1.2, AU: 1.1,
        default: 0.8,
      },
    };
  }

  async simulate(fingerprint: FingerprintPayload, geo?: GeoData): Promise<RTBSimulationResult> {
    // Step 1: Infer persona from fingerprint
    const persona = this.inferPersona(fingerprint);

    // Step 2: Calculate geo multiplier
    const geoMultiplier = this.getGeoMultiplier(geo?.country);

    // Step 3: Generate bids from each DSP
    const bids = this.generateBids(persona, geoMultiplier);

    // Step 4: Sort by bid amount (auction)
    bids.sort((a, b) => b.amount - a.amount);

    // Step 5: Calculate estimated CPM
    const winningBid = bids[0];
    const estimatedCPM = winningBid.amount * 1000;

    return {
      persona,
      bids,
      winningBid,
      totalBidders: bids.length,
      estimatedCPM,
      auctionDuration: Math.floor(50 + Math.random() * 50), // 50-100ms simulated
    };
  }

  private inferPersona(fingerprint: FingerprintPayload): Persona {
    const tags: Set<string> = new Set();
    let cpmMultiplier = 1.0;

    for (const rule of this.config.personaRules) {
      const value = this.getSignalValue(fingerprint, rule.signal);
      if (value && rule.pattern.test(String(value))) {
        rule.tags.forEach(tag => tags.add(tag));
        cpmMultiplier *= rule.cpmMultiplier;
      }
    }

    // Derive interests from tags
    const interests = this.deriveInterests(Array.from(tags));

    return {
      segment: Array.from(tags).slice(0, 3).join(' / ') || 'General Audience',
      tags: Array.from(tags),
      interests,
      valueMultiplier: cpmMultiplier,
    };
  }

  private generateBids(persona: Persona, geoMultiplier: number): RTBBid[] {
    return this.config.dsps.map(dsp => {
      // Check interest match
      const matchingInterests = dsp.interests.filter(
        interest => persona.interests.includes(interest)
      );
      const interestMatch = matchingInterests.length > 0;

      // Calculate bid
      const interestMultiplier = interestMatch ? 1.2 : 0.7;
      const randomFactor = 1 - dsp.variance / 2 + Math.random() * dsp.variance;

      const amount = dsp.baseRate
        * persona.valueMultiplier
        * geoMultiplier
        * interestMultiplier
        * randomFactor;

      return {
        bidder: dsp.name,
        bidderLogo: dsp.logo,
        amount: Math.round(amount * 10000) / 10000, // Round to 4 decimals
        interest: matchingInterests[0] || dsp.interests[0],
        confidence: interestMatch ? 0.8 + Math.random() * 0.2 : 0.4 + Math.random() * 0.3,
        timestamp: Date.now(),
      };
    });
  }

  private getSignalValue(fp: FingerprintPayload, path: string): unknown {
    return path.split('.').reduce((obj, key) => obj?.[key], fp as any);
  }

  private deriveInterests(tags: string[]): string[] {
    const interestMap: Record<string, string[]> = {
      'Tech': ['Technology', 'Software', 'Gadgets'],
      'Premium': ['Luxury', 'Travel', 'Finance'],
      'Professional': ['B2B', 'SaaS', 'Enterprise'],
      'Creative': ['Design', 'Art', 'Media'],
      'Apple Ecosystem': ['Apple Products', 'Premium Tech'],
      'US Market': ['US Retail', 'American Brands'],
    };

    const interests = new Set<string>();
    tags.forEach(tag => {
      interestMap[tag]?.forEach(i => interests.add(i));
    });

    return Array.from(interests);
  }

  private getGeoMultiplier(country?: string): number {
    if (!country) return this.config.geoMultipliers['default'];
    return this.config.geoMultipliers[country] ?? this.config.geoMultipliers['default'];
  }
}
```

### 1.4 Animation Specifications

```typescript
// RTB Animation Timeline (in frames/milliseconds)

const RTB_ANIMATION_TIMELINE = {
  // Phase 1: Data Collection (0-1500ms)
  collection: {
    start: 0,
    duration: 1500,
    steps: [
      { signal: 'canvas', delay: 0 },
      { signal: 'webgl', delay: 200 },
      { signal: 'audio', delay: 400 },
      { signal: 'fonts', delay: 600 },
      { signal: 'screen', delay: 800 },
      { signal: 'timezone', delay: 1000 },
    ],
  },

  // Phase 2: Data Packaging (1500-2500ms)
  packaging: {
    start: 1500,
    duration: 1000,
    animation: 'pulse', // Pulsing data package
  },

  // Phase 3: Broadcast (2500-4000ms)
  broadcast: {
    start: 2500,
    duration: 1500,
    animation: 'flow', // Data flowing to exchanges
    stages: [
      { label: 'SSP', position: 0.33 },
      { label: 'Exchange', position: 0.66 },
      { label: 'DSPs', position: 1.0 },
    ],
  },

  // Phase 4: Bidding (4000-6000ms)
  bidding: {
    start: 4000,
    duration: 2000,
    bidsPerSecond: 3, // Bids appear every ~333ms
    animation: 'slideIn',
  },

  // Phase 5: Winner Announcement (6000-7000ms)
  winner: {
    start: 6000,
    duration: 1000,
    animation: 'highlight', // Winning bid highlighted
  },
};
```

---

## Feature 2: Redacted Reveal UI (P0)

### 2.1 Overview

**The Big Idea**: Sensitive data appears "classified" (blacked out like a government document) until the user hovers, creating a visceral "privacy invasion" moment.

**Emotional Impact**: When users see "Advertisers know you live in [██████████]" and then reveal their actual city, it's a gut punch. This is the moment they *feel* the privacy violation.

### 2.2 Interaction States

```
STATE 1: REDACTED (Default)
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  You're browsing from ████████████████ using a                  │
│  ██████████████████████████████. Your IP address is             │
│  █████████████ and your timezone is ██████████████████.         │
│                                                                 │
│  [Hover over black bars to reveal classified information]       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

STATE 2: HOVERING (Transition)
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  You're browsing from San Franci... using a                     │
│  ██████████████████████████████. Your IP address is             │
│  █████████████ and your timezone is ██████████████████.         │
│                                                                 │
│  ↑ Decoding... ↑                                                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

STATE 3: REVEALED (After hover)
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  You're browsing from [San Francisco, CA] using a               │
│  ██████████████████████████████. Your IP address is             │
│  █████████████ and your timezone is ██████████████████.         │
│                                                                 │
│  ↑ Yellow highlight indicates revealed data                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 2.3 Technical Implementation

```tsx
// components/redacted/redacted-text.tsx

interface RedactedTextProps {
  children: React.ReactNode;
  sensitivity?: 'low' | 'medium' | 'high';
  revealOn?: 'hover' | 'click' | 'auto';
  autoRevealDelay?: number;
  onReveal?: () => void;
}

export function RedactedText({
  children,
  sensitivity = 'medium',
  revealOn = 'hover',
  autoRevealDelay = 2000,
  onReveal,
}: RedactedTextProps) {
  const [state, setState] = useState<'redacted' | 'revealing' | 'revealed'>('redacted');
  const reducedMotion = useReducedMotion();

  // Auto-reveal after delay
  useEffect(() => {
    if (revealOn === 'auto') {
      const timer = setTimeout(() => {
        setState('revealing');
        setTimeout(() => {
          setState('revealed');
          onReveal?.();
        }, reducedMotion ? 0 : 300);
      }, autoRevealDelay);
      return () => clearTimeout(timer);
    }
  }, [revealOn, autoRevealDelay, reducedMotion, onReveal]);

  const handleInteraction = () => {
    if (state !== 'redacted') return;

    setState('revealing');
    setTimeout(() => {
      setState('revealed');
      onReveal?.();
    }, reducedMotion ? 0 : 300);
  };

  // Sensitivity affects visual style
  const sensitivityStyles = {
    low: 'bg-zinc-600',    // Less alarming
    medium: 'bg-black',    // Standard redaction
    high: 'bg-red-900',    // High sensitivity warning
  };

  return (
    <span
      className={cn(
        'relative inline-block font-mono rounded-sm transition-all',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-highlight',
        state === 'redacted' && [
          sensitivityStyles[sensitivity],
          'text-transparent select-none cursor-pointer',
          'px-1 py-0.5',
        ],
        state === 'revealing' && [
          'bg-highlight/50 text-ink',
          'animate-pulse',
        ],
        state === 'revealed' && [
          'bg-highlight/20 text-ink',
          'px-1 py-0.5',
        ],
      )}
      onMouseEnter={revealOn === 'hover' ? handleInteraction : undefined}
      onClick={revealOn === 'click' ? handleInteraction : undefined}
      onKeyDown={(e) => e.key === 'Enter' && handleInteraction()}
      role="button"
      tabIndex={0}
      aria-label={
        state === 'redacted'
          ? 'Classified information. Interact to reveal.'
          : undefined
      }
    >
      {children}

      {/* Reveal animation mask */}
      <AnimatePresence>
        {state === 'revealing' && !reducedMotion && (
          <motion.span
            initial={{ scaleX: 1 }}
            animate={{ scaleX: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className={cn(
              'absolute inset-0 origin-left',
              sensitivityStyles[sensitivity],
            )}
          />
        )}
      </AnimatePresence>

      {/* Hover hint for redacted state */}
      {state === 'redacted' && (
        <span className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
          <span className="text-xs text-highlight font-sans">
            [CLASSIFIED]
          </span>
        </span>
      )}
    </span>
  );
}
```

### 2.4 Usage Patterns

```tsx
// Homepage hero example
<section className="py-20">
  <h1 className="text-5xl font-serif font-bold leading-tight">
    Deconstruct Your
    <br />
    <span className="bg-highlight px-2">Digital Shadow</span>
  </h1>

  <p className="mt-8 text-xl max-w-2xl">
    Right now, advertisers know you're browsing from{' '}
    <RedactedText sensitivity="high">
      {geo.city}, {geo.region}
    </RedactedText>{' '}
    using a{' '}
    <RedactedText sensitivity="medium">
      {device.model} with {device.gpu}
    </RedactedText>
    . Your identity has been auctioned{' '}
    <RedactedText sensitivity="low" revealOn="auto" autoRevealDelay={3000}>
      {auctionCount} times
    </RedactedText>{' '}
    in the last 60 seconds.
  </p>
</section>
```

---

## Feature 3: HSTS Supercookie Drill (P1)

### 3.1 Overview

**The Big Idea**: Demonstrate that clearing cookies doesn't protect you—HSTS supercookies survive across sessions and even incognito mode.

**User Story**:
> "As a user who thinks incognito mode protects me, I want to see proof that I can still be tracked so that I understand the limitations of browser privacy."

### 3.2 User Experience Flow

```
┌─────────────────────────────────────────────────────────────────┐
│               SUPERCOOKIE PERSISTENCE TEST                       │
│                                                                  │
│  STEP 1: BASELINE                                               │
│  ─────────────────────────────────────────────────────────────  │
│  We're about to demonstrate how supercookies work.              │
│                                                                  │
│  Your current session ID: [pano_abc123]                         │
│                                                                  │
│  This ID has been embedded in your browser's HSTS cache         │
│  using 32 subdomain requests.                                   │
│                                                                  │
│  [Continue to Test →]                                           │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  STEP 2: CLEAR YOUR DATA                                        │
│  ─────────────────────────────────────────────────────────────  │
│  Now, try to escape tracking:                                   │
│                                                                  │
│  □ Clear all cookies                                            │
│  □ Clear browsing history                                       │
│  □ Open incognito/private window                                │
│                                                                  │
│  When ready, click below to see if we can still identify you.   │
│                                                                  │
│  [I've Cleared My Data →]                                       │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  STEP 3: RESULTS                                                │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                         │   │
│  │    ⚠️ WE STILL KNOW WHO YOU ARE                         │   │
│  │                                                         │   │
│  │    Recovered ID: [pano_abc123]                          │   │
│  │                                                         │   │
│  │    Your browser's HSTS cache retained your identity     │   │
│  │    even after clearing cookies.                         │   │
│  │                                                         │   │
│  │    This technique is used by real trackers.             │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  HOW IT WORKS:                                                  │
│  • We set HSTS headers on 32 unique subdomains                  │
│  • Each subdomain represents 1 bit of your ID                   │
│  • When you return, we check which subdomains auto-upgrade      │
│  • By reconstructing the bits, we recover your ID               │
│                                                                  │
│  [Learn How to Protect Yourself →]                              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 3.3 Technical Implementation

```typescript
// lib/supercookie/hsts.ts

const HSTS_DOMAIN = 'hsts.panopticlick.org';
const ID_BITS = 32;
const HSTS_MAX_AGE = 31536000; // 1 year

export class HSTSSupercookie {
  /**
   * Set HSTS supercookie by encoding ID into subdomain visits
   */
  async set(id: string): Promise<void> {
    // Convert hex ID to number
    const idNum = parseInt(id.substring(0, 8), 16);

    const requests: Promise<void>[] = [];

    for (let bit = 0; bit < ID_BITS; bit++) {
      const bitValue = (idNum >> bit) & 1;

      if (bitValue === 1) {
        // Set HSTS for this bit position
        const subdomain = `set-${bit}.${HSTS_DOMAIN}`;
        requests.push(
          fetch(`https://${subdomain}/set`, {
            mode: 'no-cors',
            cache: 'no-store',
          }).catch(() => {})
        );
      }
    }

    await Promise.all(requests);
  }

  /**
   * Read HSTS supercookie by checking which subdomains upgrade
   */
  async read(): Promise<string | null> {
    const bitResults = await Promise.all(
      Array.from({ length: ID_BITS }, (_, bit) =>
        this.checkBit(bit)
      )
    );

    // Reconstruct ID from bits
    let idNum = 0;
    for (let bit = 0; bit < ID_BITS; bit++) {
      if (bitResults[bit]) {
        idNum |= (1 << bit);
      }
    }

    if (idNum === 0) return null;
    return idNum.toString(16).padStart(8, '0');
  }

  /**
   * Check if a specific bit is set by testing HTTP→HTTPS upgrade
   */
  private async checkBit(bit: number): Promise<boolean> {
    const subdomain = `read-${bit}.${HSTS_DOMAIN}`;

    return new Promise((resolve) => {
      const img = new Image();
      const timeout = setTimeout(() => resolve(false), 2000);

      img.onload = () => {
        clearTimeout(timeout);
        // Image loaded = browser upgraded to HTTPS = bit is set
        resolve(true);
      };

      img.onerror = () => {
        clearTimeout(timeout);
        resolve(false);
      };

      // Try HTTP - will be upgraded to HTTPS if HSTS is cached
      img.src = `http://${subdomain}/pixel.gif?t=${Date.now()}`;
    });
  }
}

// Worker route for setting HSTS
// workers/api/src/routes/hsts.ts

import { Hono } from 'hono';

const hsts = new Hono();

// Set HSTS for a bit position
hsts.get('/set', (c) => {
  return new Response('OK', {
    headers: {
      'Strict-Transport-Security': `max-age=${HSTS_MAX_AGE}; includeSubDomains`,
      'Content-Type': 'text/plain',
      'Cache-Control': 'no-store',
    },
  });
});

// Return tracking pixel
hsts.get('/pixel.gif', (c) => {
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

### 3.4 DNS Configuration

```
# Cloudflare DNS records needed for HSTS supercookie

# Wildcard for set subdomains
*.hsts.panopticlick.org    A    <Worker IP>    Proxied

# Or use Cloudflare Workers routes
set-*.hsts.panopticlick.org/*    →    panopticlick-hsts-worker
read-*.hsts.panopticlick.org/*   →    panopticlick-hsts-worker
```

---

## Feature 4: AdBlock Effectiveness Test (P1)

### 4.1 Overview

**The Big Idea**: Load "bait" scripts that mimic real trackers and show users exactly what their adblocker catches (or misses).

### 4.2 Bait Script Configuration

```typescript
// lib/defense/bait-scripts.ts

interface BaitScript {
  name: string;
  category: 'analytics' | 'advertising' | 'social' | 'fingerprinting';
  // URL patterns that mimic real trackers
  urls: string[];
  // Global variable that would exist if loaded
  globalCheck?: string;
  // Severity if not blocked
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export const BAIT_SCRIPTS: BaitScript[] = [
  // Analytics
  {
    name: 'Google Analytics',
    category: 'analytics',
    urls: ['/bait/google-analytics.js', '/bait/analytics.js'],
    globalCheck: 'ga',
    severity: 'high',
  },
  {
    name: 'Google Tag Manager',
    category: 'analytics',
    urls: ['/bait/gtm.js', '/bait/googletagmanager.js'],
    globalCheck: 'dataLayer',
    severity: 'high',
  },
  {
    name: 'Hotjar',
    category: 'analytics',
    urls: ['/bait/hotjar.js'],
    globalCheck: 'hj',
    severity: 'medium',
  },

  // Advertising
  {
    name: 'DoubleClick',
    category: 'advertising',
    urls: ['/bait/doubleclick.js', '/bait/ad.doubleclick.js'],
    severity: 'critical',
  },
  {
    name: 'Facebook Pixel',
    category: 'advertising',
    urls: ['/bait/fbevents.js', '/bait/facebook-pixel.js'],
    globalCheck: 'fbq',
    severity: 'critical',
  },
  {
    name: 'Criteo',
    category: 'advertising',
    urls: ['/bait/criteo.js'],
    severity: 'high',
  },
  {
    name: 'Amazon Ads',
    category: 'advertising',
    urls: ['/bait/amazon-adsystem.js'],
    severity: 'high',
  },

  // Social
  {
    name: 'Facebook SDK',
    category: 'social',
    urls: ['/bait/connect.facebook.js'],
    globalCheck: 'FB',
    severity: 'medium',
  },
  {
    name: 'Twitter Widgets',
    category: 'social',
    urls: ['/bait/twitter-widgets.js'],
    severity: 'low',
  },

  // Fingerprinting
  {
    name: 'FingerprintJS',
    category: 'fingerprinting',
    urls: ['/bait/fingerprint2.js', '/bait/fp.js'],
    severity: 'critical',
  },
];

export async function testBaitScripts(): Promise<BaitTestResult[]> {
  const results: BaitTestResult[] = [];

  for (const bait of BAIT_SCRIPTS) {
    const blocked = await testScript(bait);
    results.push({
      name: bait.name,
      category: bait.category,
      blocked,
      severity: bait.severity,
    });
  }

  return results;
}

async function testScript(bait: BaitScript): Promise<boolean> {
  // Method 1: Try to load script
  for (const url of bait.urls) {
    const scriptLoaded = await attemptScriptLoad(url);
    if (!scriptLoaded) {
      return true; // Script was blocked
    }
  }

  // Method 2: Check global variable
  if (bait.globalCheck && !(bait.globalCheck in window)) {
    return true; // Global doesn't exist = blocked
  }

  return false; // Not blocked
}

function attemptScriptLoad(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = url;
    script.async = true;

    const timeout = setTimeout(() => {
      script.remove();
      resolve(false); // Timeout = likely blocked
    }, 3000);

    script.onload = () => {
      clearTimeout(timeout);
      script.remove();
      resolve(true); // Loaded successfully
    };

    script.onerror = () => {
      clearTimeout(timeout);
      script.remove();
      resolve(false); // Error = blocked
    };

    document.head.appendChild(script);
  });
}
```

### 4.3 Results Display

```tsx
// components/defense/blocker-results.tsx

export function BlockerResults({ results }: { results: BaitTestResult[] }) {
  const score = Math.round(
    (results.filter(r => r.blocked).length / results.length) * 100
  );

  const byCategory = {
    analytics: results.filter(r => r.category === 'analytics'),
    advertising: results.filter(r => r.category === 'advertising'),
    social: results.filter(r => r.category === 'social'),
    fingerprinting: results.filter(r => r.category === 'fingerprinting'),
  };

  return (
    <div className="space-y-8">
      {/* Overall score */}
      <div className="text-center">
        <DefenseRing score={score} size="lg" />
        <p className="mt-4 text-lg">
          Your adblocker blocked{' '}
          <span className="font-bold">{results.filter(r => r.blocked).length}</span>
          {' '}of{' '}
          <span className="font-bold">{results.length}</span>
          {' '}known trackers.
        </p>
      </div>

      {/* By category */}
      {Object.entries(byCategory).map(([category, items]) => (
        <div key={category}>
          <h3 className="text-lg font-bold capitalize mb-3">{category}</h3>
          <div className="grid gap-2">
            {items.map((item) => (
              <TrackerResult
                key={item.name}
                name={item.name}
                blocked={item.blocked}
                category={item.category}
              />
            ))}
          </div>
        </div>
      ))}

      {/* Recommendations */}
      {score < 100 && (
        <div className="p-4 bg-highlight/10 border-l-4 border-highlight">
          <h4 className="font-bold mb-2">Recommendations</h4>
          <ul className="list-disc list-inside space-y-1 text-sm">
            {score < 50 && (
              <li>Install uBlock Origin for better protection</li>
            )}
            {score < 80 && (
              <li>Update your filter lists to the latest version</li>
            )}
            {results.some(r => !r.blocked && r.severity === 'critical') && (
              <li>Critical trackers are getting through - consider a privacy-focused browser</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
```

---

## Feature 5: CNAME Cloaking Detection (P2)

### 5.1 Overview

**The Big Idea**: Detect when third-party trackers disguise themselves as first-party by using CNAME records.

### 5.2 How CNAME Cloaking Works

```
Normal Third-Party Request:
browser → tracking.facebook.com (BLOCKED by adblocker)

CNAME Cloaked Request:
browser → analytics.yoursite.com (Looks first-party!)
                    ↓
          CNAME → tracking.facebook.com (Real destination)
```

### 5.3 Detection Logic

```typescript
// lib/defense/cname-detection.ts

interface CNAMECheckResult {
  hostname: string;
  cname: string | null;
  isCloaked: boolean;
  realOwner: string | null;
}

// Known tracker CNAME targets
const KNOWN_TRACKER_CNAMES: Record<string, string> = {
  'a.]]clarity.ms': 'Microsoft Clarity',
  'assets.adobedtm.com': 'Adobe Analytics',
  'cdn.branch.io': 'Branch.io',
  'cdn.segment.com': 'Segment',
  'js.hs-scripts.com': 'HubSpot',
  'px.ads.linkedin.com': 'LinkedIn Ads',
  'script.hotjar.com': 'Hotjar',
  'static.ads-twitter.com': 'Twitter Ads',
  'static.criteo.net': 'Criteo',
  'www.google-analytics.com': 'Google Analytics',
  'www.googletagmanager.com': 'Google Tag Manager',
};

export async function detectCNAMECloaking(
  hostname: string
): Promise<CNAMECheckResult> {
  // This would be done server-side via Worker
  const response = await fetch(`/api/dns/resolve?hostname=${hostname}`);
  const data = await response.json();

  const cname = data.cname;

  if (!cname) {
    return {
      hostname,
      cname: null,
      isCloaked: false,
      realOwner: null,
    };
  }

  // Check if CNAME points to known tracker
  const trackerMatch = Object.entries(KNOWN_TRACKER_CNAMES).find(
    ([pattern]) => cname.includes(pattern)
  );

  return {
    hostname,
    cname,
    isCloaked: !!trackerMatch,
    realOwner: trackerMatch?.[1] ?? null,
  };
}

// Worker endpoint
// workers/api/src/routes/dns.ts

import { Hono } from 'hono';

const dns = new Hono();

dns.get('/resolve', async (c) => {
  const hostname = c.req.query('hostname');

  if (!hostname) {
    return c.json({ error: 'Missing hostname' }, 400);
  }

  try {
    // Use Cloudflare's DNS-over-HTTPS
    const response = await fetch(
      `https://cloudflare-dns.com/dns-query?name=${hostname}&type=CNAME`,
      {
        headers: { Accept: 'application/dns-json' },
      }
    );

    const data = await response.json();

    const cname = data.Answer?.find(
      (a: any) => a.type === 5 // CNAME record type
    )?.data;

    return c.json({
      hostname,
      cname: cname?.replace(/\.$/, '') ?? null, // Remove trailing dot
    });
  } catch (error) {
    return c.json({ error: 'DNS lookup failed' }, 500);
  }
});

export default dns;
```

---

## Feature 6: Behavioral Biometrics (P2)

### 6.1 Overview

**The Big Idea**: Show users that their mouse movements, scroll patterns, and typing rhythms are unique enough to identify them.

### 6.2 Data Collection

```typescript
// lib/behavior/collector.ts

interface BehaviorMetrics {
  mouse: {
    entropy: number;           // Bits of uniqueness
    avgSpeed: number;          // Pixels/second
    avgAcceleration: number;
    curvature: number;         // How curved their paths are
    jitter: number;            // Micro-movements
  };
  scroll: {
    avgVelocity: number;
    pausePatterns: number[];   // Time between scrolls
    directionChanges: number;
  };
  typing?: {
    keyDownDuration: number;   // How long keys are held
    interKeyDelay: number;     // Time between keystrokes
    errorRate: number;         // Backspace frequency
  };
}

export class BehaviorCollector {
  private mousePositions: Array<{ x: number; y: number; t: number }> = [];
  private scrollEvents: Array<{ y: number; t: number }> = [];
  private keyEvents: Array<{ key: string; downT: number; upT: number }> = [];

  private isCollecting = false;

  start(duration: number = 10000): Promise<BehaviorMetrics> {
    return new Promise((resolve) => {
      this.isCollecting = true;

      // Mouse tracking
      const mouseHandler = (e: MouseEvent) => {
        if (!this.isCollecting) return;
        this.mousePositions.push({ x: e.clientX, y: e.clientY, t: Date.now() });
      };

      // Scroll tracking
      const scrollHandler = () => {
        if (!this.isCollecting) return;
        this.scrollEvents.push({ y: window.scrollY, t: Date.now() });
      };

      document.addEventListener('mousemove', mouseHandler);
      document.addEventListener('scroll', scrollHandler);

      // End collection after duration
      setTimeout(() => {
        this.isCollecting = false;
        document.removeEventListener('mousemove', mouseHandler);
        document.removeEventListener('scroll', scrollHandler);

        resolve(this.analyze());
      }, duration);
    });
  }

  private analyze(): BehaviorMetrics {
    return {
      mouse: this.analyzeMouseData(),
      scroll: this.analyzeScrollData(),
    };
  }

  private analyzeMouseData() {
    const positions = this.mousePositions;

    if (positions.length < 10) {
      return { entropy: 0, avgSpeed: 0, avgAcceleration: 0, curvature: 0, jitter: 0 };
    }

    // Calculate speeds
    const speeds: number[] = [];
    for (let i = 1; i < positions.length; i++) {
      const dx = positions[i].x - positions[i - 1].x;
      const dy = positions[i].y - positions[i - 1].y;
      const dt = positions[i].t - positions[i - 1].t;
      if (dt > 0) {
        speeds.push(Math.sqrt(dx * dx + dy * dy) / dt);
      }
    }

    const avgSpeed = speeds.reduce((a, b) => a + b, 0) / speeds.length;

    // Calculate accelerations
    const accelerations: number[] = [];
    for (let i = 1; i < speeds.length; i++) {
      const dt = positions[i + 1].t - positions[i].t;
      if (dt > 0) {
        accelerations.push(Math.abs(speeds[i] - speeds[i - 1]) / dt);
      }
    }

    const avgAcceleration = accelerations.length > 0
      ? accelerations.reduce((a, b) => a + b, 0) / accelerations.length
      : 0;

    // Estimate entropy based on variance
    const speedVariance = this.variance(speeds);
    const entropy = Math.log2(1 + speedVariance * 1000);

    return {
      entropy: Math.round(entropy * 10) / 10,
      avgSpeed: Math.round(avgSpeed * 1000),
      avgAcceleration: Math.round(avgAcceleration * 10000),
      curvature: 0, // TODO: implement
      jitter: 0,    // TODO: implement
    };
  }

  private analyzeScrollData() {
    const events = this.scrollEvents;

    if (events.length < 5) {
      return { avgVelocity: 0, pausePatterns: [], directionChanges: 0 };
    }

    // Calculate velocities
    const velocities: number[] = [];
    for (let i = 1; i < events.length; i++) {
      const dy = events[i].y - events[i - 1].y;
      const dt = events[i].t - events[i - 1].t;
      if (dt > 0) {
        velocities.push(dy / dt);
      }
    }

    // Count direction changes
    let directionChanges = 0;
    for (let i = 1; i < velocities.length; i++) {
      if (Math.sign(velocities[i]) !== Math.sign(velocities[i - 1])) {
        directionChanges++;
      }
    }

    return {
      avgVelocity: Math.round(
        velocities.reduce((a, b) => a + b, 0) / velocities.length * 100
      ),
      pausePatterns: [],
      directionChanges,
    };
  }

  private variance(arr: number[]): number {
    const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
    return arr.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / arr.length;
  }
}
```

---

## Feature Priority Summary

### P0 (Must Have for Launch)
1. **RTB Auction Simulator** - Core differentiator, shows money trail
2. **Redacted Reveal UI** - Signature emotional experience

### P1 (Should Have for Launch)
3. **HSTS Supercookie Drill** - Unique demonstration of persistent tracking
4. **AdBlock Effectiveness Test** - Practical value for users
5. **Entropy Visualization** - Core fingerprinting display

### P2 (Nice to Have)
6. **CNAME Cloaking Detection** - Advanced protection check
7. **Behavioral Biometrics** - Novel fingerprinting demonstration
8. **Defense Hardening Guides** - Educational content

---

## Success Metrics

| Feature | KPI | Target |
|---------|-----|--------|
| RTB Simulator | Time on page | > 2 minutes |
| Redacted Reveal | Hover interactions | > 80% of users reveal all |
| Supercookie Drill | Completion rate | > 60% complete full test |
| AdBlock Test | Return visits | > 20% test again after changes |
| Overall | Unique scans | 10,000 in first month |
| Overall | Social shares | 5% share rate |
