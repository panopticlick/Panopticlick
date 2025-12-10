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
  title: 'Supercookies Explained - HSTS, Favicon, ETag Tracking | Panopticlick',
  description:
    'Learn about supercookies: persistent tracking mechanisms that survive cookie deletion, private browsing, and browser reinstalls. HSTS, favicon cache, ETag, and localStorage tracking explained.',
  openGraph: {
    title: 'Supercookies: The Tracking That Never Dies',
    description:
      'HSTS supercookies, favicon cache tracking, ETag identifiers - tracking mechanisms that survive everything.',
    type: 'article',
  },
};

export default function SupercookiesPage() {
  return (
    <div className="bg-paper grid-bg">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Document variant="classified" watermark="PERSISTENT">
          <DocumentHeader
            title="Supercookies"
            subtitle="Tracking that survives everything you throw at it"
            classification="top-secret"
            date={new Date()}
          />

          <nav className="mb-8 p-4 bg-paper-100 rounded-sm">
            <span className="text-xs font-mono text-ink-300 uppercase tracking-wider">
              Navigate:{' '}
            </span>
            <Link href="/anatomy/" className="text-sm hover:underline">
              Anatomy Index
            </Link>
            <span className="text-ink-300 mx-2">→</span>
            <span className="text-sm font-bold">Supercookies</span>
          </nav>

          <article className="prose prose-lg max-w-none">
            <DocumentSection title="What are Supercookies?">
              <p>
                Regular cookies are like name tags—easy to remove. <strong>Supercookies</strong> are
                like tattoos: persistent, hard to erase, and often invisible to the user.
              </p>
              <p>
                These tracking mechanisms abuse legitimate browser features (caching, security
                headers, storage APIs) to store identifiers that survive:
              </p>
              <ul>
                <li>Cookie deletion ("Clear browsing data")</li>
                <li>Private/Incognito browsing</li>
                <li>Browser cache clearing</li>
                <li>Some even survive browser reinstallation</li>
              </ul>

              <div className="not-prose bg-alert-red/10 border-l-4 border-alert-red p-4 my-6">
                <p className="font-mono text-sm">
                  <strong>WARNING:</strong> Supercookies are banned by most platform policies but
                  still widely used. Major companies including Verizon, Hulu, and KISSmetrics
                  have been caught using them.
                </p>
              </div>
            </DocumentSection>

            <DocumentSection title="HSTS Supercookies">
              <p>
                <strong>HTTP Strict Transport Security (HSTS)</strong> is a security feature—it tells
                browsers to always use HTTPS for a domain. But it can be weaponized for tracking.
              </p>

              <h4 className="font-mono text-sm uppercase tracking-wider mt-6 mb-3">How the Attack Works</h4>
              <ol>
                <li>Tracker controls multiple subdomains: <code>a.tracker.com</code>, <code>b.tracker.com</code>, etc.</li>
                <li>On first visit, specific subdomains are set as HSTS (HTTPS-only)</li>
                <li>This creates a binary pattern: <code>a=1, b=0, c=1, d=1</code> = "1011"</li>
                <li>On return visits, browser's HSTS behavior reveals the stored pattern</li>
                <li>Pattern = unique identifier that survives cookie deletion</li>
              </ol>

              <div className="not-prose">
                <div className="bg-ink text-paper p-4 rounded-sm font-mono text-sm my-6">
                  <div className="text-highlight mb-2">// HSTS Supercookie Encoding</div>
                  <pre>{`User ID: 42 (binary: 101010)

Subdomains set as HSTS:
✓ bit0.tracker.com (HSTS ON)  = 0
✗ bit1.tracker.com (HSTS OFF) = 1
✓ bit2.tracker.com (HSTS ON)  = 0
✗ bit3.tracker.com (HSTS OFF) = 1
✓ bit4.tracker.com (HSTS ON)  = 0
✗ bit5.tracker.com (HSTS OFF) = 1

Reading: Check if HTTP → HTTPS redirect occurs
Result:  Decode binary → User ID 42`}</pre>
                </div>
              </div>

              <div className="not-prose grid md:grid-cols-2 gap-4 my-6">
                <div className="bg-paper-100 p-4 rounded-sm">
                  <h5 className="font-mono text-xs uppercase tracking-wider mb-2 text-alert-red">
                    Persistence
                  </h5>
                  <div className="text-2xl font-bold">Months to Years</div>
                  <p className="text-sm text-ink-200">
                    HSTS entries can persist for extended periods
                  </p>
                </div>
                <div className="bg-paper-100 p-4 rounded-sm">
                  <h5 className="font-mono text-xs uppercase tracking-wider mb-2 text-alert-orange">
                    Clearing Difficulty
                  </h5>
                  <div className="text-2xl font-bold">Very Hard</div>
                  <p className="text-sm text-ink-200">
                    Requires finding and clearing HSTS settings specifically
                  </p>
                </div>
              </div>
            </DocumentSection>

            <DocumentSection title="Favicon Cache Tracking">
              <p>
                Your browser caches favicons (the little icons in browser tabs) to speed up
                loading. This innocent feature becomes a tracking vector.
              </p>

              <h4 className="font-mono text-sm uppercase tracking-wider mt-6 mb-3">The Technique</h4>
              <ol>
                <li>Website serves a unique favicon per user on first visit</li>
                <li>Favicon is cached—browser won't request it again</li>
                <li>On return visits, server checks which favicon the browser requested</li>
                <li>Cached = returning user; new request = new user</li>
              </ol>

              <div className="not-prose bg-paper-100 p-4 rounded-sm my-6">
                <p className="text-sm">
                  <strong>Real-world example:</strong> A research paper demonstrated tracking
                  users across <Redacted>2+ years</Redacted> using favicon caches, even after
                  they cleared all cookies and browsing history.
                </p>
              </div>

              <p>
                <strong>Why it's nasty:</strong> Favicons are rarely cleared. Most "clear
                browsing data" options don't touch them. Even switching to Incognito mode
                might not help if the favicon is already cached.
              </p>
            </DocumentSection>

            <DocumentSection title="ETag Tracking">
              <p>
                <strong>ETags</strong> (Entity Tags) help browsers know if cached content is fresh.
                When abused, they become persistent identifiers.
              </p>

              <h4 className="font-mono text-sm uppercase tracking-wider mt-6 mb-3">Normal ETag Flow</h4>
              <div className="not-prose">
                <div className="bg-ink text-paper p-4 rounded-sm font-mono text-sm my-6">
                  <pre>{`Server: ETag: "abc123"
Browser: (caches image with ETag "abc123")

Later...
Browser: If-None-Match: "abc123"
Server: 304 Not Modified (use cached version)`}</pre>
                </div>
              </div>

              <h4 className="font-mono text-sm uppercase tracking-wider mt-6 mb-3">Tracking Abuse</h4>
              <div className="not-prose">
                <div className="bg-ink text-paper p-4 rounded-sm font-mono text-sm my-6">
                  <pre>{`First visit:
Server: ETag: "USER-ID-7a3b9f2c" ← Unique per user!

Return visit:
Browser: If-None-Match: "USER-ID-7a3b9f2c"
Server: "Ah, user 7a3b9f2c is back!"

→ Identifier stored in HTTP cache
→ Survives cookie deletion
→ Works across sessions`}</pre>
                </div>
              </div>

              <p>
                <strong>KISSmetrics scandal (2011):</strong> This company was caught using ETag
                tracking to respawn deleted cookies. They settled a class-action lawsuit
                but the technique lives on.
              </p>
            </DocumentSection>

            <DocumentSection title="localStorage & IndexedDB">
              <p>
                Modern browsers provide powerful storage APIs. While not as sneaky as HSTS
                or ETags, they're commonly abused for tracking persistence.
              </p>

              <div className="not-prose grid md:grid-cols-2 gap-4 my-6">
                <div className="bg-paper-100 p-4 rounded-sm">
                  <h5 className="font-mono text-sm font-bold mb-2">localStorage</h5>
                  <ul className="text-sm text-ink-200 space-y-1">
                    <li>• 5-10 MB storage per origin</li>
                    <li>• Persists until explicitly cleared</li>
                    <li>• Synchronous API (simple to use)</li>
                    <li>• Often forgotten when clearing data</li>
                  </ul>
                </div>
                <div className="bg-paper-100 p-4 rounded-sm">
                  <h5 className="font-mono text-sm font-bold mb-2">IndexedDB</h5>
                  <ul className="text-sm text-ink-200 space-y-1">
                    <li>• Much larger storage capacity</li>
                    <li>• Supports complex data structures</li>
                    <li>• Async API with transactions</li>
                    <li>• Often survives "clear cookies"</li>
                  </ul>
                </div>
              </div>

              <p>
                <strong>"Cookie syncing"</strong> combines these methods: if one storage
                mechanism is cleared, others restore the ID. Evercookie demonstrated
                respawning from <Redacted>17 different storage locations</Redacted>.
              </p>
            </DocumentSection>

            <DocumentSection title="Other Supercookie Techniques">
              <div className="not-prose space-y-4 my-6">
                <div className="border-l-4 border-alert-orange pl-4">
                  <h5 className="font-mono text-sm font-bold mb-1">Flash LSOs (Deprecated)</h5>
                  <p className="text-sm text-ink-200">
                    Flash "Local Shared Objects" stored tracking data outside browser control.
                    Mostly dead now that Flash is gone.
                  </p>
                </div>
                <div className="border-l-4 border-alert-orange pl-4">
                  <h5 className="font-mono text-sm font-bold mb-1">Silverlight Storage (Deprecated)</h5>
                  <p className="text-sm text-ink-200">
                    Microsoft's Flash competitor had similar isolated storage. Also dead.
                  </p>
                </div>
                <div className="border-l-4 border-alert-red pl-4">
                  <h5 className="font-mono text-sm font-bold mb-1">window.name</h5>
                  <p className="text-sm text-ink-200">
                    Still works! The window.name property persists across page loads and
                    can store tracking data invisibly.
                  </p>
                </div>
                <div className="border-l-4 border-alert-red pl-4">
                  <h5 className="font-mono text-sm font-bold mb-1">CSS :visited History</h5>
                  <p className="text-sm text-ink-200">
                    Browsers now limit this, but historically your browsing history could
                    be probed via CSS link styling.
                  </p>
                </div>
              </div>
            </DocumentSection>

            <DocumentSection title="Defense Strategies">
              <div className="not-prose space-y-4 my-6">
                <div className="bg-alert-green/10 p-4 rounded-sm border-l-4 border-alert-green">
                  <h5 className="font-mono text-sm font-bold mb-2">Tor Browser</h5>
                  <p className="text-sm text-ink-200">
                    Best defense. New circuit = new identity. HSTS state is isolated.
                    Clears everything on close.
                  </p>
                </div>
                <div className="bg-alert-green/10 p-4 rounded-sm border-l-4 border-alert-green">
                  <h5 className="font-mono text-sm font-bold mb-2">Firefox: Clear on Close</h5>
                  <p className="text-sm text-ink-200">
                    Settings → Privacy → "Delete cookies and site data when Firefox is closed."
                    Also check "Clear history when Firefox closes" with all options.
                  </p>
                </div>
                <div className="bg-alert-orange/10 p-4 rounded-sm border-l-4 border-alert-orange">
                  <h5 className="font-mono text-sm font-bold mb-2">Chrome: Manual HSTS Clear</h5>
                  <p className="text-sm text-ink-200">
                    Visit <code>chrome://net-internals/#hsts</code> → Query/Delete HSTS
                    entries. Tedious but effective.
                  </p>
                </div>
                <div className="bg-alert-orange/10 p-4 rounded-sm border-l-4 border-alert-orange">
                  <h5 className="font-mono text-sm font-bold mb-2">Brave Browser</h5>
                  <p className="text-sm text-ink-200">
                    Aggressive defaults that clear various storage mechanisms. Good
                    balance of usability and privacy.
                  </p>
                </div>
              </div>

              <div className="bg-paper-200 p-4 rounded-sm my-6">
                <h4 className="font-mono text-sm font-bold mb-2">The Nuclear Option</h4>
                <p className="text-sm text-ink-200">
                  Use browser profiles. Create a new profile = completely fresh state.
                  All HSTS, caches, and storage start from zero. Some privacy-focused
                  users create disposable profiles for each browsing session.
                </p>
              </div>
            </DocumentSection>
          </article>

          <div className="mt-8 pt-8 border-t border-paper-300">
            <div className="flex justify-between items-center">
              <Link
                href="/anatomy/fingerprinting/"
                className="inline-flex items-center gap-2 text-sm font-mono hover:underline"
              >
                ← Previous: Fingerprinting
              </Link>
              <Link
                href="/anatomy/behavior/"
                className="inline-flex items-center gap-2 text-sm font-mono hover:underline"
              >
                Next: Behavioral Tracking →
              </Link>
            </div>
          </div>
        </Document>

        <div className="flex justify-center gap-6 mt-8">
          <Stamp variant="classified">Technical Brief</Stamp>
          <Stamp variant="denied">High Threat</Stamp>
        </div>
      </div>
    </div>
  );
}
