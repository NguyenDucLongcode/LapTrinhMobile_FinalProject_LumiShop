// types/index.ts
// Kiểu dữ liệu toàn diện và chuẩn xác cho Study Planner App
// Khớp 100% với cấu trúc dữ liệu JSON trong thư mục data/

// ── 1. User & Auth ─────────────────────────────────────────────────────────
export type UserRole = 'admin' | 'student';

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

// ── 2. Course (Môn học) ────────────────────────────────────────────────────
export interface Course {
  id: string;
  code: string;
  name: string;
  color: string;
}

export type CourseInput = Omit<Course, 'id'>;

// ── 3. Assignment (Bài tập) ────────────────────────────────────────────────
export type AssignmentStatus = 'pending' | 'completed';

export interface Assignment {
  id: string;
  courseId: string;
  title: string;
  dueAt: string;
  status: AssignmentStatus;
  notes?: string;
  photoUri?: string | null;
  createdAt: string;
}

export type AssignmentInput = Omit<Assignment, 'id' | 'createdAt' | 'status'> & {
  status?: AssignmentStatus;
  createdAt?: string;
};
