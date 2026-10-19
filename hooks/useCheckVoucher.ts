// hooks/useCheckVoucher.ts
// Hook kiểm tra tính hợp lệ của mã giảm giá (Voucher) bằng useMutation

import { useMutation } from '@tanstack/react-query';
import axiosClient from '../api/axiosClient';
import { Voucher } from '../types';
import { initialVouchers } from '../data/products';

interface CheckVoucherPayload {
  code: string;
  orderAmount?: number;
}

async function checkVoucherApi({ code, orderAmount = 0 }: CheckVoucherPayload): Promise<Voucher> {
  const cleanCode = code.trim().toUpperCase();
  if (!cleanCode) {
    throw new Error('Vui lòng nhập mã giảm giá!');
  }

  let voucher: Voucher | null = null;

  try {
    const response = await axiosClient.get<Voucher[]>(`/vouchers?code=${encodeURIComponent(cleanCode)}`);
    if (response.data && response.data.length > 0) {
      voucher = response.data[0];
    }
  } catch (error) {
    console.warn('Lỗi gọi API voucher, thử kiểm tra trong danh sách voucher dự phòng:', error);
  }

  // Fallback từ initialVouchers nếu không gọi được API
  if (!voucher) {
    const fallback = initialVouchers.find((v) => v.code.toUpperCase() === cleanCode);
    if (fallback) {
      voucher = fallback;
    }
  }

  if (!voucher) {
    throw new Error(`Mã giảm giá "${cleanCode}" không tồn tại hoặc đã hết hạn!`);
  }

  if (voucher.status !== 'active') {
    throw new Error(`Mã giảm giá "${cleanCode}" hiện không khả dụng!`);
  }

  if (voucher.minOrderAmount && orderAmount < voucher.minOrderAmount) {
    throw new Error(
      `Mã này chỉ áp dụng cho đơn hàng từ ${new Intl.NumberFormat('vi-VN').format(voucher.minOrderAmount)}đ trở lên!`
    );
  }

  return voucher;
}

export function useCheckVoucher() {
  const mutation = useMutation<Voucher, Error, CheckVoucherPayload>({
    mutationFn: checkVoucherApi,
  });

  return {
    checkVoucher: mutation.mutateAsync,
    voucher: mutation.data,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    reset: mutation.reset,
  };
}

export default useCheckVoucher;
