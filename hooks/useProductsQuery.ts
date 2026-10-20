// hooks/useProductsQuery.ts
// Hook quản lý truy vấn và mutation Sản phẩm theo TanStack Query v5 chuẩn mực với queryOptions

import {
  queryOptions,
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import productApi from '../api/productApi';
import { Product } from '../types';
import { initialProducts } from '../data/products';

export const PRODUCTS_CACHE_KEY = 'lostfound-shopabc-products';

// Helper an toàn đọc cache từ Storage (hỗ trợ cả Web & Mobile)
async function getCachedProducts(): Promise<Product[] | null> {
  try {
    const raw =
      Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage
        ? window.localStorage.getItem(PRODUCTS_CACHE_KEY)
        : await AsyncStorage.getItem(PRODUCTS_CACHE_KEY);

    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed as Product[];
      }
    }
  } catch (e) {
    console.warn('Lỗi đọc cache sản phẩm từ storage:', e);
  }
  return null;
}

// Helper an toàn ghi cache vào Storage
async function setCachedProducts(products: Product[]): Promise<void> {
  try {
    const raw = JSON.stringify(products);
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(PRODUCTS_CACHE_KEY, raw);
    } else {
      await AsyncStorage.setItem(PRODUCTS_CACHE_KEY, raw);
    }
  } catch (error) {
    console.warn('Lỗi khi ghi cache sản phẩm:', error);
  }
}

// Hàm fetch danh sách sản phẩm có fallback offline
async function fetchProductsWithFallback(): Promise<Product[]> {
  try {
    const data = await productApi.getAll();
    if (data && Array.isArray(data) && data.length > 0) {
      await setCachedProducts(data);
      return data;
    }
    return initialProducts;
  } catch (error) {
    console.warn('JSON Server offline, đọc từ cache hoặc seed ban đầu:', error);
    const cached = await getCachedProducts();
    if (cached && cached.length > 0) {
      return cached;
    }
    return initialProducts;
  }
}

// Hàm fetch chi tiết một sản phẩm theo ID có fallback
async function fetchProductDetailWithFallback(id: string): Promise<Product> {
  try {
    const product = await productApi.getById(id);
    if (product) return product;
  } catch (error) {
    console.warn(`Lỗi fetch sản phẩm #${id} từ server, fallback seed:`, error);
  }

  const fallback = initialProducts.find((p) => String(p.id) === String(id));
  if (fallback) return fallback;

  throw new Error(`Không tìm thấy sản phẩm có mã #${id}`);
}

// Hàm fetch danh sách sản phẩm phân trang
async function fetchPaginatedProductsWithFallback(
  page: number,
  limit: number
): Promise<{
  data: Product[];
  page: number;
  limit: number;
  totalCount: number;
}> {
  try {
    const result = await productApi.getPaginated(page, limit);
    return {
      data: result.data,
      page: result.page,
      limit: result.limit,
      totalCount: result.totalCount ?? initialProducts.length,
    };
  } catch (error) {
    console.warn(`Lỗi fetch phân trang sản phẩm (page: ${page}, limit: ${limit}), fallback:`, error);
    const start = (page - 1) * limit;
    const end = start + limit;
    return {
      data: initialProducts.slice(start, end),
      page,
      limit,
      totalCount: initialProducts.length,
    };
  }
}

// ==========================================
// 1. PRODUCT QUERY KEYS
// ==========================================
export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: () => [...productKeys.lists()] as const,
  paginated: (page: number, limit: number) =>
    [...productKeys.lists(), { page, limit }] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
};

// ==========================================
// 2. PRODUCT QUERY OPTIONS (TanStack Query v5)
// ==========================================
export const productQueries = {
  list: () =>
    queryOptions({
      queryKey: productKeys.list(),
      queryFn: fetchProductsWithFallback,
      staleTime: 1000 * 60 * 5,
    }),

  paginated: (page: number = 1, limit: number = 10) =>
    queryOptions({
      queryKey: productKeys.paginated(page, limit),
      queryFn: () => fetchPaginatedProductsWithFallback(page, limit),
      staleTime: 1000 * 60 * 5,
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: productKeys.detail(id),
      queryFn: () => fetchProductDetailWithFallback(id),
      enabled: !!id,
      staleTime: 1000 * 60 * 5,
    }),
};

// ==========================================
// 3. HOOKS: useQuery
// ==========================================
export function useProducts() {
  const query = useQuery(productQueries.list());
  return {
    data: query.data ?? initialProducts,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    isFetching: query.isFetching,
  };
}

export function usePaginatedProducts(page: number = 1, limit: number = 10) {
  const query = useQuery(productQueries.paginated(page, limit));
  return {
    products: query.data?.data ?? [],
    page: query.data?.page ?? page,
    limit: query.data?.limit ?? limit,
    totalCount: query.data?.totalCount ?? 0,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    isFetching: query.isFetching,
  };
}

export function useProduct(id: string) {
  const query = useQuery(productQueries.detail(id));
  return {
    product: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

// ==========================================
// 4. HOOKS: useMutation
// ==========================================
export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<Product>) => {
      try {
        return await productApi.create(data);
      } catch (error) {
        console.warn('Lỗi gọi API createProduct, cập nhật local query cache:', error);
        const newProduct: Product = {
          id: data.id || String(Date.now()),
          name: data.name || '',
          price: data.price ?? 0,
          category: data.category || 'other',
          image:
            data.image ||
            'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=80',
          stock: data.stock ?? 0,
          description: data.description || '',
          rating: data.rating ?? 5,
          ...data,
        };
        queryClient.setQueryData<Product[]>(productKeys.list(), (old: Product[] = []) => [
          newProduct,
          ...old,
        ]);
        return newProduct;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Product> }) => {
      try {
        return await productApi.update(id, data);
      } catch (error) {
        console.warn(`Lỗi updateProduct #${id}, cập nhật local query cache:`, error);
        queryClient.setQueryData<Product[]>(productKeys.list(), (old: Product[] = []) =>
          old.map((p: Product) => (p.id === id ? { ...p, ...data } : p))
        );
        return { id, ...data } as Product;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      queryClient.invalidateQueries({ queryKey: productKeys.detail(variables.id) });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      try {
        await productApi.delete(id);
      } catch (error) {
        console.warn(`Lỗi deleteProduct #${id}, xóa trong local query cache:`, error);
        queryClient.setQueryData<Product[]>(productKeys.list(), (old: Product[] = []) =>
          old.filter((p: Product) => p.id !== id)
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });
}

export default useProducts;
