// store/cartStore.ts
// Quản lý giỏ hàng với Zustand và lưu trữ bền vững (Persist) hỗ trợ cả Web và Mobile

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { CartItem, Product } from '../types';

interface CartState {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalAmount: () => number;
}

// Cấu hình storage tương thích tốt cả Web (localStorage) và Mobile (AsyncStorage)
const customStorage = {
  getItem: async (name: string): Promise<string | null> => {
    if (Platform.OS === 'web') {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          return window.localStorage.getItem(name);
        }
      } catch (e) {
        console.warn('Lỗi khi đọc localStorage trên Web:', e);
      }
    }
    return AsyncStorage.getItem(name);
  },
  setItem: async (name: string, value: string): Promise<void> => {
    if (Platform.OS === 'web') {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(name, value);
          return;
        }
      } catch (e) {
        console.warn('Lỗi khi ghi localStorage trên Web:', e);
      }
    }
    return AsyncStorage.setItem(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    if (Platform.OS === 'web') {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.removeItem(name);
          return;
        }
      } catch (e) {
        console.warn('Lỗi khi xóa localStorage trên Web:', e);
      }
    }
    return AsyncStorage.removeItem(name);
  },
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      // Thêm sản phẩm vào giỏ hàng
      addItem: (product: Product, quantity: number = 1) => {
        // Chặn thêm hàng hết kho
        if ((product.stock ?? 1) <= 0) {
          return;
        }
        const currentItems = get().items;
        const existingIndex = currentItems.findIndex(
          (item) => item.product.id === product.id
        );

        if (existingIndex > -1) {
          const updatedItems = [...currentItems];
          const newQuantity = updatedItems[existingIndex].quantity + quantity;
          // Không vượt quá số lượng tồn kho nếu có giới hạn
          const maxStock = product.stock ?? 999;
          updatedItems[existingIndex] = {
            ...updatedItems[existingIndex],
            product, // Cập nhật thông tin product mới nhất (stock, price, ...)
            quantity: Math.min(newQuantity, maxStock),
          };
          set({ items: updatedItems });
        } else {
          const newItem: CartItem = {
            id: `${product.id}-${Date.now()}`,
            product,
            quantity: Math.min(quantity, product.stock ?? 999),
          };
          set({ items: [...currentItems, newItem] });
        }
      },

      // Xóa sản phẩm khỏi giỏ theo id sản phẩm
      removeItem: (productId: string) => {
        const updatedItems = get().items.filter(
          (item) => item.product.id !== productId
        );
        set({ items: updatedItems });
      },

      // Cập nhật số lượng của một sản phẩm
      updateQuantity: (productId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }

        const currentItems = get().items;
        const updatedItems = currentItems.map((item) => {
          if (item.product.id === productId) {
            const maxStock = item.product.stock ?? 999;
            return {
              ...item,
              quantity: Math.min(quantity, maxStock),
            };
          }
          return item;
        });
        set({ items: updatedItems });
      },

      // Xóa sạch giỏ hàng
      clearCart: () => {
        set({ items: [] });
      },

      // Đếm tổng số lượng món đồ trong giỏ
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      // Tính tổng tiền toàn bộ giỏ hàng
      getTotalAmount: () => {
        return get().items.reduce(
          (total, item) => total + item.product.price * item.quantity,
          0
        );
      },
    }),
    {
      name: 'shopabc-cart-storage',
      storage: createJSONStorage(() => customStorage),
    }
  )
);

export default useCartStore;
