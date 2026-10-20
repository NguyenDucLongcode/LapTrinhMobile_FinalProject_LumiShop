// hooks/useCartsQuery.ts
// TanStack Query: giỏ hàng theo user (đồng bộ data/carts.json)

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { cartApi } from '../api/cartApi';
import { CartInput, Product } from '../types';
import { cartKeys } from './queryKeys';

export function useCart(userId: string) {
  return useQuery({
    queryKey: cartKeys.byUser(userId),
    queryFn: () => cartApi.getByUserId(userId),
    enabled: Boolean(userId),
  });
}

export function useCreateCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CartInput) => cartApi.create(data),
    onSuccess: (cart) => {
      queryClient.invalidateQueries({ queryKey: cartKeys.byUser(cart.userId) });
      queryClient.invalidateQueries({ queryKey: cartKeys.all });
    },
  });
}

export function useUpdateCart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, product, quantity = 1 }: { userId: string; product: Product; quantity?: number }) => {
      const cart = await cartApi.getByUserId(userId);
      const items = cart?.items ?? [];
      const productId = String(product.id);
      const index = items.findIndex((item) => String(item.productId ?? item.product.id) === productId);
      const nextItems = [...items];
      if (index >= 0) {
        nextItems[index] = { ...nextItems[index], productId, product, quantity: Math.min(nextItems[index].quantity + quantity, product.stock ?? 999) };
      } else {
        nextItems.push({ id: `${productId}-${Date.now()}`, productId, product, quantity: Math.min(quantity, product.stock ?? 999) });
      }
      const data: CartInput = { userId, items: nextItems, updatedAt: new Date().toISOString() };
      return cart ? cartApi.update(String(cart.id), data) : cartApi.create(data);
    },
    onSuccess: (cart) => {
      queryClient.setQueryData(cartKeys.byUser(cart.userId), cart);
      queryClient.invalidateQueries({ queryKey: cartKeys.all });
    },
  });
}

export function useSaveCart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CartInput> }) => cartApi.update(id, data),
    onSuccess: (cart) => queryClient.setQueryData(cartKeys.byUser(cart.userId), cart),
  });
}

export function useDeleteCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => cartApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.all });
    },
  });
}
