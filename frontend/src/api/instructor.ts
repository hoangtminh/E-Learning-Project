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

// ── Lesson File Upload (S3) ────────────────────────────────────────────────

export const getLessonUploadUrl = (filename: string, mimeType: string) =>
  apiPost<{ uploadUrl: string; s3Key: string; publicUrl: string }>(
    '/lessons/presigned-upload',
    { filename, mimeType },
  );

/**
 * Upload a file directly to S3 using a presigned URL.
 * Returns the public URL of the uploaded file.
 */
export async function uploadLessonFile(
  file: File,
  onProgress?: (percent: number) => void,
): Promise<{ success: boolean; publicUrl?: string; error?: string }> {
  try {
    // Step 1: Get presigned URL from backend
    const res = await getLessonUploadUrl(file.name, file.type);
    if (!res.success || !res.data) {
      return { success: false, error: res.error || 'Không lấy được URL upload' };
    }

    const { uploadUrl, publicUrl } = res.data;

    // Step 2: Upload file directly to S3 using XMLHttpRequest for progress tracking
    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', uploadUrl);
      xhr.setRequestHeader('Content-Type', file.type);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && onProgress) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      };

      xhr.onerror = () => reject(new Error('Upload request failed'));
      xhr.send(file);
    });

    return { success: true, publicUrl };
  } catch (err: any) {
    return { success: false, error: err.message || 'Upload thất bại' };
  }
}
