// app/(app)/cart.tsx
// Giỏ hàng LumiShop: Card item ảnh 65x65 bo góc, bộ chọn số lượng, Card tổng tiền lớn và Nút thanh toán bo tròn 24

import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  SafeAreaView,
  Alert,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useCartStore } from '../../store/cartStore';
import { useTheme } from '../../theme/useTheme';
import { Header } from '../../components/Header';
import { calculateTotal, formatCurrency } from '../../utils/calculateTotal';
import { CartItem } from '../../types';

export default function CartScreen() {
  const router = useRouter();
  const { colors, borderRadius, shadow, shadowSm } = useTheme();
  const { items, removeItem, updateQuantity, clearCart } = useCartStore();

  const { total } = calculateTotal(items);

  const handleClearCart = () => {
    if (items.length === 0) return;

    if (Platform.OS === 'web') {
      if (window.confirm('Bạn có chắc muốn xóa tất cả sản phẩm trong giỏ?')) {
        clearCart();
      }
    } else {
      Alert.alert('Xóa giỏ hàng', 'Bạn có chắc muốn xóa toàn bộ sản phẩm?', [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa hết',
          style: 'destructive',
          onPress: clearCart,
        },
      ]);
    }
  };

  const renderCartItem = ({ item }: { item: CartItem }) => {
    return (
      <View
        style={[
          styles.itemCard,
          {
            backgroundColor: colors.card,
            borderRadius: borderRadius.card,
            borderColor: colors.border,
          },
          shadowSm,
        ]}
      >
        {/* Ảnh nhỏ 65x65 bo góc */}
        <Image
          source={{ uri: item.product.image }}
          style={[styles.itemImage, { borderRadius: borderRadius.input }]}
          contentFit="cover"
          transition={200}
        />

        {/* Thông tin sản phẩm */}
        <View style={styles.itemInfo}>
          <Text
            numberOfLines={2}
            style={[styles.itemName, { color: colors.text }]}
          >
            {item.product.name}
          </Text>

          <Text style={[styles.itemPrice, { color: colors.accent }]}>
            {formatCurrency(item.product.price)}
          </Text>

          {/* Hàng bộ chọn số lượng & Nút xóa thùng rác đỏ */}
          <View style={styles.actionsRow}>
            <View style={[styles.quantityPicker, { backgroundColor: colors.bg, borderRadius: borderRadius.input }]}>
              <Pressable
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Giảm số lượng"
                onPress={() => updateQuantity(item.product.id, item.quantity - 1)}
                style={styles.qtyBtn}
              >
                <Text style={[styles.qtyBtnText, { color: colors.text }]}>-</Text>
              </Pressable>

              <Text style={[styles.qtyText, { color: colors.text }]}>
                {item.quantity}
              </Text>

              <Pressable
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Tăng số lượng"
                onPress={() => updateQuantity(item.product.id, item.quantity + 1)}
                style={styles.qtyBtn}
              >
                <Text style={[styles.qtyBtnText, { color: colors.text }]}>+</Text>
              </Pressable>
            </View>

            <Pressable
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={`Xóa ${item.product.name}`}
              hitSlop={8}
              onPress={() => removeItem(item.product.id)}
              style={({ pressed }) => [
                styles.deleteBtn,
                {
                  backgroundColor: '#FEE2E2',
                  transform: [{ scale: pressed ? 0.9 : 1 }],
                },
              ]}
            >
              <Text style={{ fontSize: 16 }}>🗑️</Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <Header
        title="Giỏ hàng LumiShop"
        showBack={true}
        showCart={false}
        rightAction={
          items.length > 0 ? (
            <Pressable
              onPress={handleClearCart}
              style={styles.clearHeaderBtn}
              accessibilityRole="button"
              accessibilityLabel="Xóa toàn bộ giỏ"
            >
              <Text style={[styles.clearHeaderText, { color: colors.danger }]}>Xóa hết</Text>
            </Pressable>
          ) : undefined
        }
      />

      {items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={[styles.emptyCircle, { backgroundColor: colors.accentLight }]}>
            <Text style={{ fontSize: 44 }}>🛍️</Text>
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            Giỏ hàng của bạn đang trống!
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.muted }]}>
            Khám phá hơn 25+ sản phẩm chất lượng cao của LumiShop ngay hôm nay.
          </Text>
          <Pressable
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Quay lại mua sắm"
            onPress={() => router.push('/(app)')}
            style={({ pressed }) => [
              styles.shopNowBtn,
              {
                backgroundColor: colors.accent,
                borderRadius: borderRadius.button,
                transform: [{ scale: pressed ? 0.97 : 1 }],
              },
              shadow,
            ]}
          >
            <Text style={styles.shopNowBtnText}>✨ Mua sắm ngay</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <FlatList
            data={items}
            keyExtractor={(item) => item.id}
            renderItem={renderCartItem}
            contentContainerStyle={styles.listContent}
          />

          {/* Khối Tổng kết & Nút Thanh toán */}
          <View
            style={[
              styles.summaryContainer,
              {
                backgroundColor: colors.card,
                borderTopColor: colors.border,
              },
              shadow,
            ]}
          >
            {/* Card lớn hiển thị chi tiết tổng tiền */}
            <View
              style={[
                styles.totalCard,
                {
                  backgroundColor: colors.accentLight,
                  borderRadius: borderRadius.card,
                  borderColor: colors.accent,
                },
              ]}
            >
              <View style={styles.totalRow}>
                <Text style={[styles.totalLabel, { color: colors.muted }]}>
                  Tổng số lượng:
                </Text>
                <Text style={[styles.totalCountText, { color: colors.text }]}>
                  {items.reduce((sum, i) => sum + i.quantity, 0)} sản phẩm
                </Text>
              </View>

              <View style={styles.totalRow}>
                <Text style={[styles.totalFinalLabel, { color: colors.text }]}>
                  Tổng thanh toán:
                </Text>
                <Text style={[styles.totalAmount, { color: colors.accent }]}>
                  {formatCurrency(total)}
                </Text>
              </View>
            </View>

            {/* Nút Thanh toán to, bo tròn 24 */}
            <Pressable
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Tiến hành thanh toán đơn hàng"
              onPress={() => router.push('/(app)/checkout')}
              style={({ pressed }) => [
                styles.checkoutBtn,
                {
                  backgroundColor: colors.accent,
                  borderRadius: borderRadius.button,
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                },
                shadow,
              ]}
            >
              <Text style={styles.checkoutBtnText}>
                Tiến Hành Thanh Toán ({items.length} món) →
              </Text>
            </Pressable>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  clearHeaderBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  clearHeaderText: {
    fontSize: 13,
    fontWeight: '700',
  },
  listContent: {
    padding: 16,
    paddingBottom: 220,
  },
  itemCard: {
    flexDirection: 'row',
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
    alignItems: 'center',
  },
  itemImage: {
    width: 65,
    height: 65,
    backgroundColor: '#F1F5F9',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 14,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 19,
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 8,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quantityPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    height: 32,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnText: {
    fontSize: 16,
    fontWeight: '700',
  },
  qtyText: {
    minWidth: 26,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '800',
  },
  deleteBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  shopNowBtn: {
    minHeight: 50,
    paddingHorizontal: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shopNowBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  summaryContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 18,
    borderTopWidth: 1,
  },
  totalCard: {
    padding: 14,
    borderWidth: 1,
    marginBottom: 14,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 2,
  },
  totalLabel: {
    fontSize: 13,
  },
  totalCountText: {
    fontSize: 13,
    fontWeight: '700',
  },
  totalFinalLabel: {
    fontSize: 15,
    fontWeight: '800',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: '900',
  },
  checkoutBtn: {
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkoutBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
