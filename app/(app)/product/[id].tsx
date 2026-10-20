// app/(app)/product/[id].tsx
// Chi tiết sản phẩm LumiShop: Ảnh tràn viền bo góc dưới, Nút Back tròn mờ, Rating sao vàng, Bottom bar 70% nút mua

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  SafeAreaView,
  Alert,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useProduct } from '../../../hooks/useProduct';
import { useCartStore } from '../../../store/cartStore';
import { useTheme } from '../../../theme/useTheme';
import { formatCurrency } from '../../../utils/calculateTotal';

export default function ProductDetailScreen() {
  const router = useRouter();
  const { colors, borderRadius, shadow } = useTheme();
  const params = useLocalSearchParams<{ id: string }>();
  const id = typeof params.id === 'string' ? params.id : '';

  const { product, isLoading, isError, error, refetch } = useProduct(id);
  const addItem = useCartStore((state) => state.addItem);
  const totalCartItems = useCartStore((state) => state.getTotalItems());

  const [quantity, setQuantity] = useState(1);

  const increaseQuantity = () => {
    if (product?.stock && quantity >= product.stock) {
      return;
    }
    setQuantity((prev) => prev + 1);
  };

  const decreaseQuantity = () => {
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  };

  const handleAddToCart = () => {
    if (!product) return;
    if ((product.stock ?? 1) <= 0) {
      if (Platform.OS === 'web') {
        alert('Sản phẩm này đã tạm hết hàng!');
      } else {
        Alert.alert('Hết hàng', 'Sản phẩm này tạm hết hàng, không thể thêm vào giỏ!');
      }
      return;
    }
    addItem(product, quantity);

    if (Platform.OS === 'web') {
      alert(`Đã thêm ${quantity} x "${product.name}" vào giỏ hàng LumiShop!`);
    } else {
      Alert.alert(
        'Thành công',
        `Đã thêm ${quantity} x "${product.name}" vào giỏ hàng!`,
        [
          { text: 'Tiếp tục xem', style: 'cancel' },
          {
            text: 'Đến giỏ hàng',
            onPress: () => router.push('/(app)/cart'),
          },
        ]
      );
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={[styles.loadingText, { color: colors.muted }]}>
            Đang tải thông tin sản phẩm...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isError || !product) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
        <View style={styles.centerBox}>
          <Text style={{ fontSize: 44, marginBottom: 12 }}>❌</Text>
          <Text style={[styles.errorTitle, { color: colors.danger }]}>
            Không tìm thấy sản phẩm
          </Text>
          <Text style={[styles.errorDesc, { color: colors.muted }]}>
            {error?.message || 'Sản phẩm này có thể đã bị xóa hoặc không tồn tại.'}
          </Text>
          <Pressable
            onPress={() => refetch()}
            style={[styles.retryBtn, { backgroundColor: colors.accent, borderRadius: borderRadius.button }]}
          >
            <Text style={styles.retryBtnText}>Thử lại</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Ảnh tràn viền trên cùng với bo góc dưới 28 */}
        <View style={styles.imageWrapper}>
          <Image
            source={{ uri: product.image }}
            style={styles.heroImage}
            contentFit="cover"
            transition={300}
          />

          {/* Nút Back hình tròn nền mờ ở góc trên trái */}
          <Pressable
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Quay lại danh sách"
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.floatingBackBtn,
              {
                backgroundColor: 'rgba(255, 255, 255, 0.88)',
                transform: [{ scale: pressed ? 0.9 : 1 }],
              },
            ]}
          >
            <Text style={styles.backIcon}>←</Text>
          </Pressable>

          {/* Nút Giỏ hàng hình tròn góc trên phải */}
          <Pressable
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Mở giỏ hàng"
            onPress={() => router.push('/(app)/cart')}
            style={({ pressed }) => [
              styles.floatingCartBtn,
              {
                backgroundColor: 'rgba(255, 255, 255, 0.88)',
                transform: [{ scale: pressed ? 0.9 : 1 }],
              },
            ]}
          >
            <Text style={{ fontSize: 18 }}>🛍️</Text>
            {totalCartItems > 0 && (
              <View style={[styles.cartBadge, { backgroundColor: colors.danger }]}>
                <Text style={styles.cartBadgeText}>
                  {totalCartItems > 99 ? '99+' : totalCartItems}
                </Text>
              </View>
            )}
          </Pressable>
        </View>

        {/* Khối thông tin chi tiết */}
        <View style={[styles.infoCard, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
          {/* Tag danh mục & Trạng thái tồn kho */}
          <View style={styles.badgeRow}>
            <View style={[styles.categoryPill, { backgroundColor: colors.accentLight }]}>
              <Text style={[styles.categoryPillText, { color: colors.accent }]}>
                {product.category?.toUpperCase() || 'LUMI'}
              </Text>
            </View>

            <View style={styles.stockStatus}>
              <Text style={{ fontSize: 10, color: product.stock > 0 ? colors.success : colors.danger }}>●</Text>
              <Text style={[styles.stockStatusText, { color: product.stock > 0 ? colors.success : colors.danger }]}>
                {product.stock > 0 ? `Còn hàng (${product.stock})` : 'Tạm hết'}
              </Text>
            </View>
          </View>

          {/* Tên sản phẩm lớn bold */}
          <Text style={[styles.productName, { color: colors.text }]}>
            {product.name}
          </Text>

          {/* Rating sao vàng + Đã bán */}
          <View style={styles.ratingSection}>
            <View style={styles.starsBox}>
              <Text style={styles.starYellow}>⭐⭐⭐⭐⭐</Text>
              <Text style={[styles.ratingScore, { color: colors.text }]}>
                {product.rating ? product.rating.toFixed(1) : '5.0'}
              </Text>
            </View>
            <Text style={{ color: colors.muted, marginHorizontal: 8 }}>|</Text>
            <Text style={[styles.soldCount, { color: colors.muted }]}>
              Đã bán {product.stock !== undefined ? Math.max(0, 100 - product.stock) : 0}+
            </Text>
          </View>

          {/* Giá tiền lớn nổi bật */}
          <Text style={[styles.productPrice, { color: colors.accent }]}>
            {formatCurrency(product.price)}
          </Text>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* Tiêu đề & Mô tả sản phẩm */}
          <Text style={[styles.sectionHeading, { color: colors.text }]}>
            Mô tả sản phẩm
          </Text>
          <Text style={[styles.descriptionText, { color: colors.muted }]}>
            {product.description}
          </Text>

          {/* Điểm nổi bật cam kết */}
          <View style={[styles.featuresBox, { backgroundColor: colors.bg, borderRadius: borderRadius.card }]}>
            <View style={styles.featureItem}>
              <Text style={styles.featureEmoji}>🚚</Text>
              <Text style={[styles.featureText, { color: colors.text }]}>Giao hàng nhanh toàn quốc</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureEmoji}>🛡️</Text>
              <Text style={[styles.featureText, { color: colors.text }]}>Bảo hành chính hãng 12 tháng</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureEmoji}>🔄</Text>
              <Text style={[styles.featureText, { color: colors.text }]}>Đổi trả trong 7 ngày</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Bar cố định ở dưới cùng: Bộ chọn số lượng (trái) + Nút Thêm vào giỏ 70% (phải) */}
      <View
        style={[
          styles.bottomBar,
          {
            backgroundColor: colors.card,
            borderTopColor: colors.border,
          },
          shadow,
        ]}
      >
        {/* Bộ chọn số lượng (- 1 +) */}
        <View style={[styles.quantityBox, { backgroundColor: colors.bg, borderRadius: borderRadius.input }]}>
          <Pressable
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Giảm số lượng"
            onPress={decreaseQuantity}
            style={styles.qtyControlBtn}
          >
            <Text style={[styles.qtyControlText, { color: colors.text }]}>-</Text>
          </Pressable>
          <Text style={[styles.qtyValue, { color: colors.text }]}>{quantity}</Text>
          <Pressable
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Tăng số lượng"
            onPress={increaseQuantity}
            style={styles.qtyControlBtn}
          >
            <Text style={[styles.qtyControlText, { color: colors.text }]}>+</Text>
          </Pressable>
        </View>

        {/* Nút Thêm vào giỏ chiếm 70% chiều rộng */}
        <Pressable
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={product.stock <= 0 ? 'Sản phẩm hết hàng' : 'Thêm vào giỏ hàng'}
          disabled={product.stock <= 0}
          onPress={handleAddToCart}
          style={({ pressed }) => [
            styles.addToCartBtn,
            {
              backgroundColor: product.stock <= 0 ? colors.muted : colors.accent,
              borderRadius: borderRadius.button,
              transform: [{ scale: pressed && product.stock > 0 ? 0.98 : 1 }],
              opacity: product.stock <= 0 ? 0.6 : 1,
            },
            shadow,
          ]}
        >
          <Text style={styles.addToCartText}>
            {product.stock <= 0
              ? '🚫 Tạm hết hàng'
              : `🛍️ Thêm vào giỏ (${formatCurrency(product.price * quantity)})`}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 110,
  },
  imageWrapper: {
    width: '100%',
    height: 380,
    position: 'relative',
    backgroundColor: '#F1F5F9',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  floatingBackBtn: {
    position: 'absolute',
    top: 48,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  backIcon: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  floatingCartBtn: {
    position: 'absolute',
    top: 48,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  cartBadge: {
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
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  infoCard: {
    padding: 22,
    marginTop: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryPill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
  },
  categoryPillText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  stockStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stockStatusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  productName: {
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 28,
    marginBottom: 10,
  },
  ratingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  starsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  starYellow: {
    fontSize: 12,
  },
  ratingScore: {
    fontSize: 13,
    fontWeight: '800',
  },
  soldCount: {
    fontSize: 13,
  },
  productPrice: {
    fontSize: 26,
    fontWeight: '900',
    marginBottom: 16,
  },
  divider: {
    height: 1,
    marginVertical: 16,
  },
  sectionHeading: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 24,
    marginBottom: 20,
  },
  featuresBox: {
    padding: 16,
    gap: 10,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  featureEmoji: {
    fontSize: 18,
  },
  featureText: {
    fontSize: 13,
    fontWeight: '600',
  },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 14,
    fontSize: 14,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  errorDesc: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryBtn: {
    minHeight: 46,
    paddingHorizontal: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    borderTopWidth: 1,
  },
  quantityBox: {
    flex: 0.3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 52,
    paddingHorizontal: 6,
  },
  qtyControlBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyControlText: {
    fontSize: 20,
    fontWeight: '700',
  },
  qtyValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  addToCartBtn: {
    flex: 0.7, // Chiếm 70% chiều rộng
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  addToCartText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
