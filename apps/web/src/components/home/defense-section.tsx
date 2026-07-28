"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Stamp } from "@/components/ui";
import { useScanContext } from "@/components/scan/scan-provider";
import { getDefenseTierLabel } from "@/lib/utils";
import { SectionShell } from "./section-shell";

interface CheckLine {
  label: string;
  value: string;
  protected: boolean;
}

/**
 * File 06 — closes the diagnostic loop: the score is decomposed into observable
 * browser defenses and followed by actions rather than left as a vanity grade.
 */
export function DefenseSection() {
  const { hasResult, report } = useScanContext();
  const reducedMotion = useReducedMotion();
  const defenses = report?.defenses;
  const score = defenses?.score ?? 0;
  const scoreTone =
    score >= 70
      ? "bg-alert-green"
      : score >= 45
        ? "bg-alert-orange"
        : "bg-alert-red";

  const checks: CheckLine[] = defenses
    ? [
        {
          label: "Ad and tracker blocking",
          value: defenses.adBlocker.detected
            ? `${defenses.adBlocker.strength} blocking detected`
            : "No blocker detected",
          protected: defenses.adBlocker.detected,
        },
        {
          label: "Privacy preference signals",
          value:
            defenses.privacyHeaders.globalPrivacyControl ||
            defenses.privacyHeaders.doNotTrack
              ? [
                  defenses.privacyHeaders.globalPrivacyControl ? "GPC" : null,
                  defenses.privacyHeaders.doNotTrack ? "DNT" : null,
                ]
                  .filter(Boolean)
                  .join(" + ")
              : "No GPC or DNT signal",
          protected:
            defenses.privacyHeaders.globalPrivacyControl ||
            defenses.privacyHeaders.doNotTrack,
        },
        {
          label: "Fingerprint resistance",
          value: `${defenses.fingerprintProtection.level} protection`,
          protected:
            defenses.fingerprintProtection.level === "enhanced" ||
            defenses.fingerprintProtection.level === "maximum",
        },
        {
          label: "Network exposure",
          value:
            defenses.networkPrivacy.vpnDetected ||
            defenses.networkPrivacy.torDetected
              ? defenses.networkPrivacy.torDetected
                ? "Tor signal detected"
                : "VPN signal detected"
              : "Direct network profile",
          protected:
            defenses.networkPrivacy.vpnDetected ||
            defenses.networkPrivacy.torDetected,
        },
      ]
    : [];

  return (
    <SectionShell
      id="defense"
      fileNumber="06"
      title="Defense Assessment"
      subtitle="What resisted the investigation, what did not, and what to change next."
      tone="paper-100"
      locked={!hasResult}
      lockedSummary="This file opens with a privacy score, the protections detected in your browser, and a prioritized hardening list. A low score is not a verdict; it is a map of the easiest improvements."
    >
      <div className="grid gap-6 md:grid-cols-[0.8fr_1.2fr]">
        <div className="flex min-h-64 flex-col justify-between rounded-sm border-2 border-ink bg-paper p-6">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-ink-300">
              Protection score
            </p>
            <div className="mt-3 flex items-end gap-2">
              <span className="font-mono text-6xl font-bold leading-none">
                {score}
              </span>
              <span className="pb-1 font-mono text-lg text-ink-300">/100</span>
            </div>
            <div
              className="mt-5 h-4 overflow-hidden rounded-sm bg-paper-200"
              role="progressbar"
              aria-label="Browser protection score"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={score}
            >
              <motion.div
                className={`h-full ${scoreTone}`}
                initial={{ width: 0 }}
                whileInView={{ width: `${score}%` }}
                viewport={{ once: true }}
                transition={{
                  duration: reducedMotion ? 0 : 0.8,
                  ease: "easeOut",
                }}
              />
            </div>
          </div>
          <Stamp
            variant={score >= 60 ? "protected" : "exposed"}
            animated={!reducedMotion}
            className="mt-8 self-start"
          >
            {defenses ? getDefenseTierLabel(defenses.overallTier) : "Pending"}
          </Stamp>
        </div>

        <div className="rounded-sm border border-paper-300 bg-paper">
          <h3 className="border-b border-paper-300 px-5 py-4 font-mono text-sm font-bold uppercase tracking-wider">
            Field checks
          </h3>
          <ul className="divide-y divide-paper-300">
            {checks.map((check) => (
              <li
                key={check.label}
                className="grid gap-1 px-5 py-4 sm:grid-cols-[1fr_auto] sm:items-center"
              >
                <div>
                  <p className="font-serif font-bold">{check.label}</p>
                  <p className="mt-0.5 text-sm text-ink-200">{check.value}</p>
                </div>
                <span
                  className={
                    check.protected
                      ? "font-mono text-xs uppercase tracking-wider text-alert-green"
                      : "font-mono text-xs uppercase tracking-wider text-alert-red"
                  }
                >
                  {check.protected ? "resisted" : "exposed"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-6 grid gap-6 border-t-2 border-ink pt-6 md:grid-cols-[1fr_auto]">
        <div>
          <h3 className="font-serif text-xl font-bold">Priority actions</h3>
          {defenses?.recommendations.length ? (
            <ol className="mt-3 space-y-2">
              {defenses.recommendations
                .slice(0, 4)
                .map((recommendation, index) => (
                  <li
                    key={recommendation}
                    className="flex gap-3 text-sm leading-relaxed text-ink-200"
                  >
                    <span className="font-mono font-bold text-ink">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span>{recommendation}</span>
                  </li>
                ))}
            </ol>
          ) : (
            <p className="mt-3 text-sm text-ink-200">
              No automated recommendations were produced. Review the hardening
              guide for browser-specific controls.
            </p>
          )}
        </div>
        <Link
          href="/defense/hardening/"
          className="inline-flex h-11 items-center justify-center self-end rounded-sm border-2 border-ink px-5 font-mono text-xs uppercase tracking-wider transition-colors hover:bg-ink hover:text-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-highlight focus-visible:ring-offset-2"
        >
          Open hardening guide
        </Link>
      </div>
    </SectionShell>
  );
}
