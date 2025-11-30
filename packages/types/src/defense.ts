/**
 * Defense Types
 * Privacy score calculation and device capability detection
 *
 * Note: BrowserType, HardeningStep, HardeningGuide are defined in valuation.ts
 * to avoid duplication. Import them from there if needed.
 */

// ============================================
// PRIVACY SCORE CALCULATION
// ============================================

export interface PrivacyScoreWeights {
  adBlocker: number;
  fingerprintProtection: number;
  networkPrivacy: number;
  privacyHeaders: number;
}

export const DEFAULT_PRIVACY_WEIGHTS: PrivacyScoreWeights = {
  adBlocker: 0.25,
  fingerprintProtection: 0.35,
  networkPrivacy: 0.25,
  privacyHeaders: 0.15,
};

// ============================================
// DEVICE CAPABILITY DETECTION
// ============================================

export type DeviceCapability = 'low' | 'medium' | 'high';

export interface DeviceCapabilityInfo {
  capability: DeviceCapability;
  cores: number;
  memory: number | null;
  hasGPU: boolean;
  supportsWebGL2: boolean;
}
