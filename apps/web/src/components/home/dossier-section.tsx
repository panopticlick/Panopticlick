"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, Redacted } from "@/components/ui";
import { useScanContext } from "@/components/scan/scan-provider";
import { SectionShell } from "./section-shell";

/**
 * File 03 — the redacted dossier. Every line starts under a black bar; hover or
 * click lifts it. This is the "privacy invasion" beat of the page, so the data
 * shown is the visitor's own, never an illustration.
 */
export function DossierSection() {
  const { hasResult, dossier, apiStatus } = useScanContext();
  const [revealAll, setRevealAll] = useState(false);

  const networkEntries = dossier.filter((entry) => entry.source === "network");

  return (
    <SectionShell
      id="dossier"
      fileNumber="03"
      title="The Dossier"
      subtitle="What your browser handed over — hover each redaction to see it."
      locked={!hasResult}
      lockedSummary="Sealed until the investigation runs. This file will list every identifying value your browser exposed: user agent, display, GPU, timezone, languages, fonts, canvas and audio signatures, hardware class, privacy signals, and — if you opted in — what the network side saw."
    >
      <div className="mb-4 flex items-center justify-between">
        <p className="font-mono text-xs uppercase tracking-wider text-ink-300">
          {dossier.length} exhibits
          {networkEntries.length > 0
            ? ` · ${networkEntries.length} from the network side`
            : apiStatus === "synced"
              ? ""
              : " · network side empty (local-only scan)"}
        </p>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setRevealAll((v) => !v)}
        >
          {revealAll ? "Redact all" : "Reveal all"}
        </Button>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {dossier.map((entry) => (
          <div
            key={entry.id}
            className="rounded-sm border border-paper-300 bg-paper p-4"
          >
            <div className="mb-1 flex items-center justify-between gap-2">
              <span className="font-mono text-xs uppercase tracking-wider text-ink-300">
                {entry.label}
              </span>
              <span
                className={
                  entry.source === "network"
                    ? "rounded-sm bg-stamp-blue/10 px-1.5 py-0.5 font-mono text-[10px] uppercase text-stamp-blue"
                    : "rounded-sm bg-paper-200 px-1.5 py-0.5 font-mono text-[10px] uppercase text-ink-300"
                }
              >
                {entry.source}
              </span>
            </div>
            <div className="min-h-[1.75rem] font-mono text-sm">
              <Redacted revealed={revealAll || undefined}>
                {entry.value}
              </Redacted>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-ink-200">
              {entry.note}
            </p>
          </div>
        ))}
      </div>

      <p className="mt-6 text-sm text-ink-200">
        Individually these look harmless. Together they form a stable identifier
        that survives cookie deletion and private browsing —{" "}
        <Link href="/anatomy/fingerprinting/" className="marker-link">
          see how each exhibit is collected
        </Link>
        .
      </p>
    </SectionShell>
  );
}
