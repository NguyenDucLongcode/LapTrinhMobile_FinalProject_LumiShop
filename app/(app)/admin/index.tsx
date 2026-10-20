// app/(app)/admin/index.tsx
// Dashboard Quản trị viên LumiShop: Thống kê sản phẩm, voucher động, và các menu chức năng tối giản

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useRouter, Redirect } from 'expo-router';
import { useProducts } from '../../../hooks/useProducts';
import { useTheme } from '../../../theme/useTheme';
import { Header } from '../../../components/Header';
import { useAuthStore } from '../../../store/authStore';
import axiosClient from '../../../api/axiosClient';

export default function AdminDashboardScreen() {
  const router = useRouter();
  const { colors, borderRadius, shadowSm } = useTheme();
  const { data: products } = useProducts();
  const { user } = useAuthStore();

  // Đếm voucher động từ API
  const [voucherCount, setVoucherCount] = useState<number | null>(null);
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  useEffect(() => {
    const checkServer = async () => {
      try {
        const res = await axiosClient.get('/vouchers');
        setServerStatus('online');
        if (Array.isArray(res.data)) {
          setVoucherCount(res.data.length);
        }
      } catch {
        setServerStatus('offline');
        setVoucherCount(5); // Fallback số lượng voucher mặc định (initialVouchers) khi offline
      }
    };
    checkServer();
  }, []);

  // Bảo vệ phân quyền: chỉ admin mới được vào
  if (!user || user.role !== 'admin') {
    return <Redirect href="/(app)" />;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <Header title="LumiShop Admin" showBack={true} showCart={false} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Banner chào Admin */}
        <View
          style={[
            styles.welcomeBanner,
            {
              backgroundColor: colors.card,
              borderRadius: borderRadius.card,
              borderColor: colors.border,
            },
            shadowSm,
          ]}
        >
          <View style={[styles.welcomeIconBox, { backgroundColor: colors.accentLight }]}>
            <Text style={{ fontSize: 28 }}>🛡️</Text>
          </View>
          <View style={styles.welcomeTexts}>
            <Text style={[styles.welcomeTitle, { color: colors.text }]}>
              Xin chào, {user?.name || 'Quản trị viên'} 👋
            </Text>
            <Text style={[styles.welcomeDesc, { color: colors.muted }]}>
              Trung tâm kiểm soát hệ thống bán hàng trực tuyến LumiShop
            </Text>
          </View>
        </View>

        {/* Khối Thống kê số liệu */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          📊 Tổng quan số liệu LumiShop
        </Text>
        <View style={styles.statsGrid}>
          <View
            style={[
              styles.statBox,
              {
                backgroundColor: colors.card,
                borderRadius: borderRadius.card,
                borderColor: colors.border,
              },
              shadowSm,
            ]}
          >
            <Text style={styles.statIcon}>📦</Text>
            <Text style={[styles.statNum, { color: colors.accent }]}>
              {products.length}
            </Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>
              Sản phẩm có sẵn
            </Text>
          </View>

          <View
            style={[
              styles.statBox,
              {
                backgroundColor: colors.card,
                borderRadius: borderRadius.card,
                borderColor: colors.border,
              },
              shadowSm,
            ]}
          >
            <Text style={styles.statIcon}>🎟️</Text>
            <Text style={[styles.statNum, { color: '#3B82F6' }]}>
              {voucherCount !== null ? voucherCount : '...'}
            </Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>
              Mã voucher ưu đãi
            </Text>
          </View>

          <View
            style={[
              styles.statBox,
              {
                backgroundColor: colors.card,
                borderRadius: borderRadius.card,
                borderColor: colors.border,
              },
              shadowSm,
            ]}
          >
            <Text style={styles.statIcon}>⚡</Text>
            <Text style={[styles.statNum, {
              color: serverStatus === 'online' ? colors.success : serverStatus === 'offline' ? colors.danger : colors.muted,
              fontSize: 16,
            }]}>
              {serverStatus === 'online' ? '200 OK' : serverStatus === 'offline' ? 'Offline' : '...'}
            </Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>
              JSON Server port 3000
            </Text>
          </View>

          <View
            style={[
              styles.statBox,
              {
                backgroundColor: colors.card,
                borderRadius: borderRadius.card,
                borderColor: colors.border,
              },
              shadowSm,
            ]}
          >
            <Text style={styles.statIcon}>👥</Text>
            <Text style={[styles.statNum, { color: colors.text }]}>3</Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>
              Tài khoản mẫu
            </Text>
          </View>
        </View>

        {/* Khối Danh mục chức năng */}
        <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 8 }]}>
          ⚙️ Chức năng quản trị
        </Text>

        <Pressable
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Quản lý Sản phẩm"
          onPress={() => router.push('/(app)/admin/products')}
          style={({ pressed }) => [
            styles.menuCard,
            {
              backgroundColor: colors.card,
              borderRadius: borderRadius.card,
              borderColor: colors.border,
              transform: [{ scale: pressed ? 0.98 : 1 }],
            },
            shadowSm,
          ]}
        >
          <View style={styles.menuLeft}>
            <View style={[styles.menuIconBg, { backgroundColor: colors.accentLight }]}>
              <Text style={{ fontSize: 22 }}>📦</Text>
            </View>
            <View style={styles.menuTexts}>
              <Text style={[styles.menuTitle, { color: colors.text }]}>Quản lý Sản phẩm</Text>
              <Text style={[styles.menuDesc, { color: colors.muted }]}>
                Xem danh sách 25+ sản phẩm, thêm mới và xóa sản phẩm
              </Text>
            </View>
          </View>
          <Text style={[styles.menuArrow, { color: colors.accent }]}>→</Text>
        </Pressable>

        <Pressable
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Quản lý Voucher"
          onPress={() => router.push('/(app)/admin/vouchers')}
          style={({ pressed }) => [
            styles.menuCard,
            {
              backgroundColor: colors.card,
              borderRadius: borderRadius.card,
              borderColor: colors.border,
              transform: [{ scale: pressed ? 0.98 : 1 }],
            },
            shadowSm,
          ]}
        >
          <View style={styles.menuLeft}>
            <View style={[styles.menuIconBg, { backgroundColor: '#DBEAFE' }]}>
              <Text style={{ fontSize: 22 }}>🎟️</Text>
            </View>
            <View style={styles.menuTexts}>
              <Text style={[styles.menuTitle, { color: colors.text }]}>Quản lý Voucher</Text>
              <Text style={[styles.menuDesc, { color: colors.muted }]}>
                Xem 5 voucher mẫu, tạo mã khuyến mãi mới
              </Text>
            </View>
          </View>
          <Text style={[styles.menuArrow, { color: colors.accent }]}>→</Text>
        </Pressable>

        <Pressable
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Quay lại giao diện mua sắm"
          onPress={() => router.replace('/(app)')}
          style={({ pressed }) => [
            styles.backShoppingBtn,
            {
              borderColor: colors.accent,
              borderRadius: borderRadius.button,
              transform: [{ scale: pressed ? 0.98 : 1 }],
            },
          ]}
        >
          <Text style={[styles.backShoppingText, { color: colors.accent }]}>
            🛍️ Chuyển sang Giao diện Mua sắm LumiShop
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  welcomeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderWidth: 1,
    marginBottom: 20,
  },
  welcomeIconBox: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  welcomeTexts: {
    flex: 1,
  },
  welcomeTitle: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 4,
  },
  welcomeDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 22,
    marginBottom: 6,
  },
  statNum: {
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIconBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuTexts: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 2,
  },
  menuDesc: {
    fontSize: 12,
  },
  menuArrow: {
    fontSize: 20,
    fontWeight: '800',
    marginLeft: 10,
  },
  backShoppingBtn: {
    height: 50,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  backShoppingText: {
    fontSize: 14,
    fontWeight: '800',
  },
});
