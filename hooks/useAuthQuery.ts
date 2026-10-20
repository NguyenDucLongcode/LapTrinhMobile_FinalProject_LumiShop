// hooks/useAuthQuery.ts
// TanStack Query: đăng nhập bằng useMutation -> userApi.login

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from '../api/userApi';
import { userKeys } from './queryKeys';

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ username, password }: { username: string; password: string }) =>
      userApi.login(username, password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}
