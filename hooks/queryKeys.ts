// hooks/queryKeys.ts
// Query Keys tập trung cho TanStack Query (invalidation theo prefix)

export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  paginated: (page: number, limit: number) =>
    [...productKeys.all, 'paginated', page, limit] as const,
  detail: (id: string) => [...productKeys.all, 'detail', id] as const,
};

export const categoryKeys = {
  all: ['categories'] as const,
  lists: () => [...categoryKeys.all, 'list'] as const,
  detail: (id: string) => [...categoryKeys.all, 'detail', id] as const,
};

export const voucherKeys = {
  all: ['vouchers'] as const,
  lists: () => [...voucherKeys.all, 'list'] as const,
  detail: (id: string) => [...voucherKeys.all, 'detail', id] as const,
  code: (code: string) => [...voucherKeys.all, 'code', code] as const,
};

export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  detail: (id: string) => [...orderKeys.all, 'detail', id] as const,
};

export const cartKeys = {
  all: ['carts'] as const,
  lists: () => [...cartKeys.all, 'list'] as const,
  byUser: (userId: string) => [...cartKeys.all, 'user', userId] as const,
};

export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  detail: (id: string) => [...userKeys.all, 'detail', id] as const,
};
