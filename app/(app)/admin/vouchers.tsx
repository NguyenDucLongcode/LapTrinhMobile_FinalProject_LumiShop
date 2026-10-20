// app/(app)/admin/vouchers.tsx
// Quản lý Voucher LumiShop: Xem voucher có sẵn, Thêm mã mới và Xóa voucher với giao diện bo tròn mềm mại

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  Pressable,
  Modal,
  ScrollView,
  SafeAreaView,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Redirect } from 'expo-router';
import { useTheme } from '../../../theme/useTheme';
import { Header } from '../../../components/Header';
import { formatCurrency } from '../../../utils/calculateTotal';
import {
  useVouchers,
  useCreateVoucher,
  useDeleteVoucher,
} from '../../../hooks/useVouchersQuery';
import { Voucher } from '../../../types';
import { useAuthStore } from '../../../store/authStore';

export default function AdminVouchersScreen() {
  const { colors, borderRadius, shadow, shadowSm } = useTheme();
  const { user } = useAuthStore();

  const { vouchers, isLoading } = useVouchers();
  const createVoucherMutation = useCreateVoucher();
  const deleteVoucherMutation = useDeleteVoucher();

  const [modalVisible, setModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form input
  const [code, setCode] = useState('');
  const [discount, setDiscount] = useState('');
  const [minOrder, setMinOrder] = useState('200000');

  // Bảo vệ phân quyền: chỉ admin mới được vào
  if (!user || user.role !== 'admin') {
    return <Redirect href="/(app)" />;
  }

  const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const resetForm = () => {
    setCode('');
    setDiscount('');
    setMinOrder('200000');
    setModalVisible(false);
  };

  const handleCreateVoucher = async () => {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      showAlert('Lỗi', 'Vui lòng nhập mã voucher!');
      return;
    }
    const numDiscount = Number(discount);
    if (!numDiscount || numDiscount <= 0) {
      showAlert('Lỗi', 'Vui lòng nhập mức giảm giá hợp lệ!');
      return;
    }
    // Validate minOrder: không âm
    const numMinOrder = parseInt(minOrder, 10);
    if (isNaN(numMinOrder) || numMinOrder < 0) {
      showAlert('Lỗi', 'Đơn tối thiểu phải là số không âm!');
      return;
    }
    // Kiểm tra trùng mã voucher
    const isDuplicate = vouchers.some((v) => v.code.toUpperCase() === cleanCode);
    if (isDuplicate) {
      showAlert('Lỗi', `Mã voucher "${cleanCode}" đã tồn tại! Vui lòng dùng mã khác.`);
      return;
    }

    setIsSubmitting(true);
    const newVoucher: Voucher = {
      id: String(Date.now()),
      code: cleanCode,
      discount: numDiscount,
      status: 'active',
      minOrderAmount: numMinOrder,
    };

    try {
      await createVoucherMutation.mutateAsync(newVoucher);
      showAlert('Thành công', `Đã thêm voucher "${cleanCode}"!`);
    } catch (e: any) {
      console.warn('Lỗi gọi API thêm voucher:', e);
      showAlert('Lỗi', `Không thể thêm voucher!\n${e?.message || ''}`);
    } finally {
      setIsSubmitting(false);
      resetForm();
    }
  };

  const handleDeleteVoucher = (voucherId: string, voucherCode: string) => {
    const doDelete = async () => {
      try {
        await deleteVoucherMutation.mutateAsync(voucherId);
      } catch (e: any) {
        console.warn('Lỗi gọi API xóa voucher:', e);
        showAlert('Lỗi', 'Không thể xóa voucher do JSON Server offline!');
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm(`Bạn có chắc muốn xóa mã giảm giá "${voucherCode}"?`)) {
        doDelete();
      }
    } else {
      Alert.alert('Xác nhận xóa', `Bạn có chắc muốn xóa voucher "${voucherCode}"?`, [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Xóa', style: 'destructive', onPress: doDelete },
      ]);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <Header
        title="Voucher LumiShop"
        showBack={true}
        showCart={false}
        rightAction={
          <Pressable
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Thêm voucher mới"
            onPress={() => setModalVisible(true)}
            style={[
              styles.topAddBtn,
              {
                backgroundColor: colors.accent,
                borderRadius: borderRadius.pill,
              },
            ]}
          >
            <Text style={styles.topAddText}>+ Tạo mã</Text>
          </Pressable>
        }
      />

      {isLoading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={[styles.loadingText, { color: colors.muted }]}>
            Đang tải danh sách voucher...
          </Text>
        </View>
      ) : (
        <FlatList
          data={vouchers}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View
              style={[
                styles.voucherCard,
                {
                  backgroundColor: colors.card,
                  borderRadius: borderRadius.card,
                  borderColor: colors.border,
                },
                shadowSm,
              ]}
            >
              <View style={styles.voucherLeft}>
                <View
                  style={[
                    styles.codeBadge,
                    {
                      backgroundColor: colors.accentLight,
                      borderColor: colors.accent,
                      borderRadius: borderRadius.pill,
                    },
                  ]}
                >
                  <Text style={[styles.codeText, { color: colors.accent }]}>
                    {item.code}
                  </Text>
                </View>

                <View style={styles.voucherInfo}>
                  <Text style={[styles.discountText, { color: colors.text }]}>
                    Giảm {item.discount <= 100 ? `${item.discount}%` : formatCurrency(item.discount)}
                  </Text>
                  <Text style={[styles.conditionText, { color: colors.muted }]}>
                    Đơn tối thiểu: {item.minOrderAmount ? formatCurrency(item.minOrderAmount) : '0đ'}
                  </Text>
                  <Text style={[styles.statusTag, { color: item.status === 'active' ? colors.success : colors.danger }]}>
                    ● {item.status === 'active' ? 'Đang hoạt động' : 'Hết hạn'}
                  </Text>
                </View>
              </View>

              <Pressable
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={`Xóa mã ${item.code}`}
                onPress={() => handleDeleteVoucher(item.id, item.code)}
                style={({ pressed }) => [
                  styles.deleteCircleBtn,
                  {
                    backgroundColor: '#FEE2E2',
                    transform: [{ scale: pressed ? 0.9 : 1 }],
                  },
                ]}
              >
                <Text style={{ fontSize: 16 }}>🗑️</Text>
              </Pressable>
            </View>
          )}
        />
      )}

      {/* Modal Tạo Voucher Mới */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalCard,
              {
                backgroundColor: colors.card,
                borderRadius: borderRadius.card,
                borderColor: colors.border,
              },
              shadow,
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Tạo Voucher Mới</Text>
              <Pressable onPress={resetForm} style={styles.closeBtn}>
                <Text style={{ fontSize: 18, color: colors.muted }}>✕</Text>
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.formScroll}>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Mã Voucher (In hoa) *</Text>
                <TextInput
                  style={[styles.modalInput, { backgroundColor: colors.bg, borderColor: colors.border, color: colors.text, borderRadius: borderRadius.input }]}
                  placeholder="Ví dụ: SALE50, LUMI2026..."
                  placeholderTextColor={colors.muted}
                  autoCapitalize="characters"
                  value={code}
                  onChangeText={setCode}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Mức giảm giá *</Text>
                <TextInput
                  style={[styles.modalInput, { backgroundColor: colors.bg, borderColor: colors.border, color: colors.text, borderRadius: borderRadius.input }]}
                  placeholder="20 (nếu giảm 20%) hoặc 50000 (nếu giảm 50k)..."
                  placeholderTextColor={colors.muted}
                  keyboardType="numeric"
                  value={discount}
                  onChangeText={setDiscount}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Đơn hàng tối thiểu (VNĐ)</Text>
                <TextInput
                  style={[styles.modalInput, { backgroundColor: colors.bg, borderColor: colors.border, color: colors.text, borderRadius: borderRadius.input }]}
                  placeholder="Ví dụ: 150000"
                  placeholderTextColor={colors.muted}
                  keyboardType="numeric"
                  value={minOrder}
                  onChangeText={setMinOrder}
                />
              </View>

              <Pressable
                onPress={handleCreateVoucher}
                disabled={isSubmitting}
                style={[
                  styles.saveBtn,
                  {
                    backgroundColor: colors.accent,
                    borderRadius: borderRadius.button,
                    opacity: isSubmitting ? 0.7 : 1,
                  },
                ]}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveBtnText}>Tạo Voucher Ngay</Text>
                )}
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topAddBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  topAddText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  voucherCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  voucherLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  codeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeText: {
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  voucherInfo: {
    flex: 1,
  },
  discountText: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 2,
  },
  conditionText: {
    fontSize: 12,
    marginBottom: 4,
  },
  statusTag: {
    fontSize: 11,
    fontWeight: '700',
  },
  deleteCircleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 460,
    borderWidth: 1,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  closeBtn: {
    padding: 6,
  },
  formScroll: {
    paddingBottom: 10,
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  modalInput: {
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 46,
    fontSize: 14,
  },
  saveBtn: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
