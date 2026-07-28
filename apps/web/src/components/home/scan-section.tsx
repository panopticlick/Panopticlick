"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Button, Document, DocumentHeader, Stamp } from "@/components/ui";
import { ConsentGate } from "@/components/scan/consent-gate";
import { ScanProgress } from "@/components/scan/scan-progress";
import { useScanContext } from "@/components/scan/scan-provider";
import { entropyToOneIn, formatCPM } from "@/lib/utils";
import { scrollToSection } from "./scroll";

/**
 * File 02 — the authorization desk and the live collection surface. Once the
 * report exists this becomes the case summary with export controls, and the
 * page auto-advances to the freshly unsealed dossier.
 */
export function ScanSection() {
  const scan = useScanContext();
  const { phase, hasResult, source } = scan;
  const reducedMotion = useReducedMotion();

  // Advance to the dossier when a live scan finishes (never on restore — the
  // returning visitor should keep control of where they are on the page).
  const advanced = useRef(false);
  useEffect(() => {
    if (phase === "complete" && source === "live" && !advanced.current) {
      advanced.current = true;
      const timer = setTimeout(() => scrollToSection("dossier"), 900);
      return () => clearTimeout(timer);
    }
    if (phase === "idle") advanced.current = false;
  }, [phase, source]);

  const watermark =
    phase === "idle"
      ? "CONSENT REQUIRED"
      : hasResult
        ? "DOSSIER"
        : "COLLECTING";

  return (
    <section
      id="scan"
      aria-labelledby="scan-title"
      className="scroll-mt-20 bg-paper-100 py-14"
    >
      <div className="container mx-auto max-w-4xl px-4">
        <header className="mb-8">
          <p className="font-mono text-xs uppercase tracking-widest text-ink-300">
            File 02
          </p>
          <h2
            id="scan-title"
            className="mt-1 font-serif text-3xl font-bold tracking-tight"
          >
            The Investigation
          </h2>
          <p className="mt-2 max-w-2xl text-ink-200">
            Everything runs in your browser first. Server sync is opt-in, and
            the evidence log below only ever lists collectors that actually
            finished.
          </p>
        </header>

        <Document
          variant={phase === "idle" ? "classified" : "dossier"}
          watermark={watermark}
        >
          <AnimatePresence mode="wait" initial={false}>
            {phase === "idle" && (
              <motion.div
                key="gate"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reducedMotion ? 0 : 0.2 }}
              >
                <DocumentHeader
                  as="h3"
                  title="Authorization Required"
                  subtitle="Before we begin the investigation"
                  classification="confidential"
                />
                <ConsentGate />
              </motion.div>
            )}

            {(phase === "scanning" || phase === "analyzing") && (
              <motion.div
                key="progress"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reducedMotion ? 0 : 0.2 }}
              >
                <ScanProgress />
              </motion.div>
            )}

            {phase === "complete" && <CaseSummary key="summary" />}
          </AnimatePresence>
        </Document>
      </div>
    </section>
  );
}

function CaseSummary() {
  const {
    report,
    sessionId,
    apiStatus,
    error,
    source,
    restoredAt,
    exporting,
    deleting,
    reset,
    downloadReport,
    exportFromServer,
    deleteFromServer,
  } = useScanContext();
  const reducedMotion = useReducedMotion();
  const [privacyNotice, setPrivacyNotice] = useState("");

  if (!report) return null;

  const stats = [
    {
      label: "Fingerprint entropy",
      value: `${report.entropy.totalBits.toFixed(1)} bits`,
      detail: `1 in ${entropyToOneIn(report.entropy.totalBits)} browsers`,
    },
    {
      label: "Advertising value",
      value: formatCPM(report.valuation.averageCPM),
      detail: `~$${report.valuation.annualValue.toFixed(2)}/year`,
    },
    {
      label: "Privacy score",
      value: `${report.defenses.score}/100`,
      detail: `${report.defenses.overallTier} protection`,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reducedMotion ? 0 : 0.2 }}
      className="space-y-6"
    >
      <DocumentHeader
        as="h3"
        title="Investigation Complete"
        subtitle="Case summary — the full dossier follows below"
        classification="secret"
        caseNumber={report.meta.reportId}
        date={new Date(report.meta.generatedAt)}
      />

      {source === "restored" && (
        <p className="rounded-sm border border-paper-300 bg-paper-100 p-3 font-mono text-xs text-ink-200">
          Case file reopened from this device
          {restoredAt
            ? ` (saved ${new Date(restoredAt).toLocaleString()})`
            : ""}
          . Run a new scan any time — evidence goes stale as your browser
          updates.
        </p>
      )}

      {error && (
        <p
          role="alert"
          className="rounded-sm border border-alert-orange/40 bg-alert-orange/10 p-3 text-sm text-alert-orange"
        >
          {error}
        </p>
      )}

      {privacyNotice && (
        <p
          role="status"
          className="rounded-sm border border-alert-green/40 bg-alert-green/10 p-3 text-sm text-alert-green"
        >
          {privacyNotice}
        </p>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            className="rounded-sm border border-paper-300 p-4"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: reducedMotion ? 0 : 0.3,
              delay: reducedMotion ? 0 : 0.1 * index,
            }}
          >
            <div className="mb-1 text-xs uppercase tracking-wider text-ink-300">
              {stat.label}
            </div>
            <div className="font-mono text-2xl font-bold">{stat.value}</div>
            <div className="mt-1 text-sm capitalize text-ink-200">
              {stat.detail}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex flex-col gap-3 rounded-sm border border-paper-300 bg-paper-100 p-4 md:flex-row md:items-center md:justify-between">
        <div className="text-sm text-ink-200">
          <div className="font-mono text-xs uppercase tracking-wider text-ink-300">
            Session
          </div>
          <div className="break-all font-mono">{sessionId ?? "local only"}</div>
          <div className="mt-1 font-mono text-xs text-ink-300">
            Storage:{" "}
            {apiStatus === "synced"
              ? "stored on server for comparison"
              : apiStatus === "failed"
                ? "local-only (API unreachable)"
                : "local-only (nothing uploaded)"}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="primary" onClick={downloadReport}>
            Download report
          </Button>
          <Button
            variant="outline"
            disabled={apiStatus !== "synced" || exporting}
            onClick={exportFromServer}
          >
            {exporting ? "Exporting…" : "Export from server"}
          </Button>
          <Button
            variant="outline"
            disabled={apiStatus !== "synced" || deleting}
            onClick={() => {
              if (
                !window.confirm(
                  "Delete this opted-in session from Panopticlick servers? Your local report will remain on this device."
                )
              ) {
                return;
              }
              void deleteFromServer().then((deleted) => {
                if (deleted) {
                  setPrivacyNotice(
                    "The server copy was deleted. This report now remains only on this device."
                  );
                }
              });
            }}
          >
            {deleting ? "Deleting…" : "Delete server copy"}
          </Button>
          <Button variant="ghost" onClick={reset}>
            Scan again
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-4">
          <Stamp variant="verified" animated={false}>
            Analyzed
          </Stamp>
          <Stamp
            variant={report.defenses.score >= 50 ? "protected" : "exposed"}
            animated={false}
          >
            {report.defenses.overallTier}
          </Stamp>
        </div>
        <button
          type="button"
          onClick={() => scrollToSection("dossier")}
          className="marker-link font-mono text-xs uppercase tracking-wider"
        >
          Open the dossier ↓
        </button>
      </div>
    </motion.div>
  );
}
