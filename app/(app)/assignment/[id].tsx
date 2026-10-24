// app/(app)/assignment/[id].tsx
// Chi tiết bài tập — Tên môn, hạn chót, ghi chú, nút hoàn thành (Optimistic Update)

import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { useTheme } from '../../../theme/useTheme';
import { useAssignment, useUpdateAssignment, useDeleteAssignment } from '../../../hooks/useAssignmentsQuery';
import { useCourse } from '../../../hooks/useCoursesQuery';
import { useAuthStore } from '../../../store/authStore';
import { formatFullDate, formatDueDate, getUrgencyLevel } from '../../../utils/dateHelpers';

// Component hiển thị ảnh với fallback khi lỗi
function PhotoWithFallback({
  uri,
  style,
  muteColor,
  borderColor,
}: {
  uri: string;
  style: object | object[];
  muteColor: string;
  borderColor: string;
}) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <View
        style={[
          style,
          { alignItems: 'center', justifyContent: 'center', backgroundColor: borderColor },
        ]}
      >
        <Ionicons name="image-outline" size={40} color={muteColor} />
      </View>
    );
  }

  return (
    <Image
      source={{ uri }}
      style={style}
      contentFit="cover"
      onError={() => setHasError(true)}
    />
  );
}

export default function AssignmentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors, borderRadius, shadow } = useTheme();
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === 'admin';

  const { data: assignment, isLoading, isError } = useAssignment(id ?? '');
  const { data: course } = useCourse(assignment?.courseId ?? '');
  const updateMutation = useUpdateAssignment();
  const deleteMutation = useDeleteAssignment();

  const isCompleted = assignment?.status === 'completed';
  const urgency = assignment ? getUrgencyLevel(assignment.dueAt, assignment.status) : 'normal';

  const urgencyColors = {
    overdue: colors.danger,
    urgent: colors.warning,
    normal: colors.accent,
    completed: colors.success,
  };

  const handleToggleStatus = useCallback(async () => {
    if (!assignment) return;
    const newStatus = isCompleted ? 'pending' : 'completed';
    try {
      await updateMutation.mutateAsync({
        id: assignment.id,
        data: { status: newStatus },
      });
    } catch {
      const msg = 'Không thể cập nhật trạng thái. Vui lòng thử lại!';
      if (Platform.OS === 'web') {
        alert(msg);
      } else {
        Alert.alert('Lỗi', msg);
      }
    }
  }, [assignment, isCompleted, updateMutation]);

  const handleDelete = useCallback(async () => {
    if (!assignment) return;

    const doDelete = async () => {
      try {
        await deleteMutation.mutateAsync(assignment.id);
        router.back();
      } catch {
        const msg = 'Không thể xóa bài tập!';
        if (Platform.OS === 'web') {
          alert(msg);
        } else {
          Alert.alert('Lỗi', msg);
        }
      }
    };

    if (Platform.OS === 'web') {
      if (confirm('Bạn có chắc muốn xóa bài tập này?')) {
        await doDelete();
      }
    } else {
      Alert.alert('Xác nhận xóa', 'Bạn có chắc muốn xóa bài tập này?', [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Xóa', style: 'destructive', onPress: doDelete },
      ]);
    }
  }, [assignment, deleteMutation, router]);

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.center, { backgroundColor: colors.bg }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </SafeAreaView>
    );
  }

  if (isError || !assignment) {
    return (
      <SafeAreaView style={[styles.center, { backgroundColor: colors.bg }]}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.danger} />
        <Text style={[styles.errorText, { color: colors.text }]}>Không tìm thấy bài tập</Text>
        <Pressable onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.accent, borderRadius: borderRadius.button }]}>
          <Text style={styles.backBtnText}>Quay lại</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
          Chi tiết bài tập
        </Text>
        {isAdmin ? (
          <Pressable onPress={handleDelete} style={styles.headerBtn}>
            <Ionicons name="trash-outline" size={22} color={colors.danger} />
          </Pressable>
        ) : (
          <View style={{ width: 38 }} />
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Status Badge */}
        <View style={[styles.statusBadge, { backgroundColor: urgencyColors[urgency] + '18', borderRadius: borderRadius.pill }]}>
          <Ionicons
            name={isCompleted ? 'checkmark-circle' : urgency === 'overdue' ? 'alert-circle' : 'time-outline'}
            size={18}
            color={urgencyColors[urgency]}
          />
          <Text style={[styles.statusText, { color: urgencyColors[urgency] }]}>
            {isCompleted ? 'Đã hoàn thành' : urgency === 'overdue' ? 'Quá hạn' : urgency === 'urgent' ? 'Sắp đến hạn' : 'Đang thực hiện'}
          </Text>
        </View>

        {/* Title */}
        <Text style={[styles.title, { color: colors.text }, isCompleted && styles.completedTitle]}>
          {assignment.title}
        </Text>

        {/* Course Info */}
        <View style={[styles.infoCard, { backgroundColor: colors.card, borderRadius: borderRadius.card }, shadow]}>
          <View style={styles.infoRow}>
            <Ionicons name="book-outline" size={18} color={course?.color ?? colors.accent} />
            <Text style={[styles.infoLabel, { color: colors.muted }]}>Môn học</Text>
            <View style={styles.infoValue}>
              <View style={[styles.courseDot, { backgroundColor: course?.color ?? colors.accent }]} />
              <Text style={[styles.infoText, { color: colors.text }]}>
                {course ? `${course.code} - ${course.name}` : 'Không rõ'}
              </Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={18} color={urgencyColors[urgency]} />
            <Text style={[styles.infoLabel, { color: colors.muted }]}>Hạn chót</Text>
            <Text style={[styles.infoText, { color: colors.text }]}>
              {formatFullDate(assignment.dueAt)}
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={18} color={urgencyColors[urgency]} />
            <Text style={[styles.infoLabel, { color: colors.muted }]}>Thời hạn</Text>
            <Text style={[styles.infoText, { color: urgencyColors[urgency], fontWeight: '700' }]}>
              {formatDueDate(assignment.dueAt)}
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.infoRow}>
            <Ionicons name="create-outline" size={18} color={colors.muted} />
            <Text style={[styles.infoLabel, { color: colors.muted }]}>Ngày tạo</Text>
            <Text style={[styles.infoText, { color: colors.text }]}>
              {formatFullDate(assignment.createdAt)}
            </Text>
          </View>
        </View>

        {/* Notes */}
        {assignment.notes ? (
          <View style={[styles.notesCard, { backgroundColor: colors.card, borderRadius: borderRadius.card }, shadow]}>
            <View style={styles.notesHeader}>
              <Ionicons name="document-text-outline" size={18} color={colors.accent} />
              <Text style={[styles.notesTitle, { color: colors.text }]}>Ghi chú</Text>
            </View>
            <Text style={[styles.notesText, { color: colors.muted }]}>
              {assignment.notes}
            </Text>
          </View>
        ) : null}

        {/* Photo */}
        {assignment.photoUri ? (
          <View style={[styles.photoCard, { backgroundColor: colors.card, borderRadius: borderRadius.card }, shadow]}>
            <View style={styles.notesHeader}>
              <Ionicons name="image-outline" size={18} color={colors.accent} />
              <Text style={[styles.notesTitle, { color: colors.text }]}>Hình ảnh đính kèm</Text>
            </View>
            <PhotoWithFallback
              uri={assignment.photoUri}
              style={[styles.photo, { borderRadius: borderRadius.input }]}
              muteColor={colors.muted}
              borderColor={colors.border}
            />
          </View>
        ) : null}

        {/* Toggle Status Button */}
        <Pressable
          onPress={handleToggleStatus}
          disabled={updateMutation.isPending}
          style={({ pressed }) => [
            styles.toggleBtn,
            {
              backgroundColor: isCompleted ? colors.warning : colors.success,
              borderRadius: borderRadius.button,
              opacity: pressed || updateMutation.isPending ? 0.85 : 1,
              transform: [{ scale: pressed ? 0.98 : 1 }],
            },
            shadow,
          ]}
        >
          {updateMutation.isPending ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Ionicons
                name={isCompleted ? 'arrow-undo-outline' : 'checkmark-circle-outline'}
                size={20}
                color="#FFF"
              />
              <Text style={styles.toggleBtnText}>
                {isCompleted ? 'Đánh dấu chưa hoàn thành' : 'Đánh dấu hoàn thành'}
              </Text>
            </>
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
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  headerBtn: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 6,
    gap: 6,
    marginBottom: 12,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '700',
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 20,
    lineHeight: 30,
  },
  completedTitle: {
    textDecorationLine: 'line-through',
  },
  infoCard: {
    padding: 16,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 10,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    width: 70,
  },
  infoValue: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  courseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  divider: {
    height: 1,
  },
  notesCard: {
    padding: 16,
    marginBottom: 16,
  },
  notesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  notesTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  notesText: {
    fontSize: 14,
    lineHeight: 22,
  },
  photoCard: {
    padding: 16,
    marginBottom: 16,
  },
  photo: {
    width: '100%',
    height: 220,
  },
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    minHeight: 52,
    marginTop: 8,
  },
  toggleBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
  },
  errorText: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 12,
  },
  backBtn: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  backBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
