"use client";

import { ScanProvider } from "@/components/scan/scan-provider";
import { ScanSection } from "@/components/home/scan-section";
import { DossierSection } from "@/components/home/dossier-section";

/**
 * The standalone /scan/ experience: the same authorization desk and dossier
 * that anchor the home-page investigation, renumbered as a two-file case.
 * Sharing ScanProvider means a case file started here is restored on the
 * home page (and vice versa) via localStorage.
 */
export function ScanExperience() {
  return (
    <ScanProvider>
      <ScanSection fileNumber="01" title="Run the Scan" />
      <DossierSection fileNumber="02" />
    </ScanProvider>
  );
}
