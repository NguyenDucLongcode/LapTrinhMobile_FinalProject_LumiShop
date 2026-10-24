// app/(app)/index.tsx
// Home Screen — Danh sách bài tập với Search, Filter, Widget 48h

import React, { useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../../theme/useTheme';
import { useAuthStore } from '../../../store/authStore';
import { useAssignments } from '../../../hooks/useAssignmentsQuery';
import { useCourses } from '../../../hooks/useCoursesQuery';
import AssignmentCard from '../../../components/AssignmentCard';
import CourseChip from '../../../components/CourseChip';
import { isDueWithin48h } from '../../../utils/dateHelpers';
import { Assignment, Course } from '../../../types';

type StatusFilter = 'all' | 'pending' | 'completed';

export default function HomeScreen() {
  const router = useRouter();
  const { colors, borderRadius, shadow, shadowSm } = useTheme();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const { data: assignments, isLoading, isError, error, refetch } = useAssignments();
  const { data: courses } = useCourses();

  const [search, setSearch] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  // Tạo map courseId -> course để tra cứu nhanh
  const courseMap = useMemo(() => {
    const map = new Map<string, Course>();
    courses?.forEach((c) => map.set(c.id, c));
    return map;
  }, [courses]);

  // Widget 48h: bài tập sắp đến hạn
  const urgent48h = useMemo(() => {
    if (!assignments) return [];
    return assignments.filter(
      (a) => a.status === 'pending' && isDueWithin48h(a.dueAt)
    );
  }, [assignments]);

  // Lọc bài tập
  const filtered = useMemo(() => {
    if (!assignments) return [];
    let result = [...assignments];

    // Filter by search
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          courseMap.get(a.courseId)?.name.toLowerCase().includes(q)
      );
    }

    // Filter by course
    if (selectedCourse) {
      result = result.filter((a) => a.courseId === selectedCourse);
    }

    // Filter by status
    if (statusFilter !== 'all') {
      result = result.filter((a) => a.status === statusFilter);
    }

    // Sort: pending first, then by dueAt ascending
    result.sort((a, b) => {
      if (a.status !== b.status) return a.status === 'pending' ? -1 : 1;
      return new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime();
    });

    return result;
  }, [assignments, search, selectedCourse, statusFilter, courseMap]);

  const handleLogout = useCallback(async () => {
    await logout();
    router.replace('/(auth)/sign-in');
  }, [logout, router]);

  const renderItem = useCallback(
    ({ item }: { item: Assignment }) => (
      <AssignmentCard
        assignment={item}
        course={courseMap.get(item.courseId)}
        onPress={() =>
          router.push({
            pathname: '/assignment/[id]',
            params: { id: item.id },
          })
        }
      />
    ),
    [courseMap, router]
  );

  const keyExtractor = useCallback((item: Assignment) => item.id, []);

  // ── Loading State ──
  if (isLoading) {
    return (
      <SafeAreaView style={[styles.centerContainer, { backgroundColor: colors.bg }]}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={[styles.loadingText, { color: colors.muted }]}>Đang tải bài tập...</Text>
      </SafeAreaView>
    );
  }

  // ── Error State ──
  if (isError) {
    return (
      <SafeAreaView style={[styles.centerContainer, { backgroundColor: colors.bg }]}>
        <Ionicons name="cloud-offline-outline" size={48} color={colors.danger} />
        <Text style={[styles.errorTitle, { color: colors.text }]}>Không thể tải dữ liệu</Text>
        <Text style={[styles.errorMsg, { color: colors.muted }]}>
          {error instanceof Error ? error.message : 'Lỗi kết nối'}
        </Text>
        <Pressable
          onPress={() => refetch()}
          style={[styles.retryBtn, { backgroundColor: colors.accent, borderRadius: borderRadius.button }]}
        >
          <Ionicons name="refresh" size={18} color="#FFF" />
          <Text style={styles.retryText}>Thử lại</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: colors.muted }]}>
            Xin chào, {user?.name ?? 'Bạn'} 👋
          </Text>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Study Planner</Text>
        </View>
        <View style={styles.headerRight}>
          {user?.role === 'admin' && (
            <Pressable
              onPress={() => router.push('/assignment/create')}
              style={[styles.addBtn, { backgroundColor: colors.accent }, shadow]}
            >
              <Ionicons name="add" size={22} color="#FFF" />
            </Pressable>
          )}
          <Pressable onPress={handleLogout} style={styles.logoutBtn}>
            <Ionicons name="log-out-outline" size={22} color={colors.muted} />
          </Pressable>
        </View>
      </View>

      <FlatList
        data={filtered}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={() => {
              refetch();
            }}
            tintColor={colors.accent}
          />
        }
        ListHeaderComponent={
          <>
            {/* Widget 48h */}
            {urgent48h.length > 0 && (
              <View
                style={[
                  styles.widget48h,
                  {
                    backgroundColor: colors.warning + '15',
                    borderColor: colors.warning + '40',
                    borderRadius: borderRadius.card,
                  },
                ]}
              >
                <View style={styles.widgetIcon}>
                  <Ionicons name="alert-circle" size={24} color={colors.warning} />
                </View>
                <View style={styles.widgetContent}>
                  <Text style={[styles.widgetTitle, { color: colors.text }]}>
                    ⏰ Sắp đến hạn!
                  </Text>
                  <Text style={[styles.widgetDesc, { color: colors.muted }]}>
                    Bạn có{' '}
                    <Text style={{ fontWeight: '800', color: colors.warning }}>
                      {urgent48h.length} bài tập
                    </Text>{' '}
                    sắp đến hạn trong 48h tới.
                  </Text>
                </View>
              </View>
            )}

            {/* Search Bar */}
            <View
              style={[
                styles.searchBar,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  borderRadius: borderRadius.full,
                },
                shadowSm,
              ]}
            >
              <Ionicons name="search" size={18} color={colors.muted} />
              <TextInput
                style={[styles.searchInput, { color: colors.text }]}
                placeholder="Tìm kiếm bài tập..."
                placeholderTextColor={colors.muted}
                value={search}
                onChangeText={setSearch}
                autoCorrect={false}
              />
              {search.length > 0 && (
                <Pressable onPress={() => setSearch('')}>
                  <Ionicons name="close-circle" size={18} color={colors.muted} />
                </Pressable>
              )}
            </View>

            {/* Course Filter Chips */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsRow}
            >
              <CourseChip
                label="Tất cả"
                color={colors.accent}
                isActive={selectedCourse === null}
                onPress={() => setSelectedCourse(null)}
              />
              {courses?.map((c) => (
                <CourseChip
                  key={c.id}
                  label={c.code}
                  color={c.color}
                  isActive={selectedCourse === c.id}
                  onPress={() =>
                    setSelectedCourse(selectedCourse === c.id ? null : c.id)
                  }
                />
              ))}
            </ScrollView>

            {/* Status Filter */}
            <View style={styles.statusRow}>
              {(['all', 'pending', 'completed'] as StatusFilter[]).map((status) => {
                const isActive = statusFilter === status;
                const labels = { all: 'Tất cả', pending: 'Đang làm', completed: 'Hoàn thành' };
                return (
                  <Pressable
                    key={status}
                    onPress={() => setStatusFilter(status)}
                    style={[
                      styles.statusChip,
                      {
                        backgroundColor: isActive ? colors.accent : colors.card,
                        borderRadius: borderRadius.pill,
                        borderColor: isActive ? colors.accent : colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusLabel,
                        { color: isActive ? '#FFF' : colors.muted },
                      ]}
                    >
                      {labels[status]}
                    </Text>
                  </Pressable>
                );
              })}
              <View style={{ flex: 1 }} />
              <Text style={[styles.countText, { color: colors.muted }]}>
                {filtered.length} bài tập
              </Text>
            </View>
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={56} color={colors.muted} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              Không có bài tập nào
            </Text>
            <Text style={[styles.emptyDesc, { color: colors.muted }]}>
              {search || selectedCourse
                ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.'
                : 'Bấm nút + để thêm bài tập mới.'}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  greeting: {
    fontSize: 13,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutBtn: {
    padding: 8,
  },
  listContent: {
    paddingBottom: 100,
  },
  // Widget 48h
  widget48h: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 14,
    borderWidth: 1,
  },
  widgetIcon: {
    marginRight: 12,
  },
  widgetContent: {
    flex: 1,
  },
  widgetTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 2,
  },
  widgetDesc: {
    fontSize: 13,
  },
  // Search
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 14,
    height: 44,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    height: 44,
  },
  // Course Chips
  chipsRow: {
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  // Status Filter
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
    gap: 8,
  },
  statusChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  countText: {
    fontSize: 12,
    fontWeight: '500',
  },
  // Loading
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  // Error
  errorTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 12,
  },
  errorMsg: {
    fontSize: 13,
    marginTop: 6,
    textAlign: 'center',
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  retryText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  // Empty
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 14,
  },
  emptyDesc: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
  },
});
