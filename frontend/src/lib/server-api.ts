import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

async function serverFetch<T>(
  endpoint: string,
  options?: { revalidate?: number },
): Promise<T | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${API_URL}${endpoint}`, {
      headers,
      next: { revalidate: options?.revalidate ?? 300 },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export interface CourseMetadata {
  id: string;
  title: string;
  slug?: string;
  description: string | null;
  thumbnailUrl: string | null;
  createdAt: string;
  sections?: Array<{
    lessons?: Array<{ id: string; title: string | null }>;
  }>;
}

export interface CourseListMeta {
  data: Array<{ id: string; slug?: string; createdAt: string }>;
  meta: { totalPages: number };
}

export function fetchCourseForMetadata(courseId: string) {
  return serverFetch<CourseMetadata>(`/courses/${courseId}`, { revalidate: 600 });
}

export async function checkEnrollmentServer(courseId: string): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;
  if (!token) return false;

  const result = await serverFetch<{ enrolled: boolean }>(
    `/courses/${courseId}/enrollment`,
    { revalidate: 0 },
  );
  return result?.enrolled ?? false;
}

export async function fetchAllPublicCourses(): Promise<
  Array<{ id: string; slug?: string; createdAt: string }>
> {
  const firstPage = await serverFetch<CourseListMeta>('/courses?page=1&limit=100', {
    revalidate: 3600,
  });
  if (!firstPage?.data) return [];

  const allCourses = [...firstPage.data];
  const totalPages = firstPage.meta?.totalPages ?? 1;

  if (totalPages > 1) {
    const rest = await Promise.all(
      Array.from({ length: totalPages - 1 }, (_, i) =>
        serverFetch<CourseListMeta>(`/courses?page=${i + 2}&limit=100`, {
          revalidate: 3600,
        }),
      ),
    );
    for (const page of rest) {
      if (page?.data) allCourses.push(...page.data);
    }
  }

  return allCourses;
}

export function stripHtml(html: string | null | undefined, maxLength = 160): string {
  if (!html) return '';
  const plain = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  return plain.length > maxLength ? `${plain.slice(0, maxLength)}…` : plain;
}
