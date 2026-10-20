// types/index.ts
// Định nghĩa các interface và kiểu dữ liệu chuẩn mực cho toàn bộ hệ thống LumiShop

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  categoryId?: string;
  image: string;
  stock: number;
  description: string;
  rating?: number;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
}

export interface Voucher {
  id: string;
  code: string;
  discount: number; // Mức giảm giá (%) hoặc số tiền giảm
  discountPercent?: number; // Tỷ lệ phần trăm giảm giá
  minOrderValue?: number; // Giá trị đơn hàng tối thiểu
  maxDiscount?: number; // Mức giảm giá tối đa
  startDate?: string;
  endDate?: string;
  status: 'active' | 'inactive' | 'expired';
  minOrderAmount?: number;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface Order {
  id?: string;
  userId?: string;
  items: CartItem[] | OrderItem[] | any[];
  totalAmount: number;
  discountAmount?: number;
  finalAmount?: number;
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  shippingAddress?: string;
  voucherCode?: string;
  status: 'pending' | 'confirmed' | 'delivered' | 'cancelled';
  createdAt: string;
}

export interface User {
  id: string;
  username: string;
  password?: string;
  role?: 'admin' | 'customer';
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}
