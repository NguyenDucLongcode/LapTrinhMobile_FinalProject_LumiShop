// app/(app)/admin/vouchers.tsx
// Quản lý Voucher LumiShop: Xem 5 voucher có sẵn, Thêm mã mới và Xóa voucher với giao diện bo tròn mềm mại

import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
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
import { useTheme } from '../../../theme/useTheme';
import { Header } from '../../../components/Header';
import { formatCurrency } from '../../../utils/calculateTotal';
import {
  useCreateVoucher,
  useDeleteVoucher,
  useUpdateVoucher,
  useVouchers,
} from '../../../hooks/useVouchersQuery';

export default function AdminVouchersScreen() {
  const { colors, borderRadius, shadow, shadowSm } = useTheme();
  const { data: vouchers = [], isLoading } = useVouchers();
  const createVoucher = useCreateVoucher();
  const deleteVoucher = useDeleteVoucher();
  const updateVoucher = useUpdateVoucher();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingVoucherId, setEditingVoucherId] = useState<string | null>(null);
  const [status, setStatus] = useState<'active' | 'inactive' | 'expired'>('active');
  const [code, setCode] = useState('');
  const [discount, setDiscount] = useState('');
  const [minOrder, setMinOrder] = useState('200000');

  const isSubmitting = createVoucher.isPending || updateVoucher.isPending;

  const resetForm = () => {
    setCode('');
    setDiscount('');
    setMinOrder('200000');
    setEditingVoucherId(null);
    setStatus('active');
    setModalVisible(false);
  };

  const openEditVoucher = (voucher: (typeof vouchers)[number]) => {
    setEditingVoucherId(voucher.id);
    setCode(voucher.code);
    setDiscount(String(voucher.discountPercent));
    setMinOrder(String(voucher.minOrderValue));
    setStatus(voucher.status);
    setModalVisible(true);
  };

  const handleCreateVoucher = async () => {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      Alert.alert('Lỗi', 'Vui lòng nhập mã voucher!');
      return;
    }
    const numDiscount = Number(discount);
    if (!numDiscount || numDiscount <= 0 || numDiscount > 100) {
      Alert.alert('Lỗi', 'Vui lòng nhập phần trăm giảm giá từ 1 đến 100!');
      return;
    }

    try {
      const payload = {
        code: cleanCode,
        discountPercent: numDiscount,
        minOrderValue: Number(minOrder) || 0,
        status,
        expiresAt: editingVoucherId ? vouchers.find((voucher) => voucher.id === editingVoucherId)?.expiresAt : '2027-12-31T23:59:59.000Z',
      };
      if (editingVoucherId) await updateVoucher.mutateAsync({ id: editingVoucherId, data: payload });
      else await createVoucher.mutateAsync(payload);
      resetForm();
      if (Platform.OS === 'web') {
        alert(`Đã thêm thành công voucher "${cleanCode}"!`);
      } else {
        Alert.alert('Thành công', `Đã thêm voucher "${cleanCode}"!`);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Không thể tạo voucher!';
      Alert.alert('Lỗi', msg);
    }
  };

  const handleDeleteVoucher = (voucherId: string, voucherCode: string) => {
    const doDelete = async () => {
      try {
        await deleteVoucher.mutateAsync(voucherId);
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Không thể xóa voucher!';
        Alert.alert('Lỗi', msg);
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
                    Giảm {item.discountPercent}%
                  </Text>
                  <Text style={[styles.conditionText, { color: colors.muted }]}>
                    Đơn tối thiểu: {item.minOrderValue ? formatCurrency(item.minOrderValue) : '0đ'}
                  </Text>
                  <Text style={[styles.statusTag, { color: item.status === 'active' ? colors.success : colors.danger }]}>
                    ● {item.status === 'active' ? 'Đang hoạt động' : 'Hết hạn'}
                  </Text>
                </View>
              </View>
              <Pressable accessibilityRole="button" accessibilityLabel={`Sửa mã ${item.code}`} onPress={() => openEditVoucher(item)} style={styles.editCircleBtn}>
                <Ionicons name="pencil" size={17} color="#2563EB" />
              </Pressable>

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
              <Text style={[styles.modalTitle, { color: colors.text }]}>{editingVoucherId ? 'Sửa Voucher' : 'Tạo Voucher Mới'}</Text>
              <Pressable onPress={resetForm} style={styles.closeBtn}>
                <Text style={{ fontSize: 18, color: colors.muted }}>✕</Text>
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.formScroll}>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Trạng thái</Text>
                <View style={styles.statusPicksRow}>
                  {(['active', 'inactive', 'expired'] as const).map((value) => (
                    <Pressable key={value} onPress={() => setStatus(value)} style={[styles.statusChoice, { backgroundColor: status === value ? colors.accent : colors.bg, borderColor: colors.border }]}>
                      <Text style={{ color: status === value ? '#FFF' : colors.text, fontWeight: '700' }}>{value === 'active' ? 'Hoạt động' : value === 'inactive' ? 'Tạm dừng' : 'Hết hạn'}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
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
                  placeholder="20 (giảm 20%)..."
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
                  <Text style={styles.saveBtnText}>{editingVoucherId ? 'Lưu Thay Đổi' : 'Tạo Voucher Ngay'}</Text>
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
  editCircleBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: '#DBEAFE', marginRight: 8 },
  statusChoice: { paddingHorizontal: 10, paddingVertical: 8, borderWidth: 1, borderRadius: 18 },
  statusPicksRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
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
