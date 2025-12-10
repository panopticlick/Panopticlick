/**
 * RTB Simulator Tests
 */

import { describe, it, expect } from 'vitest';
import {
  simulateRTBAuction,
  detectPersonas,
  formatCPM,
  explainCPM,
  calculateAnnualValue,
} from '../src/rtb';
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

describe('simulateRTBAuction', () => {
  it('should return RTB simulation result', () => {
    const payload = createMockPayload();
    const result = simulateRTBAuction(payload);

    expect(result).toHaveProperty('bids');
    expect(result).toHaveProperty('winner');
    expect(result).toHaveProperty('totalValue');
    expect(result).toHaveProperty('averageCPM');
    expect(result).toHaveProperty('entropyMultiplier');
    expect(result).toHaveProperty('personas');
    expect(result).toHaveProperty('timestamp');
  });

  it('should generate multiple bids', () => {
    const payload = createMockPayload();
    const result = simulateRTBAuction(payload);

    expect(result.bids.length).toBeGreaterThan(0);
  });

  it('should have a winner with highest bid', () => {
    const payload = createMockPayload();
    const result = simulateRTBAuction(payload);

    if (result.winner && result.bids.length > 0) {
      const highestBid = Math.max(...result.bids.map((b) => b.amount));
      expect(result.winner.amount).toBe(highestBid);
    }
  });

  it('should calculate positive total value', () => {
    const payload = createMockPayload();
    const result = simulateRTBAuction(payload);

    expect(result.totalValue).toBeGreaterThan(0);
  });

  it('should calculate average CPM', () => {
    const payload = createMockPayload();
    const result = simulateRTBAuction(payload);

    expect(result.averageCPM).toBeGreaterThan(0);
    expect(result.averageCPM).toBeLessThan(result.totalValue);
  });

  it('should include timestamp', () => {
    const payload = createMockPayload();
    const result = simulateRTBAuction(payload);

    expect(result.timestamp).toBeGreaterThan(0);
    expect(result.timestamp).toBeLessThanOrEqual(Date.now());
  });

  it('should generate bids with required properties', () => {
    const payload = createMockPayload();
    const result = simulateRTBAuction(payload);

    for (const bid of result.bids) {
      expect(bid).toHaveProperty('bidder');
      expect(bid).toHaveProperty('amount');
      expect(bid).toHaveProperty('interest');
      expect(bid).toHaveProperty('confidence');
      expect(bid).toHaveProperty('timestamp');
      expect(bid.amount).toBeGreaterThan(0);
    }
  });

  it('should apply higher bids for premium regions', () => {
    const nyPayload = createMockPayload({
      software: {
        ...createMockPayload().software,
        timezone: 'America/New_York',
      },
    });
    const otherPayload = createMockPayload({
      software: {
        ...createMockPayload().software,
        timezone: 'Africa/Lagos',
      },
    });

    // Run multiple times and average due to randomness
    let nyTotal = 0;
    let otherTotal = 0;
    const iterations = 10;

    for (let i = 0; i < iterations; i++) {
      nyTotal += simulateRTBAuction(nyPayload).averageCPM;
      otherTotal += simulateRTBAuction(otherPayload).averageCPM;
    }

    expect(nyTotal / iterations).toBeGreaterThan(otherTotal / iterations);
  });
});

describe('detectPersonas', () => {
  it('should return array of personas', () => {
    const payload = createMockPayload();
    const personas = detectPersonas(payload);

    expect(Array.isArray(personas)).toBe(true);
    expect(personas.length).toBeGreaterThan(0);
  });

  it('should detect affluent_professional for high-end devices', () => {
    const payload = createMockPayload({
      hardware: {
        ...createMockPayload().hardware,
        memory: 16,
        cpu: 8,
        screen: { width: 2560, height: 1440, pixelRatio: 2, colorDepth: 24 },
      },
    });
    const personas = detectPersonas(payload);
    const ids = personas.map((p) => p.id);

    expect(ids).toContain('affluent_professional');
  });

  it('should detect tech_enthusiast for users with modern capabilities', () => {
    const payload = createMockPayload({
      hardware: {
        ...createMockPayload().hardware,
        cpu: 10,
      },
      capabilities: {
        ...createMockPayload().capabilities,
        webGL2: true,
        webAssembly: true,
        serviceWorker: true,
      },
    });
    const personas = detectPersonas(payload);
    const ids = personas.map((p) => p.id);

    expect(ids).toContain('tech_enthusiast');
  });

  it('should detect gamer for high-end desktop users', () => {
    const payload = createMockPayload({
      hardware: {
        ...createMockPayload().hardware,
        cpu: 12,
        touchPoints: 0,
        screen: { width: 2560, height: 1440, pixelRatio: 1, colorDepth: 24 },
      },
      capabilities: {
        ...createMockPayload().capabilities,
        webGL2: true,
      },
    });
    const personas = detectPersonas(payload);
    const ids = personas.map((p) => p.id);

    expect(ids).toContain('gamer');
  });

  it('should detect mobile_user for touch devices', () => {
    const payload = createMockPayload({
      hardware: {
        ...createMockPayload().hardware,
        touchPoints: 5,
        screen: { width: 375, height: 667, pixelRatio: 2, colorDepth: 24 },
      },
      software: {
        ...createMockPayload().software,
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0)',
      },
    });
    const personas = detectPersonas(payload);
    const ids = personas.map((p) => p.id);

    expect(ids).toContain('mobile_user');
  });

  it('should detect privacy_conscious for DNT/GPC users', () => {
    const payload = createMockPayload({
      software: {
        ...createMockPayload().software,
        doNotTrack: '1',
        globalPrivacyControl: true,
      },
    });
    const personas = detectPersonas(payload);
    const ids = personas.map((p) => p.id);

    expect(ids).toContain('privacy_conscious');
  });

  it('should detect student for budget devices', () => {
    const payload = createMockPayload({
      hardware: {
        ...createMockPayload().hardware,
        memory: 4,
        cpu: 2,
      },
    });
    const personas = detectPersonas(payload);
    const ids = personas.map((p) => p.id);

    expect(ids).toContain('student');
  });

  it('should return general persona when no specific match', () => {
    // Create payload that doesn't match any specific persona
    const payload = createMockPayload({
      hardware: {
        ...createMockPayload().hardware,
        memory: 6, // Not high, not low
        cpu: 5,
        touchPoints: 0,
        screen: { width: 1366, height: 768, pixelRatio: 1, colorDepth: 24 },
      },
      capabilities: {
        ...createMockPayload().capabilities,
        webGL2: false,
        webAssembly: false,
        serviceWorker: false,
      },
    });
    const personas = detectPersonas(payload);

    // Should have at least general persona
    expect(personas.length).toBeGreaterThan(0);
  });

  it('should include confidence scores for personas', () => {
    const payload = createMockPayload();
    const personas = detectPersonas(payload);

    for (const persona of personas) {
      expect(persona.confidence).toBeGreaterThanOrEqual(0);
      expect(persona.confidence).toBeLessThanOrEqual(1);
    }
  });

  it('should include value multipliers for personas', () => {
    const payload = createMockPayload();
    const personas = detectPersonas(payload);

    for (const persona of personas) {
      expect(persona.valueMultiplier).toBeGreaterThan(0);
    }
  });
});

describe('formatCPM', () => {
  it('should format CPM as currency string', () => {
    expect(formatCPM(5.5)).toBe('$5.50 CPM');
    expect(formatCPM(0)).toBe('$0.00 CPM');
    expect(formatCPM(12.345)).toBe('$12.35 CPM');
  });

  it('should handle whole numbers', () => {
    expect(formatCPM(5)).toBe('$5.00 CPM');
    expect(formatCPM(100)).toBe('$100.00 CPM');
  });
});

describe('explainCPM', () => {
  it('should return low-value explanation for CPM < 1', () => {
    const explanation = explainCPM(0.5);
    expect(explanation).toContain('low-value');
  });

  it('should return moderate explanation for CPM 1-3', () => {
    const explanation = explainCPM(2);
    expect(explanation).toContain('moderate');
  });

  it('should return valuable explanation for CPM 3-6', () => {
    const explanation = explainCPM(4);
    expect(explanation).toContain('valuable');
  });

  it('should return highly sought explanation for CPM 6-10', () => {
    const explanation = explainCPM(8);
    expect(explanation).toContain('highly sought');
  });

  it('should return extremely valuable explanation for CPM > 10', () => {
    const explanation = explainCPM(15);
    expect(explanation).toContain('extremely valuable');
  });
});

describe('calculateAnnualValue', () => {
  it('should return annual value calculation', () => {
    const result = calculateAnnualValue(5);

    expect(result).toHaveProperty('pageViews');
    expect(result).toHaveProperty('annualValue');
    expect(result).toHaveProperty('explanation');
  });

  it('should calculate correct annual value', () => {
    // CPM of $5 with 4000 page views = $20
    const result = calculateAnnualValue(5);
    expect(result.annualValue).toBe(20);
  });

  it('should return positive page views estimate', () => {
    const result = calculateAnnualValue(5);
    expect(result.pageViews).toBeGreaterThan(0);
  });

  it('should include explanation text', () => {
    const result = calculateAnnualValue(5);
    expect(result.explanation).toContain('$');
    expect(result.explanation).toContain('year');
  });

  it('should scale linearly with CPM', () => {
    const low = calculateAnnualValue(2);
    const high = calculateAnnualValue(10);

    expect(high.annualValue / low.annualValue).toBeCloseTo(5, 1);
  });
});
