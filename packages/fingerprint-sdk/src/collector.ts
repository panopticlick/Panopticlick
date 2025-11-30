/**
 * Main Fingerprint Collector
 * Orchestrates all fingerprint collectors and produces a complete fingerprint payload
 */

import type {
  FingerprintPayload,
  FingerprintMeta,
  HardwareSignals,
  SoftwareSignals,
  CapabilitySignals,
  NetworkSignals,
  HashResult,
} from '@panopticlick/types';

import {
  collectCanvas,
  collectWebGL,
  collectAudio,
  collectScreen,
  collectFonts,
  collectSoftwareSignals,
  collectCapabilitySignals,
  collectNetworkSignals,
} from './collectors';

import { sha256, combineHashes, generateSessionId } from './hash';

// SDK Version
const SDK_VERSION = '1.0.0';

/**
 * Collector configuration options
 */
export interface CollectorOptions {
  /**
   * Session ID to use (generates new one if not provided)
   */
  sessionId?: string;

  /**
   * Timeout for async collectors in milliseconds
   * @default 5000
   */
  timeout?: number;

  /**
   * Whether user has given consent for fingerprinting
   * @default false
   */
  consentGiven?: boolean;

  /**
   * Enable debug logging
   * @default false
   */
  debug?: boolean;

  /**
   * Skip specific collectors
   */
  skip?: {
    canvas?: boolean;
    webgl?: boolean;
    audio?: boolean;
    fonts?: boolean;
  };
}

/**
 * Collect complete browser fingerprint
 */
export async function collectFingerprint(
  options: CollectorOptions = {}
): Promise<FingerprintPayload> {
  const startTime = performance.now();

  const {
    sessionId = generateSessionId(),
    timeout = 5000,
    consentGiven = false,
    debug = false,
    skip = {},
  } = options;

  const log = debug
    ? (msg: string) => console.log(`[Fingerprint SDK] ${msg}`)
    : () => {};

  log('Starting fingerprint collection...');

  // Collect all signals in parallel where possible
  const [hardware, software, capabilities, network] = await Promise.all([
    collectHardwareSignals(timeout, skip, log),
    collectSoftware(log),
    collectCapabilities(log),
    collectNetwork(log),
  ]);

  const collectDuration = Math.round(performance.now() - startTime);
  log(`Collection complete in ${collectDuration}ms`);

  // Build metadata
  const meta: FingerprintMeta = {
    sessionId,
    timestamp: Date.now(),
    collectDuration,
    sdkVersion: SDK_VERSION,
    consentGiven,
  };

  return {
    meta,
    hardware,
    software,
    capabilities,
    network,
  };
}

/**
 * Collect hardware signals
 */
async function collectHardwareSignals(
  timeout: number,
  skip: CollectorOptions['skip'] = {},
  log: (msg: string) => void
): Promise<HardwareSignals> {
  log('Collecting hardware signals...');

  // Create timeout wrapper
  const withTimeout = <T>(promise: Promise<T>, fallback: T): Promise<T> =>
    Promise.race([
      promise,
      new Promise<T>((resolve) => setTimeout(() => resolve(fallback), timeout)),
    ]);

  // Collect async signals in parallel
  const [canvas, webgl, audio, fonts, screen] = await Promise.all([
    skip.canvas
      ? Promise.resolve(null)
      : withTimeout(collectCanvas(), null).catch(() => null),
    skip.webgl
      ? Promise.resolve(null)
      : withTimeout(collectWebGL(), null).catch(() => null),
    skip.audio
      ? Promise.resolve(null)
      : withTimeout(collectAudio(), null).catch(() => null),
    skip.fonts
      ? Promise.resolve(null)
      : withTimeout(collectFonts(), null).catch(() => null),
    Promise.resolve(collectScreen()),
  ]);

  log(`Canvas: ${canvas ? 'collected' : 'skipped/failed'}`);
  log(`WebGL: ${webgl ? 'collected' : 'skipped/failed'}`);
  log(`Audio: ${audio ? 'collected' : 'skipped/failed'}`);
  log(`Fonts: ${fonts ? fonts.count + ' fonts' : 'skipped/failed'}`);

  // Get CPU cores
  const cpu = typeof navigator !== 'undefined' ? navigator.hardwareConcurrency || 0 : 0;

  // Get device memory
  const memory =
    typeof navigator !== 'undefined' && 'deviceMemory' in navigator
      ? (navigator as unknown as { deviceMemory: number }).deviceMemory
      : null;

  // Get touch points
  const touchPoints =
    typeof navigator !== 'undefined' ? navigator.maxTouchPoints || 0 : 0;

  // Get GPU info from WebGL
  const gpu = webgl
    ? {
        vendor: webgl.vendor,
        renderer: webgl.renderer,
      }
    : null;

  return {
    canvas,
    webgl,
    audio,
    screen,
    cpu,
    memory,
    touchPoints,
    gpu,
  };
}

/**
 * Collect software signals
 */
async function collectSoftware(
  log: (msg: string) => void
): Promise<SoftwareSignals> {
  log('Collecting software signals...');
  return collectSoftwareSignals();
}

/**
 * Collect capability signals
 */
async function collectCapabilities(
  log: (msg: string) => void
): Promise<CapabilitySignals> {
  log('Collecting capability signals...');
  return collectCapabilitySignals();
}

/**
 * Collect network signals
 */
async function collectNetwork(log: (msg: string) => void): Promise<NetworkSignals> {
  log('Collecting network signals...');
  return collectNetworkSignals();
}

/**
 * Generate fingerprint hashes from payload
 */
export async function generateHashes(
  payload: FingerprintPayload
): Promise<HashResult> {
  const { hardware, software, capabilities } = payload;

  // Hardware hash - GPU, canvas, audio, screen
  const hardwareComponents = [
    hardware.canvas?.hash,
    hardware.webgl?.hash,
    hardware.audio?.hash,
    `${hardware.screen.width}x${hardware.screen.height}@${hardware.screen.pixelRatio}`,
    hardware.gpu?.vendor,
    hardware.gpu?.renderer,
    String(hardware.cpu),
    String(hardware.memory),
    String(hardware.touchPoints),
  ];

  const hardwareHash = await combineHashes(...hardwareComponents);

  // Software hash - user agent, timezone, language, fonts
  const softwareComponents = [
    software.userAgent,
    software.platform,
    software.timezone,
    software.language,
    software.languages.join(','),
    software.fonts?.hash,
    software.plugins.map((p) => p.name).join(','),
    String(software.cookiesEnabled),
    software.doNotTrack,
  ];

  const softwareHash = await combineHashes(...softwareComponents);

  // Full hash combines everything
  const fullHash = await sha256(hardwareHash + softwareHash);

  // Calculate confidence based on available signals
  const confidence = calculateConfidence(payload);

  return {
    hardwareHash,
    softwareHash,
    fullHash,
    confidence,
  };
}

/**
 * Calculate fingerprint confidence score (0-1)
 */
function calculateConfidence(payload: FingerprintPayload): number {
  let points = 0;
  let maxPoints = 0;

  const { hardware, software, capabilities } = payload;

  // Hardware signals (weighted heavily)
  maxPoints += 30;
  if (hardware.canvas && !hardware.canvas.blocked) points += 10;
  if (hardware.webgl && !hardware.webgl.blocked) points += 10;
  if (hardware.audio && !hardware.audio.blocked) points += 5;
  if (hardware.gpu) points += 5;

  // Screen info (always available)
  maxPoints += 10;
  if (hardware.screen.width > 0) points += 10;

  // CPU/Memory
  maxPoints += 10;
  if (hardware.cpu > 0) points += 5;
  if (hardware.memory !== null) points += 5;

  // Software signals
  maxPoints += 20;
  if (software.userAgent) points += 5;
  if (software.timezone !== 'Unknown') points += 5;
  if (software.fonts && software.fonts.count > 0) points += 10;

  // Plugins
  maxPoints += 5;
  if (software.plugins.length > 0) points += 5;

  // Capabilities
  maxPoints += 15;
  if (capabilities.localStorage) points += 3;
  if (capabilities.sessionStorage) points += 2;
  if (capabilities.indexedDB) points += 2;
  if (capabilities.webGL) points += 3;
  if (capabilities.webRTC) points += 3;
  if (capabilities.webAssembly) points += 2;

  // Privacy signals
  maxPoints += 10;
  if (software.doNotTrack !== null) points += 5;
  if (software.globalPrivacyControl !== null) points += 5;

  return Math.round((points / maxPoints) * 100) / 100;
}

/**
 * Quick fingerprint - faster but less detailed
 */
export async function quickFingerprint(): Promise<{
  hash: string;
  confidence: number;
}> {
  const payload = await collectFingerprint({
    timeout: 2000,
    skip: {
      audio: true,
      fonts: true,
    },
  });

  const hashes = await generateHashes(payload);

  return {
    hash: hashes.fullHash,
    confidence: hashes.confidence,
  };
}

/**
 * Check if fingerprinting is likely blocked
 */
export async function detectBlocking(): Promise<{
  blocked: boolean;
  canvasBlocked: boolean;
  webglBlocked: boolean;
  audioBlocked: boolean;
  fontsBlocked: boolean;
  reason: string | null;
}> {
  const [canvas, webgl, audio, fonts] = await Promise.all([
    collectCanvas().catch(() => null),
    collectWebGL().catch(() => null),
    collectAudio().catch(() => null),
    collectFonts().catch(() => null),
  ]);

  const canvasBlocked = !canvas || canvas.blocked;
  const webglBlocked = !webgl || webgl.blocked;
  const audioBlocked = !audio || audio.blocked;
  const fontsBlocked = !fonts || fonts.count === 0;

  const blockedCount = [canvasBlocked, webglBlocked, audioBlocked, fontsBlocked].filter(
    Boolean
  ).length;

  let reason: string | null = null;
  if (blockedCount >= 3) {
    reason = 'Fingerprint protection extension detected';
  } else if (canvasBlocked && webglBlocked) {
    reason = 'Canvas and WebGL blocked (likely CanvasBlocker)';
  } else if (audioBlocked && canvasBlocked) {
    reason = 'Audio and Canvas blocked (likely Brave or Firefox strict mode)';
  }

  return {
    blocked: blockedCount >= 2,
    canvasBlocked,
    webglBlocked,
    audioBlocked,
    fontsBlocked,
    reason,
  };
}

/**
 * Estimate entropy of the fingerprint
 * Returns bits of entropy
 */
export function estimateEntropy(payload: FingerprintPayload): number {
  let entropy = 0;
  const { hardware, software, capabilities } = payload;

  // Canvas entropy (~10-20 bits)
  if (hardware.canvas && !hardware.canvas.blocked) {
    entropy += hardware.canvas.spoofed ? 2 : 15;
  }

  // WebGL entropy (~12-18 bits)
  if (hardware.webgl && !hardware.webgl.blocked) {
    entropy += 12;
    // Unique GPU adds entropy
    if (hardware.webgl.renderer) {
      entropy += 4;
    }
  }

  // Audio entropy (~8-12 bits)
  if (hardware.audio && !hardware.audio.blocked) {
    entropy += 10;
  }

  // Screen entropy (~4-8 bits)
  const commonResolutions = [
    [1920, 1080],
    [1366, 768],
    [1536, 864],
    [2560, 1440],
  ];
  const isCommonRes = commonResolutions.some(
    ([w, h]) =>
      hardware.screen.width === w && hardware.screen.height === h
  );
  entropy += isCommonRes ? 4 : 7;

  // Pixel ratio (~1-3 bits)
  entropy += hardware.screen.pixelRatio === 1 ? 1 : 2;

  // Fonts entropy (~8-15 bits)
  if (software.fonts && software.fonts.count > 0) {
    entropy += Math.min(Math.log2(software.fonts.count + 1) * 3, 12);
  }

  // Timezone (~5-8 bits)
  entropy += 5;

  // Language (~3-5 bits)
  entropy += 3;

  // User agent (~10-15 bits)
  entropy += 10;

  // Plugins (~2-5 bits)
  if (software.plugins.length > 0) {
    entropy += Math.min(software.plugins.length, 5);
  }

  // CPU cores (~2-4 bits)
  entropy += hardware.cpu > 4 ? 3 : 2;

  // Memory (~2-3 bits)
  if (hardware.memory) {
    entropy += 2;
  }

  // Touch points (~1-2 bits)
  entropy += hardware.touchPoints > 0 ? 2 : 1;

  // Capabilities (~3-5 bits)
  const capsCount = Object.values(capabilities).filter(Boolean).length;
  entropy += Math.min(Math.log2(capsCount + 1) * 2, 4);

  return Math.round(entropy);
}
