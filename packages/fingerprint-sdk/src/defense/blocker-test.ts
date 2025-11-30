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

export interface BlockerTestResult {
  resource: BaitResource;
  blocked: boolean;
  loadTime: number | null;
  method: 'script' | 'image' | 'fetch' | 'iframe';
}

export interface BlockerAnalysis {
  detected: boolean;
  name: string | null;
  version: string | null;
  effectiveness: number;
  categoryScores: Record<string, { blocked: number; total: number; score: number }>;
  results: BlockerTestResult[];
  recommendations: string[];
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

/**
 * Test if a script resource is blocked
 */
async function testScript(url: string, timeout: number = 3000): Promise<{ blocked: boolean; loadTime: number | null }> {
  return new Promise((resolve) => {
    const startTime = performance.now();
    const script = document.createElement('script');
    script.src = url;
    script.async = true;

    const timeoutId = setTimeout(() => {
      cleanup();
      resolve({ blocked: true, loadTime: null });
    }, timeout);

    const cleanup = () => {
      clearTimeout(timeoutId);
      script.remove();
    };

    script.onload = () => {
      cleanup();
      resolve({ blocked: false, loadTime: performance.now() - startTime });
    };

    script.onerror = () => {
      cleanup();
      resolve({ blocked: true, loadTime: null });
    };

    document.head.appendChild(script);
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
  const results: BlockerTestResult[] = [];

  // Test each bait resource
  for (const resource of BAIT_RESOURCES) {
    const url = baseUrl + resource.url;
    const testResult = await testScript(url, timeout);

    results.push({
      resource,
      blocked: testResult.blocked,
      loadTime: testResult.loadTime,
      method: 'script',
    });
  }

  // Analyze results
  return analyzeResults(results);
}

/**
 * Quick blocker detection (faster, fewer tests)
 */
export async function quickBlockerDetect(): Promise<{
  detected: boolean;
  type: 'none' | 'basic' | 'standard' | 'aggressive';
}> {
  const tests = [
    { url: '/bait/ads/ad.js', category: 'ads' },
    { url: '/bait/analytics/analytics.js', category: 'analytics' },
    { url: '/bait/social/social.js', category: 'social' },
  ];

  let blocked = 0;

  for (const test of tests) {
    const result = await testScript(test.url, 1000);
    if (result.blocked) blocked++;
  }

  if (blocked === 0) {
    return { detected: false, type: 'none' };
  } else if (blocked === 1) {
    return { detected: true, type: 'basic' };
  } else if (blocked === 2) {
    return { detected: true, type: 'standard' };
  } else {
    return { detected: true, type: 'aggressive' };
  }
}

/**
 * Analyze test results
 */
function analyzeResults(results: BlockerTestResult[]): BlockerAnalysis {
  // Calculate category scores
  const categoryScores: Record<string, { blocked: number; total: number; score: number }> = {};

  for (const result of results) {
    const cat = result.resource.category;
    if (!categoryScores[cat]) {
      categoryScores[cat] = { blocked: 0, total: 0, score: 0 };
    }
    categoryScores[cat].total++;
    if (result.blocked) {
      categoryScores[cat].blocked++;
    }
  }

  // Calculate scores for each category
  for (const cat of Object.keys(categoryScores)) {
    const { blocked, total } = categoryScores[cat];
    categoryScores[cat].score = Math.round((blocked / total) * 100);
  }

  // Overall effectiveness
  const totalBlocked = results.filter(r => r.blocked).length;
  const effectiveness = Math.round((totalBlocked / results.length) * 100);

  // Try to identify the blocker
  const { name, version } = identifyBlocker(results, effectiveness);

  // Generate recommendations
  const recommendations = generateRecommendations(categoryScores, effectiveness);

  return {
    detected: effectiveness > 0,
    name,
    version,
    effectiveness,
    categoryScores,
    results,
    recommendations,
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
  const adBlocked = results.filter(r => r.resource.category === 'advertising' && r.blocked).length;
  const analyticsBlocked = results.filter(r => r.resource.category === 'analytics' && r.blocked).length;
  const socialBlocked = results.filter(r => r.resource.category === 'social' && r.blocked).length;
  const fpBlocked = results.filter(r => r.resource.category === 'fingerprinting' && r.blocked).length;
  const malwareBlocked = results.filter(r => r.resource.category === 'malware' && r.blocked).length;

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
  categoryScores: Record<string, { blocked: number; total: number; score: number }>,
  effectiveness: number
): string[] {
  const recommendations: string[] = [];

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
