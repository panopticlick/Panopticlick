/**
 * RTB Routes
 * Real-Time Bidding simulation endpoints
 */

import { Hono } from 'hono';
import type { Env } from '../types';
import { RTBSimulateSchema, validateRequest } from '../schemas/validation';
import type {
  FingerprintPayload,
  RTBSimulateRequest,
  RTBSimulateResponse,
} from '@panopticlick/types';

const rtb = new Hono<{ Bindings: Env }>();

/**
 * POST /rtb/simulate
 * Simulate an RTB auction for the given fingerprint
 */
rtb.post('/simulate', async (c) => {
  try {
    const body = await c.req.json();
    const validation = validateRequest(RTBSimulateSchema, body);

    if (!validation.success) {
      return c.json({ success: false, error: validation.error }, 400);
    }

    const { fingerprint, sessionId } = validation.data;

    // Import valuation engine
    const {
      simulateRTBAuction,
      calculateAnnualValue,
      generateEntropyReport,
    } = await import('@panopticlick/valuation-engine');

    // Run RTB simulation
    const auctionResult = simulateRTBAuction(fingerprint as FingerprintPayload);
    const entropyReport = generateEntropyReport(fingerprint as FingerprintPayload);

    // Calculate annual value
    const annualValue = calculateAnnualValue(auctionResult.averageCPM);

    // Build response
    const response: RTBSimulateResponse = {
      success: true,
      auction: {
        bids: auctionResult.bids,
        winner: auctionResult.winner,
        totalValue: auctionResult.totalValue,
        averageCPM: auctionResult.averageCPM,
      },
      valuation: {
        cpm: auctionResult.averageCPM,
        annualValue: annualValue.annualValue,
        explanation: annualValue.explanation,
      },
      personas: auctionResult.personas,
      entropy: {
        totalBits: entropyReport.totalBits,
        tier: entropyReport.tier,
        multiplier: auctionResult.entropyMultiplier,
      },
      timestamp: Date.now(),
    };

    // Log to analytics
    c.env.ANALYTICS.writeDataPoint({
      blobs: [entropyReport.tier, auctionResult.winner?.bidder || 'none'],
      doubles: [auctionResult.averageCPM, entropyReport.totalBits],
      indexes: ['rtb_simulate'],
    });

    // Store RTB simulation results (new table)
    if (sessionId) {
      const simulationId = crypto.randomUUID();
      await c.env.DB.prepare(`
        INSERT INTO rtb_simulations
        (id, session_id, winning_bid_cpm, winning_dsp, total_bidders, inferred_persona, estimated_annual_value)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `)
        .bind(
          simulationId,
          sessionId,
          auctionResult.winner?.amount || 0,
          auctionResult.winner?.bidder || 'none',
          auctionResult.bids.length,
          JSON.stringify(auctionResult.personas || []),
          annualValue.annualValue
        )
        .run();

      // Store individual bids (new table)
      for (const bid of auctionResult.bids) {
        await c.env.DB.prepare(`
          INSERT INTO rtb_bids (simulation_id, dsp_name, bid_cpm, interest_category, is_winner)
          VALUES (?, ?, ?, ?, ?)
        `)
          .bind(
            simulationId,
            bid.bidder,
            bid.amount,
            (bid as any).category || null,
            bid === auctionResult.winner ? 1 : 0
          )
          .run();
      }
    }

    return c.json(response);
  } catch (error) {
    console.error('RTB simulation error:', error);
    return c.json(
      { success: false, error: 'Failed to simulate RTB auction' },
      500
    );
  }
});

/**
 * GET /rtb/bidders
 * Get list of simulated DSP bidders
 */
rtb.get('/bidders', async (c) => {
  // Return anonymized DSP profiles
  const bidders = [
    {
      id: 'premium_retail',
      name: 'Premium Retail DSP',
      type: 'retail',
      description: 'E-commerce and retail advertising',
      avgCPM: '$3-8',
    },
    {
      id: 'finance_dsp',
      name: 'Financial Services DSP',
      type: 'finance',
      description: 'Banking, investment, and insurance',
      avgCPM: '$5-15',
    },
    {
      id: 'gaming_dsp',
      name: 'Gaming & Entertainment DSP',
      type: 'entertainment',
      description: 'Games, streaming, and media',
      avgCPM: '$2-5',
    },
    {
      id: 'auto_dsp',
      name: 'Automotive DSP',
      type: 'automotive',
      description: 'Car manufacturers and dealers',
      avgCPM: '$4-10',
    },
    {
      id: 'travel_dsp',
      name: 'Travel & Hospitality DSP',
      type: 'travel',
      description: 'Airlines, hotels, and tourism',
      avgCPM: '$2-6',
    },
    {
      id: 'generic_dsp',
      name: 'Programmatic DSP',
      type: 'general',
      description: 'General programmatic advertising',
      avgCPM: '$1-3',
    },
  ];

  return c.json({ bidders });
});

/**
 * GET /rtb/personas
 * Get list of detectable user personas
 */
rtb.get('/personas', async (c) => {
  const personas = [
    {
      id: 'affluent_professional',
      name: 'Affluent Professional',
      description: 'High-income user with premium hardware',
      indicators: ['High RAM', 'High CPU cores', 'High-res display', 'High DPI'],
      valueMultiplier: 1.4,
    },
    {
      id: 'tech_enthusiast',
      name: 'Tech Enthusiast',
      description: 'Early adopter with latest browser features',
      indicators: ['WebGL2', 'WebAssembly', 'Service Workers', '8+ cores'],
      valueMultiplier: 1.3,
    },
    {
      id: 'gamer',
      name: 'Gamer',
      description: 'Gaming-focused hardware configuration',
      indicators: ['High-end GPU', '8+ cores', 'No touch', 'High resolution'],
      valueMultiplier: 1.2,
    },
    {
      id: 'mobile_user',
      name: 'Mobile User',
      description: 'Primary mobile device user',
      indicators: ['Touch support', 'Small screen', 'Mobile UA'],
      valueMultiplier: 0.9,
    },
    {
      id: 'privacy_conscious',
      name: 'Privacy Conscious',
      description: 'User with privacy tools enabled',
      indicators: ['DNT enabled', 'GPC enabled', 'Fingerprint blocking'],
      valueMultiplier: 0.6,
    },
  ];

  return c.json({ personas });
});

/**
 * GET /rtb/stats
 * Get aggregate RTB statistics
 */
rtb.get('/stats', async (c) => {
  // Try to get cached stats
  const cached = await c.env.CACHE.get('rtb_stats', 'json');

  if (cached) {
    return c.json(cached);
  }

  // Calculate fresh stats from DB
  const stats = await c.env.DB.prepare(
    `SELECT
      COUNT(*) as total_simulations,
      AVG(entropy_bits) as avg_entropy,
      COUNT(DISTINCT fingerprint_hash) as unique_fingerprints
    FROM sessions
    WHERE created_at > datetime('now', '-7 days')`
  ).first();

  // Get CPM distribution (mock for now since we don't store CPM)
  const response = {
    totalSimulations: stats?.total_simulations || 0,
    averageEntropy: stats?.avg_entropy || 30,
    uniqueFingerprints: stats?.unique_fingerprints || 0,
    cpmDistribution: {
      low: 0.25, // < $2
      medium: 0.45, // $2-5
      high: 0.22, // $5-10
      premium: 0.08, // > $10
    },
    topPersonas: [
      { id: 'tech_enthusiast', percentage: 0.32 },
      { id: 'affluent_professional', percentage: 0.28 },
      { id: 'general', percentage: 0.25 },
      { id: 'privacy_conscious', percentage: 0.10 },
      { id: 'student', percentage: 0.05 },
    ],
    updatedAt: Date.now(),
  };

  // Cache for 1 hour
  await c.env.CACHE.put('rtb_stats', JSON.stringify(response), {
    expirationTtl: 3600,
  });

  return c.json(response);
});

/**
 * GET /rtb/market
 * Market reference data (static for now)
 */
rtb.get('/market', (c) => {
  return c.json({
    averageCPM: 4,
    priceRanges: {
      low: { min: 0.5, max: 2, avg: 1.2 },
      medium: { min: 2, max: 5, avg: 3.5 },
      high: { min: 5, max: 10, avg: 7 },
      premium: { min: 10, max: 20, avg: 14 },
    },
    topCategories: [
      { name: 'tech', cpm: 5.5, volume: 120 },
      { name: 'finance', cpm: 8.2, volume: 80 },
      { name: 'gaming', cpm: 3.1, volume: 150 },
    ],
  });
});

export { rtb };
