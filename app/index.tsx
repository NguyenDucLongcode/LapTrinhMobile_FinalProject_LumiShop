// app/index.tsx
// Điểm điều hướng đầu vào của ứng dụng, chuyển hướng đến nhóm route chính (app)
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../store/authStore';
import { useTheme } from '../theme/useTheme';

export default function Index() {
  const router = useRouter();
  const { token, isLoading } = useAuthStore();
  const { colors } = useTheme();

  React.useEffect(() => {
    if (!isLoading) router.replace(token ? '/(app)' : '/(auth)/sign-in');
  }, [isLoading, router, token]);

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <ActivityIndicator color={colors.accent} size="large" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
