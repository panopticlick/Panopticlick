/**
 * Entropy Calculator
 * Calculates information entropy of fingerprint components
 */

import type {
  FingerprintPayload,
  EntropyBreakdown,
  EntropyReport,
  EntropyRarity,
  EntropyTier,
} from '@panopticlick/types';

/**
 * Population statistics for entropy calculation
 * These represent approximate distributions from research
 */
const POPULATION_STATS = {
  // Screen resolution distribution
  screenResolutions: {
    '1920x1080': 0.23,
    '1366x768': 0.19,
    '1536x864': 0.08,
    '1440x900': 0.05,
    '1280x720': 0.04,
    '2560x1440': 0.04,
    '1600x900': 0.03,
    '1280x800': 0.03,
    '3840x2160': 0.02,
    'other': 0.29,
  },

  // Device pixel ratio distribution
  pixelRatios: {
    '1': 0.45,
    '1.25': 0.10,
    '1.5': 0.08,
    '2': 0.30,
    '2.5': 0.02,
    '3': 0.03,
    'other': 0.02,
  },

  // Platform distribution
  platforms: {
    'Win32': 0.70,
    'MacIntel': 0.15,
    'Linux x86_64': 0.03,
    'iPhone': 0.05,
    'iPad': 0.02,
    'Android': 0.04,
    'other': 0.01,
  },

  // Timezone distribution (top timezones)
  timezones: {
    'America/New_York': 0.12,
    'America/Chicago': 0.08,
    'America/Los_Angeles': 0.10,
    'Europe/London': 0.05,
    'Europe/Paris': 0.03,
    'Europe/Berlin': 0.03,
    'Asia/Tokyo': 0.04,
    'Asia/Shanghai': 0.06,
    'other': 0.49,
  },

  // CPU core distribution
  cpuCores: {
    '1': 0.01,
    '2': 0.15,
    '4': 0.35,
    '6': 0.15,
    '8': 0.20,
    '12': 0.05,
    '16': 0.05,
    'other': 0.04,
  },

  // Device memory distribution
  deviceMemory: {
    '2': 0.05,
    '4': 0.25,
    '8': 0.45,
    '16': 0.15,
    '32': 0.05,
    'other': 0.05,
  },

  // Language distribution
  languages: {
    'en-US': 0.35,
    'en-GB': 0.05,
    'zh-CN': 0.10,
    'es': 0.05,
    'de': 0.03,
    'fr': 0.03,
    'ja': 0.03,
    'other': 0.36,
  },
};

/**
 * Calculate information entropy in bits
 * E = -sum(p * log2(p)) for each value
 */
export function calculateEntropy(probability: number): number {
  if (probability <= 0 || probability >= 1) {
    return 0;
  }
  return -Math.log2(probability);
}

/**
 * Calculate complete entropy breakdown for a fingerprint
 */
export function calculateEntropyBreakdown(
  payload: FingerprintPayload
): EntropyBreakdown {
  const { hardware, software, capabilities } = payload;

  // Calculate individual entropies
  const canvas = calculateCanvasEntropy(hardware.canvas);
  const webgl = calculateWebGLEntropy(hardware.webgl);
  const audio = calculateAudioEntropy(hardware.audio);
  const screen = calculateScreenEntropy(hardware.screen);
  const fonts = calculateFontsEntropy(software.fonts);
  const timezone = calculateTimezoneEntropy(software.timezone);
  const language = calculateLanguageEntropy(software.language, software.languages);
  const platform = calculatePlatformEntropy(software.platform);
  const plugins = calculatePluginsEntropy(software.plugins);
  const userAgent = calculateUserAgentEntropy(software.userAgent);
  const cpu = calculateCPUEntropy(hardware.cpu);
  const memory = calculateMemoryEntropy(hardware.memory);
  const touchPoints = calculateTouchPointsEntropy(hardware.touchPoints);
  const capabilitiesEntropy = calculateCapabilitiesEntropy(capabilities);

  // Calculate total
  const total =
    canvas.bits +
    webgl.bits +
    audio.bits +
    screen.bits +
    fonts.bits +
    timezone.bits +
    language.bits +
    platform.bits +
    plugins.bits +
    userAgent.bits +
    cpu.bits +
    memory.bits +
    touchPoints.bits +
    capabilitiesEntropy.bits;

  return {
    canvas,
    webgl,
    audio,
    screen,
    fonts,
    timezone,
    language,
    platform,
    plugins,
    userAgent,
    cpu,
    memory,
    touchPoints,
    capabilities: capabilitiesEntropy,
    total: {
      bits: Math.round(total * 10) / 10,
      rarity: calculateRarity(total),
    },
  };
}

/**
 * Generate entropy report with tier and uniqueness
 */
export function generateEntropyReport(
  payload: FingerprintPayload
): EntropyReport {
  const breakdown = calculateEntropyBreakdown(payload);
  const tier = calculateEntropyTier(breakdown.total.bits);
  const uniqueness = calculateUniqueness(breakdown.total.bits);
  const population = estimatePopulationSize(breakdown.total.bits);

  return {
    totalBits: breakdown.total.bits,
    uniqueness,
    population,
    tier,
    breakdown,
  };
}

// ============================================
// INDIVIDUAL ENTROPY CALCULATIONS
// ============================================

function calculateCanvasEntropy(canvas: FingerprintPayload['hardware']['canvas']): {
  bits: number;
  rarity: EntropyRarity;
} {
  if (!canvas || canvas.blocked || canvas.spoofed) {
    return { bits: 0, rarity: 'common' };
  }

  // Canvas fingerprint has high entropy due to rendering differences
  // Research shows approximately 10-18 bits
  const bits = 15;
  return { bits, rarity: calculateRarity(bits) };
}

function calculateWebGLEntropy(webgl: FingerprintPayload['hardware']['webgl']): {
  bits: number;
  rarity: EntropyRarity;
} {
  if (!webgl || webgl.blocked) {
    return { bits: 0, rarity: 'common' };
  }

  // GPU vendor/renderer combination
  let bits = 8;

  // Extensions add entropy
  bits += Math.min(webgl.extensions.length * 0.2, 4);

  // Max texture size variations
  if (webgl.maxTextureSize >= 16384) {
    bits += 2;
  } else if (webgl.maxTextureSize >= 8192) {
    bits += 1;
  }

  return { bits: Math.round(bits * 10) / 10, rarity: calculateRarity(bits) };
}

function calculateAudioEntropy(audio: FingerprintPayload['hardware']['audio']): {
  bits: number;
  rarity: EntropyRarity;
} {
  if (!audio || audio.blocked) {
    return { bits: 0, rarity: 'common' };
  }

  // Audio context fingerprinting provides moderate entropy
  const bits = 10;
  return { bits, rarity: calculateRarity(bits) };
}

function calculateScreenEntropy(screen: FingerprintPayload['hardware']['screen']): {
  bits: number;
  rarity: EntropyRarity;
} {
  const resolution = `${screen.width}x${screen.height}`;
  const ratio = String(screen.pixelRatio);

  // Get probability from distribution
  const resProbability =
    POPULATION_STATS.screenResolutions[resolution as keyof typeof POPULATION_STATS.screenResolutions] ||
    POPULATION_STATS.screenResolutions['other'];

  const ratioProbability =
    POPULATION_STATS.pixelRatios[ratio as keyof typeof POPULATION_STATS.pixelRatios] ||
    POPULATION_STATS.pixelRatios['other'];

  const bits =
    calculateEntropy(resProbability) + calculateEntropy(ratioProbability);

  return { bits: Math.round(bits * 10) / 10, rarity: calculateRarity(bits) };
}

function calculateFontsEntropy(fonts: FingerprintPayload['software']['fonts']): {
  bits: number;
  rarity: EntropyRarity;
} {
  if (!fonts || fonts.count === 0) {
    return { bits: 0, rarity: 'common' };
  }

  // Font fingerprinting can provide 8-15 bits
  // Based on research, each unique font adds ~0.5 bits
  const bits = Math.min(fonts.count * 0.5, 15);

  return { bits: Math.round(bits * 10) / 10, rarity: calculateRarity(bits) };
}

function calculateTimezoneEntropy(timezone: string): {
  bits: number;
  rarity: EntropyRarity;
} {
  const probability =
    POPULATION_STATS.timezones[timezone as keyof typeof POPULATION_STATS.timezones] ||
    POPULATION_STATS.timezones['other'];

  const bits = calculateEntropy(probability);
  return { bits: Math.round(bits * 10) / 10, rarity: calculateRarity(bits) };
}

function calculateLanguageEntropy(language: string, languages: string[]): {
  bits: number;
  rarity: EntropyRarity;
} {
  // Primary language
  const primaryProbability =
    POPULATION_STATS.languages[language as keyof typeof POPULATION_STATS.languages] ||
    POPULATION_STATS.languages['other'];

  let bits = calculateEntropy(primaryProbability);

  // Additional languages add small entropy
  if (languages.length > 1) {
    bits += Math.min((languages.length - 1) * 0.5, 2);
  }

  return { bits: Math.round(bits * 10) / 10, rarity: calculateRarity(bits) };
}

function calculatePlatformEntropy(platform: string): {
  bits: number;
  rarity: EntropyRarity;
} {
  const probability =
    POPULATION_STATS.platforms[platform as keyof typeof POPULATION_STATS.platforms] ||
    POPULATION_STATS.platforms['other'];

  const bits = calculateEntropy(probability);
  return { bits: Math.round(bits * 10) / 10, rarity: calculateRarity(bits) };
}

function calculatePluginsEntropy(plugins: FingerprintPayload['software']['plugins']): {
  bits: number;
  rarity: EntropyRarity;
} {
  // Modern browsers have few plugins
  // Each plugin adds some entropy
  const bits = Math.min(plugins.length * 1.5, 8);
  return { bits: Math.round(bits * 10) / 10, rarity: calculateRarity(bits) };
}

function calculateUserAgentEntropy(userAgent: string): {
  bits: number;
  rarity: EntropyRarity;
} {
  // User agent has moderate entropy
  // Browser + version + OS + version
  // Approximately 8-12 bits depending on specificity
  const bits = 10;
  return { bits, rarity: calculateRarity(bits) };
}

function calculateCPUEntropy(cores: number): {
  bits: number;
  rarity: EntropyRarity;
} {
  const key = String(cores);
  const probability =
    POPULATION_STATS.cpuCores[key as keyof typeof POPULATION_STATS.cpuCores] ||
    POPULATION_STATS.cpuCores['other'];

  const bits = calculateEntropy(probability);
  return { bits: Math.round(bits * 10) / 10, rarity: calculateRarity(bits) };
}

function calculateMemoryEntropy(memory: number | null): {
  bits: number;
  rarity: EntropyRarity;
} {
  if (memory === null) {
    return { bits: 0, rarity: 'common' };
  }

  const key = String(memory);
  const probability =
    POPULATION_STATS.deviceMemory[key as keyof typeof POPULATION_STATS.deviceMemory] ||
    POPULATION_STATS.deviceMemory['other'];

  const bits = calculateEntropy(probability);
  return { bits: Math.round(bits * 10) / 10, rarity: calculateRarity(bits) };
}

function calculateTouchPointsEntropy(touchPoints: number): {
  bits: number;
  rarity: EntropyRarity;
} {
  // Touch points: 0 (desktop), 1-10 (mobile/tablet)
  if (touchPoints === 0) {
    // Common for desktops
    return { bits: 1, rarity: 'common' };
  } else if (touchPoints <= 5) {
    // Common for touch devices
    return { bits: 2, rarity: 'common' };
  } else {
    // Less common high touch point count
    return { bits: 3, rarity: 'uncommon' };
  }
}

function calculateCapabilitiesEntropy(
  capabilities: FingerprintPayload['capabilities']
): { bits: number; rarity: EntropyRarity } {
  // Count enabled capabilities
  const enabled = Object.values(capabilities).filter(Boolean).length;
  const total = Object.keys(capabilities).length;

  // The specific combination of capabilities has entropy
  // Approximately 0.3 bits per capability
  const bits = enabled * 0.3;

  return { bits: Math.round(bits * 10) / 10, rarity: calculateRarity(bits) };
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Calculate rarity tier based on entropy bits
 */
function calculateRarity(bits: number): EntropyRarity {
  if (bits >= 10) return 'very_rare';
  if (bits >= 6) return 'rare';
  if (bits >= 3) return 'uncommon';
  return 'common';
}

/**
 * Calculate entropy tier based on total bits
 */
function calculateEntropyTier(totalBits: number): EntropyTier {
  if (totalBits >= 50) return 'unique';
  if (totalBits >= 35) return 'very_high';
  if (totalBits >= 25) return 'high';
  if (totalBits >= 15) return 'medium';
  return 'low';
}

// Maximum entropy bits to prevent Math.pow overflow (2^64 is safe)
const MAX_ENTROPY_BITS = 64;
const GLOBAL_INTERNET_USERS = 5_000_000_000;

/**
 * Calculate uniqueness percentage
 * 100% means completely unique in the population
 */
function calculateUniqueness(totalBits: number): number {
  // Cap entropy to prevent overflow
  const safeBits = Math.min(totalBits, MAX_ENTROPY_BITS);

  // 2^bits gives the theoretical population size for uniqueness
  // Cap at practical population sizes
  const theoreticalUniquePopulation = Math.pow(2, safeBits);

  // Uniqueness as percentage
  const uniqueness = Math.min(
    (theoreticalUniquePopulation / GLOBAL_INTERNET_USERS) * 100,
    100
  );

  // Round to reasonable precision
  if (uniqueness < 0.0001) {
    return Math.round(uniqueness * 10000000) / 10000000;
  } else if (uniqueness < 0.01) {
    return Math.round(uniqueness * 100000) / 100000;
  } else if (uniqueness < 1) {
    return Math.round(uniqueness * 1000) / 1000;
  }

  return Math.round(uniqueness * 100) / 100;
}

/**
 * Estimate how many people share similar fingerprint
 */
function estimatePopulationSize(totalBits: number): number {
  // Cap entropy to prevent overflow
  const safeBits = Math.min(totalBits, MAX_ENTROPY_BITS);
  const bucketSize = Math.pow(2, safeBits);

  // Estimated number of people with similar fingerprint
  const estimate = Math.max(1, Math.round(GLOBAL_INTERNET_USERS / bucketSize));

  return estimate;
}

/**
 * Compare fingerprint entropy to average
 */
export function compareToAverage(totalBits: number): {
  percentile: number;
  comparison: 'below_average' | 'average' | 'above_average' | 'exceptional';
} {
  // Average fingerprint has approximately 25-30 bits
  const averageBits = 27;
  const stdDev = 8;

  // Calculate z-score
  const zScore = (totalBits - averageBits) / stdDev;

  // Convert to percentile (approximate)
  const percentile = Math.round(
    (1 / (1 + Math.exp(-1.702 * zScore))) * 100
  );

  let comparison: 'below_average' | 'average' | 'above_average' | 'exceptional';
  if (zScore < -1) {
    comparison = 'below_average';
  } else if (zScore < 1) {
    comparison = 'average';
  } else if (zScore < 2) {
    comparison = 'above_average';
  } else {
    comparison = 'exceptional';
  }

  return { percentile, comparison };
}
