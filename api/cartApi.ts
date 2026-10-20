// api/cartApi.ts
// Gọi HTTP tới resource /carts trên JSON Server

import {axiosClient} from './axiosClient';
import { Cart, CartInput } from '../types';

const RESOURCE = '/carts';

/** Lấy giỏ hàng theo userId (mỗi user tối đa 1 giỏ) */
export async function getByUserId(userId: string): Promise<Cart | null> {
  const response = await axiosClient.get<Cart[]>(RESOURCE, {
    params: { userId },
  });
  return response.data[0] ?? null;
}

/** Tạo giỏ hàng mới */
export async function create(data: CartInput): Promise<Cart> {
  const response = await axiosClient.post<Cart>(RESOURCE, data);
  return response.data;
}

/** Cập nhật giỏ hàng (PUT cả object) */
export async function update(id: string, data: Partial<CartInput>): Promise<Cart> {
  const current = await axiosClient.get<Cart>(`${RESOURCE}/${id}`);
  const response = await axiosClient.put<Cart>(`${RESOURCE}/${id}`, {
    ...current.data,
    ...data,
    updatedAt: data.updatedAt ?? new Date().toISOString(),
  });
  return response.data;
}

/** Xóa giỏ hàng */
export async function remove(id: string): Promise<void> {
  await axiosClient.delete(`${RESOURCE}/${id}`);
}

export const cartApi = {
  getByUserId,
  create,
  update,
  delete: remove,
};

export default cartApi;
