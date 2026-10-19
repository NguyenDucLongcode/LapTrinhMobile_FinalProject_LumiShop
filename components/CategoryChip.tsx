// components/CategoryChip.tsx
// Component hiển thị danh mục dạng viên thuốc (pill) hiện đại, hiệu ứng bấm phản hồi nhanh

import React from 'react';
import { Text, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../theme/useTheme';

interface CategoryChipProps {
  label: string;
  icon?: string;
  selected: boolean;
  onPress: () => void;
}

export const CategoryChip: React.FC<CategoryChipProps> = ({
  label,
  icon,
  selected,
  onPress,
}) => {
  const { colors, borderRadius, shadowSm } = useTheme();

  return (
    <Pressable
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`Danh mục ${label}`}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        {
          borderRadius: borderRadius.pill,
          backgroundColor: selected ? colors.accent : colors.card,
          borderColor: selected ? colors.accent : colors.border,
          transform: [{ scale: pressed ? 0.95 : 1 }],
        },
        selected ? shadowSm : null,
      ]}
    >
      {icon ? <Text style={styles.icon}>{icon}</Text> : null}
      <Text
        style={[
          styles.label,
          {
            color: selected ? '#FFFFFF' : colors.muted,
            fontWeight: selected ? '700' : '500',
          },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    marginRight: 8,
  },
  icon: {
    fontSize: 14,
    marginRight: 6,
  },
  label: {
    fontSize: 13,
  },
});

export default CategoryChip;
