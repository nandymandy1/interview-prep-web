'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants';
import { serviceContainer } from '@/providers/service-container';
import type {
  CreateKitInput,
  RecordPracticeInput,
  RegenerateSectionInput,
  UpdateQuestionInput,
} from '@/types/kits/kit.type';

export const useKits = () =>
  useQuery({
    queryKey: QUERY_KEYS.kits.all,
    queryFn: () => serviceContainer.kitService().list(),
  });

export const useKit = (kitId: string) =>
  useQuery({
    queryKey: QUERY_KEYS.kits.detail(kitId),
    queryFn: () => serviceContainer.kitService().getById(kitId),
    enabled: Boolean(kitId),
  });

export const useKitStatus = (kitId: string, enabled = true) =>
  useQuery({
    queryKey: QUERY_KEYS.kits.status(kitId),
    queryFn: () => serviceContainer.kitService().getStatus(kitId),
    enabled: enabled && Boolean(kitId),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === 'completed' || status === 'failed' ? false : 1_250;
    },
  });

export const useCreateKit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateKitInput) => serviceContainer.kitService().create(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.kits.all });
    },
  });
};

export const useRegenerateKitSection = (kitId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: RegenerateSectionInput) =>
      serviceContainer.kitService().regenerate(kitId, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.kits.detail(kitId) });
    },
  });
};

export const useUpdateQuestion = (kitId: string, questionId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateQuestionInput) =>
      serviceContainer.kitService().updateQuestion(kitId, questionId, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.kits.detail(kitId) });
    },
  });
};

export const useRecordPractice = (kitId: string, flashcardId: string) =>
  useMutation({
    mutationFn: (input: RecordPracticeInput) =>
      serviceContainer.kitService().recordPractice(kitId, flashcardId, input),
  });
