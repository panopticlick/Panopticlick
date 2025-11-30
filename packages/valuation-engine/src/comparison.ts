/**
 * Population Comparison
 * Compare user's fingerprint against population statistics
 */

import type {
  FingerprintPayload,
  PopulationComparison,
  EntropyReport,
} from '@panopticlick/types';

import { generateEntropyReport } from './entropy';

/**
 * Population distribution data
 * Based on research and industry statistics
 */
const POPULATION_DATA = {
  // Browser market share (approximate 2024)
  browsers: {
    Chrome: 0.65,
    Safari: 0.18,
    Firefox: 0.03,
    Edge: 0.05,
    Opera: 0.02,
    Other: 0.07,
  },

  // OS market share
  operatingSystems: {
    Windows: 0.72,
    macOS: 0.15,
    iOS: 0.06,
    Android: 0.04,
    Linux: 0.02,
    Other: 0.01,
  },

  // Screen resolution market share
  screenResolutions: {
    '1920x1080': 0.23,
    '1366x768': 0.19,
    '1536x864': 0.08,
    '2560x1440': 0.04,
    '3840x2160': 0.02,
    Other: 0.44,
  },

  // Device type
  deviceTypes: {
    Desktop: 0.58,
    Mobile: 0.38,
    Tablet: 0.04,
  },

  // Privacy tool adoption
  privacyTools: {
    adBlocker: 0.42,
    vpn: 0.31,
    tor: 0.01,
    doNotTrack: 0.20,
    gpc: 0.05,
    fingerprintBlocker: 0.08,
  },

  // Entropy distribution (approximate)
  entropyDistribution: {
    // Percentage of population at each entropy range
    '<20': 0.05, // Very low entropy (privacy tools)
    '20-30': 0.25, // Low-medium entropy
    '30-40': 0.40, // Average entropy
    '40-50': 0.20, // High entropy
    '>50': 0.10, // Very high entropy
  },
};

/**
 * Generate population comparison
 */
export function generatePopulationComparison(
  payload: FingerprintPayload
): PopulationComparison {
  const entropyReport = generateEntropyReport(payload);

  return {
    browser: compareBrowser(payload),
    operatingSystem: compareOS(payload),
    screenResolution: compareScreen(payload),
    deviceType: compareDeviceType(payload),
    privacyPosture: comparePrivacy(payload),
    overallUniqueness: calculateOverallUniqueness(entropyReport),
    similarDevices: estimateSimilarDevices(entropyReport.totalBits),
  };
}

/**
 * Compare browser against population
 */
function compareBrowser(
  payload: FingerprintPayload
): { name: string; marketShare: number; percentile: number } {
  const ua = payload.software.userAgent.toLowerCase();

  let name = 'Other';
  if (ua.includes('firefox')) name = 'Firefox';
  else if (ua.includes('safari') && !ua.includes('chrome')) name = 'Safari';
  else if (ua.includes('edg/')) name = 'Edge';
  else if (ua.includes('chrome')) name = 'Chrome';
  else if (ua.includes('opera') || ua.includes('opr/')) name = 'Opera';

  const marketShare =
    POPULATION_DATA.browsers[name as keyof typeof POPULATION_DATA.browsers] ||
    POPULATION_DATA.browsers.Other;

  // Calculate percentile (how common is this browser)
  const percentile = Math.round((1 - marketShare) * 100);

  return { name, marketShare, percentile };
}

/**
 * Compare OS against population
 */
function compareOS(
  payload: FingerprintPayload
): { name: string; marketShare: number; percentile: number } {
  const ua = payload.software.userAgent.toLowerCase();
  const platform = payload.software.platform.toLowerCase();

  let name = 'Other';
  if (ua.includes('windows') || platform.includes('win')) name = 'Windows';
  else if (ua.includes('mac') || platform.includes('mac')) name = 'macOS';
  else if (ua.includes('iphone') || ua.includes('ipad')) name = 'iOS';
  else if (ua.includes('android')) name = 'Android';
  else if (ua.includes('linux')) name = 'Linux';

  const marketShare =
    POPULATION_DATA.operatingSystems[
      name as keyof typeof POPULATION_DATA.operatingSystems
    ] || POPULATION_DATA.operatingSystems.Other;

  const percentile = Math.round((1 - marketShare) * 100);

  return { name, marketShare, percentile };
}

/**
 * Compare screen resolution against population
 */
function compareScreen(
  payload: FingerprintPayload
): { resolution: string; marketShare: number; percentile: number } {
  const { width, height } = payload.hardware.screen;
  const resolution = `${width}x${height}`;

  const marketShare =
    POPULATION_DATA.screenResolutions[
      resolution as keyof typeof POPULATION_DATA.screenResolutions
    ] || POPULATION_DATA.screenResolutions.Other;

  const percentile = Math.round((1 - marketShare) * 100);

  return { resolution, marketShare, percentile };
}

/**
 * Compare device type against population
 */
function compareDeviceType(
  payload: FingerprintPayload
): { type: string; marketShare: number; percentile: number } {
  const ua = payload.software.userAgent.toLowerCase();
  const touchPoints = payload.hardware.touchPoints;
  const width = payload.hardware.screen.width;

  let type = 'Desktop';
  if (ua.includes('tablet') || ua.includes('ipad')) {
    type = 'Tablet';
  } else if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
    type = 'Mobile';
  } else if (touchPoints > 0 && width < 1024) {
    type = 'Mobile';
  }

  const marketShare =
    POPULATION_DATA.deviceTypes[type as keyof typeof POPULATION_DATA.deviceTypes];

  const percentile = Math.round((1 - marketShare) * 100);

  return { type, marketShare, percentile };
}

/**
 * Compare privacy posture against population
 */
function comparePrivacy(payload: FingerprintPayload): {
  tools: string[];
  percentile: number;
  betterThan: number;
} {
  const tools: string[] = [];

  // Check various privacy indicators
  const dnt = payload.software.doNotTrack === '1';
  const gpc = payload.software.globalPrivacyControl === true;
  const canvasBlocked = payload.hardware.canvas?.blocked || payload.hardware.canvas?.spoofed;
  const webglBlocked = payload.hardware.webgl?.blocked;
  const audioBlocked = payload.hardware.audio?.blocked;

  if (dnt) tools.push('Do Not Track');
  if (gpc) tools.push('Global Privacy Control');
  if (canvasBlocked) tools.push('Canvas Protection');
  if (webglBlocked) tools.push('WebGL Protection');
  if (audioBlocked) tools.push('Audio Protection');

  // Calculate how this compares to population
  let privacyScore = 0;

  // More tools = more private = less common
  if (dnt) privacyScore += POPULATION_DATA.privacyTools.doNotTrack;
  if (gpc) privacyScore += POPULATION_DATA.privacyTools.gpc;
  if (canvasBlocked || webglBlocked || audioBlocked) {
    privacyScore += POPULATION_DATA.privacyTools.fingerprintBlocker;
  }

  // Percentage of population with similar or better privacy
  const similarPrivacy = Math.max(0.01, privacyScore / 3);
  const percentile = Math.round((1 - similarPrivacy) * 100);

  // What percentage are you more private than?
  const betterThan = 100 - Math.round(similarPrivacy * 100);

  return { tools, percentile, betterThan };
}

/**
 * Calculate overall uniqueness
 */
function calculateOverallUniqueness(
  entropyReport: EntropyReport
): { percentile: number; description: string } {
  const bits = entropyReport.totalBits;

  let percentile: number;
  let description: string;

  if (bits < 20) {
    percentile = 95; // 95th percentile for privacy (only 5% have lower entropy)
    description = 'Highly private - your fingerprint is well-protected';
  } else if (bits < 30) {
    percentile = 70; // 70th percentile
    description = 'Moderately unique - some privacy measures detected';
  } else if (bits < 40) {
    percentile = 50; // Average
    description = 'Average uniqueness - typical for most users';
  } else if (bits < 50) {
    percentile = 25; // 25th percentile for privacy (more unique = less private)
    description = 'Highly unique - easily trackable across sites';
  } else {
    percentile = 5; // 5th percentile
    description = 'Extremely unique - your browser is essentially a beacon';
  }

  return { percentile, description };
}

/**
 * Estimate number of similar devices worldwide
 */
function estimateSimilarDevices(entropyBits: number): {
  estimate: number;
  formatted: string;
  oneIn: number;
} {
  // Assume ~5 billion internet users
  const totalUsers = 5_000_000_000;

  // Number of unique fingerprints possible with this entropy
  const uniqueFingerprints = Math.pow(2, entropyBits);

  // Estimated users per fingerprint bucket
  const estimate = Math.max(1, Math.round(totalUsers / uniqueFingerprints));

  // Format the number
  let formatted: string;
  if (estimate >= 1_000_000) {
    formatted = `~${(estimate / 1_000_000).toFixed(1)} million`;
  } else if (estimate >= 1000) {
    formatted = `~${(estimate / 1000).toFixed(1)} thousand`;
  } else {
    formatted = `~${estimate}`;
  }

  // One in X users have similar fingerprint
  const oneIn = Math.round(totalUsers / estimate);

  return { estimate, formatted, oneIn };
}

/**
 * Generate human-readable comparison summary
 */
export function generateComparisonSummary(
  comparison: PopulationComparison
): string[] {
  const summaries: string[] = [];

  // Browser comparison
  const browserShare = (comparison.browser.marketShare * 100).toFixed(1);
  summaries.push(
    `You're using ${comparison.browser.name}, used by ${browserShare}% of internet users`
  );

  // OS comparison
  const osShare = (comparison.operatingSystem.marketShare * 100).toFixed(1);
  summaries.push(
    `Your ${comparison.operatingSystem.name} system is used by ${osShare}% of users`
  );

  // Screen comparison
  if (comparison.screenResolution.marketShare > 0.1) {
    summaries.push(
      `Your screen resolution (${comparison.screenResolution.resolution}) is very common`
    );
  } else {
    summaries.push(
      `Your screen resolution (${comparison.screenResolution.resolution}) is relatively uncommon`
    );
  }

  // Privacy comparison
  if (comparison.privacyPosture.tools.length > 0) {
    summaries.push(
      `Your privacy tools (${comparison.privacyPosture.tools.join(', ')}) ` +
        `put you ahead of ${comparison.privacyPosture.betterThan}% of users`
    );
  } else {
    summaries.push(
      'You have no detectable privacy tools - consider adding some protection'
    );
  }

  // Similar devices
  summaries.push(
    `About ${comparison.similarDevices.formatted} users worldwide have a similar fingerprint`
  );

  return summaries;
}

/**
 * Calculate tracking difficulty score
 */
export function calculateTrackingDifficulty(
  payload: FingerprintPayload
): {
  score: number; // 0-100 (100 = hardest to track)
  difficulty: 'trivial' | 'easy' | 'moderate' | 'difficult' | 'very_difficult';
  explanation: string;
} {
  const entropyReport = generateEntropyReport(payload);
  const comparison = generatePopulationComparison(payload);

  // Lower entropy = harder to track
  let score = 0;

  // Entropy-based score (inverted - lower is better)
  if (entropyReport.totalBits < 20) score += 60;
  else if (entropyReport.totalBits < 30) score += 40;
  else if (entropyReport.totalBits < 40) score += 20;
  else score += 5;

  // Privacy tools boost
  score += comparison.privacyPosture.tools.length * 8;

  // Common browser/OS reduces trackability
  if (comparison.browser.marketShare > 0.5) score += 10;
  if (comparison.operatingSystem.marketShare > 0.5) score += 5;
  if (comparison.screenResolution.marketShare > 0.15) score += 5;

  score = Math.min(100, score);

  let difficulty: 'trivial' | 'easy' | 'moderate' | 'difficult' | 'very_difficult';
  let explanation: string;

  if (score >= 80) {
    difficulty = 'very_difficult';
    explanation =
      'Your configuration makes you hard to distinguish from many other users';
  } else if (score >= 60) {
    difficulty = 'difficult';
    explanation =
      'You have good privacy protections, but some unique characteristics remain';
  } else if (score >= 40) {
    difficulty = 'moderate';
    explanation =
      'Trackers can identify you with moderate confidence across sessions';
  } else if (score >= 20) {
    difficulty = 'easy';
    explanation =
      'Your browser has enough unique features to easily identify you';
  } else {
    difficulty = 'trivial';
    explanation =
      'Your browser configuration is so unique that tracking you is trivial';
  }

  return { score, difficulty, explanation };
}
