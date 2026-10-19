// api/axiosClient.ts
// Cấu hình Axios client để gọi Mock API (JSON Server)
import axios from 'axios';

// Base URL mặc định cho JSON Server
export const BASE_URL = 'http://localhost:3000';

export const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 10000, // 10 giây timeout
});

// Request interceptor: có thể bổ sung token xác thực vào header nếu có
axiosClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: chuẩn hóa xử lý phản hồi hoặc lỗi
axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Đã xảy ra lỗi khi kết nối tới máy chủ!';
    return Promise.reject(new Error(message));
  }
);

export default axiosClient;
