/**
 * Fingerprint Collectors Index
 * Exports all collector functions
 */

// Canvas fingerprint
export {
  collectCanvas,
  verifyCanvasStability,
} from './canvas';

// WebGL fingerprint
export {
  collectWebGL,
  detectWebGLSpoofing,
  getGPUTier,
} from './webgl';

// Audio fingerprint
export {
  collectAudio,
  verifyAudioStability,
  getAudioCapabilities,
} from './audio';

// Screen info
export {
  collectScreen,
  collectExtendedScreen,
  calculateScreenEntropy,
  detectScreenSpoofing,
  inferDeviceType,
} from './screen';

// Font detection
export {
  collectFonts,
  checkFontViaAPI,
  calculateFontEntropy,
  detectFontSpoofing,
  categorizeFonts,
} from './fonts';

// Timezone and locale
export {
  collectTimezone,
  collectExtendedLocale,
  calculateTimezoneEntropy,
  detectTimezoneSpoofing,
} from './timezone';
export type { TimezoneInfo } from './timezone';

// Navigator properties
export {
  collectSoftwareSignals,
  collectCapabilitySignals,
  collectNetworkSignals,
  detectNavigatorSpoofing,
  calculateConsistencyScore,
  parseUserAgent,
} from './navigator';
