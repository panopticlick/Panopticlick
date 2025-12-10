import Link from 'next/link';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-ink text-paper py-8 mt-auto">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Main Footer Content */}
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <Link href="/" className="font-serif font-bold text-lg">
              Panopticlick
            </Link>
            <p className="text-paper-300 text-sm mt-2">
              Browser fingerprinting research and privacy education.
              Inspired by EFF's original project.
            </p>
          </div>

          {/* Tests */}
          <div>
            <h4 className="font-mono text-sm font-bold uppercase tracking-wider mb-3">
              Tests
            </h4>
            <nav className="space-y-2 text-sm">
              <Link
                href="/scan/"
                className="block text-paper-300 hover:text-paper transition-colors"
              >
                Fingerprint Scan
              </Link>
              <Link
                href="/tests/webrtc/"
                className="block text-paper-300 hover:text-paper transition-colors"
              >
                WebRTC Leak Test
              </Link>
              <Link
                href="/tests/dns/"
                className="block text-paper-300 hover:text-paper transition-colors"
              >
                DNS Leak Test
              </Link>
              <Link
                href="/tests/blocker/"
                className="block text-paper-300 hover:text-paper transition-colors"
              >
                Ad Blocker Test
              </Link>
            </nav>
          </div>

          {/* Learn */}
          <div>
            <h4 className="font-mono text-sm font-bold uppercase tracking-wider mb-3">
              Learn
            </h4>
            <nav className="space-y-2 text-sm">
              <Link
                href="/anatomy/"
                className="block text-paper-300 hover:text-paper transition-colors"
              >
                Anatomy of Tracking
              </Link>
              <Link
                href="/simulation/"
                className="block text-paper-300 hover:text-paper transition-colors"
              >
                AdTech Simulation
              </Link>
              <Link
                href="/defense/"
                className="block text-paper-300 hover:text-paper transition-colors"
              >
                Defense Armory
              </Link>
              <Link
                href="/manifesto/"
                className="block text-paper-300 hover:text-paper transition-colors"
              >
                Manifesto
              </Link>
            </nav>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-mono text-sm font-bold uppercase tracking-wider mb-3">
              Resources
            </h4>
            <nav className="space-y-2 text-sm">
              <Link
                href="/about/"
                className="block text-paper-300 hover:text-paper transition-colors"
              >
                About
              </Link>
              <Link
                href="/methodology/"
                className="block text-paper-300 hover:text-paper transition-colors"
              >
                Methodology
              </Link>
              <Link
                href="/privacy/"
                className="block text-paper-300 hover:text-paper transition-colors"
              >
                Privacy Policy
              </Link>
              <a
                href="https://github.com/Panopticlick/Panopticlick"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-paper-300 hover:text-paper transition-colors"
              >
                GitHub ↗
              </a>
            </nav>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-paper-300/20 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-paper-400 text-xs">
            © {currentYear} Panopticlick. No tracking. No cookies. Just privacy research.
          </p>
          <div className="flex items-center gap-4 text-paper-400 text-xs">
            <span>Made with privacy in mind</span>
            <span className="hidden sm:inline">•</span>
            <a
              href="https://eff.org"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-paper transition-colors"
            >
              Inspired by EFF
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
