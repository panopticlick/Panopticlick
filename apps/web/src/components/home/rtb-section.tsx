"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Stamp } from "@/components/ui";
import { useScanContext } from "@/components/scan/scan-provider";
import { formatCPM } from "@/lib/utils";
import { SectionShell } from "./section-shell";

/**
 * File 04 — turns the report's modeled bidders into a legible auction tape.
 * The valuation engine runs locally; this component never sends a real bid
 * request or claims that the fictional DSPs are live market participants.
 */
export function RtbSection() {
  const { hasResult, report } = useScanContext();
  const reducedMotion = useReducedMotion();
  const bids = report?.valuation.bidders ?? [];
  const winner = bids.reduce<(typeof bids)[number] | null>(
    (best, bid) => (!best || bid.amount > best.amount ? bid : best),
    null,
  );

  return (
    <SectionShell
      id="auction"
      fileNumber="04"
      title="The Auction"
      subtitle="A modeled RTB exchange values the signals in your fingerprint."
      tone="paper-100"
      locked={!hasResult}
      lockedSummary="After the scan, this file stages a local, educational real-time bidding simulation. It will show which fictional demand-side platforms valued the modeled profile, their CPM offers, and why the highest bid won."
    >
      <div className="overflow-hidden rounded-sm border border-ink bg-ink text-paper">
        <div className="flex flex-col gap-2 border-b border-paper/20 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-paper-300">
              Bidstream / local simulation
            </p>
            <p className="mt-1 text-sm text-paper-200">
              No ad request leaves this page. Values come from documented model
              assumptions.
            </p>
          </div>
          <span className="self-start border border-paper/30 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-paper-200">
            {bids.length} bidders
          </span>
        </div>

        <ol
          className="divide-y divide-paper/15"
          aria-label="Modeled advertiser bids"
        >
          {bids.map((bid, index) => {
            const won =
              winner?.bidder === bid.bidder && winner.amount === bid.amount;
            return (
              <motion.li
                key={`${bid.bidder}-${bid.interest}`}
                initial={reducedMotion ? false : { opacity: 0, x: -24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{
                  duration: 0.28,
                  delay: reducedMotion ? 0 : index * 0.12,
                }}
                className={won ? "bg-alert-green/15 px-4 py-4" : "px-4 py-4"}
              >
                <div className="grid gap-3 sm:grid-cols-[3rem_1fr_auto] sm:items-center">
                  <span className="font-mono text-xs text-paper-400">
                    +{String(index * 7 + 4).padStart(2, "0")}ms
                  </span>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-serif font-bold">{bid.bidder}</span>
                      {won && (
                        <span className="border border-alert-green px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-alert-green">
                          winning bid
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs capitalize text-paper-300">
                      Interest: {bid.interest} · modeled match{" "}
                      {Math.round(bid.confidence * 100)}%
                    </p>
                  </div>
                  <span
                    className={
                      won
                        ? "font-mono text-xl font-bold text-alert-green"
                        : "font-mono text-xl font-bold"
                    }
                  >
                    {formatCPM(bid.amount)}
                  </span>
                </div>
              </motion.li>
            );
          })}
        </ol>

        {winner && (
          <div className="flex flex-col gap-4 border-t border-paper/20 bg-paper/5 px-4 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-paper-300">
                Exchange decision
              </p>
              <p className="mt-1">
                <strong>{winner.bidder}</strong> would win at{" "}
                <strong className="text-alert-green">
                  {formatCPM(winner.amount)}
                </strong>
                . Every losing bidder still evaluated the same modeled profile.
              </p>
            </div>
            <Stamp
              variant="verified"
              animated={!reducedMotion}
              size="sm"
              className="shrink-0 border-alert-green text-alert-green"
            >
              Sold
            </Stamp>
          </div>
        )}
      </div>

      <p className="mt-5 text-sm leading-relaxed text-ink-200">
        This is a teaching model, not observed market data. Read the{" "}
        <Link href="/methodology/" className="marker-link">
          valuation methodology
        </Link>{" "}
        or open the{" "}
        <Link href="/simulation/rtb/" className="marker-link">
          full RTB simulator
        </Link>{" "}
        to inspect the auction in more detail.
      </p>
    </SectionShell>
  );
}
