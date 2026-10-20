// api/orderApi.ts
// API Layer chuyên trách các thao tác dữ liệu với Đơn hàng (Order)

import axiosClient from './axiosClient';
import { Order } from '../types';

export const orderApi = {
  /**
   * Lấy toàn bộ danh sách đơn hàng
   */
  async getAll(): Promise<Order[]> {
    const response = await axiosClient.get<Order[]>('/orders');
    return response.data;
  },

  /**
   * Lấy chi tiết đơn hàng theo ID
   */
  async getById(id: string): Promise<Order> {
    const response = await axiosClient.get<Order>(`/orders/${id}`);
    return response.data;
  },

  /**
   * Tạo đơn hàng mới và tự động cập nhật tồn kho cho từng sản phẩm
   */
  async create(orderData: Order): Promise<Order> {
    const payload: Order = {
      ...orderData,
      id: orderData.id || String(Date.now()),
      createdAt: orderData.createdAt || new Date().toISOString(),
      status: orderData.status || 'pending',
      shippingAddress:
        orderData.shippingAddress ||
        orderData.customerAddress ||
        'Địa chỉ mặc định',
    };

    const response = await axiosClient.post<Order>('/orders', payload);

    // Trừ tồn kho cho từng sản phẩm trong đơn hàng
    if (orderData.items && orderData.items.length > 0) {
      await Promise.allSettled(
        orderData.items.map(async (item: any) => {
          try {
            const pId = item.product?.id || item.productId;
            if (!pId) return;
            const productRes = await axiosClient.get(`/products/${pId}`);
            const currentStock = productRes.data?.stock ?? 0;
            const newStock = Math.max(0, currentStock - (item.quantity || 1));
            await axiosClient.patch(`/products/${pId}`, {
              stock: newStock,
            });
          } catch (stockErr) {
            console.warn(`Không trừ được kho cho sản phẩm:`, stockErr);
          }
        })
      );
    }

    return response.data;
  },

  /**
   * Cập nhật trạng thái đơn hàng theo ID
   */
  async updateStatus(id: string, status: Order['status']): Promise<Order> {
    const response = await axiosClient.patch<Order>(`/orders/${id}`, { status });
    return response.data;
  },

  /**
   * Cập nhật toàn bộ đơn hàng
   */
  async update(id: string, data: Partial<Order>): Promise<Order> {
    const response = await axiosClient.put<Order>(`/orders/${id}`, data);
    return response.data;
  },

  /**
   * Xóa đơn hàng
   */
  async delete(id: string): Promise<void> {
    await axiosClient.delete(`/orders/${id}`);
  },

  // Alias tương thích
  getAllOrders() {
    return this.getAll();
  },
  getOrderById(id: string) {
    return this.getById(id);
  },
  createOrder(orderData: Order) {
    return this.create(orderData);
  },
};

export default orderApi;
