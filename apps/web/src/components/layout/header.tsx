'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/scan/', label: 'Scan', highlight: true },
  { href: '/tests/', label: 'Tests' },
  { href: '/about/', label: 'About' },
  { href: '/methodology/', label: 'Methodology' },
];

function PanoptickLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Eye outline */}
      <ellipse
        cx="16"
        cy="16"
        rx="14"
        ry="10"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
      {/* Iris */}
      <circle cx="16" cy="16" r="6" fill="currentColor" />
      {/* Pupil */}
      <circle cx="16" cy="16" r="2.5" fill="#f4f4f5" />
      {/* Highlight */}
      <circle cx="18" cy="14" r="1" fill="#f4f4f5" />
      {/* Scan lines */}
      <line
        x1="16"
        y1="2"
        x2="16"
        y2="6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line
        x1="16"
        y1="26"
        x2="16"
        y2="30"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line
        x1="2"
        y1="16"
        x2="4"
        y2="16"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line
        x1="28"
        y1="16"
        x2="30"
        y2="16"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-ink text-paper shadow-lg">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <PanoptickLogo className="w-8 h-8 text-highlight transition-transform group-hover:scale-110" />
            <div className="flex flex-col">
              <span className="font-serif font-bold text-xl leading-tight tracking-tight">
                Panopticlick
              </span>
              <span className="text-[10px] text-paper-400 font-mono uppercase tracking-widest hidden sm:block">
                Browser Privacy Test
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'px-4 py-2 text-sm font-mono rounded-sm transition-all',
                  pathname === item.href
                    ? 'bg-paper text-ink font-bold'
                    : item.highlight
                    ? 'bg-highlight text-ink hover:bg-highlight-400'
                    : 'text-paper-300 hover:text-paper hover:bg-paper/10'
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 -mr-2 text-paper hover:text-highlight transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-paper-300/20 bg-ink"
          >
            <nav className="container mx-auto px-4 py-4 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'block px-4 py-3 text-sm font-mono rounded-sm transition-colors',
                    pathname === item.href
                      ? 'bg-paper text-ink font-bold'
                      : item.highlight
                      ? 'bg-highlight text-ink'
                      : 'text-paper-300 hover:text-paper hover:bg-paper/10'
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
