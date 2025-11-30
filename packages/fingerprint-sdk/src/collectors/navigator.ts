/**
 * Navigator Properties Collector
 * Collects browser and system information from navigator object
 */

import type {
  SoftwareSignals,
  CapabilitySignals,
  NetworkSignals,
  PluginInfo,
} from '@panopticlick/types';

/**
 * Collect software signals from navigator
 */
export function collectSoftwareSignals(): SoftwareSignals {
  const nav = typeof navigator !== 'undefined' ? navigator : null;

  return {
    userAgent: nav?.userAgent ?? '',
    platform: nav?.platform ?? '',
    vendor: nav?.vendor ?? '',
    language: nav?.language ?? 'en-US',
    languages: nav?.languages ? [...nav.languages] : ['en-US'],
    timezone: getTimezone(),
    timezoneOffset: new Date().getTimezoneOffset(),
    fonts: null, // Filled separately by fonts collector
    plugins: collectPlugins(),
    mimeTypes: collectMimeTypes(),
    cookiesEnabled: nav?.cookieEnabled ?? false,
    doNotTrack: getDoNotTrack(),
    globalPrivacyControl: getGlobalPrivacyControl(),
    darkMode: prefersDarkMode(),
    reducedMotion: prefersReducedMotion(),
    reducedTransparency: prefersReducedTransparency(),
    forcedColors: hasForcedColors(),
  };
}

/**
 * Collect capability signals
 */
export function collectCapabilitySignals(): CapabilitySignals {
  return {
    localStorage: testLocalStorage(),
    sessionStorage: testSessionStorage(),
    indexedDB: testIndexedDB(),
    webWorker: testWebWorker(),
    serviceWorker: testServiceWorker(),
    sharedWorker: testSharedWorker(),
    webGL: testWebGL(),
    webGL2: testWebGL2(),
    webRTC: testWebRTC(),
    webSocket: testWebSocket(),
    webAssembly: testWebAssembly(),
    bluetooth: testBluetooth(),
    usb: testUSB(),
    midi: testMIDI(),
    notifications: testNotifications(),
    geolocation: testGeolocation(),
    pdfViewer: testPDFViewer(),
  };
}

/**
 * Collect network signals
 */
export function collectNetworkSignals(): NetworkSignals {
  const connection = getNetworkConnection();

  return {
    connectionType: connection?.effectiveType ?? null,
    downlink: connection?.downlink ?? null,
    rtt: connection?.rtt ?? null,
    saveData: connection?.saveData ?? false,
  };
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get timezone name
 */
function getTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Unknown';
  } catch {
    return 'Unknown';
  }
}

/**
 * Collect browser plugins
 */
function collectPlugins(): PluginInfo[] {
  if (typeof navigator === 'undefined' || !navigator.plugins) {
    return [];
  }

  const plugins: PluginInfo[] = [];

  for (let i = 0; i < navigator.plugins.length; i++) {
    const plugin = navigator.plugins[i];
    plugins.push({
      name: plugin.name || '',
      filename: plugin.filename || '',
      description: plugin.description || '',
    });
  }

  return plugins;
}

/**
 * Collect MIME types
 */
function collectMimeTypes(): string[] {
  if (typeof navigator === 'undefined' || !navigator.mimeTypes) {
    return [];
  }

  const types: string[] = [];

  for (let i = 0; i < navigator.mimeTypes.length; i++) {
    const mimeType = navigator.mimeTypes[i];
    if (mimeType.type) {
      types.push(mimeType.type);
    }
  }

  return types;
}

/**
 * Get Do Not Track setting
 */
function getDoNotTrack(): string | null {
  if (typeof navigator === 'undefined') {
    return null;
  }

  // Check standard property
  if ('doNotTrack' in navigator) {
    return navigator.doNotTrack;
  }

  // Check MS property
  if ('msDoNotTrack' in navigator) {
    return (navigator as unknown as { msDoNotTrack: string }).msDoNotTrack;
  }

  // Check window property
  if (typeof window !== 'undefined' && 'doNotTrack' in window) {
    return (window as unknown as { doNotTrack: string }).doNotTrack;
  }

  return null;
}

/**
 * Get Global Privacy Control setting
 */
function getGlobalPrivacyControl(): boolean | null {
  if (typeof navigator === 'undefined') {
    return null;
  }

  if ('globalPrivacyControl' in navigator) {
    return (navigator as unknown as { globalPrivacyControl: boolean }).globalPrivacyControl;
  }

  return null;
}

/**
 * Check dark mode preference
 */
function prefersDarkMode(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return false;
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

/**
 * Check reduced motion preference
 */
function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return false;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Check reduced transparency preference
 */
function prefersReducedTransparency(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return false;
  }
  return window.matchMedia('(prefers-reduced-transparency: reduce)').matches;
}

/**
 * Check forced colors mode
 */
function hasForcedColors(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return false;
  }
  return window.matchMedia('(forced-colors: active)').matches;
}

/**
 * Get network connection info
 */
function getNetworkConnection(): {
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
} | null {
  if (typeof navigator === 'undefined') {
    return null;
  }

  const nav = navigator as unknown as {
    connection?: {
      effectiveType?: string;
      downlink?: number;
      rtt?: number;
      saveData?: boolean;
    };
    mozConnection?: unknown;
    webkitConnection?: unknown;
  };

  return nav.connection || null;
}

// ============================================
// CAPABILITY TESTS
// ============================================

function testLocalStorage(): boolean {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

function testSessionStorage(): boolean {
  try {
    const test = '__storage_test__';
    sessionStorage.setItem(test, test);
    sessionStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

function testIndexedDB(): boolean {
  return typeof indexedDB !== 'undefined';
}

function testWebWorker(): boolean {
  return typeof Worker !== 'undefined';
}

function testServiceWorker(): boolean {
  return 'serviceWorker' in navigator;
}

function testSharedWorker(): boolean {
  return typeof SharedWorker !== 'undefined';
}

function testWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl')
    );
  } catch {
    return false;
  }
}

function testWebGL2(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!canvas.getContext('webgl2');
  } catch {
    return false;
  }
}

function testWebRTC(): boolean {
  return !!(
    typeof RTCPeerConnection !== 'undefined' ||
    typeof (window as unknown as { webkitRTCPeerConnection?: unknown }).webkitRTCPeerConnection !== 'undefined' ||
    typeof (window as unknown as { mozRTCPeerConnection?: unknown }).mozRTCPeerConnection !== 'undefined'
  );
}

function testWebSocket(): boolean {
  return typeof WebSocket !== 'undefined';
}

function testWebAssembly(): boolean {
  return typeof WebAssembly !== 'undefined';
}

function testBluetooth(): boolean {
  return 'bluetooth' in navigator;
}

function testUSB(): boolean {
  return 'usb' in navigator;
}

function testMIDI(): boolean {
  return 'requestMIDIAccess' in navigator;
}

function testNotifications(): boolean {
  return 'Notification' in window;
}

function testGeolocation(): boolean {
  return 'geolocation' in navigator;
}

function testPDFViewer(): boolean {
  if (typeof navigator === 'undefined') {
    return false;
  }

  // Check pdfViewerEnabled property
  if ('pdfViewerEnabled' in navigator) {
    return (navigator as unknown as { pdfViewerEnabled: boolean }).pdfViewerEnabled;
  }

  // Fallback: check for PDF plugin
  const plugins = (navigator as { plugins?: PluginArray }).plugins;
  if (plugins) {
    for (let i = 0; i < plugins.length; i++) {
      if (plugins[i].name.includes('PDF')) {
        return true;
      }
    }
  }

  // Fallback: check MIME types
  const mimeTypes = (navigator as { mimeTypes?: MimeTypeArray }).mimeTypes;
  if (mimeTypes) {
    for (let i = 0; i < mimeTypes.length; i++) {
      if (mimeTypes[i].type === 'application/pdf') {
        return true;
      }
    }
  }

  return false;
}

// ============================================
// SPOOFING DETECTION
// ============================================

/**
 * Detect potential navigator spoofing
 */
export function detectNavigatorSpoofing(): {
  spoofed: boolean;
  reasons: string[];
} {
  const reasons: string[] = [];
  const nav = typeof navigator !== 'undefined' ? navigator : null;

  if (!nav) {
    return { spoofed: false, reasons: [] };
  }

  // Check for inconsistent platform/userAgent
  const userAgent = nav.userAgent.toLowerCase();
  const platform = nav.platform.toLowerCase();

  // Windows checks
  if (platform.includes('win') && !userAgent.includes('windows')) {
    reasons.push('Platform claims Windows but User-Agent does not');
  }

  // Mac checks
  if (platform.includes('mac') && !userAgent.includes('mac')) {
    reasons.push('Platform claims Mac but User-Agent does not');
  }

  // Linux checks
  if (platform.includes('linux') && !userAgent.includes('linux') && !userAgent.includes('android')) {
    reasons.push('Platform claims Linux but User-Agent does not');
  }

  // Check for suspicious vendor
  if (nav.vendor === '' && userAgent.includes('chrome')) {
    reasons.push('Chrome-like User-Agent with empty vendor');
  }

  // Check for headless indicators
  if (userAgent.includes('headless')) {
    reasons.push('Headless browser detected in User-Agent');
  }

  // Check for automation tools
  const automationKeys = [
    'webdriver',
    '__webdriver_script_fn',
    '__driver_evaluate',
    '__webdriver_evaluate',
    '__selenium_evaluate',
    '__fxdriver_evaluate',
    '__driver_unwrapped',
    '__webdriver_unwrapped',
    '__selenium_unwrapped',
    '__fxdriver_unwrapped',
  ];

  for (const key of automationKeys) {
    if (key in document || key in window) {
      reasons.push(`Automation key detected: ${key}`);
      break;
    }
  }

  // Check for PhantomJS
  if ('callPhantom' in window || '_phantom' in window) {
    reasons.push('PhantomJS detected');
  }

  // Check hardwareConcurrency
  if (nav.hardwareConcurrency === 1) {
    reasons.push('Suspicious single CPU core reported');
  }

  // Check deviceMemory
  if ('deviceMemory' in nav) {
    const memory = (nav as unknown as { deviceMemory: number }).deviceMemory;
    if (memory < 0.25 || memory > 128) {
      reasons.push('Suspicious device memory value');
    }
  }

  return {
    spoofed: reasons.length > 0,
    reasons,
  };
}

/**
 * Get browser fingerprint consistency score
 */
export function calculateConsistencyScore(): number {
  let score = 100;
  const spoofCheck = detectNavigatorSpoofing();

  // Deduct points for each inconsistency
  score -= spoofCheck.reasons.length * 10;

  // Check for missing common properties
  const nav = navigator;

  if (!nav.userAgent) score -= 15;
  if (!nav.language) score -= 10;
  if (!nav.platform) score -= 10;

  // Check for unusual combinations
  const capabilities = collectCapabilitySignals();

  // WebGL but no canvas support is unusual
  if (capabilities.webGL && !document.createElement('canvas').getContext('2d')) {
    score -= 20;
  }

  // ServiceWorker without Notifications is unusual
  if (capabilities.serviceWorker && !capabilities.notifications) {
    score -= 5;
  }

  return Math.max(0, Math.min(100, score));
}

/**
 * Parse User-Agent for browser/OS info
 */
export function parseUserAgent(userAgent: string): {
  browser: string;
  browserVersion: string;
  os: string;
  osVersion: string;
  device: string;
  isMobile: boolean;
  isBot: boolean;
} {
  const ua = userAgent.toLowerCase();

  // Detect browser
  let browser = 'Unknown';
  let browserVersion = '';

  if (ua.includes('firefox/')) {
    browser = 'Firefox';
    browserVersion = extractVersion(ua, 'firefox/');
  } else if (ua.includes('edg/')) {
    browser = 'Edge';
    browserVersion = extractVersion(ua, 'edg/');
  } else if (ua.includes('opr/') || ua.includes('opera/')) {
    browser = 'Opera';
    browserVersion = extractVersion(ua, 'opr/') || extractVersion(ua, 'opera/');
  } else if (ua.includes('safari/') && !ua.includes('chrome/')) {
    browser = 'Safari';
    browserVersion = extractVersion(ua, 'version/');
  } else if (ua.includes('chrome/')) {
    browser = 'Chrome';
    browserVersion = extractVersion(ua, 'chrome/');
  }

  // Detect OS
  let os = 'Unknown';
  let osVersion = '';

  if (ua.includes('windows nt')) {
    os = 'Windows';
    const match = ua.match(/windows nt (\d+\.\d+)/);
    if (match) {
      const ntVersion = match[1];
      osVersion = ntVersion === '10.0' ? '10/11' : ntVersion;
    }
  } else if (ua.includes('mac os x')) {
    os = 'macOS';
    const match = ua.match(/mac os x (\d+[._]\d+)/);
    if (match) {
      osVersion = match[1].replace('_', '.');
    }
  } else if (ua.includes('android')) {
    os = 'Android';
    const match = ua.match(/android (\d+\.?\d*)/);
    if (match) {
      osVersion = match[1];
    }
  } else if (ua.includes('iphone') || ua.includes('ipad')) {
    os = 'iOS';
    const match = ua.match(/os (\d+[._]\d+)/);
    if (match) {
      osVersion = match[1].replace('_', '.');
    }
  } else if (ua.includes('linux')) {
    os = 'Linux';
  }

  // Detect device type
  let device = 'Desktop';
  const isMobile =
    ua.includes('mobile') ||
    ua.includes('android') ||
    ua.includes('iphone');

  if (ua.includes('ipad') || ua.includes('tablet')) {
    device = 'Tablet';
  } else if (isMobile) {
    device = 'Mobile';
  }

  // Detect bots
  const botPatterns = [
    'bot',
    'crawler',
    'spider',
    'slurp',
    'googlebot',
    'bingbot',
    'yandex',
    'duckduckbot',
    'baiduspider',
  ];
  const isBot = botPatterns.some((p) => ua.includes(p));

  return {
    browser,
    browserVersion,
    os,
    osVersion,
    device,
    isMobile,
    isBot,
  };
}

/**
 * Extract version number from User-Agent
 */
function extractVersion(ua: string, prefix: string): string {
  const index = ua.indexOf(prefix);
  if (index === -1) return '';

  const start = index + prefix.length;
  const end = ua.indexOf(' ', start);
  const version = end === -1 ? ua.substring(start) : ua.substring(start, end);

  return version.split('.').slice(0, 2).join('.');
}
