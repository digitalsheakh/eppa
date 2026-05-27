import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/hello/', '/api/'],
      },
    ],
    sitemap: 'https://www.eppas.shop/sitemap.xml',
  };
}
