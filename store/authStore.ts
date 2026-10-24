// store/authStore.ts
// Phiên đăng nhập (Zustand). Logic HTTP nằm ở userApi + useLogin, store chỉ lưu token/user.

import { create } from 'zustand';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';

const TOKEN_KEY = 'studyplanner_auth_token';
const USER_KEY = 'studyplanner_auth_user';

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

export async function getToken(): Promise<string | null> {
  try {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(TOKEN_KEY);
      }
      return null;
    }
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch (error) {
    console.error('Lỗi khi đọc token:', error);
    return null;
  }
}

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

async function saveUser(user: User): Promise<void> {
  const userStr = JSON.stringify(user);
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.setItem(USER_KEY, userStr);
  } else {
    await AsyncStorage.setItem(USER_KEY, userStr);
  }
}

async function readUser(): Promise<User | null> {
  let userStr: string | null = null;
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
    userStr = window.localStorage.getItem(USER_KEY);
  } else {
    userStr = await AsyncStorage.getItem(USER_KEY);
  }
  if (!userStr) return null;

  const parsed = JSON.parse(userStr) as Partial<User>;
  return {
    id: String(parsed.id ?? ''),
    username: parsed.username ?? 'user',
    role: parsed.role === 'admin' ? 'admin' : 'student',
    name: parsed.name ?? parsed.username ?? 'Sinh viên',
    email: parsed.email ?? '',
  };
}

async function clearUser(): Promise<void> {
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.removeItem(USER_KEY);
  } else {
    await AsyncStorage.removeItem(USER_KEY);
  }
}

interface AuthStoreState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  persistSession: (user: User, token: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthStoreState>((set) => ({
  user: null,
  token: null,
  isLoading: true,

  persistSession: async (user, token) => {
    await saveToken(token);
    await saveUser(user);
    set({ user, token, isLoading: false });
  },

  logout: async () => {
    try {
      await deleteToken();
      await clearUser();
    } catch (e) {
      console.warn('Lỗi khi xóa dữ liệu auth:', e);
    } finally {
      set({ user: null, token: null, isLoading: false });
    }
  },

  checkAuth: async () => {
    try {
      set({ isLoading: true });
      const token = await getToken();
      if (!token) {
        set({ user: null, token: null, isLoading: false });
        return;
      }
      const user = await readUser();
      set({
        user: user ?? { id: '0', username: 'user', role: 'student', name: 'Sinh viên', email: '' },
        token,
        isLoading: false,
      });
    } catch (error) {
      console.error('Lỗi checkAuth:', error);
      set({ user: null, token: null, isLoading: false });
    }
  },
}));

export default useAuthStore;
