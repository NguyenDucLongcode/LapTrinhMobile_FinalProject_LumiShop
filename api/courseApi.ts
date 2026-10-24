// api/courseApi.ts
// API Layer cho Course (Môn học) — gọi JSON Server

import { axiosClient } from './axiosClient';
import { Course, CourseInput } from '../types';

const RESOURCE = '/courses';

/** Lấy tất cả môn học */
export async function getAll(): Promise<Course[]> {
  const response = await axiosClient.get<Course[]>(RESOURCE);
  return response.data;
}

/** Lấy môn học theo ID */
export async function getById(id: string): Promise<Course> {
  const response = await axiosClient.get<Course>(`${RESOURCE}/${id}`);
  return response.data;
}

/** Tạo môn học mới */
export async function create(data: CourseInput): Promise<Course> {
  const response = await axiosClient.post<Course>(RESOURCE, data);
  return response.data;
}

/** Cập nhật môn học */
export async function update(id: string, data: Partial<Course>): Promise<Course> {
  const response = await axiosClient.patch<Course>(`${RESOURCE}/${id}`, data);
  return response.data;
}

/** Xóa môn học */
export async function remove(id: string): Promise<void> {
  await axiosClient.delete(`${RESOURCE}/${id}`);
}

export const courseApi = {
  getAll,
  getById,
  create,
  update,
  remove,
};

export default courseApi;
