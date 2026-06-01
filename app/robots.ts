import type { MetadataRoute } from 'next';

// Required so the file is emitted as a static asset under `output: 'export'`
// (the native app build). Harmless for the web build — robots is already static.
export const dynamic = 'force-static';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://recargarage.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/perfil', '/setup-perfil'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
