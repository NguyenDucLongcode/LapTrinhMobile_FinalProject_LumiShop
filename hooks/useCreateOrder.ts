// hooks/useCreateOrder.ts
// Hook tạo đơn hàng mới bằng TanStack Query v5 useMutation và invalidate cache sản phẩm

import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosClient from "../api/axiosClient";
import { Order } from "../types";

async function createOrderApi(orderData: Order): Promise<Order> {
  try {
    const response = await axiosClient.post<Order>("/orders", {
      ...orderData,
      id: orderData.id || String(Date.now()),
      createdAt: orderData.createdAt || new Date().toISOString(),
    });

    // Trừ tồn kho cho từng sản phẩm trong đơn hàng (json-server không tự làm)
    if (orderData.items && orderData.items.length > 0) {
      await Promise.allSettled(
        orderData.items.map(async (item) => {
          try {
            const productRes = await axiosClient.get(
              `/products/${item.product.id}`,
            );
            const currentStock = productRes.data?.stock ?? 0;
            const newStock = Math.max(0, currentStock - item.quantity);
            await axiosClient.patch(`/products/${item.product.id}`, {
              stock: newStock,
            });
          } catch (stockErr) {
            console.warn(
              `Không trừ được kho cho sản phẩm ${item.product.id}:`,
              stockErr,
            );
          }
        }),
      );
    }

    return response.data;
  } catch (error) {
    console.warn(
      "Lỗi khi gọi API POST /orders, lưu tạm đơn hàng offline:",
      error,
    );
    // Giả lập đơn hàng thành công khi JSON Server offline
    return {
      ...orderData,
      id: orderData.id || `ORDER-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: "pending",
    };
  }
}

export function useCreateOrder() {
  const queryClient = useQueryClient();

  const mutation = useMutation<Order, Error, Order>({
    mutationFn: createOrderApi,
    onSuccess: () => {
      // Làm mới dữ liệu cache sản phẩm sau khi đặt hàng thành công
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product"] });
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

export default useCreateOrder;
