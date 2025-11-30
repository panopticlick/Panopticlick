/**
 * Defense Status Analyzer
 * Evaluates privacy defenses and protection levels
 */

import type {
  FingerprintPayload,
  DefenseStatus,
  DefenseTier,
  AdBlockerStatus,
  PrivacyHeaderStatus,
  FingerprintProtectionStatus,
  NetworkPrivacyStatus,
  HardeningStep,
  HardeningGuide,
  BrowserType,
} from '@panopticlick/types';

/**
 * Analyze all defense status
 */
export function analyzeDefenses(
  payload: FingerprintPayload,
  additionalInfo?: {
    adBlockerDetected?: boolean;
    trackerBlocked?: boolean;
    vpnDetected?: boolean;
    torDetected?: boolean;
  }
): DefenseStatus {
  return {
    adBlocker: analyzeAdBlocker(additionalInfo?.adBlockerDetected),
    privacyHeaders: analyzePrivacyHeaders(payload),
    fingerprintProtection: analyzeFingerprintProtection(payload),
    networkPrivacy: analyzeNetworkPrivacy(additionalInfo),
    overallTier: calculateOverallTier(payload, additionalInfo),
    score: calculatePrivacyScore(payload, additionalInfo),
    recommendations: generateRecommendations(payload, additionalInfo),
  };
}

/**
 * Analyze ad blocker status
 */
function analyzeAdBlocker(detected?: boolean): AdBlockerStatus {
  return {
    detected: detected ?? false,
    strength: detected ? 'standard' : 'none',
    blockedCategories: detected
      ? ['display_ads', 'tracking_pixels']
      : [],
  };
}

/**
 * Analyze privacy headers
 */
function analyzePrivacyHeaders(payload: FingerprintPayload): PrivacyHeaderStatus {
  const { software } = payload;

  // Do Not Track
  const dntEnabled = software.doNotTrack === '1' || software.doNotTrack === 'yes';

  // Global Privacy Control
  const gpcEnabled = software.globalPrivacyControl === true;

  // Referrer Policy (would come from network check, estimate here)
  const referrerPolicy = 'unknown';

  return {
    doNotTrack: dntEnabled,
    globalPrivacyControl: gpcEnabled,
    referrerPolicy,
    effectiveness: calculateHeaderEffectiveness(dntEnabled, gpcEnabled),
  };
}

/**
 * Calculate header effectiveness
 */
function calculateHeaderEffectiveness(dnt: boolean, gpc: boolean): 'low' | 'medium' | 'high' {
  if (gpc && dnt) return 'medium'; // GPC has legal weight in some jurisdictions
  if (gpc || dnt) return 'low'; // Often ignored by trackers
  return 'low'; // Neither enabled
}

/**
 * Analyze fingerprint protection
 */
function analyzeFingerprintProtection(payload: FingerprintPayload): FingerprintProtectionStatus {
  const { hardware, software } = payload;

  // Check if canvas is blocked/spoofed
  const canvasProtected = hardware.canvas?.blocked || hardware.canvas?.spoofed || false;

  // Check if WebGL is blocked
  const webglProtected = hardware.webgl?.blocked || false;

  // Check if audio is blocked
  const audioProtected = hardware.audio?.blocked || false;

  // Check for font fingerprint protection
  const fontsProtected =
    !software.fonts || software.fonts.count === 0 || software.fonts.count < 5;

  // Determine protection level
  const protectedCount = [canvasProtected, webglProtected, audioProtected, fontsProtected].filter(
    Boolean
  ).length;

  let level: 'none' | 'basic' | 'enhanced' | 'maximum';
  if (protectedCount >= 3) {
    level = 'maximum';
  } else if (protectedCount >= 2) {
    level = 'enhanced';
  } else if (protectedCount >= 1) {
    level = 'basic';
  } else {
    level = 'none';
  }

  // Detect protection tool
  let detectedTool: string | undefined;
  if (canvasProtected && webglProtected) {
    detectedTool = 'CanvasBlocker or similar';
  } else if (canvasProtected) {
    detectedTool = 'Canvas fingerprint protection';
  }

  return {
    canvasProtected,
    webglProtected,
    audioProtected,
    fontsProtected,
    level,
    detectedTool,
  };
}

/**
 * Analyze network privacy
 */
function analyzeNetworkPrivacy(info?: {
  vpnDetected?: boolean;
  torDetected?: boolean;
}): NetworkPrivacyStatus {
  return {
    vpnDetected: info?.vpnDetected ?? false,
    torDetected: info?.torDetected ?? false,
    dnsLeakProtected: false, // Would need actual test
    webrtcLeakProtected: false, // Would need actual test
  };
}

/**
 * Calculate overall defense tier
 */
function calculateOverallTier(
  payload: FingerprintPayload,
  additionalInfo?: {
    adBlockerDetected?: boolean;
    vpnDetected?: boolean;
    torDetected?: boolean;
  }
): DefenseTier {
  const fpProtection = analyzeFingerprintProtection(payload);
  const privacyHeaders = analyzePrivacyHeaders(payload);

  let score = 0;

  // Fingerprint protection (up to 40 points)
  if (fpProtection.level === 'maximum') score += 40;
  else if (fpProtection.level === 'enhanced') score += 30;
  else if (fpProtection.level === 'basic') score += 15;

  // Ad blocker (up to 20 points)
  if (additionalInfo?.adBlockerDetected) score += 20;

  // Privacy headers (up to 10 points)
  if (privacyHeaders.globalPrivacyControl) score += 7;
  if (privacyHeaders.doNotTrack) score += 3;

  // Network privacy (up to 30 points)
  if (additionalInfo?.torDetected) score += 30;
  else if (additionalInfo?.vpnDetected) score += 15;

  if (score >= 80) return 'fortress';
  if (score >= 60) return 'hardened';
  if (score >= 40) return 'protected';
  if (score >= 20) return 'basic';
  return 'exposed';
}

/**
 * Calculate privacy score (0-100)
 */
function calculatePrivacyScore(
  payload: FingerprintPayload,
  additionalInfo?: {
    adBlockerDetected?: boolean;
    vpnDetected?: boolean;
    torDetected?: boolean;
  }
): number {
  let score = 0;
  const { hardware, software, capabilities } = payload;

  // Fingerprint blocking (35 points max)
  if (hardware.canvas?.blocked || hardware.canvas?.spoofed) score += 10;
  if (hardware.webgl?.blocked) score += 10;
  if (hardware.audio?.blocked) score += 5;
  if (!software.fonts || software.fonts.count < 5) score += 10;

  // Privacy preferences (15 points max)
  if (software.doNotTrack === '1') score += 5;
  if (software.globalPrivacyControl) score += 10;

  // Ad blocking (20 points max)
  if (additionalInfo?.adBlockerDetected) score += 20;

  // Network privacy (30 points max)
  if (additionalInfo?.torDetected) score += 30;
  else if (additionalInfo?.vpnDetected) score += 15;

  // Reduced API surface (bonus, 10 points max)
  if (!capabilities.bluetooth) score += 2;
  if (!capabilities.usb) score += 2;
  if (!capabilities.midi) score += 2;
  if (!capabilities.geolocation) score += 2;
  if (!capabilities.webRTC) score += 2;

  return Math.min(score, 100);
}

/**
 * Generate recommendations for improving privacy
 */
function generateRecommendations(
  payload: FingerprintPayload,
  additionalInfo?: {
    adBlockerDetected?: boolean;
    vpnDetected?: boolean;
  }
): string[] {
  const recommendations: string[] = [];
  const fpProtection = analyzeFingerprintProtection(payload);

  // Ad blocker
  if (!additionalInfo?.adBlockerDetected) {
    recommendations.push(
      'Install an ad blocker like uBlock Origin to block trackers'
    );
  }

  // Canvas protection
  if (!fpProtection.canvasProtected) {
    recommendations.push(
      'Consider using CanvasBlocker or enabling fingerprint protection in Firefox'
    );
  }

  // WebGL protection
  if (!fpProtection.webglProtected && !fpProtection.canvasProtected) {
    recommendations.push(
      'WebGL reveals your GPU information. Consider blocking it in privacy settings'
    );
  }

  // Privacy headers
  if (!payload.software.globalPrivacyControl) {
    recommendations.push(
      'Enable Global Privacy Control (GPC) in your browser settings'
    );
  }

  // VPN
  if (!additionalInfo?.vpnDetected) {
    recommendations.push(
      'Use a reputable VPN to mask your IP address and location'
    );
  }

  // Browser choice
  const ua = payload.software.userAgent.toLowerCase();
  if (!ua.includes('firefox') && !ua.includes('brave') && !ua.includes('tor')) {
    recommendations.push(
      'Consider using Firefox, Brave, or Tor Browser for better default privacy'
    );
  }

  // Font protection
  if (payload.software.fonts && payload.software.fonts.count > 20) {
    recommendations.push(
      'Your installed fonts create a unique fingerprint. Consider using fewer custom fonts'
    );
  }

  // Too many recommendations? Limit to top 5
  return recommendations.slice(0, 5);
}

/**
 * Generate browser-specific hardening guide
 */
export function generateHardeningGuide(
  payload: FingerprintPayload
): HardeningGuide {
  const browserType = detectBrowserType(payload.software.userAgent);
  const steps = getHardeningSteps(browserType);
  const currentLevel = calculateCurrentLevel(payload);

  return {
    browserType,
    currentLevel,
    steps,
    estimatedImpact: estimateImpact(steps, payload),
  };
}

/**
 * Detect browser type from user agent
 */
function detectBrowserType(userAgent: string): BrowserType {
  const ua = userAgent.toLowerCase();

  if (ua.includes('firefox')) return 'firefox';
  if (ua.includes('brave')) return 'brave';
  if (ua.includes('tor')) return 'tor';
  if (ua.includes('safari') && !ua.includes('chrome')) return 'safari';
  if (ua.includes('edg/')) return 'edge';
  if (ua.includes('chrome')) return 'chrome';

  return 'other';
}

/**
 * Get hardening steps for browser
 */
function getHardeningSteps(browser: BrowserType): HardeningStep[] {
  const commonSteps: HardeningStep[] = [
    {
      id: 'ublock',
      title: 'Install uBlock Origin',
      description: 'Block ads and trackers with uBlock Origin extension',
      difficulty: 'easy',
      impact: 'high',
      instructions: [
        'Visit your browser\'s extension store',
        'Search for "uBlock Origin"',
        'Click Install/Add to browser',
        'uBlock Origin will start blocking trackers immediately',
      ],
    },
    {
      id: 'https-everywhere',
      title: 'Use HTTPS Everywhere',
      description: 'Force encrypted connections when available',
      difficulty: 'easy',
      impact: 'medium',
      instructions: [
        'Most modern browsers have this built-in',
        'In settings, look for "HTTPS-Only Mode" and enable it',
      ],
    },
  ];

  const browserSpecificSteps: Record<BrowserType, HardeningStep[]> = {
    firefox: [
      {
        id: 'etp',
        title: 'Enable Enhanced Tracking Protection (Strict)',
        description: 'Firefox\'s built-in tracker blocking at maximum strength',
        difficulty: 'easy',
        impact: 'high',
        instructions: [
          'Open Firefox Settings',
          'Go to Privacy & Security',
          'Under Enhanced Tracking Protection, select "Strict"',
        ],
      },
      {
        id: 'resist-fingerprinting',
        title: 'Enable Resist Fingerprinting',
        description: 'Advanced protection that normalizes many fingerprint vectors',
        difficulty: 'medium',
        impact: 'high',
        instructions: [
          'Type "about:config" in address bar',
          'Search for "privacy.resistFingerprinting"',
          'Double-click to set it to true',
          'Note: This may affect some website functionality',
        ],
      },
    ],
    brave: [
      {
        id: 'shields',
        title: 'Configure Brave Shields',
        description: 'Set Brave\'s built-in protection to aggressive mode',
        difficulty: 'easy',
        impact: 'high',
        instructions: [
          'Click the Brave Shield icon in toolbar',
          'Set "Block trackers & ads" to Aggressive',
          'Enable "Block fingerprinting"',
        ],
      },
    ],
    chrome: [
      {
        id: 'privacy-sandbox',
        title: 'Disable Privacy Sandbox',
        description: 'Opt out of Google\'s tracking alternatives',
        difficulty: 'easy',
        impact: 'low',
        instructions: [
          'Go to Settings > Privacy and Security',
          'Click "Privacy Sandbox"',
          'Disable all options',
        ],
      },
      {
        id: 'third-party-cookies',
        title: 'Block Third-Party Cookies',
        description: 'Prevent cross-site tracking cookies',
        difficulty: 'easy',
        impact: 'medium',
        instructions: [
          'Go to Settings > Privacy and Security',
          'Click "Cookies and other site data"',
          'Select "Block third-party cookies"',
        ],
      },
    ],
    safari: [
      {
        id: 'itp',
        title: 'Verify Intelligent Tracking Prevention',
        description: 'Safari\'s built-in tracking protection',
        difficulty: 'easy',
        impact: 'high',
        instructions: [
          'Open Safari Preferences',
          'Go to Privacy tab',
          'Ensure "Prevent cross-site tracking" is checked',
        ],
      },
    ],
    edge: [
      {
        id: 'tracking-prevention',
        title: 'Set Tracking Prevention to Strict',
        description: 'Edge\'s built-in tracker blocking',
        difficulty: 'easy',
        impact: 'medium',
        instructions: [
          'Go to Settings > Privacy, search, and services',
          'Under "Tracking prevention", select "Strict"',
        ],
      },
    ],
    tor: [],
    other: [],
  };

  return [...commonSteps, ...(browserSpecificSteps[browser] || [])];
}

/**
 * Calculate current hardening level
 */
function calculateCurrentLevel(payload: FingerprintPayload): number {
  let level = 0;
  const fpProtection = analyzeFingerprintProtection(payload);

  // Base level from fingerprint protection
  if (fpProtection.level === 'maximum') level = 80;
  else if (fpProtection.level === 'enhanced') level = 60;
  else if (fpProtection.level === 'basic') level = 40;
  else level = 20;

  // Adjust based on privacy headers
  if (payload.software.globalPrivacyControl) level += 10;
  if (payload.software.doNotTrack === '1') level += 5;

  return Math.min(level, 100);
}

/**
 * Estimate impact of following hardening steps
 */
function estimateImpact(
  steps: HardeningStep[],
  payload: FingerprintPayload
): {
  currentScore: number;
  potentialScore: number;
  improvement: number;
} {
  const currentScore = calculatePrivacyScore(payload);

  // Estimate potential improvement from steps
  let potentialGain = 0;
  for (const step of steps) {
    if (step.impact === 'high') potentialGain += 15;
    else if (step.impact === 'medium') potentialGain += 8;
    else potentialGain += 3;
  }

  const potentialScore = Math.min(currentScore + potentialGain, 100);

  return {
    currentScore,
    potentialScore,
    improvement: potentialScore - currentScore,
  };
}
