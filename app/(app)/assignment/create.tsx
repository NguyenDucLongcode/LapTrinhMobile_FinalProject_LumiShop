// app/(app)/assignment/create.tsx
// Form tạo bài tập mới: Title, Course dropdown, DateTimePickerInput, Notes, Image Picker

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
  Platform,
  ActivityIndicator,
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../../../theme/useTheme';
import { useCourses } from '../../../hooks/useCoursesQuery';
import { useCreateAssignment } from '../../../hooks/useAssignmentsQuery';
import { Course, AssignmentInput } from '../../../types';
import { scheduleAssignmentNotification } from '../../../utils/notifications';
import { saveImagePermanently } from '../../../utils/imageHelper';
import DateTimePickerInput from '../../../components/DateTimePickerInput';

// Ngày mặc định: hôm nay 23:59
function defaultDueDate(): Date {
  const d = new Date();
  d.setHours(23, 59, 0, 0);
  // Nếu đã qua 23:59 hôm nay thì dùng ngày mai
  if (d <= new Date()) {
    d.setDate(d.getDate() + 1);
  }
  return d;
}

export default function CreateAssignmentScreen() {
  const router = useRouter();
  const { colors, borderRadius, shadow } = useTheme();
  const { data: courses } = useCourses();
  const createMutation = useCreateAssignment();

  const [title, setTitle] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [dueDate, setDueDate] = useState<Date>(defaultDueDate);
  const [notes, setNotes] = useState('');
  const [photoUri, setPhotoUri] = useState('');
  const [tempImageUri, setTempImageUri] = useState('');
  const [isSavingImage, setIsSavingImage] = useState(false);
  const [showCoursePicker, setShowCoursePicker] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = 'Vui lòng nhập tên bài tập!';
    if (!selectedCourse) newErrors.course = 'Vui lòng chọn môn học!';
    if (dueDate <= new Date()) {
      newErrors.dueDate = 'Hạn chót không được ở quá khứ!';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = useCallback(async () => {
    if (!validate()) return;

    // BẮT BUỘC lưu ảnh vĩnh viễn (Base64 trên Web hoặc file local trên Mobile) nếu có ảnh
    let permanentPhotoUri = photoUri;
    if (tempImageUri) {
      setIsSavingImage(true);
      try {
        permanentPhotoUri = await saveImagePermanently(tempImageUri);
      } catch (err) {
        console.warn('Lỗi lưu ảnh:', err);
        permanentPhotoUri = tempImageUri; // fallback
      } finally {
        setIsSavingImage(false);
      }
    }

    const data: AssignmentInput = {
      courseId: selectedCourse!.id,
      title: title.trim(),
      dueAt: dueDate.toISOString(),
      status: 'pending',
      notes: notes.trim(),
      photoUri: permanentPhotoUri,
      createdAt: new Date().toISOString(),
    };

    try {
      const created = await createMutation.mutateAsync(data);
      // Lên lịch thông báo trước hạn 1 tiếng
      scheduleAssignmentNotification(created.id, created.title, created.dueAt).catch((err) =>
        console.warn('Lỗi schedule notification:', err)
      );

      if (Platform.OS === 'web') {
        alert('Tạo bài tập thành công!');
      } else {
        Alert.alert('Thành công', 'Bài tập đã được tạo!');
      }
      router.back();
    } catch {
      const msg = 'Không thể tạo bài tập. Vui lòng thử lại!';
      if (Platform.OS === 'web') {
        alert(msg);
      } else {
        Alert.alert('Lỗi', msg);
      }
    }
  }, [title, selectedCourse, dueDate, notes, photoUri, tempImageUri, createMutation, router]);

  const handlePickImage = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      setTempImageUri(uri);
      setPhotoUri(uri); // hiển thị preview ngay
    }
  }, []);

  const renderCourseItem = useCallback(
    ({ item }: { item: Course }) => (
      <Pressable
        onPress={() => {
          setSelectedCourse(item);
          setShowCoursePicker(false);
          setErrors((e) => ({ ...e, course: '' }));
        }}
        style={[
          styles.courseItem,
          {
            backgroundColor: selectedCourse?.id === item.id ? item.color + '15' : 'transparent',
            borderBottomColor: colors.border,
          },
        ]}
      >
        <View style={[styles.courseDot, { backgroundColor: item.color }]} />
        <Text style={[styles.courseItemText, { color: colors.text }]}>
          {item.code} — {item.name}
        </Text>
        {selectedCourse?.id === item.id && (
          <Ionicons name="checkmark" size={20} color={item.color} />
        )}
      </Pressable>
    ),
    [selectedCourse, colors]
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.headerBtn}>
          <Ionicons name="close" size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Thêm bài tập mới</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Title */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, { color: colors.text }]}>
            Tên bài tập <Text style={{ color: colors.danger }}>*</Text>
          </Text>
          <View
            style={[
              styles.inputWrapper,
              {
                backgroundColor: colors.card,
                borderColor: errors.title ? colors.danger : colors.border,
                borderRadius: borderRadius.input,
              },
            ]}
          >
            <Ionicons name="document-text-outline" size={18} color={colors.muted} />
            <TextInput
              style={[styles.textInput, { color: colors.text }]}
              placeholder="VD: Bài tập JavaScript ES6+"
              placeholderTextColor={colors.muted}
              value={title}
              onChangeText={(t) => {
                setTitle(t);
                setErrors((e) => ({ ...e, title: '' }));
              }}
            />
          </View>
          {errors.title ? <Text style={[styles.errorText, { color: colors.danger }]}>{errors.title}</Text> : null}
        </View>

        {/* Course Picker */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, { color: colors.text }]}>
            Môn học <Text style={{ color: colors.danger }}>*</Text>
          </Text>
          <Pressable
            onPress={() => setShowCoursePicker(true)}
            style={[
              styles.inputWrapper,
              {
                backgroundColor: colors.card,
                borderColor: errors.course ? colors.danger : colors.border,
                borderRadius: borderRadius.input,
              },
            ]}
          >
            {selectedCourse ? (
              <>
                <View style={[styles.courseDot, { backgroundColor: selectedCourse.color }]} />
                <Text style={[styles.selectedCourseText, { color: colors.text }]}>
                  {selectedCourse.code} — {selectedCourse.name}
                </Text>
              </>
            ) : (
              <>
                <Ionicons name="book-outline" size={18} color={colors.muted} />
                <Text style={[styles.placeholderText, { color: colors.muted }]}>Chọn môn học...</Text>
              </>
            )}
            <Ionicons name="chevron-down" size={18} color={colors.muted} />
          </Pressable>
          {errors.course ? <Text style={[styles.errorText, { color: colors.danger }]}>{errors.course}</Text> : null}
        </View>

        {/* ── DateTimePickerInput (thay thế 2 TextInput cũ) ── */}
        <DateTimePickerInput
          label="Hạn chót"
          value={dueDate}
          onChange={(d) => {
            setDueDate(d);
            setErrors((e) => ({ ...e, dueDate: '' }));
          }}
          minimumDate={new Date()}
          colors={colors}
          borderRadius={borderRadius}
          error={errors.dueDate}
          required
        />

        {/* Notes */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, { color: colors.text }]}>Ghi chú</Text>
          <View
            style={[
              styles.textAreaWrapper,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                borderRadius: borderRadius.input,
              },
            ]}
          >
            <TextInput
              style={[styles.textArea, { color: colors.text }]}
              placeholder="Thêm ghi chú cho bài tập..."
              placeholderTextColor={colors.muted}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Photo */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, { color: colors.text }]}>Hình ảnh</Text>
          {photoUri ? (
            <View style={styles.photoPreview}>
              <Image source={{ uri: photoUri }} style={[styles.previewImage, { borderRadius: borderRadius.input }]} contentFit="cover" />
              <Pressable
                onPress={() => { setPhotoUri(''); setTempImageUri(''); }}
                style={[styles.removePhotoBtn, { backgroundColor: colors.danger }]}
              >
                <Ionicons name="close" size={16} color="#FFF" />
              </Pressable>
            </View>
          ) : (
            <Pressable
              onPress={handlePickImage}
              style={[
                styles.photoBtn,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  borderRadius: borderRadius.input,
                },
              ]}
            >
              <Ionicons name="camera-outline" size={28} color={colors.muted} />
              <Text style={[styles.photoBtnText, { color: colors.muted }]}>Chụp ảnh / Chọn ảnh</Text>
            </Pressable>
          )}
        </View>

        {/* Submit Button */}
        <Pressable
          onPress={handleSubmit}
          disabled={createMutation.isPending || isSavingImage}
          style={({ pressed }) => [
            styles.submitBtn,
            {
              backgroundColor: colors.accent,
              borderRadius: borderRadius.button,
              opacity: pressed || createMutation.isPending || isSavingImage ? 0.85 : 1,
              transform: [{ scale: pressed ? 0.98 : 1 }],
            },
            shadow,
          ]}
        >
          {createMutation.isPending || isSavingImage ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Ionicons name="add-circle-outline" size={20} color="#FFF" />
              <Text style={styles.submitText}>Tạo bài tập</Text>
            </>
          )}
        </Pressable>
      </ScrollView>

      {/* Course Picker Modal */}
      <Modal visible={showCoursePicker} transparent animationType="slide">
        <Pressable style={styles.modalOverlay} onPress={() => setShowCoursePicker(false)}>
          <View
            style={[
              styles.modalContent,
              {
                backgroundColor: colors.card,
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Chọn môn học</Text>
              <Pressable onPress={() => setShowCoursePicker(false)}>
                <Ionicons name="close-circle" size={24} color={colors.muted} />
              </Pressable>
            </View>
            <FlatList
              data={courses ?? []}
              keyExtractor={(item) => item.id}
              renderItem={renderCourseItem}
            />
          </View>
        </Pressable>
      </Modal>
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
  fieldGroup: {
    marginBottom: 18,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingHorizontal: 12,
    minHeight: 48,
    gap: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    minHeight: 48,
  },
  selectedCourseText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  placeholderText: {
    flex: 1,
    fontSize: 14,
  },
  textAreaWrapper: {
    borderWidth: 1,
    padding: 12,
  },
  textArea: {
    fontSize: 14,
    minHeight: 80,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
  courseDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  // Photo
  photoBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    borderWidth: 1,
    borderStyle: 'dashed',
    gap: 8,
  },
  photoBtnText: {
    fontSize: 13,
    fontWeight: '500',
  },
  photoPreview: {
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: 200,
  },
  removePhotoBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Submit
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    minHeight: 52,
    marginTop: 8,
  },
  submitText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    maxHeight: '50%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  courseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    gap: 10,
  },
  courseItemText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
});
