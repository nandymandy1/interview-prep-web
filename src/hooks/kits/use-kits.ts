'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRef } from 'react';
import { QUERY_KEYS } from '@/constants';
import { serviceContainer } from '@/providers/service-container';
import { ApiClientError } from '@/services/http/api-client.service';
import { createIdempotencyKey } from '@/lib/idempotency';
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

// One key per logical action: created when the action starts, reused while
// the mutation is in flight (double-clicks, transport retries), rotated once
// settled so a new intentional click mints a new key.
const useActionKey = (): { take: () => string; rotate: () => void } => {
  const ref = useRef<string | null>(null);

  return {
    take: () => {
      if (!ref.current) {
        ref.current = createIdempotencyKey();
      }

      return ref.current;
    },
    rotate: () => {
      ref.current = null;
    },
  };
};

// A 409 means another edit won the race: refetch the latest kit so the user
// never keeps editing stale state. The conflict message itself comes from
// getErrorMessage at the call site.
const useInvalidateOnConflict = (kitId: string) => {
  const queryClient = useQueryClient();

  return async (error: unknown): Promise<void> => {
    if (error instanceof ApiClientError && error.statusCode === 409) {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.kits.detail(kitId) });
    }
  };
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
  const actionKey = useActionKey();

  return useMutation({
    mutationFn: (input: CreateKitInput) =>
      serviceContainer.kitService().create(input, { idempotencyKey: actionKey.take() }),
    onSettled: () => {
      actionKey.rotate();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.kits.all });
    },
  });
};

// User-controlled retry of a failed kit: same kitId, saved inputs reused by
// the backend. Invalidating detail + status drops the stale failed snapshot
// so status polling resumes on the queued generation.
export const useRetryKitGeneration = (kitId: string) => {
  const queryClient = useQueryClient();
  const actionKey = useActionKey();

  return useMutation({
    mutationFn: () =>
      serviceContainer.kitService().retryGeneration(kitId, { idempotencyKey: actionKey.take() }),
    onSettled: () => {
      actionKey.rotate();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.kits.detail(kitId) });
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.kits.status(kitId) });
    },
  });
};

export const useRegenerateKitSection = (kitId: string) => {
  const queryClient = useQueryClient();
  const actionKey = useActionKey();
  const invalidateOnConflict = useInvalidateOnConflict(kitId);

  return useMutation({
    mutationFn: (input: RegenerateSectionInput) =>
      serviceContainer.kitService().regenerate(kitId, input, { idempotencyKey: actionKey.take() }),
    onSettled: () => {
      actionKey.rotate();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.kits.detail(kitId) });
    },
    onError: invalidateOnConflict,
  });
};

export const useUpdateQuestion = (kitId: string, questionId: string) => {
  const queryClient = useQueryClient();
  const invalidateOnConflict = useInvalidateOnConflict(kitId);

  return useMutation({
    mutationFn: (input: UpdateQuestionInput) =>
      serviceContainer.kitService().updateQuestion(kitId, questionId, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.kits.detail(kitId) });
    },
    onError: invalidateOnConflict,
  });
};

const useInvalidateKit = (kitId: string) => {
  const queryClient = useQueryClient();

  return async (): Promise<void> => {
    await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.kits.detail(kitId) });
  };
};

const useBuilderMutation = (kitId: string) => {
  const invalidateKit = useInvalidateKit(kitId);
  const invalidateOnConflict = useInvalidateOnConflict(kitId);

  return { invalidateKit, invalidateOnConflict };
};

export const useAddQuestion = (kitId: string) => {
  const invalidateKit = useInvalidateKit(kitId);
  const invalidateOnConflict = useInvalidateOnConflict(kitId);
  const actionKey = useActionKey();

  return useMutation({
    mutationFn: (input: AddQuestionInput) =>
      serviceContainer.kitService().addQuestion(kitId, input, { idempotencyKey: actionKey.take() }),
    onSettled: () => {
      actionKey.rotate();
    },
    onSuccess: invalidateKit,
    onError: invalidateOnConflict,
  });
};

export const useReorderQuestions = (kitId: string) => {
  const { invalidateKit, invalidateOnConflict } = useBuilderMutation(kitId);

  return useMutation({
    mutationFn: (input: ReorderQuestionsInput) =>
      serviceContainer.kitService().reorderQuestions(kitId, input),
    onSuccess: invalidateKit,
    onError: invalidateOnConflict,
  });
};

export const useDeleteQuestion = (kitId: string) => {
  const { invalidateKit, invalidateOnConflict } = useBuilderMutation(kitId);

  return useMutation({
    mutationFn: (questionId: string) =>
      serviceContainer.kitService().deleteQuestion(kitId, questionId),
    onSuccess: invalidateKit,
    onError: invalidateOnConflict,
  });
};

export const useAddFlashcard = (kitId: string) => {
  const invalidateKit = useInvalidateKit(kitId);
  const invalidateOnConflict = useInvalidateOnConflict(kitId);
  const actionKey = useActionKey();

  return useMutation({
    mutationFn: (input: AddFlashcardInput) =>
      serviceContainer
        .kitService()
        .addFlashcard(kitId, input, { idempotencyKey: actionKey.take() }),
    onSettled: () => {
      actionKey.rotate();
    },
    onSuccess: invalidateKit,
    onError: invalidateOnConflict,
  });
};

export const useUpdateFlashcard = (kitId: string, flashcardId: string) => {
  const { invalidateKit, invalidateOnConflict } = useBuilderMutation(kitId);

  return useMutation({
    mutationFn: (input: UpdateFlashcardInput) =>
      serviceContainer.kitService().updateFlashcard(kitId, flashcardId, input),
    onSuccess: invalidateKit,
    onError: invalidateOnConflict,
  });
};

export const useDeleteFlashcard = (kitId: string) => {
  const { invalidateKit, invalidateOnConflict } = useBuilderMutation(kitId);

  return useMutation({
    mutationFn: (flashcardId: string) =>
      serviceContainer.kitService().deleteFlashcard(kitId, flashcardId),
    onSuccess: invalidateKit,
    onError: invalidateOnConflict,
  });
};

export const useUpdateBrief = (kitId: string) => {
  const { invalidateKit, invalidateOnConflict } = useBuilderMutation(kitId);

  return useMutation({
    mutationFn: (input: UpdateBriefInput) =>
      serviceContainer.kitService().updateBrief(kitId, input),
    onSuccess: invalidateKit,
    onError: invalidateOnConflict,
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
