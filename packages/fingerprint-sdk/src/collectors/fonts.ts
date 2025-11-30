/**
 * Font Fingerprint Collector
 * Detects installed fonts using canvas measurement technique
 */

import type { FontInfo } from '@panopticlick/types';
import { sha256 } from '../hash';

// Baseline fonts that are almost certainly installed
const BASELINE_FONTS = ['monospace', 'sans-serif', 'serif'];

// Test fonts to detect - comprehensive list of common and less common fonts
const TEST_FONTS = [
  // Windows fonts
  'Arial',
  'Arial Black',
  'Arial Narrow',
  'Calibri',
  'Cambria',
  'Cambria Math',
  'Candara',
  'Comic Sans MS',
  'Consolas',
  'Constantia',
  'Corbel',
  'Courier New',
  'Ebrima',
  'Franklin Gothic Medium',
  'Gabriola',
  'Gadugi',
  'Georgia',
  'Impact',
  'Lucida Console',
  'Lucida Sans Unicode',
  'Marlett',
  'Microsoft Sans Serif',
  'Palatino Linotype',
  'Segoe Print',
  'Segoe Script',
  'Segoe UI',
  'Segoe UI Light',
  'Segoe UI Semibold',
  'Segoe UI Symbol',
  'Sitka',
  'Symbol',
  'Tahoma',
  'Times New Roman',
  'Trebuchet MS',
  'Verdana',
  'Webdings',
  'Wingdings',
  'Yu Gothic',

  // macOS fonts
  'American Typewriter',
  'Apple Chancery',
  'Apple Color Emoji',
  'Apple SD Gothic Neo',
  'Avenir',
  'Avenir Next',
  'Baskerville',
  'Big Caslon',
  'Bodoni 72',
  'Bradley Hand',
  'Brush Script MT',
  'Chalkboard',
  'Chalkboard SE',
  'Cochin',
  'Copperplate',
  'Courier',
  'Didot',
  'Futura',
  'Geneva',
  'Gill Sans',
  'Helvetica',
  'Helvetica Neue',
  'Herculanum',
  'Hoefler Text',
  'Lucida Grande',
  'Luminari',
  'Marker Felt',
  'Menlo',
  'Monaco',
  'Noteworthy',
  'Optima',
  'Palatino',
  'Papyrus',
  'Phosphate',
  'PT Mono',
  'PT Sans',
  'PT Serif',
  'Rockwell',
  'Savoye LET',
  'SF Pro',
  'SignPainter',
  'Skia',
  'Snell Roundhand',
  'STIXGeneral',
  'Superclarendon',
  'Times',
  'Trattatello',
  'Zapfino',

  // Linux fonts
  'Cantarell',
  'DejaVu Sans',
  'DejaVu Sans Mono',
  'DejaVu Serif',
  'Droid Sans',
  'Droid Sans Mono',
  'Droid Serif',
  'FreeMono',
  'FreeSans',
  'FreeSerif',
  'Liberation Mono',
  'Liberation Sans',
  'Liberation Serif',
  'Noto Sans',
  'Noto Serif',
  'Open Sans',
  'Roboto',
  'Ubuntu',
  'Ubuntu Mono',

  // Cross-platform / Web fonts
  'Century Gothic',
  'Century Schoolbook',
  'Courier',
  'Garamond',
  'Lucida Sans',
  'MS Gothic',
  'MS Mincho',
  'MS PGothic',
  'MS PMincho',
  'MS Reference Sans Serif',
  'MS UI Gothic',
  'Meiryo',
  'Meiryo UI',
  'Microsoft JhengHei',
  'Microsoft YaHei',
  'MingLiU',
  'PMingLiU',
  'SimHei',
  'SimSun',
  'Source Code Pro',
  'Source Sans Pro',
  'Source Serif Pro',

  // Design / Professional fonts
  'Fira Code',
  'Fira Sans',
  'IBM Plex Sans',
  'IBM Plex Mono',
  'Inter',
  'JetBrains Mono',
  'Lato',
  'Merriweather',
  'Montserrat',
  'Nunito',
  'Oswald',
  'Poppins',
  'Quicksand',
  'Raleway',
  'Rubik',
  'Work Sans',
];

// Test string that covers various character shapes
const TEST_STRING = 'mmmmmmmmmmlli';

// Test sizes
const TEST_SIZE = '72px';

/**
 * Collect font fingerprint
 */
export async function collectFonts(): Promise<FontInfo | null> {
  try {
    const detected = await detectFonts();
    const hash = await sha256(detected.sort().join(','));

    return {
      hash,
      count: detected.length,
      detected,
    };
  } catch (error) {
    return null;
  }
}

/**
 * Detect installed fonts using canvas measurement
 */
async function detectFonts(): Promise<string[]> {
  if (typeof document === 'undefined') {
    return [];
  }

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return [];
  }

  // Get baseline measurements
  const baselines: Map<string, number> = new Map();

  for (const baseFont of BASELINE_FONTS) {
    const width = measureText(ctx, baseFont, TEST_STRING);
    baselines.set(baseFont, width);
  }

  // Test each font against baselines
  const detected: string[] = [];

  for (const font of TEST_FONTS) {
    const isInstalled = checkFontInstalled(ctx, font, baselines);
    if (isInstalled) {
      detected.push(font);
    }
  }

  return detected;
}

/**
 * Measure text width with a specific font
 */
function measureText(
  ctx: CanvasRenderingContext2D,
  font: string,
  text: string
): number {
  ctx.font = `${TEST_SIZE} ${font}`;
  return ctx.measureText(text).width;
}

/**
 * Check if a font is installed by comparing against baselines
 */
function checkFontInstalled(
  ctx: CanvasRenderingContext2D,
  fontName: string,
  baselines: Map<string, number>
): boolean {
  // Test against each baseline font
  for (const [baseFont, baseWidth] of baselines) {
    // Use font stack: requested font with baseline as fallback
    const testFont = `"${fontName}", ${baseFont}`;
    const testWidth = measureText(ctx, testFont, TEST_STRING);

    // If width differs from baseline, font is installed
    if (testWidth !== baseWidth) {
      return true;
    }
  }

  return false;
}

/**
 * Alternative font detection using FontFace API
 * More accurate but doesn't reveal as many fonts
 */
export async function checkFontViaAPI(fontName: string): Promise<boolean> {
  if (typeof document === 'undefined' || !document.fonts) {
    return false;
  }

  try {
    await document.fonts.ready;
    return document.fonts.check(`12px "${fontName}"`);
  } catch {
    return false;
  }
}

/**
 * Calculate font entropy based on detected fonts
 */
export function calculateFontEntropy(detected: string[]): number {
  // Base entropy from font count
  // More fonts = more unique
  const countEntropy = Math.log2(Math.max(detected.length, 1));

  // Rare font bonus
  const rareFonts = [
    'Luminari',
    'Trattatello',
    'Herculanum',
    'Phosphate',
    'Zapfino',
    'Skia',
    'Savoye LET',
    'Superclarendon',
  ];

  const rareCount = detected.filter((f) =>
    rareFonts.some((r) => r.toLowerCase() === f.toLowerCase())
  ).length;

  const rareBonus = rareCount * 2;

  // Platform indicator fonts
  const hasWindowsOnly = detected.some((f) =>
    ['Calibri', 'Segoe UI', 'Consolas'].includes(f)
  );
  const hasMacOnly = detected.some((f) =>
    ['SF Pro', 'Helvetica Neue', 'Menlo'].includes(f)
  );
  const hasLinuxOnly = detected.some((f) =>
    ['Cantarell', 'Liberation Sans', 'DejaVu Sans'].includes(f)
  );

  // Platform mixing is unusual
  const platforms = [hasWindowsOnly, hasMacOnly, hasLinuxOnly].filter(Boolean).length;
  const platformMixBonus = platforms > 1 ? 3 : 0;

  return countEntropy + rareBonus + platformMixBonus;
}

/**
 * Detect font fingerprint spoofing or blocking
 */
export function detectFontSpoofing(info: FontInfo): {
  spoofed: boolean;
  blocked: boolean;
  reasons: string[];
} {
  const reasons: string[] = [];
  let blocked = false;
  let spoofed = false;

  // No fonts detected suggests blocking
  if (info.count === 0) {
    blocked = true;
    reasons.push('No fonts detected');
  }

  // Very few fonts detected might indicate fingerprint protection
  if (info.count > 0 && info.count < 3) {
    blocked = true;
    reasons.push('Minimal fonts detected (likely protected)');
  }

  // Check for missing platform-common fonts
  const commonFonts = ['Arial', 'Times New Roman', 'Courier New'];
  const hasCommon = commonFonts.some((f) =>
    info.detected.some((d) => d.toLowerCase() === f.toLowerCase())
  );

  if (info.count > 0 && !hasCommon) {
    spoofed = true;
    reasons.push('Missing common system fonts');
  }

  // Suspiciously round number of fonts
  if (info.count > 0 && [10, 20, 50, 100].includes(info.count)) {
    reasons.push('Suspicious font count (exact round number)');
  }

  return {
    spoofed,
    blocked,
    reasons,
  };
}

/**
 * Categorize detected fonts by type
 */
export function categorizeFonts(detected: string[]): {
  serif: string[];
  sansSerif: string[];
  monospace: string[];
  display: string[];
  script: string[];
  system: string[];
} {
  const categories = {
    serif: [
      'Times New Roman',
      'Georgia',
      'Palatino',
      'Baskerville',
      'Garamond',
      'Cambria',
      'Didot',
      'Rockwell',
      'Bodoni 72',
      'PT Serif',
      'Merriweather',
      'Source Serif Pro',
    ],
    sansSerif: [
      'Arial',
      'Helvetica',
      'Verdana',
      'Tahoma',
      'Calibri',
      'Segoe UI',
      'Open Sans',
      'Roboto',
      'Lato',
      'Inter',
      'Poppins',
      'Montserrat',
    ],
    monospace: [
      'Courier New',
      'Consolas',
      'Monaco',
      'Menlo',
      'Lucida Console',
      'Source Code Pro',
      'Fira Code',
      'JetBrains Mono',
      'IBM Plex Mono',
    ],
    display: [
      'Impact',
      'Comic Sans MS',
      'Papyrus',
      'Phosphate',
      'Luminari',
      'Trattatello',
    ],
    script: [
      'Brush Script MT',
      'Zapfino',
      'Snell Roundhand',
      'Bradley Hand',
      'Savoye LET',
    ],
    system: [
      'SF Pro',
      'Segoe UI',
      'Roboto',
      '-apple-system',
      'BlinkMacSystemFont',
    ],
  };

  const result: {
    serif: string[];
    sansSerif: string[];
    monospace: string[];
    display: string[];
    script: string[];
    system: string[];
  } = {
    serif: [],
    sansSerif: [],
    monospace: [],
    display: [],
    script: [],
    system: [],
  };

  for (const font of detected) {
    const lowerFont = font.toLowerCase();

    for (const [category, fonts] of Object.entries(categories)) {
      if (fonts.some((f) => f.toLowerCase() === lowerFont)) {
        result[category as keyof typeof result].push(font);
        break;
      }
    }
  }

  return result;
}
