/**
 * Defense Module
 * Privacy defense testing and detection tools
 */

// Blocker detection
export {
  runBlockerTests,
  quickBlockerDetect,
  getBaitResources,
  getTrackerCategories,
} from './blocker-test';

export type {
  BaitResource,
  BlockerTestResult,
  BlockerAnalysis,
} from './blocker-test';

// WebRTC leak detection
export {
  detectWebRTCLeak,
  isWebRTCSupported,
  checkWebRTCStatus,
  getWebRTCInfo,
} from './webrtc';

export type {
  WebRTCLeakResult,
  IPInfo,
} from './webrtc';

// DNS leak detection
export {
  detectDNSLeak,
  quickDNSCheck,
  getSecureDNSProviders,
} from './dns';

export type {
  DNSLeakResult,
  DNSResolver,
} from './dns';
