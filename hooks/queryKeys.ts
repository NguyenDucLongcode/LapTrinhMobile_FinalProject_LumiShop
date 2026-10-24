// hooks/queryKeys.ts
// Định nghĩa query keys cho TanStack Query — tránh trùng lặp và dễ invalidate

export const courseKeys = {
  all: ['courses'] as const,
  lists: () => [...courseKeys.all, 'list'] as const,
  detail: (id: string) => [...courseKeys.all, 'detail', id] as const,
};

export const assignmentKeys = {
  all: ['assignments'] as const,
  lists: () => [...assignmentKeys.all, 'list'] as const,
  detail: (id: string) => [...assignmentKeys.all, 'detail', id] as const,
  byCourse: (courseId: string) => [...assignmentKeys.all, 'byCourse', courseId] as const,
};

export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
};
