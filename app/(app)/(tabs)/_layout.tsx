import React from 'react';
import { Redirect, Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../theme/useTheme';
import { useAuthStore } from '../../../store/authStore';

export default function TabsLayout() {
  const { colors } = useTheme();
  const user = useAuthStore((state) => state.user);

  if (user?.role === 'admin') {
    return <Redirect href="/admin" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingBottom: 4,
          height: 56,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Trang chủ',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={typeof color === 'string' ? color : colors.accent} />
          ),
        }}
      />
      <Tabs.Screen
        name="weekly"
        options={{
          title: 'Lịch tuần',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={typeof color === 'string' ? color : colors.accent} />
          ),
        }}
      />
    </Tabs>
  );
}
