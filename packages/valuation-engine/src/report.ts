/**
 * Valuation Report Generator
 * Generates comprehensive reports combining all analysis
 */

import type {
  FingerprintPayload,
  ValuationReport,
  ReportMeta,
  EntropyReport,
  MarketValuation,
  DefenseStatus,
  PopulationComparison,
  TrackabilityTier,
} from '@panopticlick/types';

import { generateEntropyReport, compareToAverage } from './entropy';
import { simulateRTBAuction, calculateAnnualValue, formatCPM, explainCPM } from './rtb';
import { analyzeDefenses, generateHardeningGuide } from './defense';
import { generatePopulationComparison, calculateTrackingDifficulty } from './comparison';

/**
 * Generate complete valuation report
 */
export function generateValuationReport(
  payload: FingerprintPayload,
  options?: {
    adBlockerDetected?: boolean;
    vpnDetected?: boolean;
    torDetected?: boolean;
    trackerBlocked?: boolean;
  }
): ValuationReport {
  const startTime = performance.now();

  // Generate all sub-reports
  const entropyReport = generateEntropyReport(payload);
  const rtbResult = simulateRTBAuction(payload);
  const defenseStatus = analyzeDefenses(payload, options);
  const comparison = generatePopulationComparison(payload);

  // Calculate market valuation
  const valuation = calculateMarketValuation(entropyReport, rtbResult);

  // Build meta
  const meta: ReportMeta = {
    reportId: generateReportId(),
    generatedAt: Date.now(),
    processingTime: Math.round(performance.now() - startTime),
    sdkVersion: '1.0.0',
  };

  return {
    meta,
    entropy: entropyReport,
    valuation,
    defenses: defenseStatus,
    comparison,
  };
}

/**
 * Calculate market valuation from RTB results
 */
function calculateMarketValuation(
  entropyReport: EntropyReport,
  rtbResult: ReturnType<typeof simulateRTBAuction>
): MarketValuation {
  const winningBid = rtbResult.winner?.amount || 0;
  const annualValue = calculateAnnualValue(winningBid);
  const trackability = calculateTrackabilityTier(entropyReport.totalBits);

  return {
    winningBid: rtbResult.winner?.amount || 0,
    averageCPM: rtbResult.averageCPM,
    formattedCPM: formatCPM(rtbResult.averageCPM),
    explanation: explainCPM(rtbResult.averageCPM),
    annualValue: annualValue.annualValue,
    annualExplanation: annualValue.explanation,
    trackability,
    personas: rtbResult.personas,
    bidders: rtbResult.bids.slice(0, 5), // Top 5 bidders
  };
}

/**
 * Calculate trackability tier
 */
function calculateTrackabilityTier(entropyBits: number): TrackabilityTier {
  if (entropyBits >= 50) return 'beacon';
  if (entropyBits >= 40) return 'high';
  if (entropyBits >= 30) return 'medium';
  if (entropyBits >= 20) return 'low';
  return 'hidden';
}

/**
 * Generate unique report ID
 */
function generateReportId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `rep_${timestamp}${random}`;
}

/**
 * Generate executive summary of the report
 */
export function generateExecutiveSummary(report: ValuationReport): {
  headline: string;
  keyFindings: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  actionRequired: boolean;
} {
  const { entropy, valuation, defenses, comparison } = report;

  // Determine headline based on trackability
  let headline: string;
  let riskLevel: 'low' | 'medium' | 'high' | 'critical';

  if (valuation.trackability === 'beacon') {
    headline = 'Your browser is essentially a tracking beacon';
    riskLevel = 'critical';
  } else if (valuation.trackability === 'high') {
    headline = 'You are easily trackable across the web';
    riskLevel = 'high';
  } else if (valuation.trackability === 'medium') {
    headline = 'You have average privacy - room for improvement';
    riskLevel = 'medium';
  } else if (valuation.trackability === 'low') {
    headline = 'You have good privacy protections in place';
    riskLevel = 'low';
  } else {
    headline = 'Excellent! Your browser is well-protected';
    riskLevel = 'low';
  }

  // Key findings
  const keyFindings: string[] = [];

  // Entropy finding
  const entropyComparison = compareToAverage(entropy.totalBits);
  keyFindings.push(
    `Your fingerprint has ${entropy.totalBits.toFixed(1)} bits of entropy ` +
      `(${entropyComparison.comparison.replace('_', ' ')})`
  );

  // Value finding
  keyFindings.push(
    `Advertisers value your profile at ${valuation.formattedCPM} ` +
      `(~$${valuation.annualValue.toFixed(2)}/year)`
  );

  // Uniqueness finding
  keyFindings.push(
    `About ${comparison.similarDevices.formatted} users have a similar fingerprint`
  );

  // Defense finding
  if (defenses.score >= 70) {
    keyFindings.push('Your privacy defenses are strong');
  } else if (defenses.score >= 40) {
    keyFindings.push('Your privacy defenses could be improved');
  } else {
    keyFindings.push('You have minimal privacy protections');
  }

  // Action required?
  const actionRequired = riskLevel === 'critical' || riskLevel === 'high';

  return {
    headline,
    keyFindings,
    riskLevel,
    actionRequired,
  };
}

/**
 * Generate shareable report card
 */
export function generateReportCard(report: ValuationReport): {
  grade: string;
  score: number;
  summary: string;
  highlights: Array<{ label: string; value: string; status: 'good' | 'warning' | 'bad' }>;
} {
  const { entropy, valuation, defenses, comparison } = report;

  // Calculate overall score (0-100)
  let score = 0;

  // Privacy score (up to 40 points)
  score += Math.min(defenses.score * 0.4, 40);

  // Entropy score (lower is better, up to 30 points)
  if (entropy.totalBits < 20) score += 30;
  else if (entropy.totalBits < 30) score += 20;
  else if (entropy.totalBits < 40) score += 10;

  // Similar devices (more is better, up to 20 points)
  if (comparison.similarDevices.estimate > 1000000) score += 20;
  else if (comparison.similarDevices.estimate > 100000) score += 15;
  else if (comparison.similarDevices.estimate > 10000) score += 10;
  else if (comparison.similarDevices.estimate > 1000) score += 5;

  // Defense tier (up to 10 points)
  if (defenses.overallTier === 'fortress') score += 10;
  else if (defenses.overallTier === 'hardened') score += 7;
  else if (defenses.overallTier === 'protected') score += 4;

  score = Math.round(score);

  // Determine grade
  let grade: string;
  if (score >= 90) grade = 'A+';
  else if (score >= 80) grade = 'A';
  else if (score >= 70) grade = 'B';
  else if (score >= 60) grade = 'C';
  else if (score >= 50) grade = 'D';
  else grade = 'F';

  // Summary
  let summary: string;
  if (grade.startsWith('A')) {
    summary = 'Excellent privacy protection! Your browser is well-configured.';
  } else if (grade === 'B') {
    summary = 'Good privacy practices with room for improvement.';
  } else if (grade === 'C') {
    summary = 'Average protection. Consider enhancing your privacy settings.';
  } else {
    summary = 'Your privacy is at risk. Take action to protect yourself.';
  }

  // Highlights
  const highlights: Array<{ label: string; value: string; status: 'good' | 'warning' | 'bad' }> = [
    {
      label: 'Fingerprint Entropy',
      value: `${entropy.totalBits.toFixed(1)} bits`,
      status: entropy.totalBits < 25 ? 'good' : entropy.totalBits < 40 ? 'warning' : 'bad',
    },
    {
      label: 'Ad Value',
      value: valuation.formattedCPM,
      status: valuation.averageCPM < 2 ? 'good' : valuation.averageCPM < 5 ? 'warning' : 'bad',
    },
    {
      label: 'Privacy Score',
      value: `${defenses.score}/100`,
      status: defenses.score >= 60 ? 'good' : defenses.score >= 30 ? 'warning' : 'bad',
    },
    {
      label: 'Similar Fingerprints',
      value: comparison.similarDevices.formatted,
      status:
        comparison.similarDevices.estimate > 10000
          ? 'good'
          : comparison.similarDevices.estimate > 100
          ? 'warning'
          : 'bad',
    },
    {
      label: 'Defense Tier',
      value: defenses.overallTier.charAt(0).toUpperCase() + defenses.overallTier.slice(1),
      status:
        defenses.overallTier === 'fortress' || defenses.overallTier === 'hardened'
          ? 'good'
          : defenses.overallTier === 'protected'
          ? 'warning'
          : 'bad',
    },
  ];

  return { grade, score, summary, highlights };
}

/**
 * Generate recommendations prioritized by impact
 */
export function generatePrioritizedRecommendations(
  report: ValuationReport,
  payload: FingerprintPayload
): Array<{
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  title: string;
  description: string;
  impact: string;
}> {
  const recommendations: Array<{
    priority: 'critical' | 'high' | 'medium' | 'low';
    category: string;
    title: string;
    description: string;
    impact: string;
  }> = [];

  const { defenses, entropy, valuation } = report;
  const fpProtection = defenses.fingerprintProtection;

  // Critical: No fingerprint protection
  if (fpProtection.level === 'none' && entropy.totalBits > 40) {
    recommendations.push({
      priority: 'critical',
      category: 'Fingerprinting',
      title: 'Enable fingerprint protection',
      description:
        'Your browser is highly unique and easily trackable. ' +
        'Install CanvasBlocker or enable resistFingerprinting in Firefox.',
      impact: 'Could reduce your trackability by 60-80%',
    });
  }

  // High: No ad blocker
  if (!defenses.adBlocker.detected) {
    recommendations.push({
      priority: 'high',
      category: 'Tracking',
      title: 'Install an ad blocker',
      description:
        'Ad blockers prevent tracking scripts from loading. ' +
        'uBlock Origin is recommended for comprehensive protection.',
      impact: 'Blocks most third-party trackers',
    });
  }

  // High: Canvas not protected
  if (!fpProtection.canvasProtected && entropy.totalBits > 30) {
    recommendations.push({
      priority: 'high',
      category: 'Fingerprinting',
      title: 'Block canvas fingerprinting',
      description:
        'Canvas fingerprinting is one of the most effective tracking methods. ' +
        'Use CanvasBlocker extension or Brave browser.',
      impact: 'Removes ~15 bits of entropy',
    });
  }

  // Medium: No privacy headers
  if (!payload.software.globalPrivacyControl) {
    recommendations.push({
      priority: 'medium',
      category: 'Privacy Headers',
      title: 'Enable Global Privacy Control',
      description:
        'GPC signals your privacy preference to websites. ' +
        'Some jurisdictions require websites to honor this signal.',
      impact: 'Legal protection in California and EU',
    });
  }

  // Medium: Unique fonts
  if (payload.software.fonts && payload.software.fonts.count > 30) {
    recommendations.push({
      priority: 'medium',
      category: 'Fingerprinting',
      title: 'Reduce installed fonts',
      description:
        `You have ${payload.software.fonts.count} fonts installed. ` +
        'Each unique font combination makes you more identifiable.',
      impact: 'Could reduce entropy by 3-8 bits',
    });
  }

  // Low: WebGL not protected (if canvas is)
  if (!fpProtection.webglProtected && fpProtection.canvasProtected) {
    recommendations.push({
      priority: 'low',
      category: 'Fingerprinting',
      title: 'Consider WebGL protection',
      description:
        'WebGL reveals GPU information. If you rarely use 3D websites, ' +
        'consider blocking it in your browser settings.',
      impact: 'Removes GPU fingerprint vector',
    });
  }

  // Sort by priority
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return recommendations;
}

/**
 * Export report as structured JSON
 */
export function exportReportJSON(report: ValuationReport): string {
  const exportData = {
    ...report,
    exported: {
      format: 'panopticlick-report-v1',
      timestamp: Date.now(),
    },
  };

  return JSON.stringify(exportData, null, 2);
}

/**
 * Generate report hash for verification
 */
export async function generateReportHash(report: ValuationReport): Promise<string> {
  const data = JSON.stringify({
    reportId: report.meta.reportId,
    totalBits: report.entropy.totalBits,
    score: report.defenses.score,
    cpm: report.valuation.averageCPM,
  });

  try {
    // Use Web Crypto API if available (browser and modern Node.js)
    if (typeof crypto !== 'undefined' && crypto.subtle) {
      const encoder = new TextEncoder();
      const buffer = encoder.encode(data);
      const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 16);
    }
  } catch {
    // Fallback: generate simple hash from data
  }

  // Fallback: simple hash based on report data
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16).padStart(16, '0').slice(0, 16);
}
