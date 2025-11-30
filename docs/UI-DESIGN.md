# Panopticlick.org - UI Design System

> **Aesthetic**: "Investigative Journalism" meets "Digital Noir"
> Think **The New York Times** deep investigations + **Mr. Robot** terminal aesthetic.

---

## 1. Design Philosophy

### 1.1 Core Principles

| Principle | Implementation |
|-----------|----------------|
| **Authority** | Serif fonts for headlines convey trust and credibility |
| **Evidence** | Monospace fonts for data convey technical precision |
| **Revelation** | Redaction effects create emotional impact |
| **Urgency** | Yellow highlights draw attention to critical findings |
| **Clarity** | High contrast ensures readability |

### 1.2 Emotional Journey

```
Landing Page    →    Scan Process    →    Results
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"Curiosity"     →    "Tension"       →    "Revelation"
                                     →    "Empowerment"

- Redacted text       - Loading pulse      - Data unveiled
- Bold claims         - RTB animation      - Defense score
- "What do they       - Bidders appear     - "Here's how to
  know about me?"                            protect yourself"
```

---

## 2. Color Palette

### 2.1 Primary Colors

```css
:root {
  /* The Bureau Palette */

  /* Backgrounds */
  --color-paper: #f4f4f5;         /* Zinc-100: Newsprint white */
  --color-paper-dark: #e4e4e7;    /* Zinc-200: Slightly darker paper */
  --color-ink: #18181b;           /* Zinc-900: Deep black ink */
  --color-ink-light: #3f3f46;     /* Zinc-700: Lighter ink */

  /* Functional */
  --color-redaction: #000000;     /* Pure black: Classified information */
  --color-highlight: #fde047;     /* Yellow-300: Highlighter pen */
  --color-evidence: #3b82f6;      /* Blue-500: Links, evidence trails */

  /* Status */
  --color-safe: #22c55e;          /* Green-500: Protected */
  --color-warn: #f59e0b;          /* Amber-500: Partial protection */
  --color-danger: #ef4444;        /* Red-500: Vulnerable */

  /* Accents */
  --color-terminal: #10b981;      /* Emerald-500: Terminal/code */
  --color-muted: #71717a;         /* Zinc-500: Secondary text */
}
```

### 2.2 Color Usage Guidelines

| Element | Color | Usage |
|---------|-------|-------|
| Page background | `paper` | Main content area |
| Body text | `ink` | Primary content |
| Headlines | `ink` | Authority |
| Redacted blocks | `redaction` | Sensitive data (before reveal) |
| Highlighted data | `highlight` | Critical findings, warnings |
| Interactive links | `evidence` | Clickable elements |
| Success indicators | `safe` | Protected, blocked |
| Warning indicators | `warn` | Partial, attention needed |
| Danger indicators | `danger` | Vulnerable, exposed |
| Code/Data | `terminal` | Technical output |
| Secondary text | `muted` | Captions, metadata |

### 2.3 Dark Mode (The Terminal)

```css
[data-theme="dark"] {
  --color-paper: #09090b;         /* Zinc-950: Deep terminal black */
  --color-paper-dark: #18181b;    /* Zinc-900: Panel backgrounds */
  --color-ink: #fafafa;           /* Zinc-50: Light text */
  --color-ink-light: #a1a1aa;     /* Zinc-400: Secondary text */

  /* Functional colors remain the same */
  --color-highlight: #fde047;
  --color-evidence: #60a5fa;      /* Blue-400: Brighter for dark mode */
}
```

---

## 3. Typography

### 3.1 Font Stack

```css
:root {
  /* Headlines - Authority & Trust */
  --font-serif: 'Merriweather', 'Georgia', 'Times New Roman', serif;

  /* Data & Evidence - Technical Precision */
  --font-mono: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;

  /* Body text - Clean & Readable */
  --font-sans: 'Inter', 'system-ui', '-apple-system', sans-serif;
}
```

### 3.2 Type Scale

```css
/* Fluid typography scale */
:root {
  --text-xs: clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem);    /* 12-14px */
  --text-sm: clamp(0.875rem, 0.8rem + 0.35vw, 1rem);       /* 14-16px */
  --text-base: clamp(1rem, 0.9rem + 0.5vw, 1.125rem);      /* 16-18px */
  --text-lg: clamp(1.125rem, 1rem + 0.6vw, 1.25rem);       /* 18-20px */
  --text-xl: clamp(1.25rem, 1.1rem + 0.75vw, 1.5rem);      /* 20-24px */
  --text-2xl: clamp(1.5rem, 1.25rem + 1.25vw, 2rem);       /* 24-32px */
  --text-3xl: clamp(1.875rem, 1.5rem + 1.9vw, 2.5rem);     /* 30-40px */
  --text-4xl: clamp(2.25rem, 1.75rem + 2.5vw, 3rem);       /* 36-48px */
  --text-5xl: clamp(3rem, 2.25rem + 3.75vw, 4rem);         /* 48-64px */
}
```

### 3.3 Typography Classes

```css
/* Headline styles */
.headline-hero {
  font-family: var(--font-serif);
  font-size: var(--text-5xl);
  font-weight: 900;
  line-height: 1.1;
  letter-spacing: -0.02em;
}

.headline-section {
  font-family: var(--font-serif);
  font-size: var(--text-3xl);
  font-weight: 700;
  line-height: 1.2;
}

.headline-card {
  font-family: var(--font-serif);
  font-size: var(--text-xl);
  font-weight: 600;
  line-height: 1.3;
}

/* Data styles */
.data-value {
  font-family: var(--font-mono);
  font-size: var(--text-lg);
  font-weight: 500;
  letter-spacing: 0.02em;
}

.data-label {
  font-family: var(--font-sans);
  font-size: var(--text-xs);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--color-muted);
}

.data-hash {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  word-break: break-all;
  color: var(--color-terminal);
}

/* Body styles */
.body-text {
  font-family: var(--font-sans);
  font-size: var(--text-base);
  line-height: 1.6;
}

.caption {
  font-family: var(--font-sans);
  font-size: var(--text-xs);
  color: var(--color-muted);
}
```

---

## 4. Core Components

### 4.1 Redacted Text (The Signature Component)

```tsx
// components/redacted/redacted-text.tsx

interface RedactedTextProps {
  children: React.ReactNode;
  revealed?: boolean;
  onReveal?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export function RedactedText({
  children,
  revealed = false,
  onReveal,
  size = 'md'
}: RedactedTextProps) {
  const [isRevealed, setIsRevealed] = useState(revealed);

  const handleReveal = () => {
    setIsRevealed(true);
    onReveal?.();
  };

  const sizeClasses = {
    sm: 'px-1 py-0.5 text-sm',
    md: 'px-2 py-1 text-base',
    lg: 'px-3 py-1.5 text-lg',
  };

  return (
    <span
      className={cn(
        'relative inline-block font-mono cursor-pointer transition-all duration-300',
        sizeClasses[size],
        !isRevealed && 'bg-redaction text-redaction select-none',
        isRevealed && 'bg-highlight/20 text-ink'
      )}
      onMouseEnter={handleReveal}
      role="button"
      tabIndex={0}
      aria-label={isRevealed ? undefined : 'Hover to reveal classified information'}
    >
      {children}

      {/* Hover hint */}
      {!isRevealed && (
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs text-highlight opacity-0 hover:opacity-100 transition-opacity">
            [CLASSIFIED]
          </span>
        </span>
      )}

      {/* Reveal animation overlay */}
      {isRevealed && (
        <motion.span
          initial={{ scaleX: 1 }}
          animate={{ scaleX: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="absolute inset-0 bg-redaction origin-left"
        />
      )}
    </span>
  );
}
```

**Usage:**

```tsx
<p className="text-lg">
  You're browsing from <RedactedText>San Francisco, CA</RedactedText>
  using a <RedactedText>MacBook Pro M2</RedactedText>.
</p>
```

### 4.2 Valuation Card

```tsx
// components/valuation/valuation-card.tsx

interface ValuationCardProps {
  cpm: number;
  persona: string;
  trackabilityScore: number;
  isLoading?: boolean;
}

export function ValuationCard({
  cpm,
  persona,
  trackabilityScore,
  isLoading
}: ValuationCardProps) {
  const getTier = (score: number) => {
    if (score >= 80) return { label: 'EXPOSED', color: 'danger' };
    if (score >= 50) return { label: 'PARTIAL', color: 'warn' };
    return { label: 'PROTECTED', color: 'safe' };
  };

  const tier = getTier(trackabilityScore);

  return (
    <div className="border-2 border-ink bg-paper p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="headline-card flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Your Market Value
        </h3>
        <span className={cn(
          'px-2 py-1 text-xs font-bold uppercase tracking-wider',
          tier.color === 'danger' && 'bg-danger text-white',
          tier.color === 'warn' && 'bg-warn text-ink',
          tier.color === 'safe' && 'bg-safe text-white',
        )}>
          {tier.label}
        </span>
      </div>

      {/* CPM Value */}
      <div className="space-y-1">
        <span className="data-label">Estimated CPM</span>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-mono font-bold">
            ${isLoading ? '—.——' : cpm.toFixed(2)}
          </span>
          <span className="text-sm text-muted">per 1,000 impressions</span>
        </div>
      </div>

      {/* Persona */}
      <div className="space-y-1">
        <span className="data-label">Inferred Persona</span>
        <div className="flex flex-wrap gap-2">
          {persona.split(' / ').map((tag) => (
            <span
              key={tag}
              className="bg-highlight px-2 py-1 text-sm font-medium text-ink"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Trackability Score */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="data-label">Trackability Index</span>
          <span className={cn(
            'font-mono font-bold text-xl',
            tier.color === 'danger' && 'text-danger',
            tier.color === 'warn' && 'text-warn',
            tier.color === 'safe' && 'text-safe',
          )}>
            {trackabilityScore}%
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-3 bg-paper-dark rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${trackabilityScore}%` }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            className={cn(
              'h-full rounded-full',
              tier.color === 'danger' && 'bg-danger',
              tier.color === 'warn' && 'bg-warn',
              tier.color === 'safe' && 'bg-safe',
            )}
          />
        </div>
      </div>

      {/* Explanation */}
      <p className="text-sm text-muted border-t border-paper-dark pt-4">
        This estimate is based on real-time bidding market data and
        your browser's fingerprint entropy. Higher values indicate
        you're more valuable to advertisers.
      </p>
    </div>
  );
}
```

### 4.3 Entropy Gauge

```tsx
// components/entropy/entropy-gauge.tsx

interface EntropyGaugeProps {
  totalBits: number;
  uniqueIn: number;
  breakdown: EntropyBreakdown[];
}

export function EntropyGauge({ totalBits, uniqueIn, breakdown }: EntropyGaugeProps) {
  // Format large numbers
  const formatUniqueness = (n: number) => {
    if (n >= 1000000) return `1 in ${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `1 in ${(n / 1000).toFixed(1)}K`;
    return `1 in ${n}`;
  };

  return (
    <div className="border-2 border-ink bg-paper p-6 space-y-6">
      {/* Main metric */}
      <div className="text-center space-y-2">
        <span className="data-label">Fingerprint Entropy</span>
        <div className="text-5xl font-mono font-bold">
          {totalBits.toFixed(1)}
          <span className="text-xl text-muted ml-1">bits</span>
        </div>
        <div className="text-lg text-highlight font-medium">
          {formatUniqueness(uniqueIn)}
        </div>
      </div>

      {/* Visual gauge */}
      <div className="relative h-8 bg-paper-dark rounded">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min((totalBits / 25) * 100, 100)}%` }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-safe via-warn to-danger rounded"
        />
        {/* Markers */}
        <div className="absolute inset-0 flex justify-between px-2 items-center text-xs font-mono">
          <span>0</span>
          <span>10</span>
          <span>20</span>
          <span>25+</span>
        </div>
      </div>

      {/* Breakdown */}
      <div className="space-y-2">
        <span className="data-label">Signal Breakdown</span>
        {breakdown.slice(0, 5).map((item) => (
          <div key={item.signal} className="flex items-center gap-3">
            <div className="flex-1">
              <div className="flex justify-between text-sm">
                <span>{item.signal}</span>
                <span className="font-mono">{item.bits.toFixed(1)} bits</span>
              </div>
              <div className="h-1.5 bg-paper-dark rounded mt-1">
                <div
                  className={cn(
                    'h-full rounded',
                    item.rarity === 'unique' && 'bg-danger',
                    item.rarity === 'rare' && 'bg-warn',
                    item.rarity === 'uncommon' && 'bg-evidence',
                    item.rarity === 'common' && 'bg-safe',
                  )}
                  style={{ width: `${(item.bits / 20) * 100}%` }}
                />
              </div>
            </div>
            <span className={cn(
              'text-xs px-2 py-0.5 rounded',
              item.rarity === 'unique' && 'bg-danger/10 text-danger',
              item.rarity === 'rare' && 'bg-warn/10 text-warn',
              item.rarity === 'uncommon' && 'bg-evidence/10 text-evidence',
              item.rarity === 'common' && 'bg-safe/10 text-safe',
            )}>
              {item.rarity}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 4.4 RTB Bid Card

```tsx
// components/rtb/bid-card.tsx

interface BidCardProps {
  bid: RTBBid;
  isWinner?: boolean;
  delay?: number;
}

export function BidCard({ bid, isWinner, delay = 0 }: BidCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay }}
      className={cn(
        'flex items-center justify-between p-3 border-l-4',
        isWinner
          ? 'border-l-highlight bg-highlight/10'
          : 'border-l-muted bg-paper-dark'
      )}
    >
      <div className="flex items-center gap-3">
        {/* Bidder icon */}
        <div className={cn(
          'w-8 h-8 rounded flex items-center justify-center text-xs font-bold',
          isWinner ? 'bg-highlight text-ink' : 'bg-muted/20 text-muted'
        )}>
          {bid.bidder.slice(0, 2).toUpperCase()}
        </div>

        <div>
          <div className="font-medium">{bid.bidder}</div>
          <div className="text-xs text-muted">
            Interest: {bid.interest}
          </div>
        </div>
      </div>

      <div className="text-right">
        <div className={cn(
          'font-mono font-bold',
          isWinner ? 'text-highlight text-lg' : 'text-safe'
        )}>
          ${bid.amount.toFixed(4)}
        </div>
        {isWinner && (
          <span className="text-xs text-highlight">WINNING</span>
        )}
      </div>
    </motion.div>
  );
}
```

### 4.5 Defense Score Ring

```tsx
// components/defense/defense-ring.tsx

interface DefenseRingProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function DefenseRing({ score, size = 'md', showLabel = true }: DefenseRingProps) {
  const sizes = {
    sm: { svg: 80, stroke: 6, text: 'text-lg' },
    md: { svg: 120, stroke: 8, text: 'text-2xl' },
    lg: { svg: 160, stroke: 10, text: 'text-4xl' },
  };

  const { svg, stroke, text } = sizes[size];
  const radius = (svg - stroke) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;

  const getColor = (s: number) => {
    if (s >= 80) return 'var(--color-safe)';
    if (s >= 50) return 'var(--color-warn)';
    return 'var(--color-danger)';
  };

  const getTier = (s: number) => {
    if (s >= 80) return 'HARDENED';
    if (s >= 60) return 'PROTECTED';
    if (s >= 40) return 'PARTIAL';
    return 'VULNERABLE';
  };

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={svg} height={svg} className="-rotate-90">
        {/* Background ring */}
        <circle
          cx={svg / 2}
          cy={svg / 2}
          r={radius}
          fill="none"
          stroke="var(--color-paper-dark)"
          strokeWidth={stroke}
        />
        {/* Progress ring */}
        <motion.circle
          cx={svg / 2}
          cy={svg / 2}
          r={radius}
          fill="none"
          stroke={getColor(score)}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn('font-mono font-bold', text)}>
          {score}
        </span>
        {showLabel && (
          <span className="text-xs text-muted uppercase tracking-wider">
            {getTier(score)}
          </span>
        )}
      </div>
    </div>
  );
}
```

### 4.6 Tracker Test Result

```tsx
// components/defense/tracker-result.tsx

interface TrackerResultProps {
  name: string;
  blocked: boolean;
  category: string;
}

export function TrackerResult({ name, blocked, category }: TrackerResultProps) {
  return (
    <div className={cn(
      'flex items-center justify-between p-3 border-l-4',
      blocked
        ? 'border-l-safe bg-safe/5'
        : 'border-l-danger bg-danger/5'
    )}>
      <div className="flex items-center gap-3">
        {blocked ? (
          <CheckCircle className="h-5 w-5 text-safe" />
        ) : (
          <XCircle className="h-5 w-5 text-danger" />
        )}
        <div>
          <div className="font-medium">{name}</div>
          <div className="text-xs text-muted capitalize">{category}</div>
        </div>
      </div>

      <span className={cn(
        'text-xs font-bold uppercase px-2 py-1 rounded',
        blocked
          ? 'bg-safe/10 text-safe'
          : 'bg-danger/10 text-danger'
      )}>
        {blocked ? 'BLOCKED' : 'LOADED'}
      </span>
    </div>
  );
}
```

---

## 5. Layout System

### 5.1 Page Layout

```tsx
// components/layout/page-layout.tsx

export function PageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-paper text-ink">
      {/* Navigation */}
      <header className="border-b-2 border-ink">
        <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Logo />
          <MainNav />
          <ThemeToggle />
        </nav>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-12">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-ink py-8">
        <div className="container mx-auto px-4">
          <FooterContent />
        </div>
      </footer>
    </div>
  );
}
```

### 5.2 Grid System

```css
/* Responsive grid classes */
.grid-investigation {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: 1fr;
}

@media (min-width: 768px) {
  .grid-investigation {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .grid-investigation {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* Featured layout (2/3 + 1/3) */
.grid-featured {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: 1fr;
}

@media (min-width: 1024px) {
  .grid-featured {
    grid-template-columns: 2fr 1fr;
  }
}
```

### 5.3 Section Patterns

```tsx
// Section with investigation-style header
function InvestigationSection({
  title,
  subtitle,
  children
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="py-12 border-t-2 border-ink">
      <div className="mb-8">
        <h2 className="headline-section">{title}</h2>
        {subtitle && (
          <p className="mt-2 text-muted text-lg">{subtitle}</p>
        )}
      </div>
      {children}
    </section>
  );
}
```

---

## 6. Animation Guidelines

### 6.1 Animation Tokens

```css
:root {
  /* Durations */
  --duration-fast: 150ms;
  --duration-normal: 300ms;
  --duration-slow: 500ms;
  --duration-reveal: 800ms;

  /* Easings */
  --ease-out: cubic-bezier(0.0, 0.0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0.0, 0.2, 1);
  --ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

### 6.2 Key Animations

```tsx
// Framer Motion variants

// Redaction reveal
export const redactReveal = {
  hidden: { scaleX: 1 },
  visible: {
    scaleX: 0,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
};

// Bid card entrance
export const bidCardEntrance = {
  hidden: { opacity: 0, x: -20 },
  visible: (delay: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
      delay,
      ease: 'easeOut',
    },
  }),
};

// Data packet flow
export const dataPacketFlow = {
  hidden: { x: 0, opacity: 0 },
  visible: {
    x: [0, 100, 200, 300],
    opacity: [0, 1, 1, 0],
    transition: {
      duration: 1.5,
      times: [0, 0.2, 0.8, 1],
      ease: 'linear',
    },
  },
};

// Progress bar fill
export const progressFill = {
  hidden: { width: 0 },
  visible: (width: number) => ({
    width: `${width}%`,
    transition: {
      duration: 1.5,
      ease: 'easeOut',
    },
  }),
};

// Stagger children
export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
};
```

### 6.3 Reduced Motion Support

```tsx
// hooks/use-reduced-motion.ts
export function useReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return reducedMotion;
}

// Usage
function AnimatedComponent() {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={reducedMotion ? { duration: 0 } : { duration: 0.3 }}
    >
      Content
    </motion.div>
  );
}
```

---

## 7. Responsive Breakpoints

```css
/* Tailwind defaults + custom */
:root {
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
  --breakpoint-2xl: 1536px;
}
```

### Mobile-First Patterns

```tsx
// Responsive component example
function HeroSection() {
  return (
    <section className="
      py-12
      md:py-20
      lg:py-32
    ">
      <h1 className="
        headline-hero
        text-3xl
        md:text-5xl
        lg:text-7xl
      ">
        Deconstruct Your
        <br className="hidden md:block" />
        <span className="bg-highlight px-2">Digital Shadow</span>
      </h1>

      <p className="
        mt-6
        text-base
        md:text-lg
        lg:text-xl
        max-w-prose
      ">
        Your browser fingerprint exposes you...
      </p>

      <div className="
        mt-8
        flex
        flex-col gap-4
        sm:flex-row
      ">
        <Button size="lg">Scan Me</Button>
        <Button variant="outline" size="lg">Learn More</Button>
      </div>
    </section>
  );
}
```

---

## 8. Accessibility Guidelines

### 8.1 Color Contrast

| Text Type | Minimum Ratio | Our Ratio |
|-----------|---------------|-----------|
| Normal text | 4.5:1 | 21:1 (ink on paper) |
| Large text | 3:1 | 21:1 |
| UI components | 3:1 | Varies by color |

### 8.2 Focus States

```css
/* Global focus styles */
:focus-visible {
  outline: 2px solid var(--color-evidence);
  outline-offset: 2px;
}

/* Button focus */
.btn:focus-visible {
  outline: 2px solid var(--color-highlight);
  outline-offset: 2px;
  box-shadow: 0 0 0 4px rgba(253, 224, 71, 0.3);
}
```

### 8.3 ARIA Labels

```tsx
// Redacted text with proper ARIA
<span
  role="button"
  tabIndex={0}
  aria-label={isRevealed ? `${content}` : 'Classified information. Press Enter to reveal.'}
  onKeyDown={(e) => e.key === 'Enter' && handleReveal()}
>
  {children}
</span>

// Progress indicator
<div
  role="progressbar"
  aria-valuenow={score}
  aria-valuemin={0}
  aria-valuemax={100}
  aria-label={`Defense score: ${score} out of 100`}
>
  <DefenseRing score={score} />
</div>
```

---

## 9. Icon System

### 9.1 Icon Library: Lucide React

```tsx
import {
  // Navigation
  Menu, X, ChevronDown, ChevronRight, ExternalLink,

  // Status
  CheckCircle, XCircle, AlertCircle, AlertTriangle, Info,

  // Actions
  Eye, EyeOff, Copy, Download, Share2, RefreshCw,

  // Domain-specific
  Shield, ShieldCheck, ShieldAlert, ShieldOff,
  Fingerprint, Scan, Radio, Wifi, WifiOff,
  DollarSign, TrendingUp, Users, Globe,
  Lock, Unlock, Key,

  // Data
  BarChart3, PieChart, Activity,
} from 'lucide-react';
```

### 9.2 Icon Sizes

```tsx
// Consistent icon sizing
const iconSizes = {
  xs: 'h-3 w-3',   // 12px - inline with small text
  sm: 'h-4 w-4',   // 16px - buttons, labels
  md: 'h-5 w-5',   // 20px - default
  lg: 'h-6 w-6',   // 24px - cards, headers
  xl: 'h-8 w-8',   // 32px - hero elements
};
```

---

## 10. Component Library (shadcn/ui)

### 10.1 Installed Components

```bash
# Core components to install
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add tooltip
npx shadcn-ui@latest add progress
npx shadcn-ui@latest add switch
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add separator
```

### 10.2 Custom Theme Overrides

```tsx
// components/ui/button.tsx - Custom variants
const buttonVariants = cva(
  'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-ink text-paper hover:bg-ink/90',
        destructive: 'bg-danger text-white hover:bg-danger/90',
        outline: 'border-2 border-ink bg-transparent hover:bg-ink hover:text-paper',
        ghost: 'hover:bg-paper-dark',
        link: 'text-evidence underline-offset-4 hover:underline',
        highlight: 'bg-highlight text-ink hover:bg-highlight/90 font-bold',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 px-3 text-sm',
        lg: 'h-12 px-8 text-lg',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);
```
