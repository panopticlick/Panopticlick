import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Document,
  DocumentHeader,
  DocumentSection,
  Stamp,
  Redacted,
} from '@/components/ui';

export const metadata: Metadata = {
  title: 'Cookie Syncing Explained - How Trackers Share Your Identity | Panopticlick',
  description:
    'Learn how cookie syncing allows advertising networks to share your identity across thousands of websites. Understand ID bridging, match tables, and the invisible web of surveillance.',
  openGraph: {
    title: 'Cookie Syncing: The Identity Exchange You Never Consented To',
    description:
      'How ad networks share your identity across the web in milliseconds.',
    type: 'article',
  },
};

export default function CookieSyncPage() {
  return (
    <div className="bg-paper grid-bg">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Document variant="classified" watermark="ID BRIDGING">
          <DocumentHeader
            title="Cookie Syncing Demo"
            subtitle="How trackers share your identity across the web"
            classification="confidential"
            date={new Date()}
          />

          <nav className="mb-8 p-4 bg-paper-100 rounded-sm">
            <span className="text-xs font-mono text-ink-300 uppercase tracking-wider">
              Navigate:{' '}
            </span>
            <Link href="/simulation/" className="text-sm hover:underline">
              Simulation Lab
            </Link>
            <span className="text-ink-300 mx-2">→</span>
            <span className="text-sm font-bold">Cookie Syncing</span>
          </nav>

          <article className="prose prose-lg max-w-none">
            <DocumentSection title="The Identity Exchange">
              <p>
                Here's a dirty secret of the advertising industry: different ad networks
                can't read each other's cookies. Domain A can only see cookies from Domain A.
                So how does your data follow you everywhere?
              </p>
              <p>
                <strong>Cookie syncing</strong> (also called "ID bridging" or "cookie matching")
                solves this problem by exchanging identifiers between networks. When you visit
                a page, dozens of invisible requests create links between trackers' databases.
              </p>

              <div className="not-prose bg-alert-red/10 border-l-4 border-alert-red p-4 my-6">
                <p className="font-mono text-sm">
                  <strong>SCALE:</strong> A 2019 study found that a single page load can trigger
                  <Redacted>50+ cookie sync events</Redacted> connecting your identity across
                  hundreds of companies you've never heard of.
                </p>
              </div>
            </DocumentSection>

            <DocumentSection title="How Cookie Syncing Works">
              <h4 className="font-mono text-sm uppercase tracking-wider mt-6 mb-3">Step-by-Step Process</h4>

              <div className="not-prose">
                <div className="bg-ink text-paper p-6 rounded-sm font-mono text-sm my-6">
                  <pre className="whitespace-pre-wrap">
{`SCENARIO: You visit news-site.com

1. PAGE LOADS
   news-site.com loads ads from AdNetwork-A
   AdNetwork-A gives you ID: "user_A_12345"

2. SYNC PIXEL FIRES
   AdNetwork-A includes an invisible image:
   <img src="https://adnetwork-b.com/sync?partner=A&id=user_A_12345">

3. RECEIVING END
   AdNetwork-B receives the request with:
   - Their own cookie: "user_B_67890" (from your browser)
   - Partner's ID: "user_A_12345" (from the URL)

4. MATCH TABLE CREATED
   AdNetwork-B stores in their database:
   ┌─────────────────────────────────────────┐
   │ Our ID        │ Partner A ID            │
   ├───────────────┼─────────────────────────┤
   │ user_B_67890  │ user_A_12345           │
   └─────────────────────────────────────────┘

5. BIDIRECTIONAL SYNC
   AdNetwork-B returns a sync pixel back:
   <img src="https://adnetwork-a.com/sync?partner=B&id=user_B_67890">

RESULT: Both networks now know you're the same person!`}
                  </pre>
                </div>
              </div>

              <p>
                This process happens <em>instantly</em> and <em>invisibly</em>. No popup asks
                permission. No notification appears. Your identity is being traded across
                the advertising ecosystem while you're reading the news.
              </p>
            </DocumentSection>

            <DocumentSection title="The Sync Chain Effect">
              <p>
                Here's where it gets worse. Cookie syncing isn't just between two companies—it
                cascades through entire networks.
              </p>

              <div className="not-prose">
                <div className="bg-ink text-paper p-6 rounded-sm font-mono text-sm my-6">
                  <pre className="whitespace-pre-wrap">
{`YOU (Browser)
    │
    ▼
┌──────────────┐
│ AdNetwork A  │ ID: A_12345
│ (Google)     │
└──────┬───────┘
       │ sync
       ▼
┌──────────────┐
│ AdNetwork B  │ ID: B_67890
│ (Facebook)   │
└──────┬───────┘
       │ sync
       ▼
┌──────────────┐
│ Data Broker C│ ID: C_11111
│ (Acxiom)     │
└──────┬───────┘
       │ sync
       ▼
┌──────────────┐
│ AdNetwork D  │ ID: D_22222
│ (Trade Desk) │
└──────┬───────┘
       │ sync
       ▼
┌──────────────┐
│ Retargeter E │ ID: E_33333
│ (Criteo)     │
└──────────────┘

RESULT: 5 companies share your identity
        Each may sync with 50+ more partners
        Your ID propagates to 1000s of companies`}
                  </pre>
                </div>
              </div>

              <div className="not-prose grid md:grid-cols-2 gap-4 my-6">
                <div className="bg-paper-100 p-4 rounded-sm">
                  <h5 className="font-mono text-xs uppercase tracking-wider mb-2">Research Finding</h5>
                  <p className="text-sm text-ink-200">
                    Princeton's WebTAP study found that the top 1 million websites have
                    <strong> 81% of pages</strong> containing at least one cookie sync.
                  </p>
                </div>
                <div className="bg-paper-100 p-4 rounded-sm">
                  <h5 className="font-mono text-xs uppercase tracking-wider mb-2">Network Effect</h5>
                  <p className="text-sm text-ink-200">
                    A single sync event can connect your identity across
                    <strong> 100+ companies</strong> through transitive relationships.
                  </p>
                </div>
              </div>
            </DocumentSection>

            <DocumentSection title="Types of Cookie Syncing">
              <div className="not-prose space-y-4 my-6">
                <div className="border-l-4 border-alert-red pl-4">
                  <h5 className="font-mono text-sm font-bold mb-1">Pixel Syncing (Most Common)</h5>
                  <p className="text-sm text-ink-200">
                    Invisible 1x1 pixel images that carry IDs in the URL. Fires on page load.
                    Can't be blocked without breaking images entirely.
                  </p>
                  <code className="text-xs block mt-2 bg-paper-200 p-2">
                    &lt;img src="sync.adnetwork.com/match?id=12345" width="1" height="1"&gt;
                  </code>
                </div>

                <div className="border-l-4 border-alert-orange pl-4">
                  <h5 className="font-mono text-sm font-bold mb-1">Redirect Syncing</h5>
                  <p className="text-sm text-ink-200">
                    URL redirects that pass IDs through chains. Often used for SSP-DSP
                    integrations. Can sync multiple partners in one redirect chain.
                  </p>
                  <code className="text-xs block mt-2 bg-paper-200 p-2">
                    ssp.com/sync → dsp1.com/sync?id=X → dsp2.com/sync?id=Y → ...
                  </code>
                </div>

                <div className="border-l-4 border-alert-orange pl-4">
                  <h5 className="font-mono text-sm font-bold mb-1">Server-Side Syncing</h5>
                  <p className="text-sm text-ink-200">
                    IDs exchanged directly between company servers. Invisible to browsers
                    and impossible to block. Growing in popularity.
                  </p>
                </div>

                <div className="border-l-4 border-ink pl-4">
                  <h5 className="font-mono text-sm font-bold mb-1">JavaScript Syncing</h5>
                  <p className="text-sm text-ink-200">
                    Scripts that read/write cookies and send IDs to multiple endpoints.
                    More complex but can collect additional data during sync.
                  </p>
                </div>
              </div>
            </DocumentSection>

            <DocumentSection title="Real-World Sync Network">
              <p>
                Here's what an actual cookie sync network looks like based on research data:
              </p>

              <div className="not-prose overflow-x-auto my-6">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-ink">
                      <th className="text-left py-2 font-mono">Company</th>
                      <th className="text-left py-2 font-mono">Type</th>
                      <th className="text-left py-2 font-mono">Sync Partners</th>
                      <th className="text-left py-2 font-mono">Reach</th>
                    </tr>
                  </thead>
                  <tbody className="font-mono text-xs">
                    <tr className="border-b border-paper-300">
                      <td className="py-2">Google (DoubleClick)</td>
                      <td className="py-2">Ad Network</td>
                      <td className="py-2">100+</td>
                      <td className="py-2">~90% of web</td>
                    </tr>
                    <tr className="border-b border-paper-300">
                      <td className="py-2">Facebook</td>
                      <td className="py-2">Social/Ads</td>
                      <td className="py-2">50+</td>
                      <td className="py-2">~40% of web</td>
                    </tr>
                    <tr className="border-b border-paper-300">
                      <td className="py-2">The Trade Desk</td>
                      <td className="py-2">DSP</td>
                      <td className="py-2">80+</td>
                      <td className="py-2">~30% of web</td>
                    </tr>
                    <tr className="border-b border-paper-300">
                      <td className="py-2">Criteo</td>
                      <td className="py-2">Retargeting</td>
                      <td className="py-2">60+</td>
                      <td className="py-2">~35% of web</td>
                    </tr>
                    <tr className="border-b border-paper-300">
                      <td className="py-2">LiveRamp</td>
                      <td className="py-2">Identity</td>
                      <td className="py-2">500+</td>
                      <td className="py-2">~25% of web</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </DocumentSection>

            <DocumentSection title="Privacy Implications">
              <div className="not-prose grid md:grid-cols-2 gap-4 my-6">
                <div className="bg-alert-red/10 p-4 rounded-sm border-l-4 border-alert-red">
                  <h5 className="font-mono text-sm font-bold mb-2">No Meaningful Consent</h5>
                  <p className="text-sm text-ink-200">
                    You might consent to Site A using cookies. But cookie syncing spreads
                    your identity to companies you never agreed to share with.
                  </p>
                </div>
                <div className="bg-alert-red/10 p-4 rounded-sm border-l-4 border-alert-red">
                  <h5 className="font-mono text-sm font-bold mb-2">Profile Aggregation</h5>
                  <p className="text-sm text-ink-200">
                    Data from different sources combines into detailed profiles. Your
                    health searches + shopping + location = complete picture.
                  </p>
                </div>
                <div className="bg-alert-orange/10 p-4 rounded-sm border-l-4 border-alert-orange">
                  <h5 className="font-mono text-sm font-bold mb-2">Persistence</h5>
                  <p className="text-sm text-ink-200">
                    Delete cookies from one company? Others can "respawn" your ID through
                    sync relationships. Your identity is distributed, not local.
                  </p>
                </div>
                <div className="bg-alert-orange/10 p-4 rounded-sm border-l-4 border-alert-orange">
                  <h5 className="font-mono text-sm font-bold mb-2">Data Broker Access</h5>
                  <p className="text-sm text-ink-200">
                    Cookie syncing connects online tracking to offline data brokers who
                    know your real name, address, and financial data.
                  </p>
                </div>
              </div>
            </DocumentSection>

            <DocumentSection title="Defense Strategies">
              <div className="not-prose space-y-4 my-6">
                <div className="bg-alert-green/10 p-4 rounded-sm border-l-4 border-alert-green">
                  <h5 className="font-mono text-sm font-bold mb-2">Firefox Enhanced Tracking Protection</h5>
                  <p className="text-sm text-ink-200">
                    Blocks known tracking domains and isolates cookies to first-party context.
                    Set to "Strict" mode for maximum protection.
                  </p>
                </div>
                <div className="bg-alert-green/10 p-4 rounded-sm border-l-4 border-alert-green">
                  <h5 className="font-mono text-sm font-bold mb-2">Safari ITP (Intelligent Tracking Prevention)</h5>
                  <p className="text-sm text-ink-200">
                    Machine learning-based tracker blocking. Purges cross-site tracking data
                    after 7 days. Industry-leading cookie isolation.
                  </p>
                </div>
                <div className="bg-alert-green/10 p-4 rounded-sm border-l-4 border-alert-green">
                  <h5 className="font-mono text-sm font-bold mb-2">uBlock Origin + Privacy Lists</h5>
                  <p className="text-sm text-ink-200">
                    Block sync pixel domains directly. Use EasyPrivacy, uBlock filters,
                    and Disconnect lists for comprehensive coverage.
                  </p>
                </div>
                <div className="bg-alert-orange/10 p-4 rounded-sm border-l-4 border-alert-orange">
                  <h5 className="font-mono text-sm font-bold mb-2">First-Party Isolation (Firefox)</h5>
                  <p className="text-sm text-ink-200">
                    <code>about:config → privacy.firstparty.isolate = true</code><br />
                    Cookies are siloed per-site. Breaks some sites but very effective.
                  </p>
                </div>
              </div>

              <div className="not-prose bg-paper-200 p-4 rounded-sm my-6">
                <h4 className="font-mono text-sm font-bold mb-2">The Harsh Truth</h4>
                <p className="text-sm text-ink-200">
                  Cookie syncing is moving server-side, where browsers can't block it.
                  The industry is also developing cookieless alternatives (Unified ID 2.0,
                  Google Topics) that may be even harder to escape.
                </p>
              </div>
            </DocumentSection>
          </article>

          <div className="mt-8 pt-8 border-t border-paper-300">
            <div className="flex justify-between items-center">
              <Link
                href="/simulation/rtb/"
                className="inline-flex items-center gap-2 text-sm font-mono hover:underline"
              >
                ← Previous: RTB Simulator
              </Link>
              <Link
                href="/simulation/cname/"
                className="inline-flex items-center gap-2 text-sm font-mono hover:underline"
              >
                Next: CNAME Cloaking →
              </Link>
            </div>
          </div>
        </Document>

        <div className="flex justify-center gap-6 mt-8">
          <Stamp variant="classified">Technical Brief</Stamp>
          <Stamp variant="denied">Identity Exchange</Stamp>
        </div>
      </div>
    </div>
  );
}
