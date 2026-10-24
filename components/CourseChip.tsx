// components/CourseChip.tsx
// Viên thuốc (pill) lọc môn học — chấm màu tương ứng

import React from 'react';
import { Text, StyleSheet, Pressable, View } from 'react-native';
import { useTheme } from '../theme/useTheme';

interface CourseChipProps {
  label: string;
  color: string;        // Mã màu hex của môn học
  isActive: boolean;
  onPress: () => void;
}

export default function CourseChip({ label, color, isActive, onPress }: CourseChipProps) {
  const { colors, borderRadius } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: isActive ? color + '20' : colors.card,
          borderColor: isActive ? color : colors.border,
          borderRadius: borderRadius.pill,
          opacity: pressed ? 0.85 : 1,
          transform: [{ scale: pressed ? 0.96 : 1 }],
        },
      ]}
    >
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text
        style={[
          styles.label,
          { color: isActive ? color : colors.muted },
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1.5,
    marginRight: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
});
