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
