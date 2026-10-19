// hooks/useProduct.ts
// Hook lấy thông tin chi tiết một sản phẩm theo ID bằng TanStack Query

import { useQuery } from '@tanstack/react-query';
import axiosClient from '../api/axiosClient';
import { Product } from '../types';
import { initialProducts } from '../data/products';

async function fetchProductById(id: string): Promise<Product> {
  try {
    const response = await axiosClient.get<Product>(`/products/${id}`);
    if (response.data) {
      return response.data;
    }
  } catch (error) {
    console.warn(`Lỗi fetch sản phẩm ID ${id} từ server, fallback seed:`, error);
  }

  // Fallback từ seed data nếu API lỗi hoặc không tìm thấy
  const fallback = initialProducts.find((p) => String(p.id) === String(id));
  if (fallback) {
    return fallback;
  }

  throw new Error(`Không tìm thấy sản phẩm có mã #${id}`);
}

export function useProduct(id: string) {
  const query = useQuery<Product, Error>({
    queryKey: ['product', id],
    queryFn: () => fetchProductById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });

  return {
    product: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

export default useProduct;
