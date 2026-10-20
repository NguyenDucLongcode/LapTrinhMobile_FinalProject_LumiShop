// api/categoryApi.ts
// Gọi HTTP tới resource /categories trên JSON Server

import {axiosClient} from './axiosClient';
import { Category, CategoryInput } from '../types';

const RESOURCE = '/categories';

/** Lấy toàn bộ danh mục */
export async function getAll(): Promise<Category[]> {
  const response = await axiosClient.get<Category[]>(RESOURCE);
  return response.data;
}

/** Lấy 1 danh mục theo id */
export async function getById(id: string): Promise<Category> {
  const response = await axiosClient.get<Category>(`${RESOURCE}/${id}`);
  return response.data;
}

/** Tạo danh mục mới */
export async function create(data: CategoryInput): Promise<Category> {
  const response = await axiosClient.post<Category>(RESOURCE, data);
  return response.data;
}

/** Cập nhật danh mục */
export async function update(id: string, data: Partial<CategoryInput>): Promise<Category> {
  const response = await axiosClient.put<Category>(`${RESOURCE}/${id}`, data);
  return response.data;
}

/** Xóa danh mục */
export async function remove(id: string): Promise<void> {
  await axiosClient.delete(`${RESOURCE}/${id}`);
}

export const categoryApi = {
  getAll,
  getById,
  create,
  update,
  delete: remove,
};

export default categoryApi;
