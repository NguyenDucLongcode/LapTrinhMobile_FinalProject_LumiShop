// app/index.tsx
// Điểm điều hướng đầu vào của ứng dụng, chuyển hướng đến nhóm route chính (app)
import React from 'react';
import { Redirect } from 'expo-router';

export default function Index() {
  return <Redirect href="/(app)" />;
}
