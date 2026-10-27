// components/DateTimePickerInput.tsx
// Component chọn ngày & giờ đa nền tảng:
//   - Web  → <input type="datetime-local"> HTML5 chuẩn (có lịch bật ra, chặn quá khứ qua min)
//   - Mobile → DateTimePicker mở lần lượt date rồi time

import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Hàm format hiển thị cho nút bấm
function formatDisplay(date: Date): string {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  const hh = String(date.getHours()).padStart(2, '0');
  const mi = String(date.getMinutes()).padStart(2, '0');
  return `${dd}/${mm}/${yyyy}  ${hh}:${mi}`;
}

// Hàm convert Date → "YYYY-MM-DDTHH:mm" cho input[type=datetime-local]
function toLocalInputValue(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const mi = String(date.getMinutes()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

// Hàm convert "YYYY-MM-DDTHH:mm" → Date
function fromLocalInputValue(val: string): Date {
  return new Date(val);
}

interface Props {
  label: string;
  value: Date;
  onChange: (date: Date) => void;
  minimumDate?: Date;
  /** Màu text/icon từ theme */
  colors: {
    text: string;
    muted: string;
    card: string;
    border: string;
    danger: string;
    accent: string;
  };
  borderRadius: { input: number };
  error?: string;
  required?: boolean;
}

export default function DateTimePickerInput({
  label,
  value,
  onChange,
  minimumDate,
  colors,
  borderRadius,
  error,
  required,
}: Props) {
  // ── WEB ──────────────────────────────────────────────────────────────────
  if (Platform.OS === 'web') {
    const minStr = minimumDate ? toLocalInputValue(minimumDate) : undefined;
    const valStr = toLocalInputValue(value);

    return (
      <View style={styles.group}>
        <Text style={[styles.label, { color: colors.text }]}>
          {label}
          {required && <Text style={{ color: colors.danger }}> *</Text>}
        </Text>
        {/* Bọc trong 1 container tương đối, có icon bên trái & hiển thị ngày giờ đã format */}
        <View
          style={[
            styles.wrapper,
            {
              backgroundColor: colors.card,
              borderColor: error ? colors.danger : colors.border,
              borderRadius: borderRadius.input,
              position: 'relative',
              cursor: 'pointer',
            },
          ]}
        >
          <Ionicons name="calendar-outline" size={18} color={colors.muted} style={{ marginRight: 8 }} />
          <Text style={[styles.valueText, { color: colors.text }]}>{formatDisplay(value)}</Text>
          <Ionicons name="chevron-down" size={16} color={colors.muted} />

          {/* Input HTML5 ẩn (opacity: 0) bao trùm toàn bộ diện tích của ô, khi click bất kỳ đâu sẽ mở picker native của trình duyệt */}
          {/* @ts-ignore – web-only HTML input */}
          <input
            type="datetime-local"
            value={valStr}
            min={minStr}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              if (e.target.value) {
                const d = fromLocalInputValue(e.target.value);
                if (!isNaN(d.getTime())) onChange(d);
              }
            }}
            onClick={(e: React.MouseEvent<HTMLInputElement>) => {
              // Hỗ trợ gọi showPicker nếu trình duyệt hỗ trợ
              try {
                if (typeof (e.currentTarget as any).showPicker === 'function') {
                  (e.currentTarget as any).showPicker();
                }
              } catch (_) {}
            }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              opacity: 0,
              cursor: 'pointer',
              zIndex: 1,
            }}
          />
        </View>
        {error ? <Text style={[styles.error, { color: colors.danger }]}>{error}</Text> : null}
      </View>
    );
  }

  // ── MOBILE (iOS / Android) ────────────────────────────────────────────────
  // Import lazy để không crash trên web (native module)
  const DateTimePicker =
    require('@react-native-community/datetimepicker').default as React.ComponentType<any>;

  const [showDate, setShowDate] = useState(false);
  const [showTime, setShowTime] = useState(false);

  const handleDateChange = (_: unknown, selected?: Date) => {
    setShowDate(false);
    if (selected) {
      // Giữ giờ cũ, chỉ thay ngày
      const next = new Date(selected);
      next.setHours(value.getHours(), value.getMinutes(), 0, 0);
      onChange(next);
      // Sau khi chọn ngày, mở tiếp picker giờ
      setShowTime(true);
    }
  };

  const handleTimeChange = (_: unknown, selected?: Date) => {
    setShowTime(false);
    if (selected) {
      // Giữ ngày cũ, chỉ thay giờ
      const next = new Date(value);
      next.setHours(selected.getHours(), selected.getMinutes(), 0, 0);
      onChange(next);
    }
  };

  return (
    <View style={styles.group}>
      <Text style={[styles.label, { color: colors.text }]}>
        {label}
        {required && <Text style={{ color: colors.danger }}> *</Text>}
      </Text>

      <Pressable
        onPress={() => setShowDate(true)}
        style={[
          styles.wrapper,
          {
            backgroundColor: colors.card,
            borderColor: error ? colors.danger : colors.border,
            borderRadius: borderRadius.input,
          },
        ]}
      >
        <Ionicons name="calendar-outline" size={18} color={colors.muted} />
        <Text style={[styles.valueText, { color: colors.text }]}>{formatDisplay(value)}</Text>
        <Ionicons name="chevron-down" size={16} color={colors.muted} />
      </Pressable>

      {error ? <Text style={[styles.error, { color: colors.danger }]}>{error}</Text> : null}

      {showDate && (
        <DateTimePicker
          value={value}
          mode="date"
          display="default"
          minimumDate={minimumDate}
          onChange={handleDateChange}
          locale="vi-VN"
        />
      )}
      {showTime && (
        <DateTimePicker
          value={value}
          mode="time"
          display="default"
          onChange={handleTimeChange}
          locale="vi-VN"
          is24Hour
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    marginBottom: 18,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
  },
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingHorizontal: 12,
    minHeight: 48,
    gap: 8,
  },
  valueText: {
    flex: 1,
    fontSize: 14,
  },
  error: {
    fontSize: 12,
    marginTop: 4,
  },
});
