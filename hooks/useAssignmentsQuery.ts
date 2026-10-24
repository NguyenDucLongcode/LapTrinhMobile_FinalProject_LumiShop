// hooks/useAssignmentsQuery.ts
// TanStack Query hooks cho Assignment (Bài tập) — bao gồm Optimistic Update

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { assignmentApi } from '../api/assignmentApi';
import { assignmentKeys } from './queryKeys';
import { Assignment, AssignmentInput } from '../types';

/** Lấy tất cả bài tập */
export function useAssignments() {
  return useQuery({
    queryKey: assignmentKeys.lists(),
    queryFn: assignmentApi.getAll,
  });
}

/** Lấy bài tập theo ID */
export function useAssignment(id: string) {
  return useQuery({
    queryKey: assignmentKeys.detail(id),
    queryFn: () => assignmentApi.getById(id),
    enabled: !!id,
  });
}

/** Lấy bài tập theo courseId */
export function useAssignmentsByCourse(courseId: string) {
  return useQuery({
    queryKey: assignmentKeys.byCourse(courseId),
    queryFn: () => assignmentApi.getByCourseId(courseId),
    enabled: !!courseId,
  });
}

/** Tạo bài tập mới */
export function useCreateAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AssignmentInput) => assignmentApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assignmentKeys.all });
    },
  });
}

/** Cập nhật bài tập — Optimistic Update */
export function useUpdateAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Assignment> }) =>
      assignmentApi.update(id, data),

    // Optimistic Update
    onMutate: async ({ id, data }) => {
      // Hủy các queries đang fetch để tránh conflict
      await queryClient.cancelQueries({ queryKey: assignmentKeys.lists() });
      await queryClient.cancelQueries({ queryKey: assignmentKeys.detail(id) });

      // Snapshot dữ liệu cũ để rollback nếu lỗi
      const previousList = queryClient.getQueryData<Assignment[]>(assignmentKeys.lists());
      const previousDetail = queryClient.getQueryData<Assignment>(assignmentKeys.detail(id));

      // Cập nhật ngay lập tức trên UI (Optimistic)
      if (previousList) {
        queryClient.setQueryData<Assignment[]>(
          assignmentKeys.lists(),
          previousList.map((item) => (item.id === id ? { ...item, ...data } : item))
        );
      }
      if (previousDetail) {
        queryClient.setQueryData<Assignment>(assignmentKeys.detail(id), {
          ...previousDetail,
          ...data,
        });
      }

      return { previousList, previousDetail };
    },

    // Rollback nếu API lỗi
    onError: (_err, { id }, context) => {
      if (context?.previousList) {
        queryClient.setQueryData(assignmentKeys.lists(), context.previousList);
      }
      if (context?.previousDetail) {
        queryClient.setQueryData(assignmentKeys.detail(id), context.previousDetail);
      }
    },

    // Đồng bộ lại từ server sau khi hoàn tất
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: assignmentKeys.all });
    },
  });
}

/** Xóa bài tập */
export function useDeleteAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => assignmentApi.remove(id),

    // Optimistic Delete
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: assignmentKeys.lists() });

      const previousList = queryClient.getQueryData<Assignment[]>(assignmentKeys.lists());

      if (previousList) {
        queryClient.setQueryData<Assignment[]>(
          assignmentKeys.lists(),
          previousList.filter((item) => item.id !== id)
        );
      }

      return { previousList };
    },

    onError: (_err, _id, context) => {
      if (context?.previousList) {
        queryClient.setQueryData(assignmentKeys.lists(), context.previousList);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: assignmentKeys.all });
    },
  });
}
