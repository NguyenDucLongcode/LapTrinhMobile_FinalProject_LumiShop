// app/(app)/(tabs)/weekly.tsx
// Lịch tuần — hiển thị bài tập trên Calendar với Custom DayComponent (chấm to 8x8), nhấn ngày -> danh sách bài tập

import React, { useMemo, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Calendar, DateData } from 'react-native-calendars';
import { useRouter } from 'expo-router';
import { useTheme } from '../../../theme/useTheme';
import { useAssignments } from '../../../hooks/useAssignmentsQuery';
import { useCourses } from '../../../hooks/useCoursesQuery';
import AssignmentCard from '../../../components/AssignmentCard';
import { toCalendarDate } from '../../../utils/dateHelpers';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Assignment, Course } from '../../../types';

export default function WeeklyScreen() {
  const router = useRouter();
  const { colors, borderRadius, shadow } = useTheme();
  const { data: assignments } = useAssignments();
  const { data: courses } = useCourses();

  const today = format(new Date(), 'yyyy-MM-dd');
  const [selectedDate, setSelectedDate] = useState<string>(today);

  // Map courseId -> Course
  const courseMap = useMemo(() => {
    const map = new Map<string, Course>();
    courses?.forEach((c) => map.set(c.id, c));
    return map;
  }, [courses]);

  // Gom màu chấm theo từng ngày (tối đa 4 chấm màu khác nhau cho mỗi ngày)
  const dateDotsMap = useMemo(() => {
    const map = new Map<string, string[]>();

    assignments?.forEach((a) => {
      const dateKey = toCalendarDate(a.dueAt);
      const existing = map.get(dateKey) || [];
      const courseColor = courseMap.get(a.courseId)?.color ?? colors.danger;
      if (!existing.includes(courseColor) && existing.length < 4) {
        existing.push(courseColor);
        map.set(dateKey, existing);
      }
    });

    return map;
  }, [assignments, courseMap, colors.danger]);

  // Bài tập của ngày đã chọn
  const dayAssignments = useMemo(() => {
    if (!assignments) return [];
    return assignments.filter((a) => toCalendarDate(a.dueAt) === selectedDate);
  }, [assignments, selectedDate]);

  const selectedDateLabel = useMemo(() => {
    try {
      return format(new Date(selectedDate), 'EEEE, dd/MM/yyyy', { locale: vi });
    } catch {
      return selectedDate;
    }
  }, [selectedDate]);

  const handleSelectDay = useCallback((dateString: string) => {
    setSelectedDate(dateString);
  }, []);

  // Custom Day Component: Vẽ chấm màu to (8x8) rõ ràng trên cả Web và Mobile
  const renderCustomDay = useCallback(
    ({ date, state }: { date?: DateData; state?: any }) => {
      if (!date) return <View style={styles.dayContainer} />;

      const dateStr = date.dateString;
      const isSelected = dateStr === selectedDate;
      const isToday = state === 'today' || dateStr === today;
      const isDisabled = state === 'disabled';
      const dots = dateDotsMap.get(dateStr) || [];

      return (
        <Pressable
          onPress={() => handleSelectDay(dateStr)}
          style={[
            styles.dayContainer,
            isSelected && [styles.selectedDay, { backgroundColor: colors.accent }],
          ]}
        >
          <Text
            style={[
              styles.dayText,
              { color: isSelected ? '#FFFFFF' : isDisabled ? colors.muted + '60' : colors.text },
              isToday && !isSelected && { color: colors.accent, fontWeight: '800' },
            ]}
          >
            {date.day}
          </Text>

          {/* Hàng chấm màu kích thước 8x8 rõ ràng */}
          <View style={styles.dotsRow}>
            {dots.map((dotColor, idx) => (
              <View
                key={`${dateStr}-${dotColor}-${idx}`}
                style={[
                  styles.bigDot,
                  { backgroundColor: isSelected ? '#FFFFFF' : dotColor },
                ]}
              />
            ))}
          </View>
        </Pressable>
      );
    },
    [selectedDate, today, dateDotsMap, colors, handleSelectDay]
  );

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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="calendar" size={24} color={colors.accent} />
        <Text style={[styles.headerTitle, { color: colors.text }]}>Lịch tuần</Text>
      </View>

      <FlatList
        data={dayAssignments}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            {/* Calendar */}
            <View
              style={[
                styles.calendarWrapper,
                { backgroundColor: colors.card, borderRadius: borderRadius.card },
                shadow,
              ]}
            >
              <Calendar
                dayComponent={renderCustomDay}
                theme={{
                  calendarBackground: colors.card,
                  textSectionTitleColor: colors.muted,
                  monthTextColor: colors.text,
                  arrowColor: colors.accent,
                  textMonthFontWeight: '800' as const,
                  textMonthFontSize: 16,
                }}
              />
            </View>

            {/* Selected date label */}
            <View style={styles.dateLabelRow}>
              <Text style={[styles.dateLabel, { color: colors.text }]}>
                📅 {selectedDateLabel}
              </Text>
              <Text style={[styles.dateCount, { color: colors.muted }]}>
                {dayAssignments.length} bài tập
              </Text>
            </View>
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="happy-outline" size={44} color={colors.muted} />
            <Text style={[styles.emptyText, { color: colors.muted }]}>
              Không có bài tập nào trong ngày này
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    gap: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
  },
  calendarWrapper: {
    marginHorizontal: 16,
    marginBottom: 16,
    overflow: 'hidden',
    paddingBottom: 8,
  },
  dayContainer: {
    width: 36,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    paddingVertical: 2,
  },
  selectedDay: {
    borderRadius: 12,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '600',
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    marginTop: 2,
    minHeight: 8,
  },
  bigDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dateLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  dateLabel: {
    fontSize: 15,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  dateCount: {
    fontSize: 12,
    fontWeight: '500',
  },
  listContent: {
    paddingBottom: 100,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 14,
    marginTop: 10,
    textAlign: 'center',
  },
});
