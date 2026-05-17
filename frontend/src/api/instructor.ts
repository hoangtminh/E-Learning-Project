import { apiGet, apiPost, apiPatch, apiDelete } from './client';

// ── Types ───────────────────────────────────────────────────────────────────

export interface InstructorCourse {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  thumbnailUrl: string | null;
  price: number;
  visibility: string;
  createdAt: string;
  instructor: { id: string; fullName: string | null; avatarUrl: string | null };
  _count: { sections: number; members: number };
}

export interface SectionWithLessons {
  id: string;
  courseId: string;
  title: string | null;
  orderIndex: number | null;
  lessons: LessonItem[];
}

export interface LessonItem {
  id: string;
  sectionId: string;
  title: string;
  order: number;
  type: string;
  contentUrl: string | null;
  body: string | null;
  durationSec: number | null;
}

// ── My Courses (Instructor) ─────────────────────────────────────────────────

export const getMyTeachingCourses = () =>
  apiGet<InstructorCourse[]>('/courses/my-teaching');

// ── Sections ────────────────────────────────────────────────────────────────

export const getSections = (courseId: string) =>
  apiGet<SectionWithLessons[]>(`/courses/${courseId}/sections`);

export const createSection = (courseId: string, data: { title: string; orderIndex?: number }) =>
  apiPost<SectionWithLessons>(`/courses/${courseId}/sections`, data);

export const updateSection = (sectionId: string, data: { title?: string; orderIndex?: number }) =>
  apiPatch<SectionWithLessons>(`/sections/${sectionId}`, data);

export const deleteSection = (sectionId: string) =>
  apiDelete(`/sections/${sectionId}`);

// ── Lessons ─────────────────────────────────────────────────────────────────

export const createLesson = (
  sectionId: string,
  data: { title: string; type?: string; contentUrl?: string; body?: string; order?: number },
) => apiPost<LessonItem>(`/sections/${sectionId}/lessons`, data);

export const updateLesson = (
  lessonId: string,
  data: { title?: string; type?: string; contentUrl?: string; body?: string; order?: number; durationSec?: number },
) => apiPatch<LessonItem>(`/lessons/${lessonId}`, data);

export const deleteLesson = (lessonId: string) =>
  apiDelete(`/lessons/${lessonId}`);
