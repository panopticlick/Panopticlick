/**
 * Entropy Calculator Tests
 */

import { describe, it, expect } from 'vitest';
import {
  calculateEntropy,
  calculateEntropyBreakdown,
  generateEntropyReport,
  compareToAverage,
} from '../src/entropy';
import type { FingerprintPayload } from '@panopticlick/types';

// Mock fingerprint payload for testing
const createMockPayload = (overrides?: Partial<FingerprintPayload>): FingerprintPayload => ({
  hardware: {
    screen: { width: 1920, height: 1080, pixelRatio: 2, colorDepth: 24 },
    canvas: { hash: 'abc123', blocked: false, spoofed: false },
    webgl: {
      vendor: 'Google Inc. (Apple)',
      renderer: 'ANGLE (Apple, Apple M1 Pro, OpenGL 4.1)',
      extensions: ['OES_texture_float', 'WEBGL_lose_context'],
      maxTextureSize: 16384,
      hash: 'webgl123',
      blocked: false,
    },
    audio: { hash: 'audio123', blocked: false },
    fonts: { hash: 'fonts123' },
    cpu: 8,
    memory: 16,
    touchPoints: 0,
  },
  software: {
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    platform: 'MacIntel',
    language: 'en-US',
    languages: ['en-US', 'en'],
    timezone: 'America/New_York',
    timezoneOffset: -300,
    doNotTrack: null,
    globalPrivacyControl: false,
    cookiesEnabled: true,
    plugins: [],
    fonts: { list: ['Arial', 'Helvetica'], count: 2, hash: 'fontshash' },
  },
  capabilities: {
    webGL: true,
    webGL2: true,
    webAssembly: true,
    serviceWorker: true,
    localStorage: true,
    sessionStorage: true,
    indexedDB: true,
    webRTC: true,
    audioContext: true,
    canvas2D: true,
    geolocation: true,
    notifications: true,
    bluetooth: false,
    usb: false,
    midi: false,
    pdf: true,
    vibration: false,
    batteryAPI: false,
    deviceMotion: false,
    deviceOrientation: false,
    mediaDevices: true,
    speechSynthesis: true,
    speechRecognition: true,
    credentialsAPI: true,
    paymentRequest: false,
    gamepad: false,
    webVR: false,
    webXR: false,
  },
  network: {
    connectionType: 'wifi',
    effectiveType: '4g',
    downlink: 10,
    rtt: 50,
  },
  meta: {
    timestamp: Date.now(),
    collectionTime: 100,
    consentGiven: true,
    version: '1.0.0',
  },
  ...overrides,
});

describe('calculateEntropy', () => {
  it('should return 0 for probability <= 0', () => {
    expect(calculateEntropy(0)).toBe(0);
    expect(calculateEntropy(-1)).toBe(0);
  });

  it('should return 0 for probability >= 1', () => {
    expect(calculateEntropy(1)).toBe(0);
    expect(calculateEntropy(1.5)).toBe(0);
  });

  it('should calculate correct entropy for common probabilities', () => {
    // 50% probability = 1 bit
    expect(calculateEntropy(0.5)).toBeCloseTo(1, 5);
    // 25% probability = 2 bits
    expect(calculateEntropy(0.25)).toBeCloseTo(2, 5);
    // 12.5% probability = 3 bits
    expect(calculateEntropy(0.125)).toBeCloseTo(3, 5);
  });

  it('should return higher entropy for lower probabilities', () => {
    const highProb = calculateEntropy(0.5);
    const lowProb = calculateEntropy(0.1);
    expect(lowProb).toBeGreaterThan(highProb);
  });
});

describe('calculateEntropyBreakdown', () => {
  it('should return breakdown for all fingerprint components', () => {
    const payload = createMockPayload();
    const breakdown = calculateEntropyBreakdown(payload);

    expect(breakdown).toHaveProperty('canvas');
    expect(breakdown).toHaveProperty('webgl');
    expect(breakdown).toHaveProperty('audio');
    expect(breakdown).toHaveProperty('screen');
    expect(breakdown).toHaveProperty('fonts');
    expect(breakdown).toHaveProperty('timezone');
    expect(breakdown).toHaveProperty('language');
    expect(breakdown).toHaveProperty('platform');
    expect(breakdown).toHaveProperty('plugins');
    expect(breakdown).toHaveProperty('userAgent');
    expect(breakdown).toHaveProperty('cpu');
    expect(breakdown).toHaveProperty('memory');
    expect(breakdown).toHaveProperty('touchPoints');
    expect(breakdown).toHaveProperty('capabilities');
    expect(breakdown).toHaveProperty('total');
  });

  it('should calculate total as sum of all components', () => {
    const payload = createMockPayload();
    const breakdown = calculateEntropyBreakdown(payload);

    const componentSum =
      breakdown.canvas.bits +
      breakdown.webgl.bits +
      breakdown.audio.bits +
      breakdown.screen.bits +
      breakdown.fonts.bits +
      breakdown.timezone.bits +
      breakdown.language.bits +
      breakdown.platform.bits +
      breakdown.plugins.bits +
      breakdown.userAgent.bits +
      breakdown.cpu.bits +
      breakdown.memory.bits +
      breakdown.touchPoints.bits +
      breakdown.capabilities.bits;

    expect(breakdown.total.bits).toBeCloseTo(componentSum, 0);
  });

  it('should return 0 bits for blocked canvas', () => {
    const payload = createMockPayload({
      hardware: {
        ...createMockPayload().hardware,
        canvas: { hash: '', blocked: true, spoofed: false },
      },
    });
    const breakdown = calculateEntropyBreakdown(payload);
    expect(breakdown.canvas.bits).toBe(0);
  });

  it('should return 0 bits for spoofed canvas', () => {
    const payload = createMockPayload({
      hardware: {
        ...createMockPayload().hardware,
        canvas: { hash: 'fake', blocked: false, spoofed: true },
      },
    });
    const breakdown = calculateEntropyBreakdown(payload);
    expect(breakdown.canvas.bits).toBe(0);
  });

  it('should return 0 bits for blocked WebGL', () => {
    const payload = createMockPayload({
      hardware: {
        ...createMockPayload().hardware,
        webgl: {
          vendor: '',
          renderer: '',
          extensions: [],
          maxTextureSize: 0,
          hash: '',
          blocked: true,
        },
      },
    });
    const breakdown = calculateEntropyBreakdown(payload);
    expect(breakdown.webgl.bits).toBe(0);
  });

  it('should calculate higher entropy for rare screen resolutions', () => {
    const commonPayload = createMockPayload({
      hardware: {
        ...createMockPayload().hardware,
        screen: { width: 1920, height: 1080, pixelRatio: 1, colorDepth: 24 },
      },
    });
    const rarePayload = createMockPayload({
      hardware: {
        ...createMockPayload().hardware,
        screen: { width: 2560, height: 1600, pixelRatio: 3, colorDepth: 24 },
      },
    });

    const commonBreakdown = calculateEntropyBreakdown(commonPayload);
    const rareBreakdown = calculateEntropyBreakdown(rarePayload);

    expect(rareBreakdown.screen.bits).toBeGreaterThan(commonBreakdown.screen.bits);
  });
});

describe('generateEntropyReport', () => {
  it('should generate complete entropy report', () => {
    const payload = createMockPayload();
    const report = generateEntropyReport(payload);

    expect(report).toHaveProperty('totalBits');
    expect(report).toHaveProperty('uniqueness');
    expect(report).toHaveProperty('population');
    expect(report).toHaveProperty('tier');
    expect(report).toHaveProperty('breakdown');
  });

  it('should return valid tier for different entropy levels', () => {
    const payload = createMockPayload();
    const report = generateEntropyReport(payload);

    expect(['low', 'medium', 'high', 'very_high', 'unique']).toContain(report.tier);
  });

  it('should calculate uniqueness as percentage', () => {
    const payload = createMockPayload();
    const report = generateEntropyReport(payload);

    expect(report.uniqueness).toBeGreaterThanOrEqual(0);
    expect(report.uniqueness).toBeLessThanOrEqual(100);
  });

  it('should estimate population size as positive number', () => {
    const payload = createMockPayload();
    const report = generateEntropyReport(payload);

    expect(report.population).toBeGreaterThan(0);
  });

  it('should return higher tier for more unique fingerprints', () => {
    // Low entropy payload (protected)
    const protectedPayload = createMockPayload({
      hardware: {
        ...createMockPayload().hardware,
        canvas: { hash: '', blocked: true, spoofed: false },
        webgl: {
          vendor: '',
          renderer: '',
          extensions: [],
          maxTextureSize: 0,
          hash: '',
          blocked: true,
        },
        audio: { hash: '', blocked: true },
      },
      software: {
        ...createMockPayload().software,
        fonts: { list: [], count: 0, hash: '' },
      },
    });

    const normalReport = generateEntropyReport(createMockPayload());
    const protectedReport = generateEntropyReport(protectedPayload);

    expect(normalReport.totalBits).toBeGreaterThan(protectedReport.totalBits);
  });
});

describe('compareToAverage', () => {
  it('should return percentile between 0 and 100', () => {
    const result = compareToAverage(30);
    expect(result.percentile).toBeGreaterThanOrEqual(0);
    expect(result.percentile).toBeLessThanOrEqual(100);
  });

  it('should return below_average for low entropy', () => {
    const result = compareToAverage(10);
    expect(result.comparison).toBe('below_average');
  });

  it('should return average for typical entropy', () => {
    const result = compareToAverage(27);
    expect(result.comparison).toBe('average');
  });

  it('should return above_average for high entropy', () => {
    const result = compareToAverage(38);
    expect(result.comparison).toBe('above_average');
  });

  it('should return exceptional for very high entropy', () => {
    const result = compareToAverage(50);
    expect(result.comparison).toBe('exceptional');
  });

  it('should return higher percentile for higher entropy', () => {
    const lowResult = compareToAverage(20);
    const highResult = compareToAverage(40);
    expect(highResult.percentile).toBeGreaterThan(lowResult.percentile);
  });
});
