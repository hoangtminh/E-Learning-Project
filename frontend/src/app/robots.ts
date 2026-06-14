import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/server-api';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/courses', '/courses/*', '/pathway'],
      disallow: [
        '/learning/',
        '/dashboard',
        '/instructor/',
        '/administrator/',
        '/chat/',
        '/call/',
        '/login',
        '/register',
        '/payment/',
        '/my-courses/',
        '/classrooms/',
        '/assignments/',
        '/quizzes/',
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
