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
        // AI crawlers (training + answer engines) are explicitly welcome
        userAgent: [
          'GPTBot',
          'OAI-SearchBot',
          'ChatGPT-User',
          'ClaudeBot',
          'Claude-Web',
          'anthropic-ai',
          'PerplexityBot',
          'Perplexity-User',
          'Google-Extended',
          'CCBot',
        ],
        allow: '/',
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
