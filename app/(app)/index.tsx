// app/(app)/index.tsx
// Trang chủ LumiShop: Khung Full Width 100%, Lưới sản phẩm Responsive Grid (flexWrap wrap, gap: 16, mỗi ô tối đa 280px)

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  RefreshControl,
  SafeAreaView,
  Alert,
  Platform,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useProducts } from '../../hooks/useProductsQuery';
import { useCategories } from '../../hooks/useCategoriesQuery';
import { useAuthStore } from '../../store/authStore';
import { useUpdateCart } from '../../hooks/useCartsQuery';
import { useTheme } from '../../theme/useTheme';
import { ProductRow } from '../../components/ProductRow';
import { Header } from '../../components/Header';
import { CategoryChip } from '../../components/CategoryChip';
import { Product } from '../../types';
import { getCategoryIcon } from '../../utils/categoryLabels';

const PAGE_SIZE = 10;

export default function HomeScreen() {
  const router = useRouter();
  const { colors, borderRadius, shadowSm } = useTheme();
  const { width } = useWindowDimensions();
  const numColumns = width >= 900 ? 4 : width >= 540 ? 2 : 1;
  const [page, setPage] = useState(1);
  const {
    data: products = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useProducts();
  const { data: categories = [] } = useCategories();
  const addItem = useUpdateCart();
  const { user } = useAuthStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categoryNameById = useMemo(() => {
    const map: Record<string, string> = {};
    categories.forEach((item) => {
      map[item.id] = item.name;
    });
    return map;
  }, [categories]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchName = product.name
        .toLowerCase()
        .includes(searchTerm.trim().toLowerCase());
      const matchCategory =
        selectedCategory === 'all' || product.categoryId === selectedCategory;
      return matchName && matchCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagedProducts = filteredProducts.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  const handleProductPress = (product: Product) => {
    router.push({
      pathname: '/(app)/product/[id]',
      params: { id: product.id },
    });
  };

  const handleAddToCart = async (product: Product) => {
    try {
      await addItem.mutateAsync({ userId: user?.id ?? '', product, quantity: 1 });
      if (Platform.OS === 'web') {
        console.log(`Đã thêm "${product.name}" vào giỏ hàng`);
      } else {
        Alert.alert('Thành công', `Đã thêm "${product.name}" vào giỏ hàng!`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể thêm sản phẩm vào giỏ.';
      if (Platform.OS === 'web') window.alert(message);
      else Alert.alert('Lỗi', message);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* Header LumiShop Full Width */}
      <Header
        showBack={false}
        showCart={true}
        showAdmin={user?.role === 'admin'}
        showLogout={true}
      />

      {/* Khung nội dung chính Full Width 100% không bị bóp */}
      <View style={styles.mainContainer}>
        {/* Lời chào & Avatar */}
        <View
          style={[
            styles.greetingCard,
            {
              backgroundColor: colors.card,
              borderBottomColor: colors.border,
            },
          ]}
        >
          <View style={styles.userRow}>
            <View style={[styles.avatarCircle, { backgroundColor: colors.accent }]}>
              <Text style={styles.avatarLetter}>
                {(user?.name || user?.username || 'U').substring(0, 1).toUpperCase()}
              </Text>
            </View>
            <View>
              <Text style={[styles.welcomeSmall, { color: colors.muted }]}>Xin chào,</Text>
              <Text style={[styles.userName, { color: colors.text }]}>
                {user?.name || user?.username || 'Khách hàng'} 👋
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.statusTag,
              {
                backgroundColor: colors.accentLight,
                borderRadius: borderRadius.pill,
              },
            ]}
          >
            <Text style={[styles.statusTagText, { color: colors.accent }]}>
              {user?.role === 'admin' ? '🛡️ Quản trị viên' : '✨ Thành viên Lumi'}
            </Text>
          </View>
        </View>

        {/* Thanh tìm kiếm bo tròn 30 hoàn toàn */}
        <View style={styles.searchSection}>
          <View
            style={[
              styles.searchBar,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                borderRadius: 30,
              },
              shadowSm,
            ]}
          >
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Tìm kiếm trong 25+ sản phẩm LumiShop..."
              placeholderTextColor={colors.muted}
              value={searchTerm}
              onChangeText={setSearchTerm}
              clearButtonMode="while-editing"
            />
            {searchTerm.length > 0 && (
              <Pressable
                onPress={() => setSearchTerm('')}
                style={styles.clearSearchBtn}
              >
                <Text style={{ color: colors.muted, fontSize: 14 }}>✕</Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* Danh mục cuộn ngang với CategoryChip */}
        <View style={styles.categorySection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScroll}
          >
            <CategoryChip
              key="all"
              label="Tất cả"
              icon="✨"
              selected={selectedCategory === 'all'}
              onPress={() => {
                setSelectedCategory('all');
                setPage(1);
              }}
            />
            {categories.map((cat) => (
              <CategoryChip
                key={cat.id}
                label={cat.name}
                icon={getCategoryIcon(cat.id)}
                selected={selectedCategory === cat.id}
                onPress={() => {
                  setSelectedCategory(cat.id);
                  setPage(1);
                }}
              />
            ))}
          </ScrollView>
        </View>

        <View style={styles.gridViewport}>
        {/* Hiển thị 4 trạng thái: Loading, Error, Empty, Success */}
        {isLoading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={colors.accent} />
            <Text style={[styles.statusText, { color: colors.muted }]}>
              Đang tải dữ liệu sản phẩm LumiShop...
            </Text>
          </View>
        ) : isError ? (
          <View style={styles.centerBox}>
            <Text style={styles.statusEmoji}>⚠️</Text>
            <Text style={[styles.errorTitle, { color: colors.danger }]}>
              Không thể tải dữ liệu sản phẩm
            </Text>
            <Text style={[styles.errorDesc, { color: colors.muted }]}>
              {error?.message || 'Vui lòng kiểm tra lại kết nối mạng hoặc JSON Server.'}
            </Text>
            <Pressable
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Thử lại tải danh sách"
              onPress={() => refetch()}
              style={[
                styles.retryButton,
                {
                  backgroundColor: colors.accent,
                  borderRadius: borderRadius.button,
                },
              ]}
            >
              <Text style={styles.retryButtonText}>🔄 Thử lại ngay</Text>
            </Pressable>
          </View>
        ) : pagedProducts.length === 0 ? (
          <View style={styles.centerBox}>
            <Text style={styles.statusEmoji}>📦</Text>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              Không tìm thấy sản phẩm
            </Text>
            <Text style={[styles.emptyDesc, { color: colors.muted }]}>
              {searchTerm
                ? `Không có kết quả nào khớp với "${searchTerm}"`
                : 'Hiện chưa có sản phẩm nào trong danh mục này.'}
            </Text>
            {searchTerm ? (
              <Pressable
                onPress={() => setSearchTerm('')}
                style={[
                  styles.retryButton,
                  {
                    backgroundColor: colors.accent,
                    borderRadius: borderRadius.button,
                  },
                ]}
              >
                <Text style={styles.retryButtonText}>Xóa tìm kiếm</Text>
              </Pressable>
            ) : null}
          </View>
        ) : (
          /* Danh sách sản phẩm: Responsive Grid linh hoạt với flexWrap wrap, gap: 16 */
          <FlatList
            style={{ flex: 1, width: '100%' }}
            key={`product-grid-${numColumns}`}
            data={pagedProducts}
            numColumns={numColumns}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={styles.gridContent}
            columnWrapperStyle={numColumns > 1 ? styles.gridRow : undefined}
            renderItem={({ item }) => (
              <ProductRow
                product={item}
                categoryName={categoryNameById[item.categoryId]}
                onPress={handleProductPress}
                onAddToCart={handleAddToCart}
              />
            )}
            refreshControl={
              <RefreshControl
                refreshing={isFetching}
                onRefresh={() => {
                  refetch();
                }}
                colors={[colors.accent]}
              />
            }
          />
        )}
        </View>
        {!isLoading && !isError && pagedProducts.length > 0 && totalPages > 1 ? (
          <View style={[styles.paginationRow, { marginTop: 20 }]}>
                  <Pressable
                    disabled={safePage <= 1}
                    onPress={() => setPage((prev) => Math.max(1, prev - 1))}
                    style={[
                      styles.pageBtn,
                      {
                        backgroundColor: safePage <= 1 ? colors.border : colors.accent,
                        borderRadius: borderRadius.button,
                        opacity: safePage <= 1 ? 0.6 : 1,
                      },
                    ]}
                  >
                    <Text style={styles.pageBtnText}>← Trước</Text>
                  </Pressable>
                  <Text style={[styles.pageInfo, { color: colors.text }]}>
                    Trang {safePage}/{totalPages}
                  </Text>
                  <Pressable
                    disabled={safePage >= totalPages}
                    onPress={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                    style={[
                      styles.pageBtn,
                      {
                        backgroundColor: safePage >= totalPages ? colors.border : colors.accent,
                        borderRadius: borderRadius.button,
                        opacity: safePage >= totalPages ? 0.6 : 1,
                      },
                    ]}
                  >
                    <Text style={styles.pageBtnText}>Sau →</Text>
                  </Pressable>
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    maxWidth: '100%', // Giãn full 100% màn hình Web
  },
  mainContainer: {
    flex: 1,
    width: '100%',
    maxWidth: '100%', // Full width, không bóp vào giữa
  },
  gridViewport: {
    flex: 1,
    width: '100%',
    minHeight: 0,
  },
  greetingCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  welcomeSmall: {
    fontSize: 12,
    fontWeight: '500',
  },
  userName: {
    fontSize: 16,
    fontWeight: '800',
  },
  statusTag: {
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  statusTagText: {
    fontSize: 11,
    fontWeight: '700',
  },
  searchSection: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 6,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingHorizontal: 16,
    height: 50,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    height: 50,
  },
  clearSearchBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categorySection: {
    paddingVertical: 10,
  },
  categoryScroll: {
    paddingHorizontal: 20,
  },
  gridContent: {
    padding: 20,
    paddingBottom: 20,
    rowGap: 16,
  },
  gridRow: {
    gap: 16,
    justifyContent: 'flex-start',
  },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  statusEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  statusText: {
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
  retryButton: {
    minHeight: 46,
    paddingHorizontal: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptyDesc: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 16,
  },
  paginationRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    gap: 16,
    paddingVertical: 8,
  },
  pageBtn: {
    minHeight: 40,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  pageInfo: {
    fontSize: 13,
    fontWeight: '700',
  },
});
