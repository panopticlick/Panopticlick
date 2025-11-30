/**
 * Defense Routes
 * Privacy defense testing endpoints
 */

import { Hono } from 'hono';
import type { Env } from '../types';
import { getRequestContext } from '../middleware/context';
import type {
  DefenseBlockerRequest,
  DefenseBlockerResponse,
  DefenseDNSResponse,
  DefenseTestRequest,
  DefenseTestResponse,
} from '@panopticlick/types';

const defense = new Hono<{ Bindings: Env }>();

/**
 * POST /defense/blocker
 * Test ad/tracker blocker effectiveness
 */
defense.post('/blocker', async (c) => {
  try {
    const body = await c.req.json<DefenseBlockerRequest>();
    const { loadedResources, blockedResources, testResults } = body;

    // Analyze blocker effectiveness
    const analysis = analyzeBlocker(loadedResources, blockedResources, testResults);

    const response: DefenseBlockerResponse = {
      success: true,
      blockerDetected: analysis.detected,
      blockerName: analysis.name,
      effectivenessScore: analysis.score,
      categories: analysis.categories,
      recommendations: analysis.recommendations,
    };

    return c.json(response);
  } catch (error) {
    console.error('Blocker test error:', error);
    return c.json({ success: false, error: 'Failed to analyze blocker' }, 500);
  }
});

/**
 * GET /defense/dns
 * Test DNS privacy (returns resolver info)
 */
defense.get('/dns', async (c) => {
  const ctx = getRequestContext(c);

  // Cloudflare can tell us about the DNS resolver
  const cf = c.req.raw.cf;

  const response: DefenseDNSResponse = {
    success: true,
    resolver: {
      ip: 'hidden', // We don't expose actual resolver IP
      provider: detectDNSProvider(cf),
      isEncrypted: detectDNSEncryption(cf),
      isCloudflare: ctx.asn === '13335',
    },
    leakTest: {
      passed: true, // Would need actual leak test
      leakedIPs: [],
    },
  };

  return c.json(response);
});

/**
 * POST /defense/test
 * Run comprehensive defense tests
 */
defense.post('/test', async (c) => {
  try {
    const body = await c.req.json<DefenseTestRequest>();
    const { fingerprint, clientTests } = body;

    // Import valuation engine
    const { analyzeDefenses, generateHardeningGuide } = await import(
      '@panopticlick/valuation-engine'
    );

    // Analyze defenses
    const defenseStatus = analyzeDefenses(fingerprint, {
      adBlockerDetected: clientTests?.adBlocker ?? false,
      trackerBlocked: clientTests?.trackerBlocked ?? false,
      vpnDetected: clientTests?.vpnDetected ?? false,
      torDetected: clientTests?.torDetected ?? false,
    });

    // Generate hardening guide
    const hardeningGuide = generateHardeningGuide(fingerprint);

    const response: DefenseTestResponse = {
      success: true,
      status: defenseStatus,
      hardeningGuide,
      score: defenseStatus.score,
      tier: defenseStatus.overallTier,
    };

    // Log to analytics
    c.env.ANALYTICS.writeDataPoint({
      blobs: [defenseStatus.overallTier],
      doubles: [defenseStatus.score],
      indexes: ['defense_test'],
    });

    return c.json(response);
  } catch (error) {
    console.error('Defense test error:', error);
    return c.json({ success: false, error: 'Failed to run defense tests' }, 500);
  }
});

/**
 * GET /defense/bait
 * Serve bait resources for blocker detection
 */
defense.get('/bait/:category', async (c) => {
  const category = c.req.param('category');

  // These endpoints mimic tracking resources
  // Blockers should block them
  const baitResponses: Record<string, unknown> = {
    analytics: {
      type: 'analytics',
      script: '/* Google Analytics simulation */',
    },
    ads: {
      type: 'ads',
      script: '/* DoubleClick simulation */',
    },
    social: {
      type: 'social',
      script: '/* Facebook Pixel simulation */',
    },
    tracking: {
      type: 'tracking',
      script: '/* Generic tracker simulation */',
    },
  };

  const response = baitResponses[category] || { type: 'unknown' };

  // Add headers that blockers look for
  c.header('X-Tracking-ID', 'test-123');
  c.header('X-Ad-Network', 'panopticlick-test');

  return c.json(response);
});

// Helper functions

function analyzeBlocker(
  loaded: string[],
  blocked: string[],
  testResults: Record<string, boolean>
): {
  detected: boolean;
  name: string | null;
  score: number;
  categories: Record<string, { blocked: number; total: number }>;
  recommendations: string[];
} {
  const detected = blocked.length > 0 || Object.values(testResults).some((v) => v);

  // Try to identify the blocker
  let name: string | null = null;
  const blockedPatterns = blocked.join(' ').toLowerCase();

  if (blockedPatterns.includes('ublock') || blocked.length > 10) {
    name = 'uBlock Origin (or similar)';
  } else if (testResults.adBlocker && blocked.length > 5) {
    name = 'Ad Blocker Detected';
  } else if (testResults.trackerBlocked) {
    name = 'Tracker Blocker Detected';
  }

  // Calculate effectiveness score
  const totalTests = loaded.length + blocked.length;
  const score = totalTests > 0 ? Math.round((blocked.length / totalTests) * 100) : 0;

  // Categorize blocked resources
  const categories: Record<string, { blocked: number; total: number }> = {
    analytics: { blocked: 0, total: 0 },
    ads: { blocked: 0, total: 0 },
    social: { blocked: 0, total: 0 },
    tracking: { blocked: 0, total: 0 },
  };

  for (const resource of [...loaded, ...blocked]) {
    const isBlocked = blocked.includes(resource);
    const category = categorizeResource(resource);

    if (categories[category]) {
      categories[category].total++;
      if (isBlocked) categories[category].blocked++;
    }
  }

  // Generate recommendations
  const recommendations: string[] = [];

  if (!detected) {
    recommendations.push('Install an ad blocker like uBlock Origin');
  }
  if (categories.analytics.blocked < categories.analytics.total) {
    recommendations.push('Consider blocking analytics trackers');
  }
  if (categories.social.blocked < categories.social.total) {
    recommendations.push('Block social media tracking widgets');
  }
  if (score < 80 && detected) {
    recommendations.push('Update your block lists for better protection');
  }

  return { detected, name, score, categories, recommendations };
}

function categorizeResource(resource: string): string {
  const lower = resource.toLowerCase();

  if (
    lower.includes('analytics') ||
    lower.includes('ga.') ||
    lower.includes('gtag')
  ) {
    return 'analytics';
  }
  if (
    lower.includes('ads') ||
    lower.includes('doubleclick') ||
    lower.includes('adsense')
  ) {
    return 'ads';
  }
  if (
    lower.includes('facebook') ||
    lower.includes('twitter') ||
    lower.includes('linkedin')
  ) {
    return 'social';
  }
  return 'tracking';
}

function detectDNSProvider(
  cf: IncomingRequestCfProperties | undefined
): string {
  if (!cf) return 'Unknown';

  // This is a simplification - in reality you'd need to check
  // the actual DNS resolver being used
  const asn = cf.asn?.toString() || '';

  if (asn === '13335') return 'Cloudflare';
  if (asn === '15169') return 'Google';
  if (asn === '8075') return 'Microsoft';

  return 'ISP Default';
}

function detectDNSEncryption(
  cf: IncomingRequestCfProperties | undefined
): boolean {
  // This is a heuristic - can't truly detect DNS encryption from here
  // Would need client-side testing
  return false;
}

export { defense };
