/**
 * Audio Fingerprint Collector
 * Generates a fingerprint based on AudioContext processing characteristics
 */

import type { AudioFingerprint } from '@panopticlick/types';
import { sha256 } from '../hash';

// AudioContext constructor (with fallbacks for older browsers)
const AudioContextClass = (
  typeof window !== 'undefined'
    ? (window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)
    : null
) as typeof AudioContext | null;

// Known spoofed patterns
const KNOWN_SPOOF_HASHES = new Set([
  '0'.repeat(64),
  'f'.repeat(64),
]);

/**
 * Collect audio fingerprint using Web Audio API
 */
export async function collectAudio(): Promise<AudioFingerprint | null> {
  if (!AudioContextClass) {
    return {
      hash: '',
      sampleRate: 0,
      channelCount: 0,
      blocked: true,
    };
  }

  try {
    const result = await generateAudioFingerprint();
    return result;
  } catch (error) {
    return {
      hash: '',
      sampleRate: 0,
      channelCount: 0,
      blocked: true,
    };
  }
}

/**
 * Generate audio fingerprint using oscillator and dynamics compressor
 */
async function generateAudioFingerprint(): Promise<AudioFingerprint> {
  if (!AudioContextClass) {
    throw new Error('AudioContext not available');
  }
  const audioContext = new AudioContextClass({
    sampleRate: 44100,
  });

  try {
    const sampleRate = audioContext.sampleRate;
    const channelCount = audioContext.destination.maxChannelCount;

    // Create offline context for deterministic rendering
    const offlineContext = new OfflineAudioContext(1, 5000, 44100);

    // Create oscillator
    const oscillator = offlineContext.createOscillator();
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(10000, offlineContext.currentTime);

    // Create dynamics compressor for unique characteristics
    const compressor = offlineContext.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(-50, offlineContext.currentTime);
    compressor.knee.setValueAtTime(40, offlineContext.currentTime);
    compressor.ratio.setValueAtTime(12, offlineContext.currentTime);
    compressor.attack.setValueAtTime(0, offlineContext.currentTime);
    compressor.release.setValueAtTime(0.25, offlineContext.currentTime);

    // Connect nodes
    oscillator.connect(compressor);
    compressor.connect(offlineContext.destination);

    // Start oscillator
    oscillator.start(0);

    // Render audio
    const renderedBuffer = await offlineContext.startRendering();
    const channelData = renderedBuffer.getChannelData(0);

    // Extract audio data for fingerprinting
    // Use a subset of samples that are most distinctive
    const samples: number[] = [];
    const startIndex = 4500; // Skip initial samples
    const sampleCount = 500;

    for (let i = 0; i < sampleCount; i++) {
      samples.push(channelData[startIndex + i]);
    }

    // Calculate statistical features
    const features = calculateAudioFeatures(samples);

    // Create fingerprint hash
    const fingerprintData = {
      sampleRate,
      channelCount,
      samples: samples.slice(0, 100).map(s => s.toFixed(10)),
      features,
    };

    const hash = await sha256(JSON.stringify(fingerprintData));

    // Check for spoofing
    const spoofed = detectAudioSpoofing(hash, samples);

    return {
      hash,
      sampleRate,
      channelCount,
      blocked: spoofed,
    };
  } finally {
    await audioContext.close();
  }
}

/**
 * Calculate statistical features from audio samples
 */
function calculateAudioFeatures(samples: number[]): {
  mean: number;
  variance: number;
  min: number;
  max: number;
  rms: number;
} {
  const n = samples.length;
  let sum = 0;
  let sumSq = 0;
  let min = Infinity;
  let max = -Infinity;

  for (const sample of samples) {
    sum += sample;
    sumSq += sample * sample;
    if (sample < min) min = sample;
    if (sample > max) max = sample;
  }

  const mean = sum / n;
  const variance = sumSq / n - mean * mean;
  const rms = Math.sqrt(sumSq / n);

  return {
    mean: parseFloat(mean.toFixed(10)),
    variance: parseFloat(variance.toFixed(10)),
    min: parseFloat(min.toFixed(10)),
    max: parseFloat(max.toFixed(10)),
    rms: parseFloat(rms.toFixed(10)),
  };
}

/**
 * Detect if audio fingerprint might be spoofed
 */
function detectAudioSpoofing(hash: string, samples: number[]): boolean {
  // Check known spoof patterns
  if (KNOWN_SPOOF_HASHES.has(hash)) {
    return true;
  }

  // Check for all-zero samples (blocked or spoofed)
  const allZero = samples.every(s => s === 0);
  if (allZero) {
    return true;
  }

  // Check for suspiciously uniform samples
  const uniqueValues = new Set(samples.map(s => s.toFixed(6)));
  if (uniqueValues.size < 10) {
    return true;
  }

  // Check for noise injection (random values with no pattern)
  // Real audio processing creates smooth transitions
  let suddenChanges = 0;
  for (let i = 1; i < samples.length; i++) {
    const diff = Math.abs(samples[i] - samples[i - 1]);
    if (diff > 0.5) {
      suddenChanges++;
    }
  }

  // Too many sudden changes indicate random noise injection
  if (suddenChanges > samples.length * 0.1) {
    return true;
  }

  return false;
}

/**
 * Verify audio fingerprint stability
 */
export async function verifyAudioStability(): Promise<boolean> {
  const hashes: string[] = [];

  for (let i = 0; i < 3; i++) {
    const result = await collectAudio();
    if (result && !result.blocked) {
      hashes.push(result.hash);
    }
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  if (hashes.length < 3) {
    return false;
  }

  // All hashes should be identical for stable fingerprint
  return hashes.every(h => h === hashes[0]);
}

/**
 * Get audio processing capabilities info
 */
export function getAudioCapabilities(): {
  supported: boolean;
  worklet: boolean;
  offline: boolean;
  channels: number;
} {
  if (!AudioContextClass) {
    return {
      supported: false,
      worklet: false,
      offline: false,
      channels: 0,
    };
  }

  let worklet = false;
  let channels = 2;

  try {
    const ctx = new AudioContextClass();
    worklet = 'audioWorklet' in ctx;
    channels = ctx.destination.maxChannelCount;
    ctx.close();
  } catch {
    // Ignore errors
  }

  return {
    supported: true,
    worklet,
    offline: typeof OfflineAudioContext !== 'undefined',
    channels,
  };
}
