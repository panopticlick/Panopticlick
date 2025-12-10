/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export for Cloudflare Pages
  output: 'export',

  // Disable image optimization for static export
  images: {
    unoptimized: true,
  },

  // Trailing slashes for cleaner URLs
  trailingSlash: true,

  // Transpile workspace packages
  transpilePackages: [
    '@panopticlick/fingerprint-sdk',
    '@panopticlick/valuation-engine',
    '@panopticlick/types',
  ],

  // Strict mode for better development
  reactStrictMode: true,

  // Environment variables (accessible in client-side code)
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://api.panopticlick.org',
  },

  // PoweredBy header (security)
  poweredByHeader: false,

  // Experimental features
  experimental: {
    // Typed routes disabled - causes issues with dynamic hrefs
    // typedRoutes: true,
  },
};

module.exports = nextConfig;
