// Static export compatibility
export const dynamic = 'force-static';
export const revalidate = 86400; // 24h

import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/_next/'],
      },
    ],
    sitemap: 'https://panopticlick.org/sitemap.xml',
  };
}
