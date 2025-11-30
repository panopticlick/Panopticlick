/**
 * @panopticlick/valuation-engine
 * Privacy valuation engine for Panopticlick.org
 *
 * This package analyzes browser fingerprints to:
 * - Calculate information entropy
 * - Simulate RTB (Real-Time Bidding) auctions
 * - Assess privacy defenses
 * - Compare against population statistics
 * - Generate comprehensive valuation reports
 */

// Entropy calculation
export {
  calculateEntropy,
  calculateEntropyBreakdown,
  generateEntropyReport,
  compareToAverage,
} from './entropy';

// RTB simulation
export {
  simulateRTBAuction,
  detectPersonas,
  formatCPM,
  explainCPM,
  calculateAnnualValue,
} from './rtb';

// Defense analysis
export {
  analyzeDefenses,
  generateHardeningGuide,
} from './defense';

// Population comparison
export {
  generatePopulationComparison,
  generateComparisonSummary,
  calculateTrackingDifficulty,
} from './comparison';

// Complete report generation
export {
  generateValuationReport,
  generateExecutiveSummary,
  generateReportCard,
  generatePrioritizedRecommendations,
  exportReportJSON,
  generateReportHash,
} from './report';

// Re-export types
export type {
  // Entropy types
  EntropyRarity,
  EntropyTier,
  EntropyBreakdown,
  EntropyReport,
  // RTB types
  BidderType,
  RTBBid,
  RTBSimulationResult,
  Persona,
  DSPProfile,
  PersonaRule,
  // Valuation types
  TrackabilityTier,
  MarketValuation,
  // Defense types
  DefenseTier,
  AdBlockerStatus,
  PrivacyHeaderStatus,
  FingerprintProtectionStatus,
  NetworkPrivacyStatus,
  DefenseStatus,
  HardeningStep,
  HardeningGuide,
  BrowserType,
  // Comparison types
  PopulationComparison,
  // Report types
  ReportMeta,
  ValuationReport,
} from '@panopticlick/types';
