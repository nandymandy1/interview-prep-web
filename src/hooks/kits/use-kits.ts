'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants';
import { serviceContainer } from '@/providers/service-container';
import type {
  AddFlashcardInput,
  AddQuestionInput,
  CreateKitInput,
  RecordPracticeInput,
  RegenerateSectionInput,
  ReorderQuestionsInput,
  UpdateBriefInput,
  UpdateFlashcardInput,
  UpdateQuestionInput,
} from '@/types/kits/kit.type';

export type KitsQueryParams = {
  page: number;
  limit: number;
};

export const useKits = (params: KitsQueryParams) =>
  useQuery({
    queryKey: QUERY_KEYS.kits.list(params),
    queryFn: () => serviceContainer.kitService().list(params),
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

const useInvalidateKit = (kitId: string) => {
  const queryClient = useQueryClient();

  return async (): Promise<void> => {
    await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.kits.detail(kitId) });
  };
};

export const useAddQuestion = (kitId: string) => {
  const invalidateKit = useInvalidateKit(kitId);

  return useMutation({
    mutationFn: (input: AddQuestionInput) =>
      serviceContainer.kitService().addQuestion(kitId, input),
    onSuccess: invalidateKit,
  });
};

export const useReorderQuestions = (kitId: string) => {
  const invalidateKit = useInvalidateKit(kitId);

  return useMutation({
    mutationFn: (input: ReorderQuestionsInput) =>
      serviceContainer.kitService().reorderQuestions(kitId, input),
    onSuccess: invalidateKit,
  });
};

export const useDeleteQuestion = (kitId: string) => {
  const invalidateKit = useInvalidateKit(kitId);

  return useMutation({
    mutationFn: (questionId: string) =>
      serviceContainer.kitService().deleteQuestion(kitId, questionId),
    onSuccess: invalidateKit,
  });
};

export const useAddFlashcard = (kitId: string) => {
  const invalidateKit = useInvalidateKit(kitId);

  return useMutation({
    mutationFn: (input: AddFlashcardInput) =>
      serviceContainer.kitService().addFlashcard(kitId, input),
    onSuccess: invalidateKit,
  });
};

export const useUpdateFlashcard = (kitId: string, flashcardId: string) => {
  const invalidateKit = useInvalidateKit(kitId);

  return useMutation({
    mutationFn: (input: UpdateFlashcardInput) =>
      serviceContainer.kitService().updateFlashcard(kitId, flashcardId, input),
    onSuccess: invalidateKit,
  });
};

export const useDeleteFlashcard = (kitId: string) => {
  const invalidateKit = useInvalidateKit(kitId);

  return useMutation({
    mutationFn: (flashcardId: string) =>
      serviceContainer.kitService().deleteFlashcard(kitId, flashcardId),
    onSuccess: invalidateKit,
  });
};

export const useUpdateBrief = (kitId: string) => {
  const invalidateKit = useInvalidateKit(kitId);

  return useMutation({
    mutationFn: (input: UpdateBriefInput) =>
      serviceContainer.kitService().updateBrief(kitId, input),
    onSuccess: invalidateKit,
  });
};

export const useRecordPractice = (kitId: string, flashcardId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: RecordPracticeInput) =>
      serviceContainer.kitService().recordPractice(kitId, flashcardId, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.kits.detail(kitId) });
    },
  });
};
