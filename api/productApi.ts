// api/productApi.ts
// API Layer chuyên trách các thao tác dữ liệu với Sản phẩm (Product)

import axiosClient from './axiosClient';
import { Product } from '../types';

export const productApi = {
  /**
   * Lấy toàn bộ danh sách sản phẩm
   */
  async getAll(): Promise<Product[]> {
    const response = await axiosClient.get<Product[]>('/products');
    return response.data;
  },

  /**
   * Lấy danh sách sản phẩm có phân trang (json-server pagination: _page, _limit)
   */
  async getPaginated(
    page: number = 1,
    limit: number = 10
  ): Promise<{
    data: Product[];
    page: number;
    limit: number;
    totalCount?: number;
  }> {
    const response = await axiosClient.get<Product[]>('/products', {
      params: {
        _page: page,
        _limit: limit,
      },
    });

    const totalHeader = response.headers?.['x-total-count'];
    const totalCount = totalHeader ? parseInt(totalHeader, 10) : undefined;

    return {
      data: response.data,
      page,
      limit,
      totalCount,
    };
  },

  /**
   * Lấy thông tin chi tiết một sản phẩm theo ID
   */
  async getById(id: string): Promise<Product> {
    const response = await axiosClient.get<Product>(`/products/${id}`);
    return response.data;
  },

  /**
   * Thêm sản phẩm mới
   */
  async create(data: Partial<Product>): Promise<Product> {
    const payload: Product = {
      id: data.id || String(Date.now()),
      name: data.name || '',
      price: data.price ?? 0,
      category: data.category || 'other',
      categoryId: data.categoryId || data.category || 'other',
      image:
        data.image ||
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=80',
      stock: data.stock ?? 0,
      description: data.description || '',
      rating: data.rating ?? 5,
      ...data,
    };
    const response = await axiosClient.post<Product>('/products', payload);
    return response.data;
  },

  /**
   * Cập nhật thông tin sản phẩm theo ID
   */
  async update(id: string, data: Partial<Product>): Promise<Product> {
    const response = await axiosClient.put<Product>(`/products/${id}`, data);
    return response.data;
  },

  /**
   * Cập nhật một phần thuộc tính của sản phẩm (Patch)
   */
  async patch(id: string, data: Partial<Product>): Promise<Product> {
    const response = await axiosClient.patch<Product>(`/products/${id}`, data);
    return response.data;
  },

  /**
   * Xóa sản phẩm theo ID
   */
  async delete(id: string): Promise<void> {
    await axiosClient.delete(`/products/${id}`);
  },

  // Alias tương thích ngược
  getAllProducts() {
    return this.getAll();
  },
  getProductsPaginated(page: number = 1, limit: number = 10) {
    return this.getPaginated(page, limit);
  },
  getProductById(id: string) {
    return this.getById(id);
  },
  createProduct(data: Partial<Product>) {
    return this.create(data);
  },
  updateProduct(id: string, data: Partial<Product>) {
    return this.update(id, data);
  },
  patchProduct(id: string, data: Partial<Product>) {
    return this.patch(id, data);
  },
  deleteProduct(id: string) {
    return this.delete(id);
  },
};

export default productApi;
