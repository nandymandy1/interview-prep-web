'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { QUERY_KEYS } from '@/constants';
import { serviceContainer } from '@/providers/service-container';
import { ApiClientError } from '@/services/http/api-client.service';
import { useAuthStore } from '@/stores/auth/auth.store';
import type { LoginInput, RegisterInput } from '@/types/auth/auth.type';

export const useCurrentUser = () => {
  const setUser = useAuthStore((state) => state.setUser);
  const clearUser = useAuthStore((state) => state.clearUser);

  const query = useQuery({
    queryKey: QUERY_KEYS.auth.me,
    queryFn: () => serviceContainer.authService().me(),
    retry: false,
  });

  useEffect(() => {
    if (query.data?.user) {
      setUser(query.data.user);
      return;
    }

    if (query.error instanceof ApiClientError && query.error.statusCode === 401) {
      clearUser();
    }
  }, [clearUser, query.data, query.error, setUser]);

  return query;
};

export const useLogin = () => {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: (input: LoginInput) => serviceContainer.authService().login(input),
    onSuccess: async ({ user }) => {
      setUser(user);
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.auth.me });
    },
  });
};

export const useRegister = () => {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: (input: RegisterInput) => serviceContainer.authService().register(input),
    onSuccess: async ({ user }) => {
      setUser(user);
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.auth.me });
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  const clearUser = useAuthStore((state) => state.clearUser);

  return useMutation({
    mutationFn: () => serviceContainer.authService().logout(),
    onSuccess: () => {
      clearUser();
      queryClient.clear();
    },
  });
};
