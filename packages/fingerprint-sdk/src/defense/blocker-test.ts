/**
 * Ad/Tracker Blocker Detection and Testing
 *
 * Tests the effectiveness of ad blockers by attempting to load
 * known tracking resources and measuring what gets blocked.
 */

export interface BaitResource {
  id: string;
  name: string;
  category: 'analytics' | 'advertising' | 'social' | 'fingerprinting' | 'malware';
  url: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export type BlockerTestStatus = 'loaded' | 'blocked' | 'inconclusive';

export interface BlockerCategoryScore {
  blocked: number;
  total: number;
  measured: number;
  inconclusive: number;
  score: number;
}

export interface BlockerTestResult {
  resource: BaitResource;
  blocked: boolean;
  status: BlockerTestStatus;
  loadTime: number | null;
  method: 'script' | 'image' | 'fetch' | 'iframe';
  reason: string;
}

export interface BlockerAnalysis {
  detected: boolean;
  name: string | null;
  version: string | null;
  effectiveness: number;
  categoryScores: Record<string, BlockerCategoryScore>;
  results: BlockerTestResult[];
  recommendations: string[];
  inconclusive: boolean;
  measuredCount: number;
  inconclusiveCount: number;
  message: string | null;
}

/**
 * Known tracking resources to test
 * These URLs mimic real trackers but are served from our domain
 */
const BAIT_RESOURCES: BaitResource[] = [
  // Analytics
  {
    id: 'ga',
    name: 'Google Analytics',
    category: 'analytics',
    url: '/bait/analytics/google-analytics.js',
    description: 'Google\'s ubiquitous analytics tracker',
    severity: 'medium',
  },
  {
    id: 'gtm',
    name: 'Google Tag Manager',
    category: 'analytics',
    url: '/bait/analytics/googletagmanager.js',
    description: 'Tag management system that loads multiple trackers',
    severity: 'high',
  },
  {
    id: 'fb-pixel',
    name: 'Facebook Pixel',
    category: 'analytics',
    url: '/bait/analytics/fbevents.js',
    description: 'Facebook\'s conversion tracking pixel',
    severity: 'high',
  },
  {
    id: 'hotjar',
    name: 'Hotjar',
    category: 'analytics',
    url: '/bait/analytics/hotjar.js',
    description: 'Session recording and heatmap tracker',
    severity: 'high',
  },

  // Advertising
  {
    id: 'doubleclick',
    name: 'DoubleClick',
    category: 'advertising',
    url: '/bait/ads/doubleclick.js',
    description: 'Google\'s ad serving platform',
    severity: 'medium',
  },
  {
    id: 'adsense',
    name: 'Google AdSense',
    category: 'advertising',
    url: '/bait/ads/pagead2.googlesyndication.js',
    description: 'Google\'s publisher ad network',
    severity: 'medium',
  },
  {
    id: 'amazon-ads',
    name: 'Amazon Advertising',
    category: 'advertising',
    url: '/bait/ads/amazon-adsystem.js',
    description: 'Amazon\'s advertising platform',
    severity: 'medium',
  },
  {
    id: 'criteo',
    name: 'Criteo',
    category: 'advertising',
    url: '/bait/ads/criteo.js',
    description: 'Retargeting advertising platform',
    severity: 'high',
  },

  // Social
  {
    id: 'fb-sdk',
    name: 'Facebook SDK',
    category: 'social',
    url: '/bait/social/connect.facebook.net.js',
    description: 'Facebook\'s social widget SDK',
    severity: 'high',
  },
  {
    id: 'twitter-widget',
    name: 'Twitter Widget',
    category: 'social',
    url: '/bait/social/platform.twitter.js',
    description: 'Twitter embed and tracking widget',
    severity: 'medium',
  },
  {
    id: 'linkedin-insight',
    name: 'LinkedIn Insight',
    category: 'social',
    url: '/bait/social/linkedin-insight.js',
    description: 'LinkedIn\'s conversion tracking',
    severity: 'medium',
  },

  // Fingerprinting
  {
    id: 'fingerprint2',
    name: 'FingerprintJS',
    category: 'fingerprinting',
    url: '/bait/fingerprint/fingerprint2.js',
    description: 'Browser fingerprinting library',
    severity: 'critical',
  },
  {
    id: 'canvas-fp',
    name: 'Canvas Fingerprint',
    category: 'fingerprinting',
    url: '/bait/fingerprint/canvas-fingerprint.js',
    description: 'Canvas-based fingerprinting script',
    severity: 'high',
  },

  // Malware/Suspicious
  {
    id: 'coinminer',
    name: 'Crypto Miner',
    category: 'malware',
    url: '/bait/malware/coinhive.min.js',
    description: 'Cryptocurrency mining script',
    severity: 'critical',
  },
];

const CONTROL_PROBE_URL = '/bait/control.js';

interface ScriptProbeResult {
  blocked: boolean;
  status: BlockerTestStatus;
  loadTime: number | null;
  reason: string;
}

interface QuickBlockerDetectResult {
  detected: boolean;
  type: 'none' | 'basic' | 'standard' | 'aggressive';
  inconclusive: boolean;
}

type BlockerRuntime = typeof globalThis & {
  __panopticlickBaitFlags?: Record<string, boolean>;
  __panopticlickControlLoaded?: boolean;
};

function getRuntime(): BlockerRuntime {
  return globalThis as BlockerRuntime;
}

function clearBaitFlag(resourceId: string): void {
  const runtime = getRuntime();
  if (runtime.__panopticlickBaitFlags) {
    delete runtime.__panopticlickBaitFlags[resourceId];
  }
}

function hasBaitFlag(resourceId: string): boolean {
  return Boolean(getRuntime().__panopticlickBaitFlags?.[resourceId]);
}

function clearControlFlag(): void {
  delete getRuntime().__panopticlickControlLoaded;
}

function hasControlFlag(): boolean {
  return Boolean(getRuntime().__panopticlickControlLoaded);
}

/**
 * Test if a script resource is blocked
 */
async function testScript(
  url: string,
  {
    timeout = 3000,
    resourceId,
    control = false,
  }: {
    timeout?: number;
    resourceId?: string;
    control?: boolean;
  } = {}
): Promise<ScriptProbeResult> {
  return new Promise((resolve) => {
    const startTime = performance.now();
    const script = document.createElement('script');
    script.src = url;
    script.async = true;

    if (resourceId) {
      clearBaitFlag(resourceId);
    }
    if (control) {
      clearControlFlag();
    }

    let settled = false;

    const finish = (status: BlockerTestStatus, reason: string) => {
      if (settled) {
        return;
      }
      settled = true;
      cleanup();
      resolve({
        blocked: status === 'blocked',
        status,
        loadTime: status === 'loaded' ? performance.now() - startTime : null,
        reason,
      });
    };

    const timeoutId = setTimeout(() => {
      finish(control ? 'inconclusive' : 'blocked', control ? 'control-timeout' : 'timeout');
    }, timeout);

    const cleanup = () => {
      clearTimeout(timeoutId);
      script.remove();
    };

    script.onload = () => {
      const expectedFlagLoaded = control
        ? hasControlFlag()
        : resourceId
        ? hasBaitFlag(resourceId)
        : true;

      finish(expectedFlagLoaded ? 'loaded' : 'inconclusive', expectedFlagLoaded ? 'loaded' : 'missing-flag');
    };

    script.onerror = () => {
      finish(control ? 'inconclusive' : 'blocked', control ? 'control-error' : 'error');
    };

    // Prefer a page-owned, already-hydrated probe host. Injecting transient
    // scripts into <head> can race Next.js metadata hydration and produce a
    // false React hydration error even though the blocker measurement itself
    // is correct. Standalone SDK consumers keep the head fallback.
    const probeHost =
      typeof document.querySelector === 'function'
        ? document.querySelector<HTMLElement>('[data-panopticlick-probe-host]')
        : null;
    (probeHost ?? document.head).appendChild(script);
  });
}

/**
 * Test if an image resource is blocked
 */
async function testImage(url: string, timeout: number = 3000): Promise<{ blocked: boolean; loadTime: number | null }> {
  return new Promise((resolve) => {
    const startTime = performance.now();
    const img = new Image();

    const timeoutId = setTimeout(() => {
      resolve({ blocked: true, loadTime: null });
    }, timeout);

    img.onload = () => {
      clearTimeout(timeoutId);
      resolve({ blocked: false, loadTime: performance.now() - startTime });
    };

    img.onerror = () => {
      clearTimeout(timeoutId);
      resolve({ blocked: true, loadTime: null });
    };

    img.src = url;
  });
}

/**
 * Test if a fetch request is blocked
 */
async function testFetch(url: string, timeout: number = 3000): Promise<{ blocked: boolean; loadTime: number | null }> {
  const startTime = performance.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      mode: 'no-cors',
    });
    clearTimeout(timeoutId);
    return { blocked: false, loadTime: performance.now() - startTime };
  } catch {
    clearTimeout(timeoutId);
    return { blocked: true, loadTime: null };
  }
}

/**
 * Run all blocker tests
 */
export async function runBlockerTests(
  baseUrl: string = '',
  timeout: number = 3000
): Promise<BlockerAnalysis> {
  const controlProbe = await testScript(baseUrl + CONTROL_PROBE_URL, {
    timeout,
    control: true,
  });

  if (controlProbe.status !== 'loaded') {
    return createInconclusiveAnalysis(controlProbe.reason);
  }

  const results: BlockerTestResult[] = [];

  // Test each bait resource
  for (const resource of BAIT_RESOURCES) {
    const url = baseUrl + resource.url;
    const testResult = await testScript(url, {
      timeout,
      resourceId: resource.id,
    });

    results.push({
      resource,
      blocked: testResult.blocked,
      status: testResult.status,
      loadTime: testResult.loadTime,
      method: 'script',
      reason: testResult.reason,
    });
  }

  // Analyze results
  return analyzeResults(results);
}

/**
 * Quick blocker detection (faster, fewer tests)
 */
export async function quickBlockerDetect(): Promise<QuickBlockerDetectResult> {
  const controlProbe = await testScript(CONTROL_PROBE_URL, {
    timeout: 1000,
    control: true,
  });

  if (controlProbe.status !== 'loaded') {
    return { detected: false, type: 'none', inconclusive: true };
  }

  const tests = [
    { id: 'quick-ads', url: '/bait/ads/ad.js', category: 'ads' },
    { id: 'quick-analytics', url: '/bait/analytics/analytics.js', category: 'analytics' },
    { id: 'quick-social', url: '/bait/social/social.js', category: 'social' },
  ];

  let blocked = 0;

  for (const test of tests) {
    const result = await testScript(test.url, {
      timeout: 1000,
      resourceId: test.id,
    });
    if (result.status === 'inconclusive') {
      return { detected: false, type: 'none', inconclusive: true };
    }
    if (result.blocked) blocked++;
  }

  if (blocked === 0) {
    return { detected: false, type: 'none', inconclusive: false };
  } else if (blocked === 1) {
    return { detected: true, type: 'basic', inconclusive: false };
  } else if (blocked === 2) {
    return { detected: true, type: 'standard', inconclusive: false };
  } else {
    return { detected: true, type: 'aggressive', inconclusive: false };
  }
}

/**
 * Analyze test results
 */
function analyzeResults(results: BlockerTestResult[]): BlockerAnalysis {
  // Calculate category scores
  const categoryScores: Record<string, BlockerCategoryScore> = {};

  for (const result of results) {
    const cat = result.resource.category;
    if (!categoryScores[cat]) {
      categoryScores[cat] = {
        blocked: 0,
        total: 0,
        measured: 0,
        inconclusive: 0,
        score: 0,
      };
    }
    categoryScores[cat].total++;
    if (result.status === 'inconclusive') {
      categoryScores[cat].inconclusive++;
      continue;
    }
    categoryScores[cat].measured++;
    if (result.blocked) {
      categoryScores[cat].blocked++;
    }
  }

  // Calculate scores for each category
  for (const cat of Object.keys(categoryScores)) {
    const { blocked, measured } = categoryScores[cat];
    categoryScores[cat].score = measured > 0 ? Math.round((blocked / measured) * 100) : 0;
  }

  // Overall effectiveness
  const totalBlocked = results.filter(r => r.status === 'blocked').length;
  const measuredCount = results.filter(r => r.status !== 'inconclusive').length;
  const inconclusiveCount = results.length - measuredCount;
  const effectiveness = measuredCount > 0
    ? Math.round((totalBlocked / measuredCount) * 100)
    : 0;

  // Try to identify the blocker
  const { name, version } = measuredCount > 0
    ? identifyBlocker(results, effectiveness)
    : { name: null, version: null };

  // Generate recommendations
  const recommendations = generateRecommendations(
    categoryScores,
    effectiveness,
    inconclusiveCount
  );

  return {
    detected: measuredCount > 0 && effectiveness > 0,
    name,
    version,
    effectiveness,
    categoryScores,
    results,
    recommendations,
    inconclusive: measuredCount === 0,
    measuredCount,
    inconclusiveCount,
    message: measuredCount === 0
      ? 'The control probe did not execute, so the page could not verify its own bait files.'
      : inconclusiveCount > 0
      ? `${inconclusiveCount} tracker probe${inconclusiveCount === 1 ? '' : 's'} could not be verified and were excluded from scoring.`
      : null,
  };
}

function createInconclusiveAnalysis(reason: string): BlockerAnalysis {
  const results: BlockerTestResult[] = BAIT_RESOURCES.map((resource) => ({
    resource,
    blocked: false,
    status: 'inconclusive',
    loadTime: null,
    method: 'script',
    reason: `control-${reason}`,
  }));

  const categoryScores = BAIT_RESOURCES.reduce<Record<string, BlockerCategoryScore>>(
    (acc, resource) => {
      const category = resource.category;
      if (!acc[category]) {
        acc[category] = {
          blocked: 0,
          total: 0,
          measured: 0,
          inconclusive: 0,
          score: 0,
        };
      }
      acc[category].total++;
      acc[category].inconclusive++;
      return acc;
    },
    {}
  );

  return {
    detected: false,
    name: null,
    version: null,
    effectiveness: 0,
    categoryScores,
    results,
    recommendations: [
      'This run is inconclusive because the control probe did not execute. That usually means the page could not verify its own bait assets, so treating every failure as "blocked" would be misleading.',
      'Reload the page and try again. If it still fails, check whether a network policy, CSP override, or extension is blocking first-party /bait/ scripts entirely.',
    ],
    inconclusive: true,
    measuredCount: 0,
    inconclusiveCount: results.length,
    message: 'The control probe failed before the blocker checks started, so no protection score was computed.',
  };
}

/**
 * Try to identify which ad blocker is being used
 */
function identifyBlocker(
  results: BlockerTestResult[],
  effectiveness: number
): { name: string | null; version: string | null } {
  if (effectiveness === 0) {
    return { name: null, version: null };
  }

  // Check for specific patterns
  const adBlocked = results.filter(
    r => r.resource.category === 'advertising' && r.status === 'blocked'
  ).length;
  const analyticsBlocked = results.filter(
    r => r.resource.category === 'analytics' && r.status === 'blocked'
  ).length;
  const socialBlocked = results.filter(
    r => r.resource.category === 'social' && r.status === 'blocked'
  ).length;
  const fpBlocked = results.filter(
    r => r.resource.category === 'fingerprinting' && r.status === 'blocked'
  ).length;
  const malwareBlocked = results.filter(
    r => r.resource.category === 'malware' && r.status === 'blocked'
  ).length;

  // uBlock Origin typically blocks everything
  if (effectiveness >= 90 && malwareBlocked > 0 && fpBlocked > 0) {
    return { name: 'uBlock Origin', version: null };
  }

  // Brave has built-in blocking
  if (navigator.userAgent.includes('Brave') && effectiveness > 50) {
    return { name: 'Brave Shields', version: null };
  }

  // Firefox Enhanced Tracking Protection
  if (navigator.userAgent.includes('Firefox') && effectiveness > 30 && socialBlocked > 0) {
    return { name: 'Firefox Enhanced Tracking Protection', version: null };
  }

  // AdBlock Plus
  if (adBlocked > 0 && analyticsBlocked === 0) {
    return { name: 'AdBlock or AdBlock Plus', version: null };
  }

  // Generic detection
  if (effectiveness > 60) {
    return { name: 'Content Blocker', version: null };
  }

  return { name: 'Basic Ad Blocker', version: null };
}

/**
 * Generate recommendations based on test results
 */
function generateRecommendations(
  categoryScores: Record<string, BlockerCategoryScore>,
  effectiveness: number,
  inconclusiveCount: number
): string[] {
  const recommendations: string[] = [];

  if (inconclusiveCount > 0) {
    recommendations.push(
      `${inconclusiveCount} probe${inconclusiveCount === 1 ? '' : 's'} could not be verified and were left out of the score. A fully green "blocked" reading is only trustworthy when the control probe succeeds.`
    );
  }

  if (effectiveness === 0) {
    recommendations.push(
      'Install an ad blocker like uBlock Origin for comprehensive protection'
    );
    return recommendations;
  }

  if (effectiveness < 50) {
    recommendations.push(
      'Your ad blocker is providing limited protection. Consider upgrading to uBlock Origin'
    );
  }

  if (categoryScores.analytics?.score < 50) {
    recommendations.push(
      'Many analytics trackers are not blocked. Enable stricter blocking or add filter lists'
    );
  }

  if (categoryScores.social?.score < 50) {
    recommendations.push(
      'Social media trackers are still loading. Block Facebook, Twitter widgets in your blocker settings'
    );
  }

  if (categoryScores.fingerprinting?.score < 100) {
    recommendations.push(
      'Fingerprinting scripts are not fully blocked. Consider using a browser with built-in protection like Brave or Firefox'
    );
  }

  if (categoryScores.malware?.score < 100) {
    recommendations.push(
      'Your blocker may not protect against malicious scripts. Update your filter lists'
    );
  }

  if (effectiveness >= 80) {
    recommendations.push(
      'Good protection! Keep your filter lists updated for continued security'
    );
  }

  return recommendations;
}

/**
 * Get list of bait resources for client-side testing
 */
export function getBaitResources(): BaitResource[] {
  return [...BAIT_RESOURCES];
}

/**
 * Get categories of trackers
 */
export function getTrackerCategories(): string[] {
  return ['analytics', 'advertising', 'social', 'fingerprinting', 'malware'];
}
