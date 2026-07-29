"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Document,
  DocumentHeader,
  Redacted,
  Stamp,
  StartScanButton,
} from "@/components/ui";
import { useScanContext } from "@/components/scan/scan-provider";
import { scrollToSection } from "./scroll";

/**
 * File 01 — the case is opened. Owns the page's only h1; the CTA scrolls down
 * to the authorization desk instead of navigating away.
 */
export function HeroSection() {
  const { hasResult, report, source } = useScanContext();
  const reducedMotion = useReducedMotion();

  // Generated client-side only: Math.random()/new Date() during render would
  // desync the statically exported HTML and break hydration.
  const [caseMeta, setCaseMeta] = useState<{
    caseNumber: string;
    date: Date;
  } | null>(null);
  useEffect(() => {
    setCaseMeta({
      caseNumber: `PNP-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      date: new Date(),
    });
  }, []);

  return (
    <section id="case-file" className="container mx-auto max-w-4xl px-4 py-6 sm:py-12">
      <Document variant="classified" watermark="CLASSIFIED">
        <h1 className="mb-5 text-center font-serif text-3xl font-bold tracking-tight sm:mb-8 sm:text-4xl md:text-5xl">
          Panopticlick: Browser Fingerprint Test
        </h1>

        <motion.div
          className="pb-6 text-center sm:pb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: reducedMotion ? 0 : 0.3,
            delay: reducedMotion ? 0 : 0.2,
          }}
        >
          <p className="mb-4 text-sm text-ink-200 sm:mb-6 sm:text-base">
            {hasResult
              ? source === "restored"
                ? "Your previous case file was reopened — the dossier below is unsealed."
                : "Investigation complete — the dossier below is unsealed."
              : "Open the case file on your own browser"}
          </p>

          <StartScanButton onClick={() => scrollToSection("scan")} />

          <p className="mt-3 text-xs text-ink-300 sm:mt-4">
            Nothing is uploaded to Panopticlick servers without your explicit consent
          </p>
        </motion.div>

        <DocumentHeader
          as="h2"
          title="Subject: Your Browser"
          subtitle="An investigation into digital identity and advertising value"
          classification="confidential"
          caseNumber={
            report?.meta.reportId ?? caseMeta?.caseNumber ?? "PNP-████-████"
          }
          date={caseMeta?.date}
        />

        <div className="space-y-8">
          <p className="font-serif text-xl leading-relaxed">
            Every time you visit a website, you leave behind a{" "}
            <span className="marker">digital fingerprint</span> — a unique
            combination of browser settings, hardware specifications, and
            software configurations that can be used to identify and track you.
            This page is the investigation: authorize the scan and watch your
            own dossier assemble itself, section by section.
          </p>

          <div className="grid gap-3 sm:grid-cols-3 sm:gap-4">
            {[
              {
                label: "Data points collected",
                value: <Redacted>47</Redacted>,
              },
              {
                label: "Advertising value",
                value: <Redacted>$4.82 CPM</Redacted>,
              },
              { label: "Uniqueness", value: <Redacted>1 in 286,435</Redacted> },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                className="rounded-sm border border-paper-300 p-4 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: reducedMotion ? 0 : 0.3,
                  delay: reducedMotion ? 0 : 0.2 + index * 0.1,
                }}
              >
                <div className="font-mono text-2xl font-bold">{stat.value}</div>
                <div className="mt-1 text-xs uppercase tracking-wider text-ink-200">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </Document>

      <div className="mt-8 flex flex-wrap justify-center gap-4 px-4 sm:gap-8">
        <Stamp variant="classified">Fingerprint Analysis</Stamp>
        <Stamp variant="verified">RTB Simulation</Stamp>
      </div>
    </section>
  );
}
