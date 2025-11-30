/**
 * Supercookie Module
 * Demonstrates various supercookie/evercookie techniques for educational purposes
 */

export {
  checkHSTSSupport,
  generateHSTSValue,
  binaryToHex,
  simulateHSTSWrite,
  simulateHSTSRead,
  generateHSTSDemoData,
  generateVisualization,
  getTrackingComparison,
} from './hsts';

export type {
  HSTSConfig,
  HSTSCookieState,
  HSTSCheckResult,
  HSTSVisualization,
} from './hsts';
