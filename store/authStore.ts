// store/authStore.ts
// Quản lý trạng thái xác thực người dùng, tích hợp SecureStore (Mobile) và fallback localStorage (Web)

import { create } from 'zustand';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';
import axiosClient from '../api/axiosClient';

const TOKEN_KEY = 'shopabc_auth_token';
const USER_KEY = 'shopabc_auth_user';

// Helper: Lưu token an toàn (Mobile dùng SecureStore, Web dùng localStorage)
export async function saveToken(token: string): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(TOKEN_KEY, token);
      }
    } else {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
    }
  } catch (error) {
    console.error('Lỗi khi lưu token:', error);
  }
}

// Helper: Đọc token
export async function getToken(): Promise<string | null> {
  try {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(TOKEN_KEY);
      }
      return null;
    } else {
      return await SecureStore.getItemAsync(TOKEN_KEY);
    }
  } catch (error) {
    console.error('Lỗi khi đọc token:', error);
    return null;
  }
}

// Helper: Xóa token khi đăng xuất
export async function deleteToken(): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(TOKEN_KEY);
      }
    } else {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    }
  } catch (error) {
    console.error('Lỗi khi xóa token:', error);
  }
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (username: string, password?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: true,

  // Đăng nhập: tìm kiếm user từ mock API (users?username=...) hoặc tài khoản mặc định
  login: async (username: string, password?: string): Promise<boolean> => {
    try {
      set({ isLoading: true });

      // Gọi mock API JSON server kiểm tra user
      let matchedUser: User | null = null;

      try {
        const response = await axiosClient.get<any[]>(`/users?username=${encodeURIComponent(username.trim())}`);
        if (response.data && response.data.length > 0) {
          const found = response.data[0];
          // Nếu có truyền mật khẩu thì kiểm tra, hoặc so sánh với db
          if (!password || found.password === password) {
            matchedUser = {
              id: String(found.id),
              username: found.username,
              name: found.name || found.username,
              role: found.username.toLowerCase().includes('admin') ? 'admin' : (found.role || 'customer'),
            };
          }
        }
      } catch (apiErr) {
        console.warn('Không gọi được API users, sử dụng tài khoản cục bộ:', apiErr);
      }

      // Fallback nếu JSON Server chưa có user hoặc offline: Cho phép tài khoản admin/123 hoặc bất kỳ user nào
      if (!matchedUser) {
        if (username.trim().toLowerCase() === 'admin' && (!password || password === '123')) {
          matchedUser = {
            id: '1',
            username: 'admin',
            name: 'Quản Trị Viên',
            role: 'admin',
          };
        } else if (username.trim()) {
          // Cho phép đăng nhập khách thông thường
          matchedUser = {
            id: String(Date.now()),
            username: username.trim(),
            name: username.trim(),
            role: username.trim().toLowerCase().includes('admin') ? 'admin' : 'customer',
          };
        }
      }

      if (matchedUser) {
        const fakeToken = `token_${matchedUser.id}_${Date.now()}`;
        await saveToken(fakeToken);

        // Lưu thông tin user vào storage
        const userStr = JSON.stringify(matchedUser);
        if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(USER_KEY, userStr);
        } else {
          await AsyncStorage.setItem(USER_KEY, userStr);
        }

        set({
          user: matchedUser,
          token: fakeToken,
          isLoading: false,
        });
        return true;
      }

      set({ isLoading: false });
      return false;
    } catch (error) {
      console.error('Lỗi khi đăng nhập:', error);
      set({ isLoading: false });
      return false;
    }
  },

  // Đăng xuất: xóa token và user khỏi storage
  logout: async () => {
    try {
      await deleteToken();
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(USER_KEY);
      } else {
        await AsyncStorage.removeItem(USER_KEY);
      }
    } catch (e) {
      console.warn('Lỗi khi xóa dữ liệu auth:', e);
    } finally {
      set({ user: null, token: null, isLoading: false });
    }
  },

  // Kiểm tra token và phiên đăng nhập khi khởi động ứng dụng
  checkAuth: async () => {
    try {
      set({ isLoading: true });
      const token = await getToken();
      if (token) {
        let userStr: string | null = null;
        if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
          userStr = window.localStorage.getItem(USER_KEY);
        } else {
          userStr = await AsyncStorage.getItem(USER_KEY);
        }

        if (userStr) {
          try {
            const parsedUser: User = JSON.parse(userStr);
            set({ user: parsedUser, token, isLoading: false });
            return;
          } catch (e) {
            console.error('Lỗi parse user data:', e);
          }
        }

        // Nếu có token nhưng mất user data, tạo user tạm
        set({
          user: { id: '1', username: 'user', role: 'customer' },
          token,
          isLoading: false,
        });
      } else {
        set({ user: null, token: null, isLoading: false });
      }
    } catch (error) {
      console.error('Lỗi checkAuth:', error);
      set({ user: null, token: null, isLoading: false });
    }
  },
}));

export default useAuthStore;
