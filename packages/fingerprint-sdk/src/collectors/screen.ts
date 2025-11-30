/**
 * Screen Info Collector
 * Collects display and viewport characteristics
 */

import type { ScreenInfo } from '@panopticlick/types';

/**
 * Collect screen and display information
 */
export function collectScreen(): ScreenInfo {
  const screen = typeof window !== 'undefined' ? window.screen : null;
  const orientation = getOrientation();

  return {
    width: screen?.width ?? 0,
    height: screen?.height ?? 0,
    availWidth: screen?.availWidth ?? 0,
    availHeight: screen?.availHeight ?? 0,
    colorDepth: screen?.colorDepth ?? 0,
    pixelRatio: typeof window !== 'undefined' ? window.devicePixelRatio ?? 1 : 1,
    orientation,
  };
}

/**
 * Get current screen orientation
 */
function getOrientation(): string {
  if (typeof window === 'undefined') {
    return 'unknown';
  }

  // Modern API
  if (screen.orientation?.type) {
    return screen.orientation.type;
  }

  // Fallback: compare dimensions
  const width = window.innerWidth || document.documentElement.clientWidth;
  const height = window.innerHeight || document.documentElement.clientHeight;

  if (width > height) {
    return 'landscape-primary';
  } else if (height > width) {
    return 'portrait-primary';
  }

  return 'landscape-primary';
}

/**
 * Get extended screen information for fingerprinting
 */
export function collectExtendedScreen(): {
  screen: ScreenInfo;
  viewport: {
    width: number;
    height: number;
    outerWidth: number;
    outerHeight: number;
  };
  display: {
    isHDR: boolean;
    isHighContrast: boolean;
    colorGamut: string;
    colorScheme: string;
  };
  media: {
    pointer: string;
    hover: string;
    anyPointer: string;
    anyHover: string;
  };
} {
  const screenInfo = collectScreen();

  return {
    screen: screenInfo,
    viewport: getViewport(),
    display: getDisplayFeatures(),
    media: getPointerFeatures(),
  };
}

/**
 * Get viewport dimensions
 */
function getViewport(): {
  width: number;
  height: number;
  outerWidth: number;
  outerHeight: number;
} {
  if (typeof window === 'undefined') {
    return {
      width: 0,
      height: 0,
      outerWidth: 0,
      outerHeight: 0,
    };
  }

  return {
    width: window.innerWidth || document.documentElement.clientWidth || 0,
    height: window.innerHeight || document.documentElement.clientHeight || 0,
    outerWidth: window.outerWidth || 0,
    outerHeight: window.outerHeight || 0,
  };
}

/**
 * Get display feature preferences
 */
function getDisplayFeatures(): {
  isHDR: boolean;
  isHighContrast: boolean;
  colorGamut: string;
  colorScheme: string;
} {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return {
      isHDR: false,
      isHighContrast: false,
      colorGamut: 'srgb',
      colorScheme: 'light',
    };
  }

  // Check HDR support
  const isHDR = window.matchMedia('(dynamic-range: high)').matches;

  // Check high contrast mode
  const isHighContrast = window.matchMedia('(forced-colors: active)').matches;

  // Check color gamut
  let colorGamut = 'srgb';
  if (window.matchMedia('(color-gamut: rec2020)').matches) {
    colorGamut = 'rec2020';
  } else if (window.matchMedia('(color-gamut: p3)').matches) {
    colorGamut = 'p3';
  }

  // Check color scheme preference
  const colorScheme = window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';

  return {
    isHDR,
    isHighContrast,
    colorGamut,
    colorScheme,
  };
}

/**
 * Get pointer and interaction features
 */
function getPointerFeatures(): {
  pointer: string;
  hover: string;
  anyPointer: string;
  anyHover: string;
} {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return {
      pointer: 'unknown',
      hover: 'unknown',
      anyPointer: 'unknown',
      anyHover: 'unknown',
    };
  }

  // Primary pointer
  let pointer = 'none';
  if (window.matchMedia('(pointer: fine)').matches) {
    pointer = 'fine';
  } else if (window.matchMedia('(pointer: coarse)').matches) {
    pointer = 'coarse';
  }

  // Primary hover capability
  let hover = 'none';
  if (window.matchMedia('(hover: hover)').matches) {
    hover = 'hover';
  }

  // Any pointer
  let anyPointer = 'none';
  if (window.matchMedia('(any-pointer: fine)').matches) {
    anyPointer = 'fine';
  } else if (window.matchMedia('(any-pointer: coarse)').matches) {
    anyPointer = 'coarse';
  }

  // Any hover
  let anyHover = 'none';
  if (window.matchMedia('(any-hover: hover)').matches) {
    anyHover = 'hover';
  }

  return {
    pointer,
    hover,
    anyPointer,
    anyHover,
  };
}

/**
 * Calculate screen entropy contribution
 * Returns a measure of how unique the screen configuration is
 */
export function calculateScreenEntropy(info: ScreenInfo): number {
  // Common resolutions have lower entropy
  const commonResolutions = [
    [1920, 1080],
    [1366, 768],
    [1536, 864],
    [1440, 900],
    [1280, 720],
    [1600, 900],
    [2560, 1440],
    [3840, 2160],
    [1280, 800],
    [1680, 1050],
  ];

  let entropy = 0;

  // Resolution entropy
  const isCommon = commonResolutions.some(
    ([w, h]) => info.width === w && info.height === h
  );
  entropy += isCommon ? 4 : 8;

  // Pixel ratio entropy
  const commonRatios = [1, 1.25, 1.5, 2, 2.5, 3];
  const isCommonRatio = commonRatios.includes(info.pixelRatio);
  entropy += isCommonRatio ? 2 : 4;

  // Color depth entropy (most devices are 24-bit)
  if (info.colorDepth === 24) {
    entropy += 1;
  } else if (info.colorDepth === 32) {
    entropy += 2;
  } else {
    entropy += 4;
  }

  return entropy;
}

/**
 * Detect potential screen spoofing
 */
export function detectScreenSpoofing(info: ScreenInfo): {
  spoofed: boolean;
  reasons: string[];
} {
  const reasons: string[] = [];

  // Check for impossible values
  if (info.width === 0 || info.height === 0) {
    reasons.push('Zero screen dimensions');
  }

  // Available dimensions can't exceed screen dimensions
  if (info.availWidth > info.width || info.availHeight > info.height) {
    reasons.push('Available dimensions exceed screen dimensions');
  }

  // Pixel ratio should be positive
  if (info.pixelRatio <= 0 || info.pixelRatio > 5) {
    reasons.push('Invalid pixel ratio');
  }

  // Color depth should be standard value
  if (![8, 15, 16, 24, 30, 32, 48].includes(info.colorDepth)) {
    reasons.push('Non-standard color depth');
  }

  // Very unusual aspect ratios might indicate spoofing
  const aspectRatio = info.width / info.height;
  if (aspectRatio < 0.5 || aspectRatio > 3) {
    reasons.push('Unusual aspect ratio');
  }

  return {
    spoofed: reasons.length > 0,
    reasons,
  };
}

/**
 * Get device type based on screen characteristics
 */
export function inferDeviceType(
  info: ScreenInfo
): 'mobile' | 'tablet' | 'desktop' | 'unknown' {
  const { width, height, pixelRatio } = info;

  // Physical pixels
  const physicalWidth = width * pixelRatio;
  const physicalHeight = height * pixelRatio;

  // Mobile: small physical dimensions or high DPI small screens
  if (width <= 480 || (width <= 768 && pixelRatio >= 2)) {
    return 'mobile';
  }

  // Tablet: medium size with touch-friendly resolution
  if (width <= 1024 && width > 480) {
    return 'tablet';
  }

  // Large screens with standard or lower DPI are desktops
  if (width > 1024) {
    return 'desktop';
  }

  // Check physical resolution for edge cases
  if (physicalWidth <= 1080) {
    return 'mobile';
  } else if (physicalWidth <= 2048) {
    return 'tablet';
  }

  return 'desktop';
}
