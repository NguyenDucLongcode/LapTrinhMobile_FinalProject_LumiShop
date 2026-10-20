// hooks/useCategoriesQuery.ts
// Hook quản lý truy vấn và mutation Danh mục (Category) theo TanStack Query v5 với queryOptions

import {
  queryOptions,
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import categoryApi from '../api/categoryApi';
import { Category } from '../types';

export const defaultCategories: Category[] = [
  { id: 'electronics', name: 'Công nghệ' },
  { id: 'clothing', name: 'Thời trang' },
  { id: 'documents', name: 'Văn phòng' },
  { id: 'other', name: 'Phụ kiện' },
];

async function fetchCategoriesWithFallback(): Promise<Category[]> {
  try {
    const data = await categoryApi.getAll();
    if (data && Array.isArray(data) && data.length > 0) {
      return data;
    }
    return defaultCategories;
  } catch (error) {
    console.warn('Lỗi gọi API categories, dùng danh sách mặc định:', error);
    return defaultCategories;
  }
}

async function fetchCategoryDetailWithFallback(id: string): Promise<Category> {
  try {
    const item = await categoryApi.getById(id);
    if (item) return item;
  } catch (error) {
    console.warn(`Lỗi fetch danh mục #${id}, dùng fallback:`, error);
  }

  const fallback = defaultCategories.find((c) => c.id === id);
  if (fallback) return fallback;

  throw new Error(`Không tìm thấy danh mục #${id}`);
}

// ==========================================
// 1. CATEGORY QUERY KEYS
// ==========================================
export const categoryKeys = {
  all: ['categories'] as const,
  lists: () => [...categoryKeys.all, 'list'] as const,
  list: () => [...categoryKeys.lists()] as const,
  details: () => [...categoryKeys.all, 'detail'] as const,
  detail: (id: string) => [...categoryKeys.details(), id] as const,
};

// ==========================================
// 2. CATEGORY QUERY OPTIONS (TanStack Query v5)
// ==========================================
export const categoryQueries = {
  list: () =>
    queryOptions({
      queryKey: categoryKeys.list(),
      queryFn: fetchCategoriesWithFallback,
      staleTime: 1000 * 60 * 10,
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: categoryKeys.detail(id),
      queryFn: () => fetchCategoryDetailWithFallback(id),
      enabled: !!id,
      staleTime: 1000 * 60 * 10,
    }),
};

// ==========================================
// 3. HOOKS: useQuery
// ==========================================
export function useCategories() {
  const query = useQuery(categoryQueries.list());
  return {
    categories: query.data ?? defaultCategories,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    isFetching: query.isFetching,
  };
}

export function useCategory(id: string) {
  const query = useQuery(categoryQueries.detail(id));
  return {
    category: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

// ==========================================
// 4. HOOKS: useMutation
// ==========================================
export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Category>) => categoryApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Category> }) =>
      categoryApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      queryClient.invalidateQueries({ queryKey: categoryKeys.detail(variables.id) });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => categoryApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
    },
  });
}

export default useCategories;
