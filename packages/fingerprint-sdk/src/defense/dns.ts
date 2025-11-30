/**
 * DNS Leak Detection
 *
 * Checks if DNS requests are leaking outside of VPN tunnel,
 * which can reveal your browsing history to your ISP.
 */

export interface DNSLeakResult {
  leaking: boolean;
  resolvers: DNSResolver[];
  isEncrypted: boolean;
  provider: string | null;
  recommendations: string[];
}

export interface DNSResolver {
  ip: string;
  hostname?: string;
  isp?: string;
  country?: string;
  isSecure: boolean;
}

// Known secure DNS providers
const SECURE_DNS_PROVIDERS: Record<string, { name: string; ips: string[] }> = {
  cloudflare: {
    name: 'Cloudflare',
    ips: ['1.1.1.1', '1.0.0.1', '2606:4700:4700::1111', '2606:4700:4700::1001'],
  },
  google: {
    name: 'Google Public DNS',
    ips: ['8.8.8.8', '8.8.4.4', '2001:4860:4860::8888', '2001:4860:4860::8844'],
  },
  quad9: {
    name: 'Quad9',
    ips: ['9.9.9.9', '149.112.112.112', '2620:fe::fe', '2620:fe::9'],
  },
  opendns: {
    name: 'OpenDNS',
    ips: ['208.67.222.222', '208.67.220.220'],
  },
  nextdns: {
    name: 'NextDNS',
    ips: ['45.90.28.0', '45.90.30.0'],
  },
  adguard: {
    name: 'AdGuard DNS',
    ips: ['94.140.14.14', '94.140.15.15'],
  },
};

/**
 * Detect DNS leaks by checking which DNS resolvers are being used
 * This requires a server-side component to work properly
 */
export async function detectDNSLeak(
  apiEndpoint: string = '/api/v1/defense/dns'
): Promise<DNSLeakResult> {
  try {
    // Generate unique subdomain for this test
    const testId = generateTestId();
    const testDomain = `${testId}.dns-test.panopticlick.org`;

    // Make request that will reveal DNS resolver
    const response = await fetch(`${apiEndpoint}?test=${testId}`);
    const data = await response.json();

    if (!data.success) {
      throw new Error('DNS leak test failed');
    }

    const resolvers: DNSResolver[] = data.resolvers || [];
    const provider = identifyDNSProvider(resolvers);
    const isEncrypted = checkDNSEncryption(resolvers, provider);
    const leaking = checkForLeak(resolvers, provider);

    return {
      leaking,
      resolvers,
      isEncrypted,
      provider,
      recommendations: generateDNSRecommendations(leaking, isEncrypted, provider),
    };
  } catch (error) {
    // Return a safe default if test fails
    return {
      leaking: false,
      resolvers: [],
      isEncrypted: false,
      provider: null,
      recommendations: [
        'Unable to complete DNS leak test. This may be due to network restrictions.',
        'Consider using a secure DNS provider like Cloudflare (1.1.1.1) or Quad9 (9.9.9.9)',
      ],
    };
  }
}

/**
 * Quick DNS provider detection (client-side only)
 */
export async function quickDNSCheck(): Promise<{
  provider: string | null;
  isSecure: boolean;
}> {
  // This is a heuristic check - real DNS detection requires server-side
  // We can only detect if DoH/DoT is likely being used

  // Check if browser supports secure DNS
  const hasSecureContext = window.isSecureContext;

  // Try to detect based on common patterns
  // This is not 100% accurate but gives a reasonable estimate

  return {
    provider: null, // Can't reliably detect client-side
    isSecure: hasSecureContext,
  };
}

/**
 * Generate unique test ID
 */
function generateTestId(): string {
  const array = new Uint8Array(8);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Identify DNS provider from resolver IPs
 */
function identifyDNSProvider(resolvers: DNSResolver[]): string | null {
  for (const resolver of resolvers) {
    for (const [key, provider] of Object.entries(SECURE_DNS_PROVIDERS)) {
      if (provider.ips.includes(resolver.ip)) {
        return provider.name;
      }
    }
  }

  return null;
}

/**
 * Check if DNS is likely encrypted (DoH/DoT)
 */
function checkDNSEncryption(resolvers: DNSResolver[], provider: string | null): boolean {
  // If using a known secure provider, likely encrypted
  if (provider) {
    return true;
  }

  // Check if all resolvers are marked as secure
  return resolvers.every(r => r.isSecure);
}

/**
 * Check if there's a DNS leak
 */
function checkForLeak(resolvers: DNSResolver[], provider: string | null): boolean {
  // If no resolvers detected, can't determine
  if (resolvers.length === 0) {
    return false;
  }

  // If using ISP DNS (no known provider), likely leaking
  if (!provider) {
    return true;
  }

  // Multiple different providers might indicate a leak
  const countries = new Set(resolvers.map(r => r.country).filter(Boolean));
  if (countries.size > 2) {
    return true;
  }

  return false;
}

/**
 * Generate recommendations based on DNS leak results
 */
function generateDNSRecommendations(
  leaking: boolean,
  isEncrypted: boolean,
  provider: string | null
): string[] {
  const recommendations: string[] = [];

  if (leaking) {
    recommendations.push(
      'Your DNS queries may be visible to your ISP. ' +
      'This reveals the websites you visit even when using a VPN.'
    );
  }

  if (!isEncrypted) {
    recommendations.push(
      'Your DNS queries are not encrypted. ' +
      'Enable DNS-over-HTTPS (DoH) in your browser settings.'
    );
  }

  if (!provider) {
    recommendations.push(
      'You appear to be using your ISP\'s DNS servers. ' +
      'Switch to a privacy-focused DNS like Cloudflare (1.1.1.1) or Quad9 (9.9.9.9).'
    );
  }

  // Browser-specific recommendations
  const ua = navigator.userAgent.toLowerCase();

  if (ua.includes('firefox')) {
    recommendations.push(
      'In Firefox, go to Settings > Privacy & Security > DNS over HTTPS and enable it with Cloudflare or NextDNS'
    );
  } else if (ua.includes('chrome')) {
    recommendations.push(
      'In Chrome, go to Settings > Privacy and Security > Security > Use secure DNS with Cloudflare or Google'
    );
  } else if (ua.includes('brave')) {
    recommendations.push(
      'In Brave, go to Settings > Privacy and Security > Security > Use secure DNS'
    );
  }

  if (!leaking && isEncrypted && provider) {
    recommendations.push(
      `Good! You\'re using ${provider} with encrypted DNS. Your DNS queries are protected.`
    );
  }

  return recommendations;
}

/**
 * Get list of recommended secure DNS providers
 */
export function getSecureDNSProviders(): Array<{
  name: string;
  primaryIP: string;
  secondaryIP: string;
  dohUrl: string;
  features: string[];
}> {
  return [
    {
      name: 'Cloudflare',
      primaryIP: '1.1.1.1',
      secondaryIP: '1.0.0.1',
      dohUrl: 'https://cloudflare-dns.com/dns-query',
      features: ['Fast', 'Privacy-focused', 'No logging'],
    },
    {
      name: 'Quad9',
      primaryIP: '9.9.9.9',
      secondaryIP: '149.112.112.112',
      dohUrl: 'https://dns.quad9.net/dns-query',
      features: ['Malware blocking', 'Privacy-focused', 'No logging'],
    },
    {
      name: 'Google Public DNS',
      primaryIP: '8.8.8.8',
      secondaryIP: '8.8.4.4',
      dohUrl: 'https://dns.google/dns-query',
      features: ['Fast', 'Reliable', 'Some logging'],
    },
    {
      name: 'NextDNS',
      primaryIP: '45.90.28.0',
      secondaryIP: '45.90.30.0',
      dohUrl: 'https://dns.nextdns.io',
      features: ['Customizable', 'Ad blocking', 'Analytics'],
    },
    {
      name: 'AdGuard DNS',
      primaryIP: '94.140.14.14',
      secondaryIP: '94.140.15.15',
      dohUrl: 'https://dns.adguard.com/dns-query',
      features: ['Ad blocking', 'Tracker blocking', 'Parental controls'],
    },
  ];
}
