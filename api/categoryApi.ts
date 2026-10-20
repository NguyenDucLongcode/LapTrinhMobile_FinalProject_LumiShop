// api/categoryApi.ts
// API Layer chuyên trách các thao tác dữ liệu với Danh mục (Category)

import axiosClient from './axiosClient';
import { Category } from '../types';

export const categoryApi = {
  /**
   * Lấy toàn bộ danh sách danh mục
   */
  async getAll(): Promise<Category[]> {
    const response = await axiosClient.get<Category[]>('/categories');
    return response.data;
  },

  /**
   * Lấy thông tin chi tiết một danh mục theo ID
   */
  async getById(id: string): Promise<Category> {
    const response = await axiosClient.get<Category>(`/categories/${id}`);
    return response.data;
  },

  /**
   * Thêm danh mục mới
   */
  async create(data: Partial<Category>): Promise<Category> {
    const payload: Category = {
      id: data.id || String(Date.now()),
      name: data.name || '',
      description: data.description || '',
      ...data,
    };
    const response = await axiosClient.post<Category>('/categories', payload);
    return response.data;
  },

  /**
   * Cập nhật thông tin danh mục theo ID
   */
  async update(id: string, data: Partial<Category>): Promise<Category> {
    const response = await axiosClient.put<Category>(`/categories/${id}`, data);
    return response.data;
  },

  /**
   * Xóa danh mục theo ID
   */
  async delete(id: string): Promise<void> {
    await axiosClient.delete(`/categories/${id}`);
  },

  // Alias tương thích
  getAllCategories() {
    return this.getAll();
  },
  getCategoryById(id: string) {
    return this.getById(id);
  },
  createCategory(data: Partial<Category>) {
    return this.create(data);
  },
  updateCategory(id: string, data: Partial<Category>) {
    return this.update(id, data);
  },
  deleteCategory(id: string) {
    return this.delete(id);
  },
};

export default categoryApi;
