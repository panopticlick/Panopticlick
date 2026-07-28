"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "framer-motion";
import { Stamp } from "@/components/ui";
import { useScanContext } from "@/components/scan/scan-provider";
import { formatCPM } from "@/lib/utils";
import { SectionShell } from "./section-shell";

/**
 * File 05 — makes CPM legible without pretending it is a cash payment to the
 * visitor. The counter starts only when the section enters the viewport.
 */
export function ValuationSection() {
  const { hasResult, report } = useScanContext();
  const reducedMotion = useReducedMotion();
  const targetCPM = report?.valuation.averageCPM ?? 0;
  const counterRef = useRef<HTMLParagraphElement>(null);
  const counterInView = useInView(counterRef, { once: true, amount: 0.6 });
  const counter = useMotionValue(0);
  const displayedCPM = useTransform(counter, (value) => `$${value.toFixed(2)}`);

  const valuation = report?.valuation;
  const perImpression = (valuation?.averageCPM ?? 0) / 1000;
  const annualValue = valuation?.annualValue ?? 0;

  useEffect(() => {
    counter.set(0);
    if (!hasResult || !counterInView) return;

    if (reducedMotion) {
      counter.set(targetCPM);
      return;
    }

    const controls = animate(counter, targetCPM, {
      duration: 1.1,
      ease: "easeOut",
    });
    return () => controls.stop();
  }, [counter, counterInView, hasResult, reducedMotion, targetCPM]);

  return (
    <SectionShell
      id="valuation"
      fileNumber="05"
      title="Your Modeled Price Tag"
      subtitle="What an advertising market model makes of this fingerprint."
      locked={!hasResult}
      lockedSummary="Once the dossier is assembled, this file converts the simulated auction into a CPM estimate, a per-impression amount, and an illustrative annual value. These are modeled outputs, not a quote from a live ad exchange."
    >
      <div className="grid overflow-hidden rounded-sm border-2 border-ink md:grid-cols-[1.1fr_0.9fr]">
        <div className="bg-ink p-6 text-paper sm:p-8">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-paper-300">
            Average modeled clearing value
          </p>
          <motion.p
            ref={counterRef}
            aria-label={`Average modeled clearing value: $${targetCPM.toFixed(2)} per 1,000 impressions`}
            className="mt-4 font-mono text-5xl font-bold tracking-tight text-highlight sm:text-6xl"
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: reducedMotion ? 0 : 0.3 }}
          >
            {reducedMotion ? (
              <span aria-hidden="true">${targetCPM.toFixed(2)}</span>
            ) : (
              <motion.span aria-hidden="true">{displayedCPM}</motion.span>
            )}
          </motion.p>
          <p className="mt-2 font-mono text-sm uppercase tracking-wider text-paper-300">
            per 1,000 modeled impressions
          </p>
          <div className="mt-8 border-t border-paper/20 pt-4 text-sm text-paper-200">
            That is approximately{" "}
            <strong className="font-mono text-paper">
              ${perImpression.toFixed(5)}
            </strong>{" "}
            for one impression—not money paid to you, but an estimate of
            advertiser spend.
          </div>
        </div>

        <dl className="divide-y divide-paper-300 bg-paper">
          <div className="p-5">
            <dt className="font-mono text-xs uppercase tracking-wider text-ink-300">
              Winning bid
            </dt>
            <dd className="mt-1 font-mono text-2xl font-bold">
              {formatCPM(valuation?.winningBid ?? 0)}
            </dd>
          </div>
          <div className="p-5">
            <dt className="font-mono text-xs uppercase tracking-wider text-ink-300">
              Illustrative annual value
            </dt>
            <dd className="mt-1 font-mono text-2xl font-bold">
              ${annualValue.toFixed(2)}
            </dd>
          </div>
          <div className="p-5">
            <dt className="font-mono text-xs uppercase tracking-wider text-ink-300">
              Trackability classification
            </dt>
            <dd className="mt-2">
              <Stamp
                variant={
                  valuation?.trackability === "hidden" ||
                  valuation?.trackability === "low"
                    ? "protected"
                    : "exposed"
                }
                animated={!reducedMotion}
                size="sm"
              >
                {valuation?.trackability ?? "pending"}
              </Stamp>
            </dd>
          </div>
        </dl>
      </div>

      <div className="mt-6 border-l-4 border-stamp-blue bg-stamp-blue/5 p-4 text-sm leading-relaxed text-ink-200">
        <strong className="text-ink">
          Read this as a scenario, not a receipt.
        </strong>{" "}
        Actual prices change by publisher, country, campaign, consent state,
        season, and hundreds of signals this demonstration does not observe. The
        assumptions are documented on the{" "}
        <Link href="/methodology/" className="marker-link">
          methodology page
        </Link>
        .
      </div>
    </SectionShell>
  );
}
