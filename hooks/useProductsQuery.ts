// hooks/useProductsQuery.ts
// TanStack Query: danh sách, phân trang, chi tiết và mutation sản phẩm

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { productApi } from '../api/productApi';
import { ProductInput } from '../types';
import { productKeys } from './queryKeys';

/** Toàn bộ sản phẩm */
export function useProducts() {
  return useQuery({
    queryKey: productKeys.lists(),
    queryFn: () => productApi.getAll(),
  });
}

/** Sản phẩm phân trang (json-server _page/_limit) */
export function usePaginatedProducts(page: number, limit: number) {
  return useQuery({
    queryKey: productKeys.paginated(page, limit),
    queryFn: () => productApi.getPaginated(page, limit),
  });
}

/** Chi tiết 1 sản phẩm */
export function useProduct(id: string) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => productApi.getById(id),
    enabled: Boolean(id),
  });
}

/** Tạo sản phẩm — invalidate toàn bộ product queries */
export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ProductInput) => productApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });
}

/** Cập nhật sản phẩm */
export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ProductInput> }) =>
      productApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });
}

/** Xóa sản phẩm */
export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => productApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });
}
