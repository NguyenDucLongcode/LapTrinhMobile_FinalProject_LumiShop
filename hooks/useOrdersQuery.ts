// hooks/useOrdersQuery.ts
// TanStack Query: danh sách đơn hàng và tạo đơn

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { orderApi } from '../api/orderApi';
import { CreateOrderInput, OrderStatus } from '../types';
import { orderKeys, productKeys } from './queryKeys';

export function useOrders() {
  return useQuery({
    queryKey: orderKeys.lists(),
    queryFn: () => orderApi.getAll(),
  });
}

/** Tạo đơn hàng — làm mới cache đơn và sản phẩm (tồn kho có thể đổi ở bước sau) */
export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateOrderInput) => orderApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      orderApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
    },
  });
}
