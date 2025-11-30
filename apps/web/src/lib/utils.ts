import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a number with commas
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

/**
 * Format a percentage
 */
export function formatPercent(num: number, decimals = 1): string {
  return `${(num * 100).toFixed(decimals)}%`;
}

/**
 * Format bytes to human readable
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Format currency (USD)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

/**
 * Format CPM (Cost Per Mille)
 */
export function formatCPM(cpm: number): string {
  return `$${cpm.toFixed(2)} CPM`;
}

/**
 * Delay helper for animations
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generate a random ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

/**
 * Clamp a number between min and max
 */
export function clamp(num: number, min: number, max: number): number {
  return Math.min(Math.max(num, min), max);
}

/**
 * Get entropy tier label
 */
export function getEntropyTierLabel(bits: number): string {
  if (bits >= 50) return 'EXTREMELY UNIQUE';
  if (bits >= 40) return 'VERY UNIQUE';
  if (bits >= 30) return 'UNIQUE';
  if (bits >= 20) return 'SOMEWHAT UNIQUE';
  return 'NOT VERY UNIQUE';
}

/**
 * Get entropy tier color class
 */
export function getEntropyTierColor(bits: number): string {
  if (bits >= 50) return 'text-alert-red';
  if (bits >= 40) return 'text-alert-orange';
  if (bits >= 30) return 'text-alert-orange';
  if (bits >= 20) return 'text-ink-200';
  return 'text-alert-green';
}

/**
 * Get defense tier label
 */
export function getDefenseTierLabel(
  tier: 'exposed' | 'basic' | 'protected' | 'hardened' | 'fortress'
): string {
  const labels = {
    exposed: 'VULNERABLE',
    basic: 'MINIMAL PROTECTION',
    protected: 'MODERATELY PROTECTED',
    hardened: 'WELL PROTECTED',
    fortress: 'HIGHLY PROTECTED',
  };
  return labels[tier];
}

/**
 * Get defense tier color
 */
export function getDefenseTierColor(
  tier: 'exposed' | 'basic' | 'protected' | 'hardened' | 'fortress'
): string {
  const colors = {
    exposed: 'text-alert-red',
    basic: 'text-alert-orange',
    protected: 'text-alert-orange',
    hardened: 'text-alert-green',
    fortress: 'text-alert-green',
  };
  return colors[tier];
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
}

/**
 * Capitalize first letter
 */
export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Convert entropy bits to "1 in X" format
 */
export function entropyToOneIn(bits: number): string {
  const population = Math.pow(2, bits);
  if (population >= 1_000_000_000) {
    return `1 in ${(population / 1_000_000_000).toFixed(1)} billion`;
  }
  if (population >= 1_000_000) {
    return `1 in ${(population / 1_000_000).toFixed(1)} million`;
  }
  if (population >= 1_000) {
    return `1 in ${(population / 1_000).toFixed(1)} thousand`;
  }
  return `1 in ${Math.round(population)}`;
}
