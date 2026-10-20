// hooks/useVouchersQuery.ts
// TanStack Query: danh sách voucher, kiểm tra mã, tạo/xóa

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { voucherApi } from '../api/voucherApi';
import { Voucher, VoucherInput } from '../types';
import { voucherKeys } from './queryKeys';

export interface CheckVoucherPayload {
  code: string;
  orderAmount?: number;
}

export function useVouchers() {
  return useQuery({
    queryKey: voucherKeys.lists(),
    queryFn: () => voucherApi.getAll(),
  });
}

/**
 * Kiểm tra mã giảm giá (mutation): gọi voucherApi.getByCode
 * rồi đối chiếu giá trị đơn tối thiểu nếu có truyền orderAmount.
 */
export function useCheckVoucher() {
  return useMutation({
    mutationFn: async ({ code, orderAmount }: CheckVoucherPayload): Promise<Voucher> => {
      const voucher = await voucherApi.getByCode(code);

      if (
        typeof orderAmount === 'number' &&
        voucher.minOrderValue > 0 &&
        orderAmount < voucher.minOrderValue
      ) {
        const min = new Intl.NumberFormat('vi-VN').format(voucher.minOrderValue);
        throw new Error(`Mã này chỉ áp dụng cho đơn từ ${min}đ trở lên!`);
      }

      return voucher;
    },
  });
}

export function useCreateVoucher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: VoucherInput) => voucherApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: voucherKeys.all });
    },
  });
}

export function useUpdateVoucher() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<VoucherInput> }) => voucherApi.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: voucherKeys.all }),
  });
}

export function useDeleteVoucher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => voucherApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: voucherKeys.all });
    },
  });
}
