// app/+not-found.tsx
// Màn hình 404 cho Study Planner

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/useTheme';

export default function NotFoundScreen() {
  const router = useRouter();
  const { colors, borderRadius, shadow } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={styles.content}>
        <View style={[styles.iconCircle, { backgroundColor: colors.accentLight }]}>
          <Ionicons name="compass-outline" size={48} color={colors.accent} />
        </View>
        <Text style={[styles.title, { color: colors.text }]}>404 - Không tìm thấy trang</Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          Trang bạn vừa truy cập không tồn tại hoặc đã được di chuyển trên ứng dụng Study Planner.
        </Text>
        <Pressable
          onPress={() => router.replace('/(app)')}
          style={({ pressed }) => [
            styles.homeBtn,
            {
              backgroundColor: colors.accent,
              borderRadius: borderRadius.button,
              opacity: pressed ? 0.85 : 1,
            },
            shadow,
          ]}
        >
          <Ionicons name="home-outline" size={18} color="#FFF" />
          <Text style={styles.homeBtnText}>Quay về Trang chủ</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  homeBtn: {
    flexDirection: 'row',
    height: 48,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  homeBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
