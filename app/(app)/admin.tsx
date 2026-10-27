// app/(app)/(tabs)/admin.tsx
// Màn hình Dashboard Admin Study Planner — Thống kê, Quản lý Môn học (Search, CRUD, Xem bài tập), Quản lý Bài tập (Search, CRUD, Sửa)

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  TextInput,
  Modal,
  Alert,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../../theme/useTheme';
import { useCourses, useCreateCourse, useUpdateCourse, useDeleteCourse } from '../../hooks/useCoursesQuery';
import { useAssignments, useDeleteAssignment, useUpdateAssignment } from '../../hooks/useAssignmentsQuery';
import { useAuthStore } from '../../store/authStore';
import { Course, Assignment, AssignmentStatus } from '../../types';
import { formatDueDate } from '../../utils/dateHelpers';
import { saveImagePermanently } from '../../utils/imageHelper';
import DateTimePickerInput from '../../components/DateTimePickerInput';

const PRESET_COLORS = [
  '#6366F1', // Indigo
  '#F59E0B', // Amber
  '#10B981', // Emerald
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#06B6D4', // Cyan
  '#EC4899', // Pink
  '#3B82F6', // Blue
];

type AdminTab = 'courses' | 'assignments';

export default function AdminScreen() {
  const router = useRouter();
  const { colors, borderRadius, shadow, shadowSm } = useTheme();
  const logout = useAuthStore((s) => s.logout);

  const { data: courses, isLoading: isCoursesLoading } = useCourses();
  const { data: assignments, isLoading: isAssignmentsLoading } = useAssignments();

  const createCourseMutation = useCreateCourse();
  const updateCourseMutation = useUpdateCourse();
  const deleteCourseMutation = useDeleteCourse();

  const updateAssignmentMutation = useUpdateAssignment();
  const deleteAssignmentMutation = useDeleteAssignment();

  // Active section tab
  const [activeSection, setActiveSection] = useState<AdminTab>('courses');

  // ── YÊU CẦU 2: Search inputs ──
  const [courseSearch, setCourseSearch] = useState('');
  const [assignmentSearch, setAssignmentSearch] = useState('');

  // Lọc môn học bằng useMemo
  const filteredCourses = useMemo(() => {
    if (!courses) return [];
    if (!courseSearch.trim()) return courses;
    const q = courseSearch.toLowerCase().trim();
    return courses.filter(
      (c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)
    );
  }, [courses, courseSearch]);

  // Lọc bài tập bằng useMemo
  const filteredAssignments = useMemo(() => {
    if (!assignments) return [];
    if (!assignmentSearch.trim()) return assignments;
    const q = assignmentSearch.toLowerCase().trim();
    return assignments.filter((a) => a.title.toLowerCase().includes(q));
  }, [assignments, assignmentSearch]);

  // ── Modal Course state (CRUD) ──
  const [courseModalVisible, setCourseModalVisible] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [courseCode, setCourseCode] = useState('');
  const [courseName, setCourseName] = useState('');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
  const [courseErrorMessage, setCourseErrorMessage] = useState('');

  // ── YÊU CẦU 3: Modal xem bài tập theo môn học (Con mắt) ──
  const [viewCourseModalVisible, setViewCourseModalVisible] = useState(false);
  const [viewingCourse, setViewingCourse] = useState<Course | null>(null);

  const courseAssignments = useMemo(() => {
    if (!assignments || !viewingCourse) return [];
    return assignments.filter((a) => a.courseId === viewingCourse.id);
  }, [assignments, viewingCourse]);

  const openViewCourseModal = (course: Course) => {
    setViewingCourse(course);
    setViewCourseModalVisible(true);
  };

  // ── YÊU CẦU 4: Modal sửa bài tập (Edit Assignment) ──
  const [editAssignmentModalVisible, setEditAssignmentModalVisible] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCourseId, setEditCourseId] = useState('');
  const [editDueDateTime, setEditDueDateTime] = useState<Date>(new Date());
  const [editNotes, setEditNotes] = useState('');
  const [editStatus, setEditStatus] = useState<AssignmentStatus>('pending');
  const [editAssignmentError, setEditAssignmentError] = useState('');
  const [editPhotoUri, setEditPhotoUri] = useState<string>('');
  const [editIsSavingImage, setEditIsSavingImage] = useState(false);

  const openCreateCourseModal = () => {
    setEditingCourse(null);
    setCourseCode('');
    setCourseName('');
    setSelectedColor(PRESET_COLORS[0]);
    setCourseErrorMessage('');
    setCourseModalVisible(true);
  };

  const openEditCourseModal = (course: Course) => {
    setEditingCourse(course);
    setCourseCode(course.code);
    setCourseName(course.name);
    setSelectedColor(course.color || PRESET_COLORS[0]);
    setCourseErrorMessage('');
    setCourseModalVisible(true);
  };

  const handleSaveCourse = async () => {
    if (!courseCode.trim() || !courseName.trim()) {
      setCourseErrorMessage('Vui lòng nhập đầy đủ mã và tên môn học!');
      return;
    }

    try {
      if (editingCourse) {
        await updateCourseMutation.mutateAsync({
          id: editingCourse.id,
          data: { code: courseCode.trim(), name: courseName.trim(), color: selectedColor },
        });
      } else {
        await createCourseMutation.mutateAsync({
          code: courseCode.trim(),
          name: courseName.trim(),
          color: selectedColor,
        });
      }
      setCourseModalVisible(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Có lỗi xảy ra khi lưu môn học!';
      setCourseErrorMessage(msg);
    }
  };

  const handleDeleteCourse = useCallback(
    (course: Course) => {
      const doDelete = async () => {
        try {
          await deleteCourseMutation.mutateAsync(course.id);
        } catch {
          const msg = 'Không thể xóa môn học!';
          if (Platform.OS === 'web') alert(msg);
          else Alert.alert('Lỗi', msg);
        }
      };

      if (Platform.OS === 'web') {
        if (confirm(`Bạn có chắc muốn xóa môn "${course.name}"?`)) doDelete();
      } else {
        Alert.alert('Xác nhận xóa', `Bạn có chắc muốn xóa môn "${course.name}"?`, [
          { text: 'Hủy', style: 'cancel' },
          { text: 'Xóa', style: 'destructive', onPress: doDelete },
        ]);
      }
    },
    [deleteCourseMutation]
  );

  // Mở modal sửa bài tập
  const openEditAssignmentModal = (assignment: Assignment) => {
    setEditingAssignment(assignment);
    setEditTitle(assignment.title);
    setEditCourseId(assignment.courseId);
    setEditNotes(assignment.notes || '');
    setEditStatus(assignment.status);
    setEditPhotoUri(assignment.photoUri || '');
    setEditAssignmentError('');

    try {
      setEditDueDateTime(new Date(assignment.dueAt));
    } catch {
      setEditDueDateTime(new Date());
    }

    setEditAssignmentModalVisible(true);
  };

  const handleSaveAssignment = async () => {
    if (!editingAssignment) return;
    if (!editTitle.trim()) {
      setEditAssignmentError('Vui lòng nhập tên bài tập!');
      return;
    }
    if (!editCourseId) {
      setEditAssignmentError('Vui lòng chọn môn học!');
      return;
    }
    if (editDueDateTime <= new Date()) {
      setEditAssignmentError('Hạn chót không được ở quá khứ!');
      return;
    }

    const parsedDue = editDueDateTime.toISOString();

    try {
      // Lưu ảnh vĩnh viễn nếu ảnh thay đổi hoặc ảnh là blob (chưa được chuyển thành Base64)
      let permanentPhotoUri = editPhotoUri;
      if (
        editPhotoUri &&
        !editPhotoUri.startsWith('data:') &&
        (!editingAssignment.photoUri?.startsWith('data:') || editPhotoUri !== editingAssignment.photoUri)
      ) {
        setEditIsSavingImage(true);
        try {
          permanentPhotoUri = await saveImagePermanently(editPhotoUri);
        } catch (imgErr) {
          console.warn('Lỗi lưu ảnh khi sửa:', imgErr);
        } finally {
          setEditIsSavingImage(false);
        }
      }

      await updateAssignmentMutation.mutateAsync({
        id: editingAssignment.id,
        data: {
          title: editTitle.trim(),
          courseId: editCourseId,
          dueAt: parsedDue,
          notes: editNotes.trim(),
          status: editStatus,
          photoUri: permanentPhotoUri,
        },
      });
      setEditAssignmentModalVisible(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Có lỗi khi lưu bài tập!';
      setEditAssignmentError(msg);
    }
  };

  const handleDeleteAssignment = useCallback(
    (assignment: Assignment) => {
      const doDelete = async () => {
        try {
          await deleteAssignmentMutation.mutateAsync(assignment.id);
        } catch {
          const msg = 'Không thể xóa bài tập!';
          if (Platform.OS === 'web') alert(msg);
          else Alert.alert('Lỗi', msg);
        }
      };

      if (Platform.OS === 'web') {
        if (confirm(`Bạn có chắc muốn xóa bài tập "${assignment.title}"?`)) doDelete();
      } else {
        Alert.alert('Xác nhận xóa', `Bạn có chắc muốn xóa bài tập "${assignment.title}"?`, [
          { text: 'Hủy', style: 'cancel' },
          { text: 'Xóa', style: 'destructive', onPress: doDelete },
        ]);
      }
    },
    [deleteAssignmentMutation]
  );

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/sign-in');
  };

  // Hàm chọn ảnh cho Edit modal
  const handleEditPickImage = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setEditPhotoUri(result.assets[0].uri);
    }
  }, []);

  // Render môn học có icon Con mắt, Sửa, Xóa
  const renderCourseItem = useCallback(
    ({ item }: { item: Course }) => (
      <View
        style={[
          styles.cardItem,
          {
            backgroundColor: colors.card,
            borderRadius: borderRadius.card,
            borderLeftColor: item.color,
          },
          shadowSm,
        ]}
      >
        <View style={[styles.codeBadge, { backgroundColor: item.color + '20' }]}>
          <Text style={[styles.codeBadgeText, { color: item.color }]}>{item.code}</Text>
        </View>

        <View style={styles.cardInfo}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>{item.name}</Text>
          <Text style={[styles.cardSubtitle, { color: colors.muted }]}>Màu: {item.color}</Text>
        </View>

        <View style={styles.actionRow}>
          {/* Con mắt xem bài tập của môn */}
          <Pressable
            onPress={() => openViewCourseModal(item)}
            style={[styles.actionBtn, { backgroundColor: colors.accentLight }]}
          >
            <Ionicons name="eye-outline" size={16} color={colors.accent} />
          </Pressable>
          <Pressable
            onPress={() => openEditCourseModal(item)}
            style={[styles.actionBtn, { backgroundColor: '#E0E7FF' }]}
          >
            <Ionicons name="pencil" size={16} color={colors.accent} />
          </Pressable>
          <Pressable
            onPress={() => handleDeleteCourse(item)}
            style={[styles.actionBtn, { backgroundColor: '#FEE2E2' }]}
          >
            <Ionicons name="trash" size={16} color={colors.danger} />
          </Pressable>
        </View>
      </View>
    ),
    [colors, borderRadius, shadowSm, handleDeleteCourse]
  );

  // Render bài tập có icon Xem, Sửa, Xóa
  const renderAssignmentItem = useCallback(
    ({ item }: { item: Assignment }) => {
      const course = courses?.find((c) => c.id === item.courseId);
      const isCompleted = item.status === 'completed';

      return (
        <View
          style={[
            styles.cardItem,
            {
              backgroundColor: colors.card,
              borderRadius: borderRadius.card,
              borderLeftColor: course?.color ?? colors.accent,
            },
            shadowSm,
          ]}
        >
          <View style={styles.cardInfo}>
            <Text
              style={[
                styles.cardTitle,
                { color: isCompleted ? colors.muted : colors.text },
                isCompleted && { textDecorationLine: 'line-through' },
              ]}
              numberOfLines={1}
            >
              {item.title}
            </Text>
            <Text style={[styles.cardSubtitle, { color: colors.muted }]}>
              {course ? `${course.code} • ` : ''}
              {formatDueDate(item.dueAt)}
            </Text>
          </View>

          <View style={styles.actionRow}>
            {/* Xem chi tiết */}
            <Pressable
              onPress={() =>
                router.push({
                  pathname: '/assignment/[id]',
                  params: { id: item.id },
                })
              }
              style={[styles.actionBtn, { backgroundColor: colors.accentLight }]}
            >
              <Ionicons name="eye-outline" size={16} color={colors.accent} />
            </Pressable>
            {/* Nút Sửa */}
            <Pressable
              onPress={() => openEditAssignmentModal(item)}
              style={[styles.actionBtn, { backgroundColor: '#FEF3C7' }]}
            >
              <Ionicons name="pencil-outline" size={16} color="#D97706" />
            </Pressable>
            {/* Nút Xóa */}
            <Pressable
              onPress={() => handleDeleteAssignment(item)}
              style={[styles.actionBtn, { backgroundColor: '#FEE2E2' }]}
            >
              <Ionicons name="trash" size={16} color={colors.danger} />
            </Pressable>
          </View>
        </View>
      );
    },
    [courses, colors, borderRadius, shadowSm, router, handleDeleteAssignment]
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.roleBadge, { color: colors.accent }]}>🛡️ Quản trị hệ thống</Text>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Admin Dashboard</Text>
        </View>
        <Pressable onPress={handleLogout} style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={22} color={colors.muted} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Thống kê Tổng quan (KPI Widgets) */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderRadius: borderRadius.card }, shadow]}>
            <View style={[styles.statIconBox, { backgroundColor: colors.accentLight }]}>
              <Ionicons name="book" size={24} color={colors.accent} />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>{courses?.length ?? 0}</Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>Tổng số Môn học</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.card, borderRadius: borderRadius.card }, shadow]}>
            <View style={[styles.statIconBox, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="document-text" size={24} color="#D97706" />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>{assignments?.length ?? 0}</Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>Tổng số Bài tập</Text>
          </View>
        </View>

        {/* Nút điều hướng các phần Quản lý */}
        <View style={styles.sectionTabs}>
          <Pressable
            onPress={() => setActiveSection('courses')}
            style={[
              styles.sectionTab,
              activeSection === 'courses' && [styles.activeTab, { borderBottomColor: colors.accent }],
            ]}
          >
            <Ionicons
              name="albums-outline"
              size={18}
              color={activeSection === 'courses' ? colors.accent : colors.muted}
            />
            <Text
              style={[
                styles.tabText,
                { color: activeSection === 'courses' ? colors.accent : colors.muted },
                activeSection === 'courses' && { fontWeight: '800' },
              ]}
            >
              Quản lý Môn học ({courses?.length ?? 0})
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setActiveSection('assignments')}
            style={[
              styles.sectionTab,
              activeSection === 'assignments' && [styles.activeTab, { borderBottomColor: colors.accent }],
            ]}
          >
            <Ionicons
              name="clipboard-outline"
              size={18}
              color={activeSection === 'assignments' ? colors.accent : colors.muted}
            />
            <Text
              style={[
                styles.tabText,
                { color: activeSection === 'assignments' ? colors.accent : colors.muted },
                activeSection === 'assignments' && { fontWeight: '800' },
              ]}
            >
              Quản lý Bài tập ({assignments?.length ?? 0})
            </Text>
          </Pressable>
        </View>

        {/* Action bar (nút Tạo tương ứng theo tab) */}
        <View style={styles.actionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {activeSection === 'courses' ? 'Danh sách môn học' : 'Danh sách bài tập toàn hệ thống'}
          </Text>
          {activeSection === 'courses' ? (
            <Pressable
              onPress={openCreateCourseModal}
              style={[styles.createBtn, { backgroundColor: colors.accent, borderRadius: borderRadius.button }]}
            >
              <Ionicons name="add" size={16} color="#FFF" />
              <Text style={styles.createBtnText}>Thêm môn</Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={() => router.push('/assignment/create')}
              style={[styles.createBtn, { backgroundColor: colors.accent, borderRadius: borderRadius.button }]}
            >
              <Ionicons name="add" size={16} color="#FFF" />
              <Text style={styles.createBtnText}>Thêm bài tập</Text>
            </Pressable>
          )}
        </View>

        {/* YÊU CẦU 2: Search Bar độc lập cho từng phần */}
        {activeSection === 'courses' ? (
          <View
            style={[
              styles.searchBar,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                borderRadius: borderRadius.input,
              },
              shadowSm,
            ]}
          >
            <Ionicons name="search" size={18} color={colors.muted} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Tìm theo tên hoặc mã môn..."
              placeholderTextColor={colors.muted}
              value={courseSearch}
              onChangeText={setCourseSearch}
              autoCorrect={false}
            />
            {courseSearch.length > 0 && (
              <Pressable onPress={() => setCourseSearch('')}>
                <Ionicons name="close-circle" size={18} color={colors.muted} />
              </Pressable>
            )}
          </View>
        ) : (
          <View
            style={[
              styles.searchBar,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                borderRadius: borderRadius.input,
              },
              shadowSm,
            ]}
          >
            <Ionicons name="search" size={18} color={colors.muted} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Tìm theo tên bài tập..."
              placeholderTextColor={colors.muted}
              value={assignmentSearch}
              onChangeText={setAssignmentSearch}
              autoCorrect={false}
            />
            {assignmentSearch.length > 0 && (
              <Pressable onPress={() => setAssignmentSearch('')}>
                <Ionicons name="close-circle" size={18} color={colors.muted} />
              </Pressable>
            )}
          </View>
        )}

        {/* Nội dung danh sách theo tab */}
        {activeSection === 'courses' ? (
          isCoursesLoading ? (
            <ActivityIndicator size="small" color={colors.accent} style={{ marginTop: 20 }} />
          ) : (
            <FlatList
              data={filteredCourses}
              keyExtractor={(c) => c.id}
              renderItem={renderCourseItem}
              scrollEnabled={false}
              ListEmptyComponent={
                <Text style={[styles.emptyText, { color: colors.muted }]}>
                  {courseSearch ? 'Không tìm thấy môn học nào khớp' : 'Chưa có môn học nào'}
                </Text>
              }
            />
          )
        ) : isAssignmentsLoading ? (
          <ActivityIndicator size="small" color={colors.accent} style={{ marginTop: 20 }} />
        ) : (
          <FlatList
            data={filteredAssignments}
            keyExtractor={(a) => a.id}
            renderItem={renderAssignmentItem}
            scrollEnabled={false}
            ListEmptyComponent={
              <Text style={[styles.emptyText, { color: colors.muted }]}>
                {assignmentSearch ? 'Không tìm thấy bài tập nào khớp' : 'Chưa có bài tập nào'}
              </Text>
            }
          />
        )}
      </ScrollView>

      {/* Modal Thêm / Chỉnh sửa Course */}
      <Modal visible={courseModalVisible} transparent animationType="slide">
        <Pressable style={styles.modalOverlay} onPress={() => setCourseModalVisible(false)}>
          <Pressable
            style={[styles.modalContent, { backgroundColor: colors.card, borderRadius: borderRadius.card }, shadow]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {editingCourse ? 'Chỉnh sửa môn học' : 'Thêm môn học mới'}
              </Text>
              <Pressable onPress={() => setCourseModalVisible(false)}>
                <Ionicons name="close-circle" size={24} color={colors.muted} />
              </Pressable>
            </View>

            {courseErrorMessage ? (
              <View style={[styles.errorBox, { backgroundColor: '#FEE2E2', borderColor: colors.danger }]}>
                <Ionicons name="alert-circle" size={16} color={colors.danger} />
                <Text style={{ color: colors.danger, fontSize: 13, flex: 1 }}>{courseErrorMessage}</Text>
              </View>
            ) : null}

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Mã môn (Course Code)</Text>
              <TextInput
                style={[
                  styles.textInput,
                  { backgroundColor: colors.bg, borderColor: colors.border, borderRadius: borderRadius.input, color: colors.text },
                ]}
                placeholder="VD: CS101, MA201..."
                placeholderTextColor={colors.muted}
                value={courseCode}
                onChangeText={setCourseCode}
                autoCapitalize="characters"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Tên môn học</Text>
              <TextInput
                style={[
                  styles.textInput,
                  { backgroundColor: colors.bg, borderColor: colors.border, borderRadius: borderRadius.input, color: colors.text },
                ]}
                placeholder="VD: Lập trình Mobile..."
                placeholderTextColor={colors.muted}
                value={courseName}
                onChangeText={setCourseName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Màu đại diện</Text>
              <View style={styles.colorPalette}>
                {PRESET_COLORS.map((col) => (
                  <Pressable
                    key={col}
                    onPress={() => setSelectedColor(col)}
                    style={[styles.colorDot, { backgroundColor: col }, selectedColor === col && styles.selectedColorDot]}
                  >
                    {selectedColor === col && <Ionicons name="checkmark" size={14} color="#FFF" />}
                  </Pressable>
                ))}
              </View>
            </View>

            <Pressable
              onPress={handleSaveCourse}
              disabled={createCourseMutation.isPending || updateCourseMutation.isPending}
              style={[
                styles.saveBtn,
                {
                  backgroundColor: colors.accent,
                  borderRadius: borderRadius.button,
                  opacity: createCourseMutation.isPending || updateCourseMutation.isPending ? 0.7 : 1,
                },
              ]}
            >
              {createCourseMutation.isPending || updateCourseMutation.isPending ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.saveBtnText}>Lưu môn học</Text>
              )}
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      {/* YÊU CẦU 3: Modal Xem bài tập theo môn học (Con mắt) */}
      <Modal visible={viewCourseModalVisible} transparent animationType="slide">
        <Pressable style={styles.modalOverlay} onPress={() => setViewCourseModalVisible(false)}>
          <Pressable
            style={[
              styles.modalContent,
              { backgroundColor: colors.card, borderRadius: borderRadius.card, maxHeight: '80%' },
              shadow,
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.modalTitle, { color: colors.text }]} numberOfLines={1}>
                  {viewingCourse?.name}
                </Text>
                <Text style={{ color: colors.muted, fontSize: 13 }}>
                  Mã môn: {viewingCourse?.code} • {courseAssignments.length} bài tập
                </Text>
              </View>
              <Pressable onPress={() => setViewCourseModalVisible(false)}>
                <Ionicons name="close-circle" size={24} color={colors.muted} />
              </Pressable>
            </View>

            <FlatList
              data={courseAssignments}
              keyExtractor={(a) => a.id}
              contentContainerStyle={{ paddingVertical: 10 }}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => {
                    setViewCourseModalVisible(false);
                    router.push({
                      pathname: '/assignment/[id]',
                      params: { id: item.id },
                    });
                  }}
                  style={[
                    styles.simpleAssignmentRow,
                    { borderBottomColor: colors.border },
                  ]}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.assignmentRowTitle,
                        { color: item.status === 'completed' ? colors.muted : colors.text },
                        item.status === 'completed' && { textDecorationLine: 'line-through' },
                      ]}
                    >
                      {item.title}
                    </Text>
                    <Text style={{ color: colors.muted, fontSize: 12 }}>
                      {formatDueDate(item.dueAt)}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.statusPill,
                      {
                        backgroundColor:
                          item.status === 'completed' ? colors.success + '20' : colors.warning + '20',
                      },
                    ]}
                  >
                    <Text
                      style={{
                        fontSize: 11,
                        fontWeight: '700',
                        color: item.status === 'completed' ? colors.success : colors.warning,
                      }}
                    >
                      {item.status === 'completed' ? 'Hoàn thành' : 'Đang làm'}
                    </Text>
                  </View>
                </Pressable>
              )}
              ListEmptyComponent={
                <Text style={[styles.emptyText, { color: colors.muted, marginVertical: 20 }]}>
                  Môn học này chưa có bài tập nào
                </Text>
              }
            />
          </Pressable>
        </Pressable>
      </Modal>

      {/* YÊU CẦU 4: Modal Sửa bài tập (Edit Assignment) */}
      <Modal visible={editAssignmentModalVisible} transparent animationType="slide">
        <Pressable style={styles.modalOverlay} onPress={() => setEditAssignmentModalVisible(false)}>
          <Pressable
            style={[
              styles.modalContent,
              { backgroundColor: colors.card, borderRadius: borderRadius.card, maxHeight: '90%' },
              shadow,
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Sửa bài tập</Text>
              <Pressable onPress={() => setEditAssignmentModalVisible(false)}>
                <Ionicons name="close-circle" size={24} color={colors.muted} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 10 }}>
              {editAssignmentError ? (
                <View style={[styles.errorBox, { backgroundColor: '#FEE2E2', borderColor: colors.danger }]}>
                  <Ionicons name="alert-circle" size={16} color={colors.danger} />
                  <Text style={{ color: colors.danger, fontSize: 13, flex: 1 }}>{editAssignmentError}</Text>
                </View>
              ) : null}

              {/* Title */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Tên bài tập</Text>
                <TextInput
                  style={[
                    styles.textInput,
                    { backgroundColor: colors.bg, borderColor: colors.border, borderRadius: borderRadius.input, color: colors.text },
                  ]}
                  value={editTitle}
                  onChangeText={setEditTitle}
                />
              </View>

              {/* Course Selection */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Môn học</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row', gap: 8 }}>
                  {courses?.map((c) => {
                    const isSelected = editCourseId === c.id;
                    return (
                      <Pressable
                        key={c.id}
                        onPress={() => setEditCourseId(c.id)}
                        style={[
                          styles.courseChoiceChip,
                          {
                            backgroundColor: isSelected ? c.color + '25' : colors.bg,
                            borderColor: isSelected ? c.color : colors.border,
                            borderRadius: borderRadius.pill,
                          },
                        ]}
                      >
                        <View style={[styles.courseDot, { backgroundColor: c.color }]} />
                        <Text style={{ color: isSelected ? c.color : colors.text, fontSize: 12, fontWeight: '600' }}>
                          {c.code}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>

              {/* Due Date & Time — DateTimePickerInput */}
              <DateTimePickerInput
                label="Hạn chót"
                value={editDueDateTime}
                onChange={(d) => {
                  setEditDueDateTime(d);
                  setEditAssignmentError('');
                }}
                minimumDate={new Date()}
                colors={colors}
                borderRadius={borderRadius}
                required
              />

              {/* Status */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Trạng thái</Text>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <Pressable
                    onPress={() => setEditStatus('pending')}
                    style={[
                      styles.statusOption,
                      {
                        backgroundColor: editStatus === 'pending' ? colors.warning + '20' : colors.bg,
                        borderColor: editStatus === 'pending' ? colors.warning : colors.border,
                        borderRadius: borderRadius.pill,
                      },
                    ]}
                  >
                    <Ionicons
                      name="time-outline"
                      size={16}
                      color={editStatus === 'pending' ? colors.warning : colors.muted}
                    />
                    <Text
                      style={{
                        color: editStatus === 'pending' ? colors.warning : colors.muted,
                        fontWeight: '700',
                        fontSize: 13,
                      }}
                    >
                      Đang làm
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => setEditStatus('completed')}
                    style={[
                      styles.statusOption,
                      {
                        backgroundColor: editStatus === 'completed' ? colors.success + '20' : colors.bg,
                        borderColor: editStatus === 'completed' ? colors.success : colors.border,
                        borderRadius: borderRadius.pill,
                      },
                    ]}
                  >
                    <Ionicons
                      name="checkmark-circle-outline"
                      size={16}
                      color={editStatus === 'completed' ? colors.success : colors.muted}
                    />
                    <Text
                      style={{
                        color: editStatus === 'completed' ? colors.success : colors.muted,
                        fontWeight: '700',
                        fontSize: 13,
                      }}
                    >
                      Hoàn thành
                    </Text>
                  </Pressable>
                </View>
              </View>

              {/* Notes */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Ghi chú</Text>
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      backgroundColor: colors.bg,
                      borderColor: colors.border,
                      borderRadius: borderRadius.input,
                      color: colors.text,
                      height: 70,
                      textAlignVertical: 'top',
                      paddingTop: 8,
                    },
                  ]}
                  value={editNotes}
                  onChangeText={setEditNotes}
                  multiline
                />
              </View>

              {/* Hình ảnh đính kèm */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Hình ảnh đính kèm</Text>
                {editPhotoUri ? (
                  <View style={{ position: 'relative' }}>
                    <Image
                      source={{ uri: editPhotoUri }}
                      style={{ width: '100%', height: 160, borderRadius: borderRadius.input }}
                      contentFit="cover"
                    />
                    <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                      <Pressable
                        onPress={handleEditPickImage}
                        style={[
                          styles.saveBtn,
                          { backgroundColor: '#6366F1', borderRadius: borderRadius.button, flex: 1, minHeight: 40 },
                        ]}
                      >
                        <Text style={[styles.saveBtnText, { fontSize: 13 }]}>Đổi ảnh</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => setEditPhotoUri('')}
                        style={[
                          styles.saveBtn,
                          { backgroundColor: '#EF4444', borderRadius: borderRadius.button, flex: 1, minHeight: 40 },
                        ]}
                      >
                        <Text style={[styles.saveBtnText, { fontSize: 13 }]}>Xóa ảnh</Text>
                      </Pressable>
                    </View>
                  </View>
                ) : (
                  <Pressable
                    onPress={handleEditPickImage}
                    style={[
                      {
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 20,
                        borderWidth: 1,
                        borderStyle: 'dashed',
                        borderColor: colors.border,
                        borderRadius: borderRadius.input,
                        gap: 6,
                        backgroundColor: colors.bg,
                      },
                    ]}
                  >
                    <Ionicons name="image-outline" size={28} color={colors.muted} />
                    <Text style={{ color: colors.muted, fontSize: 13, fontWeight: '500' }}>
                      Chọn ảnh đính kèm
                    </Text>
                  </Pressable>
                )}
              </View>

              <Pressable
                onPress={handleSaveAssignment}
                disabled={updateAssignmentMutation.isPending || editIsSavingImage}
                style={[
                  styles.saveBtn,
                  {
                    backgroundColor: colors.accent,
                    borderRadius: borderRadius.button,
                    opacity: updateAssignmentMutation.isPending || editIsSavingImage ? 0.7 : 1,
                  },
                ]}
              >
                {updateAssignmentMutation.isPending || editIsSavingImage ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.saveBtnText}>Lưu thay đổi</Text>
                )}
              </Pressable>
            </ScrollView>
          </Pressable>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  roleBadge: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
  },
  logoutBtn: {
    padding: 8,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
  },
  statIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  sectionTabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    marginBottom: 12,
  },
  sectionTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
  },
  activeTab: {
    borderBottomWidth: 2,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
  },
  actionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  createBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    gap: 8,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    height: 44,
  },
  cardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
  },
  codeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 10,
  },
  codeBadgeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  cardInfo: {
    flex: 1,
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 11,
    fontWeight: '500',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 6,
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 14,
    gap: 6,
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
  },
  textInput: {
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 46,
    fontSize: 14,
  },
  colorPalette: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
    marginTop: 4,
  },
  colorDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedColorDot: {
    borderWidth: 2.5,
    borderColor: '#FFF',
  },
  saveBtn: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  saveBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
  },
  // Sub-modal styling (View Course Assignments)
  simpleAssignmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 10,
  },
  assignmentRowTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  // Edit Assignment chips
  courseChoiceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    gap: 6,
  },
  courseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderWidth: 1.5,
    gap: 6,
  },
});
