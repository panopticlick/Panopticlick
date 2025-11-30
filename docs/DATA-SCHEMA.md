# Panopticlick.org - Data Schema

> Complete database schema, API contracts, and data structures for the Digital Self-Defense System.

---

## 1. Database Schema (Cloudflare D1)

### 1.1 Core Tables

```sql
-- ============================================
-- PANOPTICLICK.ORG DATABASE SCHEMA
-- Cloudflare D1 (SQLite)
-- ============================================

-- Session tracking (anonymized)
CREATE TABLE sessions (
    id TEXT PRIMARY KEY,                    -- UUID v4
    created_at INTEGER NOT NULL,            -- Unix timestamp (ms)

    -- Anonymized identity
    ip_hash TEXT NOT NULL,                  -- SHA-256 of IP (never store raw)
    country_code TEXT,                      -- ISO 3166-1 alpha-2 (from CF headers)

    -- Consent tracking
    consent_given INTEGER DEFAULT 0,        -- 0 = no, 1 = yes
    consent_timestamp INTEGER,              -- When consent was given

    -- Session metadata
    user_agent TEXT,
    referrer TEXT,

    INDEX idx_sessions_created (created_at),
    INDEX idx_sessions_country (country_code)
);

-- Fingerprint analysis results
CREATE TABLE fingerprint_analyses (
    id TEXT PRIMARY KEY,                    -- UUID v4
    session_id TEXT NOT NULL,               -- FK to sessions
    created_at INTEGER NOT NULL,

    -- Entropy metrics
    entropy_total REAL NOT NULL,            -- Total bits of entropy
    entropy_hardware REAL,                  -- Hardware-only entropy
    entropy_software REAL,                  -- Software-only entropy

    -- Uniqueness
    unique_in_population INTEGER,           -- "1 in N" value
    most_unique_signal TEXT,                -- e.g., "Canvas Hash"
    most_unique_bits REAL,                  -- Bits for most unique signal

    -- Hash tiers (never store raw fingerprint data)
    hash_hardware TEXT NOT NULL,            -- SHA-256 of hardware signals
    hash_software TEXT NOT NULL,            -- SHA-256 of software signals
    hash_full TEXT NOT NULL,                -- SHA-256 of all signals

    -- Collection metadata
    collect_duration_ms INTEGER,            -- How long collection took
    signals_collected INTEGER,              -- Number of signals gathered
    signals_failed INTEGER,                 -- Number of failed collections

    FOREIGN KEY (session_id) REFERENCES sessions(id),
    INDEX idx_analyses_session (session_id),
    INDEX idx_analyses_hash_full (hash_full),
    INDEX idx_analyses_entropy (entropy_total)
);

-- Individual signal entropy (for breakdown display)
CREATE TABLE signal_entropy (
    id TEXT PRIMARY KEY,
    analysis_id TEXT NOT NULL,              -- FK to fingerprint_analyses

    signal_name TEXT NOT NULL,              -- e.g., "canvas", "webgl_renderer"
    signal_category TEXT NOT NULL,          -- "hardware" | "software" | "network"
    entropy_bits REAL NOT NULL,
    rarity TEXT NOT NULL,                   -- "common" | "uncommon" | "rare" | "unique"

    -- For display (no sensitive data)
    display_value TEXT,                     -- e.g., "Apple M2 GPU" (safe to show)

    FOREIGN KEY (analysis_id) REFERENCES fingerprint_analyses(id),
    INDEX idx_signal_analysis (analysis_id)
);

-- RTB simulation results
CREATE TABLE rtb_simulations (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    created_at INTEGER NOT NULL,

    -- Valuation
    estimated_cpm REAL NOT NULL,            -- Dollars per 1000 impressions
    persona_segment TEXT,                   -- e.g., "Tech / Developer / MacOS"
    trackability_score REAL NOT NULL,       -- 0-100 scale

    -- Auction results
    total_bidders INTEGER NOT NULL,
    winning_bidder TEXT,
    winning_bid REAL,

    -- Interests inferred
    interests_json TEXT,                    -- JSON array of interests

    FOREIGN KEY (session_id) REFERENCES sessions(id),
    INDEX idx_rtb_session (session_id),
    INDEX idx_rtb_cpm (estimated_cpm)
);

-- Individual bids in simulation
CREATE TABLE rtb_bids (
    id TEXT PRIMARY KEY,
    simulation_id TEXT NOT NULL,

    bidder_name TEXT NOT NULL,              -- e.g., "Google Ads"
    bid_amount REAL NOT NULL,               -- Dollar amount
    interest_category TEXT,                 -- Why they bid
    bid_timestamp INTEGER NOT NULL,

    FOREIGN KEY (simulation_id) REFERENCES rtb_simulations(id),
    INDEX idx_bids_simulation (simulation_id)
);

-- Supercookie detection results
CREATE TABLE supercookie_tests (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    created_at INTEGER NOT NULL,

    -- HSTS test
    hsts_vulnerable INTEGER,                -- 0 = no, 1 = yes
    hsts_id_recovered TEXT,                 -- The ID we recovered (if any)

    -- Favicon test
    favicon_vulnerable INTEGER,

    -- ETag test
    etag_vulnerable INTEGER,

    -- LocalStorage persistence
    ls_persistent INTEGER,

    -- IndexedDB persistence
    idb_persistent INTEGER,

    FOREIGN KEY (session_id) REFERENCES sessions(id),
    INDEX idx_supercookie_session (session_id)
);

-- Defense audit results
CREATE TABLE defense_audits (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    created_at INTEGER NOT NULL,

    -- AdBlocker test
    adblock_score INTEGER,                  -- 0-100 percentage blocked
    trackers_tested INTEGER,
    trackers_blocked INTEGER,

    -- Privacy headers
    dnt_enabled INTEGER,                    -- Do Not Track
    gpc_enabled INTEGER,                    -- Global Privacy Control
    referrer_policy TEXT,

    -- Browser protections
    canvas_blocked INTEGER,
    webgl_blocked INTEGER,
    audio_blocked INTEGER,

    -- DNS
    dns_encrypted INTEGER,                  -- DoH/DoT detected
    dns_provider TEXT,                      -- e.g., "Cloudflare", "Google"

    FOREIGN KEY (session_id) REFERENCES sessions(id),
    INDEX idx_defense_session (session_id)
);

-- Blocked trackers detail
CREATE TABLE blocked_trackers (
    id TEXT PRIMARY KEY,
    audit_id TEXT NOT NULL,

    tracker_name TEXT NOT NULL,             -- e.g., "Google Analytics"
    tracker_url TEXT NOT NULL,
    blocked INTEGER NOT NULL,               -- 0 = loaded, 1 = blocked

    FOREIGN KEY (audit_id) REFERENCES defense_audits(id),
    INDEX idx_trackers_audit (audit_id)
);

-- ============================================
-- AGGREGATION TABLES (for global stats)
-- ============================================

-- Global statistics (updated periodically)
CREATE TABLE global_stats (
    metric_key TEXT PRIMARY KEY,
    metric_value REAL NOT NULL,
    sample_size INTEGER,
    updated_at INTEGER NOT NULL
);

-- Pre-computed values for global_stats:
-- 'total_scans'
-- 'avg_entropy'
-- 'median_entropy'
-- 'avg_cpm'
-- 'avg_adblock_score'
-- 'pct_canvas_unique'
-- 'pct_vpn_users'
-- 'pct_adblock_users'

-- Entropy distribution buckets
CREATE TABLE entropy_distribution (
    bucket_min REAL NOT NULL,               -- e.g., 10.0
    bucket_max REAL NOT NULL,               -- e.g., 12.0
    count INTEGER NOT NULL,
    percentage REAL NOT NULL,
    updated_at INTEGER NOT NULL,

    PRIMARY KEY (bucket_min, bucket_max)
);

-- Signal frequency table (for entropy calculation)
CREATE TABLE signal_frequencies (
    signal_name TEXT NOT NULL,
    signal_value_hash TEXT NOT NULL,        -- SHA-256 of the value
    occurrence_count INTEGER NOT NULL,
    last_seen INTEGER NOT NULL,

    PRIMARY KEY (signal_name, signal_value_hash),
    INDEX idx_freq_signal (signal_name)
);

-- ============================================
-- OPT-OUT TABLE
-- ============================================

CREATE TABLE opt_outs (
    ip_hash TEXT PRIMARY KEY,               -- SHA-256 of IP
    opted_out_at INTEGER NOT NULL,

    INDEX idx_optout_date (opted_out_at)
);
```

### 1.2 Database Migrations

```sql
-- Migration 001: Initial schema
-- Run: wrangler d1 execute panopticlick-db --file=./migrations/001_initial.sql

-- Migration 002: Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_analyses_created ON fingerprint_analyses(created_at);
CREATE INDEX IF NOT EXISTS idx_rtb_created ON rtb_simulations(created_at);

-- Migration 003: Add data retention cleanup
-- (Run via scheduled Worker)
DELETE FROM sessions WHERE created_at < (strftime('%s', 'now') - 30*24*60*60) * 1000;
DELETE FROM fingerprint_analyses WHERE created_at < (strftime('%s', 'now') - 30*24*60*60) * 1000;
```

---

## 2. TypeScript Type Definitions

### 2.1 Core Types

```typescript
// packages/types/src/fingerprint.ts

// ============================================
// FINGERPRINT PAYLOAD (Client → Server)
// ============================================

export interface FingerprintPayload {
  meta: FingerprintMeta;
  hardware: HardwareSignals;
  software: SoftwareSignals;
  capabilities: CapabilitySignals;
  network: NetworkSignals;
  behavior?: BehaviorSignals;
}

export interface FingerprintMeta {
  sessionId: string;
  timestamp: number;
  collectDuration: number;
  sdkVersion: string;
  consentGiven: boolean;
}

// Hardware signals (Gold Lock tier)
export interface HardwareSignals {
  canvas: CanvasFingerprint | null;
  webgl: WebGLFingerprint | null;
  audio: AudioFingerprint | null;
  screen: ScreenInfo;
  cpu: number;                    // navigator.hardwareConcurrency
  memory: number | null;          // navigator.deviceMemory (GB)
  gpu: GPUInfo | null;
  touchPoints: number;
}

export interface CanvasFingerprint {
  hash: string;
  geometry: string;               // Hash of text metrics
  blocked: boolean;
}

export interface WebGLFingerprint {
  hash: string;
  vendor: string;
  renderer: string;
  version: string;
  shadingLanguageVersion: string;
  extensions: string[];
  maxTextureSize: number;
  blocked: boolean;
}

export interface AudioFingerprint {
  hash: string;
  sampleRate: number;
  channelCount: number;
  blocked: boolean;
}

export interface ScreenInfo {
  width: number;
  height: number;
  availWidth: number;
  availHeight: number;
  colorDepth: number;
  pixelRatio: number;
  orientation: string;
}

export interface GPUInfo {
  vendor: string;
  renderer: string;
}

// Software signals (Silver Lock tier)
export interface SoftwareSignals {
  userAgent: string;
  platform: string;
  vendor: string;
  language: string;
  languages: string[];
  timezone: string;
  timezoneOffset: number;
  fonts: FontInfo;
  plugins: PluginInfo[];
  mimeTypes: string[];
  cookiesEnabled: boolean;
  doNotTrack: string | null;
  globalPrivacyControl: boolean | null;
  darkMode: boolean;
  reducedMotion: boolean;
  reducedTransparency: boolean;
  forcedColors: boolean;
}

export interface FontInfo {
  hash: string;
  count: number;
  detected: string[];             // List of detected fonts
}

export interface PluginInfo {
  name: string;
  filename: string;
}

// Capability signals
export interface CapabilitySignals {
  localStorage: boolean;
  sessionStorage: boolean;
  indexedDB: boolean;
  webWorker: boolean;
  serviceWorker: boolean;
  sharedWorker: boolean;
  webGL: boolean;
  webGL2: boolean;
  webRTC: boolean;
  webSocket: boolean;
  webAssembly: boolean;
  bluetooth: boolean;
  usb: boolean;
  midi: boolean;
  notifications: boolean;
  geolocation: boolean;
  pdfViewer: boolean;
}

// Network signals (added server-side)
export interface NetworkSignals {
  connectionType: string | null;  // 4g, wifi, etc.
  downlink: number | null;        // Mbps
  rtt: number | null;             // Round-trip time ms
  saveData: boolean;
}

// Behavioral biometrics (optional)
export interface BehaviorSignals {
  mouseEntropy: number | null;
  scrollPatterns: number | null;
  keystrokeDynamics: number | null;
}

// ============================================
// NETWORK DATA (Server-side enrichment)
// ============================================

export interface NetworkIntelligence {
  ip: string;                     // Never store raw, only for processing
  ipHash: string;                 // SHA-256 for storage
  asn: string;
  asnOrg: string;
  country: string;
  countryCode: string;
  region: string;
  city: string;
  isProxy: boolean;
  isVPN: boolean;
  isTor: boolean;
  isDatacenter: boolean;
  riskScore: number;              // 0-100
}
```

### 2.2 Valuation Types

```typescript
// packages/types/src/valuation.ts

// ============================================
// VALUATION REPORT (Server → Client)
// ============================================

export interface ValuationReport {
  meta: ReportMeta;
  entropy: EntropyReport;
  valuation: MarketValuation;
  defenses: DefenseStatus;
  comparison: PopulationComparison;
}

export interface ReportMeta {
  sessionId: string;
  analysisId: string;
  timestamp: number;
  processingTime: number;
}

// Entropy analysis
export interface EntropyReport {
  totalBits: number;              // e.g., 18.4
  uniqueIn: number;               // e.g., 3500000 (1 in 3.5M)
  uniqueInFormatted: string;      // e.g., "1 in 3.5 million"
  tier: 'common' | 'uncommon' | 'rare' | 'unique';
  breakdown: EntropyBreakdown[];
  mostUniqueSignal: string;
}

export interface EntropyBreakdown {
  signal: string;                 // e.g., "Canvas"
  category: 'hardware' | 'software' | 'network';
  bits: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'unique';
  description: string;            // Human-readable explanation
  percentile: number;             // Where this falls in population
}

// Market valuation (simulated)
export interface MarketValuation {
  estimatedCPM: number;           // e.g., 5.42 dollars
  personaSegment: string;         // e.g., "Tech / Developer / MacOS"
  trackabilityScore: number;      // 0-100
  trackabilityTier: 'protected' | 'partial' | 'exposed';
  interestCategories: string[];
  rtbSimulation: RTBSimulationResult;
}

export interface RTBSimulationResult {
  totalBidders: number;
  bids: RTBBid[];
  winningBid: RTBBid;
  auctionDuration: number;        // Simulated ms
}

export interface RTBBid {
  bidder: string;                 // e.g., "Google Ads"
  bidderType: 'dsp' | 'ssp' | 'exchange';
  amount: number;                 // e.g., 0.0054
  interest: string;               // Why they're bidding
  confidence: number;             // 0-1 match confidence
  timestamp: number;
}

// Defense status
export interface DefenseStatus {
  overallScore: number;           // 0-100
  tier: 'vulnerable' | 'partial' | 'protected' | 'hardened';

  // Individual checks
  adBlocker: AdBlockerStatus;
  privacyHeaders: PrivacyHeaderStatus;
  fingerprintProtection: FingerprintProtectionStatus;
  networkPrivacy: NetworkPrivacyStatus;
}

export interface AdBlockerStatus {
  detected: boolean;
  score: number;                  // 0-100 effectiveness
  trackersBlocked: number;
  trackersTested: number;
  details: TrackerTestResult[];
}

export interface TrackerTestResult {
  name: string;
  url: string;
  blocked: boolean;
  category: 'analytics' | 'advertising' | 'social' | 'other';
}

export interface PrivacyHeaderStatus {
  doNotTrack: boolean;
  globalPrivacyControl: boolean;
  referrerPolicy: string;
  score: number;
}

export interface FingerprintProtectionStatus {
  canvasBlocked: boolean;
  webglBlocked: boolean;
  audioBlocked: boolean;
  fontsRestricted: boolean;
  score: number;
}

export interface NetworkPrivacyStatus {
  usingVPN: boolean;
  usingTor: boolean;
  dnsEncrypted: boolean;
  dnsProvider: string | null;
  webrtcLeaking: boolean;
  score: number;
}

// Population comparison
export interface PopulationComparison {
  sampleSize: number;
  entropyPercentile: number;      // e.g., 95 = more unique than 95%
  cpmPercentile: number;
  defensePercentile: number;
  similarProfiles: number;        // Profiles with same hash
}
```

### 2.3 API Types

```typescript
// packages/types/src/api.ts

// ============================================
// API REQUEST/RESPONSE TYPES
// ============================================

// POST /api/scan/start
export interface ScanStartRequest {
  consent: boolean;
  referrer?: string;
}

export interface ScanStartResponse {
  sessionId: string;
  consentRecorded: boolean;
}

// POST /api/scan/collect
export interface ScanCollectRequest {
  sessionId: string;
  fingerprint: FingerprintPayload;
}

export interface ScanCollectResponse {
  success: boolean;
  analysisId: string;
  report: ValuationReport;
}

// POST /api/rtb/simulate
export interface RTBSimulateRequest {
  sessionId: string;
  fingerprint: Partial<FingerprintPayload>;
  geo?: {
    country: string;
    city: string;
  };
}

export interface RTBSimulateResponse {
  success: boolean;
  simulationId: string;
  result: RTBSimulationResult;
  estimatedCPM: number;
  persona: string;
}

// POST /api/supercookie/set
export interface SupercookieSetRequest {
  sessionId: string;
  type: 'hsts' | 'favicon' | 'etag';
}

export interface SupercookieSetResponse {
  success: boolean;
  cookieId: string;
}

// POST /api/supercookie/read
export interface SupercookieReadRequest {
  sessionId: string;
  type: 'hsts' | 'favicon' | 'etag';
}

export interface SupercookieReadResponse {
  success: boolean;
  detected: boolean;
  recoveredId: string | null;
  message: string;
}

// POST /api/defense/test
export interface DefenseTestRequest {
  sessionId: string;
  tests: ('adblock' | 'headers' | 'fingerprint' | 'network')[];
}

export interface DefenseTestResponse {
  success: boolean;
  auditId: string;
  results: DefenseStatus;
}

// GET /api/stats/global
export interface GlobalStatsResponse {
  totalScans: number;
  avgEntropy: number;
  medianEntropy: number;
  avgCPM: number;
  avgAdblockScore: number;
  entropyDistribution: EntropyBucket[];
  topBrowsers: BrowserStat[];
  topCountries: CountryStat[];
  updatedAt: number;
}

export interface EntropyBucket {
  min: number;
  max: number;
  count: number;
  percentage: number;
}

export interface BrowserStat {
  browser: string;
  count: number;
  percentage: number;
}

export interface CountryStat {
  country: string;
  countryCode: string;
  count: number;
  percentage: number;
}

// POST /api/opt-out
export interface OptOutRequest {
  confirm: boolean;
}

export interface OptOutResponse {
  success: boolean;
  message: string;
}

// ============================================
// ERROR RESPONSES
// ============================================

export interface APIError {
  error: true;
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export type APIErrorCode =
  | 'CONSENT_REQUIRED'
  | 'INVALID_SESSION'
  | 'RATE_LIMITED'
  | 'INVALID_PAYLOAD'
  | 'COLLECTION_FAILED'
  | 'INTERNAL_ERROR';
```

---

## 3. Cloudflare KV Schema

```typescript
// KV Namespace: PANOPTICLICK_KV

// Session data (TTL: 24 hours)
// Key: session:{sessionId}
interface SessionKV {
  id: string;
  createdAt: number;
  ipHash: string;
  consentGiven: boolean;
  lastActivity: number;
}

// Rate limiting (TTL: 1 minute)
// Key: ratelimit:{ipHash}
interface RateLimitKV {
  count: number;
  windowStart: number;
}

// HSTS supercookie tokens (TTL: 1 year)
// Key: hsts:{tokenId}
interface HSTSTokenKV {
  sessionId: string;
  createdAt: number;
  bits: number[];  // Array of bit positions
}

// Opt-out cache (TTL: 30 days)
// Key: optout:{ipHash}
interface OptOutKV {
  optedOutAt: number;
}
```

---

## 4. Data Flow Diagrams

### 4.1 Fingerprint Collection Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT BROWSER                           │
│                                                                  │
│  1. User clicks "Scan Me"                                       │
│     ↓                                                           │
│  2. Consent check (GDPR banner if needed)                       │
│     ↓                                                           │
│  3. POST /api/scan/start { consent: true }                      │
│     ↓                                                           │
│  4. Receive { sessionId: "xxx" }                                │
│     ↓                                                           │
│  5. Run collectors in parallel:                                 │
│     ┌──────────────────────────────────────────────────┐       │
│     │ Promise.allSettled([                              │       │
│     │   collectCanvas(),                                │       │
│     │   collectWebGL(),                                 │       │
│     │   collectAudio(),                                 │       │
│     │   collectFonts(),                                 │       │
│     │   collectScreen(),                                │       │
│     │   ...                                             │       │
│     │ ])                                                │       │
│     └──────────────────────────────────────────────────┘       │
│     ↓                                                           │
│  6. POST /api/scan/collect { sessionId, fingerprint }           │
│     ↓                                                           │
│  7. Receive ValuationReport                                     │
│     ↓                                                           │
│  8. Display results with animations                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      CLOUDFLARE WORKER                           │
│                                                                  │
│  /api/scan/start:                                               │
│  ┌────────────────────────────────────────────────────┐        │
│  │ 1. Generate sessionId (UUID v4)                     │        │
│  │ 2. Hash IP: sha256(cf-connecting-ip)                │        │
│  │ 3. Check opt-out list (KV)                          │        │
│  │ 4. Store session in KV (24h TTL)                    │        │
│  │ 5. Return { sessionId }                             │        │
│  └────────────────────────────────────────────────────┘        │
│                                                                  │
│  /api/scan/collect:                                             │
│  ┌────────────────────────────────────────────────────┐        │
│  │ 1. Validate session from KV                         │        │
│  │ 2. Rate limit check (10 req/min per IP)             │        │
│  │ 3. Enrich with network data:                        │        │
│  │    - cf-ipcountry, cf-ipcity headers                │        │
│  │    - ASN lookup (ipinfo.io batch)                   │        │
│  │ 4. Calculate hashes:                                │        │
│  │    - hardwareHash = sha256(canvas|webgl|audio|...)  │        │
│  │    - softwareHash = sha256(ua|fonts|tz|...)         │        │
│  │    - fullHash = sha256(hardware|software|network)   │        │
│  │ 5. Calculate entropy (lookup signal_frequencies)    │        │
│  │ 6. Simulate RTB auction                             │        │
│  │ 7. Store in D1 (anonymized)                         │        │
│  │ 8. Update global stats                              │        │
│  │ 9. Return ValuationReport                           │        │
│  └────────────────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ SQL
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       CLOUDFLARE D1                              │
│                                                                  │
│  INSERT INTO sessions (id, created_at, ip_hash, ...)            │
│  INSERT INTO fingerprint_analyses (...)                         │
│  INSERT INTO signal_entropy (...)                               │
│  INSERT INTO rtb_simulations (...)                              │
│  UPDATE signal_frequencies SET count = count + 1 ...            │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 RTB Simulation Data Model

```
┌─────────────────────────────────────────────────────────────────┐
│                    RTB SIMULATION ENGINE                         │
│                                                                  │
│  Input: FingerprintPayload + NetworkIntelligence                │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐     │
│  │ PERSONA INFERENCE                                       │     │
│  │                                                         │     │
│  │ Rules:                                                  │     │
│  │ • webgl.renderer contains "Apple" → Tech, Premium       │     │
│  │ • platform = "MacIntel" → Creative, Design              │     │
│  │ • screen.width > 2500 → Professional, High-Income       │     │
│  │ • timezone = "America/*" → US Market, Shopping          │     │
│  │ • fonts.count > 200 → Creative Professional             │     │
│  │ • language = "en-US" → Primary English Market           │     │
│  │                                                         │     │
│  │ Output: { segment: "Tech / Developer", interests: [...] }│     │
│  └────────────────────────────────────────────────────────┘     │
│                              │                                   │
│                              ▼                                   │
│  ┌────────────────────────────────────────────────────────┐     │
│  │ BID GENERATION                                          │     │
│  │                                                         │     │
│  │ For each DSP in DSP_PROFILES:                           │     │
│  │   baseRate = dsp.baseRate                               │     │
│  │   interestMatch = persona.interests ∩ dsp.interests     │     │
│  │   multiplier = interestMatch ? 1.2 : 0.8                │     │
│  │   geoMultiplier = getGeoMultiplier(network.country)     │     │
│  │   randomFactor = 0.9 + Math.random() * 0.2              │     │
│  │   finalBid = baseRate * multiplier * geoMultiplier      │     │
│  │                * randomFactor                           │     │
│  │                                                         │     │
│  │ DSP Profiles:                                           │     │
│  │ ┌─────────────────────────────────────────────────┐    │     │
│  │ │ Name           │ Base Rate │ Interests           │    │     │
│  │ ├─────────────────────────────────────────────────┤    │     │
│  │ │ Google Ads     │ $0.005    │ Tech, Shopping      │    │     │
│  │ │ Criteo         │ $0.004    │ Retargeting, Fashion│    │     │
│  │ │ The Trade Desk │ $0.008    │ Luxury, Auto        │    │     │
│  │ │ Amazon DSP     │ $0.006    │ Shopping, Books     │    │     │
│  │ │ Meta Audience  │ $0.007    │ Social, Gaming      │    │     │
│  │ │ Xandr          │ $0.005    │ Video, Entertainment│    │     │
│  │ │ PubMatic       │ $0.004    │ News, Sports        │    │     │
│  │ └─────────────────────────────────────────────────┘    │     │
│  └────────────────────────────────────────────────────────┘     │
│                              │                                   │
│                              ▼                                   │
│  Output: RTBSimulationResult                                    │
│  {                                                              │
│    totalBidders: 7,                                             │
│    bids: [...],                                                 │
│    winningBid: { bidder: "The Trade Desk", amount: 0.0082 },   │
│    estimatedCPM: 8.20                                           │
│  }                                                              │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. Data Privacy Compliance

### 5.1 GDPR Compliance Matrix

| Data Type | Collected | Stored | Retention | Legal Basis |
|-----------|-----------|--------|-----------|-------------|
| IP Address | Yes (processing) | Hash only | 30 days | Legitimate interest |
| Fingerprint signals | Yes | Hash only | 30 days | Consent |
| Country/City | Yes | Yes | 30 days | Legitimate interest |
| Browser/OS | Yes | Yes | 30 days | Consent |
| Cookies | No | No | N/A | N/A |
| Personal identifiers | No | No | N/A | N/A |

### 5.2 Data Processing Rules

```typescript
// RULE 1: Never store raw IP
const ipHash = await sha256(request.headers.get('cf-connecting-ip'));
// Store ipHash, not raw IP

// RULE 2: Never store raw fingerprint
const hardwareHash = await sha256(
  [canvas.hash, webgl.hash, audio.hash].join('|')
);
// Store hardwareHash, not individual fingerprints

// RULE 3: Check opt-out before processing
const isOptedOut = await env.KV.get(`optout:${ipHash}`);
if (isOptedOut) {
  return c.json({ error: 'OPTED_OUT' }, 403);
}

// RULE 4: Auto-delete after 30 days
// Scheduled Worker runs daily:
await env.DB.prepare(`
  DELETE FROM sessions
  WHERE created_at < ?
`).bind(Date.now() - 30 * 24 * 60 * 60 * 1000).run();

// RULE 5: Consent required for full analysis
if (!payload.meta.consentGiven) {
  // Only return basic, non-personalized info
  return c.json({
    entropy: { totalBits: null, uniqueIn: null },
    valuation: { estimatedCPM: null },
    defenses: { overallScore: null },
  });
}
```

### 5.3 Opt-Out Implementation

```typescript
// POST /api/opt-out
app.post('/opt-out', async (c) => {
  const ipHash = await sha256(c.req.header('cf-connecting-ip') || '');

  // 1. Mark in KV (fast lookup)
  await c.env.KV.put(`optout:${ipHash}`, '1', {
    expirationTtl: 30 * 24 * 60 * 60, // 30 days
  });

  // 2. Mark in D1 (permanent record)
  await c.env.DB.prepare(`
    INSERT OR REPLACE INTO opt_outs (ip_hash, opted_out_at)
    VALUES (?, ?)
  `).bind(ipHash, Date.now()).run();

  // 3. Delete existing data for this IP
  await c.env.DB.prepare(`
    DELETE FROM sessions WHERE ip_hash = ?
  `).bind(ipHash).run();

  return c.json({
    success: true,
    message: 'Your data has been deleted and future collection disabled.',
  });
});
```

---

## 6. Entropy Calculation Reference

### 6.1 Base Entropy Values

```typescript
// packages/valuation-engine/src/entropy-table.ts

// These values represent bits of entropy per signal
// Based on empirical data from fingerprinting research

export const ENTROPY_BASE: Record<string, number> = {
  // Hardware (High entropy)
  'canvas': 17.8,           // Highly unique rendering
  'webgl_renderer': 12.3,   // GPU model
  'webgl_vendor': 4.2,      // GPU vendor
  'audio': 8.5,             // Audio context
  'cpu_cores': 3.1,         // hardwareConcurrency
  'device_memory': 2.8,     // RAM amount

  // Screen (Medium entropy)
  'screen_resolution': 4.8, // Width x Height
  'screen_depth': 1.2,      // Color depth
  'pixel_ratio': 2.4,       // Device pixel ratio

  // Software (Medium entropy)
  'user_agent': 10.2,       // Full UA string
  'platform': 3.5,          // OS platform
  'language': 4.1,          // Primary language
  'languages': 6.2,         // Language array
  'timezone': 5.8,          // IANA timezone
  'fonts': 12.5,            // Installed fonts

  // Capabilities (Low entropy)
  'plugins': 5.2,           // Browser plugins
  'webgl_extensions': 7.3,  // GL extensions
  'touch_support': 1.8,     // Touch capability

  // Preferences (Low entropy)
  'dark_mode': 0.9,
  'reduced_motion': 0.3,
  'do_not_track': 0.6,
};

// Rarity thresholds
export const RARITY_THRESHOLDS = {
  common: 3,      // < 3 bits
  uncommon: 6,    // 3-6 bits
  rare: 10,       // 6-10 bits
  unique: 100,    // > 10 bits
};
```

### 6.2 Dynamic Entropy Calculation

```typescript
export async function calculateDynamicEntropy(
  signal: string,
  valueHash: string,
  db: D1Database
): Promise<number> {
  // Look up frequency in population
  const result = await db.prepare(`
    SELECT occurrence_count FROM signal_frequencies
    WHERE signal_name = ? AND signal_value_hash = ?
  `).bind(signal, valueHash).first<{ occurrence_count: number }>();

  if (!result) {
    // Never seen before = maximum entropy for this signal
    return ENTROPY_BASE[signal] || 10;
  }

  // Get total population
  const total = await db.prepare(`
    SELECT SUM(occurrence_count) as total FROM signal_frequencies
    WHERE signal_name = ?
  `).bind(signal).first<{ total: number }>();

  // Calculate entropy: -log2(probability)
  const probability = result.occurrence_count / (total?.total || 1);
  const entropy = -Math.log2(probability);

  // Cap at base entropy
  return Math.min(entropy, ENTROPY_BASE[signal] || 20);
}
```

---

## 7. Sample Data Examples

### 7.1 Sample ValuationReport

```json
{
  "meta": {
    "sessionId": "550e8400-e29b-41d4-a716-446655440000",
    "analysisId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "timestamp": 1710000000000,
    "processingTime": 245
  },
  "entropy": {
    "totalBits": 18.4,
    "uniqueIn": 346112,
    "uniqueInFormatted": "1 in 346,000",
    "tier": "unique",
    "breakdown": [
      {
        "signal": "Canvas",
        "category": "hardware",
        "bits": 17.2,
        "rarity": "unique",
        "description": "Your canvas rendering is extremely distinctive",
        "percentile": 99.7
      },
      {
        "signal": "WebGL Renderer",
        "category": "hardware",
        "bits": 11.8,
        "rarity": "rare",
        "description": "Apple M2 Pro GPU (rare configuration)",
        "percentile": 98.2
      },
      {
        "signal": "Fonts",
        "category": "software",
        "bits": 10.5,
        "rarity": "rare",
        "description": "You have 287 fonts installed",
        "percentile": 95.0
      }
    ],
    "mostUniqueSignal": "Canvas"
  },
  "valuation": {
    "estimatedCPM": 8.42,
    "personaSegment": "Tech / Developer / Premium",
    "trackabilityScore": 94,
    "trackabilityTier": "exposed",
    "interestCategories": ["Technology", "Software", "Design", "Travel"],
    "rtbSimulation": {
      "totalBidders": 7,
      "bids": [
        { "bidder": "The Trade Desk", "amount": 0.0084, "interest": "Luxury", "confidence": 0.85 },
        { "bidder": "Meta Audience", "amount": 0.0072, "interest": "Tech", "confidence": 0.92 },
        { "bidder": "Google Ads", "amount": 0.0068, "interest": "Software", "confidence": 0.88 }
      ],
      "winningBid": { "bidder": "The Trade Desk", "amount": 0.0084, "interest": "Luxury" },
      "auctionDuration": 85
    }
  },
  "defenses": {
    "overallScore": 35,
    "tier": "vulnerable",
    "adBlocker": {
      "detected": true,
      "score": 75,
      "trackersBlocked": 6,
      "trackersTested": 8
    },
    "privacyHeaders": {
      "doNotTrack": false,
      "globalPrivacyControl": false,
      "referrerPolicy": "strict-origin-when-cross-origin",
      "score": 40
    },
    "fingerprintProtection": {
      "canvasBlocked": false,
      "webglBlocked": false,
      "audioBlocked": false,
      "fontsRestricted": false,
      "score": 0
    },
    "networkPrivacy": {
      "usingVPN": false,
      "usingTor": false,
      "dnsEncrypted": true,
      "dnsProvider": "Cloudflare",
      "webrtcLeaking": true,
      "score": 50
    }
  },
  "comparison": {
    "sampleSize": 1250000,
    "entropyPercentile": 97,
    "cpmPercentile": 89,
    "defensePercentile": 22,
    "similarProfiles": 3
  }
}
```

---

## 8. Index Strategy

```sql
-- Performance-critical queries and their indexes

-- Query: Find sessions by IP hash (opt-out check)
-- Index: idx_sessions_ip (implicit via opt_outs PK)
SELECT * FROM opt_outs WHERE ip_hash = ?;

-- Query: Count similar fingerprints
-- Index: idx_analyses_hash_full
SELECT COUNT(*) FROM fingerprint_analyses WHERE hash_full = ?;

-- Query: Calculate entropy percentile
-- Index: idx_analyses_entropy
SELECT COUNT(*) FROM fingerprint_analyses WHERE entropy_total < ?;

-- Query: Signal frequency lookup
-- Index: idx_freq_signal (composite)
SELECT occurrence_count FROM signal_frequencies
WHERE signal_name = ? AND signal_value_hash = ?;

-- Query: Global stats aggregation (scheduled job)
-- No index needed, runs infrequently
SELECT AVG(entropy_total), MEDIAN(entropy_total) FROM fingerprint_analyses;

-- Query: Recent sessions for rate limiting
-- Index: idx_sessions_created
SELECT COUNT(*) FROM sessions
WHERE ip_hash = ? AND created_at > ?;
```
