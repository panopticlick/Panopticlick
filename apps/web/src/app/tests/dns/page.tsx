'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Document,
  DocumentHeader,
  DocumentSection,
  Stamp,
  Button,
} from '@/components/ui';
import type { DNSLeakResult } from '@panopticlick/fingerprint-sdk';

type TestPhase = 'ready' | 'testing' | 'complete';

interface DNSResult extends DNSLeakResult {
  isDemo?: boolean;
}

export default function DNSTestPage() {
  const [phase, setPhase] = useState<TestPhase>('ready');
  const [result, setResult] = useState<DNSResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runTest = useCallback(async () => {
    setPhase('testing');
    setError(null);

    try {
      const sdk = await import('@panopticlick/fingerprint-sdk');
      const leakResult = await sdk.detectDNSLeak('/api/v1/defense/dns');
      setResult({ ...leakResult, isDemo: false });
      setPhase('complete');
    } catch (err) {
      // Show demo data with clear indication that this is demonstration mode
      setResult({
        leaking: false,
        resolvers: [],
        isEncrypted: true,
        provider: 'Cloudflare',
        recommendations: [
          'Good! You\'re using Cloudflare with encrypted DNS. Your DNS queries are protected.',
          'In Chrome, go to Settings > Privacy and Security > Security > Use secure DNS with Cloudflare or Google',
        ],
        isDemo: true,
      });
      setPhase('complete');
    }
  }, []);

  return (
    <div className="min-h-screen bg-paper grid-bg">
      <div className="confidential-bar">DNS Leak Investigation</div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <nav className="mb-6 text-sm">
          <Link href="/tests/" className="text-ink-300 hover:text-ink">
            ← Back to Tests
          </Link>
        </nav>

        <AnimatePresence mode="wait">
          {phase === 'ready' && (
            <motion.div
              key="ready"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ReadyPhase onStart={runTest} />
            </motion.div>
          )}

          {phase === 'testing' && (
            <motion.div
              key="testing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <TestingPhase />
            </motion.div>
          )}

          {phase === 'complete' && (
            <motion.div
              key="complete"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <ResultsPhase
                result={result}
                error={error}
                onRetest={runTest}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ReadyPhase({ onStart }: { onStart: () => void }) {
  return (
    <Document variant="classified" watermark="DNS ANALYSIS">
      <DocumentHeader
        title="DNS Leak Detection"
        subtitle="Are your DNS queries revealing your browsing history?"
        classification="confidential"
        date={new Date()}
      />

      <div className="space-y-6">
        <div className="prose prose-lg max-w-none">
          <p className="font-serif text-xl leading-relaxed">
            <span className="marker">DNS</span> (Domain Name System) translates website
            names to IP addresses. When you use a VPN, your DNS queries should go
            through the VPN tunnel. A <span className="font-bold">DNS leak</span> occurs
            when queries bypass the VPN, exposing your browsing activity to your ISP.
          </p>
        </div>

        <DocumentSection title="What is a DNS Leak?">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-alert-green/10 p-4 rounded-sm border border-alert-green/30">
              <h4 className="font-mono text-sm font-bold mb-2 text-alert-green">
                ✓ Secure Configuration
              </h4>
              <p className="text-sm text-ink-200">
                Your DNS queries go through your VPN or a privacy-focused DNS
                provider like Cloudflare (1.1.1.1) or Quad9 (9.9.9.9).
              </p>
            </div>
            <div className="bg-alert-red/10 p-4 rounded-sm border border-alert-red/30">
              <h4 className="font-mono text-sm font-bold mb-2 text-alert-red">
                ✗ DNS Leak
              </h4>
              <p className="text-sm text-ink-200">
                Your DNS queries go to your ISP's DNS servers, revealing every
                website you visit even when using a VPN.
              </p>
            </div>
          </div>
        </DocumentSection>

        <DocumentSection title="Why DNS Privacy Matters">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🔍</span>
              <div>
                <h4 className="font-bold">Browsing History Exposure</h4>
                <p className="text-sm text-ink-200">
                  Your ISP can see every website you visit through DNS queries,
                  even on HTTPS sites.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">📊</span>
              <div>
                <h4 className="font-bold">Data Collection</h4>
                <p className="text-sm text-ink-200">
                  ISPs can sell this browsing data to advertisers or share it
                  with government agencies.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🎯</span>
              <div>
                <h4 className="font-bold">Targeted Advertising</h4>
                <p className="text-sm text-ink-200">
                  DNS data reveals your interests and can be used to build
                  detailed profiles for ad targeting.
                </p>
              </div>
            </div>
          </div>
        </DocumentSection>

        <DocumentSection title="Secure DNS Providers">
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { name: 'Cloudflare', ip: '1.1.1.1', feature: 'Privacy-focused' },
              { name: 'Quad9', ip: '9.9.9.9', feature: 'Malware blocking' },
              { name: 'NextDNS', ip: '45.90.28.0', feature: 'Customizable' },
            ].map((provider) => (
              <div key={provider.name} className="bg-paper-100 p-4 rounded-sm text-center">
                <div className="font-mono text-lg font-bold">{provider.ip}</div>
                <div className="font-bold">{provider.name}</div>
                <div className="text-xs text-ink-300">{provider.feature}</div>
              </div>
            ))}
          </div>
        </DocumentSection>

        <div className="flex justify-center pt-4">
          <Button variant="primary" size="lg" onClick={onStart}>
            Start DNS Leak Test
          </Button>
        </div>
      </div>
    </Document>
  );
}

function TestingPhase() {
  return (
    <Document variant="dossier">
      <div className="text-center py-12">
        <Stamp variant="classified" animated>
          Tracing
        </Stamp>

        <h2 className="font-serif text-2xl font-bold mt-8 mb-4">
          Detecting DNS Resolvers...
        </h2>

        <div className="max-w-md mx-auto">
          <motion.div
            className="h-2 bg-paper-200 rounded-full overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="h-full bg-ink"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 3, ease: 'linear' }}
            />
          </motion.div>

          <p className="mt-4 text-sm text-ink-200">
            Making DNS queries to detect which resolvers handle your requests...
          </p>
        </div>

        <div className="mt-8 font-mono text-sm text-ink-300 space-y-1">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Generating unique test subdomain...
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            Sending DNS query...
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
          >
            Identifying resolver IP addresses...
          </motion.div>
        </div>
      </div>
    </Document>
  );
}

function ResultsPhase({
  result,
  error,
  onRetest,
}: {
  result: DNSResult | null;
  error: string | null;
  onRetest: () => void;
}) {
  const [showProviders, setShowProviders] = useState(false);

  if (error || !result) {
    return (
      <Document variant="dossier">
        <div className="text-center py-8">
          <Stamp variant="verified">Error</Stamp>
          <h2 className="font-serif text-2xl font-bold mt-6 mb-4">
            Test Failed
          </h2>
          <p className="text-ink-200 mb-6">
            {error || 'Unable to complete DNS leak test'}
          </p>
          <Button variant="primary" onClick={onRetest}>
            Try Again
          </Button>
        </div>
      </Document>
    );
  }

  const isSecure = !result.leaking && result.isEncrypted;

  return (
    <div className="space-y-6">
      {/* Demo Mode Banner */}
      {result.isDemo && (
        <motion.div
          className="bg-amber-100 border border-amber-300 text-amber-800 px-4 py-3 rounded-sm"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-2">
            <span className="text-xl">ℹ️</span>
            <div>
              <strong>Demo Mode:</strong> The DNS leak test API is not available.
              Showing demonstration data. For accurate results, ensure the API
              endpoint is configured and accessible.
            </div>
          </div>
        </motion.div>
      )}

      <Document
        variant="classified"
        watermark={result.leaking ? 'LEAK DETECTED' : 'SECURE'}
      >
        <DocumentHeader
          title="DNS Leak Test Results"
          subtitle={
            result.leaking
              ? 'Warning: DNS leak detected'
              : 'Your DNS configuration appears secure'
          }
          classification={result.leaking ? 'secret' : 'confidential'}
          date={new Date()}
        />

        {/* Status Banner */}
        <motion.div
          className={`p-6 rounded-sm mb-6 ${
            result.leaking
              ? 'bg-alert-red/10 border border-alert-red/30'
              : 'bg-alert-green/10 border border-alert-green/30'
          }`}
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
        >
          <div className="flex items-center gap-4">
            <div className="text-4xl">
              {result.leaking ? '🚨' : '✅'}
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold">
                {result.leaking
                  ? 'DNS Leak Detected!'
                  : 'No DNS Leak Detected'}
              </h3>
              <p className="text-ink-200">
                {result.leaking
                  ? 'Your DNS queries may be visible to your ISP'
                  : result.provider
                  ? `Using ${result.provider} for DNS resolution`
                  : 'DNS appears to be routed securely'}
              </p>
            </div>
          </div>
        </motion.div>

        {/* DNS Status Grid */}
        <DocumentSection title="DNS Configuration Status">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 border border-paper-300 rounded-sm text-center">
              <div className="text-2xl mb-2">
                {result.leaking ? '🚨' : '✅'}
              </div>
              <div className="font-mono text-sm">DNS Leak</div>
              <div className="text-xs text-ink-300">
                {result.leaking ? 'Detected' : 'Not detected'}
              </div>
            </div>
            <div className="p-4 border border-paper-300 rounded-sm text-center">
              <div className="text-2xl mb-2">
                {result.isEncrypted ? '🔒' : '⚠️'}
              </div>
              <div className="font-mono text-sm">Encryption</div>
              <div className="text-xs text-ink-300">
                {result.isEncrypted ? 'DoH/DoT active' : 'Not encrypted'}
              </div>
            </div>
            <div className="p-4 border border-paper-300 rounded-sm text-center">
              <div className="text-2xl mb-2">
                {result.provider ? '✅' : '⚠️'}
              </div>
              <div className="font-mono text-sm">Provider</div>
              <div className="text-xs text-ink-300">
                {result.provider || 'Unknown/ISP'}
              </div>
            </div>
          </div>
        </DocumentSection>

        {/* Detected Resolvers */}
        {result.resolvers.length > 0 && (
          <DocumentSection title="Detected DNS Resolvers">
            <div className="bg-ink text-paper p-4 rounded-sm font-mono text-sm">
              {result.resolvers.map((resolver, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center py-2 border-b border-paper-300/20 last:border-0"
                >
                  <span className={resolver.isSecure ? 'text-alert-green' : 'text-alert-red'}>
                    {resolver.ip}
                  </span>
                  <span className="text-paper-400">
                    {resolver.isp || resolver.hostname || 'Unknown'}
                    {resolver.country && ` (${resolver.country})`}
                  </span>
                </div>
              ))}
            </div>
          </DocumentSection>
        )}

        {/* Recommendations */}
        {result.recommendations.length > 0 && (
          <DocumentSection title="Recommendations">
            <div className="space-y-3">
              {result.recommendations.map((rec, i) => (
                <motion.div
                  key={i}
                  className="flex items-start gap-3 p-3 bg-paper-100 rounded-sm"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className="w-6 h-6 rounded-full bg-highlight flex items-center justify-center font-mono text-sm font-bold shrink-0">
                    {i + 1}
                  </div>
                  <p className="text-sm">{rec}</p>
                </motion.div>
              ))}
            </div>
          </DocumentSection>
        )}

        {/* Secure DNS Providers Toggle */}
        <div className="border-t border-paper-300 pt-4">
          <button
            onClick={() => setShowProviders(!showProviders)}
            className="flex items-center gap-2 text-sm text-ink-300 hover:text-ink transition-colors"
          >
            <span>{showProviders ? '▼' : '▶'}</span>
            <span>View Recommended DNS Providers</span>
          </button>

          <AnimatePresence>
            {showProviders && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <SecureDNSProviders />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Document>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4">
        <Button variant="outline" onClick={onRetest}>
          Test Again
        </Button>
        <Link href="/tests/">
          <Button variant="primary">Run More Tests</Button>
        </Link>
      </div>

      {/* Stamps */}
      <div className="flex justify-center gap-6">
        <Stamp variant={isSecure ? 'protected' : 'exposed'}>
          {isSecure ? 'Secure' : 'At Risk'}
        </Stamp>
        <Stamp variant="verified">Tested</Stamp>
      </div>
    </div>
  );
}

function SecureDNSProviders() {
  const providers = [
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

  return (
    <div className="mt-4 grid gap-3">
      {providers.map((provider) => (
        <div
          key={provider.name}
          className="bg-paper-100 p-4 rounded-sm"
        >
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-bold">{provider.name}</h4>
              <div className="font-mono text-sm text-ink-300 mt-1">
                Primary: {provider.primaryIP} | Secondary: {provider.secondaryIP}
              </div>
              <div className="text-xs text-ink-300 mt-1">
                DoH: {provider.dohUrl}
              </div>
            </div>
            <div className="flex flex-wrap gap-1 justify-end">
              {provider.features.map((feature) => (
                <span
                  key={feature}
                  className="text-xs px-2 py-0.5 bg-paper-200 rounded-full"
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
