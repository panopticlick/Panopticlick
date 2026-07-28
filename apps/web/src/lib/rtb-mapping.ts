/**
 * Normalizes RTB auction responses into the shared `RTBBid` shape.
 *
 * The deployed API may be older than the contract in @panopticlick/types (field
 * names have drifted: `bid`/`amount`, `name`/`bidder`, `type`/`interest`), so
 * every value is narrowed at runtime instead of asserted.
 */

import type { Persona, RTBBid } from '@panopticlick/types';

export interface MappedAuction {
  bids: RTBBid[];
  winner: RTBBid | null;
  /** null when the response carried no usable average */
  averageCPM: number | null;
  /** null when the response carried no personas */
  personas: Persona[] | null;
  /** null when the response carried no entropy block */
  entropyBits: number | null;
}

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null;
}

function pickString(source: UnknownRecord, ...keys: string[]): string | null {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === 'string' && value.trim().length > 0) return value;
  }
  return null;
}

function pickNumber(source: UnknownRecord, ...keys: string[]): number | null {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === 'number' && Number.isFinite(value)) return value;
  }
  return null;
}

function mapBid(raw: unknown, index: number): RTBBid | null {
  if (!isRecord(raw)) return null;

  const amount = pickNumber(raw, 'amount', 'bid', 'cpm', 'winningBid');
  if (amount === null) return null;

  return {
    bidder: pickString(raw, 'bidder', 'name', 'dsp') ?? `DSP ${index + 1}`,
    amount,
    interest: pickString(raw, 'interest', 'type', 'category') ?? 'general',
    confidence: pickNumber(raw, 'confidence') ?? 0.8,
    timestamp: pickNumber(raw, 'timestamp') ?? Date.now(),
  };
}

function mapPersonas(raw: unknown): Persona[] | null {
  if (!Array.isArray(raw)) return null;

  const personas = raw.flatMap<Persona>((entry, index) => {
    if (!isRecord(entry)) return [];
    const name = pickString(entry, 'name', 'id');
    if (!name) return [];
    return [
      {
        id: pickString(entry, 'id') ?? `persona-${index}`,
        name,
        description: pickString(entry, 'description') ?? '',
        confidence: pickNumber(entry, 'confidence') ?? 0.5,
        valueMultiplier: pickNumber(entry, 'valueMultiplier', 'weight') ?? 1,
      },
    ];
  });

  return personas.length > 0 ? personas : null;
}

/**
 * Map an API auction response. Returns null when the payload carries no bids,
 * which is the caller's signal to keep the local simulation.
 */
export function mapAuctionResponse(response: unknown): MappedAuction | null {
  if (!isRecord(response)) return null;

  const auction = isRecord(response.auction) ? response.auction : null;
  if (!auction) return null;

  const rawBids = Array.isArray(auction.bids) ? auction.bids : [];
  const bids = rawBids.flatMap((bid, index) => {
    const mapped = mapBid(bid, index);
    return mapped ? [mapped] : [];
  });

  if (bids.length === 0) return null;

  const winnerFromResponse = mapBid(auction.winner, 0);
  const entropy = isRecord(response.entropy) ? response.entropy : null;

  return {
    bids,
    winner: winnerFromResponse ?? bids[0] ?? null,
    averageCPM: pickNumber(auction, 'averageCPM', 'avgCPM'),
    personas: mapPersonas(response.personas),
    entropyBits: entropy ? pickNumber(entropy, 'totalBits', 'bits') : null,
  };
}
