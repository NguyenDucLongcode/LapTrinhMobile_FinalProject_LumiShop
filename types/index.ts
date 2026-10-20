// types/index.ts
// Kiểu dữ liệu khớp với các file JSON trong thư mục data/

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  stock: number;
  rating: number;
  categoryId: string;
}

export type ProductInput = Omit<Product, 'id'>;

export interface Category {
  id: string;
  name: string;
  description: string;
}

export type CategoryInput = Omit<Category, 'id'>;

export interface CartItem {
  id: string;
  productId?: string;
  product: Product;
  quantity: number;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  updatedAt: string;
}

export type CartInput = Omit<Cart, 'id'>;

export type VoucherStatus = 'active' | 'inactive' | 'expired';

export interface Voucher {
  id: string;
  code: string;
  discountPercent: number;
  minOrderValue: number;
  status: VoucherStatus;
  expiresAt?: string;
}

export type VoucherInput = Omit<Voucher, 'id'>;

export type OrderStatus = 'pending' | 'confirmed' | 'delivered' | 'cancelled';

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  shippingAddress: string;
  createdAt: string;
}

export type CreateOrderInput = Omit<Order, 'id' | 'createdAt' | 'status'> & {
  status?: OrderStatus;
  createdAt?: string;
};

export type UserRole = 'admin' | 'customer';

/** Bản ghi user trên JSON Server (có mật khẩu, chỉ dùng trong API layer) */
export interface UserRecord {
  id: string;
  username: string;
  password: string;
  role: UserRole;
  name: string;
  email: string;
}

/** User trả về cho UI (không kèm mật khẩu) */
export interface User {
  id: string;
  username: string;
  role: UserRole;
  name: string;
  email: string;
}

export interface LoginResult {
  token: string;
  user: User;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
