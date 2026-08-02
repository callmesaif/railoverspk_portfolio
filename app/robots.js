import { MetadataRoute } from 'next';

export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/_next/',
          '/static/',
          '*.json$',
          '/favicon.ico*',
          '/images/coming_soon.avif',
        ],
      },
    ],
    sitemap: 'https://therails.pk/sitemap.xml',
    host: 'https://therails.pk',
  };
}