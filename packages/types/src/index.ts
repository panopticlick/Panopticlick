/**
 * @panopticlick/types
 * Shared TypeScript type definitions for Panopticlick.org
 */

// Fingerprint types
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
  NetworkIntelligence,
  HashResult,
} from './fingerprint';

// Valuation types
export type {
  EntropyRarity,
  EntropyTier,
  EntropyComponent,
  EntropyBreakdown,
  EntropyReport,
  BidderType,
  RTBBid,
  RTBSimulationResult,
  Persona,
  DSPProfile,
  PersonaRule,
  TrackabilityTier,
  MarketValuation,
  DefenseTier,
  TrackerCategory,
  TrackerTestResult,
  AdBlockerStatus,
  PrivacyHeaderStatus,
  FingerprintProtectionStatus,
  NetworkPrivacyStatus,
  DefenseStatus,
  BrowserType,
  HardeningStep,
  HardeningGuide,
  PopulationComparison,
  ReportMeta,
  ValuationReport,
} from './valuation';

// API types
export type {
  ScanStartRequest,
  ScanStartResponse,
  ScanCollectRequest,
  ScanCollectResponse,
  RTBSimulateRequest,
  RTBSimulateResponse,
  SupercookieGenerateRequest,
  SupercookieGenerateResponse,
  SupercookieVerifyRequest,
  SupercookieVerifyResponse,
  DefenseBlockerRequest,
  DefenseBlockerResponse,
  DefenseDNSResponse,
  DefenseTestRequest,
  DefenseTestResponse,
  DefenseRecommendationsResponse,
  EntropyBucket,
  BrowserStat,
  CountryStat,
  GlobalStatsResponse,
  OptOutRequest,
  OptOutResponse,
  MyDataResponse,
  MyDataExportResponse,
  APIErrorCode,
  APIError,
  APIResponse,
} from './api';

export { isAPIError } from './api';

// Defense types (privacy score and device capability)
export type {
  PrivacyScoreWeights,
  DeviceCapability,
  DeviceCapabilityInfo,
} from './defense';

export { DEFAULT_PRIVACY_WEIGHTS } from './defense';
