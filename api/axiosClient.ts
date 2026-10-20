// api/axiosClient.ts
// Cấu hình Axios client để gọi Mock API (JSON Server)
import axios from 'axios';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Lấy IP động từ Expo hostUri để hỗ trợ Android Emulator và điện thoại thật qua Expo Go
// - Web / iOS Simulator: dùng localhost
// - Android Emulator: Expo hostUri thường là 10.0.2.2 hoặc IP LAN
// - Điện thoại thật qua Expo Go: IP LAN của máy tính host
function getBaseUrl(): string {
  if (Platform.OS === 'web') {
    return 'http://localhost:3000';
  }
  // Lấy hostUri từ Expo (ví dụ: "192.168.1.5:8081")
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const host = hostUri.split(':')[0]; // Chỉ lấy phần IP, bỏ port 8081
    return `http://${host}:3000`;
  }
  // Fallback cho Android Emulator nếu không lấy được hostUri
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000';
  }
  return 'http://localhost:3000';
}

export const BASE_URL = getBaseUrl();

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
