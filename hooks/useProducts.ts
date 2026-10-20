// hooks/useProducts.ts
// Hook lấy danh sách sản phẩm bằng TanStack Query v5 kết hợp cache AsyncStorage

import { useQuery } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import axiosClient from '../api/axiosClient';
import { Product } from '../types';
import { initialProducts } from '../data/products';

// Khóa lưu trữ cache sản phẩm theo yêu cầu đề bài
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

// Helper an toàn lưu cache vào Storage
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

// Hàm fetch danh sách sản phẩm: đọc từ API, nếu offline tự khôi phục từ AsyncStorage hoặc initialProducts
async function fetchProducts(): Promise<Product[]> {
  try {
    const response = await axiosClient.get<Product[]>('/products');
    if (response.data && Array.isArray(response.data)) {
      await setCachedProducts(response.data);
      return response.data;
    }
    return initialProducts;
  } catch (error) {
    console.warn('JSON Server offline, đọc từ AsyncStorage cache hoặc seed ban đầu:', error);
    const cached = await getCachedProducts();
    if (cached && cached.length > 0) {
      return cached;
    }
    return initialProducts;
  }
}

export function useProducts() {
  const query = useQuery<Product[], Error>({
    queryKey: ['products'],
    queryFn: fetchProducts,
    staleTime: 1000 * 60 * 5, // 5 phút cache tươi
  });

  return {
    data: query.data ?? initialProducts,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    isFetching: query.isFetching,
  };
}

export default useProducts;
