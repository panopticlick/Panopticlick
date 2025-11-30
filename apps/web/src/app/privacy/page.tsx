import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Document,
  DocumentHeader,
  DocumentSection,
  Stamp,
} from '@/components/ui';

export const metadata: Metadata = {
  title: 'Privacy Policy - Panopticlick',
  description:
    'Panopticlick privacy policy. Learn how we handle your data, what information we collect, and your rights under GDPR and CCPA.',
  openGraph: {
    title: 'Privacy Policy - Panopticlick',
    description:
      'Our commitment to your privacy. Learn how we handle data.',
    type: 'website',
    url: 'https://panopticlick.org/privacy/',
  },
};

export default function PrivacyPage() {
  const lastUpdated = new Date('2024-12-01');

  return (
    <div className="min-h-screen bg-paper grid-bg">
      <div className="confidential-bar">Legal Documentation</div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Document variant="dossier" watermark="POLICY">
          <DocumentHeader
            title="Privacy Policy"
            subtitle="How we handle your data"
            classification="public"
            date={lastUpdated}
          />

          <article className="prose prose-lg max-w-none">
            <div className="bg-alert-green/10 border border-alert-green/30 p-4 rounded-sm mb-8 not-prose">
              <div className="flex items-start gap-3">
                <span className="text-2xl">✓</span>
                <div>
                  <h4 className="font-bold mb-1">TL;DR</h4>
                  <p className="text-sm text-ink-200">
                    We don't track you. All analysis happens in your browser.
                    We only store data if you explicitly choose to share it,
                    and you can delete it anytime.
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
                By default, we do <strong>not</strong> collect any personal information.
                Our fingerprint analysis runs entirely in your browser (client-side).
                No data is transmitted to our servers unless you explicitly choose to share it.
              </p>

              <h4>2.2 Information You Choose to Share</h4>
              <p>
                If you opt in to data sharing, we may collect:
              </p>
              <ul>
                <li>Your browser fingerprint (technical configuration data)</li>
                <li>A randomly generated session ID</li>
                <li>Timestamp of your scan</li>
                <li>Aggregated, non-identifying statistics</li>
              </ul>
              <p>
                We do <strong>not</strong> collect:
              </p>
              <ul>
                <li>Your IP address</li>
                <li>Your name or email address</li>
                <li>Cookies or tracking identifiers</li>
                <li>Browsing history</li>
                <li>Location data beyond timezone</li>
              </ul>
            </DocumentSection>

            <DocumentSection title="3. How We Use Information">
              <p>
                If you choose to share your fingerprint data, we use it solely for:
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
                  We retain fingerprint data for a maximum of 12 months
                </li>
                <li>
                  Aggregated statistics are retained indefinitely but cannot be tied
                  to individual users
                </li>
              </ul>
            </DocumentSection>

            <DocumentSection title="5. Your Rights">
              <p>
                Under GDPR, CCPA, and other privacy laws, you have the right to:
              </p>

              <h4>5.1 Access</h4>
              <p>
                Request a copy of any data we have associated with your session.
                Use the "View My Data" button after a scan to see your stored data.
              </p>

              <h4>5.2 Deletion</h4>
              <p>
                Request deletion of your data at any time. Use the "Delete My Data"
                button or contact us with your session ID.
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
                We may use local storage solely to remember your session ID if you
                chose to share data, so you can access it later.
              </p>
            </DocumentSection>

            <DocumentSection title="7. Third-Party Services">
              <p>
                Our website is hosted on Cloudflare Pages. Cloudflare may collect
                basic analytics (page views, countries) in aggregated form. We have
                disabled detailed analytics and logging.
              </p>
              <p>
                We do not embed any third-party content, widgets, or scripts that
                could track you.
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
                For EU users: We operate under the legitimate interest legal basis for
                any optional data collection (privacy research). You can withdraw
                consent at any time.
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
                <div>GitHub: github.com/panopticlick</div>
              </div>
            </DocumentSection>

            <DocumentSection title="12. Legal Compliance">
              <p>
                This privacy policy is designed to comply with:
              </p>
              <ul>
                <li>General Data Protection Regulation (GDPR)</li>
                <li>California Consumer Privacy Act (CCPA)</li>
                <li>California Privacy Rights Act (CPRA)</li>
                <li>Other applicable privacy laws</li>
              </ul>
            </DocumentSection>
          </article>
        </Document>

        <div className="flex justify-center gap-6 mt-8">
          <Stamp variant="verified">GDPR Compliant</Stamp>
          <Stamp variant="verified">CCPA Compliant</Stamp>
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
