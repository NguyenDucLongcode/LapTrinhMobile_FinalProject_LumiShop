// components/Header.tsx
// Header LumiShop: Logo LumiShop bên trái, 3 icon Ionicons bên phải, trải dài 100% full width màn hình

import React from 'react';
import { View, Text, StyleSheet, Pressable, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/useTheme';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  showCart?: boolean;
  showAdmin?: boolean;
  showLogout?: boolean;
  rightAction?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  showBack = false,
  showCart = true,
  showAdmin = false,
  showLogout = false,
  rightAction,
}) => {
  const router = useRouter();
  const { colors, shadowSm } = useTheme();
  const totalItems = useCartStore((state) => state.getTotalItems());
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Bạn có chắc chắn muốn đăng xuất khỏi LumiShop?')) {
        await logout();
        router.replace('/(auth)/sign-in');
      }
    } else {
      Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất khỏi LumiShop?', [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/sign-in');
          },
        },
      ]);
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderBottomColor: colors.border,
        },
        shadowSm,
      ]}
    >
      {/* Bên trái: Nút Back hoặc Logo LumiShop nằm sát bên trái */}
      <View style={styles.leftBox}>
        {showBack ? (
          <View style={styles.backGroup}>
            <Pressable
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Quay lại"
              onPress={() => router.back()}
              hitSlop={8}
              style={({ pressed }) => [
                styles.iconBtn,
                {
                  backgroundColor: colors.bg,
                  transform: [{ scale: pressed ? 0.92 : 1 }],
                },
              ]}
            >
              <Ionicons name="arrow-back" size={22} color={colors.text} />
            </Pressable>
            {title ? (
              <Text numberOfLines={1} style={[styles.screenTitle, { color: colors.text }]}>
                {title}
              </Text>
            ) : null}
          </View>
        ) : (
          <Pressable onPress={() => router.push('/(app)')}>
            <Text style={[styles.brandLogo, { color: colors.accent }]}>
              LumiShop
            </Text>
          </Pressable>
        )}
      </View>

      {/* Ở giữa: Tiêu đề màn hình (nếu có khi không ở chế độ back) */}
      {!showBack && title ? (
        <View style={styles.centerBox}>
          <Text numberOfLines={1} style={[styles.screenTitle, { color: colors.text }]}>
            {title}
          </Text>
        </View>
      ) : null}

      {/* Bên phải: 3 icon Ionicons nằm ngang, gap: 16 sát mép phải */}
      <View style={styles.rightBox}>
        {rightAction ? (
          rightAction
        ) : (
          <View style={styles.iconRow}>
            {/* Icon Admin */}
            {(showAdmin || user?.role === 'admin') && !showBack && (
              <Pressable
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Quản trị hệ thống"
                onPress={() => router.push('/(app)/admin')}
                hitSlop={8}
                style={({ pressed }) => [
                  styles.iconBtn,
                  {
                    backgroundColor: colors.bg,
                    transform: [{ scale: pressed ? 0.92 : 1 }],
                  },
                ]}
              >
                <Ionicons name="settings-outline" size={22} color={colors.text} />
              </Pressable>
            )}

            {/* Icon Giỏ hàng kèm Badge số lượng màu đỏ */}
            {showCart && (
              <Pressable
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={`Giỏ hàng ${totalItems} sản phẩm`}
                onPress={() => router.push('/(app)/cart')}
                hitSlop={8}
                style={({ pressed }) => [
                  styles.iconBtn,
                  {
                    backgroundColor: colors.bg,
                    transform: [{ scale: pressed ? 0.92 : 1 }],
                  },
                ]}
              >
                <Ionicons name="cart-outline" size={24} color={colors.text} />
                {totalItems > 0 && (
                  <View style={[styles.badge, { backgroundColor: colors.danger }]}>
                    <Text style={styles.badgeText}>
                      {totalItems > 99 ? '99+' : totalItems}
                    </Text>
                  </View>
                )}
              </Pressable>
            )}

            {/* Icon Đăng xuất */}
            {(showLogout || !showBack) && (
              <Pressable
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Đăng xuất tài khoản"
                onPress={handleLogout}
                hitSlop={8}
                style={({ pressed }) => [
                  styles.iconBtn,
                  {
                    backgroundColor: colors.bg,
                    transform: [{ scale: pressed ? 0.92 : 1 }],
                  },
                ]}
              >
                <Ionicons name="log-out-outline" size={22} color={colors.text} />
              </Pressable>
            )}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 60,
    width: '100%',
    maxWidth: '100%', // Trải dài full màn hình Web
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    zIndex: 10,
  },
  leftBox: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  brandLogo: {
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  backGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  screenTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  centerBox: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    pointerEvents: 'none',
  },
  rightBox: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16, // Khoảng cách 16px giữa các icon sát mép phải
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
});

export default Header;
