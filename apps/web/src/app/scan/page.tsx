import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd, breadcrumbJsonLd } from "@/components/seo/json-ld";
import { ScanExperience } from "@/components/scan/scan-experience";

export const metadata: Metadata = {
  title: "Browser Fingerprint Scanner - Test Your Digital Identity",
  description:
    "Run a free browser fingerprint scan to see exactly what your browser exposes: canvas, WebGL, audio, fonts, screen, and hardware signals — plus your uniqueness in bits of entropy.",
  keywords: [
    "browser fingerprint scanner",
    "fingerprint scan",
    "fingerprint test",
    "browser privacy scan",
    "digital identity test",
    "browser uniqueness check",
    "online tracking test",
    "device fingerprint check",
  ],
  openGraph: {
    type: "website",
    url: "https://panopticlick.org/scan/",
    title: "Browser Fingerprint Scanner - Test Your Digital Identity",
    description:
      "Run a free browser fingerprint scan to see exactly what your browser exposes and how identifiable it makes you.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Panopticlick browser fingerprint scanner",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Browser Fingerprint Scanner - Test Your Digital Identity",
    description:
      "Run a free browser fingerprint scan to see exactly what your browser exposes and how identifiable it makes you.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: "https://panopticlick.org/scan/",
  },
};

/**
 * Standalone scanner page. The home page tells the full story (auction,
 * valuation, defenses, editorial); this is the direct lane for visitors who
 * arrive wanting one thing — run the scan, read the dossier. The interactive
 * case reuses the home-page scan machinery via ScanExperience; everything
 * around it is server-rendered so crawlers get real text.
 */
export default function ScanPage() {
  return (
    <div className="min-h-screen bg-paper grid-bg">
      <div className="confidential-bar">Fingerprint Collection Desk</div>

      <section className="container mx-auto max-w-4xl px-4 pb-2 pt-10">
        <p className="font-mono text-xs uppercase tracking-widest text-ink-300">
          Direct intake — no appointment needed
        </p>
        <h1 className="mt-1 font-serif text-4xl font-bold tracking-tight">
          Browser Fingerprint Scanner
        </h1>
        <p className="mt-3 max-w-2xl text-ink-200">
          This scanner reads the same signals trackers do — canvas and WebGL
          rendering quirks, audio processing, installed fonts, screen geometry,
          hardware class, timezone, and languages — then measures how
          identifying the combination is, in bits of entropy. Collection runs
          entirely in your browser; nothing is stored server-side unless you
          opt in.
        </p>
      </section>

      <ScanExperience />

      <section
        aria-labelledby="scan-notes-title"
        className="container mx-auto max-w-4xl px-4 py-14"
      >
        <h2
          id="scan-notes-title"
          className="font-serif text-2xl font-bold tracking-tight"
        >
          Scanner notes
        </h2>

        <div className="mt-6 grid gap-8 md:grid-cols-2">
          <div>
            <h3 className="font-mono text-sm font-bold uppercase tracking-wider">
              What the scanner reads
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-200">
              Each collector targets one signal family: canvas and WebGL expose
              your GPU and driver stack through rendering differences, the
              audio pipeline leaks its processing signature, and the navigator
              object volunteers your platform, languages, and hardware
              concurrency. None of these need cookies or permissions — they are
              readable by any page you visit. The dossier lists every value the
              scan actually captured, with a note on why it matters.
            </p>
          </div>

          <div>
            <h3 className="font-mono text-sm font-bold uppercase tracking-wider">
              How uniqueness is scored
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-200">
              Every signal contributes bits of entropy based on how rare its
              value is across real-world browsers, using priors from published
              research (EFF 2010, AmIUnique 2016, Princeton WebTAP 2016). The
              bits sum to a &ldquo;1 in N&rdquo; uniqueness estimate — an upper
              bound, since some signals correlate. The{" "}
              <Link href="/methodology/" className="marker-link">
                methodology
              </Link>{" "}
              documents every prior and its limits.
            </p>
          </div>

          <div>
            <h3 className="font-mono text-sm font-bold uppercase tracking-wider">
              Local-first by design
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-200">
              The scan computes everything on your device. Server sync is a
              separate, explicit opt-in — and even then only salted hashes and
              aggregates are stored, expiring automatically. You can export or
              delete the server copy from the case summary at any time. Details
              in the{" "}
              <Link href="/privacy/" className="marker-link">
                privacy policy
              </Link>
              .
            </p>
          </div>

          <div>
            <h3 className="font-mono text-sm font-bold uppercase tracking-wider">
              Want the full investigation?
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-200">
              This desk handles the scan itself. The{" "}
              <Link href="/" className="marker-link">
                full investigation
              </Link>{" "}
              takes the same fingerprint further: a simulated{" "}
              <Link href="/simulation/rtb/" className="marker-link">
                RTB ad auction
              </Link>{" "}
              bidding on your profile, an advertising-value estimate, and a{" "}
              <Link href="/defense/" className="marker-link">
                defense audit
              </Link>{" "}
              of your current protections. Your case file carries over — no
              need to rescan.
            </p>
          </div>
        </div>
      </section>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Browser Fingerprint Scanner",
          applicationCategory: "SecurityApplication",
          description:
            "Free browser fingerprint scanner that shows what your browser exposes and measures how identifiable it makes you.",
          url: "https://panopticlick.org/scan/",
          operatingSystem: "Any",
          browserRequirements: "Requires JavaScript",
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "USD",
          },
          creator: {
            "@type": "Organization",
            name: "Panopticlick",
            url: "https://panopticlick.org",
          },
        }}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Fingerprint Scanner", path: "/scan/" },
        ])}
      />
    </div>
  );
}
