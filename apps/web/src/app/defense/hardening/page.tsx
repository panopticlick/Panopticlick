import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Document,
  DocumentHeader,
  DocumentSection,
  Stamp,
} from '@/components/ui';

export const metadata: Metadata = {
  title: 'Browser Hardening Guide - Firefox, Chrome & Brave Privacy Settings | Panopticlick',
  description:
    'Step-by-step browser hardening guide. Configure Firefox, Chrome, or Brave for maximum privacy with detailed settings and about:config tweaks.',
  openGraph: {
    title: 'Browser Hardening: The Complete Privacy Configuration Guide',
    description:
      'Configure your browser for maximum privacy. Firefox, Chrome, Brave settings explained.',
    type: 'article',
  },
};

export default function HardeningGuidePage() {
  return (
    <div className="bg-paper grid-bg">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Document variant="classified" watermark="HARDENING">
          <DocumentHeader
            title="Browser Hardening Guide"
            subtitle="Configure your browser for maximum privacy"
            classification="unclassified"
            date={new Date()}
          />

          <nav className="mb-8 p-4 bg-paper-100 rounded-sm">
            <span className="text-xs font-mono text-ink-300 uppercase tracking-wider">
              Navigate:{' '}
            </span>
            <Link href="/defense/" className="text-sm hover:underline">
              Defense Armory
            </Link>
            <span className="text-ink-300 mx-2">→</span>
            <span className="text-sm font-bold">Browser Hardening</span>
          </nav>

          <article className="prose prose-lg max-w-none">
            <DocumentSection title="Why Harden Your Browser?">
              <p>
                Your browser is your window to the internet—and it can also be a window
                <em>into</em> your life. Out of the box, most browsers prioritize convenience
                over privacy. This guide shows you how to change that.
              </p>
              <p>
                We'll cover three scenarios:
              </p>
              <ul>
                <li><strong>Firefox hardening</strong> (recommended for most users)</li>
                <li><strong>Chrome privacy settings</strong> (if you must use Chrome)</li>
                <li><strong>Brave configuration</strong> (good balance of privacy/usability)</li>
              </ul>

              <div className="not-prose bg-alert-orange/10 border-l-4 border-alert-orange p-4 my-6">
                <p className="font-mono text-sm">
                  <strong>WARNING:</strong> Aggressive hardening can break websites. Start with
                  basic settings and gradually increase protection. Test on sites you use regularly.
                </p>
              </div>
            </DocumentSection>

            {/* Firefox Section */}
            <DocumentSection title="Firefox Hardening">
              <p>
                Firefox is the best mainstream browser for privacy. It's open-source, non-profit,
                and has extensive customization options. Here's how to configure it.
              </p>

              <h4 className="font-mono text-sm uppercase tracking-wider mt-8 mb-4">
                Step 1: Basic Settings (GUI)
              </h4>
              <ol className="list-decimal list-inside space-y-3">
                <li>
                  <strong>Enable Enhanced Tracking Protection</strong>
                  <p className="text-sm text-ink-200 ml-6 mt-1">
                    Settings → Privacy & Security → Enhanced Tracking Protection → <strong>Strict</strong>
                  </p>
                </li>
                <li>
                  <strong>Disable telemetry</strong>
                  <p className="text-sm text-ink-200 ml-6 mt-1">
                    Settings → Privacy & Security → Firefox Data Collection → Uncheck all boxes
                  </p>
                </li>
                <li>
                  <strong>Enable DNS over HTTPS</strong>
                  <p className="text-sm text-ink-200 ml-6 mt-1">
                    Settings → General → Network Settings → Enable DNS over HTTPS → Cloudflare or NextDNS
                  </p>
                </li>
                <li>
                  <strong>Disable password manager</strong> (use Bitwarden instead)
                  <p className="text-sm text-ink-200 ml-6 mt-1">
                    Settings → Privacy & Security → Logins and Passwords → Uncheck all
                  </p>
                </li>
                <li>
                  <strong>Clear data on close</strong>
                  <p className="text-sm text-ink-200 ml-6 mt-1">
                    Settings → Privacy & Security → Cookies → Delete cookies when Firefox is closed
                  </p>
                </li>
              </ol>

              <h4 className="font-mono text-sm uppercase tracking-wider mt-8 mb-4">
                Step 2: about:config Tweaks
              </h4>
              <p className="text-sm text-ink-200 mb-4">
                Type <code>about:config</code> in the address bar. Accept the warning. Search for these settings:
              </p>

              <div className="not-prose overflow-x-auto my-6">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-ink">
                      <th className="text-left py-2 font-mono">Preference</th>
                      <th className="text-left py-2 font-mono">Set To</th>
                      <th className="text-left py-2 font-mono">Effect</th>
                    </tr>
                  </thead>
                  <tbody className="font-mono text-xs">
                    <tr className="border-b border-paper-300">
                      <td className="py-2">privacy.resistFingerprinting</td>
                      <td className="py-2 text-alert-green">true</td>
                      <td className="py-2">Blocks most fingerprinting</td>
                    </tr>
                    <tr className="border-b border-paper-300">
                      <td className="py-2">privacy.trackingprotection.enabled</td>
                      <td className="py-2 text-alert-green">true</td>
                      <td className="py-2">Enables tracker blocking</td>
                    </tr>
                    <tr className="border-b border-paper-300">
                      <td className="py-2">privacy.firstparty.isolate</td>
                      <td className="py-2 text-alert-green">true</td>
                      <td className="py-2">Isolates cookies per site</td>
                    </tr>
                    <tr className="border-b border-paper-300">
                      <td className="py-2">media.peerconnection.enabled</td>
                      <td className="py-2 text-alert-red">false</td>
                      <td className="py-2">Disables WebRTC (IP leaks)</td>
                    </tr>
                    <tr className="border-b border-paper-300">
                      <td className="py-2">geo.enabled</td>
                      <td className="py-2 text-alert-red">false</td>
                      <td className="py-2">Blocks geolocation API</td>
                    </tr>
                    <tr className="border-b border-paper-300">
                      <td className="py-2">dom.battery.enabled</td>
                      <td className="py-2 text-alert-red">false</td>
                      <td className="py-2">Blocks battery status API</td>
                    </tr>
                    <tr className="border-b border-paper-300">
                      <td className="py-2">network.cookie.lifetimePolicy</td>
                      <td className="py-2">2</td>
                      <td className="py-2">Deletes cookies on close</td>
                    </tr>
                    <tr className="border-b border-paper-300">
                      <td className="py-2">beacon.enabled</td>
                      <td className="py-2 text-alert-red">false</td>
                      <td className="py-2">Blocks beacon tracking</td>
                    </tr>
                    <tr className="border-b border-paper-300">
                      <td className="py-2">dom.event.clipboardevents.enabled</td>
                      <td className="py-2 text-alert-red">false</td>
                      <td className="py-2">Blocks clipboard snooping</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h4 className="font-mono text-sm uppercase tracking-wider mt-8 mb-4">
                Step 3: Essential Extensions
              </h4>
              <div className="not-prose grid md:grid-cols-2 gap-4 my-6">
                <div className="bg-paper-100 p-4 rounded-sm">
                  <h5 className="font-mono text-sm font-bold mb-2">uBlock Origin</h5>
                  <p className="text-sm text-ink-200">
                    Best ad/tracker blocker. Enable all filter lists. Add annoyances filters.
                  </p>
                </div>
                <div className="bg-paper-100 p-4 rounded-sm">
                  <h5 className="font-mono text-sm font-bold mb-2">Privacy Badger</h5>
                  <p className="text-sm text-ink-200">
                    Learns to block trackers. Good complement to uBlock. By EFF.
                  </p>
                </div>
                <div className="bg-paper-100 p-4 rounded-sm">
                  <h5 className="font-mono text-sm font-bold mb-2">Decentraleyes</h5>
                  <p className="text-sm text-ink-200">
                    Serves CDN files locally. Prevents tracking via common libraries.
                  </p>
                </div>
                <div className="bg-paper-100 p-4 rounded-sm">
                  <h5 className="font-mono text-sm font-bold mb-2">ClearURLs</h5>
                  <p className="text-sm text-ink-200">
                    Removes tracking parameters from URLs. No more ?utm_source chaos.
                  </p>
                </div>
              </div>

              <div className="not-prose bg-alert-green/10 p-4 rounded-sm my-6 border-l-4 border-alert-green">
                <h4 className="font-mono text-sm font-bold mb-2">Pro Tip: Use arkenfox user.js</h4>
                <p className="text-sm text-ink-200">
                  For advanced users, the <a href="https://github.com/arkenfox/user.js" className="underline" target="_blank" rel="noopener">arkenfox user.js</a> project
                  provides a comprehensive Firefox configuration file with hundreds of privacy
                  tweaks. Download, customize, place in your profile folder.
                </p>
              </div>
            </DocumentSection>

            {/* Chrome Section */}
            <DocumentSection title="Chrome Privacy Settings">
              <p>
                Chrome is made by an advertising company. It's fundamentally not designed for
                privacy. But if you must use it, here's how to reduce the damage:
              </p>

              <div className="not-prose bg-alert-red/10 border-l-4 border-alert-red p-4 my-6">
                <p className="font-mono text-sm">
                  <strong>HONEST ADVICE:</strong> Switch to Firefox or Brave. Chrome's architecture
                  limits what privacy extensions can do. Google controls the rules. But if work/sites
                  require Chrome, these settings help.
                </p>
              </div>

              <h4 className="font-mono text-sm uppercase tracking-wider mt-6 mb-4">
                Essential Chrome Settings
              </h4>
              <ol className="list-decimal list-inside space-y-3">
                <li>
                  <strong>Disable "Enhanced Safe Browsing"</strong>
                  <p className="text-sm text-ink-200 ml-6 mt-1">
                    Settings → Privacy → Security → Choose "Standard protection"
                    <br />(Enhanced sends URLs to Google)
                  </p>
                </li>
                <li>
                  <strong>Block third-party cookies</strong>
                  <p className="text-sm text-ink-200 ml-6 mt-1">
                    Settings → Privacy → Third-party cookies → Block third-party cookies
                  </p>
                </li>
                <li>
                  <strong>Disable "Preload pages"</strong>
                  <p className="text-sm text-ink-200 ml-6 mt-1">
                    Settings → Privacy → Preload pages → No preloading
                  </p>
                </li>
                <li>
                  <strong>Turn off Google sync</strong>
                  <p className="text-sm text-ink-200 ml-6 mt-1">
                    Settings → You and Google → Sync and Google services → Turn off sync
                  </p>
                </li>
                <li>
                  <strong>Disable all "Google services"</strong>
                  <p className="text-sm text-ink-200 ml-6 mt-1">
                    Settings → You and Google → Sync and Google services → Toggle all OFF
                  </p>
                </li>
              </ol>

              <h4 className="font-mono text-sm uppercase tracking-wider mt-8 mb-4">
                chrome://flags Tweaks
              </h4>
              <div className="not-prose overflow-x-auto my-6">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-ink">
                      <th className="text-left py-2 font-mono">Flag</th>
                      <th className="text-left py-2 font-mono">Set To</th>
                      <th className="text-left py-2 font-mono">Effect</th>
                    </tr>
                  </thead>
                  <tbody className="font-mono text-xs">
                    <tr className="border-b border-paper-300">
                      <td className="py-2">#disable-webrtc</td>
                      <td className="py-2">Enabled</td>
                      <td className="py-2">Prevents IP leaks</td>
                    </tr>
                    <tr className="border-b border-paper-300">
                      <td className="py-2">#enable-quic</td>
                      <td className="py-2">Disabled</td>
                      <td className="py-2">Blocks QUIC fingerprinting</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p className="text-sm text-ink-200">
                Install uBlock Origin (while you still can—Google is limiting its capabilities
                in Manifest V3). That's really the best you can do on Chrome.
              </p>
            </DocumentSection>

            {/* Brave Section */}
            <DocumentSection title="Brave Configuration">
              <p>
                Brave is Chromium-based but with aggressive privacy defaults. Good middle ground
                between privacy and compatibility. Less configuration needed.
              </p>

              <h4 className="font-mono text-sm uppercase tracking-wider mt-6 mb-4">
                Recommended Settings
              </h4>
              <ol className="list-decimal list-inside space-y-3">
                <li>
                  <strong>Set Shields to Aggressive</strong>
                  <p className="text-sm text-ink-200 ml-6 mt-1">
                    Click Shields icon → Trackers & ads blocking → Aggressive
                  </p>
                </li>
                <li>
                  <strong>Block fingerprinting</strong>
                  <p className="text-sm text-ink-200 ml-6 mt-1">
                    Settings → Shields → Fingerprinting blocking → Strict
                  </p>
                </li>
                <li>
                  <strong>Block third-party cookies</strong>
                  <p className="text-sm text-ink-200 ml-6 mt-1">
                    Settings → Shields → Cookies → Block cross-site cookies
                  </p>
                </li>
                <li>
                  <strong>Use Brave's DNS</strong>
                  <p className="text-sm text-ink-200 ml-6 mt-1">
                    Settings → Security → Use secure DNS → Cloudflare or NextDNS
                  </p>
                </li>
                <li>
                  <strong>Disable Brave Rewards (unless you use it)</strong>
                  <p className="text-sm text-ink-200 ml-6 mt-1">
                    Settings → Brave Rewards → Toggle off
                  </p>
                </li>
              </ol>

              <div className="not-prose bg-paper-100 p-4 rounded-sm my-6">
                <h4 className="font-mono text-sm font-bold mb-2">Note on Brave Rewards</h4>
                <p className="text-sm text-ink-200">
                  Brave shows optional ads and rewards you with BAT cryptocurrency. This is
                  opt-in and privacy-respecting (matching happens locally). But if you want
                  zero ads, disable it.
                </p>
              </div>
            </DocumentSection>

            {/* Advanced Section */}
            <DocumentSection title="Advanced: Network-Level Protection">
              <p>
                For maximum protection, block trackers before they reach your browser:
              </p>

              <div className="not-prose grid md:grid-cols-2 gap-4 my-6">
                <div className="bg-paper-100 p-4 rounded-sm">
                  <h5 className="font-mono text-sm font-bold mb-2">Pi-hole</h5>
                  <p className="text-sm text-ink-200 mb-2">
                    Network-wide DNS blocking. Runs on Raspberry Pi. Blocks ads/trackers
                    for all devices on your network.
                  </p>
                  <a href="https://pi-hole.net/" className="text-xs text-alert-green hover:underline" target="_blank" rel="noopener">
                    pi-hole.net →
                  </a>
                </div>
                <div className="bg-paper-100 p-4 rounded-sm">
                  <h5 className="font-mono text-sm font-bold mb-2">NextDNS</h5>
                  <p className="text-sm text-ink-200 mb-2">
                    Cloud-based DNS filtering. No hardware needed. Highly customizable
                    blocklists. Works on mobile too.
                  </p>
                  <a href="https://nextdns.io/" className="text-xs text-alert-green hover:underline" target="_blank" rel="noopener">
                    nextdns.io →
                  </a>
                </div>
                <div className="bg-paper-100 p-4 rounded-sm">
                  <h5 className="font-mono text-sm font-bold mb-2">AdGuard Home</h5>
                  <p className="text-sm text-ink-200 mb-2">
                    Similar to Pi-hole but with a more user-friendly interface.
                    Supports DNS-over-HTTPS out of the box.
                  </p>
                  <a href="https://adguard.com/adguard-home.html" className="text-xs text-alert-green hover:underline" target="_blank" rel="noopener">
                    adguard.com →
                  </a>
                </div>
                <div className="bg-paper-100 p-4 rounded-sm">
                  <h5 className="font-mono text-sm font-bold mb-2">VPN (Reputable)</h5>
                  <p className="text-sm text-ink-200 mb-2">
                    Hides IP from websites. Choose no-logs providers: Mullvad, ProtonVPN,
                    IVPN. Avoid free VPNs.
                  </p>
                  <a href="https://mullvad.net/" className="text-xs text-alert-green hover:underline" target="_blank" rel="noopener">
                    mullvad.net →
                  </a>
                </div>
              </div>
            </DocumentSection>

            <DocumentSection title="Testing Your Configuration">
              <p>
                After hardening, test your browser with these tools:
              </p>
              <ul>
                <li>
                  <Link href="/scan/" className="underline">Our fingerprint scanner</Link> — See your uniqueness score
                </li>
                <li>
                  <Link href="/tests/webrtc/" className="underline">WebRTC leak test</Link> — Verify IP isn't exposed
                </li>
                <li>
                  <Link href="/tests/dns/" className="underline">DNS leak test</Link> — Check encrypted DNS works
                </li>
                <li>
                  <Link href="/tests/blocker/" className="underline">Ad blocker test</Link> — Measure tracker blocking
                </li>
              </ul>
            </DocumentSection>
          </article>

          <div className="mt-8 pt-8 border-t border-paper-300">
            <div className="flex justify-between items-center">
              <Link
                href="/defense/"
                className="inline-flex items-center gap-2 text-sm font-mono hover:underline"
              >
                ← Back to Defense Armory
              </Link>
              <Link
                href="/tests/"
                className="inline-flex items-center gap-2 text-sm font-mono hover:underline"
              >
                Run Privacy Tests →
              </Link>
            </div>
          </div>
        </Document>

        <div className="flex justify-center gap-6 mt-8">
          <Stamp variant="verified">Hardening Guide</Stamp>
          <Stamp variant="protected">Step-by-Step</Stamp>
        </div>
      </div>
    </div>
  );
}
