'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Document,
  DocumentHeader,
  DocumentSection,
  Stamp,
  Button,
  EntropyMeter,
} from '@/components/ui';
import { api } from '@/lib/api-client';
import { formatCPM } from '@/lib/utils';
import type { FingerprintPayload, RTBBid, Persona } from '@panopticlick/types';

export default function RTBSimulatorPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [phase, setPhase] = useState<'idle' | 'collecting' | 'bidding' | 'complete'>('idle');
  const [fingerprint, setFingerprint] = useState<FingerprintPayload | null>(null);
  const [bids, setBids] = useState<RTBBid[]>([]);
  const [winner, setWinner] = useState<RTBBid | null>(null);
  const [averageCPM, setAverageCPM] = useState(0);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [entropyBits, setEntropyBits] = useState<number | null>(null);
  const [totalTime, setTotalTime] = useState(0);
  const [valueSource, setValueSource] = useState<'api' | 'local'>('local');
  const [apiError, setApiError] = useState<string | null>(null);

  const runSimulation = async () => {
    setIsRunning(true);
    setApiError(null);
    setPhase('collecting');
    setBids([]);
    setWinner(null);
    const started = performance.now();

    try {
      const sdk = await import('@panopticlick/fingerprint-sdk');
      const engine = await import('@panopticlick/valuation-engine');

      const fp = await sdk.collectFingerprint({
        consentGiven: false,
        timeout: 3000,
        skip: { audio: true },
      });

      setFingerprint(fp);
      setPhase('bidding');

      // Local simulation for instant feedback
      const localSim = engine.simulateRTBAuction(fp);
      const entropyReport = engine.generateEntropyReport(fp);

      setBids(localSim.bids);
      setWinner(localSim.winner);
      setAverageCPM(localSim.averageCPM);
      setPersonas(localSim.personas);
      setEntropyBits(entropyReport.totalBits);
      setValueSource('local');

      // Try to augment with API-backed simulation (population stats, market multipliers)
      try {
        const apiResult = await api.rtb.simulate(fp);
        const apiBids = (apiResult as any)?.auction?.bids || [];

        if (apiBids.length > 0) {
          const mappedBids: RTBBid[] = apiBids.map((bid: any, index: number) => ({
            bidder: bid.bidder || bid.name || `DSP ${index + 1}`,
            amount: bid.amount ?? bid.bid ?? 0,
            interest: bid.interest || bid.type || 'general',
            confidence: bid.confidence ?? 0.8,
            timestamp: Date.now(),
          }));

          const apiWinner = (apiResult as any)?.auction?.winner;
          const mappedWinner: RTBBid | null = apiWinner
            ? {
                bidder: apiWinner.bidder || apiWinner.name || mappedBids[0]?.bidder || 'Winner',
                amount: apiWinner.amount ?? apiWinner.winningBid ?? mappedBids[0]?.amount ?? 0,
                interest: apiWinner.interest || apiWinner.type || mappedBids[0]?.interest || 'general',
                confidence: apiWinner.confidence ?? 0.9,
                timestamp: Date.now(),
              }
            : mappedBids[0] || null;

          setBids(mappedBids);
          setWinner(mappedWinner);
          setAverageCPM((apiResult as any)?.auction?.averageCPM ?? localSim.averageCPM);
          if ((apiResult as any)?.personas) {
            setPersonas((apiResult as any).personas as Persona[]);
          }
          if ((apiResult as any)?.entropy?.totalBits) {
            setEntropyBits((apiResult as any).entropy.totalBits);
          }
          setValueSource('api');
        }
      } catch (err) {
        console.warn('RTB API unavailable, using local simulation', err);
        setApiError('API unavailable, using local simulator');
      }

      setTotalTime(Math.max(50, Math.round(performance.now() - started)));
      setPhase('complete');
    } catch (err) {
      console.error('RTB simulation failed', err);
      setApiError('Failed to collect fingerprint for simulation.');
      setPhase('complete');
    } finally {
      setIsRunning(false);
    }
  };

  const personaNames = personas.map((p) => p.name);
  const signalChips = fingerprint
    ? [
        `Timezone: ${fingerprint.software.timezone}`,
        `Language: ${fingerprint.software.language}`,
        `Platform: ${fingerprint.software.platform}`,
        `Screen: ${fingerprint.hardware.screen.width}x${fingerprint.hardware.screen.height}@${fingerprint.hardware.screen.pixelRatio}`,
        fingerprint.hardware.webgl?.renderer
          ? `GPU: ${fingerprint.hardware.webgl.renderer}`
          : 'GPU: unknown',
        fingerprint.software.doNotTrack
          ? 'Do Not Track: enabled'
          : 'Do Not Track: not set',
      ]
    : [];

  return (
    <div className="bg-paper grid-bg">
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <Document variant="classified" watermark="RTB AUCTION">
          <DocumentHeader
            title="Real-Time Bidding Simulator"
            subtitle="Watch advertisers bid for your attention"
            classification="confidential"
            date={new Date()}
          />

          <nav className="mb-8 p-4 bg-paper-100 rounded-sm">
            <span className="text-xs font-mono text-ink-300 uppercase tracking-wider">
              Navigate:{' '}
            </span>
            <Link href="/simulation/" className="text-sm hover:underline">
              Simulation Lab
            </Link>
            <span className="text-ink-300 mx-2">→</span>
            <span className="text-sm font-bold">RTB Auction</span>
          </nav>

          <div className="prose prose-lg max-w-none mb-8">
            <p>
              Every time you visit a website with ads, an auction happens in under 100 milliseconds.
              Advertisers receive your profile data and compete to show you an ad. This simulator
              demonstrates what that looks like from the inside.
            </p>
          </div>

          {/* Control Panel */}
          <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <Button
              variant="primary"
              size="lg"
              onClick={runSimulation}
              disabled={isRunning}
              className="w-full md:w-auto px-8"
            >
              {isRunning ? 'Running auction...' : 'Start Auction with My Fingerprint'}
            </Button>

            <div className="flex items-center gap-2 text-xs text-ink-300">
              <span className="uppercase tracking-wider">Data source</span>
              <span
                className={`px-2 py-1 rounded-sm font-mono border ${
                  valueSource === 'api'
                    ? 'bg-alert-green/10 text-alert-green border-alert-green/30'
                    : 'bg-paper-200 text-ink-300 border-paper-300'
                }`}
              >
                {valueSource === 'api' ? 'API-backed' : 'Local simulator'}
              </span>
            </div>
          </div>

          {apiError && (
            <div className="mb-6 rounded-sm border border-alert-orange/30 bg-alert-orange/10 px-4 py-3 text-sm text-alert-orange">
              {apiError}
            </div>
          )}

          {/* Simulation Display */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* User Profile Panel */}
            <div className="document p-4">
              <h3 className="font-mono text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className={phase === 'collecting' ? 'text-highlight' : ''}>
                  {phase === 'collecting' ? '⟳' : '📊'}
                </span>
                Your Data Profile
              </h3>

              <AnimatePresence mode="wait">
                {fingerprint ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="bg-paper-200 p-2 rounded-sm">
                        <div className="text-xs text-ink-300">Timezone</div>
                        <div className="font-mono">{fingerprint.software.timezone}</div>
                      </div>
                      <div className="bg-paper-200 p-2 rounded-sm">
                        <div className="text-xs text-ink-300">Language</div>
                        <div className="font-mono">{fingerprint.software.language}</div>
                      </div>
                      <div className="bg-paper-200 p-2 rounded-sm">
                        <div className="text-xs text-ink-300">Platform</div>
                        <div className="font-mono">{fingerprint.software.platform}</div>
                      </div>
                      <div className="bg-paper-200 p-2 rounded-sm">
                        <div className="text-xs text-ink-300">Screen</div>
                        <div className="font-mono">
                          {fingerprint.hardware.screen.width}x{fingerprint.hardware.screen.height} @
                          {fingerprint.hardware.screen.pixelRatio}x
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-ink-300 uppercase mb-1">Detected Personas</div>
                      <div className="flex flex-wrap gap-1">
                        {personaNames.length > 0 ? (
                          personaNames.map((persona) => (
                            <span key={persona} className="text-xs px-2 py-1 bg-highlight/20 rounded-sm">
                              {persona}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-ink-300">General profile</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-ink-300 uppercase mb-1">Signals Advertisers See</div>
                      <ul className="text-xs space-y-1">
                        {signalChips.map((signal) => (
                          <li key={signal} className="text-ink-200">• {signal}</li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                ) : (
                  <div className="text-center text-ink-300 py-8">
                    <p className="font-mono text-sm">Start the auction to see your live profile.</p>
                  </div>
                )}
              </AnimatePresence>
            </div>

            {/* Bidding Panel */}
            <div className="document p-4">
              <h3 className="font-mono text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className={phase === 'bidding' ? 'text-highlight' : ''}>
                  {phase === 'bidding' ? '⟳' : '💰'}
                </span>
                Live Bids
              </h3>

              <div className="space-y-2">
                <AnimatePresence>
                  {bids.map((bid, index) => (
                    <motion.div
                      key={`${bid.bidder}-${index}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`p-3 rounded-sm text-sm ${
                        winner?.bidder === bid.bidder
                          ? 'bg-alert-green/20 border-l-4 border-alert-green'
                          : 'bg-paper-100'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-bold">{bid.bidder}</div>
                          <div className="text-xs text-ink-300 capitalize">{bid.interest}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-mono font-bold text-lg">
                            {formatCPM(bid.amount)}
                          </div>
                          <div className="text-xs text-ink-300">
                            {Math.round((bid.confidence ?? 0.5) * 100)}% match
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {bids.length === 0 && (
                  <div className="text-center text-ink-300 py-8">
                    <p className="font-mono text-sm">Waiting for bids...</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Results Panel */}
          <AnimatePresence>
            {phase === 'complete' && bids.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <DocumentSection title="Auction Results">
                  <div className="bg-alert-green/10 border-l-4 border-alert-green p-6 rounded-sm">
                    <div className="grid md:grid-cols-3 gap-6">
                      <div>
                        <div className="text-xs text-ink-300 uppercase mb-1">Winner</div>
                        <div className="text-2xl font-bold">{(winner || bids[0]).bidder}</div>
                        <div className="text-sm text-ink-200 capitalize">{(winner || bids[0]).interest}</div>
                      </div>
                      <div>
                        <div className="text-xs text-ink-300 uppercase mb-1">Winning Bid (CPM)</div>
                        <div className="text-2xl font-bold text-alert-green">
                          {formatCPM((winner || bids[0]).amount)}
                        </div>
                        <div className="text-xs text-ink-200">
                          Average across bidders: {formatCPM(averageCPM)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-ink-300 uppercase mb-1">Total Auction Time</div>
                        <div className="text-2xl font-bold">{totalTime}ms</div>
                        <div className="text-xs text-ink-200">
                          {bids.length} bidders evaluated you in real-time
                        </div>
                      </div>
                    </div>
                  </div>

                  {entropyBits !== null && (
                    <div className="mt-6">
                      <EntropyMeter bits={entropyBits} />
                    </div>
                  )}

                  <div className="mt-6 grid md:grid-cols-2 gap-4">
                    <div className="bg-paper-100 p-4 rounded-sm">
                      <h4 className="font-mono text-sm font-bold mb-2">What Just Happened</h4>
                      <ol className="text-sm text-ink-200 space-y-1">
                        <li>1. Your fingerprint was packaged and sent to an ad exchange</li>
                        <li>2. {bids.length} DSPs evaluated your profile against live campaigns</li>
                        <li>3. Bids arrived in ~{totalTime}ms; the highest CPM won</li>
                        <li>4. Even losing bidders still saw your profile data</li>
                      </ol>
                    </div>
                    <div className="bg-paper-100 p-4 rounded-sm">
                      <h4 className="font-mono text-sm font-bold mb-2">Your Market Position</h4>
                      <div className="text-sm text-ink-200 space-y-1">
                        <p>• Top personas: {personaNames.slice(0, 3).join(', ') || 'General'}</p>
                        <p>• Trackability: {entropyBits ? `${entropyBits.toFixed(1)} bits` : 'estimating...'}</p>
                        <p>• Value source: {valueSource === 'api' ? 'API + population stats' : 'Local simulation'}</p>
                      </div>
                    </div>
                  </div>
                </DocumentSection>
              </motion.div>
            )}
          </AnimatePresence>

          <DocumentSection title="Understanding RTB Privacy Implications">
            <div className="space-y-4">
              <div className="bg-alert-red/10 border-l-4 border-alert-red p-4">
                <h4 className="font-mono text-sm font-bold mb-2">Data Leakage</h4>
                <p className="text-sm text-ink-200">
                  Even losing bidders receive your profile data. In a single page load with
                  multiple ad slots, your data might be broadcast to hundreds of companies.
                </p>
              </div>
              <div className="bg-alert-orange/10 border-l-4 border-alert-orange p-4">
                <h4 className="font-mono text-sm font-bold mb-2">No Consent Per-Bid</h4>
                <p className="text-sm text-ink-200">
                  You consented (maybe) to the publisher. But your data flows to ad exchanges,
                  DSPs, and data partners you've never heard of. Each has their own data practices.
                </p>
              </div>
              <div className="bg-alert-orange/10 border-l-4 border-alert-orange p-4">
                <h4 className="font-mono text-sm font-bold mb-2">Location & Sensitive Data</h4>
                <p className="text-sm text-ink-200">
                  RTB bid requests often include precise location, device IDs, and inferred
                  sensitive categories (health conditions, political affiliation, religion).
                </p>
              </div>
            </div>
          </DocumentSection>
        </Document>

        <div className="flex justify-center gap-6 mt-8">
          <Stamp variant="classified">Live Simulation</Stamp>
          <Stamp variant="denied">Educational Only</Stamp>
        </div>
      </div>
    </div>
  );
}
