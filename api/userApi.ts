// api/userApi.ts
// API Layer chuyên trách các thao tác dữ liệu với Người dùng (User)

import axiosClient from './axiosClient';
import { User } from '../types';

export const userApi = {
  /**
   * Lấy danh sách toàn bộ người dùng
   */
  async getAll(): Promise<User[]> {
    const response = await axiosClient.get<User[]>('/users');
    return response.data;
  },

  /**
   * Lấy thông tin người dùng theo ID
   */
  async getById(id: string): Promise<User> {
    const response = await axiosClient.get<User>(`/users/${id}`);
    return response.data;
  },

  /**
   * Thêm người dùng mới
   */
  async create(data: Partial<User>): Promise<User> {
    const payload: User = {
      id: data.id || String(Date.now()),
      username: data.username || '',
      role: data.role || 'customer',
      name: data.name || data.username || '',
      email: data.email || '',
      phone: data.phone || '',
      address: data.address || '',
      ...data,
    };
    const response = await axiosClient.post<User>('/users', payload);
    return response.data;
  },

  /**
   * Cập nhật thông tin người dùng theo ID
   */
  async update(id: string, data: Partial<User>): Promise<User> {
    const response = await axiosClient.put<User>(`/users/${id}`, data);
    return response.data;
  },

  /**
   * Xóa người dùng theo ID
   */
  async delete(id: string): Promise<void> {
    await axiosClient.delete(`/users/${id}`);
  },

  /**
   * Đăng nhập người dùng (so khớp username và password trên json-server)
   */
  async login(username: string, password?: string): Promise<User> {
    const cleanUser = username.trim();
    const response = await axiosClient.get<any[]>('/users', {
      params: {
        username: cleanUser,
        ...(password ? { password } : {}),
      },
    });

    if (!response.data || response.data.length === 0) {
      throw new Error('Sai tên đăng nhập hoặc mật khẩu!');
    }

    const matched = response.data[0];
    const user: User = {
      id: String(matched.id),
      username: matched.username,
      name: matched.name || matched.username,
      role: matched.role || 'customer',
      email: matched.email,
      phone: matched.phone,
      address: matched.address,
    };

    return user;
  },

  // Alias tương thích
  getAllUsers() {
    return this.getAll();
  },
  getUserById(id: string) {
    return this.getById(id);
  },
};

export default userApi;
