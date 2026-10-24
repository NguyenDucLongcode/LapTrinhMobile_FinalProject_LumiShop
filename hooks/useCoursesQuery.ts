// hooks/useCoursesQuery.ts
// TanStack Query hooks cho Course (Môn học)

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { courseApi } from '../api/courseApi';
import { courseKeys } from './queryKeys';
import { Course, CourseInput } from '../types';

/** Lấy tất cả môn học */
export function useCourses() {
  return useQuery({
    queryKey: courseKeys.lists(),
    queryFn: courseApi.getAll,
  });
}

/** Lấy môn học theo ID */
export function useCourse(id: string) {
  return useQuery({
    queryKey: courseKeys.detail(id),
    queryFn: () => courseApi.getById(id),
    enabled: !!id,
  });
}

/** Tạo môn học mới */
export function useCreateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CourseInput) => courseApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseKeys.all });
    },
  });
}

/** Cập nhật môn học */
export function useUpdateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Course> }) =>
      courseApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseKeys.all });
    },
  });
}

/** Xóa môn học */
export function useDeleteCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => courseApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseKeys.all });
    },
  });
}
