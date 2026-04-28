import { apiGet, apiPost, apiPut, apiDelete, ApiResponse } from './client';

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  price: number | null;
  visibility: 'PUBLIC' | 'PRIVATE' | 'UNLISTED';
  instructorId: string;
  createdAt: string;
  updatedAt: string;
  imageUrl?: string | null;
}

export interface CreateCourseDto {
  title: string;
  description?: string;
  price?: number;
  visibility?: 'PUBLIC' | 'PRIVATE' | 'UNLISTED';
}

export interface UpdateCourseDto extends Partial<CreateCourseDto> {}

export const getCourses = (): Promise<ApiResponse<Course[]>> => {
  return apiGet<Course[]>('/courses');
};

export const getCourseById = (id: string): Promise<ApiResponse<Course>> => {
  return apiGet<Course>(`/courses/${id}`);
};

export const createCourse = (data: CreateCourseDto): Promise<ApiResponse<Course>> => {
  return apiPost<Course>('/courses', data);
};

export const updateCourse = (id: string, data: UpdateCourseDto): Promise<ApiResponse<Course>> => {
  return apiPut<Course>(`/courses/${id}`, data);
};

export const deleteCourse = (id: string): Promise<ApiResponse<void>> => {
  return apiDelete<void>(`/courses/${id}`);
};
