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

// Helper an toàn đọc cache từ Storage
async function getCachedProducts(): Promise<Product[] | null> {
  try {
    let raw: string | null = null;
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      raw = window.localStorage.getItem(PRODUCTS_CACHE_KEY);
    } else {
      raw = await AsyncStorage.getItem(PRODUCTS_CACHE_KEY);
    }

    if (raw) {
      // Guard JSON.parse an toàn
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed as Product[];
      }
    }
  } catch (error) {
    console.warn('Lỗi khi đọc cache sản phẩm từ storage:', error);
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

// Hàm fetch danh sách sản phẩm từ API
async function fetchProducts(): Promise<Product[]> {
  try {
    const response = await axiosClient.get<Product[]>('/products');
    if (response.data && Array.isArray(response.data)) {
      // Lưu lại cache khi fetch thành công
      await setCachedProducts(response.data);
      return response.data;
    }
    return initialProducts;
  } catch (error) {
    console.warn('Không thể kết nối đến JSON Server, thử khôi phục từ cache/seed:', error);
    // Thử lấy từ cache AsyncStorage nếu API lỗi
    const cached = await getCachedProducts();
    if (cached && cached.length > 0) {
      return cached;
    }
    // Fallback dữ liệu mẫu ban đầu để app luôn có data trải nghiệm
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
    data: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    isFetching: query.isFetching,
  };
}

export default useProducts;
