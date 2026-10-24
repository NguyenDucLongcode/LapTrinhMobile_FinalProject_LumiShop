// app/_layout.tsx
// Root layout thuần React Native & TanStack Query (Không dùng UI library ngoài, kiểm soát 100% giao diện)

import React, { useEffect, useState } from 'react';
import { Stack, useRouter } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { useAuthStore } from '../store/authStore';
import { useTheme } from '../theme/useTheme';

export default function RootLayout() {
  const router = useRouter();
  const { isDark, colors } = useTheme();
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const token = useAuthStore((state) => state.token);
  const isLoading = useAuthStore((state) => state.isLoading);

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            staleTime: 1000 * 60 * 3,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Lắng nghe khi người dùng bấm vào Notification -> điều hướng Deep Link
  useEffect(() => {
    if (Platform.OS === 'web') return;

    const responseSubscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const url = response.notification.request.content.data?.url;
        if (url) {
          router.push(url as any);
        }
      }
    );

    return () => {
      responseSubscription.remove();
    };
  }, [router]);

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
            contentStyle: {
              backgroundColor: colors.bg,
            },
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Protected guard={!isLoading && Boolean(token)} redirectTo="/(auth)/sign-in">
            <Stack.Screen name="(app)" options={{ headerShown: false }} />
          </Stack.Protected>
          <Stack.Protected guard={!isLoading && !token} redirectTo="/(app)">
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          </Stack.Protected>
        </Stack>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
