// Static export compatibility
export const dynamic = 'force-static';
export const revalidate = 86400; // 24h

import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        // Note: /_next/ must stay crawlable — Googlebot needs JS/CSS to render pages
        userAgent: '*',
        allow: '/',
        disallow: ['/api/'],
      },
      {
        // Search/discovery crawlers. Network-layer bot policy must also allow
        // these UAs; robots.txt alone cannot override a Cloudflare 403.
        userAgent: [
          'OAI-SearchBot',
          'Claude-Web',
          'PerplexityBot',
        ],
        allow: '/',
      },
      {
        // User-triggered fetchers are not automatic indexing crawlers.
        userAgent: [
          'ChatGPT-User',
          'Perplexity-User',
        ],
        allow: '/',
      },
      {
        // Training is a separate policy decision from search inclusion.
        userAgent: [
          'GPTBot',
          'ClaudeBot',
          'anthropic-ai',
          'Google-Extended',
          'CCBot',
        ],
        allow: '/',
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
