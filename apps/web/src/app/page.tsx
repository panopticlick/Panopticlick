import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";
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

const faqData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Is my browser fingerprint unique?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "It may be distinctive enough to narrow you to a small modeled group, but this test cannot prove global uniqueness. Panopticlick estimates rarity from the signals available in your browser and documented probability assumptions.",
      },
    },
    {
      "@type": "Question",
      name: "Does Panopticlick store my fingerprint?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Collection and analysis can run locally. Server storage is optional and requires consent in the scan controls. If you decline, the report remains on this device for the single-page experience.",
      },
    },
    {
      "@type": "Question",
      name: "What happens during the browser fingerprint test?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The scanner collects supported hardware, software, rendering, capability, and privacy signals, builds a local dossier, estimates entropy, runs an educational advertising auction model, and scores detectable defenses.",
      },
    },
  ],
};

/**
 * Server shell for the home investigation. EvidenceCabinet stays a server
 * component and is passed through the client experience as a React node, so its
 * long-form editorial is present in the static export rather than injected
 * after hydration.
 */
export default function HomePage() {
  return (
    <>
      <JsonLd data={faqData} />
      <HomeExperience editorial={<EvidenceCabinet />} />
    </>
  );
}
