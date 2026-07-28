import type { Metadata } from "next";
import { EvidenceCabinet } from "@/components/home/evidence-cabinet";
import { HomeExperience } from "@/components/home/home-experience";

export const metadata: Metadata = {
  title: "Free Browser Fingerprint Test & Privacy Scanner",
  description:
    "Run a free browser fingerprint test, inspect the signals that make you identifiable, simulate how advertisers value them, and get practical privacy defenses.",
  keywords: [
    "browser fingerprint test",
    "browser fingerprinting",
    "browser uniqueness test",
    "online privacy test",
    "digital fingerprint",
    "tracking protection test",
    "ad blocker test",
    "RTB simulator",
  ],
  alternates: {
    canonical: "https://panopticlick.org/",
  },
  openGraph: {
    type: "website",
    url: "https://panopticlick.org/",
    title: "Panopticlick: Browser Fingerprint Test",
    description:
      "See what your browser reveals, how distinctive its fingerprint may be, and which defenses reduce tracking.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Panopticlick browser fingerprint investigation",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Panopticlick: Browser Fingerprint Test",
    description:
      "See what your browser reveals, how distinctive its fingerprint may be, and which defenses reduce tracking.",
    images: ["/og-image.png"],
  },
};

/**
 * Server shell for the home investigation. EvidenceCabinet stays a server
 * component and is passed through the client experience as a React node, so its
 * long-form editorial is present in the static export rather than injected
 * after hydration.
 */
export default function HomePage() {
  return <HomeExperience editorial={<EvidenceCabinet />} />;
}
