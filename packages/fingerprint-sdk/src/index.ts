/**
 * @panopticlick/fingerprint-sdk
 * Browser fingerprinting SDK for Panopticlick.org
 *
 * This SDK collects browser fingerprints in a privacy-respecting way,
 * designed to educate users about how they can be tracked online.
 */

// Main collector
export {
  collectFingerprint,
  generateHashes,
  quickFingerprint,
  detectBlocking,
  estimateEntropy,
} from './collector';
export type { CollectorOptions } from './collector';

// Individual collectors (for advanced usage)
export {
  // Canvas
  collectCanvas,
  verifyCanvasStability,
  // WebGL
  collectWebGL,
  detectWebGLSpoofing,
  getGPUTier,
  // Audio
  collectAudio,
  verifyAudioStability,
  getAudioCapabilities,
  // Screen
  collectScreen,
  collectExtendedScreen,
  calculateScreenEntropy,
  detectScreenSpoofing,
  inferDeviceType,
  // Fonts
  collectFonts,
  checkFontViaAPI,
  calculateFontEntropy,
  detectFontSpoofing,
  categorizeFonts,
  // Timezone
  collectTimezone,
  collectExtendedLocale,
  calculateTimezoneEntropy,
  detectTimezoneSpoofing,
  // Navigator
  collectSoftwareSignals,
  collectCapabilitySignals,
  collectNetworkSignals,
  detectNavigatorSpoofing,
  calculateConsistencyScore,
  parseUserAgent,
} from './collectors';
export type { TimezoneInfo } from './collectors';

// Hash utilities
export {
  sha256,
  sha256Binary,
  simpleHash,
  combineHashes,
  generateSessionId,
  generateUUID,
} from './hash';

// Defense module - Privacy protection testing
export {
  // Blocker detection
  runBlockerTests,
  quickBlockerDetect,
  getBaitResources,
  getTrackerCategories,
  // WebRTC leak detection
  detectWebRTCLeak,
  isWebRTCSupported,
  checkWebRTCStatus,
  getWebRTCInfo,
  // DNS leak detection
  detectDNSLeak,
  quickDNSCheck,
  getSecureDNSProviders,
} from './defense';

export type {
  BaitResource,
  BlockerTestResult,
  BlockerAnalysis,
  WebRTCLeakResult,
  IPInfo,
  DNSLeakResult,
  DNSResolver,
} from './defense';

// Supercookie module - Persistence tracking demonstration
export {
  checkHSTSSupport,
  generateHSTSValue,
  binaryToHex,
  simulateHSTSWrite,
  simulateHSTSRead,
  generateHSTSDemoData,
  generateVisualization,
  getTrackingComparison,
} from './supercookie';

export type {
  HSTSConfig,
  HSTSCookieState,
  HSTSCheckResult,
  HSTSVisualization,
} from './supercookie';

// Re-export types from @panopticlick/types
export type {
  CanvasFingerprint,
  WebGLFingerprint,
  AudioFingerprint,
  ScreenInfo,
  FontInfo,
  PluginInfo,
  HardwareSignals,
  SoftwareSignals,
  CapabilitySignals,
  NetworkSignals,
  BehaviorSignals,
  FingerprintMeta,
  FingerprintPayload,
  HashResult,
} from '@panopticlick/types';
