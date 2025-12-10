import type { MetadataRoute } from 'next';

// Static export compatibility
export const dynamic = 'force-static';
export const revalidate = 86400; // 24h

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://panopticlick.org';
  const lastModified = new Date();

  const routes: Array<{ path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] }> = [
    { path: '/', priority: 1, changeFrequency: 'weekly' },
    { path: '/scan/', priority: 0.9, changeFrequency: 'weekly' },
    { path: '/tests/', priority: 0.8, changeFrequency: 'weekly' },
    { path: '/tests/webrtc/', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/tests/dns/', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/tests/blocker/', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/tests/hsts/', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/simulation/', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/simulation/rtb/', priority: 0.8, changeFrequency: 'weekly' },
    { path: '/simulation/cname/', priority: 0.6, changeFrequency: 'monthly' },
    { path: '/simulation/cookie-sync/', priority: 0.6, changeFrequency: 'monthly' },
    { path: '/anatomy/', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/anatomy/fingerprinting/', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/anatomy/supercookies/', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/anatomy/behavior/', priority: 0.6, changeFrequency: 'monthly' },
    { path: '/defense/', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/defense/hardening/', priority: 0.6, changeFrequency: 'monthly' },
    { path: '/manifesto/', priority: 0.6, changeFrequency: 'monthly' },
    { path: '/manifesto/privacy-rights/', priority: 0.5, changeFrequency: 'monthly' },
    { path: '/about/', priority: 0.6, changeFrequency: 'monthly' },
    { path: '/methodology/', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/privacy/', priority: 0.5, changeFrequency: 'monthly' },
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
