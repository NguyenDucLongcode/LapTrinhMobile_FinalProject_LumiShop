// app/(app)/+not-found.tsx
// Màn hình 404 Not Found LumiShop phong cách Minimalist

import React from 'react';
import { View, Text, StyleSheet, Pressable, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../theme/useTheme';

export default function NotFoundScreen() {
  const router = useRouter();
  const { colors, borderRadius, shadow } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={styles.content}>
        <View style={[styles.emojiCircle, { backgroundColor: colors.accentLight }]}>
          <Text style={{ fontSize: 44 }}>🧭</Text>
        </View>
        <Text style={[styles.title, { color: colors.text }]}>
          404 - Không tìm thấy trang
        </Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          Đường dẫn bạn vừa truy cập không tồn tại hoặc đã được di chuyển trên LumiShop.
        </Text>
        <Pressable
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Trở về trang chủ"
          onPress={() => router.replace('/(app)')}
          style={({ pressed }) => [
            styles.homeBtn,
            {
              backgroundColor: colors.accent,
              borderRadius: borderRadius.button,
              transform: [{ scale: pressed ? 0.98 : 1 }],
            },
            shadow,
          ]}
        >
          <Text style={styles.homeBtnText}>🏠 Quay về Trang Chủ LumiShop</Text>
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
  emojiCircle: {
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
    height: 50,
    paddingHorizontal: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
