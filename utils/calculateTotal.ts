// utils/calculateTotal.ts
// Tiện ích tính toán tổng tiền, tiền giảm giá và tổng thanh toán của đơn hàng

import { CartItem, Voucher } from '../types';

export interface OrderCalculation {
  subtotal: number;       // Tổng tiền hàng tạm tính
  discountAmount: number; // Số tiền được giảm
  total: number;          // Tiền phải trả sau khi giảm
}

/**
 * Tính tổng tiền hàng tạm tính
 */
export function calculateSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
}

/**
 * Tính số tiền giảm giá theo voucher
 * @param subtotal Tổng tiền trước giảm
 * @param voucher Thông tin voucher (nếu có)
 */
export function calculateDiscount(subtotal: number, voucher?: Voucher | null): number {
  if (!voucher || voucher.status !== 'active') {
    return 0;
  }

  if (voucher.minOrderValue > 0 && subtotal < voucher.minOrderValue) {
    return 0;
  }

  return Math.round((subtotal * voucher.discountPercent) / 100);
}

/**
 * Tính toàn bộ chi phí đơn hàng
 */
export function calculateTotal(items: CartItem[], voucher?: Voucher | null): OrderCalculation {
  const subtotal = calculateSubtotal(items);
  const discountAmount = calculateDiscount(subtotal, voucher);
  const total = Math.max(0, subtotal - discountAmount);

  return {
    subtotal,
    discountAmount,
    total,
  };
}

/**
 * Định dạng tiền tệ VND (Ví dụ: 150.000 đ)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}

export default calculateTotal;
