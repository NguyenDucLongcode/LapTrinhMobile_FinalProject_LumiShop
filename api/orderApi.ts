// api/orderApi.ts
// Gọi HTTP tới resource /orders trên JSON Server

import {axiosClient} from './axiosClient';
import { CreateOrderInput, Order, OrderStatus } from '../types';

const RESOURCE = '/orders';

/** Lấy toàn bộ đơn hàng */
export async function getAll(): Promise<Order[]> {
  const response = await axiosClient.get<Order[]>(RESOURCE);
  return response.data;
}

/** Tạo đơn hàng mới (mặc định status pending) */
export async function create(data: CreateOrderInput): Promise<Order> {
  const payload: CreateOrderInput = {
    ...data,
    status: data.status ?? 'pending',
    createdAt: data.createdAt ?? new Date().toISOString(),
  };
  const response = await axiosClient.post<Order>(RESOURCE, payload);
  return response.data;
}

/** Cập nhật trạng thái đơn hàng */
export async function updateStatus(id: string, status: OrderStatus): Promise<Order> {
  const current = await axiosClient.get<Order>(`${RESOURCE}/${id}`);
  const response = await axiosClient.put<Order>(`${RESOURCE}/${id}`, {
    ...current.data,
    status,
  });
  return response.data;
}

export const orderApi = {
  getAll,
  create,
  updateStatus,
};

export default orderApi;
