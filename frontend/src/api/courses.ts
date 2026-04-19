import { apiGet, apiPost, apiPatch, apiDelete } from './client';

// --- Types ---

export interface CourseOwner {
  id: string;
  fullName: string | null;
  avatarUrl: string | null;
}

export interface CourseListItem {
  id: string;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  price: number;
  visibility: string;
  createdAt: string;
  owner: CourseOwner;
  _count: {
    sections: number;
    members: number;
  };
}

export interface Lesson {
  id: string;
  title: string | null;
  type: string | null;
  contentUrl: string | null;
  rawText: string | null;
  orderIndex: number | null;
}

export interface Section {
  id: string;
  title: string | null;
  orderIndex: number | null;
  lessons: Lesson[];
}

export interface CourseDetail extends CourseListItem {
  sections: Section[];
}

export interface CourseListResponse {
  data: CourseListItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// --- API Functions ---

export function getCourses(params?: { page?: number; limit?: number }) {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.limit) searchParams.set('limit', String(params.limit));

  const query = searchParams.toString();
  return apiGet<CourseListResponse>(`/courses${query ? `?${query}` : ''}`);
}

export function getCourse(id: string) {
  return apiGet<CourseDetail>(`/courses/${id}`);
}

export function createCourse(data: {
  title: string;
  description?: string;
  thumbnailUrl?: string;
  price?: number;
  visibility?: 'public' | 'private' | 'sale';
}) {
  return apiPost<CourseDetail>('/courses', data);
}

export function updateCourse(
  id: string,
  data: {
    title?: string;
    description?: string;
    thumbnailUrl?: string;
    price?: number;
    visibility?: 'public' | 'private' | 'sale';
  },
) {
  return apiPatch<CourseDetail>(`/courses/${id}`, data);
}

export function deleteCourse(id: string) {
  return apiDelete(`/courses/${id}`);
}
