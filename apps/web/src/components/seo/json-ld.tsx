import { SITE_URL, SITE_NAME } from '@/lib/site';

type JsonLdData = Record<string, unknown>;

/**
 * Renders a JSON-LD structured data script tag.
 * Safe in both server and client components (client pages are still
 * prerendered to static HTML, so crawlers see the script either way).
 */
export function JsonLd({ data }: { data: JsonLdData }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/**
 * Defines the stable site identity and connects it to the free browser tool.
 * Page-level schemas add specific tools, articles, and breadcrumbs.
 */
export function siteJsonLd(): JsonLdData {
  const organizationId = `${SITE_URL}/#organization`;
  const websiteId = `${SITE_URL}/#website`;

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': organizationId,
        name: SITE_NAME,
        url: `${SITE_URL}/`,
        description:
          'Independent browser fingerprinting research and privacy education project.',
        sameAs: ['https://github.com/Panopticlick/Panopticlick'],
      },
      {
        '@type': 'WebSite',
        '@id': websiteId,
        name: SITE_NAME,
        url: `${SITE_URL}/`,
        description:
          'Browser privacy tests, tracking explainers, methodology, and practical defenses.',
        inLanguage: 'en-US',
        publisher: { '@id': organizationId },
      },
      {
        '@type': 'WebApplication',
        '@id': `${SITE_URL}/#web-application`,
        name: SITE_NAME,
        url: `${SITE_URL}/`,
        description:
          'Free browser fingerprinting test and privacy analysis tool with modeled uniqueness and advertising-auction results.',
        applicationCategory: 'SecurityApplication',
        operatingSystem: 'Any',
        browserRequirements: 'Requires JavaScript and a modern web browser',
        inLanguage: 'en-US',
        isAccessibleForFree: true,
        featureList: [
          'Browser fingerprint scan',
          'WebRTC leak test',
          'DNS leak test',
          'Ad and tracker blocker test',
          'HSTS supercookie demonstration',
          'Modeled real-time bidding simulation',
        ],
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
        creator: { '@id': organizationId },
        publisher: { '@id': organizationId },
        isPartOf: { '@id': websiteId },
      },
    ],
  };
}

export interface BreadcrumbItem {
  name: string;
  /** Site-relative path with trailing slash, e.g. '/tests/webrtc/' */
  path: string;
}

export function breadcrumbJsonLd(items: BreadcrumbItem[]): JsonLdData {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}

export interface ArticleMeta {
  headline: string;
  description: string;
  /** Site-relative path with trailing slash */
  path: string;
  /** ISO date, e.g. '2025-12-10' */
  datePublished: string;
  dateModified: string;
  /** Topic keywords for schema.org `about` */
  about?: string[];
  /** Cited sources (free-text references or URLs) for schema.org `citation` */
  citations?: string[];
}

export function techArticleJsonLd(meta: ArticleMeta): JsonLdData {
  const organization = {
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
  };

  return {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: meta.headline,
    description: meta.description,
    url: `${SITE_URL}${meta.path}`,
    mainEntityOfPage: `${SITE_URL}${meta.path}`,
    datePublished: meta.datePublished,
    dateModified: meta.dateModified,
    author: organization,
    publisher: organization,
    ...(meta.about ? { about: meta.about } : {}),
    ...(meta.citations ? { citation: meta.citations } : {}),
  };
}
