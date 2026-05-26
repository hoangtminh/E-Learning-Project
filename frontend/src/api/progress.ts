import { apiGet, apiPost, ApiResponse } from './client';

export interface UserProgress {
  id: string;
  userId: string;
  courseId: string;
  lessonId: string;
  lastWatchedSecond: number;
  isCompleted: boolean;
  updatedAt: string;
}

export function saveLessonProgress(
  courseId: string,
  lessonId: string,
  data: { lastWatchedSecond: number; isCompleted: boolean },
): Promise<ApiResponse<UserProgress>> {
  return apiPost<UserProgress>(`/courses/${courseId}/lessons/${lessonId}/progress`, data);
}

export function getCourseProgress(
  courseId: string,
): Promise<ApiResponse<UserProgress[]>> {
  return apiGet<UserProgress[]>(`/courses/${courseId}/progress`);
}

export function getContinueLearning(
  courseId: string,
): Promise<ApiResponse<{ lessonId: string | null }>> {
  return apiGet<{ lessonId: string | null }>(`/courses/${courseId}/continue`);
}
