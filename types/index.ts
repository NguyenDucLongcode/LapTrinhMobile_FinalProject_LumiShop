// types/index.ts
// Định nghĩa các interface và kiểu dữ liệu cho toàn bộ ứng dụng

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  stock: number;
  description: string;
  rating?: number;
}

export interface Category {
  id: string;
  name: string;
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
}

export interface Voucher {
  id: string;
  code: string;
  discount: number; // Tỷ lệ giảm giá (%) hoặc số tiền giảm
  status: 'active' | 'inactive' | 'expired';
  minOrderAmount?: number;
}

export interface Order {
  id?: string;
  items: CartItem[];
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  voucherCode?: string;
  status: 'pending' | 'confirmed' | 'delivered' | 'cancelled';
  createdAt: string;
}

export interface User {
  id: string;
  username: string;
  name?: string;
  role?: 'admin' | 'customer';
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}
