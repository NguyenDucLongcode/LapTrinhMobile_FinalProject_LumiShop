// app/(app)/_layout.tsx
// Layout cho nhóm route được bảo vệ, tích hợp ProtectedRoute kiểm tra token trước khi truy cập

import React from 'react';
import { Stack } from 'expo-router';

export default function AppProtectedLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    />
  );
}
