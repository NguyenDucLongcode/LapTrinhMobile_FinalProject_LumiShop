// api/productApi.ts
// Gọi HTTP tới resource /products trên JSON Server

import {axiosClient} from './axiosClient';
import { PaginatedResult, Product, ProductInput } from '../types';

const RESOURCE = '/products';

/** Lấy toàn bộ sản phẩm */
export async function getAll(): Promise<Product[]> {
  const response = await axiosClient.get<Product[]>(RESOURCE);
  return response.data;
}

/**
 * Phân trang theo chuẩn json-server: ?_page=&_limit=
 * Tổng số bản ghi lấy từ header X-Total-Count.
 */
export async function getPaginated(
  page: number,
  limit: number
): Promise<PaginatedResult<Product>> {
  const safePage = Math.max(1, page);
  const safeLimit = Math.max(1, limit);

  const response = await axiosClient.get<Product[]>(RESOURCE, {
    params: { _page: safePage, _limit: safeLimit },
  });

  const totalHeader = response.headers['x-total-count'];
  const total = totalHeader ? Number(totalHeader) : response.data.length;

  return {
    data: response.data,
    page: safePage,
    limit: safeLimit,
    total,
    totalPages: Math.max(1, Math.ceil(total / safeLimit)),
  };
}

/** Lấy 1 sản phẩm theo id */
export async function getById(id: string): Promise<Product> {
  const response = await axiosClient.get<Product>(`${RESOURCE}/${id}`);
  return response.data;
}

/** Tạo sản phẩm mới (POST, ghi vào data/products.json) */
export async function create(data: ProductInput): Promise<Product> {
  const response = await axiosClient.post<Product>(RESOURCE, data);
  return response.data;
}

/** Cập nhật sản phẩm (PUT) */
export async function update(id: string, data: Partial<ProductInput>): Promise<Product> {
  const response = await axiosClient.put<Product>(`${RESOURCE}/${id}`, data);
  return response.data;
}

/** Xóa sản phẩm (DELETE) */
export async function remove(id: string): Promise<void> {
  await axiosClient.delete(`${RESOURCE}/${id}`);
}

export const productApi = {
  getAll,
  getPaginated,
  getById,
  create,
  update,
  delete: remove,
};

export default productApi;
