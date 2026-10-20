// hooks/useVouchersQuery.ts
// Hook quản lý truy vấn và mutation Voucher theo TanStack Query v5 với queryOptions

import {
  queryOptions,
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import voucherApi from '../api/voucherApi';
import { Voucher } from '../types';
import { initialVouchers } from '../data/products';

export interface CheckVoucherPayload {
  code: string;
  orderAmount?: number;
}

async function fetchVouchersWithFallback(): Promise<Voucher[]> {
  try {
    const data = await voucherApi.getAll();
    if (data && Array.isArray(data) && data.length > 0) {
      return data;
    }
    return initialVouchers;
  } catch (error) {
    console.warn('Lỗi fetch vouchers từ server, dùng initialVouchers:', error);
    return initialVouchers;
  }
}

async function fetchVoucherDetailWithFallback(id: string): Promise<Voucher> {
  try {
    const item = await voucherApi.getById(id);
    if (item) return item;
  } catch (error) {
    console.warn(`Lỗi fetch voucher #${id}, fallback:`, error);
  }

  const fallback = initialVouchers.find((v) => v.id === id);
  if (fallback) return fallback;

  throw new Error(`Không tìm thấy voucher #${id}`);
}

async function checkVoucherLogic({
  code,
  orderAmount = 0,
}: CheckVoucherPayload): Promise<Voucher> {
  const cleanCode = code.trim().toUpperCase();
  if (!cleanCode) {
    throw new Error('Vui lòng nhập mã giảm giá!');
  }

  let voucher: Voucher | null = null;
  try {
    voucher = await voucherApi.getByCode(cleanCode);
  } catch (error) {
    console.warn('Lỗi gọi API voucher, thử danh sách dự phòng:', error);
  }

  // Fallback từ initialVouchers nếu không gọi được API hoặc API không có
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
      `Mã này chỉ áp dụng cho đơn hàng từ ${new Intl.NumberFormat('vi-VN').format(
        voucher.minOrderAmount
      )}đ trở lên!`
    );
  }

  return voucher;
}

// ==========================================
// 1. VOUCHER QUERY KEYS
// ==========================================
export const voucherKeys = {
  all: ['vouchers'] as const,
  lists: () => [...voucherKeys.all, 'list'] as const,
  list: () => [...voucherKeys.lists()] as const,
  details: () => [...voucherKeys.all, 'detail'] as const,
  detail: (id: string) => [...voucherKeys.details(), id] as const,
  byCode: (code: string) => [...voucherKeys.all, 'code', code.toUpperCase()] as const,
};

// ==========================================
// 2. VOUCHER QUERY OPTIONS (TanStack Query v5)
// ==========================================
export const voucherQueries = {
  list: () =>
    queryOptions({
      queryKey: voucherKeys.list(),
      queryFn: fetchVouchersWithFallback,
      staleTime: 1000 * 60 * 5,
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: voucherKeys.detail(id),
      queryFn: () => fetchVoucherDetailWithFallback(id),
      enabled: !!id,
      staleTime: 1000 * 60 * 5,
    }),
};

// ==========================================
// 3. HOOKS: useQuery
// ==========================================
export function useVouchers() {
  const query = useQuery(voucherQueries.list());
  return {
    vouchers: query.data ?? initialVouchers,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    isFetching: query.isFetching,
  };
}

export function useVoucher(id: string) {
  const query = useQuery(voucherQueries.detail(id));
  return {
    voucher: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

// ==========================================
// 4. HOOKS: useMutation
// ==========================================
export function useCheckVoucher() {
  const mutation = useMutation<Voucher, Error, CheckVoucherPayload>({
    mutationFn: checkVoucherLogic,
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

export function useCreateVoucher() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<Voucher>) => {
      try {
        return await voucherApi.create(data);
      } catch (error) {
        console.warn('Lỗi gọi API createVoucher, cập nhật local query cache:', error);
        const newVoucher: Voucher = {
          id: data.id || String(Date.now()),
          code: (data.code || '').trim().toUpperCase(),
          discount: data.discount ?? 0,
          status: data.status || 'active',
          minOrderAmount: data.minOrderAmount ?? 0,
          ...data,
        };
        queryClient.setQueryData<Voucher[]>(voucherKeys.list(), (old: Voucher[] = []) => [
          ...old,
          newVoucher,
        ]);
        return newVoucher;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: voucherKeys.all });
    },
  });
}

export function useUpdateVoucher() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Voucher> }) => {
      try {
        return await voucherApi.update(id, data);
      } catch (error) {
        console.warn(`Lỗi updateVoucher #${id}, cập nhật local query cache:`, error);
        queryClient.setQueryData<Voucher[]>(voucherKeys.list(), (old: Voucher[] = []) =>
          old.map((v: Voucher) => (v.id === id ? { ...v, ...data } : v))
        );
        return { id, ...data } as Voucher;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: voucherKeys.all });
      queryClient.invalidateQueries({ queryKey: voucherKeys.detail(variables.id) });
    },
  });
}

export function useDeleteVoucher() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      try {
        await voucherApi.delete(id);
      } catch (error) {
        console.warn(`Lỗi deleteVoucher #${id}, xóa khỏi local query cache:`, error);
        queryClient.setQueryData<Voucher[]>(voucherKeys.list(), (old: Voucher[] = []) =>
          old.filter((v: Voucher) => v.id !== id)
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: voucherKeys.all });
    },
  });
}

export default useVouchers;
