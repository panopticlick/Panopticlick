"use client";

import { ScanProvider } from "@/components/scan/scan-provider";
import { HeroSection } from "./hero-section";
import { ScanSection } from "./scan-section";
import { DossierSection } from "./dossier-section";
import { RtbSection } from "./rtb-section";
import { ValuationSection } from "./valuation-section";
import { DefenseSection } from "./defense-section";
import { AgentDebriefSection } from "./agent-debrief-section";

/**
 * The single-page investigation. One ScanProvider feeds every section; files
 * 03–06 stay sealed until the visitor authorizes and completes a scan (or a
 * previous case file is restored from localStorage).
 *
 * `editorial` arrives server-rendered from page.tsx so the ~1500 words of
 * evergreen content are plain static HTML, never gated behind client state.
 */
export function HomeExperience({ editorial }: { editorial: React.ReactNode }) {
  return (
    <ScanProvider>
      <div className="bg-paper grid-bg">
        <HeroSection />
        <ScanSection />
        <DossierSection />
        <RtbSection />
        <ValuationSection />
        <DefenseSection />
        <AgentDebriefSection />
      </div>
      {editorial}
    </ScanProvider>
  );
}
