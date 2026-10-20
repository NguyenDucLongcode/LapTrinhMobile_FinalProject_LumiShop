// api/voucherApi.ts
// API Layer chuyên trách các thao tác dữ liệu với Mã giảm giá (Voucher)

import axiosClient from './axiosClient';
import { Voucher } from '../types';

export const voucherApi = {
  /**
   * Lấy toàn bộ danh sách voucher
   */
  async getAll(): Promise<Voucher[]> {
    const response = await axiosClient.get<Voucher[]>('/vouchers');
    return response.data;
  },

  /**
   * Lấy thông tin voucher theo mã code
   */
  async getByCode(code: string): Promise<Voucher | null> {
    const cleanCode = code.trim().toUpperCase();
    const response = await axiosClient.get<Voucher[]>(
      `/vouchers?code=${encodeURIComponent(cleanCode)}`
    );
    if (response.data && response.data.length > 0) {
      return response.data[0];
    }
    return null;
  },

  /**
   * Lấy thông tin voucher theo ID
   */
  async getById(id: string): Promise<Voucher> {
    const response = await axiosClient.get<Voucher>(`/vouchers/${id}`);
    return response.data;
  },

  /**
   * Tạo voucher mới
   */
  async create(data: Partial<Voucher>): Promise<Voucher> {
    const discountVal = data.discount ?? data.discountPercent ?? 0;
    const minOrderVal = data.minOrderAmount ?? data.minOrderValue ?? 0;
    const payload: Voucher = {
      id: data.id || String(Date.now()),
      code: (data.code || '').trim().toUpperCase(),
      discount: discountVal,
      discountPercent: data.discountPercent ?? (discountVal <= 100 ? discountVal : 0),
      minOrderAmount: minOrderVal,
      minOrderValue: minOrderVal,
      maxDiscount: data.maxDiscount ?? 50000,
      startDate: data.startDate || new Date().toISOString(),
      endDate: data.endDate || new Date(Date.now() + 30 * 86400000).toISOString(),
      status: data.status || 'active',
      ...data,
    };
    const response = await axiosClient.post<Voucher>('/vouchers', payload);
    return response.data;
  },

  /**
   * Cập nhật voucher theo ID
   */
  async update(id: string, data: Partial<Voucher>): Promise<Voucher> {
    const response = await axiosClient.put<Voucher>(`/vouchers/${id}`, data);
    return response.data;
  },

  /**
   * Xóa voucher theo ID
   */
  async delete(id: string): Promise<void> {
    await axiosClient.delete(`/vouchers/${id}`);
  },

  // Alias tương thích
  getAllVouchers() {
    return this.getAll();
  },
  getVoucherByCode(code: string) {
    return this.getByCode(code);
  },
  getVoucherById(id: string) {
    return this.getById(id);
  },
  createVoucher(data: Partial<Voucher>) {
    return this.create(data);
  },
  updateVoucher(id: string, data: Partial<Voucher>) {
    return this.update(id, data);
  },
  deleteVoucher(id: string) {
    return this.delete(id);
  },
};

export default voucherApi;
