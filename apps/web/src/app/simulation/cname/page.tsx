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
  title: 'CNAME Cloaking Detection - Third-Party Tracker Disguise | Panopticlick',
  description:
    'Learn how CNAME cloaking disguises third-party trackers as first-party scripts. Understand DNS-level tracking evasion and how to detect it.',
  openGraph: {
    title: 'CNAME Cloaking: When Trackers Wear First-Party Masks',
    description:
      'Third-party trackers disguised as first-party using DNS. The evasion technique browsers can\'t catch.',
    type: 'article',
  },
};

export default function CNAMECloakingPage() {
  return (
    <div className="bg-paper grid-bg">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Document variant="classified" watermark="CLOAKING">
          <DocumentHeader
            title="CNAME Cloaking Detection"
            subtitle="Trackers wearing first-party disguises"
            classification="top-secret"
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
            <span className="text-sm font-bold">CNAME Cloaking</span>
          </nav>

          <article className="prose prose-lg max-w-none">
            <DocumentSection title="The New Evasion Technique">
              <p>
                Browsers got better at blocking third-party cookies and tracking scripts.
                So the ad-tech industry adapted with a clever trick: make third-party
                trackers <em>look</em> like first-party.
              </p>
              <p>
                <strong>CNAME cloaking</strong> uses DNS records to disguise tracking domains
                as subdomains of the website you're visiting. Your browser sees
                "analytics.news-site.com" — but it actually points to "tracker-company.com".
              </p>

              <div className="not-prose bg-alert-red/10 border-l-4 border-alert-red p-4 my-6">
                <p className="font-mono text-sm">
                  <strong>BYPASS ALERT:</strong> CNAME cloaking defeats most browser privacy
                  features. Safari ITP, Firefox ETP, and standard ad blockers often fail to
                  detect these disguised trackers.
                </p>
              </div>
            </DocumentSection>

            <DocumentSection title="How CNAME Cloaking Works">
              <h4 className="font-mono text-sm uppercase tracking-wider mt-6 mb-3">Normal Third-Party Tracking</h4>

              <div className="not-prose">
                <div className="bg-ink text-paper p-4 rounded-sm font-mono text-sm my-6">
                  <pre className="whitespace-pre-wrap">
{`You visit: news-site.com

Page loads script from: tracker-company.com/script.js
                        ^^^^^^^^^^^^^^^^^^^
                        THIRD-PARTY DOMAIN

Browser says: "That's a third-party tracker!"
              → Blocks cookies
              → Applies privacy restrictions
              → May block entirely`}
                  </pre>
                </div>
              </div>

              <h4 className="font-mono text-sm uppercase tracking-wider mt-6 mb-3">With CNAME Cloaking</h4>

              <div className="not-prose">
                <div className="bg-ink text-paper p-4 rounded-sm font-mono text-sm my-6">
                  <pre className="whitespace-pre-wrap">
{`You visit: news-site.com

DNS Configuration (set by news-site.com):
┌─────────────────────────────────────────────────────┐
│ analytics.news-site.com  CNAME  tracker.tracker.net│
│                          ^^^^^                      │
│                          DNS alias pointing to      │
│                          third-party server         │
└─────────────────────────────────────────────────────┘

Page loads script from: analytics.news-site.com/script.js
                        ^^^^^^^^^^^^^^^^^^^^^^^
                        LOOKS LIKE FIRST-PARTY!

Browser says: "That's the same domain, must be safe!"
              → Full cookie access
              → No privacy restrictions
              → Not blocked

ACTUAL SERVER: tracker-company.com (third-party!)

Result: Tracker gets first-party privileges through DNS magic`}
                  </pre>
                </div>
              </div>
            </DocumentSection>

            <DocumentSection title="Why This Is Dangerous">
              <div className="not-prose grid md:grid-cols-2 gap-4 my-6">
                <div className="bg-alert-red/10 p-4 rounded-sm border-l-4 border-alert-red">
                  <h5 className="font-mono text-sm font-bold mb-2">First-Party Cookie Access</h5>
                  <p className="text-sm text-ink-200">
                    The disguised tracker can read and write first-party cookies. Your
                    authentication tokens, session IDs—potentially accessible.
                  </p>
                </div>
                <div className="bg-alert-red/10 p-4 rounded-sm border-l-4 border-alert-red">
                  <h5 className="font-mono text-sm font-bold mb-2">Bypasses ITP/ETP</h5>
                  <p className="text-sm text-ink-200">
                    Safari's Intelligent Tracking Prevention and Firefox's Enhanced Tracking
                    Protection rely on domain-based blocking. CNAME breaks this model.
                  </p>
                </div>
                <div className="bg-alert-orange/10 p-4 rounded-sm border-l-4 border-alert-orange">
                  <h5 className="font-mono text-sm font-bold mb-2">Ad Blockers Blind</h5>
                  <p className="text-sm text-ink-200">
                    Standard blocklist-based ad blockers can't detect CNAME cloaking without
                    DNS-level inspection. The domain looks legitimate.
                  </p>
                </div>
                <div className="bg-alert-orange/10 p-4 rounded-sm border-l-4 border-alert-orange">
                  <h5 className="font-mono text-sm font-bold mb-2">Cross-Site Data Leakage</h5>
                  <p className="text-sm text-ink-200">
                    If the same tracker is CNAME'd across multiple sites, they can correlate
                    your activity using first-party cookie access.
                  </p>
                </div>
              </div>
            </DocumentSection>

            <DocumentSection title="Known CNAME Cloaking Providers">
              <p>
                Research has identified numerous companies offering CNAME-based tracking:
              </p>

              <div className="not-prose overflow-x-auto my-6">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-ink">
                      <th className="text-left py-2 font-mono">Provider</th>
                      <th className="text-left py-2 font-mono">Type</th>
                      <th className="text-left py-2 font-mono">Example CNAME</th>
                    </tr>
                  </thead>
                  <tbody className="font-mono text-xs">
                    <tr className="border-b border-paper-300">
                      <td className="py-2">Adobe Analytics</td>
                      <td className="py-2">Analytics</td>
                      <td className="py-2">metrics.*.com → 2o7.net</td>
                    </tr>
                    <tr className="border-b border-paper-300">
                      <td className="py-2">Criteo</td>
                      <td className="py-2">Retargeting</td>
                      <td className="py-2">*.criteo.com variants</td>
                    </tr>
                    <tr className="border-b border-paper-300">
                      <td className="py-2">Eulerian</td>
                      <td className="py-2">Attribution</td>
                      <td className="py-2">*.eulerian.net</td>
                    </tr>
                    <tr className="border-b border-paper-300">
                      <td className="py-2">Keyade</td>
                      <td className="py-2">Analytics</td>
                      <td className="py-2">*.k.keyade.com</td>
                    </tr>
                    <tr className="border-b border-paper-300">
                      <td className="py-2">Pardot (Salesforce)</td>
                      <td className="py-2">Marketing</td>
                      <td className="py-2">go.*.com → pardot.com</td>
                    </tr>
                    <tr className="border-b border-paper-300">
                      <td className="py-2">TraceDock</td>
                      <td className="py-2">Analytics</td>
                      <td className="py-2">Various CNAMEs</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="not-prose bg-paper-100 p-4 rounded-sm my-6">
                <p className="text-sm">
                  <strong>Research finding (2021):</strong> A study of the top 10,000 websites
                  found that <Redacted>~10% use CNAME cloaking</Redacted> for at least one
                  tracking service. This number is growing.
                </p>
              </div>
            </DocumentSection>

            <DocumentSection title="How to Detect CNAME Cloaking">
              <h4 className="font-mono text-sm uppercase tracking-wider mt-6 mb-3">Method 1: DNS Lookup</h4>

              <div className="not-prose">
                <div className="bg-ink text-paper p-4 rounded-sm font-mono text-sm my-6">
                  <div className="text-highlight mb-2"># Check for CNAME records</div>
                  <pre>{`$ dig analytics.example.com

;; ANSWER SECTION:
analytics.example.com.  300  IN  CNAME  tracker.thirdparty.net.
tracker.thirdparty.net. 300  IN  A      203.0.113.42

# If CNAME points to a different domain → potential cloaking!`}</pre>
                </div>
              </div>

              <h4 className="font-mono text-sm uppercase tracking-wider mt-6 mb-3">Method 2: Certificate Inspection</h4>

              <div className="not-prose">
                <div className="bg-ink text-paper p-4 rounded-sm font-mono text-sm my-6">
                  <pre>{`When visiting analytics.example.com:

Certificate Subject: *.thirdparty.net
                     ^^^^^^^^^^^^^^^^
                     Different from the subdomain!

If the SSL certificate doesn't match the subdomain,
it's likely CNAME cloaked.`}</pre>
                </div>
              </div>

              <h4 className="font-mono text-sm uppercase tracking-wider mt-6 mb-3">Method 3: Browser DevTools</h4>
              <ol>
                <li>Open DevTools → Network tab</li>
                <li>Look for first-party subdomain requests</li>
                <li>Check the "Remote Address" column</li>
                <li>If it resolves to a known tracker IP → cloaking detected</li>
              </ol>
            </DocumentSection>

            <DocumentSection title="Technical Deep Dive">
              <h4 className="font-mono text-sm uppercase tracking-wider mt-6 mb-3">The DNS Resolution Chain</h4>

              <div className="not-prose">
                <div className="bg-ink text-paper p-6 rounded-sm font-mono text-sm my-6">
                  <pre className="whitespace-pre-wrap">
{`Browser requests: analytics.news-site.com

DNS Resolution:
1. Browser → Local DNS Resolver
   "What is analytics.news-site.com?"

2. Resolver → news-site.com Authoritative DNS
   Response: CNAME → tracking.adtech-corp.com

3. Resolver → adtech-corp.com Authoritative DNS
   Response: A → 198.51.100.50 (tracker server IP)

4. Resolver → Browser
   "analytics.news-site.com is 198.51.100.50"

5. Browser → 198.51.100.50
   HTTP Request with Origin: news-site.com
   Cookies: First-party cookies from news-site.com!

The browser never sees the CNAME chain.
It just gets an IP address and trusts the domain.`}
                  </pre>
                </div>
              </div>

              <h4 className="font-mono text-sm uppercase tracking-wider mt-6 mb-3">Security Implications</h4>
              <ul>
                <li>
                  <strong>Cookie scope issues:</strong> If news-site.com sets cookies
                  without the <code>__Host-</code> prefix, the cloaked tracker can access them.
                </li>
                <li>
                  <strong>CSP bypass:</strong> Content Security Policy allows
                  "*.news-site.com" but can't distinguish cloaked third-parties.
                </li>
                <li>
                  <strong>SameSite=Lax bypass:</strong> Cookies meant only for same-site
                  requests get sent to the disguised tracker.
                </li>
              </ul>
            </DocumentSection>

            <DocumentSection title="Defense Strategies">
              <div className="not-prose space-y-4 my-6">
                <div className="bg-alert-green/10 p-4 rounded-sm border-l-4 border-alert-green">
                  <h5 className="font-mono text-sm font-bold mb-2">Firefox + uBlock Origin</h5>
                  <p className="text-sm text-ink-200">
                    Recent versions of uBlock Origin can detect CNAME cloaking by
                    resolving DNS before applying blocklists. Enable
                    "uncloak canonical names" in settings.
                  </p>
                </div>
                <div className="bg-alert-green/10 p-4 rounded-sm border-l-4 border-alert-green">
                  <h5 className="font-mono text-sm font-bold mb-2">Safari 14+ / WebKit</h5>
                  <p className="text-sm text-ink-200">
                    Apple added CNAME cloaking detection to Safari. Third-party CNAME
                    records are now resolved and blocked if on tracking lists.
                  </p>
                </div>
                <div className="bg-alert-green/10 p-4 rounded-sm border-l-4 border-alert-green">
                  <h5 className="font-mono text-sm font-bold mb-2">Pi-hole / NextDNS</h5>
                  <p className="text-sm text-ink-200">
                    DNS-level blockers can detect CNAME chains and block known tracking
                    endpoints regardless of the alias used. Network-wide protection.
                  </p>
                </div>
                <div className="bg-alert-orange/10 p-4 rounded-sm border-l-4 border-alert-orange">
                  <h5 className="font-mono text-sm font-bold mb-2">Brave Browser</h5>
                  <p className="text-sm text-ink-200">
                    Brave's built-in shields include CNAME uncloaking for known trackers.
                    Good protection but not as comprehensive as uBlock + Firefox.
                  </p>
                </div>
              </div>

              <div className="not-prose bg-alert-red/10 p-4 rounded-sm my-6 border-l-4 border-alert-red">
                <h4 className="font-mono text-sm font-bold mb-2">Chrome Users: Limited Options</h4>
                <p className="text-sm text-ink-200">
                  Chrome's extension API doesn't allow DNS resolution before requests.
                  uBlock Origin on Chrome <strong>cannot</strong> detect CNAME cloaking.
                  Consider switching browsers or using network-level DNS blocking.
                </p>
              </div>
            </DocumentSection>

            <DocumentSection title="The Bigger Picture">
              <p>
                CNAME cloaking represents an arms race escalation. As browsers improve
                privacy protections, the tracking industry develops more sophisticated
                evasion techniques.
              </p>
              <p>
                What's next? Server-side tracking (completely invisible to browsers),
                device fingerprinting, and identity graphs that don't need cookies at all.
                Privacy is a moving target.
              </p>

              <div className="not-prose bg-paper-200 p-4 rounded-sm my-6">
                <h4 className="font-mono text-sm font-bold mb-2">Recommendations</h4>
                <ol className="text-sm text-ink-200 space-y-1">
                  <li>1. Use Firefox with uBlock Origin (CNAME uncloaking enabled)</li>
                  <li>2. Consider a DNS-level blocker (Pi-hole, NextDNS, AdGuard Home)</li>
                  <li>3. Enable Firefox's Enhanced Tracking Protection (Strict mode)</li>
                  <li>4. Regularly check subdomains on sites you visit</li>
                  <li>5. Stay informed—new techniques emerge constantly</li>
                </ol>
              </div>
            </DocumentSection>
          </article>

          <div className="mt-8 pt-8 border-t border-paper-300">
            <div className="flex justify-between items-center">
              <Link
                href="/simulation/cookie-sync/"
                className="inline-flex items-center gap-2 text-sm font-mono hover:underline"
              >
                ← Previous: Cookie Syncing
              </Link>
              <Link
                href="/simulation/"
                className="inline-flex items-center gap-2 text-sm font-mono hover:underline"
              >
                Back to Simulation Lab →
              </Link>
            </div>
          </div>
        </Document>

        <div className="flex justify-center gap-6 mt-8">
          <Stamp variant="classified">Technical Brief</Stamp>
          <Stamp variant="denied">DNS Evasion</Stamp>
        </div>
      </div>
    </div>
  );
}
