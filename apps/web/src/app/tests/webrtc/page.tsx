'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Document,
  DocumentHeader,
  DocumentSection,
  Stamp,
  Button,
} from '@/components/ui';
import type { WebRTCLeakResult } from '@panopticlick/fingerprint-sdk';

type TestPhase = 'ready' | 'testing' | 'complete';

export default function WebRTCTestPage() {
  const [phase, setPhase] = useState<TestPhase>('ready');
  const [result, setResult] = useState<WebRTCLeakResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runTest = useCallback(async () => {
    setPhase('testing');
    setError(null);

    try {
      const sdk = await import('@panopticlick/fingerprint-sdk');
      const leakResult = await sdk.detectWebRTCLeak(5000);
      setResult(leakResult);
      setPhase('complete');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      setPhase('complete');
    }
  }, []);

  return (
    <div className="min-h-screen bg-paper grid-bg">
      <div className="confidential-bar">WebRTC Leak Investigation</div>

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
    <Document variant="classified" watermark="WEBRTC ANALYSIS">
      <DocumentHeader
        title="WebRTC Leak Detection"
        subtitle="Is WebRTC exposing your real IP address?"
        classification="confidential"
        date={new Date()}
      />

      <div className="space-y-6">
        <div className="prose prose-lg max-w-none">
          <p className="font-serif text-xl leading-relaxed">
            <span className="marker">WebRTC</span> (Web Real-Time Communication) enables
            browser-to-browser communication for video calls, file sharing, and more.
            However, it can also <span className="font-bold">leak your real IP address</span>,
            even when you're using a VPN.
          </p>
        </div>

        <DocumentSection title="How WebRTC Leaks Happen">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-paper-100 p-4 rounded-sm">
              <h4 className="font-mono text-sm font-bold mb-2">STUN Requests</h4>
              <p className="text-sm text-ink-200">
                WebRTC uses STUN servers to discover your public IP for peer-to-peer
                connections. These requests bypass VPN tunnels.
              </p>
            </div>
            <div className="bg-paper-100 p-4 rounded-sm">
              <h4 className="font-mono text-sm font-bold mb-2">ICE Candidates</h4>
              <p className="text-sm text-ink-200">
                During connection setup, your browser reveals both local and public
                IP addresses through ICE candidate gathering.
              </p>
            </div>
          </div>
        </DocumentSection>

        <DocumentSection title="What We Test">
          <ul className="space-y-2">
            {[
              'Local network IP addresses (192.168.x.x, 10.x.x.x)',
              'Public IPv4 address',
              'IPv6 address (if available)',
              'WebRTC API availability',
              'STUN server connectivity',
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-2">
                <div className="w-2 h-2 bg-ink rounded-full" />
                <span className="font-mono text-sm">{item}</span>
              </li>
            ))}
          </ul>
        </DocumentSection>

        <div className="bg-alert-orange/10 border border-alert-orange/30 p-4 rounded-sm">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <h4 className="font-bold mb-1">VPN Users Take Note</h4>
              <p className="text-sm text-ink-200">
                If you're using a VPN, this test will reveal whether your VPN properly
                blocks WebRTC leaks. Many VPNs require additional configuration or
                browser extensions to prevent these leaks.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-center pt-4">
          <Button variant="primary" size="lg" onClick={onStart}>
            Start WebRTC Leak Test
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
          Analyzing
        </Stamp>

        <h2 className="font-serif text-2xl font-bold mt-8 mb-4">
          Gathering ICE Candidates...
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
              transition={{ duration: 5, ease: 'linear' }}
            />
          </motion.div>

          <p className="mt-4 text-sm text-ink-200">
            Connecting to STUN servers to detect IP addresses...
          </p>
        </div>

        <div className="mt-8 font-mono text-sm text-ink-300">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Checking stun:stun.l.google.com:19302...
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
          >
            Checking stun:stun.cloudflare.com:3478...
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.5 }}
          >
            Gathering ICE candidates...
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
  result: WebRTCLeakResult | null;
  error: string | null;
  onRetest: () => void;
}) {
  if (error || !result) {
    return (
      <Document variant="dossier">
        <div className="text-center py-8">
          <Stamp variant="verified">Error</Stamp>
          <h2 className="font-serif text-2xl font-bold mt-6 mb-4">
            Test Failed
          </h2>
          <p className="text-ink-200 mb-6">
            {error || 'Unable to complete WebRTC leak test'}
          </p>
          <Button variant="primary" onClick={onRetest}>
            Try Again
          </Button>
        </div>
      </Document>
    );
  }

  const isVulnerable = result.leaking;

  return (
    <div className="space-y-6">
      <Document
        variant="classified"
        watermark={isVulnerable ? 'VULNERABLE' : 'PROTECTED'}
      >
        <DocumentHeader
          title="WebRTC Leak Test Results"
          subtitle={
            isVulnerable
              ? 'Warning: IP addresses detected'
              : 'Good news: No leaks detected'
          }
          classification={isVulnerable ? 'secret' : 'confidential'}
          date={new Date()}
        />

        {/* Status Banner */}
        <motion.div
          className={`p-6 rounded-sm mb-6 ${
            isVulnerable
              ? 'bg-alert-red/10 border border-alert-red/30'
              : 'bg-alert-green/10 border border-alert-green/30'
          }`}
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
        >
          <div className="flex items-center gap-4">
            <div className="text-4xl">
              {isVulnerable ? '🚨' : '✅'}
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold">
                {isVulnerable ? 'WebRTC is leaking your IP!' : 'No WebRTC leak detected'}
              </h3>
              <p className="text-ink-200">
                {isVulnerable
                  ? 'Your real IP address can be discovered through WebRTC'
                  : 'WebRTC is either disabled or properly protected'}
              </p>
            </div>
          </div>
        </motion.div>

        {/* IP Addresses Found */}
        {(result.localIPs.length > 0 || result.publicIPs.length > 0) && (
          <DocumentSection title="Detected IP Addresses">
            <div className="bg-ink text-paper p-4 rounded-sm font-mono text-sm">
              {result.localIPs.length > 0 && (
                <div className="mb-4">
                  <div className="text-paper-300 mb-2">// Local IPs (Private Network)</div>
                  {result.localIPs.map((ip, i) => (
                    <div key={i} className="text-alert-orange">
                      {ip}
                    </div>
                  ))}
                </div>
              )}

              {result.publicIPs.length > 0 && (
                <div>
                  <div className="text-paper-300 mb-2">// Public IPs (Exposed!)</div>
                  {result.publicIPs.map((ip, i) => (
                    <div key={i} className="text-alert-red font-bold">
                      {ip}
                    </div>
                  ))}
                </div>
              )}

              {result.localIPs.length === 0 && result.publicIPs.length === 0 && (
                <div className="text-alert-green">
                  No IP addresses detected via WebRTC
                </div>
              )}
            </div>

            {result.ipv6Detected && (
              <div className="mt-4 p-3 bg-alert-orange/10 border border-alert-orange/30 rounded-sm">
                <p className="text-sm">
                  <strong>IPv6 Detected:</strong> IPv6 addresses are often more unique
                  and can be used for tracking purposes.
                </p>
              </div>
            )}
          </DocumentSection>
        )}

        {/* WebRTC Status */}
        <DocumentSection title="WebRTC Status">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 border border-paper-300 rounded-sm text-center">
              <div className="text-2xl mb-2">
                {result.localIPs.length > 0 ? '⚠️' : '✅'}
              </div>
              <div className="font-mono text-sm">Local IPs</div>
              <div className="text-xs text-ink-300">
                {result.localIPs.length} detected
              </div>
            </div>
            <div className="p-4 border border-paper-300 rounded-sm text-center">
              <div className="text-2xl mb-2">
                {result.publicIPs.length > 0 ? '🚨' : '✅'}
              </div>
              <div className="font-mono text-sm">Public IPs</div>
              <div className="text-xs text-ink-300">
                {result.publicIPs.length} detected
              </div>
            </div>
            <div className="p-4 border border-paper-300 rounded-sm text-center">
              <div className="text-2xl mb-2">
                {result.ipv6Detected ? '⚠️' : '✅'}
              </div>
              <div className="font-mono text-sm">IPv6</div>
              <div className="text-xs text-ink-300">
                {result.ipv6Detected ? 'Detected' : 'Not detected'}
              </div>
            </div>
          </div>
        </DocumentSection>

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

        {/* STUN Servers */}
        <DocumentSection title="STUN Servers Tested">
          <div className="font-mono text-sm space-y-1">
            {result.stunServers.map((server, i) => (
              <div key={i} className="text-ink-300">
                {server}
              </div>
            ))}
          </div>
        </DocumentSection>
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
        <Stamp variant={isVulnerable ? 'exposed' : 'protected'}>
          {isVulnerable ? 'Vulnerable' : 'Protected'}
        </Stamp>
        <Stamp variant="verified">Tested</Stamp>
      </div>
    </div>
  );
}
