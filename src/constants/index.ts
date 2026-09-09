export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME?.trim() || 'Interview Prep AI';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.trim() || '/api';

export const API_TIMEOUT_MS = 30_000;

export const APP_ROUTES = {
  home: '/',
  login: '/login',
  register: '/register',
  dashboard: '/dashboard',
  newKit: '/kits/new',
  kit: (kitId: string): string => `/kits/${kitId}`,
  practice: (kitId: string): string => `/kits/${kitId}/practice`,
} as const;

export const API_ENDPOINTS = {
  auth: {
    register: '/auth/register',
    login: '/auth/login',
    logout: '/auth/logout',
    me: '/auth/me',
  },
  kits: {
    root: '/kits',
    byId: (kitId: string): string => `/kits/${kitId}`,
    status: (kitId: string): string => `/kits/${kitId}/status`,
    regenerate: (kitId: string): string => `/kits/${kitId}/regenerate`,
    question: (kitId: string, questionId: string): string =>
      `/kits/${kitId}/questions/${questionId}`,
    questions: (kitId: string): string => `/kits/${kitId}/questions`,
    reorderQuestions: (kitId: string): string => `/kits/${kitId}/questions/reorder`,
    flashcard: (kitId: string, flashcardId: string): string =>
      `/kits/${kitId}/flashcards/${flashcardId}`,
    flashcards: (kitId: string): string => `/kits/${kitId}/flashcards`,
    brief: (kitId: string): string => `/kits/${kitId}/brief`,
    practice: (kitId: string, flashcardId: string): string =>
      `/kits/${kitId}/practice/${flashcardId}`,
  },
} as const;

export const QUERY_KEYS = {
  auth: {
    me: ['auth', 'me'] as const,
  },
  kits: {
    all: ['kits'] as const,
    list: (params: { page: number; limit: number }) => ['kits', params] as const,
    detail: (kitId: string) => ['kits', kitId] as const,
    status: (kitId: string) => ['kits', kitId, 'status'] as const,
  },
} as const;
