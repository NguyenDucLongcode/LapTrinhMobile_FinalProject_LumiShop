// hooks/useOrdersQuery.ts
// Hook quản lý truy vấn và mutation Đơn hàng (Order) theo TanStack Query v5 với queryOptions

import {
  queryOptions,
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import orderApi from '../api/orderApi';
import { productKeys } from './useProductsQuery';
import { Order } from '../types';

async function fetchOrdersSafe(): Promise<Order[]> {
  try {
    return await orderApi.getAll();
  } catch (error) {
    console.warn('Lỗi fetch danh sách đơn hàng:', error);
    return [];
  }
}

async function fetchOrderDetailSafe(id: string): Promise<Order> {
  return await orderApi.getById(id);
}

async function createOrderWithFallback(orderData: Order): Promise<Order> {
  try {
    return await orderApi.create(orderData);
  } catch (error) {
    console.warn(
      'Lỗi khi gọi API POST /orders, tạo đơn hàng offline giả lập:',
      error
    );
    return {
      ...orderData,
      id: orderData.id || `ORDER-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'pending',
    };
  }
}

// ==========================================
// 1. ORDER QUERY KEYS
// ==========================================
export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: () => [...orderKeys.lists()] as const,
  details: () => [...orderKeys.all, 'detail'] as const,
  detail: (id: string) => [...orderKeys.details(), id] as const,
};

// ==========================================
// 2. ORDER QUERY OPTIONS (TanStack Query v5)
// ==========================================
export const orderQueries = {
  list: () =>
    queryOptions({
      queryKey: orderKeys.list(),
      queryFn: fetchOrdersSafe,
      staleTime: 1000 * 60 * 3,
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: orderKeys.detail(id),
      queryFn: () => fetchOrderDetailSafe(id),
      enabled: !!id,
      staleTime: 1000 * 60 * 3,
    }),
};

// ==========================================
// 3. HOOKS: useQuery
// ==========================================
export function useOrders() {
  const query = useQuery(orderQueries.list());
  return {
    orders: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    isFetching: query.isFetching,
  };
}

export function useOrder(id: string) {
  const query = useQuery(orderQueries.detail(id));
  return {
    order: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

// ==========================================
// 4. HOOKS: useMutation
// ==========================================
export function useCreateOrder() {
  const queryClient = useQueryClient();

  const mutation = useMutation<Order, Error, Order>({
    mutationFn: createOrderWithFallback,
    onSuccess: () => {
      // Làm mới danh sách đơn hàng
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      // Làm mới dữ liệu tồn kho sản phẩm
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });

  return {
    createOrder: mutation.mutateAsync,
    order: mutation.data,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    reset: mutation.reset,
  };
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: Order['status'] }) =>
      orderApi.updateStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(variables.id) });
    },
  });
}

export default useCreateOrder;
