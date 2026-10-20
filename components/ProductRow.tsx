// components/ProductRow.tsx
// Card sản phẩm LumiShop: maxWidth 280px, tỉ lệ ảnh 1:1 expo-image, rating sao vàng và nút thêm tròn nhỏ

import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Product } from '../types';
import { useTheme } from '../theme/useTheme';
import { formatCurrency } from '../utils/calculateTotal';

interface ProductRowProps {
  product: Product;
  onPress: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
  categoryName?: string;
}

export const ProductRow: React.FC<ProductRowProps> = ({
  product,
  onPress,
  onAddToCart,
  categoryName,
}) => {
  const { colors, borderRadius, shadow } = useTheme();
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderRadius: borderRadius.card,
          borderColor: colors.border,
        },
        shadow,
      ]}
    >
      {/* Ảnh sản phẩm tỉ lệ 1:1 dùng expo-image */}
      <Pressable
        accessible
        accessibilityRole="button"
        accessibilityLabel={`Xem sản phẩm ${product.name}`}
        onPress={() => onPress(product)}
        style={styles.imageContainer}
      >
        <Image
          source={{ uri: imageFailed ? 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80' : product.image }}
          onError={() => setImageFailed(true)}
          style={[
            styles.image,
            {
              borderTopLeftRadius: borderRadius.card,
              borderTopRightRadius: borderRadius.card,
            },
          ]}
          contentFit="cover"
          transition={250}
        />
        {/* Badge danh mục nhỏ */}
        <View style={[styles.categoryBadge, { backgroundColor: 'rgba(15, 23, 42, 0.65)' }]}>
          <Text style={styles.categoryText}>
            {(categoryName || 'LUMI').toUpperCase()}
          </Text>
        </View>
      </Pressable>

      {/* Nội dung chi tiết */}
      <View style={styles.content}>
        <Pressable
          accessible
          accessibilityRole="button"
          accessibilityLabel={`Xem sản phẩm ${product.name}, giá ${formatCurrency(product.price)}`}
          onPress={() => onPress(product)}
          style={styles.detailsPressable}
        >
        {/* Tên sản phẩm tối đa 2 dòng */}
        <Text
          numberOfLines={2}
          style={[styles.name, { color: colors.text }]}
        >
          {product.name}
        </Text>

        {/* Rating sao vàng và đã bán */}
        <View style={styles.ratingRow}>
          <Text style={styles.starIcon}>⭐</Text>
          <Text style={[styles.ratingText, { color: colors.text }]}>
            {product.rating ? product.rating.toFixed(1) : '5.0'}
          </Text>
          <Text style={[styles.stockText, { color: colors.muted }]}>
            • Đã bán {product.stock ? (100 - product.stock > 0 ? 100 - product.stock : 24) : 15}
          </Text>
        </View>
        </Pressable>

        {/* Khối giá tiền & Nút cộng (+) */}
        <View style={styles.footerRow}>
          <View style={styles.priceContainer}>
            <Text
              numberOfLines={1}
              style={[styles.price, { color: colors.accent }]}
            >
              {formatCurrency(product.price)}
            </Text>
          </View>

          {onAddToCart && (
            <Pressable
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={`Thêm ${product.name} vào giỏ hàng`}
              hitSlop={8}
              onPress={() => onAddToCart(product)}
              style={({ pressed }) => [
                styles.addBtn,
                {
                  backgroundColor: colors.accent,
                  transform: [{ scale: pressed ? 0.88 : 1 }],
                },
              ]}
            >
              <Text style={styles.addBtnIcon}>+</Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    width: '100%',
    minWidth: 0,
    flexGrow: 1,
    marginBottom: 0,
    borderWidth: 1,
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    position: 'relative',
    backgroundColor: '#F1F5F9',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  categoryBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  content: {
    padding: 12,
    justifyContent: 'space-between',
    flex: 1,
  },
  detailsPressable: { flex: 1 },
  name: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 19,
    minHeight: 38,
    marginBottom: 6,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  starIcon: {
    fontSize: 11,
    marginRight: 3,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    marginRight: 4,
  },
  stockText: {
    fontSize: 11,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  priceContainer: {
    flex: 1,
    marginRight: 6,
  },
  price: {
    fontSize: 15,
    fontWeight: '800',
  },
  addBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnIcon: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 20,
    marginTop: -1,
  },
});

export default ProductRow;
