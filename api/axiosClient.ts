// api/axiosClient.ts
// Axios client dùng chung cho toàn bộ API Layer (JSON Server)


import axios from 'axios';
import type { AxiosInstance } from 'axios'; 

/** Địa chỉ JSON Server (server.cjs) */
export const BASE_URL = 'http://localhost:3000';

export const axiosClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 10000,
});

// Gắn token vào header nếu đã đăng nhập (web: localStorage)
axiosClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const token = window.localStorage.getItem('shopabc_auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Chuẩn hóa thông báo lỗi tiếng Việt
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Đã xảy ra lỗi khi kết nối tới máy chủ!';
    return Promise.reject(new Error(message));
  }
);

export default axiosClient;
