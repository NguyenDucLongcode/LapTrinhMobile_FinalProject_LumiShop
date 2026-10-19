// app/(app)/_layout.tsx
// Layout cho nhóm route được bảo vệ, tích hợp ProtectedRoute kiểm tra token trước khi truy cập

import React from 'react';
import { Stack } from 'expo-router';
import { ProtectedRoute } from '../../components/ProtectedRoute';

export default function AppProtectedLayout() {
  return (
    <ProtectedRoute>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="product/[id]" />
        <Stack.Screen name="cart" />
        <Stack.Screen name="checkout" />
        <Stack.Screen name="admin/index" />
        <Stack.Screen name="admin/products" />
        <Stack.Screen name="admin/vouchers" />
        <Stack.Screen name="+not-found" />
      </Stack>
    </ProtectedRoute>
  );
}
