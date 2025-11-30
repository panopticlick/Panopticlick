/**
 * RTB (Real-Time Bidding) Simulator
 * Simulates how ad exchanges value your fingerprint
 */

import type {
  FingerprintPayload,
  RTBBid,
  RTBSimulationResult,
  Persona,
  BidderType,
  DSPProfile,
  PersonaRule,
} from '@panopticlick/types';

import { generateEntropyReport } from './entropy';

/**
 * DSP (Demand-Side Platform) profiles
 * These represent different types of advertisers
 */
const DSP_PROFILES: DSPProfile[] = [
  {
    id: 'premium_retail',
    name: 'Premium Retail DSP',
    type: 'retail',
    baselineCPM: 4.50,
    targetPersonas: ['affluent_professional', 'tech_enthusiast', 'luxury_seeker'],
    platformMultipliers: {
      desktop: 1.2,
      mobile: 1.0,
      tablet: 0.9,
    },
    regionMultipliers: {
      'America/New_York': 1.3,
      'America/Los_Angeles': 1.2,
      'Europe/London': 1.1,
      default: 0.8,
    },
  },
  {
    id: 'finance_dsp',
    name: 'Financial Services DSP',
    type: 'finance',
    baselineCPM: 8.00,
    targetPersonas: ['affluent_professional', 'investor', 'business_owner'],
    platformMultipliers: {
      desktop: 1.5,
      mobile: 0.8,
      tablet: 1.0,
    },
    regionMultipliers: {
      'America/New_York': 1.5,
      'Europe/London': 1.4,
      'Asia/Tokyo': 1.2,
      default: 0.7,
    },
  },
  {
    id: 'gaming_dsp',
    name: 'Gaming & Entertainment DSP',
    type: 'entertainment',
    baselineCPM: 2.50,
    targetPersonas: ['gamer', 'tech_enthusiast', 'student'],
    platformMultipliers: {
      desktop: 1.4,
      mobile: 1.1,
      tablet: 0.8,
    },
    regionMultipliers: {
      'America/Los_Angeles': 1.2,
      'Asia/Tokyo': 1.3,
      'Europe/Berlin': 1.1,
      default: 0.9,
    },
  },
  {
    id: 'auto_dsp',
    name: 'Automotive DSP',
    type: 'automotive',
    baselineCPM: 6.00,
    targetPersonas: ['affluent_professional', 'car_enthusiast', 'business_owner'],
    platformMultipliers: {
      desktop: 1.3,
      mobile: 0.9,
      tablet: 1.1,
    },
    regionMultipliers: {
      'America/New_York': 1.2,
      'America/Chicago': 1.3,
      'America/Los_Angeles': 1.2,
      default: 0.8,
    },
  },
  {
    id: 'travel_dsp',
    name: 'Travel & Hospitality DSP',
    type: 'travel',
    baselineCPM: 3.50,
    targetPersonas: ['affluent_professional', 'luxury_seeker', 'adventurer'],
    platformMultipliers: {
      desktop: 1.1,
      mobile: 1.2,
      tablet: 1.0,
    },
    regionMultipliers: {
      'America/New_York': 1.2,
      'Europe/London': 1.3,
      'Asia/Tokyo': 1.1,
      default: 0.9,
    },
  },
  {
    id: 'generic_dsp',
    name: 'Programmatic DSP',
    type: 'general',
    baselineCPM: 1.50,
    targetPersonas: ['general'],
    platformMultipliers: {
      desktop: 1.0,
      mobile: 1.0,
      tablet: 1.0,
    },
    regionMultipliers: {
      default: 1.0,
    },
  },
];

/**
 * Persona detection rules
 */
const PERSONA_RULES: PersonaRule[] = [
  {
    id: 'affluent_professional',
    name: 'Affluent Professional',
    description: 'High-income professional with premium device',
    conditions: {
      deviceMemory: { min: 8 },
      cpuCores: { min: 6 },
      screenWidth: { min: 1920 },
      pixelRatio: { min: 2 },
    },
    weight: 1.4,
  },
  {
    id: 'tech_enthusiast',
    name: 'Tech Enthusiast',
    description: 'User with latest browser and hardware',
    conditions: {
      webGL2: true,
      webAssembly: true,
      serviceWorker: true,
      cpuCores: { min: 8 },
    },
    weight: 1.3,
  },
  {
    id: 'gamer',
    name: 'Gamer',
    description: 'High-end GPU and multiple cores',
    conditions: {
      webGL2: true,
      cpuCores: { min: 8 },
      touchPoints: { max: 0 },
      screenWidth: { min: 1920 },
    },
    weight: 1.2,
  },
  {
    id: 'mobile_user',
    name: 'Mobile User',
    description: 'Primary mobile device user',
    conditions: {
      touchPoints: { min: 1 },
      screenWidth: { max: 768 },
    },
    weight: 0.9,
  },
  {
    id: 'privacy_conscious',
    name: 'Privacy Conscious',
    description: 'User with privacy tools enabled',
    conditions: {
      doNotTrack: true,
      globalPrivacyControl: true,
    },
    weight: 0.6, // Lower value due to tracking resistance
  },
  {
    id: 'student',
    name: 'Student/Budget User',
    description: 'Budget hardware indicators',
    conditions: {
      deviceMemory: { max: 4 },
      cpuCores: { max: 4 },
    },
    weight: 0.7,
  },
];

/**
 * Simulate RTB auction for a fingerprint
 */
export function simulateRTBAuction(
  payload: FingerprintPayload
): RTBSimulationResult {
  const entropyReport = generateEntropyReport(payload);
  const personas = detectPersonas(payload);
  const platform = detectPlatform(payload);

  // Generate bids from each DSP
  const bids: RTBBid[] = [];

  for (const dsp of DSP_PROFILES) {
    const bid = generateBid(dsp, payload, personas, platform);
    if (bid.amount > 0) {
      bids.push(bid);
    }
  }

  // Sort bids by amount (highest first)
  bids.sort((a, b) => b.amount - a.amount);

  // The winner is the highest bid
  const winner = bids[0] || null;

  // Calculate total potential value (sum of all bids)
  const totalValue = bids.reduce((sum, bid) => sum + bid.amount, 0);

  // Average CPM across all bidders
  const averageCPM = bids.length > 0 ? totalValue / bids.length : 0;

  return {
    bids,
    winner,
    totalValue: Math.round(totalValue * 100) / 100,
    averageCPM: Math.round(averageCPM * 100) / 100,
    entropyMultiplier: calculateEntropyMultiplier(entropyReport.totalBits),
    personas,
    timestamp: Date.now(),
  };
}

/**
 * Detect user personas from fingerprint
 */
export function detectPersonas(payload: FingerprintPayload): Persona[] {
  const personas: Persona[] = [];
  const { hardware, software, capabilities } = payload;

  for (const rule of PERSONA_RULES) {
    const matched = checkPersonaConditions(rule, payload);

    if (matched) {
      personas.push({
        id: rule.id,
        name: rule.name,
        description: rule.description,
        confidence: calculatePersonaConfidence(rule, payload),
        valueMultiplier: rule.weight,
      });
    }
  }

  // If no specific persona detected, add general
  if (personas.length === 0) {
    personas.push({
      id: 'general',
      name: 'General User',
      description: 'Standard user profile',
      confidence: 0.5,
      valueMultiplier: 1.0,
    });
  }

  // Sort by confidence
  personas.sort((a, b) => b.confidence - a.confidence);

  return personas;
}

/**
 * Check if fingerprint matches persona conditions
 */
function checkPersonaConditions(
  rule: PersonaRule,
  payload: FingerprintPayload
): boolean {
  const { hardware, software, capabilities } = payload;
  const { conditions } = rule;

  // Check device memory
  if (conditions.deviceMemory) {
    const memory = hardware.memory ?? 0;
    if (conditions.deviceMemory.min && memory < conditions.deviceMemory.min) {
      return false;
    }
    if (conditions.deviceMemory.max && memory > conditions.deviceMemory.max) {
      return false;
    }
  }

  // Check CPU cores
  if (conditions.cpuCores) {
    const cores = hardware.cpu;
    if (conditions.cpuCores.min && cores < conditions.cpuCores.min) {
      return false;
    }
    if (conditions.cpuCores.max && cores > conditions.cpuCores.max) {
      return false;
    }
  }

  // Check screen width
  if (conditions.screenWidth) {
    const width = hardware.screen.width;
    if (conditions.screenWidth.min && width < conditions.screenWidth.min) {
      return false;
    }
    if (conditions.screenWidth.max && width > conditions.screenWidth.max) {
      return false;
    }
  }

  // Check pixel ratio
  if (conditions.pixelRatio) {
    const ratio = hardware.screen.pixelRatio;
    if (conditions.pixelRatio.min && ratio < conditions.pixelRatio.min) {
      return false;
    }
  }

  // Check touch points
  if (conditions.touchPoints !== undefined) {
    const touch = hardware.touchPoints;
    if (typeof conditions.touchPoints === 'object') {
      if (conditions.touchPoints.min !== undefined && touch < conditions.touchPoints.min) {
        return false;
      }
      if (conditions.touchPoints.max !== undefined && touch > conditions.touchPoints.max) {
        return false;
      }
    }
  }

  // Check capabilities
  if (conditions.webGL2 !== undefined && capabilities.webGL2 !== conditions.webGL2) {
    return false;
  }
  if (conditions.webAssembly !== undefined && capabilities.webAssembly !== conditions.webAssembly) {
    return false;
  }
  if (conditions.serviceWorker !== undefined && capabilities.serviceWorker !== conditions.serviceWorker) {
    return false;
  }

  // Check privacy settings
  if (conditions.doNotTrack !== undefined) {
    const dnt = software.doNotTrack === '1' || software.doNotTrack === 'yes';
    if (conditions.doNotTrack !== dnt) {
      return false;
    }
  }
  if (conditions.globalPrivacyControl !== undefined) {
    const gpc = software.globalPrivacyControl === true;
    if (conditions.globalPrivacyControl !== gpc) {
      return false;
    }
  }

  return true;
}

/**
 * Calculate confidence score for persona match
 */
function calculatePersonaConfidence(
  rule: PersonaRule,
  payload: FingerprintPayload
): number {
  // Base confidence
  let confidence = 0.7;

  // Adjust based on how many conditions match
  const { conditions } = rule;
  let matched = 0;
  let total = 0;

  if (conditions.deviceMemory) {
    total++;
    if (payload.hardware.memory !== null) matched++;
  }
  if (conditions.cpuCores) {
    total++;
    matched++;
  }
  if (conditions.screenWidth) {
    total++;
    matched++;
  }
  if (conditions.webGL2 !== undefined) {
    total++;
    matched++;
  }

  if (total > 0) {
    confidence = 0.5 + (matched / total) * 0.4;
  }

  return Math.round(confidence * 100) / 100;
}

/**
 * Detect platform type
 */
function detectPlatform(
  payload: FingerprintPayload
): 'desktop' | 'mobile' | 'tablet' {
  const { hardware, software } = payload;

  // Check user agent first
  const ua = software.userAgent.toLowerCase();
  if (ua.includes('mobile') || ua.includes('iphone') || ua.includes('android')) {
    if (ua.includes('tablet') || ua.includes('ipad')) {
      return 'tablet';
    }
    return 'mobile';
  }

  // Check touch points
  if (hardware.touchPoints > 0) {
    // Touch device - check screen size
    if (hardware.screen.width < 768) {
      return 'mobile';
    } else if (hardware.screen.width < 1024) {
      return 'tablet';
    }
  }

  return 'desktop';
}

/**
 * Generate bid from a DSP
 */
function generateBid(
  dsp: DSPProfile,
  payload: FingerprintPayload,
  personas: Persona[],
  platform: 'desktop' | 'mobile' | 'tablet'
): RTBBid {
  let amount = dsp.baselineCPM;

  // Apply platform multiplier
  amount *= dsp.platformMultipliers[platform] || 1.0;

  // Apply region multiplier
  const timezone = payload.software.timezone;
  const regionMultiplier =
    dsp.regionMultipliers[timezone] || dsp.regionMultipliers['default'] || 1.0;
  amount *= regionMultiplier;

  // Apply persona multipliers
  let personaMultiplier = 1.0;
  let matchedPersona = 'general';

  for (const persona of personas) {
    if (dsp.targetPersonas.includes(persona.id)) {
      personaMultiplier = Math.max(personaMultiplier, persona.valueMultiplier);
      matchedPersona = persona.id;
    }
  }
  amount *= personaMultiplier;

  // Apply entropy multiplier (higher entropy = more valuable)
  const entropyMultiplier = calculateEntropyMultiplier(
    generateEntropyReport(payload).totalBits
  );
  amount *= entropyMultiplier;

  // Add some randomness to simulate real auction dynamics
  const variance = 0.9 + Math.random() * 0.2;
  amount *= variance;

  // Determine interest/intent
  const interest = determineInterest(dsp, matchedPersona);

  return {
    bidder: dsp.name,
    amount: Math.round(amount * 100) / 100,
    interest,
    confidence: personaMultiplier > 1 ? 0.8 : 0.5,
    timestamp: Date.now(),
  };
}

/**
 * Calculate multiplier based on entropy
 * Higher entropy = more trackable = more valuable
 */
function calculateEntropyMultiplier(totalBits: number): number {
  // Entropy below 20 bits = not very unique
  // Entropy above 40 bits = very unique and trackable
  if (totalBits < 15) {
    return 0.6;
  } else if (totalBits < 25) {
    return 0.8;
  } else if (totalBits < 35) {
    return 1.0;
  } else if (totalBits < 45) {
    return 1.2;
  } else {
    return 1.4;
  }
}

/**
 * Determine what the bidder is interested in
 */
function determineInterest(dsp: DSPProfile, persona: string): string {
  const interests: Record<string, Record<string, string>> = {
    retail: {
      affluent_professional: 'Premium products & services',
      tech_enthusiast: 'Latest tech gadgets',
      luxury_seeker: 'Designer brands',
      general: 'General retail',
    },
    finance: {
      affluent_professional: 'Investment opportunities',
      investor: 'Trading platforms',
      business_owner: 'Business financing',
      general: 'Banking services',
    },
    entertainment: {
      gamer: 'New game releases',
      tech_enthusiast: 'Streaming services',
      student: 'Free trials',
      general: 'Entertainment content',
    },
    automotive: {
      affluent_professional: 'Luxury vehicles',
      car_enthusiast: 'Performance parts',
      business_owner: 'Fleet vehicles',
      general: 'Auto services',
    },
    travel: {
      affluent_professional: 'Business travel',
      luxury_seeker: 'Premium destinations',
      adventurer: 'Adventure travel',
      general: 'Travel deals',
    },
    general: {
      general: 'Relevant ads',
    },
  };

  return (
    interests[dsp.type]?.[persona] ||
    interests[dsp.type]?.['general'] ||
    'Targeted advertising'
  );
}

/**
 * Format CPM as readable string
 */
export function formatCPM(cpm: number): string {
  return `$${cpm.toFixed(2)} CPM`;
}

/**
 * Explain what the CPM means in practical terms
 */
export function explainCPM(cpm: number): string {
  if (cpm < 1) {
    return 'Your profile is considered low-value for advertisers.';
  } else if (cpm < 3) {
    return 'Your profile has moderate value in the ad marketplace.';
  } else if (cpm < 6) {
    return 'Your profile is considered valuable by advertisers.';
  } else if (cpm < 10) {
    return 'Your profile is highly sought after by premium advertisers.';
  } else {
    return 'Your profile is extremely valuable in the ad marketplace.';
  }
}

/**
 * Calculate annual value of a user
 */
export function calculateAnnualValue(cpm: number): {
  pageViews: number;
  annualValue: number;
  explanation: string;
} {
  // Assume average user sees 3000-5000 page views per year
  const pageViews = 4000;

  // CPM is cost per 1000 impressions
  const annualValue = (cpm * pageViews) / 1000;

  const explanation =
    `Based on ${pageViews.toLocaleString()} estimated annual page views ` +
    `at ${formatCPM(cpm)}, your browsing is worth approximately ` +
    `$${annualValue.toFixed(2)} per year to advertisers.`;

  return {
    pageViews,
    annualValue: Math.round(annualValue * 100) / 100,
    explanation,
  };
}
