/**
 * Fingerprint Types
 * Client-side collected browser fingerprint data
 */

// ============================================
// CANVAS FINGERPRINT
// ============================================

export interface CanvasFingerprint {
  hash: string;
  dataUrl?: string;
  blocked: boolean;
  spoofed: boolean;
}

// ============================================
// WEBGL FINGERPRINT
// ============================================

export interface WebGLFingerprint {
  hash: string;
  vendor: string;
  renderer: string;
  version: string;
  shadingLanguageVersion: string;
  extensions: string[];
  maxTextureSize: number;
  blocked: boolean;
}

// ============================================
// AUDIO FINGERPRINT
// ============================================

export interface AudioFingerprint {
  hash: string;
  sampleRate: number;
  channelCount: number;
  blocked: boolean;
}

// ============================================
// SCREEN INFO
// ============================================

export interface ScreenInfo {
  width: number;
  height: number;
  availWidth: number;
  availHeight: number;
  colorDepth: number;
  pixelRatio: number;
  orientation: string;
}

// ============================================
// FONT INFO
// ============================================

export interface FontInfo {
  hash: string;
  count: number;
  detected: string[];
}

// ============================================
// PLUGIN INFO
// ============================================

export interface PluginInfo {
  name: string;
  filename: string;
  description: string;
}

// ============================================
// HARDWARE SIGNALS
// ============================================

export interface HardwareSignals {
  canvas: CanvasFingerprint | null;
  webgl: WebGLFingerprint | null;
  audio: AudioFingerprint | null;
  screen: ScreenInfo;
  cpu: number;
  memory: number | null;
  touchPoints: number;
  gpu: {
    vendor: string;
    renderer: string;
  } | null;
}

// ============================================
// SOFTWARE SIGNALS
// ============================================

export interface SoftwareSignals {
  userAgent: string;
  platform: string;
  vendor: string;
  language: string;
  languages: string[];
  timezone: string;
  timezoneOffset: number;
  fonts: FontInfo | null;
  plugins: PluginInfo[];
  mimeTypes: string[];
  cookiesEnabled: boolean;
  doNotTrack: string | null;
  globalPrivacyControl: boolean | null;
  darkMode: boolean;
  reducedMotion: boolean;
  reducedTransparency: boolean;
  forcedColors: boolean;
}

// ============================================
// CAPABILITY SIGNALS
// ============================================

export interface CapabilitySignals {
  localStorage: boolean;
  sessionStorage: boolean;
  indexedDB: boolean;
  webWorker: boolean;
  serviceWorker: boolean;
  sharedWorker: boolean;
  webGL: boolean;
  webGL2: boolean;
  webRTC: boolean;
  webSocket: boolean;
  webAssembly: boolean;
  bluetooth: boolean;
  usb: boolean;
  midi: boolean;
  notifications: boolean;
  geolocation: boolean;
  pdfViewer: boolean;
}

// ============================================
// NETWORK SIGNALS
// ============================================

export interface NetworkSignals {
  connectionType: string | null;
  downlink: number | null;
  rtt: number | null;
  saveData: boolean;
}

// ============================================
// BEHAVIOR SIGNALS
// ============================================

export interface BehaviorSignals {
  mouseEntropy: number | null;
  scrollPatterns: number | null;
  keystrokeDynamics: number | null;
}

// ============================================
// FINGERPRINT META
// ============================================

export interface FingerprintMeta {
  sessionId: string;
  timestamp: number;
  collectDuration: number;
  sdkVersion: string;
  consentGiven: boolean;
}

// ============================================
// COMPLETE FINGERPRINT PAYLOAD
// ============================================

export interface FingerprintPayload {
  meta: FingerprintMeta;
  hardware: HardwareSignals;
  software: SoftwareSignals;
  capabilities: CapabilitySignals;
  network: NetworkSignals;
  behavior?: BehaviorSignals;
}

// ============================================
// NETWORK INTELLIGENCE (Server-side enrichment)
// ============================================

export interface NetworkIntelligence {
  ipHash: string;
  asn: string;
  asnOrg: string;
  country: string;
  countryCode: string;
  region: string;
  city: string;
  isProxy: boolean;
  isVPN: boolean;
  isTor: boolean;
  isDatacenter: boolean;
  riskScore: number;
}

// ============================================
// HASH RESULT
// ============================================

export interface HashResult {
  hardwareHash: string;
  softwareHash: string;
  fullHash: string;
  confidence: number;
}
