// api/userApi.ts
// Gọi HTTP tới /users và xử lý logic đăng nhập

import { axiosClient } from './axiosClient';
import { LoginResult, User, UserRecord } from '../types';

const RESOURCE = '/users';

/** Bỏ mật khẩu trước khi trả về UI */
function toPublicUser(record: UserRecord): User {
  return {
    id: String(record.id),
    username: record.username,
    role: record.role,
    name: record.name,
    email: record.email,
  };
}

/** Lấy danh sách user (ẩn mật khẩu) */
export async function getAll(): Promise<User[]> {
  const response = await axiosClient.get<UserRecord[]>(RESOURCE);
  return response.data.map(toPublicUser);
}

/**
 * Đăng nhập: tìm user theo username, so khớp password,
 * trả về token giả lập + thông tin user (không kèm mật khẩu).
 */
export async function login(username: string, password: string): Promise<LoginResult> {
  const cleanUsername = username.trim();
  if (!cleanUsername || !password) {
    throw new Error('Vui lòng nhập tên đăng nhập và mật khẩu!');
  }

  const response = await axiosClient.get<UserRecord[]>(RESOURCE, {
    params: { username: cleanUsername },
  });

  const matched =
    response.data.find((item) => item.username.toLowerCase() === cleanUsername.toLowerCase()) ??
    null;

  if (!matched || matched.password !== password) {
    throw new Error('Tên đăng nhập hoặc mật khẩu không đúng!');
  }

  const user = toPublicUser(matched);
  const token = `sp_${user.id}_${Date.now()}`;

  return { token, user };
}

export const userApi = {
  login,
  getAll,
};

export default userApi;
