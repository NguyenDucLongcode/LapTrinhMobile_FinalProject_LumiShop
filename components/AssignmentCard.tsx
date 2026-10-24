// components/AssignmentCard.tsx
// Card hiển thị bài tập — bo góc 16, đổ bóng mềm, trạng thái màu sắc

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/useTheme';
import { Assignment, Course } from '../types';
import { formatDueDate, getUrgencyLevel } from '../utils/dateHelpers';

interface AssignmentCardProps {
  assignment: Assignment;
  course?: Course;
  onPress?: () => void;
}

const COURSE_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  c1: 'globe-outline',        // Lập trình Web
  c2: 'server-outline',       // Cơ sở dữ liệu
  c3: 'phone-portrait-outline', // Lập trình Mobile
  c4: 'calculator-outline',    // Toán rời rạc
  c5: 'language-outline',      // Tiếng Anh
};

export default function AssignmentCard({ assignment, course, onPress }: AssignmentCardProps) {
  const { colors, borderRadius, shadow } = useTheme();
  const isCompleted = assignment.status === 'completed';
  const urgency = getUrgencyLevel(assignment.dueAt, assignment.status);

  const urgencyColors = {
    overdue: colors.danger,
    urgent: colors.warning,
    normal: colors.accent,
    completed: colors.success,
  };

  const statusColor = urgencyColors[urgency];
  const courseColor = course?.color ?? colors.accent;
  const iconName = COURSE_ICONS[assignment.courseId] ?? 'book-outline';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.card,
          borderRadius: borderRadius.card,
          borderLeftColor: courseColor,
          opacity: pressed ? 0.92 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
        shadow,
      ]}
    >
      {/* Icon môn học */}
      <View style={[styles.iconContainer, { backgroundColor: courseColor + '18' }]}>
        <Ionicons name={iconName} size={22} color={courseColor} />
      </View>

      {/* Nội dung */}
      <View style={styles.content}>
        {/* Tên bài tập */}
        <Text
          style={[
            styles.title,
            { color: isCompleted ? colors.muted : colors.text },
            isCompleted && styles.completedTitle,
          ]}
          numberOfLines={2}
        >
          {assignment.title}
        </Text>

        {/* Tên môn + chấm màu */}
        <View style={styles.courseRow}>
          <View style={[styles.courseDot, { backgroundColor: courseColor }]} />
          <Text style={[styles.courseName, { color: colors.muted }]} numberOfLines={1}>
            {course?.name ?? 'Không rõ môn'}
          </Text>
        </View>

        {/* Hạn chót */}
        <View style={styles.dueRow}>
          <Ionicons
            name={isCompleted ? 'checkmark-circle' : 'time-outline'}
            size={14}
            color={statusColor}
          />
          <Text style={[styles.dueText, { color: statusColor }]}>
            {isCompleted ? 'Đã hoàn thành' : formatDueDate(assignment.dueAt)}
          </Text>
        </View>
      </View>

      {/* Chevron */}
      <Ionicons name="chevron-forward" size={18} color={colors.muted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    marginHorizontal: 16,
    marginVertical: 6,
    borderLeftWidth: 4,
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  completedTitle: {
    textDecorationLine: 'line-through',
  },
  courseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  courseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  courseName: {
    fontSize: 12,
    fontWeight: '500',
  },
  dueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dueText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
