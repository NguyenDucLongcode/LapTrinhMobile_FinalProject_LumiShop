// app/(app)/checkout.tsx
// Màn hình Thanh toán LumiShop: Form giao hàng bo góc 12, Voucher có chip kiểm tra và Nút đặt hàng bo tròn 24

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  SafeAreaView,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { useTheme } from '../../theme/useTheme';
import { Header } from '../../components/Header';
import { useCheckVoucher } from '../../hooks/useCheckVoucher';
import { useCreateOrder } from '../../hooks/useCreateOrder';
import { calculateTotal, formatCurrency } from '../../utils/calculateTotal';
import { Voucher, Order } from '../../types';

export default function CheckoutScreen() {
  const router = useRouter();
  const { colors, borderRadius, shadow, shadowSm } = useTheme();
  const { items, clearCart } = useCartStore();
  const { user } = useAuthStore();

  const { checkVoucher, isLoading: isCheckingVoucher } = useCheckVoucher();
  const { createOrder, isLoading: isCreatingOrder } = useCreateOrder();

  // Form giao hàng
  const [customerName, setCustomerName] = useState(user?.name || user?.username || '');
  const [customerPhone, setCustomerPhone] = useState('0901234567');
  const [customerAddress, setCustomerAddress] = useState('Số 123 Đường Lê Lợi, Quận 1, TP. Hồ Chí Minh');

  // Trạng thái voucher
  const [voucherCodeInput, setVoucherCodeInput] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<Voucher | null>(null);
  const [voucherMessage, setVoucherMessage] = useState<{ text: string; isError: boolean } | null>(null);

  // Tính tiền
  const { subtotal, discountAmount, total } = calculateTotal(items, appliedVoucher);

  // Xử lý áp dụng voucher
  const handleApplyVoucher = async () => {
    if (!voucherCodeInput.trim()) {
      setVoucherMessage({ text: 'Vui lòng nhập mã voucher!', isError: true });
      return;
    }

    try {
      setVoucherMessage(null);
      const voucher = await checkVoucher({
        code: voucherCodeInput.trim(),
        orderAmount: subtotal,
      });

      setAppliedVoucher(voucher);
      setVoucherMessage({
        text: `Đã áp dụng mã "${voucher.code}" thành công!`,
        isError: false,
      });
    } catch (err: any) {
      setAppliedVoucher(null);
      setVoucherMessage({
        text: err.message || 'Mã giảm giá không hợp lệ!',
        isError: true,
      });
    }
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setVoucherCodeInput('');
    setVoucherMessage(null);
  };

  // Xử lý đặt hàng
  const handlePlaceOrder = async () => {
    if (items.length === 0) {
      if (Platform.OS === 'web') {
        alert('Giỏ hàng trống: Vui lòng thêm sản phẩm vào giỏ trước khi thanh toán!');
      } else {
        Alert.alert('Giỏ hàng trống', 'Vui lòng thêm sản phẩm vào giỏ trước khi thanh toán!');
      }
      return;
    }

    if (!customerName.trim() || !customerPhone.trim() || !customerAddress.trim()) {
      if (Platform.OS === 'web') {
        alert('Thiếu thông tin: Vui lòng điền đầy đủ họ tên, số điện thoại và địa chỉ giao hàng!');
      } else {
        Alert.alert('Thiếu thông tin', 'Vui lòng điền đầy đủ họ tên, số điện thoại và địa chỉ giao hàng!');
      }
      return;
    }

    const newOrder: Order = {
      items: [...items],
      totalAmount: subtotal,
      discountAmount,
      finalAmount: total,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerAddress: customerAddress.trim(),
      voucherCode: appliedVoucher ? appliedVoucher.code : undefined,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    try {
      const result = await createOrder(newOrder);
      clearCart();

      const successTitle = '🎉 Đặt hàng LumiShop thành công!';
      const successMsg = `Đơn hàng #${result.id} đã được tiếp nhận.\nTổng thanh toán: ${formatCurrency(total)}`;

      if (Platform.OS === 'web') {
        alert(`${successTitle}\n${successMsg}`);
        router.replace('/(app)');
      } else {
        Alert.alert(successTitle, successMsg, [
          {
            text: 'Về trang chủ LumiShop',
            onPress: () => router.replace('/(app)'),
          },
        ]);
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Không thể tạo đơn hàng, vui lòng thử lại sau!';
      if (Platform.OS === 'web') {
        alert(`Lỗi đặt hàng: ${errorMsg}`);
      } else {
        Alert.alert('Lỗi đặt hàng', errorMsg);
      }
    }
  };

  if (items.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
        <Header title="Thanh toán" showBack={true} />
        <View style={styles.emptyContainer}>
          <Text style={{ fontSize: 44, marginBottom: 12 }}>🛍️</Text>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            Không có sản phẩm để thanh toán
          </Text>
          <Pressable
            onPress={() => router.replace('/(app)')}
            style={[styles.backShopBtn, { backgroundColor: colors.accent, borderRadius: borderRadius.button }]}
          >
            <Text style={styles.backShopBtnText}>Quay lại mua sắm</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <Header title="Thanh toán đơn hàng" showBack={true} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Khối 1: Form địa chỉ giao hàng */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.card,
              borderRadius: borderRadius.card,
              borderColor: colors.border,
            },
            shadowSm,
          ]}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>📍</Text>
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              Thông tin nhận hàng
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Họ và tên người nhận *</Text>
            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: colors.bg,
                  borderColor: colors.border,
                  color: colors.text,
                  borderRadius: borderRadius.input,
                },
              ]}
              placeholder="Ví dụ: Nguyễn Văn A"
              placeholderTextColor={colors.muted}
              value={customerName}
              onChangeText={setCustomerName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Số điện thoại liên hệ *</Text>
            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: colors.bg,
                  borderColor: colors.border,
                  color: colors.text,
                  borderRadius: borderRadius.input,
                },
              ]}
              placeholder="Ví dụ: 0901234567"
              placeholderTextColor={colors.muted}
              keyboardType="phone-pad"
              value={customerPhone}
              onChangeText={setCustomerPhone}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Địa chỉ giao hàng chi tiết *</Text>
            <TextInput
              style={[
                styles.textInput,
                styles.textArea,
                {
                  backgroundColor: colors.bg,
                  borderColor: colors.border,
                  color: colors.text,
                  borderRadius: borderRadius.input,
                },
              ]}
              placeholder="Số nhà, tên đường, phường/xã, quận/huyện..."
              placeholderTextColor={colors.muted}
              multiline
              numberOfLines={3}
              value={customerAddress}
              onChangeText={setCustomerAddress}
            />
          </View>
        </View>

        {/* Khối 2: Ô nhập Voucher */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.card,
              borderRadius: borderRadius.card,
              borderColor: colors.border,
            },
            shadowSm,
          ]}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>🎟️</Text>
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              Mã giảm giá LumiShop
            </Text>
          </View>

          <View style={styles.voucherInputRow}>
            <TextInput
              style={[
                styles.voucherInput,
                {
                  backgroundColor: colors.bg,
                  borderColor: colors.border,
                  color: colors.text,
                  borderRadius: borderRadius.input,
                },
              ]}
              placeholder="Nhập mã (GIAM20, FREESHIP)..."
              placeholderTextColor={colors.muted}
              autoCapitalize="characters"
              value={voucherCodeInput}
              onChangeText={setVoucherCodeInput}
              editable={!appliedVoucher}
            />

            {appliedVoucher ? (
              <Pressable
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Gỡ bỏ voucher"
                onPress={handleRemoveVoucher}
                style={[
                  styles.voucherBtn,
                  {
                    backgroundColor: colors.danger,
                    borderRadius: borderRadius.input,
                  },
                ]}
              >
                <Text style={styles.voucherBtnText}>Gỡ bỏ</Text>
              </Pressable>
            ) : (
              <Pressable
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Áp dụng mã"
                disabled={isCheckingVoucher}
                onPress={handleApplyVoucher}
                style={[
                  styles.voucherBtn,
                  {
                    backgroundColor: colors.accent,
                    borderRadius: borderRadius.input,
                    opacity: isCheckingVoucher ? 0.7 : 1,
                  },
                ]}
              >
                {isCheckingVoucher ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.voucherBtnText}>Áp dụng</Text>
                )}
              </Pressable>
            )}
          </View>

          {/* Chip hiển thị voucher đã áp dụng */}
          {appliedVoucher && (
            <View style={[styles.appliedChip, { backgroundColor: '#D1FAE5', borderColor: '#10B981', borderRadius: borderRadius.pill }]}>
              <Text style={styles.appliedChipText}>
                ✅ Đã áp dụng mã {appliedVoucher.code} (-{appliedVoucher.discount <= 100 ? `${appliedVoucher.discount}%` : formatCurrency(appliedVoucher.discount)})
              </Text>
              <Pressable onPress={handleRemoveVoucher} hitSlop={6}>
                <Text style={{ fontSize: 13, color: '#065F46', fontWeight: '800', marginLeft: 8 }}>✕</Text>
              </Pressable>
            </View>
          )}

          {/* Thông báo voucher */}
          {voucherMessage && (
            <Text
              style={[
                styles.voucherMessage,
                { color: voucherMessage.isError ? colors.danger : colors.success },
              ]}
            >
              {voucherMessage.text}
            </Text>
          )}

          {/* Gợi ý 5 mã có sẵn trong db.json */}
          <View style={styles.suggestionsBox}>
            <Text style={[styles.suggestionLabel, { color: colors.muted }]}>Mã có sẵn:</Text>
            {['GIAM10', 'GIAM20', 'FREESHIP', 'VIP50', 'SALE30'].map((code) => (
              <Pressable
                key={code}
                onPress={() => {
                  setVoucherCodeInput(code);
                  setVoucherMessage(null);
                }}
                style={[
                  styles.suggestionChip,
                  {
                    backgroundColor: colors.accentLight,
                    borderColor: colors.accent,
                    borderRadius: borderRadius.pill,
                  },
                ]}
              >
                <Text style={[styles.suggestionText, { color: colors.accent }]}>{code}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Khối 3: Tổng kết đơn hàng */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.card,
              borderRadius: borderRadius.card,
              borderColor: colors.border,
            },
            shadowSm,
          ]}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>📦</Text>
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              Tóm tắt đơn hàng ({items.length} món)
            </Text>
          </View>

          {items.map((item) => (
            <View key={item.id} style={styles.orderItemRow}>
              <Text numberOfLines={1} style={[styles.orderItemName, { color: colors.text }]}>
                {item.quantity}x {item.product.name}
              </Text>
              <Text style={[styles.orderItemPrice, { color: colors.text }]}>
                {formatCurrency(item.product.price * item.quantity)}
              </Text>
            </View>
          ))}

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.calcRow}>
            <Text style={[styles.calcLabel, { color: colors.muted }]}>Tạm tính tiền hàng:</Text>
            <Text style={[styles.calcVal, { color: colors.text }]}>{formatCurrency(subtotal)}</Text>
          </View>

          <View style={styles.calcRow}>
            <Text style={[styles.calcLabel, { color: colors.muted }]}>Giảm giá voucher:</Text>
            <Text style={[styles.calcVal, { color: colors.success }]}>
              -{formatCurrency(discountAmount)}
            </Text>
          </View>

          <View style={styles.calcRow}>
            <Text style={[styles.calcLabel, { color: colors.muted }]}>Phí vận chuyển:</Text>
            <Text style={[styles.calcVal, { color: colors.text }]}>Miễn phí (0đ)</Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.calcRow}>
            <Text style={[styles.totalLabel, { color: colors.text }]}>Tổng thanh toán:</Text>
            <Text style={[styles.totalAmount, { color: colors.accent }]}>
              {formatCurrency(total)}
            </Text>
          </View>
        </View>

        {/* Nút Đặt hàng to, bo tròn 24 */}
        <Pressable
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Xác nhận đặt hàng"
          disabled={isCreatingOrder}
          onPress={handlePlaceOrder}
          style={({ pressed }) => [
            styles.submitOrderBtn,
            {
              backgroundColor: colors.accent,
              borderRadius: borderRadius.button,
              transform: [{ scale: pressed ? 0.98 : 1 }],
              opacity: isCreatingOrder ? 0.75 : 1,
            },
            shadow,
          ]}
        >
          {isCreatingOrder ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitOrderBtnText}>
              ✅ Đặt Hàng Ngay ({formatCurrency(total)})
            </Text>
          )}
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
  card: {
    borderWidth: 1,
    padding: 18,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  cardIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
  },
  textInput: {
    borderWidth: 1,
    paddingHorizontal: 14,
    height: 48,
    fontSize: 14,
  },
  textArea: {
    height: 80,
    paddingTop: 10,
    textAlignVertical: 'top',
  },
  voucherInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  voucherInput: {
    flex: 1,
    borderWidth: 1,
    paddingHorizontal: 14,
    height: 48,
    fontSize: 14,
    fontWeight: '700',
  },
  voucherBtn: {
    minWidth: 90,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  voucherBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  appliedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    marginTop: 10,
  },
  appliedChipText: {
    color: '#065F46',
    fontSize: 12,
    fontWeight: '700',
  },
  voucherMessage: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 6,
  },
  suggestionsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    flexWrap: 'wrap',
  },
  suggestionLabel: {
    fontSize: 12,
  },
  suggestionChip: {
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  suggestionText: {
    fontSize: 11,
    fontWeight: '800',
  },
  orderItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  orderItemName: {
    flex: 1,
    fontSize: 13,
    marginRight: 10,
  },
  orderItemPrice: {
    fontSize: 13,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  calcRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  calcLabel: {
    fontSize: 13,
  },
  calcVal: {
    fontSize: 14,
    fontWeight: '700',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '800',
  },
  totalAmount: {
    fontSize: 22,
    fontWeight: '900',
  },
  submitOrderBtn: {
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    marginBottom: 20,
  },
  submitOrderBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 16,
  },
  backShopBtn: {
    paddingHorizontal: 22,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backShopBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
