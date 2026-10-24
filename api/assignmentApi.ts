// api/assignmentApi.ts
// API Layer cho Assignment (Bài tập) — gọi JSON Server

import { axiosClient } from './axiosClient';
import { Assignment, AssignmentInput } from '../types';

const RESOURCE = '/assignments';

/** Lấy tất cả bài tập */
export async function getAll(): Promise<Assignment[]> {
  const response = await axiosClient.get<Assignment[]>(RESOURCE);
  return response.data;
}

/** Lấy bài tập theo ID */
export async function getById(id: string): Promise<Assignment> {
  const response = await axiosClient.get<Assignment>(`${RESOURCE}/${id}`);
  return response.data;
}

/** Lấy bài tập theo courseId */
export async function getByCourseId(courseId: string): Promise<Assignment[]> {
  const response = await axiosClient.get<Assignment[]>(RESOURCE, {
    params: { courseId },
  });
  return response.data;
}

/** Tạo bài tập mới */
export async function create(data: AssignmentInput): Promise<Assignment> {
  const response = await axiosClient.post<Assignment>(RESOURCE, data);
  return response.data;
}

/** Cập nhật bài tập */
export async function update(id: string, data: Partial<Assignment>): Promise<Assignment> {
  const response = await axiosClient.patch<Assignment>(`${RESOURCE}/${id}`, data);
  return response.data;
}

/** Xóa bài tập */
export async function remove(id: string): Promise<void> {
  await axiosClient.delete(`${RESOURCE}/${id}`);
}

export const assignmentApi = {
  getAll,
  getById,
  getByCourseId,
  create,
  update,
  remove,
};

export default assignmentApi;
