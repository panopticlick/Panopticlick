/**
 * Valuation Types
 * RTB simulation, entropy calculation, and market valuation
 */

// ============================================
// ENTROPY TYPES
// ============================================

export type EntropyRarity = 'common' | 'uncommon' | 'rare' | 'very_rare';
export type EntropyTier = 'low' | 'medium' | 'high' | 'very_high' | 'unique';

export interface EntropyComponent {
  bits: number;
  rarity: EntropyRarity;
}

export interface EntropyBreakdown {
  canvas: EntropyComponent;
  webgl: EntropyComponent;
  audio: EntropyComponent;
  screen: EntropyComponent;
  fonts: EntropyComponent;
  timezone: EntropyComponent;
  language: EntropyComponent;
  platform: EntropyComponent;
  plugins: EntropyComponent;
  userAgent: EntropyComponent;
  cpu: EntropyComponent;
  memory: EntropyComponent;
  touchPoints: EntropyComponent;
  capabilities: EntropyComponent;
  total: EntropyComponent;
}

export interface EntropyReport {
  totalBits: number;
  uniqueness: number;
  population: number;
  tier: EntropyTier;
  breakdown: EntropyBreakdown;
}

// ============================================
// RTB TYPES
// ============================================

export type BidderType = 'retail' | 'finance' | 'entertainment' | 'automotive' | 'travel' | 'general';

export interface RTBBid {
  bidder: string;
  amount: number;
  interest: string;
  confidence: number;
  timestamp: number;
}

export interface Persona {
  id: string;
  name: string;
  description: string;
  confidence: number;
  valueMultiplier: number;
}

export interface RTBSimulationResult {
  bids: RTBBid[];
  winner: RTBBid | null;
  totalValue: number;
  averageCPM: number;
  entropyMultiplier: number;
  personas: Persona[];
  timestamp: number;
}

// ============================================
// DSP PROFILE (for simulation)
// ============================================

export interface DSPProfile {
  id: string;
  name: string;
  type: BidderType;
  baselineCPM: number;
  targetPersonas: string[];
  platformMultipliers: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
  regionMultipliers: Record<string, number>;
}

// ============================================
// PERSONA RULE (for inference)
// ============================================

export interface PersonaRule {
  id: string;
  name: string;
  description: string;
  conditions: {
    deviceMemory?: { min?: number; max?: number };
    cpuCores?: { min?: number; max?: number };
    screenWidth?: { min?: number; max?: number };
    pixelRatio?: { min?: number };
    touchPoints?: { min?: number; max?: number } | number;
    webGL2?: boolean;
    webAssembly?: boolean;
    serviceWorker?: boolean;
    doNotTrack?: boolean;
    globalPrivacyControl?: boolean;
  };
  weight: number;
}

// ============================================
// MARKET VALUATION
// ============================================

export type TrackabilityTier = 'hidden' | 'low' | 'medium' | 'high' | 'beacon';

export interface MarketValuation {
  winningBid: number;
  averageCPM: number;
  formattedCPM: string;
  explanation: string;
  annualValue: number;
  annualExplanation: string;
  trackability: TrackabilityTier;
  personas: Persona[];
  bidders: RTBBid[];
}

// ============================================
// DEFENSE STATUS TYPES
// ============================================

export type DefenseTier = 'exposed' | 'basic' | 'protected' | 'hardened' | 'fortress';
export type TrackerCategory = 'analytics' | 'advertising' | 'social' | 'fingerprinting' | 'other';

export interface TrackerTestResult {
  name: string;
  url: string;
  blocked: boolean;
  category: TrackerCategory;
}

export interface AdBlockerStatus {
  detected: boolean;
  strength: 'none' | 'basic' | 'standard' | 'aggressive';
  blockedCategories: string[];
}

export interface PrivacyHeaderStatus {
  doNotTrack: boolean;
  globalPrivacyControl: boolean;
  referrerPolicy: string;
  effectiveness: 'low' | 'medium' | 'high';
}

export interface FingerprintProtectionStatus {
  canvasProtected: boolean;
  webglProtected: boolean;
  audioProtected: boolean;
  fontsProtected: boolean;
  level: 'none' | 'basic' | 'enhanced' | 'maximum';
  detectedTool?: string;
}

export interface NetworkPrivacyStatus {
  vpnDetected: boolean;
  torDetected: boolean;
  dnsLeakProtected: boolean;
  webrtcLeakProtected: boolean;
}

export interface DefenseStatus {
  adBlocker: AdBlockerStatus;
  privacyHeaders: PrivacyHeaderStatus;
  fingerprintProtection: FingerprintProtectionStatus;
  networkPrivacy: NetworkPrivacyStatus;
  overallTier: DefenseTier;
  score: number;
  recommendations: string[];
}

// ============================================
// BROWSER TYPE
// ============================================

export type BrowserType = 'chrome' | 'firefox' | 'safari' | 'edge' | 'brave' | 'tor' | 'other';

// ============================================
// HARDENING GUIDE
// ============================================

export interface HardeningStep {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  impact: 'low' | 'medium' | 'high';
  instructions: string[];
}

export interface HardeningGuide {
  browserType: BrowserType;
  currentLevel: number;
  steps: HardeningStep[];
  estimatedImpact: {
    currentScore: number;
    potentialScore: number;
    improvement: number;
  };
}

// ============================================
// POPULATION COMPARISON
// ============================================

export interface PopulationComparison {
  browser: {
    name: string;
    marketShare: number;
    percentile: number;
  };
  operatingSystem: {
    name: string;
    marketShare: number;
    percentile: number;
  };
  screenResolution: {
    resolution: string;
    marketShare: number;
    percentile: number;
  };
  deviceType: {
    type: string;
    marketShare: number;
    percentile: number;
  };
  privacyPosture: {
    tools: string[];
    percentile: number;
    betterThan: number;
  };
  overallUniqueness: {
    percentile: number;
    description: string;
  };
  similarDevices: {
    estimate: number;
    formatted: string;
    oneIn: number;
  };
}

// ============================================
// COMPLETE VALUATION REPORT
// ============================================

export interface ReportMeta {
  reportId: string;
  generatedAt: number;
  processingTime: number;
  sdkVersion: string;
}

export interface ValuationReport {
  meta: ReportMeta;
  entropy: EntropyReport;
  valuation: MarketValuation;
  defenses: DefenseStatus;
  comparison: PopulationComparison;
}
