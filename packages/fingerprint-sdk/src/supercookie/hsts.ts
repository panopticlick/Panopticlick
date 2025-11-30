/**
 * HSTS Supercookie Demonstration
 *
 * This module demonstrates how HSTS (HTTP Strict Transport Security) can be
 * abused to create persistent "supercookies" that survive cookie deletion.
 *
 * HOW IT WORKS:
 * 1. We have multiple subdomains (e.g., bit0.track.example.com, bit1.track.example.com)
 * 2. Each subdomain represents a single bit of a unique identifier
 * 3. When a subdomain is visited over HTTPS with HSTS, the browser remembers
 * 4. Later, we can "read" the identifier by checking if the browser upgrades
 *    HTTP requests to HTTPS for each subdomain
 *
 * This is for EDUCATIONAL PURPOSES to show users how they can be tracked
 * even without traditional cookies.
 */

// HSTS Supercookie configuration
export interface HSTSConfig {
  baseUrl: string;
  bits: number;
  timeout: number;
}

export interface HSTSCookieState {
  value: string;
  bits: boolean[];
  isNew: boolean;
  createdAt: number;
  verifiedAt: number | null;
}

export interface HSTSCheckResult {
  supported: boolean;
  canTrack: boolean;
  explanation: string;
  demonstrationUrl: string;
}

// Default configuration
const DEFAULT_CONFIG: HSTSConfig = {
  baseUrl: 'https://hsts.panopticlick.org',
  bits: 32,
  timeout: 5000,
};

/**
 * Generate a unique HSTS supercookie value
 * This creates a binary string that can be encoded in HSTS states
 */
export function generateHSTSValue(bits: number = 32): string {
  const bytes = new Uint8Array(Math.ceil(bits / 8));
  crypto.getRandomValues(bytes);

  // Convert to binary string
  let binary = '';
  for (const byte of bytes) {
    binary += byte.toString(2).padStart(8, '0');
  }

  return binary.slice(0, bits);
}

/**
 * Convert binary string to hex for display
 */
export function binaryToHex(binary: string): string {
  let hex = '';
  for (let i = 0; i < binary.length; i += 4) {
    const nibble = binary.slice(i, i + 4).padEnd(4, '0');
    hex += parseInt(nibble, 2).toString(16);
  }
  return hex;
}

/**
 * Check if HSTS supercookies are possible in this browser
 */
export async function checkHSTSSupport(): Promise<HSTSCheckResult> {
  // Check for basic requirements
  const isSecureContext = typeof window !== 'undefined' && window.isSecureContext;
  const hasServiceWorker = 'serviceWorker' in navigator;

  // HSTS supercookies work in all major browsers but can be mitigated
  const userAgent = navigator.userAgent.toLowerCase();
  const isTor = userAgent.includes('tor');
  const isBrave = userAgent.includes('brave');
  const isFirefoxResist = await checkFirefoxResistFingerprinting();

  let canTrack = true;
  let explanation = '';

  if (isTor) {
    canTrack = false;
    explanation = 'Tor Browser isolates HSTS state per domain, preventing supercookies.';
  } else if (isBrave) {
    canTrack = false;
    explanation = 'Brave Browser partitions HSTS state, limiting supercookie effectiveness.';
  } else if (isFirefoxResist) {
    canTrack = false;
    explanation = 'Firefox with resistFingerprinting limits HSTS tracking.';
  } else if (!isSecureContext) {
    canTrack = false;
    explanation = 'HSTS requires a secure context (HTTPS).';
  } else {
    explanation = 'Your browser is vulnerable to HSTS supercookie tracking. ' +
      'This means websites can track you even after you clear cookies.';
  }

  return {
    supported: isSecureContext,
    canTrack,
    explanation,
    demonstrationUrl: `${DEFAULT_CONFIG.baseUrl}/demo`,
  };
}

/**
 * Check if Firefox has resistFingerprinting enabled
 */
async function checkFirefoxResistFingerprinting(): Promise<boolean> {
  if (!navigator.userAgent.includes('Firefox')) {
    return false;
  }

  // When resistFingerprinting is enabled, performance.now() has reduced precision
  const times: number[] = [];
  for (let i = 0; i < 100; i++) {
    times.push(performance.now());
  }

  // Check for quantization (resistFingerprinting rounds to 100ms)
  const uniqueTimes = new Set(times.map(t => Math.floor(t / 100)));
  return uniqueTimes.size < times.length / 10;
}

/**
 * Simulate HSTS supercookie write operation
 * In a real implementation, this would make requests to subdomains
 */
export async function simulateHSTSWrite(
  value: string,
  config: HSTSConfig = DEFAULT_CONFIG
): Promise<HSTSCookieState> {
  const bits = value.split('').map(b => b === '1');

  // In production, this would:
  // 1. For each bit that is '1', make an HTTPS request to bitN.domain.com
  // 2. The server responds with HSTS header, telling browser to always use HTTPS
  // 3. For bits that are '0', we don't visit, so no HSTS policy is set

  // Simulate the operation
  await simulateNetworkDelay(bits.length * 10);

  return {
    value,
    bits,
    isNew: true,
    createdAt: Date.now(),
    verifiedAt: null,
  };
}

/**
 * Simulate HSTS supercookie read operation
 * In a real implementation, this would check which subdomains upgrade to HTTPS
 */
export async function simulateHSTSRead(
  config: HSTSConfig = DEFAULT_CONFIG
): Promise<HSTSCookieState | null> {
  // In production, this would:
  // 1. For each bit position, try to load a resource from http://bitN.domain.com
  // 2. If browser has HSTS policy, it upgrades to HTTPS (bit = 1)
  // 3. If no HSTS policy, stays HTTP (bit = 0)
  // 4. We can detect the upgrade via timing or resource loading

  // For demo purposes, check localStorage fallback
  if (typeof localStorage !== 'undefined') {
    const stored = localStorage.getItem('hsts_demo_cookie');
    if (stored) {
      try {
        const state = JSON.parse(stored) as HSTSCookieState;
        state.verifiedAt = Date.now();
        return state;
      } catch {
        return null;
      }
    }
  }

  return null;
}

/**
 * Simulate network delay for demo purposes
 */
function simulateNetworkDelay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Generate HSTS demonstration data
 * Shows how the supercookie would work with visual representation
 */
export function generateHSTSDemoData(): {
  subdomains: Array<{
    name: string;
    bit: number;
    value: boolean;
    url: string;
  }>;
  explanation: string[];
} {
  const value = generateHSTSValue(16);
  const bits = value.split('').map(b => b === '1');

  const subdomains = bits.map((bit, index) => ({
    name: `bit${index}`,
    bit: index,
    value: bit,
    url: `https://bit${index}.hsts.panopticlick.org`,
  }));

  const explanation = [
    '1. Each subdomain represents one bit of your tracking ID',
    '2. When you visit a subdomain over HTTPS, HSTS remembers it',
    '3. Next time, we check if HTTP gets upgraded to HTTPS',
    '4. This reveals the bit value (1 = upgraded, 0 = not)',
    '5. Combined bits form your unique tracking ID',
    '6. This ID persists even after clearing cookies!',
  ];

  return { subdomains, explanation };
}

/**
 * HSTS Supercookie visualization data for the UI
 */
export interface HSTSVisualization {
  id: string;
  hexId: string;
  bits: Array<{
    index: number;
    value: boolean;
    subdomain: string;
    status: 'set' | 'unset' | 'checking';
  }>;
  persistenceLevel: 'session' | 'persistent' | 'superpersistent';
  survives: {
    cookieClear: boolean;
    privateBrowsing: boolean;
    browserRestart: boolean;
    systemRestart: boolean;
  };
}

/**
 * Generate visualization data for HSTS supercookie demo
 */
export function generateVisualization(value?: string): HSTSVisualization {
  const id = value || generateHSTSValue(32);
  const hexId = binaryToHex(id);

  const bits = id.split('').map((b, index) => ({
    index,
    value: b === '1',
    subdomain: `bit${index}.hsts.panopticlick.org`,
    status: 'set' as const,
  }));

  return {
    id,
    hexId,
    bits,
    persistenceLevel: 'superpersistent',
    survives: {
      cookieClear: true,
      privateBrowsing: false, // Usually isolated in private mode
      browserRestart: true,
      systemRestart: true,
    },
  };
}

/**
 * Compare HSTS supercookie to other tracking methods
 */
export function getTrackingComparison(): Array<{
  method: string;
  persistence: string;
  survivesCookieClear: boolean;
  survivesPrivateMode: boolean;
  detectable: boolean;
  blockable: boolean;
}> {
  return [
    {
      method: 'Regular Cookies',
      persistence: 'Until expiry or clear',
      survivesCookieClear: false,
      survivesPrivateMode: false,
      detectable: true,
      blockable: true,
    },
    {
      method: 'LocalStorage',
      persistence: 'Until clear',
      survivesCookieClear: false,
      survivesPrivateMode: false,
      detectable: true,
      blockable: true,
    },
    {
      method: 'IndexedDB',
      persistence: 'Until clear',
      survivesCookieClear: false,
      survivesPrivateMode: false,
      detectable: true,
      blockable: true,
    },
    {
      method: 'HSTS Supercookie',
      persistence: 'Until HSTS cache clear',
      survivesCookieClear: true,
      survivesPrivateMode: false,
      detectable: false,
      blockable: false,
    },
    {
      method: 'Browser Fingerprint',
      persistence: 'Until config change',
      survivesCookieClear: true,
      survivesPrivateMode: true,
      detectable: false,
      blockable: true,
    },
    {
      method: 'ETags',
      persistence: 'Until cache clear',
      survivesCookieClear: true,
      survivesPrivateMode: false,
      detectable: false,
      blockable: false,
    },
  ];
}
