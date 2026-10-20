// app/(app)/admin/products.tsx
// Quản lý Sản phẩm LumiShop: Danh sách sản phẩm bo góc 14, Nút Thêm mới bo tròn 24 và Modal nhập liệu hiện đại

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
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import {
  useCreateProduct,
  useDeleteProduct,
  useUpdateProduct,
  useProducts,
} from '../../../hooks/useProductsQuery';
import { useCategories } from '../../../hooks/useCategoriesQuery';
import { useTheme } from '../../../theme/useTheme';
import { Header } from '../../../components/Header';
import { formatCurrency } from '../../../utils/calculateTotal';

export default function AdminProductsScreen() {
  const { colors, borderRadius, shadow, shadowSm } = useTheme();
  const { data: products = [], isLoading } = useProducts();
  const { data: categories = [] } = useCategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState('2');
  const [stock, setStock] = useState('20');
  const [image, setImage] = useState(
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=80'
  );
  const [description, setDescription] = useState('');

  const isSubmitting = createProduct.isPending || updateProduct.isPending;

  const resetForm = () => {
    setName('');
    setPrice('');
    setCategoryId(categories[0]?.id ?? '2');
    setStock('20');
    setDescription('');
    setImage('https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=80');
    setEditingProductId(null);
    setModalVisible(false);
  };

  const openEditProduct = (product: (typeof products)[number]) => {
    setEditingProductId(product.id);
    setName(product.name);
    setPrice(String(product.price));
    setCategoryId(product.categoryId);
    setStock(String(product.stock));
    setImage(product.image);
    setDescription(product.description);
    setModalVisible(true);
  };

  const pickImage = async () => {
    try {
      if (Platform.OS !== 'web') {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
          Alert.alert('Cần quyền truy cập', 'Vui lòng cấp quyền thư viện ảnh để chọn ảnh sản phẩm.');
          return;
        }
      }
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [4, 3], quality: 0.8, base64: true });
      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setImage(asset.base64 ? `data:${asset.mimeType ?? 'image/jpeg'};base64,${asset.base64}` : asset.uri);
      }
    } catch (error) {
      Alert.alert('Lỗi', error instanceof Error ? error.message : 'Không thể mở thư viện ảnh.');
    }
  };

  const handleCreateProduct = async () => {
    if (!name.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên sản phẩm!');
      return;
    }
    const numPrice = Number(price);
    if (!numPrice || numPrice <= 0) {
      Alert.alert('Lỗi', 'Vui lòng nhập giá hợp lệ (> 0)!');
      return;
    }

    try {
      const payload = {
        name: name.trim(),
        price: numPrice,
        categoryId,
        stock: Number(stock) || 10,
        image: image.trim(),
        description: description.trim() || 'Sản phẩm mới thêm tại LumiShop',
        rating: editingProductId ? products.find((product) => product.id === editingProductId)?.rating ?? 5 : 5,
      };
      if (editingProductId) await updateProduct.mutateAsync({ id: editingProductId, data: payload });
      else await createProduct.mutateAsync(payload);
      resetForm();
      if (Platform.OS === 'web') {
        alert('Đã thêm sản phẩm mới thành công vào LumiShop!');
      } else {
        Alert.alert('Thành công', 'Đã thêm sản phẩm mới vào LumiShop!');
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Không thể thêm sản phẩm!';
      Alert.alert('Lỗi', msg);
    }
  };

  const handleDeleteProduct = (productId: string, productName: string) => {
    const doDelete = async () => {
      try {
        await deleteProduct.mutateAsync(productId);
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Không thể xóa sản phẩm!';
        Alert.alert('Lỗi', msg);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm(`Bạn có chắc muốn xóa "${productName}"?`)) {
        doDelete();
      }
    } else {
      Alert.alert('Xác nhận xóa', `Bạn có chắc muốn xóa "${productName}"?`, [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Xóa', style: 'destructive', onPress: doDelete },
      ]);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <Header
        title="Sản phẩm LumiShop"
        showBack={true}
        showCart={false}
        rightAction={
          <Pressable
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Thêm sản phẩm"
            onPress={() => { resetForm(); setModalVisible(true); }}
            style={[
              styles.topAddBtn,
              {
                backgroundColor: colors.accent,
                borderRadius: borderRadius.pill,
              },
            ]}
          >
            <Text style={styles.topAddText}>+ Thêm mới</Text>
          </Pressable>
        }
      />

      {isLoading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={[styles.loadingText, { color: colors.muted }]}>
            Đang tải danh sách sản phẩm...
          </Text>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View
              style={[
                styles.itemRow,
                {
                  backgroundColor: colors.card,
                  borderRadius: borderRadius.card,
                  borderColor: colors.border,
                },
                shadowSm,
              ]}
            >
              <Image
                source={{ uri: item.image }}
                style={[styles.thumbImage, { borderRadius: borderRadius.input }]}
                contentFit="cover"
                transition={200}
              />

              <View style={styles.itemDetails}>
                <Text numberOfLines={1} style={[styles.prodName, { color: colors.text }]}>
                  {item.name}
                </Text>
                <Text style={[styles.prodPrice, { color: colors.accent }]}>
                  {formatCurrency(item.price)}
                </Text>
                <Text style={[styles.prodMeta, { color: colors.muted }]}>
                  Kho: {item.stock} • Loại: {categories.find((c) => c.id === item.categoryId)?.name ?? item.categoryId} • ⭐ {item.rating ?? 5.0}
                </Text>
              </View>

              <Pressable accessibilityRole="button" accessibilityLabel={`Sửa ${item.name}`} onPress={() => openEditProduct(item)} style={styles.editCircleBtn}>
                <Ionicons name="pencil" size={17} color="#2563EB" />
              </Pressable>

              <Pressable
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={`Xóa ${item.name}`}
                onPress={() => handleDeleteProduct(item.id, item.name)}
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

      {/* Modal Thêm sản phẩm mới */}
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
              <Text style={[styles.modalTitle, { color: colors.text }]}>{editingProductId ? 'Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới'}</Text>
              <Pressable onPress={resetForm} style={styles.closeBtn}>
                <Text style={{ fontSize: 18, color: colors.muted }}>✕</Text>
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.formScroll}>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Ảnh sản phẩm</Text>
                {image ? <Image source={{ uri: image }} style={styles.imagePreview} contentFit="cover" /> : null}
                <Pressable onPress={pickImage} style={[styles.pickImageBtn, { borderColor: colors.border, backgroundColor: colors.bg }]}>
                  <Ionicons name="image-outline" size={18} color={colors.accent} />
                  <Text style={{ color: colors.accent, fontWeight: '700' }}>Chọn ảnh</Text>
                </Pressable>
              </View>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Tên sản phẩm *</Text>
                <TextInput
                  style={[styles.modalInput, { backgroundColor: colors.bg, borderColor: colors.border, color: colors.text, borderRadius: borderRadius.input }]}
                  placeholder="Ví dụ: Tai nghe Sony..."
                  placeholderTextColor={colors.muted}
                  value={name}
                  onChangeText={setName}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Giá bán (VNĐ) *</Text>
                <TextInput
                  style={[styles.modalInput, { backgroundColor: colors.bg, borderColor: colors.border, color: colors.text, borderRadius: borderRadius.input }]}
                  placeholder="Ví dụ: 1500000"
                  placeholderTextColor={colors.muted}
                  keyboardType="numeric"
                  value={price}
                  onChangeText={setPrice}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Số lượng tồn kho</Text>
                <TextInput
                  style={[styles.modalInput, { backgroundColor: colors.bg, borderColor: colors.border, color: colors.text, borderRadius: borderRadius.input }]}
                  placeholder="20"
                  placeholderTextColor={colors.muted}
                  keyboardType="numeric"
                  value={stock}
                  onChangeText={setStock}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Danh mục</Text>
                <View style={styles.categoryPicksRow}>
                  {categories.map((cat) => (
                    <Pressable
                      key={cat.id}
                      onPress={() => setCategoryId(cat.id)}
                      style={[
                        styles.catChoiceBtn,
                        {
                          backgroundColor: categoryId === cat.id ? colors.accent : colors.bg,
                          borderColor: colors.border,
                          borderRadius: borderRadius.pill,
                        },
                      ]}
                    >
                      <Text style={{ color: categoryId === cat.id ? '#FFFFFF' : colors.text, fontSize: 12, fontWeight: '700' }}>
                        {cat.name}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Mô tả chi tiết</Text>
                <TextInput
                  style={[styles.modalInput, styles.textArea, { backgroundColor: colors.bg, borderColor: colors.border, color: colors.text, borderRadius: borderRadius.input }]}
                  placeholder="Nhập mô tả sản phẩm..."
                  placeholderTextColor={colors.muted}
                  multiline
                  numberOfLines={3}
                  value={description}
                  onChangeText={setDescription}
                />
              </View>

              <Pressable
                onPress={handleCreateProduct}
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
                  <Text style={styles.saveBtnText}>{editingProductId ? 'Lưu Thay Đổi' : 'Lưu Sản Phẩm'}</Text>
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
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  thumbImage: {
    width: 60,
    height: 60,
    backgroundColor: '#F1F5F9',
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
  },
  prodName: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  prodPrice: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 2,
  },
  prodMeta: {
    fontSize: 11,
  },
  deleteCircleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editCircleBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: '#DBEAFE', marginRight: 8 },
  imagePreview: { width: 110, height: 82, borderRadius: 10, marginBottom: 8, backgroundColor: '#F1F5F9' },
  pickImageBtn: { minHeight: 42, borderWidth: 1, borderRadius: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
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
    maxWidth: 480,
    borderWidth: 1,
    padding: 20,
    maxHeight: '90%',
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
  textArea: {
    height: 70,
    paddingTop: 8,
    textAlignVertical: 'top',
  },
  categoryPicksRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  catChoiceBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
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
