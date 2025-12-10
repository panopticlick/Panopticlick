/**
 * Defense Analyzer Tests
 */

import { describe, it, expect } from 'vitest';
import { analyzeDefenses, generateHardeningGuide } from '../src/defense';
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

describe('analyzeDefenses', () => {
  it('should return complete defense status', () => {
    const payload = createMockPayload();
    const status = analyzeDefenses(payload);

    expect(status).toHaveProperty('adBlocker');
    expect(status).toHaveProperty('privacyHeaders');
    expect(status).toHaveProperty('fingerprintProtection');
    expect(status).toHaveProperty('networkPrivacy');
    expect(status).toHaveProperty('overallTier');
    expect(status).toHaveProperty('score');
    expect(status).toHaveProperty('recommendations');
  });

  it('should detect ad blocker when provided', () => {
    const payload = createMockPayload();
    const status = analyzeDefenses(payload, { adBlockerDetected: true });

    expect(status.adBlocker.detected).toBe(true);
    expect(status.adBlocker.strength).toBe('standard');
  });

  it('should detect DNT header', () => {
    const payload = createMockPayload({
      software: {
        ...createMockPayload().software,
        doNotTrack: '1',
      },
    });
    const status = analyzeDefenses(payload);

    expect(status.privacyHeaders.doNotTrack).toBe(true);
  });

  it('should detect GPC header', () => {
    const payload = createMockPayload({
      software: {
        ...createMockPayload().software,
        globalPrivacyControl: true,
      },
    });
    const status = analyzeDefenses(payload);

    expect(status.privacyHeaders.globalPrivacyControl).toBe(true);
  });

  it('should detect canvas protection', () => {
    const payload = createMockPayload({
      hardware: {
        ...createMockPayload().hardware,
        canvas: { hash: '', blocked: true, spoofed: false },
      },
    });
    const status = analyzeDefenses(payload);

    expect(status.fingerprintProtection.canvasProtected).toBe(true);
  });

  it('should detect WebGL protection', () => {
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
    const status = analyzeDefenses(payload);

    expect(status.fingerprintProtection.webglProtected).toBe(true);
  });

  it('should detect audio protection', () => {
    const payload = createMockPayload({
      hardware: {
        ...createMockPayload().hardware,
        audio: { hash: '', blocked: true },
      },
    });
    const status = analyzeDefenses(payload);

    expect(status.fingerprintProtection.audioProtected).toBe(true);
  });

  it('should detect fonts protection', () => {
    const payload = createMockPayload({
      software: {
        ...createMockPayload().software,
        fonts: { list: [], count: 0, hash: '' },
      },
    });
    const status = analyzeDefenses(payload);

    expect(status.fingerprintProtection.fontsProtected).toBe(true);
  });

  it('should detect VPN', () => {
    const payload = createMockPayload();
    const status = analyzeDefenses(payload, { vpnDetected: true });

    expect(status.networkPrivacy.vpnDetected).toBe(true);
  });

  it('should detect Tor', () => {
    const payload = createMockPayload();
    const status = analyzeDefenses(payload, { torDetected: true });

    expect(status.networkPrivacy.torDetected).toBe(true);
  });

  it('should calculate score 0-100', () => {
    const payload = createMockPayload();
    const status = analyzeDefenses(payload);

    expect(status.score).toBeGreaterThanOrEqual(0);
    expect(status.score).toBeLessThanOrEqual(100);
  });

  it('should return valid defense tier', () => {
    const payload = createMockPayload();
    const status = analyzeDefenses(payload);

    expect(['exposed', 'basic', 'protected', 'hardened', 'fortress']).toContain(
      status.overallTier
    );
  });

  it('should return higher tier for protected users', () => {
    const unprotectedPayload = createMockPayload();
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
        doNotTrack: '1',
        globalPrivacyControl: true,
        fonts: { list: [], count: 0, hash: '' },
      },
    });

    const unprotectedStatus = analyzeDefenses(unprotectedPayload);
    const protectedStatus = analyzeDefenses(protectedPayload, {
      adBlockerDetected: true,
      vpnDetected: true,
    });

    expect(protectedStatus.score).toBeGreaterThan(unprotectedStatus.score);
  });

  it('should generate recommendations', () => {
    const payload = createMockPayload();
    const status = analyzeDefenses(payload);

    expect(Array.isArray(status.recommendations)).toBe(true);
    expect(status.recommendations.length).toBeGreaterThan(0);
  });

  it('should not recommend ad blocker if already installed', () => {
    const payload = createMockPayload();
    const status = analyzeDefenses(payload, { adBlockerDetected: true });

    const hasAdBlockerRec = status.recommendations.some((r) =>
      r.toLowerCase().includes('ad blocker')
    );
    expect(hasAdBlockerRec).toBe(false);
  });

  it('should not recommend VPN if already using one', () => {
    const payload = createMockPayload();
    const status = analyzeDefenses(payload, { vpnDetected: true });

    const hasVpnRec = status.recommendations.some((r) =>
      r.toLowerCase().includes('vpn')
    );
    expect(hasVpnRec).toBe(false);
  });

  it('should limit recommendations to 5', () => {
    const payload = createMockPayload();
    const status = analyzeDefenses(payload);

    expect(status.recommendations.length).toBeLessThanOrEqual(5);
  });
});

describe('generateHardeningGuide', () => {
  it('should return hardening guide', () => {
    const payload = createMockPayload();
    const guide = generateHardeningGuide(payload);

    expect(guide).toHaveProperty('browserType');
    expect(guide).toHaveProperty('currentLevel');
    expect(guide).toHaveProperty('steps');
    expect(guide).toHaveProperty('estimatedImpact');
  });

  it('should detect Firefox browser', () => {
    const payload = createMockPayload({
      software: {
        ...createMockPayload().software,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; rv:109.0) Gecko/20100101 Firefox/115.0',
      },
    });
    const guide = generateHardeningGuide(payload);

    expect(guide.browserType).toBe('firefox');
  });

  it('should detect Chrome browser', () => {
    const payload = createMockPayload({
      software: {
        ...createMockPayload().software,
        userAgent:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });
    const guide = generateHardeningGuide(payload);

    expect(guide.browserType).toBe('chrome');
  });

  it('should detect Brave browser', () => {
    const payload = createMockPayload({
      software: {
        ...createMockPayload().software,
        userAgent:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Brave/120',
      },
    });
    const guide = generateHardeningGuide(payload);

    expect(guide.browserType).toBe('brave');
  });

  it('should detect Safari browser', () => {
    const payload = createMockPayload({
      software: {
        ...createMockPayload().software,
        userAgent:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_2_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
      },
    });
    const guide = generateHardeningGuide(payload);

    expect(guide.browserType).toBe('safari');
  });

  it('should detect Edge browser', () => {
    const payload = createMockPayload({
      software: {
        ...createMockPayload().software,
        userAgent:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
      },
    });
    const guide = generateHardeningGuide(payload);

    expect(guide.browserType).toBe('edge');
  });

  it('should detect Tor browser', () => {
    const payload = createMockPayload({
      software: {
        ...createMockPayload().software,
        userAgent:
          'Mozilla/5.0 (Windows NT 10.0; rv:102.0) Gecko/20100101 Tor/102.0',
      },
    });
    const guide = generateHardeningGuide(payload);

    expect(guide.browserType).toBe('tor');
  });

  it('should return hardening steps', () => {
    const payload = createMockPayload();
    const guide = generateHardeningGuide(payload);

    expect(Array.isArray(guide.steps)).toBe(true);
    expect(guide.steps.length).toBeGreaterThan(0);
  });

  it('should have valid step structure', () => {
    const payload = createMockPayload();
    const guide = generateHardeningGuide(payload);

    for (const step of guide.steps) {
      expect(step).toHaveProperty('id');
      expect(step).toHaveProperty('title');
      expect(step).toHaveProperty('description');
      expect(step).toHaveProperty('difficulty');
      expect(step).toHaveProperty('impact');
      expect(step).toHaveProperty('instructions');
      expect(['easy', 'medium', 'hard']).toContain(step.difficulty);
      expect(['low', 'medium', 'high']).toContain(step.impact);
      expect(Array.isArray(step.instructions)).toBe(true);
    }
  });

  it('should include uBlock Origin for all browsers', () => {
    const payload = createMockPayload();
    const guide = generateHardeningGuide(payload);

    const hasUblock = guide.steps.some((s) => s.id === 'ublock');
    expect(hasUblock).toBe(true);
  });

  it('should calculate current level 0-100', () => {
    const payload = createMockPayload();
    const guide = generateHardeningGuide(payload);

    expect(guide.currentLevel).toBeGreaterThanOrEqual(0);
    expect(guide.currentLevel).toBeLessThanOrEqual(100);
  });

  it('should calculate estimated impact', () => {
    const payload = createMockPayload();
    const guide = generateHardeningGuide(payload);

    expect(guide.estimatedImpact).toHaveProperty('currentScore');
    expect(guide.estimatedImpact).toHaveProperty('potentialScore');
    expect(guide.estimatedImpact).toHaveProperty('improvement');
    expect(guide.estimatedImpact.potentialScore).toBeGreaterThanOrEqual(
      guide.estimatedImpact.currentScore
    );
    expect(guide.estimatedImpact.improvement).toBeGreaterThanOrEqual(0);
  });

  it('should show higher potential score for unprotected users', () => {
    const payload = createMockPayload();
    const guide = generateHardeningGuide(payload);

    expect(guide.estimatedImpact.improvement).toBeGreaterThan(0);
  });

  it('should include browser-specific steps for Firefox', () => {
    const payload = createMockPayload({
      software: {
        ...createMockPayload().software,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; rv:109.0) Gecko/20100101 Firefox/115.0',
      },
    });
    const guide = generateHardeningGuide(payload);

    const hasETP = guide.steps.some((s) => s.id === 'etp');
    const hasResistFingerprinting = guide.steps.some((s) => s.id === 'resist-fingerprinting');

    expect(hasETP || hasResistFingerprinting).toBe(true);
  });

  it('should include browser-specific steps for Brave', () => {
    const payload = createMockPayload({
      software: {
        ...createMockPayload().software,
        userAgent:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Brave/120',
      },
    });
    const guide = generateHardeningGuide(payload);

    const hasShields = guide.steps.some((s) => s.id === 'shields');
    expect(hasShields).toBe(true);
  });
});
