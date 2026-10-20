// api/voucherApi.ts
// Gọi HTTP tới /vouchers và xử lý logic kiểm tra mã giảm giá

import {axiosClient} from './axiosClient';
import { Voucher, VoucherInput } from '../types';

const RESOURCE = '/vouchers';

/** Lấy toàn bộ voucher */
export async function getAll(): Promise<Voucher[]> {
  const response = await axiosClient.get<Voucher[]>(RESOURCE);
  return response.data;
}

/**
 * Tìm voucher theo mã (không phân biệt hoa/thường),
 * rồi kiểm tra trạng thái và hạn sử dụng.
 */
export async function getByCode(code: string): Promise<Voucher> {
  const cleanCode = code.trim().toUpperCase();
  if (!cleanCode) {
    throw new Error('Vui lòng nhập mã giảm giá!');
  }

  const queried = await axiosClient.get<Voucher[]>(RESOURCE, {
    params: { code: cleanCode },
  });

  let voucher: Voucher | undefined = queried.data[0];

  // json-server so khớp exact; quét thêm nếu người dùng nhập khác hoa/thường
  if (!voucher) {
    const all = await getAll();
    voucher = all.find((item) => item.code.toUpperCase() === cleanCode);
  }

  if (!voucher) {
    throw new Error(`Mã giảm giá "${cleanCode}" không tồn tại!`);
  }

  if (voucher.status !== 'active') {
    throw new Error(`Mã giảm giá "${cleanCode}" không còn hiệu lực!`);
  }

  if (voucher.expiresAt) {
    const expiresAt = new Date(voucher.expiresAt).getTime();
    if (Number.isNaN(expiresAt) || expiresAt < Date.now()) {
      throw new Error(`Mã giảm giá "${cleanCode}" đã hết hạn sử dụng!`);
    }
  }

  return voucher;
}

/** Tạo voucher mới */
export async function create(data: VoucherInput): Promise<Voucher> {
  const payload: VoucherInput = {
    ...data,
    code: data.code.trim().toUpperCase(),
  };
  const response = await axiosClient.post<Voucher>(RESOURCE, payload);
  return response.data;
}

export async function update(id: string, data: Partial<VoucherInput>): Promise<Voucher> {
  const response = await axiosClient.patch<Voucher>(`${RESOURCE}/${id}`, {
    ...data,
    ...(data.code ? { code: data.code.trim().toUpperCase() } : {}),
  });
  return response.data;
}

/** Xóa voucher */
export async function remove(id: string): Promise<void> {
  await axiosClient.delete(`${RESOURCE}/${id}`);
}

export const voucherApi = {
  getAll,
  getByCode,
  create,
  update,
  delete: remove,
};

export default voucherApi;
