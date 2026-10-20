import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://ayurwed.com';
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin/',
        '/consultant/',
        '/consumer/',
        '/user/',
        '/api/',
        '/login',
        '/register',
      ],
    },
    sitemap: `${baseUrl.replace(/\/$/, '')}/sitemap.xml`,
  };
}
