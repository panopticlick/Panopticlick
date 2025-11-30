/**
 * Canvas Fingerprint Collector
 * Generates a unique fingerprint based on how the browser renders canvas elements
 */

import type { CanvasFingerprint } from '@panopticlick/types';
import { sha256 } from '../hash';

// Known spoofed hash patterns
const KNOWN_SPOOF_PATTERNS = [
  /^0{32,}$/,           // All zeros
  /^f{32,}$/i,          // All F's
  /canvasblocker/i,     // CanvasBlocker signature
  /privacy/i,           // Generic privacy tool
];

/**
 * Collect canvas fingerprint
 */
export async function collectCanvas(): Promise<CanvasFingerprint | null> {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 280;
    canvas.height = 60;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return {
        hash: '',
        blocked: true,
        spoofed: false,
      };
    }

    // Draw deterministic pattern for fingerprinting
    drawFingerprintPattern(ctx, canvas.width, canvas.height);

    // Get the data URL
    const dataUrl = canvas.toDataURL('image/png');

    // Check if blocked (too short means canvas was blocked)
    const blocked = dataUrl.length < 1000 || dataUrl === 'data:,';

    if (blocked) {
      return {
        hash: '',
        blocked: true,
        spoofed: false,
      };
    }

    // Generate hash
    const hash = await sha256(dataUrl);

    // Check for spoofing
    const spoofed = detectSpoofing(hash, dataUrl);

    return {
      hash,
      dataUrl: dataUrl.length < 10000 ? dataUrl : undefined, // Only include if not too large
      blocked: false,
      spoofed,
    };
  } catch (error) {
    return {
      hash: '',
      blocked: true,
      spoofed: false,
    };
  }
}

/**
 * Draw a deterministic pattern for fingerprinting
 */
function drawFingerprintPattern(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): void {
  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, width, 0);
  gradient.addColorStop(0, '#ff6600');
  gradient.addColorStop(0.5, '#0066ff');
  gradient.addColorStop(1, '#00ff66');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Text with various fonts and styles
  ctx.textBaseline = 'alphabetic';

  // First text line
  ctx.fillStyle = '#069';
  ctx.font = '11pt "Times New Roman"';
  ctx.fillText('Cwm fjordbank glyphs vext quiz, 😃', 2, 15);

  // Second text line with different font
  ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
  ctx.font = '18pt Arial';
  ctx.fillText('Cwm fjordbank glyphs vext quiz, 😃', 4, 45);

  // Geometric shapes
  ctx.beginPath();
  ctx.arc(50, 50, 25, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
  ctx.fill();

  // Rectangle with shadow
  ctx.shadowBlur = 10;
  ctx.shadowColor = 'blue';
  ctx.fillStyle = 'rgba(0, 255, 0, 0.5)';
  ctx.fillRect(200, 20, 50, 30);

  // Reset shadow
  ctx.shadowBlur = 0;

  // Bezier curve
  ctx.beginPath();
  ctx.moveTo(100, 50);
  ctx.bezierCurveTo(130, 10, 150, 50, 180, 20);
  ctx.strokeStyle = 'purple';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Additional distinguishing marks
  ctx.globalCompositeOperation = 'multiply';
  ctx.fillStyle = 'rgb(255, 0, 255)';
  ctx.fillRect(50, 10, 80, 30);

  // Reset composite operation
  ctx.globalCompositeOperation = 'source-over';
}

/**
 * Detect if the canvas fingerprint has been spoofed
 */
function detectSpoofing(hash: string, dataUrl: string): boolean {
  // Check known patterns
  if (KNOWN_SPOOF_PATTERNS.some((pattern) => pattern.test(hash))) {
    return true;
  }

  // Check for suspiciously short data URL
  if (dataUrl.length < 500) {
    return true;
  }

  // Check for uniform pixel data (would indicate spoofing)
  // This is a heuristic - real canvases have varying pixel values
  const base64Data = dataUrl.split(',')[1];
  if (base64Data) {
    const uniqueChars = new Set(base64Data.slice(0, 100)).size;
    if (uniqueChars < 10) {
      return true; // Too uniform, likely spoofed
    }
  }

  return false;
}

/**
 * Verify canvas fingerprint stability
 * Returns true if fingerprint is stable across multiple renders
 */
export async function verifyCanvasStability(): Promise<boolean> {
  const hashes: string[] = [];

  for (let i = 0; i < 3; i++) {
    const result = await collectCanvas();
    if (result && !result.blocked) {
      hashes.push(result.hash);
    }
  }

  if (hashes.length < 3) {
    return false;
  }

  // All hashes should be identical for stable fingerprint
  return hashes.every((h) => h === hashes[0]);
}
