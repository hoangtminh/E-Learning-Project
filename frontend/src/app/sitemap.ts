import type { MetadataRoute } from 'next';
import { fetchAllPublicCourses, SITE_URL } from '@/lib/server-api';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const courses = await fetchAllPublicCourses();
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${SITE_URL}/courses`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/pathway`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
  ];

  const courseEntries: MetadataRoute.Sitemap = courses.map((course) => ({
    url: `${SITE_URL}/courses/${course.slug || course.id}`,
    lastModified: new Date(course.createdAt),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...staticEntries, ...courseEntries];
}
