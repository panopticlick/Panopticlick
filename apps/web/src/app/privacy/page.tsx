import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Document,
  DocumentHeader,
  DocumentSection,
  Stamp,
} from '@/components/ui';
import { JsonLd, breadcrumbJsonLd } from '@/components/seo/json-ld';

export const metadata: Metadata = {
  title: 'Privacy Policy - Panopticlick',
  description:
    'Panopticlick privacy policy. Learn what stays in your browser, what optional scan storage includes, and how AI chat data is processed.',
  openGraph: {
    title: 'Privacy Policy - Panopticlick',
    description:
      'Our commitment to your privacy. Learn how we handle data.',
    type: 'website',
    url: 'https://panopticlick.org/privacy/',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Panopticlick - Browser Privacy Test',
      },
    ],
  },
  alternates: {
    canonical: 'https://panopticlick.org/privacy/',
  },
};

export default function PrivacyPage() {
  const lastUpdated = new Date('2026-07-28');

  return (
    <div className="bg-paper grid-bg">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Privacy Policy', path: '/privacy/' },
        ])}
      />
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Document variant="dossier" watermark="POLICY">
          <DocumentHeader
            title="Privacy Policy"
            subtitle="How we handle your data"
            classification="unclassified"
            date={lastUpdated}
          />

          <article className="prose prose-lg max-w-none">
            <div className="bg-alert-green/10 border border-alert-green/30 p-4 rounded-sm mb-8 not-prose">
              <div className="flex items-start gap-3">
                <span className="text-2xl">✓</span>
                <div>
                  <h4 className="font-bold mb-1">TL;DR</h4>
                  <p className="text-sm text-ink-200">
                    Fingerprint collection and valuation run in your browser first.
                    Scan data reaches Panopticlick servers only when you opt in, and
                    the completed case can export or delete that server session.
                    AI chat is a separate, user-triggered feature described below.
                  </p>
                </div>
              </div>
            </div>

            <DocumentSection title="1. Overview">
              <p>
                Panopticlick ("we", "us", "our") is committed to protecting your privacy.
                This privacy policy explains how we collect, use, and protect information
                when you use our browser fingerprinting test and privacy tools.
              </p>
              <p>
                <strong>Last updated:</strong> {lastUpdated.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </DocumentSection>

            <DocumentSection title="2. Information We Collect">
              <h4>2.1 Information Collected Automatically</h4>
              <p>
                By default, fingerprint collection and valuation run in your browser.
                The local report may be saved in this browser&apos;s local storage so it
                can be reopened on a later visit. It is not uploaded to Panopticlick
                servers unless you explicitly opt in to server storage.
              </p>

              <h4>2.2 Information You Choose to Share</h4>
              <p>
                If you opt in to data sharing, we may collect:
              </p>
              <ul>
                <li>Your browser fingerprint (technical configuration data)</li>
                <li>A randomly generated session ID</li>
                <li>Timestamp of your scan</li>
                <li>A salted hash derived from the request IP address (never the raw IP)</li>
                <li>Derived country, ASN, proxy, and VPN network signals</li>
                <li>Pseudonymous aggregate statistics</li>
              </ul>
              <p>
                We do <strong>not</strong> collect:
              </p>
              <ul>
                <li>Your raw IP address in D1 scan records</li>
                <li>Your name or email address</li>
                <li>Cookies or tracking identifiers</li>
                <li>Browsing history</li>
                <li>Precise GPS location</li>
              </ul>
            </DocumentSection>

            <DocumentSection title="3. How We Use Information">
              <p>
                If you choose to store your fingerprint data, we use it for:
              </p>
              <ul>
                <li>
                  <strong>Research:</strong> Understanding browser fingerprinting techniques
                  and their prevalence
                </li>
                <li>
                  <strong>Statistics:</strong> Calculating uniqueness metrics and entropy
                  distributions
                </li>
                <li>
                  <strong>Education:</strong> Providing comparative data to help users
                  understand their privacy
                </li>
                <li>
                  <strong>Case delivery:</strong> Returning network context and an
                  authenticated export for the opted-in session
                </li>
              </ul>
              <p>
                We never:
              </p>
              <ul>
                <li>Sell or rent your data to third parties</li>
                <li>Use your data for advertising or marketing</li>
                <li>Share individual fingerprints with anyone</li>
                <li>Track you across websites</li>
              </ul>
            </DocumentSection>

            <DocumentSection title="4. Data Storage and Security">
              <p>
                When you opt in to data sharing:
              </p>
              <ul>
                <li>
                  Data is stored on Cloudflare's infrastructure with encryption at rest
                </li>
                <li>
                  Opted-in scan sessions are retained for a maximum of 30 days
                </li>
                <li>
                  De-identified fingerprint aggregates are retained for a maximum of
                  90 days
                </li>
              </ul>
            </DocumentSection>

            <DocumentSection title="5. Your Rights">
              <p>
                Under GDPR, CCPA, and other privacy laws, you have the right to:
              </p>

              <h4>5.1 Access</h4>
              <p>
                Export the data associated with an opted-in session from the completed
                case summary. The ownership token issued with that session is required.
              </p>

              <h4>5.2 Deletion</h4>
              <p>
                Request deletion through the authenticated privacy endpoint or contact
                us for assistance. A session ID alone is not enough; deletion requires
                the ownership token issued with that session.
              </p>

              <h4>5.3 Portability</h4>
              <p>
                Export your data in a machine-readable format (JSON) using the
                "Export" feature.
              </p>

              <h4>5.4 Objection</h4>
              <p>
                You can opt out of data sharing at any time by simply not selecting
                the "Share anonymized data" option during scans.
              </p>
            </DocumentSection>

            <DocumentSection title="6. Cookies and Tracking">
              <p>
                We do not use:
              </p>
              <ul>
                <li>Cookies (tracking or otherwise)</li>
                <li>Local storage for tracking purposes</li>
                <li>Third-party analytics (no Google Analytics, etc.)</li>
                <li>Advertising networks</li>
                <li>Social media trackers</li>
              </ul>
              <p>
                We use local storage for the consent preference, the most recent local
                report and dossier, and—when a scan is stored—the session ownership
                token needed for export or deletion. These values support site
                functionality and are not used for cross-site tracking. Choosing
                &ldquo;Scan again&rdquo; clears the saved case and token from this browser.
              </p>
            </DocumentSection>

            <DocumentSection title="7. Third-Party Services">
              <p>
                Our website is hosted on Cloudflare Pages. Cloudflare may collect
                operational request data under its own service terms. Panopticlick
                minimizes application logs and does not run third-party advertising or
                audience analytics scripts.
              </p>
              <p>
                If you choose to send a question to the analysis agent, the current
                chat transcript and a compact case context (such as entropy, modeled
                CPM, defense score, personas, and uniqueness) are sent through our
                Worker to OpenRouter so it can produce the answer. This happens only
                after you submit a chat question, but it is separate from the scan
                storage choice. Do not include names, contact details, or other
                sensitive information in chat. Upstream processing and retention are
                governed by OpenRouter and the model provider it selects.
              </p>
              <p>
                We do not embed third-party content, widgets, or scripts that track
                browsing across sites.
              </p>
            </DocumentSection>

            <DocumentSection title="8. Children's Privacy">
              <p>
                Our service is not directed to children under 13. We do not knowingly
                collect information from children. If you believe a child has provided
                us with data, please contact us for deletion.
              </p>
            </DocumentSection>

            <DocumentSection title="9. International Users">
              <p>
                Our service is available worldwide. By using our service, you consent
                to the processing of any data you choose to share in accordance with
                this policy.
              </p>
              <p>
                Optional server storage is based on your explicit choice and can be
                withdrawn by deleting the authenticated server copy from the completed
                case summary.
              </p>
            </DocumentSection>

            <DocumentSection title="10. Changes to This Policy">
              <p>
                We may update this privacy policy from time to time. We will notify
                users of significant changes by updating the "Last updated" date and,
                for major changes, posting a notice on our homepage.
              </p>
            </DocumentSection>

            <DocumentSection title="11. Contact Us">
              <p>
                If you have questions about this privacy policy or want to exercise
                your rights, contact us at:
              </p>
              <div className="not-prose bg-paper-100 p-4 rounded-sm font-mono text-sm">
                <div>Email: privacy@panopticlick.org</div>
                <div>GitHub: github.com/Panopticlick/Panopticlick</div>
              </div>
            </DocumentSection>

            <DocumentSection title="12. Privacy Controls and Limitations">
              <p>
                The site provides local-first processing, optional server storage,
                authenticated export, and deletion controls intended to support
                privacy rights requests. This policy describes the implemented
                behavior; it is not a certification or a substitute for legal advice.
              </p>
            </DocumentSection>
          </article>
        </Document>

        <div className="flex justify-center gap-6 mt-8">
          <Stamp variant="verified">Local-first</Stamp>
          <Stamp variant="verified">Export + Delete</Stamp>
        </div>

        <div className="mt-8 text-center">
          <Link href="/" className="text-ink-300 hover:text-ink text-sm">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
