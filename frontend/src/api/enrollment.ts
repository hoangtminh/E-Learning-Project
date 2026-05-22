import { apiGet, apiPost, apiDelete } from './client';

export const enrollCourse = (courseId: string) =>
  apiPost(`/courses/${courseId}/enroll`, {});

export const checkEnrollment = (courseId: string) =>
  apiGet<{ enrolled: boolean; enrolledAt: string | null }>(`/courses/${courseId}/enrollment`);

export const getMyEnrolledCourses = () =>
  apiGet<any[]>('/courses/my-courses');

export const unenrollCourse = (courseId: string) =>
  apiDelete(`/courses/${courseId}/enroll`);
